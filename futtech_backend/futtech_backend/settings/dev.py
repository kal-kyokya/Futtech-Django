#!/usr/bin/env python3
"""
'settings/dev' modifies the base settings.py file to match a development environment.
"""

import os
from django.core.management.utils import get_random_secret_key
from .base import *


DEBUG = True
ALLOWED_HOSTS = ['*']

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", get_random_secret_key())

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = ['http://localhost:5174', 'http://127.0.0.1:5174']
CORS_ALLOW_CREDENTIALS = True

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "futtech-dev",
    }
}
