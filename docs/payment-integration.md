# Payment Integration (M-Pesa Primary, Stripe Fallback)

## Overview

Futtech now uses a provider-agnostic payment flow backed by `PaymentTransaction`.

- **Primary:** M-Pesa STK Push (Safaricom Daraja)
- **Fallback:** Stripe Checkout

Entitlement activation is shared and provider-neutral. Access is granted only after a confirmed successful provider callback/webhook.

## Environment variables

Configure backend variables (see `futtech_backend/env.sample`):

- `MPESA_ENV` (`sandbox` or `production`)
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `MPESA_TIMEOUT_SECONDS` (optional)
- `MPESA_BASE_URL` (optional override)
- `STRIPE_TEST_PUBLIC_KEY`
- `STRIPE_TEST_SECRET_KEY`
- `STRIPE_FALLBACK_PRICE_ID`
- `DJSTRIPE_WEBHOOK_SECRET`
- `PAYMENT_SUBSCRIPTION_DAYS`
- `PAYMENT_SUBSCRIPTION_PRICE_KES`
- `PAYMENT_SUBSCRIPTION_PRICE_USD`

## API endpoints

- `POST /api/v2/payments/checkout/initiate`
  - body: `{ provider: "MPESA"|"STRIPE", phone_number?: "07..." }`
  - M-Pesa returns pending transaction state
  - Stripe returns checkout redirect URL

- `GET /api/v2/payments/checkout/status/{transcation_id}`
  - returns normalized transaction status

- `POST /api/v2/payments/callbacks/mpesa`
  - Daraja callback endpoint
  - idempotent transaction update + entitlement fulfillment

- `POST /api/v2/payments/callbacks/stripe`
  - Stripe webhook endpoint with signature verification
  - idempotent normalized updates

## M-Pesa flow

1. Authenticated user starts checkout with provider `MPESA`.
2. Backend creates `PaymentTransaction` in processing state and initiates STK push.
3. User enters PIN on phone.
4. Daraja callback updates payment status (`SUCCEEDED`/`FAILED`)
5. Shared fulfillment marks access period (`UserProfile.access_expires_at`)

## Stripe fallback flow

1. Authenticated user starts checkout with provider `STRIPE`.
2. Backend creates `PaymentTransaction` then creates Stripe Checkout session.
3. Stripe webhook maps event to transaction and marks normalized status.
4. Shared fulfillment is executed on success.

## Callback/Webhook safety

- No session auth required on provider callbacks.
- Stripe signature verification is enforced.
- Idempotent fulfillment via `PaymentTransaction.fulfilled_at` guard.
- Provider payloads are stored in metadata for audit/debug.

## Dashboard setup notes

## Safaricom Daraja

- Create app and obtain consumer key/secret.
- Configure shortcode + passkey for STK Push.
- Set callback URL to `/api/v2/payments/callbacks/mpesa` (public HTTPS URL).
- Use sandbox credentials in non-production environments.

### Stripe

- Keep webhook endpoint configured (fallback flow): `/api/v2/payments/callbacks/stripe`.
- Ensure events include checkout/session success + invoice outcomes.
- Set `STRIPE_FALLBACK_PRICE_ID` to the fallback subscription price.
