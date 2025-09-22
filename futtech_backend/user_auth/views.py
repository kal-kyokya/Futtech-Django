#!/usr/bin/env python3
"""
'views.py' is a collection of Django class-based views meant to handle
	   http request made to the Futtech backend for the '/auth/' URL.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .serializers import UserRegistrationSerializer, UserLoginSerializer

from rest_framework_simplejwt.tokens import RefreshToken


class UserRegistrationView(generics.CreateAPIView):
    """
    Processes client-side request to register a new user.

    Inheritance:
    	generics.CreateAPIView - High-level, generic view specifically
    	designed for creating model instances. Automatically handles
    	POST method, serialzer instantiation, validation, saving, and
    	response generation.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)

    # Override the 'create' method to include a JWT access and refresh tokens
    def create(self, request, *args, **kwargs):
        """
        Customize the HTTP response to include a JWT access & refresh tokens.

        Params:
        	self - A representation of the current class instance.
        	request - The client-side HTTP request made.

        Return:
        	A 'rest_framework.response.Response' object.
        """

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        response_data = {
            'message': 'User registered successfully',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        headers = self.get_success_headers(serializer.data)

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class UserLoginView(APIView):
    """
    Contains the application handling client-side requests to log in.

    Inheritance:
    	APIView - Most basic class-based view provided by DRF. Extends
    	Django's 'View' class, offers the highest degree of control over
    	the request-response cycle since it is a lower-level abstraction.

    	It has a less opinionated structure and requires one to explicitly
    	define methods for each HTTP verb (e.g., get, post, put, delete).
    """

    def post(self, request, *args, **kwargs):
        """
        Handles all POST request made to this end point.

        Params:
        	self - Object representation of the current class instance.
        	request - The HTTP request sent by the frontend.

        Return:
        	A DRF Response object containing the JWT access and
        	refresh tokens associated with the requesting user.
        """

        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK
        )
