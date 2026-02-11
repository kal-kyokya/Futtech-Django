# Development

This guide focuses on local setup, debugging habits, and day-to-day commands.

# Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- PostgreSQL/Redis/Stripe/Mux credentials as required by environment

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
