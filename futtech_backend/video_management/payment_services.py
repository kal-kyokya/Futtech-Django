#!/usr/bin/env python3
"""
Provider-agnostic payment orchestration services.
"""

import base64
import datetime
import secrets
import re
from decimal import Decimal, InvalidOperation
from uuid import UUID

import requests
import stripe
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.utils import timezone
from djstripe.settings import djstripe_settings

from .logs import logger
from .models import PaymentProvider, PaymentStatus, PaymentTransaction, UserProfile


def normalize_kenyan_phone(phone_number: str) -> str:
    if not isinstance(phone_number, str) or re.search(r'[^0-9\s()+-]', phone_number):
        raise ValueError('Phone number must be a valid Kenyan mobile number')
    cleaned = re.sub(r'[\s()+-]', '', phone_number)
    if cleaned.startswith('0') and len(cleaned) == 10:
        cleaned = f'254{cleaned[1:]}'
    if cleaned.startswith(('7', '1')) and len(cleaned) == 9:
        cleaned = f'254{cleaned}'
    if not (cleaned.startswith(('2547', '2541')) and len(cleaned) == 12):
        raise ValueError('Phone number must be a valid Kenyan mobile number')
    return cleaned


class MpesaClient:
    token_cache_key = 'mpesa_access_token'

    @property
    def base_url(self):
        override = getattr(settings, 'MPESA_BASE_URL', '').strip()
        if override:
            return override.rstrip('/')
        env = getattr(settings, 'MPESA_ENV', 'sandbox')
        if env == 'production':
            return 'https://api.safaricom.co.ke'
        return 'https://sandbox.safaricom.co.ke'

    def get_access_token(self):
        cached = cache.get(self.token_cache_key)
        if cached:
            return cached

        credentials = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}".encode('utf-8')
        auth_header = base64.b64encode(credentials).decode('utf-8')
        response = requests.get(
            f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials",
            headers={'Authorization': f'Basic {auth_header}'},
            timeout=getattr(settings, 'MPESA_TIMEOUT_SECONDS', 30),
        )
        response.raise_for_status()
        payload = response.json()
        token = payload['access_token']
        expires_in = int(payload.get('expires_in', 3600))
        cache.set(self.token_cache_key, token, max(1, expires_in - 60))
        return token

    def initiate_stk_push(self, phone_number: str, amount: Decimal, account_reference: str, transaction_desc: str, callback_url: str):
        token = self.get_access_token()
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}".encode('utf-8')).decode('utf-8')
        payload = {
            'BusinessShortCode': settings.MPESA_SHORTCODE,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone_number,
            'PartyB': settings.MPESA_SHORTCODE,
            'PhoneNumber': phone_number,
            'CallBackURL': callback_url,
            'AccountReference': account_reference,
            'TransactionDesc': transaction_desc,
        }
        response = requests.post(
            f"{self.base_url}/mpesa/stkpush/v1/processrequest",
            headers={
                'Authorization': f'Bearer {token}',
                'Content-type': 'application/json',
            },
            json=payload,
            timeout=getattr(settings, 'MPESA_TIMEOUT_SECONDS', 30),
        )
        response.raise_for_status()
        return response.json()

    def query_stk_status(self, checkout_request_id: str):
        """
        Verify a callback against Daraja using server-held credentials.
        """
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            f'{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}'.encode()
        ).decode()
        response = requests.post(
            f'{self.base_url}/mpesa/stkpushquery/v1/query',
            headers={'Authorization': f'Bearer {self.get_access_token()}'},
            json={
                'BusinessShortCode': settings.MPESA_SHORTCODE,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id,
            },
            timeout=getattr(settings, 'MPESA_TIMEOUT_SECONDS', 30),
        )
        response.raise_for_status()
        return response.json()


def get_checkout_price(provider: str) -> tuple[Decimal, str]:
    if provider not in PaymentProvider.values:
        raise ValueError('Unsupported payment provider.')
    currency = 'KES' if provider == PaymentProvider.MPESA else 'USD'
    name = f'PAYMENT_SUBSCRIPTION_PRICE_{currency}'
    try:
        amount = Decimal(str(getattr(settings, name)))
        if not amount.is_finite() or not 0 < amount < Decimal('100000000'):
            raise ValueError
        if amount != amount.quantize(Decimal('0.01')):
            raise ValueError
        if provider == PaymentProvider.MPESA and amount != amount.to_integral_value():
            raise ValueError
    except (AttributeError, InvalidOperation, ValueError):
        raise ImproperlyConfigured(f'{name} must be a positive supported payment amount.') from None
    return amount, currency


@transaction.atomic
def fulfill_transaction(payment: PaymentTransaction):
    payment = PaymentTransaction.objects.select_for_update().get(pk=payment.pk)
    if payment.fulfilled_at or payment.status != PaymentStatus.SUCCEEDED:
        return

    UserProfile.objects.get_or_create(user=payment.user)
    profile = UserProfile.objects.select_for_update().get(user=payment.user)
    now = timezone.now()
    days = int(getattr(settings, 'PAYMENT_SUBSCRIPTION_DAYS', 30))
    base_start = profile.access_expires_at if profile.access_expires_at and profile.access_expires_at > now else now
    profile.access_expires_at = base_start + datetime.timedelta(days=days)
    profile.save(update_fields=['access_expires_at'])

    payment.fulfilled_at = now
    payment.save(update_fields=['fulfilled_at', 'updated_at'])


@transaction.atomic
def mark_payment_result(payment: PaymentTransaction, status: str, provider_transaction_id: str = '', error_code: str = '', error_message: str = '', metadata: dict | None = None):
    payment = PaymentTransaction.objects.select_for_update().get(pk=payment.pk)
    if payment.status == PaymentStatus.SUCCEEDED:
        return payment

    payment.status = status
    if provider_transaction_id:
        payment.provider_transaction_id = provider_transaction_id
    payment.error_code = error_code
    payment.error_message = error_message
    if metadata:
        payment.metadata = {**payment.metadata, **metadata}
    payment.save()

    if status == PaymentStatus.SUCCEEDED:
        fulfill_transaction(payment)
        payment.refresh_from_db()

    return payment


def create_payment_transaction(*, user, provider: str, amount: Decimal, currency: str, purpose: str = 'subscription'):
    return PaymentTransaction.objects.create(
        user=user,
        provider=provider,
        amount=amount,
        currency=currency,
        purpose=purpose,
        status=PaymentStatus.PENDING,
        idempotency_key=secrets.token_hex(16),
        external_reference=f"sub-{user.id}-{timezone.now().strftime('%Y%m%d%H%M%S')}",
    )


def parse_mpesa_callback(payload: dict):
    try:
        body = payload['Body']['stkCallback']
        if not isinstance(body, dict):
            raise ValueError('Invalid M-Pesa callback.')
    except (KeyError, TypeError):
        raise ValueError('Invalid M-Pesa callback.') from None
    merchant_request_id = body.get('MerchantRequestID', '')
    checkout_request_id = body.get('CheckoutRequestID', '')
    result_code = str(body.get('ResultCode', ''))
    result_desc = body.get('ResultDesc', '')

    if not isinstance(checkout_request_id, str) or not checkout_request_id or not result_code:
        raise ValueError('Invalid M-Pesa callback identifiers.')
    callback_metadata = body.get('CallbackMetadata') or {}
    if not isinstance(callback_metadata, dict):
        raise ValueError('Invalid M-Pesa callback metadata.')
    metadata_items = callback_metadata.get('Item') or []
    if not isinstance(metadata_items, list) or any(not isinstance(item, dict) for item in metadata_items):
        raise ValueError('Invalid M-Pesa callback metadata.')
    metadata_map = {item['Name']: item.get('Value') for item in metadata_items if isinstance(item.get('Name'), str)}

    mpesa_receipt = str(metadata_map.get('MpesaReceiptNumber', ''))
    return {
        'merchant_request_id': merchant_request_id,
        'checkout_request_id': checkout_request_id,
        'result_code': result_code,
        'result_desc': result_desc,
        'mpesa_receipt': mpesa_receipt,
        'metadata': metadata_map,
    }


def create_stripe_checkout_session(payment: PaymentTransaction, request):
    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    if not getattr(settings, 'STRIPE_FALLBACK_PRICE_ID', ''):
        raise ValueError('Stripe fallback is not configured. Missing STRIPE_FALLBACK_PRICE_ID.')

    success_url = request.build_absolute_uri('/api/v2/subscription-confirm?session_id={CHECKOUT_SESSION_ID}')
    cancel_url = request.build_absolute_uri('/pricing-page')

    session = stripe.checkout.Session.create(
        mode='subscription',
        line_items=[{'price': settings.STRIPE_FALLBACK_PRICE_ID, 'quantity': 1}],
        client_reference_id=str(payment.user.id),
        metadata={
            'payment_transaction_id': str(payment.id),
            'purpose': payment.purpose,
        },
        subscription_data={'metadata': {'payment_transaction_id': str(payment.id)}},
        idempotency_key=payment.idempotency_key,
        success_url=success_url,
        cancel_url=cancel_url,
    )
    payment.provider_transaction_id = session.id
    payment.status = PaymentStatus.PROCESSING
    payment.metadata = {**payment.metadata, 'stripe_checkout_session_id': session.id}
    payment.save(update_fields=['provider_transaction_id', 'status', 'metadata', 'updated_at'])
    return session


def process_stripe_event(payload: bytes, signature: str):
    stripe.api_key = djstripe_settings.STRIPE_SECRET_KEY
    webhook_secret = getattr(settings, 'DJSTRIPE_WEBHOOK_SECRET', '')
    if not webhook_secret or not signature:
        raise ValueError('Stripe webhook verification is not configured or signature is missing.')
    event = stripe.Webhook.construct_event(
        payload=payload,
        sig_header=signature,
        secret=webhook_secret,
    )

    event_type = event['type']
    obj = event['data']['object']

    transaction_id = None
    if event_type.startswith('checkout.session'):
        transaction_id = obj.get('metadata', {}).get('payment_transaction_id')
    elif event_type in {'invoice.paid', 'invoice.payment_failed'}:
        lines = obj.get('lines', {}).get('data') or []
        transaction_id = lines[0].get('metadata', {}).get('payment_transaction_id') if lines else None

    try:
        transaction_id = UUID(str(transaction_id))
    except (TypeError, ValueError):
        return event_type
    payment = PaymentTransaction.objects.filter(id=transaction_id, provider=PaymentProvider.STRIPE).first()

    if not payment:
        logger.info('Stripe event %s did not map to PaymentTransaction', event_type)
        return event_type

    is_checkout = event_type.startswith('checkout.session')
    if is_checkout:
        if (
            obj.get('id') != payment.provider_transaction_id
            or str(obj.get('client_reference_id')) != str(payment.user_id)
        ):
            raise ValueError('Stripe checkout does not match the recorded payment.')
    elif (
        not payment.metadata.get('stripe_subscription_id')
        or obj.get('subscription') != payment.metadata['stripe_subscription_id']
        or obj.get('customer') != payment.metadata.get('stripe_customer_id')
    ):
        raise ValueError('Stripe invoice does not match the recorded subscription.')

    if event_type in {'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'invoice.paid'}:
        settled = obj.get('payment_status') == 'paid' if is_checkout else obj.get('paid') is True
        if not settled:
            return event_type
        if (
            str(obj.get('currency', '')).upper() != payment.currency.upper()
            or obj.get('amount_total' if is_checkout else 'amount_paid') != int(payment.amount * 100)
        ):
            raise ValueError('Stripe settlement amount or currency does not match the payment.')
        metadata = {'stripe_event_type': event_type}
        if is_checkout:
            metadata.update(stripe_subscription_id=obj.get('subscription'), stripe_customer_id=obj.get('customer'))
        mark_payment_result(
            payment,
            PaymentStatus.SUCCEEDED,
            metadata=metadata,
        )
    elif event_type in {'checkout.session.expired'}:
        mark_payment_result(payment, PaymentStatus.EXPIRED, metadata={'stripe_event_type': event_type})
    elif event_type in {'invoice.payment_failed'}:
        mark_payment_result(payment, PaymentStatus.FAILED, error_message='Stripe invoice payment failed', metadata={'stripe_event_type': event_type})

    return event_type


def serialize_payment(payment: PaymentTransaction):
    return {
        'transaction_id': str(payment.id),
        'provider': payment.provider,
        'status': payment.status,
        'amount': str(payment.amount),
        'currency': payment.currency,
        'purpose': payment.purpose,
        'error_code': payment.error_code,
        'error_message': payment.error_message,
        'create_at': payment.created_at.isoformat(),
        'updated_at': payment.updated_at.isoformat(),
    }
