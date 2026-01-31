#!/usr/bin/env python3
"""
'user_auth/urls.py' is a URL configuration file.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.urls import path
from .views import (
    UserRegistrationView,
    ObtainTokenCookieView,
    RefreshTokenCookieView,
    LogoutView,
    GetCurrentUserView,
)


urlpatterns = [
    path('register/',
         UserRegistrationView.as_view(),
         name='user-registration'),
    path('login/',
         ObtainTokenCookieView.as_view(),
         name='user-login'),
    path('token/refresh/',
         RefreshTokenCookieView.as_view(),
         name='token-refresh'),
    path('logout/',
         LogoutView.as_view(),
         name='user-logout'),
    path('me/',
         GetCurrentUserView.as_view(),
         name='get-current-user'),
]
