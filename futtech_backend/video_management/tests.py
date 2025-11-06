#!/usr/bin/env python3
"""
'tests' verifies the grace-period logic for overdue subscriptions both
within and beyond the 10-day window.
"""

from types import SimpleNamespace
import datetime
import hashlib
import hmac
from unittest.mock import patch

from django.test import SimpleTestCase
from django.utils import timezone

from .models import UserProfile
from .mux_webhooks import verify_signature


class UserProfileSubscriptionTests(SimpleTestCase):
    """
    Tests attributes of the UserProfile model.

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
    Tests the Mux webhooks signature processing logic.

    Inheritance:
    	SimpleTestCase - Class to be overriden in order to run relatively
    			 simple 'Unittest.TestCase' instances.
    """

    def _build_header(self, body, secret, timestamp):
        payload = f"{timestamp}.{body.decode('utf-8')}"
        signature = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        return f"t={timestamp},v1={signature}"

    def test_valid_signature(self):
        secret = "test_secret"
        body = b'{"test": "payload"}'
        timestamp = 1_700_000_000
        header = self._build_header(body, secret, timestamp)

        with patch("futtech_backend.video_management.mux_webhooks.time.time",
                   return_value=timestamp):
            is_valid, message = verify_signature(body, header, secret)

        self.assertTrue(is_valid)
        self.assertIsNone(message)

    def test_invalid_signature(self):
        secret = "test_secret"
        body = b'{"test": "payload"}'
        timestamp = 1_700_000_000
        header = f"t={timestamp},v1=notSignature"

        with patch("futtech_backend.video_management.mux_webhooks.time.time",
                   return_value=timestamp):
            is_valid, message = verify_signature(body, header, secret)

        self.assertFalse(is_valid)
        self.assertEqual(message, "Signature mismatch.")

    def test_replayed_signature(self):
        secret = "test_secret"
        body = b'{"test": "payload"}'
        current_time = 1_700_000_000
        old_timestamp = current_time - 400 # beyond default tolerance of 300 seconds
        header = self._build_header(body, secret, timestamp)

        with patch("futtech_backend.video_management.mux_webhooks.time.time",
                   return_value=current_time):
            is_valid, message = verify_signature(body, header, secret)

        self.assertFalse(is_valid)
        self.assertEqual(message, "Webhook timestamp too old.")
