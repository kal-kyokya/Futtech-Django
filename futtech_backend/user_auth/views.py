#!/usr/bin/env python3
"""
'views.py' is a collection of Django class-based views each handling
	   http requests made to the Futtech backend for the '/auth/' URL.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .serializers import UserRegistrationSerializer, UserLoginSerializer

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


class UserRegistrationView(generics.CreateAPIView):
    """
    Processes client-side requests for user registrations.

    Inheritance:
    	generics.CreateAPIView - High-level, generic view specifically
    	designed for creating model instances. Automatically handles
    	POST method, serializer instantiation, validation, saving, and
    	response generation.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    # Overrides the 'create' method to include JWT access and refresh tokens
    def create(self, request, *args, **kwargs):
        """
        Customizes the HTTP response to include JWT access & refresh tokens.

        Params:
        	self - A representation of the current class instance.
        	request - The HTTP request made by the frontend.

        Return:
        	A 'rest_framework.response.Response' object containing
        	a success message and the JWT access & refresh tokens.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        response_data = {
            'message': 'User registered successfully',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

        headers = self.get_success_headers(serializer.data)

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class ObtainTokenCookieView(TokenObtainPairView):
    """
    Handles HTTP request for JWT access and refresh pairs.
    Ensures that the refresh token is set as a cookie header so as to
    mitigate XSS (Cross Site Scripts) attacks, client-side.

    Inheritance:
    	TokenObtainPairView - DRF Simple JWT's default class-based view
    			      handling requests for access/refresh tokens.
    """

    def post(self, request, *args, **kwargs):
        """
        Handles every POST requests made to this endpoint and is
        responsible for returning an HttpResponse object.

        Params:
        	self - An object representation of the current class instance.
        	request - Django-created HttpRequest object that contains
        		  metadata about the request.
        """

        resp = super().post(request, *args, **kwargs)
        # res.data contains {'access': '***', 'refresh': '***'}
        access = resp.data.get('access')
        refresh = resp.data.get('refresh')

        # Create the Django HttpResponse object
        response = Response(
            {
                'access': access
            },
            status=status.HTTP_200_OK
        )

        # Set the refresh token as an HttpOnly cookie
        response.set_cookie(
            key='refresh_token',
            value=refresh,
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=7*24*60*60, # Matches 'REFRESH_TOKEN_LIFETIME' in settings
            path='api/v2/auth' # Limits cookie path to the auth endpoints
        )

        return response
