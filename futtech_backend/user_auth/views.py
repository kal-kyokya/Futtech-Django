#!/usr/bin/env python3
"""
'views.py' is a collection of Django class-based views meant to handle
	   http request made to the Futtech backend for the '/auth/' URL.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .serializers import UserRegistrationSerializer

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
