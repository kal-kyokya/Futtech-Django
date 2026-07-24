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
from futtech_backend.throttles import LoginRateThrottle

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify
import jwt

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserUpdateSerializer,
    CurrentUserSerializer,
    GoogleSignInSerializer,
)

from video_management.models import UserProfile
from .models import SocialAccount

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenRefreshView


def _user_payload(user):
    """
    Returns the frontend's common authenticated-user response shape.
    """

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }


def _token_response(user, message, http_status=status.HTTP_200_OK):
    """
    Issues the same JWT pair, and refresh cookie used by password auth.
    """

    refresh = RefreshToken.for_user(user)
    response = Response(
        {
            'message': message,
            'access': str(refresh.access_token),
            'user': _user_payload(user),
        },
        status=http_status,
    )
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        **_refresh_cookie_options(),
    )
    return response


def _unique_username(email, name=''):
    UserModel = get_user_model()
    base = slugify(name) or email.split('@')[0]
    base = slugify(base) or 'google-user'
    username = base[:150]
    counter = 1

    while UserModel.objects.filter(username__iexact=username).exists():
        suffix = f'-{counter}'
        username = f'{base[:150 - len(suffix)]}{suffix}'
        counter += 1

    return username


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
            'user': _user_payload(user),
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
    throttle_classes = [LoginRateThrottle]

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
                'user': _user_payload(user),
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


class GoogleSignInView(APIView):
    """
    Authenticates Google Identity Services ID tokens and links users by email.
    """

    permission_classes = (AllowAny,)
    serializer_class = GoogleSignInSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '')
        if not client_id:
            return Response(
                {'detail': 'Google Sign-In is not configured.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            credential = serializer.validated_data['credential']
            signing_key = jwt.PyJWKClient(
                'https://www.googleapis.com/oauth2/v3/certs'
            ).get_signing_key_from_jwt(credential)
            payload = jwt.decode(
                credential,
                signing_key.key,
                algorithms=['RS256'],
                audience=client_id,
                options={'require': ['exp', 'iat', 'sub', 'aud']},
            )
        except jwt.PyJWTError:
            return Response(
                {'detail': 'Google credential is invalid or expired.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if payload.get('iss') not in {'accounts.google.com', 'https://accounts.google.com'}:
            return Response({'detail': 'Invalid Google token issuer.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not payload.get('email_verified'):
            return Response({'detail': 'Google account email is not verified.'}, status=status.HTTP_400_BAD_REQUEST)

        google_id = payload.get('sub')
        email = get_user_model().objects.normalize_email(payload.get('email', ''))
        if not google_id or not email:
            return Response({'detail': 'Google credential is missing required identity data.'}, status=status.HTTP_400_BAD_REQUEST)

        name = payload.get('name') or ''
        picture = payload.get('picture') or ''
        UserModel = get_user_model()

        with transaction.atomic():
            social_account = (
                SocialAccount.objects.select_related('user')
                .filter(provider=SocialAccount.PROVIDER_GOOGLE, provider_user_id=google_id)
                .first()
            )

            if social_account:
                user = social_account.user
            else:
                user = UserModel.objects.filter(email__iexact=email).first()
                if not user:
                    user = UserModel.objects.create_user(
                        username=_unique_username(email, name),
                        email=email,
                        password=None,
                        first_name=payload.get('given_name', '')[:150],
                        last_name=payload.get('family_name', '')[:150],
                    )
                    user.set_unusable_password()
                    user.save(update_fields=['password'])

                social_account = SocialAccount.objects.create(
                    user=user,
                    provider=SocialAccount.PROVIDER_GOOGLE,
                    provider_user_id=google_id,
                    email=email,
                    name=name,
                    picture_url=picture,
                )

            if not user.is_active:
                return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

            profile, _ = UserProfile.objects.get_or_create(user=user)
            if picture and not profile.avatar_url:
                profile.avatar_url = picture
                profile.save(update_fields=['avatar_url'])

            changed_fields = []
            if social_account.email != email:
                social_account.email = email
                changed_fields.append('email')
            if social_account.name != name:
                social_account.name = name
                changed_fields.append('name')
            if social_account.picture_url != picture:
                social_account.picture_url = picture
                changed_fields.append('picture_url')
            if changed_fields:
                changed_fields.append('updated_at')
                social_account.save(update_fields=changed_fields)

        return _token_response(user, 'User logged in with Google successfully')


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
