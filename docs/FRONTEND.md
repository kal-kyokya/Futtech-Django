# Frontend Notes

This guide explains how the React app manages auth/session state and playlist loading.

## Key modules

- `services/apiClient.js`
  - Central Axios client.
  - Adds bearer token on outbound requests.
  - Handles `401` by attempting one refresh request and replaying queued requests.
- `services/authService.js`
  - Wrapper for register/login/logout/current-user requests.
  - Triggers initial content fetch after successful auth.
- `services/contentService.js`
  - Fetches playlists/videos and provides lightweight cache/prefetch logic.

## Context and reducer state

- `contexts/authContext/`
  - Stores `user`, `isFetching`, `error`, `loggedOut`.
  - Persists user metadata to localStorage.
  - Auto-logs out if user metadata exists but access token is missing.
- `contexts/playlistContext/`
  - Stores playlist collection + fetch/error state.
  - Persists playlists to localStorage.

## Auth persistence strategy

1. Access token is stored client-side via `tokenService`.
2. Refresh token is cookie-based (`HttpOnly`) and sent automatically with `withCredentials`.
3. On `401`, `apiClient` attempts `/auth/token/refresh/`.
4. If refresh succeeds, token is replaced and pending requests are retried.
5. If refresh fails, token is cleared and user is redirected to `/login`.

Use the auth Mermaid diagrams for behavior details:

- [Auth Mermaid flowcharts](./mermaid-flowcharts.md)

## Unhappy-path rules

- Auth endpoints are excluded from automatic refresh loop prevention logic.
- API errors are normalized (`status`, `message`, optional `fields`) before surfacing.
- Failed initial content fetch during login should not prevent user auth state updates.
