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

CORS_ALLOW_ALL_ORIGINS = True
