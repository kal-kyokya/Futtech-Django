#!/usr/bin/env python3
"""
'settings/prod' modifies the base settings.py file to match a production environment.
"""

from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get('DJANGO-ALLOWED_HOSTS', ['kalkyokya.tech'])

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', [])

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

STRIPE_LIVE_MODE = True
