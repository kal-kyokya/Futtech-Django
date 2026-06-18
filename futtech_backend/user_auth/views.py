#!/usr/bin/env python3
"""Authentication endpoints for JWT + cookie-based session continuity.

This module owns registration/login/refresh/logout/current-user APIs.
Access tokens are returned in JSON for the frontend to store client-side,
while refresh tokens are written as HttpOnly cookies to reduce XSS exposure.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from django.conf import settings

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserUpdateSerializer,
    CurrentUserSerializer,
)

from video_management.models import UserProfile

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenRefreshView


def _refresh_cookie_options():
    """
    Returns a consistent refresh cookie policy for all auth responses.
    """

    cookie_domain = getattr(settings, 'DOMAIN_NAME', None)
    return {
        'domain': cookie_domain or None,
        'httponly': True,
        'secure': True,
        'samesite': 'Lax',
        'max_age': 7 * 24 * 60 * 60, # Matches 'REFRESH_TOKEN_LIFETIME' in settings
        'path': '/api/v2/auth/', # Limits cookie path to the auth endpoints
    }


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
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
        }

        headers = self.get_success_headers(serializer.data)

        response = Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

        # Set the refresh token as an HttpOnly cookie
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            **_refresh_cookie_options()
        )

        return response


class ObtainTokenCookieView(APIView):
    """
    Handles HTTP requests for JWT access and refresh pairs while accepting
    email/password credentials instead of the default username/password.
    Ensures that the refresh token is set as a cookie header so as to
    mitigate XSS (Cross Site Scripting) attacks, client-side.

    Inheritance:
    	APIView - Gives fine-grained control over request handling while still
    		  leveraging DRF's validation and response helpers.
    """

    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        """
        Validates credentials, issues tokens, and persists refresh cookie.
        """

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                'message': 'User logged in successfully',
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'firstName': user.first_name,
                    'lastName': user.last_name,
                    'profession': user.profession,
                    'phone': user.phone,
                    'location': user.location,
                    'position': user.position,
                    'sex': user.sex,
                    'birthday': user.birthday,
                },
            },
            status=status.HTTP_200_OK
        )

        # Set the refresh token as an HttpOnly cookie
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            **_refresh_cookie_options()
        )

        return response


class RefreshTokenCookieView(TokenRefreshView):
    """
    Extends the DRF Simple JWT's built-in class-based that handles
    creation of new access-refresh token pairs, so as to set the
    refresh token as an HttpOnly cookie.

    Inheritance:
    	TokenRefreshView - Handles creation of new access-refresh tokens.
    """

    def post(self, request, *args, **kwargs):
        """
        Bridge cookie-based refresh into SimpleJWT's body-based API.
        """
        if 'refresh' not in request.data and 'refresh_token' in request.COOKIES:
            data = request.data.copy()
            data['refresh'] = request.COOKIES.get('refresh_token')
            request._full_data = data

        resp = super().post(request, *args, **kwargs)
        # super returns {'access', '***', 'refresh': ''} since rotate is enabled
        access = resp.data.get('access')
        refresh = resp.data.get('refresh')

        response = Response(
            {
                'access': access
            },
            status=status.HTTP_200_OK
        )

        if refresh:
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                **_refresh_cookie_options()
            )

        return response


class LogoutView(APIView):
    """
    Reads the refresh token from the request body or cookie,
    blacklists it when valid, and deletes the refresh cookie.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in Django REST Framework'.
    """

    permission_classes = (AllowAny,)

    def post(self, request):
        """
        Handles every POST request handled by this view.

        Params:
        	self - A representation of this class' instanciation.
        	request - A dictionary-like object holding the client request. 
        """

        # Supports clients that send refresh in either body or cookie.
        refresh = request.data.get('refresh') or request.COOKIES.get('refresh_token')
        cookie_domain = getattr(settings, 'DOMAIN_NAME', None) or None

        if not refresh:
            response = Response(
                {'detail': 'Refresh token is required to log out.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

            response.delete_cookie(
                'refresh_token',
                path='/api/v2/auth/',
                domain=cookie_domain,
            )
            return response

        try:
            token = RefreshToken(refresh)

            # Blacklisting invalidates the refresh token server-side
            # So as to ensure it cannot be reused
            token.blacklist()
        except TokenError:
            response = Response(
                {'detail': 'Refresh token is invalid or expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

            response.delete_cookie(
                'refresh_token',
                path='/api/v2/auth/',
                domain=cookie_domain,
            )
            return response

        response = Response(status=status.HTTP_204_NO_CONTENT)

        response.delete_cookie(
            'refresh_token',
            path='/api/v2/auth/',
            domain=cookie_domain,
        )

        return response


class GetCurrentUserView(APIView):
    """
    Retrieves information about the currently authenticated user.

    Inheritance:
    	APIView - Empowers this view with a set of predefined class attributes
    		  from the 'Base of all views in Django REST Framework'.
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """
        Processes every GET request handled by this view.

        Params:
        	self - An object representation of the current class instance.
        	request - Django-created HttpRequest object that contains
        		  metadata about the request.
        """

        # Keeps the endpoint idempotent even for legacy users missing profiles.
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = CurrentUserSerializer(profile)

        return Response(serializer.data)


class UserUpdateView(APIView):
    """
    Handles profile update requests routed through /users/<user_id>.
    """

    permission_classes = (IsAuthenticated,)

    def put(self, request, user_id):
        if request.user.pk != user_id:
            return Response({'detail': 'You can only update your own profile.'}, status=status.HTTP_403_FORBIDDEN)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserUpdateSerializer(
            data=request.data,
            partial=True,
            context={'user': request.user, 'profile': profile},
        )
        serializer.is_valid(raise_exception=True)
        updated_profile = serializer.update(request.user, serializer.validated_data)

        response_serializer = CurrentUserSerializer(updated_profile)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
