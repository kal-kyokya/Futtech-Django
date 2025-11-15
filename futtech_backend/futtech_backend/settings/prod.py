#!/usr/bin/env python3
"""
'settings/prod' modifies the base settings.py file to match a production environment.
"""

from .base import *

DEBUG = False

ALLOWED_HOSTS = csv_list(require_env('DJANGO_ALLOWED_HOSTS'))
if not ALLOWED_HOSTS:
    # Defensive: fail fast instead of running with an empty list
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS produced an empty list.")

CORS_ALLOWED_ORIGINS = csv_list("CORS_ALLOWED_ORIGINS")
if not CORS_ALLOWED_ORIGINS:
    raise ImproperConfigured("CORS_ALLOWED_ORIGINS  is required in production and must be a comma-separated list of origins with the scheme.")

CSRF_TRUSTED_ORIGINS = csv_list("CSRF_TRUSTED_ORIGINS")
if not CSRF_TRUSTED_ORIGINS:
    raise ImproperConfigured("CSRF_TRUSTED_ORIGINS is required in production.")

SECRET_KEY = require_env("DJANGO_SECRET_KEY")

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', [])

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [f"https://{h}" for h in ALLOWED_HOSTS]

STRIPE_LIVE_MODE = True

# Stripe API keys

STRIPE_TEST_PUBLIC_KEY = require_env('STRIPE_TEST_PUBLIC_KEY')
STRIPE_TEST_SECRET_KEY = require_env('STRIPE_TEST_SECRET_KEY')

STRIPE_PRICING_TABLE_ID = require_env('STRIPE_PRICING_TABLE_ID')

DJSTRIPE_FOREIGN_KEY_TO_FIELD = 'id'
DJSTRIPE_WEBHOOK_SECRET = require_env('DJSTRIPE_WEBHOOK_SECRET')

# True in production
STRIPE_LIVE_MODE = os.environ.get('STRIPE_LIVE_MODE', 'false').lower() == 'true'

MUX_TOKEN_ID = require_env('MUX_TOKEN_ID')
MUX_TOKEN_SECRET = require_env('MUX_TOKEN_SECRET')
MUX_SIGNING_KEY_ID = require_env('MUX_SIGNING_KEY_ID')
MUX_PRIVATE_KEY = require_env('MUX_PRIVATE_KEY')
MUX_WEBHOOK_SIGNING_SECRET = require_env('MUX_WEBHOOK_SIGNING_SECRET')

REDIS_HOST = os.environ.get('REDIS_HOST')
REDIS_PORT = os.environ.get('REDIS_PORT')

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
