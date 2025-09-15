#!/usr/bin/env python3
"""
'signals.py' uses a function-based approach to handle webhook events
	     sent by Stripe and perform appropriate actions.
"""

from djstripe import webhooks
from .logs import logger


def subscription_updated_handler(event):
    """
    Handles subscription creation and updates.
    The dj-stripe Subscription model is already updated by the time this runs.

    Param:
    	event - The Stripe webhook to be processed internally.
    """
    pass
