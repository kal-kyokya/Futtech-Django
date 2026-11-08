# Development

This guide focuses on local setup, debugging habits, and day-to-day commands.

# Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- PostgreSQL/Redis/Stripe/Bunny Stream credentials as required by environment

## Local setup

## Backend

```bash
python -m venv .my_venv
source .my_venv/bin/activate
pip install -r requirements.txt
cd futtech_backend
python manage.py migrate
python manage.py runserver
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Set environment values before startup:

- Backend: variables shown in `futtech_backend/env.sample`
- Frontend: at least `VITE_API_BASE_URL`

## Frequent commands

## Backend

```bash
cd futtech_backend
python manage.py test
python manage.py makemigrations
python manage.py migrate
```

## Frontend

```bash
cd frontend
npm test -- --run
npm run lint
npm run build
```

## Debugging workflow

1. Reproduce with browser devtools open (newtwork + console).
2. Validate access token behavior in frontend state.
3. Check `/auth/token/refresh` responses and cookie behavior.
4. Inspect Django logs and endpoint serializer errors.
5. Confirm DB state via Django shell/admin.

## Auth debugging notes

Use these flowcharts before changing auth code:

- [Registration/Login/Auth persistence/Logout diagrams](./mermaid-flowcharts.md)

## Playlist debugging notes

- Confirm backend list response shape (`count`, `next`, `results`).
- Confirm reducer action payloads match backend IDs/fields.
- Verify user ownership/public visibility assumptions in backend queryset.

## Welcome email testing

The backend sends a welcome email only after successful account creation through normal registration or first-time Google Sign-In. Local development defaults to Django's console email backend, so messages are printed to the backend process instead of being delivered to real inboxes.

To test with another local or production mail backend, set the backend email variables from `futtech_backend/env.sample`. Keep SMTP/API credentials in backend environment variables only; do not expose them through Vite frontend variables.

## Validation and security configuration

Use Python 3.12 and Node 24, matching CI. INstall frontend dependencies with `npm ci` to preserve the lockfile. The default backend test command exercises real migrations. For a faster local run that builds tables from models:

```bash
cd futtech_backend
DJANGO_SETTINGS_MODULE=futtech_backend.settings.test python manage.py test --noinput
```

Set `VITE_API_BASE_URL=/api/v2` to use Vite's local API proxy. Access tokens stay in memory; reloads restore the session through the HttpOnly refresh cookie.
Development permits credentialed requests from localhost or 127.0.0.1 on port 5174. Production requires HTTPS and explicit frontend origins in `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`.

Set `TENANT_BASE_DOMAIN` to the trusted domain beneath which tenant hosts live (for example, `example.com` for `club.example.com`). Local development defaults to `localhost`. This setting controls branding resolution; it does not partition users, playlists, or videos into tenant databases.

Authentication limits use `LOGIN_THROTTLE_RATE`, `REGISTRATION_THROTTLE_RATE`, and `TOKEN_REFRESH_THROTTLE_RATE`. Set `DRF_NUM_PROXIES` only to the number of trusted, sanitizing proxies in front of Django; zero ignores client-supplied forwarding headers. Use a shared cache for consistent limits across production workers.

M-Pesa callbacks are verified through an authenticated Daraja STK status query; verification outages return 503 for retry and never grant access. Stripe require a valid signature and matching settlement amount, currency, and identity. Set `PAYMENT_SUBSCRIPTION_PRICE_USD` to the configured Stripe checkout total; the legacy `PAYMENT_SUBSCRIPTION_USD` environment name remains a fallback.
M-Pesa pricing must be a positive whole KES amount. Live credentials belong only in backend environment settings.

Google can link an existing account when the verified email is Gmail or its domain matches Google's signed `hd` claim. Other existing email identities must use their existing credentials. Ambiguous email matches are rejected.

## Frontend design and validation