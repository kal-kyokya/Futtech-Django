#!/usr/bin/env python3
"""
'signals.py' uses a function-based approach to handle webhook events
	     sent by Stripe and perform appropriate actions.
"""

from django.core.mail import mail_admins
from djstripe.event_handlers import djstripe_receiver
from djstripe.models import (
    Charge, Customer,
    Event, PaymentMethod
)
from .logs import logger


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


@djstripe_receiver('customer.subscription.created')
def handle_customer_subscription_created(sender, **kwargs):
    handle_customer_subscription(sender, **kwargs)


@djstripe_receiver('customer.subscription.updated')
def handle_customer_subscription_updated(sender, **kwargs):
    handle_customer_subscription_updated(sender, **kwargs)


@djstripe_receiver('charge.succeeded')
def handle_charge_succeeded(sender, **kwargs):
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
    logger.info('Charge ID - {} succeeded: {}'.format(charge_id, charge))


@djstripe_receiver('customer.deleted')
def handle_charge_succeeded(sender, **kwargs):
    """
    Processes Stripe webhooks for effective deletion of customer account.

    Param:
    	sender - Origin of the currently processed signal.
    	kwargs - Contains the Stripe event to be processed.
    """

    try:
        event = kwargs.get('event')
        customer_id = event.data['object']['customer']
        customer_email = Customer.objects.get(id=customer_id).email
    except Exception as err:
        logger.debug('Customer.delete signal ERROR: {}'.format(err))
        customer_email = 'unavailable'

    try:
        mail_admins('Customer deleted account',
                    'Account of email {} was just deleted'.format(customer_email),
                    fail_silently=True)
    except Exception as err:
        logger.info("Error using 'mail_admin': {}".format(err))

    logger.info(f'{sender} -> {event}')
    logger.info('Customer ID - {} deleted: {}'.format(customer_id,
                                                      customer_email))
