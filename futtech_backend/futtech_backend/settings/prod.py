#!/usr/bin/env python3
"""
'settings/prod' modifies the base settings.py file to match a production environment.
"""

from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get('DJANGO-ALLOWED_HOSTS', ['kalkyokya.tech'])

SECRET_KEY = require_env("DJANGO_SECRET_KEY")

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', [])

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

STRIPE_LIVE_MODE = True

REDIS_HOST = os.environ.get("REDIS_HOST")
REDIS_PORT = os.environ.get("REDIS_PORT")

if REDIS_HOST and REDIS_PORT:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': "redis://{}:{}/1".format(
                os.environ.get('REDIS_HOST'),
                os.environ.get('REDIS_PORT')
            ),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'SERIALIZER': 'django_redis.serializers.pickle.PickleSerializer', # To resolve byte decoding mismatch and reliably handle data stored by 'django.contrib.admin'
                'CONNECTION_POOL_KWARGS': {
                    # Commented out this line due to emerging misconfiguration it caused when combined with the newly added 'SERIALIZER: PickleSerializer'
                    #                'decode_responses': True, # Decodes responses for easier Python handling
                'max_connections': 100,
                    'retry_on_timeout': True,
                }
            }
        }
    }
else:
    # Fallback safe cache (no broken redis URL)
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "futtech-default",
        }
    }
