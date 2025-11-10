#!/usr/bin/env python3
"""
'settings/dev' modifies the base settings.py file to match a development environment.
"""

from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True
