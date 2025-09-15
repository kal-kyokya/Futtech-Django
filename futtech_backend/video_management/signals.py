#!/usr/bin/env python3
"""
'signals.py' uses a function-based approach to handle webhook events
	     sent by Stripe and perform appropriate actions.
"""

from djstripe.event_handlers import djstripe_receiver
from djstripe.models import Event, Charge, PaymentMethod
from .logs import logger


@djstripe_receiver('customer.subscription.created',
                  'customer.subscription.updated')
def handle_customer_subscription(sender, **kwargs):
    """
    Handles subscription creation and updates.
    The dj-stripe Subscription model is already updated by the time this runs.

    Param:
    	sender - The source of the signal being processed.
    	kwargs - The Stripe event whose webhook will be processed.
    """

    event = kwargs.get('event')
    subscription = event.data['object']

    logger.info(f'{sender} -> {event}')
    logger.info('Subscription {} for customer {} was updated'.format(subscription.id,
                                                                     subscription.customer.id))


@djstripe_receiver('charge.succeeded')
def handle_charge_succeeded(sender, kwargs):
    """
    Processes Stripe webhooks for successful customer charge.

    Param:
    	sender - Origin of the currently processed signal.
    	kwargs - Contains the Stripe event to be processed.
    """

    event = kwargs.get('event')
    charge_id = event.data['object']['id']
    charge = Charge.objects.get(id=charge_id)

    logger.info(f'{sender} -> {event}')
    logger.info('Charge ID - {} succeeded: {}'.format(charge_id. charge))
