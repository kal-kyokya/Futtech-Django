#!/usr/bin/env python3
"""
'tests' verifies the grace-period logic for overdue subscriptions both
	within and beyond the 10-day window.
"""

from types import SimpleNamespace
import datetime

from django.test import SimpleTestCase
from django.utils import timezone

from .models import UserProfile

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
