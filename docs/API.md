# API Overview

Base path: `/api/v2`

This is a practical endpoint map for frontend integration and onboarding. For exact serializer fields, inspect the backing serializer/view code.

## Authentication (`/api/v2/auth/`)

- `POST /register/`
  - Creates user.
  - Returns: `{ message, access, user }` and sets `refresh_token` cookie.
- `POST /login/`
  - Validates email/password.
  - Returns: `{ message, access, user }` and sets `refresh_token` cookie.
- `POST /token/refresh/`
  - Uses refresh token from cookie (or request body `refresh`).
  - Returns: `{ access }`; may rotate refresh cookie.
- `POST /logout/`
  - Blacklists refresh token when valid.
  - Clears refresh cookie; `204` on success.
- `GET /me/`
  - Requires auth.
  - Returns serialized current user profile.

Auth flow reference:

- [Auth Mermaid diagrams](./mermaid-flowcharts.md)

## Playlists (`/api/v2/playlists/`)

- `GET /`
  - Paginated list (`count`, `next`, `previous`, `results`).
  - Includes owner playlists + public playlists.
- `POST /`
  - Creates playlist; owner is set from authenticated request user.
- `GET /<id>/`
  - Playlist detail.
- `PUT/PATCH /<id>/`
  - Update playlist (owner only).
- `DELETE /<id>/`
  - Delete playlist (owner only).

Playlist flow reference:

- [Playlist CRUD Mermaid diagram](./mermaid-flowcharts.md#playlist-crud-flowchart)

## Video/content endpoints (`/api/v2/`)

Representative endpoints used by the frontend:

- `GET /videos/featured/`
- `GET /video/<uuid:video_id>/` (metadata)
- `GET /video/<uuid:video_id>/playback/` (signed Bunny embed URL)
- `POST /video/upload/` (multipart upload: metadata + file)
- `GET /videos/` (owner videos)

## Bunny Stream notes

- Playback iframe format: `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`
- If `BUNNY_STREAM_EMBED_TOKEN_KEY` is configured, backend appends short-lived embed token query params.
- No Bunny secrets are returned to the frontend.

## Error shape expectations

The frontend normalizes error in `apiClient.normalizeError` and expects one of:

- `detail` or `message` for top-level display
- field-level validation dicts (e.g. `email`, `password`) for form errors
- optional `non_field_errors`

HTTP status conventions are standard DRF/REST style (`400`, `401`, `403`, `404`, `500`).
