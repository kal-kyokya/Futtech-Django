# Futtech Repository Engineering Audit

Date: 2026-06-25

## 1. Executive Summary

| Area | Score | Rationale |
| --- | ---: | --- |
| Overall project health | 5/10 | The codebase has a recognizable Django/DRF backend, React/Vite frontend, basic JWT auth, tests for several frontend flows, and documentation. It is still early-stage SaaS software: business workflows, payments, tenancy, media authorization, deployment automation, observability, and backend test coverage are not yet production hardened. |
| Production readiness | 4/10 | Production settings enforce some critical controls such as required host/CORS/secret settings and HTTPS cookies, but deployment artifacts, CI/CD, monitoring, backups, rate limiting, webhook hardening, and backend automated tests are incomplete. |
| Maintainability | 5/10 | Apps are split by feature, but `video_management` owns videos, billing, profiles, playback history, provider integrations, and access policy. Several functions mix HTTP, domain policy, persistence, and third-party API concerns. |
| Security | 4/10 | There are good starts: JWT auth, HttpOnly refresh cookies, production secret validation, and Stripe signature validation. Risks remain around localStorage access-token persistence, unauthenticated M-Pesa callback trust, missing throttling, profile PII exposure, weak multi-tenant isolation, and broad video serialization. |
| Scalability | 4/10 | Pagination and some indexes exist, but no async job pipeline, no upload/processing event architecture, no CDN/tokenized playback authorization strategy, no read/write separation, no queue-based payment fulfillment, and no tenant-aware data partitioning model are present. |

The project is suitable for prototype and controlled pilots, not yet for a club-facing analytics SaaS with tens of thousands of users. The highest-return improvements are to split domain boundaries, add backend test coverage, harden auth/payments/media access, introduce background jobs for provider calls, and build production-grade DevOps.

## 2. Architecture Review

### Structure and boundaries

The repository separates backend, frontend, and docs. Backend apps are `user_auth`, `video_management`, `playlists`, and `tenants`. This is understandable, but the domain boundaries are not yet aligned with a football analytics SaaS.

Current coupling concerns:

- `video_management` contains video metadata, playback history, profiles, teams, payment transactions, payment service orchestration, Bunny Stream integration, Stripe/M-Pesa flow handling, and subscription entitlement logic.
- `user_auth` imports `UserProfile` from `video_management`, making user identity depend on the video domain.
- `playlists` imports `Video` directly, which is reasonable, but ownership and access rules are not centrally reused.
- `tenants` attaches a tenant to the request based on subdomain, but tenant is not consistently enforced in models or querysets.

Recommended domain split:

```text
backend/
  accounts/        # users, profiles, identity, roles
  organizations/   # clubs, teams, tenant memberships, invitations
  media/           # videos, provider metadata, playback authorization
  playlists/       # collections and sharing
  billing/         # payments, subscriptions, entitlements, webhooks
  analytics/       # events, playback telemetry, football metrics
  tenants/         # request resolution and tenant-aware query utilities
```

### Architectural smells

| Smell | Example | Impact | Recommendation |
| --- | --- | --- | --- |
| God app | `video_management` owns unrelated concerns. | Slower development, higher regression risk, unclear ownership. | Extract billing, accounts/profile, media provider integration, and analytics. |
| Fat views | Checkout views perform validation, transaction creation, provider calls, error mapping, and response formatting. | Hard to test and retry. | Move orchestration to application services and keep views as transport adapters. |
| Hidden authorization policy | `_can_access_video` is a private function in one view module. | Other endpoints can accidentally bypass it. | Use DRF permissions/policies and query filters shared by all video serializers/views. |
| Tenant as request decoration only | `TenantMiddleware` sets `request.tenant`, but data models lack tenant foreign keys. | Cross-tenant data leakage risk when SaaS grows. | Add `tenant`/organization fields to content, playlists, users, teams, and payments; enforce scoped managers. |
| Synchronous third-party calls | Payment initiation and Bunny status refresh happen in request path. | Latency spikes, timeouts, poor retry semantics. | Use Celery/RQ/Django-Q workers and outbox/webhook processors. |
| Provider-specific leakage | Stripe settings are selected directly in payment service functions. | Hard to add providers or test. | Define provider interfaces and adapters. |

### SOLID / DRY / KISS / YAGNI

- **SOLID**: Single Responsibility is most affected. Models and services blend profile, payment, entitlement, and provider state.
- **DRY**: Video retrieval and permission checks are repeated across ID/slug endpoints; auth responses duplicate token/cookie response construction.
- **KISS**: Two payment providers are partially abstracted, but provider handling still contains conditional branches in views. A small service class per provider would be simpler to reason about.
- **YAGNI**: Multi-tenant middleware exists before tenant-scoped persistence and permissions. This gives a false sense of SaaS isolation without real isolation.

Example refactor:

```python
# billing/services/checkout.py
class CheckoutService:
    def initiate(self, *, user, provider, payload, request_context):
        payment = self.repository.create_pending(...)
        return self.providers[provider].start(payment, payload, request_context)
```

Then the API view only validates provider input, calls `CheckoutService`, and maps a result DTO to a response.

## 3. Technical Debt Audit

### High Severity Technical Debt

1. **Video playback authorization is centralized only in a private helper**
   - Why debt: Any future media endpoint may bypass `_can_access_video`.
   - Impact: Unauthorized viewing of premium/team videos.
   - Remediation: Create `CanAccessVideo` DRF permission and a `VideoAccessPolicy` service; query only accessible videos.

2. **M-Pesa callback is unauthenticated and trusts checkout ID alone**
   - Why debt: External callbacks can mark payments based on guessable or leaked provider IDs.
   - Impact: Fraudulent subscription activation.
   - Remediation: Validate provider signatures/IP allowlists where available, match amount/currency/user/reference, store raw callbacks idempotently, and only fulfill after reconciled provider status.

3. **Access tokens are persisted to localStorage despite comments claiming memory-only storage**
   - Why debt: XSS can steal access tokens.
   - Impact: Account takeover for active token lifetime.
   - Remediation: Keep access token in memory only or move to secure HttpOnly same-site cookies with CSRF protection.

4. **Tenant isolation is not enforced at persistence layer**
   - Why debt: Request tenant can be ignored accidentally.
   - Impact: Cross-club data exposure.
   - Remediation: Add tenant/org FKs and scoped queryset managers; test every endpoint for tenant isolation.

5. **Missing backend test coverage for critical flows**
   - Why debt: Payment, auth, playlist permissions, and playback access can regress undetected.
   - Impact: Production incidents and security regressions.
   - Remediation: Add pytest-django or Django TestCase suites with factories.

6. **Synchronous provider calls in request path**
   - Why debt: Provider latency/failure directly affects API availability.
   - Impact: Timeouts under load and duplicate side effects during retries.
   - Remediation: Queue provider calls and use idempotency/outbox pattern.

### Medium Severity Technical Debt

1. **Broad serializers expose internal media fields**
   - Impact: Clients can depend on internal provider metadata.
   - Remediation: Use separate list/detail/admin serializers and exclude provider IDs from ordinary clients.

2. **Payment settings naming mismatch**
   - Impact: `PAYMENT_SUBSCRIPTION_USD` exists, but checkout reads `PAYMENT_SUBSCRIPTION_PRICE_USD`.
   - Remediation: Standardize environment variable names and validate settings at startup.

3. **No consistent API error envelope**
   - Impact: Frontend error normalization must handle many shapes.
   - Remediation: Define `{code, message, fields, request_id}` for all API failures.

4. **No API versioning strategy beyond URL prefix**
   - Impact: Harder to evolve contracts.
   - Remediation: Document compatibility rules and keep serializers versioned.

5. **No model-level roles/permissions for club SaaS**
   - Impact: Coaches, scouts, players, and analysts cannot safely share data.
   - Remediation: Add organization memberships and role-based access control.

### Low Severity Technical Debt

1. **Typos and inconsistent naming** (`intiate`, `create_at`, `passwordConfirm`).
2. **Long comments/docstrings restating framework behavior**.
3. **Mixed frontend naming styles** (`myUser.jsx`, `info-ListItem.jsx`).
4. **Repeated token response construction in auth views**.

## 4. Code Quality Review

Strengths:

- Django apps follow conventional file layout.
- DRF and SimpleJWT are used rather than custom auth primitives.
- Frontend API client has a queued refresh implementation to avoid refresh storms.
- Playlist queryset prefetching shows awareness of N+1 risks.

Concerns:

- Function complexity: `initiate_checkout`, `process_stripe_event`, and token refresh interceptor perform many responsibilities.
- Class complexity: `UserProfile` mixes profile PII, team membership, Stripe customer/subscription, and provider-agnostic access expiry.
- Duplication: auth views repeat token/cookie response building; video slug/id endpoints duplicate not-found and permission handling.
- Dead/unused code risk: Firebase dependency appears present, but no clear usage was identified in the inspected paths; validate before keeping it.
- Magic strings: payment statuses, webhook event names, API route strings, storage keys, and media status strings should be constants/enums shared across layers.

Refactoring priorities:

1. Extract `VideoAccessPolicy`.
2. Extract `AuthTokenResponseFactory`.
3. Extract billing app and provider adapters.
4. Replace comments describing Django basics with comments explaining domain decisions.

## 5. Hidden Bug Detection

| Suspected bug | Why it may occur | Reproduction scenario | Likelihood | Fix |
| --- | --- | --- | --- | --- |
| Refresh cookie always secure in development | `_refresh_cookie_options` always sets `secure=True`. HTTP local development may not store cookies. | Login via `http://localhost:5174`; refresh after token expiry fails. | Medium | Use secure cookies only when request is HTTPS or environment is production; test cookie behavior. |
| Stripe live/test configuration mismatch | Production requires test keys and service uses `STRIPE_TEST_SECRET_KEY` even when `STRIPE_LIVE_MODE` can be true. | Deploy production with live mode and live keys; checkout/webhook uses wrong setting. | High | Use `STRIPE_SECRET_KEY` selected by mode and require only relevant keys. |
| Payment USD env var mismatch | Settings define `PAYMENT_SUBSCRIPTION_USD`; service reads `PAYMENT_SUBSCRIPTION_PRICE_USD`. | Operator sets documented var; checkout still charges default USD amount. | Medium | Rename consistently and add startup validation. |
| `serialize_payment` typo | Response uses `create_at`, not `created_at`. | Frontend expects `created_at`; payment status UI fails. | Medium | Rename with backward-compatible deprecation or add both temporarily. |
| Slug race condition | `Video.save` loops until slug is free, but concurrent creates can pick same slug. | Two uploads with same title are created simultaneously. | Medium | Catch `IntegrityError`, retry in transaction, or use UUID suffix by default. |
| Missing profile can break access checks | `_can_access_video` calls `user.profile.has_active_subscription()` without guard. | Legacy user without profile opens premium video. | Low/Medium | Ensure profile creation on user creation and use `get_or_create` in access policy. |
| Callback fulfillment can run on stale payment object | `mark_payment_result` and `fulfill_transaction` use nested atomic operations but do not lock the payment row before status transition. | Duplicate webhooks arrive concurrently. | Medium | Lock payment row with `select_for_update`, enforce transition rules, store provider event IDs. |
| Frontend queued refresh may never normalize queued request errors | Queued failures reject with refresh error, not original normalized error. | Many requests 401 while refresh fails. | Low | Normalize refresh failure and route through central auth state. |
| Playback progress lacks duration validation | Any positive integer can be stored. | Client sends 999999999 seconds. | Medium | Validate against known video duration and clamp. |
| Tenant parsing fails for many domains | Middleware assumes subdomain from labels length and `www`. | `club.localhost`, multi-part TLDs, custom domains. | Medium | Store tenant domains explicitly and resolve by full host. |

## 6. Security Review

| Risk | Severity | Attack scenario | Mitigation |
| --- | --- | --- | --- |
| localStorage access token persistence | High | XSS reads `futtech_access_token` and replays API calls. | Store access token in memory only or use HttpOnly cookie auth; add strict CSP. |
| Missing rate limiting | High | Credential stuffing against login/register/refresh or payment initiation abuse. | Add DRF throttles, IP/account throttles, WAF rules, and alerting. |
| Unauthenticated M-Pesa callback trust | High | Attacker posts crafted callback for an existing checkout request. | Verify provider authenticity, reconcile with M-Pesa API, match amount/account, record event IDs. |
| Broad video serializer | Medium | Authenticated user receives provider IDs or fields not needed by UI. | Use safe response serializers and field-level access control. |
| Tenant isolation incomplete | High | User on one club subdomain accesses another club's public/private data by ID. | Enforce tenant scoping in every model/queryset and permission test. |
| CSRF/auth model ambiguity | Medium | Refresh cookie endpoint and mixed JWT/cookie flows can create CSRF assumptions. | If cookies authenticate any endpoint, enforce CSRF. For bearer tokens, keep cookies scoped only to refresh/logout. |
| PII exposure | Medium | Profile endpoint returns phone, birthday, location without privacy controls. | Add profile privacy settings and role-based field filtering. |
| Missing security headers/CSP | Medium | XSS impact increases. | Add CSP, Referrer-Policy, Permissions-Policy, secure static/media domain isolation. |
| Dependency drift | Medium | Known package CVEs remain unpatched. | Run `pip-audit` and `npm audit` in CI; update regularly. |

## 7. Database Review

Current schema has useful basics: UUID primary keys for videos/payments, unique playback history per user/video, some payment indexes, and default ordering for playlists.

Gaps:

- Add indexes for common video list filters: `(status, is_premium, created_at)`, `(is_showcase, status, title)`, and owner-created ordering.
- Add explicit indexes for `PlaybackHistory(user, last_watched_at)` and playlist owner/public filters.
- Add tenant/org foreign keys to all domain records before onboarding clubs.
- Add unique constraints for provider event IDs where possible.
- Avoid storing third-party raw payloads indefinitely without retention policy; payment metadata can contain PII.
- Add constraints for non-negative payment amounts and sane playback progress.

N+1 risks:

- `VideoSerializer` includes `owner` IDs only now, but future owner/profile fields can create N+1 issues.
- Playlist serializer should be checked to ensure nested video rendering is bounded and prefetched.

## 8. API Review

Strengths:

- API is mostly under `/api/v2/`.
- Pagination is globally configured and playlist pagination exists.
- Public showcase endpoints explicitly use `AllowAny`.

Issues:

- Endpoint naming is inconsistent: `/api/tenant/` is outside `/api/v2/`.
- Error shapes vary between `JsonResponse` and DRF `Response`.
- There is no request ID/correlation ID in errors.
- Rate limiting is absent.
- Public showcase has limit caps, but general video/playlists need documented pagination guarantees.
- Webhook endpoints should document idempotency and retry semantics.
- No OpenAPI schema generation appears configured.

Recommendations:

- Introduce drf-spectacular or equivalent for OpenAPI.
- Standardize error schema.
- Add throttles by endpoint category.
- Version serializers and document deprecation policy.

## 9. Frontend Review

Strengths:

- React components are organized by page/component/context.
- Tests exist for login, logout, registration, playlist CRUD, watch, showcase, and auth persistence.
- API client centralizes auth and error normalization.

Concerns:

- Access token is stored in localStorage, increasing XSS impact.
- Context/reducer structure may become hard to scale as football analytics grows; data fetching/cache state should move toward React Query/TanStack Query or RTK Query.
- Accessibility needs systematic testing: modals, forms, video player controls, keyboard navigation, focus states, color contrast.
- Large media assets in `public/` can slow repository and deployments; use object storage/CDN for production media.
- Route-level error handling exists, but product flows need consistent loading/empty/error states.

Recommendations:

- Add axe accessibility tests for critical pages.
- Use server-state cache library for videos, playlists, payment status, and current user.
- Add design-system primitives and reduce page-specific style duplication.
- Add bundle analysis to CI.

## 10. DevOps Review

Current gaps:

- No Dockerfile or compose file was found in the root file list inspected.
- No CI workflow was found in the inspected paths.
- No infrastructure-as-code, release process, rollback process, or health checks are present.
- No background worker deployment plan exists.
- No monitoring/log aggregation/error tracking configuration is present.
- No backup/restore runbook exists.

Recommendations:

1. Add Dockerfiles for backend and frontend, plus local compose with Postgres, Redis, backend, worker, frontend, and nginx.
2. Add GitHub Actions: backend tests, migrations check, lint, frontend tests/build, audits.
3. Add `/healthz` and `/readyz` endpoints.
4. Add structured JSON logs and request IDs.
5. Add Sentry/OpenTelemetry and provider webhook dashboards.
6. Document backup/restore and disaster recovery objectives.

## 11. Testing Audit

Existing coverage is weighted toward frontend behavior. Backend app `tests.py` files appear present but minimal/empty from the repository structure.

Tests to add first:

1. Auth registration/login/refresh/logout cookie behavior.
2. Video access policy for owner, free, premium subscribed, premium unsubscribed, showcase.
3. Playlist ownership and public read access.
4. M-Pesa callback idempotency and invalid callback handling.
5. Stripe webhook signature and event mapping.
6. Payment fulfillment idempotency under duplicate callbacks.
7. Tenant isolation tests for every list/detail endpoint once tenant FKs exist.
8. Serializer field exposure tests for public/private video responses.

Coverage priorities:

- Security and money movement first.
- Access control second.
- Query performance and pagination third.
- Frontend accessibility and payment UI fourth.

## 12. Performance Review

Backend bottlenecks:

- Synchronous external API calls in checkout and playback status refresh.
- Potential repeated profile/subscription fetches in access checks.
- Missing indexes for video discovery and tenant-scoped filtering.

Frontend bottlenecks:

- Potential bundle bloat from MUI, Firebase, Recharts, and media assets.
- Context updates can re-render broad subtrees.
- No explicit cache/stale-time strategy for server data.

Database bottlenecks:

- Playlist/video many-to-many lists can grow large without pagination on nested videos.
- Payment metadata JSON can grow and slow row access.
- Future analytics events should not live in primary OLTP tables without partitioning.

Recommendations:

- Move provider calls to workers.
- Cache public showcase/featured lists briefly.
- Add indexes and query plans for high-volume endpoints.
- Store analytics events in append-only/event storage, then aggregate asynchronously.

## 13. Dependency Audit

Backend:

- Requirements should be audited with `pip-audit` and pinned with hashes for production.
- `django_redis` is installed as an app, but Django Redis is normally a cache backend rather than an installed app requirement; verify necessity.
- Payment/video SDK interactions should use explicit version constraints and retry policies.

Frontend:

- Dependencies include Firebase, MUI, Data Grid, Recharts, and Popper. Validate actual usage and remove unused packages.
- Add `npm audit` to CI with a triage process.
- Consider bundle-size checks because analytics UI libraries can grow quickly.

Recommended commands for CI:

```bash
python -m pip install pip-audit && pip-audit -r futtech_backend/requirements.txt
npm --prefix frontend audit --audit-level=moderate
npm --prefix frontend run lint
npm --prefix frontend test -- --run
```

## 14. Refactoring Roadmap

### Phase 1 — Critical Fixes

- Add backend tests for auth, permissions, payments, and video access.
- Fix token persistence mismatch and remove localStorage access-token storage.
- Harden payment callbacks and Stripe live/test key selection.
- Standardize error responses and add throttling.
- Add production Docker/CI baseline.

Effort: 2-4 weeks. Risk: Medium. Benefit: High security and release confidence.

### Phase 2 — Technical Debt Reduction

- Extract `accounts`, `billing`, and `media` boundaries from `video_management`.
- Create shared access policy services and DRF permissions.
- Add OpenAPI generation and API contract tests.
- Normalize settings names and environment validation.

Effort: 4-8 weeks. Risk: Medium/High due to migrations and imports. Benefit: High maintainability.

### Phase 3 — Scalability Improvements

- Add Celery/RQ workers for provider calls, webhook processing, video status sync, and analytics aggregation.
- Add Redis caching for public lists and entitlement checks.
- Add tenant/org FKs and scoped query managers.
- Add database indexes and query performance tests.

Effort: 6-10 weeks. Risk: High. Benefit: Enables club-scale usage.

### Phase 4 — Long-Term Architecture

- Build organization/team RBAC with memberships and invitations.
- Create analytics event pipeline and reporting aggregates.
- Move media assets to object storage/CDN with signed playback URLs.
- Add observability, SLOs, incident runbooks, and disaster recovery.

Effort: 3-6 months. Risk: High. Benefit: SaaS-grade platform foundation.

## 15. Pull Request Generation

This audit PR intentionally adds documentation only. The codebase changes proposed below should be implemented as follow-up PRs.

### Proposed Change A: Remove localStorage access-token persistence

1. Issue: access tokens are written to localStorage, making XSS more damaging.
2. Affected file: `frontend/src/services/tokenService.js`.
3. Exact modification:

```diff
- this.storageKey = 'futtech_access_token';
+ this.storageKey = null;
...
- const storage = this.getStorage();
- if (!storage) {
-     return;
- }
-
- if (token) {
-     storage.setItem(this.storageKey, token);
- } else {
-     storage.removeItem(this.storageKey);
- }
+ return;
...
- this.rehydrate();
- return this.accessToken;
+ return this.accessToken;
```

4. Why it improves the codebase: reduces token theft impact from XSS and makes implementation match the memory-only comment.
5. Breaking changes: users lose persistence across full page reloads unless the app silently refreshes from the HttpOnly refresh cookie on boot.

### Proposed Change B: Introduce `VideoAccessPolicy`

1. Issue: video access rules are hidden in a private view helper.
2. Affected files: `futtech_backend/video_management/views.py`, new `futtech_backend/video_management/access_policy.py`.
3. Exact modification concept:

```python
class VideoAccessPolicy:
    def can_view(self, user, video):
        if not user or not user.is_authenticated:
            return False
        if video.owner_id == user.id:
            return True
        if not video.is_premium and not video.is_showcase:
            return True
        profile = getattr(user, 'profile', None)
        return bool(profile and profile.has_active_subscription())
```

4. Why it improves the codebase: gives every endpoint one reusable authorization source.
5. Breaking changes: endpoints currently relying on looser implicit access may return 403.

### Proposed Change C: Move payment provider calls to background jobs

1. Issue: checkout and provider calls happen synchronously in API requests.
2. Affected files: `video_management/views.py`, `video_management/payment_services.py`, new billing task module.
3. Exact modification concept: the API creates a pending transaction and enqueues `start_payment(transaction_id)`; the client polls `payment_status`.
4. Why it improves the codebase: improves latency, retry safety, and operational resilience.
5. Breaking changes: checkout response for M-Pesa/Stripe may become `202 Accepted` with polling instead of immediate provider result.
