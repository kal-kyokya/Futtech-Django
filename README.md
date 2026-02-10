# :soccer: Futtech :soccer:
Football is the most popular sport on Earth, uniting people across education, class, and race. It has the power to strengthen communities and inspire dreams. _**Africa must harness this power**_ to uplift itself.<br />
**Through [Futtech](https://www.futtech.kalkyokya.tech)**, I am building a future where African footballers no longer have to leave home to maximize their potential—because the tools they need will be right here.<br />

---

> _"Mastery of complex skills is not easy. Especially with inefficient methods."_

---

Football is one such skill, and technology is a powerful tool that can facilitate its mastery.

# What, Why and How?

Futtech is a full-stack football training platform with a Django + Django REST Framework backend and a React (Vite) frontend. The backend handles identity, video metadata, Stripe billing data, and playlist APIs; the frontend handles authentication UX, protected routing, and content browsing.

If you are new to the project, start by understanding two end-to-end flows: **authentication** and **playlist CRUD**. This README gives a quick map, then points to the deeper docs in [`docs/`](docs/).

## What is this repository?

This repository powers the Futtech web application.

- **Backend (`futtech_backend`)**: API endpoints for auth, playlists, and video workflows (including Mux/Stripe integrations).
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

> Configuration: copy value from `futtech_backend/env.sample` into your environment (or `.env` loader flow), especially DB/JWT/Mux/Stripe settings.

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
- [Auth + playlist Mermaid flowcharts](docs/mermaid-flowcharts.md)

For auth behavior (register/login/persistence/logout), prefer the Mermaid diagrams above as source of truth.

## 📈 **Extra Information**
| Metric | Description |
| ------ | --------- |
| Repo Created | Saturday, 15th March 2025 |
| Last Update | Wednesday, 10th February 2026 |
| GitHub Repository | [kal-kyokya/Futtech/](https://github.com/kal-kyokya/Futtech-Django) |
| Official Link | [Futtech](https://www.futtech.kalkyokya.tech/) |
| Medium Blog Posts | [Futtech-Django](https://medium.com/@kal-kyokya/the-futtech-startup-a-journey-of-engineering-prototyping-debugging-entrepreneurship-e3bfb91d2de5), [Futtech - MERN version](https://medium.com/@kal-kyokya/the-futtech-startup-a-journey-of-engineering-prototyping-debugging-entrepreneurship-e3bfb91d2de5) |
| GitHub Commits | 735 |
