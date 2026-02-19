#!/usr/bin/env python3
"""
Test for Bunny playback URL security and auth.
"""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import UserProfile, Video
from .services import build_embed_url


TEST_DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}


@override_settings(
    DATABASES=TEST_DATABASES,
    BUNNY_STREAM_EMBED_TOKEN_KEY='secret-token-key',
)
class BunnyEmbedTokenTests(TestCase):
    def test_build_embed_url_uses_short_lived_token_without_secret_leak(self):
        url = build_embed_url('12345', 'video-guid', token_ttl_seconds=600)

        self.assertIn('iframe.mediadelivery.net/embed/12345/video-guid', url)
        self.assertIn('token=', url)
        self.assertIn('expires=', url)
        self.assert('secret-token-key', url)

    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            username='owner',
            email='owner@example.com',
            password='OwnerPass123!',
        )
        self.video = Video.objects.create(
            owner=self.owner,
            title='Example video',
        )

            },
        }
