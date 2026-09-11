# :soccer: Futtech :soccer:
Football is the most popular sport on Earth, uniting people across education, class, and race. It has the power to strengthen communities and inspire dreams. _**Africa must harness this power**_ to uplift itself.<br />
**Through [Futtech](https://www.futtech.kalkyokya.tech)**, I am building a future where African footballers no longer have to leave home to maximize their potential—because the tools they need will be right here.<br />

---

> _"Mastery of complex skills is not easy. Especially with inefficient methods."_

---

Football is one such skill, and technology is a powerful tool that can facilitate its mastery.

# What, Why and How?

Futtech is a full-stack football training platform with a Django + Django REST Framework backend and a React (Vite) frontend. The backend handles identity, video metadata, provider-agnostic payments (M-Pesa primary, Stripe fallback), and playlist APIs; the frontend handles authentication UX, protected routing, and content browsing, and checkout.

If you are new to the project, start by understanding two end-to-end flows: **authentication** and **playlist CRUD**. This README gives a quick map, then points to the deeper docs in [`docs/`](docs/).

## What is this repository?

This repository powers the Futtech web application.

- **Backend (`futtech_backend`)**: API endpoints for auth, playlists, and video workflows (including Bunny Stream/Stripe integrations).
- **Frontend (`frontend/`)**: user interface, local auth state, API client, and playlist/video pages.
- **Docs (`docs/`)**: architecture and flow explanations, including Mermaid diagrams for auth and playlist flows.

## Quickstart

## 1) Backend setup (Django)

```bash
python -m venv .my_venv
source .my_venv/bin/activate
pip install -r requirements.txt
cd futtech_backend
python manage.py migrate
python manage.py runserver
```

Backend default dev URL: `htpp://127.0.0.1:8000`

> Configuration: copy value from `futtech_backend/env.sample` into your environment (or `.env` loader flow), especially DB/JWT/Bunny Stream/M-Pesa/Stripe settings.

## 2) Frontend setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend default dev URL: `http://127.0.0.1:5174`

Set `VITE_API_BASE_URL` so the frontend calls the backend API (for local work, typically `http://127.0.0.1:8000/api/v2`).

## Running tests

### Backend

```bash
cd futtech_backend
python manage.py test
```

### Frontend

```bash
cd frontend
npm test -- --run
```

## Architecture at a glance

Top-level folders:

- `futtech_backend/` — Django project + apps (`user_auth`, `playlists`, `video_management`).
- `frontend/` — Vite React app with contexts, pages, and service layer.
- `docs/` — onboarding and system docs.

Request flow (UI → API  → DB → UI state):

1. React page or action calls a service (`authService` / `contentService`).
2. Service calls `apiClient` (Axios instance with auth interceptors).
3. Django endpoint validates/authenticates and runs app logic.
4. ORM reads/writes DB; serializer shapes response.
5. Frontend updates context/reducer state and re-renders UI.

## Documentation map

- [Architecture](docs/ARCHITECTURE.md)
- [Development workflow](docs/DEVELOPMENT.md)
- [API overview](docs/API.md)
- [Frontend implementation notes](docs/FRONTEND.md)
- [Backend implementation notes](docs/BACKEND.md)
- [Payment integration guide](docs/payment-integration.md)
- [Auth + playlist Mermaid flowcharts](docs/mermaid-flowcharts.md)

For auth behavior (register/login/persistence/logout), prefer the Mermaid diagrams above as source of truth.

## Google Sign-In setup

Futtech supports email/password authentication and Google Sign-In through Google Identity Services. The frontend receives a Google ID token, send it to the Django API, and the backend validates the token before issuing the existing JWT access token plus HttpOnly refresh-token cookie.

### Create Google OAuth credentials

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Go to **APIs & Services > OAuth consent screen** and configure the consent screen for your app.
4. Go to **APIs & Services > Credentials > Create credentials > OAuth client ID**.
5. Choose **Web application**.
6. Add authorized JavaScript origins for every frontend origin that will render the Google button, for example:
   - `http:localhost:5174`
   - your production frontend origin, such as `https://app.example.com`
7. Save the generated OAuth client ID. A client secret is not required for this ID-token flow.

### Required environment variables

Set the same web OAuth client ID in both applications:

```bash
# Django backend
GOOGLE_OAUTH_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com

# Vite frontend
VITE_GOOGLE_OAUTH_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Keep the existing production cookie/session settings in place (`DOMAIN_NAME`, `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS`, secure HTTPS hosting) so the refresh cookie can be stored safely by the browser.

### Local development

1. Add `http://localhost:5174` to the OAuth client's authorized JavaScript origins.
2. Put `GOOGLE_OAUTH_CLIENT_ID` in the backend `.env` file used by `futtech_backend/manage.py`.
3. Put `VITE_GOOGLE_OAUTH_CLIENT_ID` in `frontend/.env.local`.
4. Install dependencies, migrate, and start both apps:

```bash
cd futtech_backend
python manage.py migrate
python manage.py runserver

cd ../frontend
npm install
npm run dev
```

The login and registration pages display **Sign in with Google** when `VITE_GOOGLE_OAUTH_CLIENT_ID` is set. The backend creates a user for first-time verified Google emails, links future Google sign-ins through a `SocialAccount`, and safely links to an existing active user with the same verified email instead of creating a duplicate account.

## 📈 **Extra Information**
| Metric | Description |
| ------ | --------- |
| Repo Created | Saturday, 15th March 2025 |
| Last Update | Friday, September 11th 2026 |
| GitHub Repository | [kal-kyokya/Futtech/](https://github.com/kal-kyokya/Futtech-Django) |
| Official Link | [Futtech](https://www.futtech.kalkyokya.tech/) |
| Medium Blog Posts | [Futtech-Django](https://medium.com/@kal-kyokya/the-futtech-startup-a-journey-of-engineering-prototyping-debugging-entrepreneurship-e3bfb91d2de5), [Futtech - MERN version](https://medium.com/@kal-kyokya/the-futtech-startup-a-journey-of-engineering-prototyping-debugging-entrepreneurship-e3bfb91d2de5) |
| GitHub Commits | 1130 |

## Futtech XI

Futtech XI is a self-contained, evidence-aware football intelligence demonstration. It uses four explicit, typed agent hand-offs so research facts cannot silently become tactical claims.

```text
User → POST /api/futtech-xi/analyze → Researcher → Tactical Analyst
                                      └────────────→ Content Strategist → Chief Analyst → Report
```

- **Researcher:** matches a query to a small curated dataset, labels the source, and records limitations.
- **Tactical Analyst:** consumes research only; it separates observations from interpretations.
- **Content Strategist:** turns the supported analysis into three short-form ideas and one serious tactical format.
- **Chief Analyst:** quality-controls claims by retaining only findings with matching confirmed evidence, then synthesizes the final report.

The API is public for the demo: `POST /api/futtech-xi/analyze` with `{"query": "Analyze Barcelona's attacking strengths."}`. `GET /healthz` provides a Cloud Run health check. The minimal UI is at `/futtech-xi`; set `VITE_FUTTECH_XI_API_URL` only when the backend is not local.

### Run Futtech XI locally

```bash
cd futtech_backend
DJANGO_SETTINGS_MODULE=futtech_backend.settings.dev python manage.py runserver
# in a second shell
cd frontend && npm run dev
```

Run the focused tests with `cd futtech_backend && DJANGO_SETTINGS_MODULE=futtech_backend.settings.dev python manage.py test futtech_xi`.

### Docker and Cloud Run

```bash
docker build -f Dockerfile.futtech-xi -t futtech-xi .
docker run --rm -p 8080:8080 -e PORT=8080 -e DJANGO_SETTINGS_MODULE=futtech_backend.settings.dev futtech-xi

gcloud run deploy futtech-xi --source . --region=YOUR_REGION --project=YOUR_PROJECT --allow-unauthenticated --port=8080
```

Use a production settings module and set the existing Django configuration in Cloud Run before a production deployment. The deployed service URL is `https://YOUR_FUTTECH_XI_SERVICE_URL`. This implementation intentionally uses no live provider or LLM key: it is a deterministic curated demonstration, not a source for current scores, injuries, standings, or player statitics.
Future improvements: connect a licensed football data provider and an approved JarvisCore LLM runner while preserving the same typed contracts and Chief Analyst evidence gate.