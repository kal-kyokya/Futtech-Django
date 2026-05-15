# Backend Notes

This guide describes backend app responsibilities and common API patterns.

## Django apps and responsibilities

- `user_auth`
  - Registration/login/logout/current-user APIs.
  - JWT issuance and refresh-cookie lifecycle.
- `playlists`
  - Playlist model, serialization, owner-based write permission, paginated list APIs.
- `video_management`
  - Admin-managed video records, featured content endpoint, public showcase, and playback token handling.
  - Bunny Stream playback/status sync and provider-agnostic payment endpoints.
  - M-Pesa (primary) + Stripe (fallback) checkout and callback/webhook processing.

## Common DRF patterns in this repo

- Class-based API views and viewsets (`APIView`, `ModelViewSet`).
- Serializer-driven validation for request payloads.
- `IsAuthenticated` as baseline for most protected routes.
- Custom object-level permission (`IsOwnerOrReadOnly`) for playlist writes.

## Auth behavior

The canonical auth flows are in:

- [Mermaid flowcharts](./mermaid-flowcharts.md)

Important constraints:

- Refresh tokens are set/deleted as cookie values by backend auth views.
- Refresh-token blacklisting is used on logout when token is valid.
- Current-user endpoint materializes `UserProfile` on demand if missing.

## Playlist behavior

- List endpoint intentionally merges owned playlists and public playlists.
- Create endpoint always assigns `owner=request.user` server-side.
- Update/delete routes depend on object-level ownership permission.

## Validation and response shape

- Serializer validation errors return field-keyed payloads.
- Authentication/authorization errors use DRF exception style (`detail`, status code).
- Paginated list responses follow DRF pagination envelope.
