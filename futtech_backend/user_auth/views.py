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


class UserLoginView(APIView):
    """
    Contains the application logic handling log in requests.

    Inheritance:
    	APIView - Most basic class-based view provided by DRF.
    	It extends Django's 'View' class and offers the highest degree of
    	control over the request-response cycle since it has a
    	lower-level abstraction.

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
        	refresh tokens associated with the user requesting log in.
        """

        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK
        )
