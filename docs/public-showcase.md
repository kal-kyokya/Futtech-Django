# Public Showcase

Futtech now supports a public, read-only showcase mode for visitors such as university admissions teams and recruiters.

## What is public

- `GET /api/v2/public/showcase/` returns only videos explicitly marked as showcase (`is_showcase=True`) and ready for playback.
- `GET /api/v2/public/showcase/showcase/<slug>/` returns one showcase video by slug.
- Response payload is limited to viewing-safe metadata and Bunny embed URL.

## What remains private

- Existing authenticated routes for dashboard, playlists, profile, upload, and member flows are unchanged.
- Premium/member logic and subcription checks still apply to private routes and endpoints.
- Non-showcase videos are not returned by public endpoints.

## How to add new public showcase items

1. In Django admin or shell, edit a `Video` record.
2. Set `is_showcase=True`.
3. Ensure the video is in `ready` status and has Bunny fields populated (`video_library_id`, `bunny_video_id`).
4. Save the record. A slug is generated automatically when missing.

## Frontend routes

- `/` now serves the public showcase for anonymous users.
- `/showcase` lists public showcase videos.
- `/showcase/:slug` renders a public video detail page.
- Authenticated users still land in the member home/dashboard experience.
