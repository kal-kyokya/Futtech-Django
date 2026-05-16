#!/usr/bin/env python3
"""
Provider-agnostic payment orchestration services.
"""

import base64
import datetime
import secrets
from decimal import Decimal

import requests
import stripe
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone

from .logs import logger
from .models import PaymentProvider, PaymentStatus, PaymentTransaction, UserProfile


def normalize_kenyan_phone(phone_number: str) -> str:
    cleaned = ''.join(ch for ch in (phone_number or '') if ch.isdigit())
    if cleaned.startswith('0') and len(cleaned) == 10:
        cleaned = f'254{cleaned[1:]}'
    if cleaned.startswith('7') and len(cleaned) == 9:
        cleaned = f'254{cleaned}'
    if not (cleaned.startswith('2547') and len(cleaned) == 12):
        raise ValueError('Phone number must be valid Kenyan Safaricom mobile number')
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


def get_checkout_price(provider: str) -> tuple[Decimal, str]:
    if provider == PaymentProvider.MPESA:
        amount = Decimal(str(getattr(settings, 'PAYMENT_SUBSCRIPTION_PRICE_KES', '1500')))
        return amount, 'KES'

    amount = Decimal(str(getattr(settings, 'PAYMENT_SUBSCRIPTION_PRICE_USD', '15')))
    return amount, 'USD'


@transaction.atomic
def fulfill_transaction(payment: PaymentTransaction):
    if payment.fulfilled_at:
        return

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
    if payment.status == PaymentStatus.SUCCEEDED and status == PaymentStatus.SUCCEEDED:
        return payment

    payment.status = status
    if provider_transaction_id:
        payment.provider_transaction_id = provider_transaction_id
    if error_code:
        payment.error_code = error_code
    if error_message:
        payment.error_message = error_message
    if metadata:
        payment.metadata = {**payment.metadata, **metadata}
    payment.save()

    if status == PaymentStatus.SUCCEEDED:
        fulfill_transaction(payment)

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
    body = payload.get('Body', {}).get('stkCallback', {})
    merchant_request_id = body.get('MerchantRequestID', '')
    checkout_request_id = body.get('CheckoutRequestID', '')
    result_code = str(body.get('ResultCode', ''))
    result_desc = body.get('ResultDesc', '')

    metadata_items = body.get('CallbackMetadata', {}).get('Item', []) or []
    metadata_map = {item.get('Name'): item.get('Value') for item in metadata_items if item.get('Name')}

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
    stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
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
        success_url=success_url,
        cancel_url=cancel_url,
    )
    payment.provider_transaction_id = session.id
    payment.status = PaymentStatus.PROCESSING
    payment.metadata = {**payment.metadata, 'stripe_checkout_session_id': session.id}
    payment.save(update_fields=['provider_transaction_id', 'status', 'metadata', 'updated_at'])
    return session


def process_stripe_event(payload: bytes, signature: str):
    stripe.api_key = settings.STRIPE_TEST_SECRET_KEY
    event = stripe.webhook.construct_event(
        payload=payload,
        sig_header=signature,
        secret=settings.DJSTRIPE_WEBHOOK_SECRET
    )

    event_type = event['type']
    obj = event['data']['object']

    payment = None
    if event_type.startswith('checkout.session'):
        transaction_id = obj.get('metadata', {}).get('payment_transaction_id')
        if transaction_id:
            payment = PaymentTransaction.objects.filter(id=transaction_id, provider=PaymentProvider.STRIPE).first()
    elif event_type == 'invoice.paid':
        metadata = obj.get('lines', {}).get('data', [{}])[0].get('metadata', {}) if obj.get('lines') else {}
        transaction_id = metadata.get('payment_transaction_id')
        if transaction_id:
            payment = PaymentTransaction.objects.filter(id=transaction_id, provider=PaymentProvider.STRIPE).first()

    if not payment:
        logger.info('Stripe event %s did not map to PaymentTransaction', event_type)
        return event_type

    if event_type in {'checkout.session.completed', 'invoice.paid'}:
        mark_payment_result(
            payment,
            PaymentStatus.SUCCEEDED,
            provider_transaction_id=obj.get('id', ''),
            metadata={'stripe_event_type': event_type},
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
