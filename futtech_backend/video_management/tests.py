#!/usr/bin/env python3
"""
'tests' ensures the core video management utilities work as intended.
"""

import datetime
import hashlib
import hmac
import os
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone

from . import services
from .choices import VideoStatus
from .models import UserProfile, Video
from .mux_webhooks import verify_signature


TEST_DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

TEST_PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']


class UserProfileSubscriptionTests(SimpleTestCase):
    """
    Validates the grace-period logic for overdue subscriptions.

    Inheritance:
    	SimpleTestCase - Class to be overriden in order to run relatively
    			 simple 'Unittest.TestCase' instances.
    """

    def test_past_due_subscription_within_grace_period(self):
        subscription = SimpleNamespace(
            status="past_due",
            current_period_end=(timezone.now() - datetime.timedelta(days=3)).timestamp(),
        )
        profile = UserProfile()
        profile.subscription = subscription

        self.assertTrue(profile.has_active_subscription())

    def test_past_due_subscription_beyond_grace_period(self):
        subscription = SimpleNamespace(
            status="past_due",
            current_period_end=(timezone.now() - datetime.timedelta(days=15)).timestamp(),
        )
        profile = UserProfile()
        profile.subscription = subscription

        self.assertFalse(profile.has_active_subscription())


class VerifySignatureTests(SimpleTestCase):
    """
    Verifies that the Mux webhook signature helper behaves correctly.

    Inheritance:
    	SimpleTestCase - Class to be overriden in order to run relatively
    			 simple 'Unittest.TestCase' instances.
    """

    def _build_header(self, body, secret, timestamp):
        payload = f"{timestamp}.{body.decode('utf-8')}"
        signature = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256,
        ).hexdigest()

        return f"t={timestamp},v1={signature}"

    def test_valid_signature(self):
        secret = "test_secret"
        body = b'{"test": "payload"}'
        timestamp = 1_700_000_000
        header = self._build_header(body, secret, timestamp)

        with patch(
                "futtech_backend.video_management.mux_webhooks.time.time",
                return_value=timestamp,
        ):
            is_valid, message = verify_signature(body, header, secret)

        self.assertTrue(is_valid)
        self.assertIsNone(message)

    def test_invalid_signature(self):
        secret = "test_secret"
        body = b'{"test": "payload"}'
        timestamp = 1_700_000_000
        header = f"t={timestamp},v1=notSignature"

        with patch(
                "futtech_backend.video_management.mux_webhooks.time.time",
                return_value=timestamp,
        ):
            is_valid, message = verify_signature(body, header, secret)

        self.assertFalse(is_valid)
        self.assertEqual(message, "Signature mismatch.")

    def test_replayed_signature(self):
        secret = "test_secret"
        body = b'{"test": "payload"}'
        current_time = 1_700_000_000
        old_timestamp = current_time - 400 # beyond default tolerance of 300 seconds
        header = self._build_header(body, secret, old_timestamp)

        with patch(
                "futtech_backend.video_management.mux_webhooks.time.time",
                return_value=current_time,
        ):
            is_valid, message = verify_signature(body, header, secret)

        self.assertFalse(is_valid)
        self.assertEqual(message, "Webhook timestamp too old.")


@override_settings(
    DATABASES=TEST_DATABASES,
    PASSWORD_HASHERS=TEST_PASSWORD_HASHERS,
    SECRET_KEY='test-secret-key',
)
class HandleMuxWebhookTests(TestCase):
    """
    Exercises the webhook handling logic on a real database.
    """

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
            mux_asset_id='asset-123',
        )

    @patch('futtech_backend.video_management.services.mux_webhooks.verify_signature')
    def test_ready_event_updates_video(self, mock_verify_signature):
        mock_verify_signature.return_value = (True, None)
        payload = {
            'type': 'video.asset.ready',
            'data': {
                'id': self.video.mux_asset_id,
                'playback_ids': [{'id': 'playback-xyz'}],
                'duration': 42,
            },
        }

        with patch.dict(os.environ, {'MUX_WEBHOOK_SIGNING_SECRET': 'secret'}):
            success, message = services.handles_mux_webhook(b'{}',
                                                            payload,
                                                            'header')

            self.assertTrue(success)
            self.assertEqual(message, 'Video asset marked as ready')

            self.video.refresh_from_db()
            self.assertEqual(self.video.status, VideoStatus.READY)
            self.assertEqual(self.video.mux_playback_id, 'playback-xyz')
            self.assertEqual(self.video.duration, datetime.timedelta(seconds=42))

        @patch('futtech_backend.video_management.services.mux_webhooks.verify_signature')
        def test_invalid_signature_short_circuits_processing(self, mock_verify_signature):
            mock_verify_signature.return_value = (False, 'bad signature')
            payload = {
                'type': 'video.asset.ready',
                'data': {},
            }

            with patch.dict(os.environ, {'MUX_WEBHOOK_SIGNING_SECRET': 'secret'}):
                success, message = services.handle_mux_webhook(b'{}',
                                                               payload,
                                                               'header')

            self.assertFalse(success)
            self.assertEqual(message, 'bad signature')

            self.video.refresh_from_db()
            self.assertEqual(self.video.status,
                             VideoStatus.PENDING)
