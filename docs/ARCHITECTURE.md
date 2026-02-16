# Architecture

This document is a newcomer map of module boundaries and data flow.

# System overview

Futtech is split into two runtime applications:

- **Frontend**: React + Vite SPA (`frontend/`)
- **Backend**: Django + DRF API (`futtech_backend/`)

The backend serves JSON APIs under `api/v2/*` and persists core entities (users, profiles, videos, playlists). The frontend uses a shared Axios client and context providers to keep auth + content state coherent.

## Module boundaries

## Backend (`futtech_backend/`)

- `futtech_backend/urls.py`
  - Top-level router.
  - Delegates to `user_auth`, `playlists`, and `video_management` apps.
- `user_auth/`
  - Registration, login, token refresh, logout, current-user endpoint.
  - Refresh token lives in `HttpOnly` cookie; access token is returned in JSON.
- `playlists/`
  - Playlist model + serializer + permissions + DRF viewset for CRUD.
  - List endpoint combines owner playlists and public playlists.
- `video_management/`
  - Video metadata, featured videos, upload lifecycle, playback token endpoint.
  - Integration with Bunny Stream (uploads!playback) and Stripe (billing/subscription paths)

## Frontend (`frontend/src/`)

- `services/apiClient.js`
  - Axios instance with request/response interceptors.
  - Attaches access token and performs refresh-on-401 (non-auth endpoints).
- `services/authService.js`
  - Login/register/logout orchestration + initial content bootstrap.
- `services/contentService.js`
  - Playlist/video data access + client-side caching helpers.
- `contexts/*Context/`
  - App-level state containers (auth/user/video/playlist) backed by reducers.
- `pages/`
  - Route-level UI screens.

## Core data flow

### Auth flow

Please use the Mermaid diagrams as source of truth:

- [Registration Mermaid diagram](./mermaid-flowcharts.md#registration-flowchart)
- [Login Mermaid diagram](./mermaid-flowcharts.md#login-flowchart)
- [Auth-Persistence Mermaid diagram](./mermaid-flowcharts.md#auth-persistence-flowchart)
- [Logout Mermaid diagram](./mermaid-flowcharts.md#logout-flowchart)

### Playlist flow

For end-to-end playlist operations, see:

- [Playlist CRUD Mermaid diagram](./mermaid-flowcharts.md#playlist-crud-flowchart)

## Request lifecycle (UI → API  → DB → UI)

1. A page/action calls `authService` or `contentService`.
2. Service sends request through `apiClient`.
3. `apiClient` adds bearer token if present.
4. Django endpoint authenticates request and executes app logic.
5. ORM query/transaction runs against DB.
6. Serializer returns normalized payload.
7. Context reducer stores data and React rerenders.

## Invariants and gotchas

- Refresh token is cookie-scoped to auth paths and not directly readable by JS.
- Access token is frontend-managed and must be present for protected calls.
- `apiClient` intentionally avoids refresh loops on auth endpoints.
- Playlist list visibility is owner-or-public; writes are owner-only.
