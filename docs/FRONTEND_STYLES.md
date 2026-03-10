# Frontend styles guide

## Audit summary

### Top issues found
- Breakpoints were inconsistent (`767px`, `768px`, `480px`) across auth and shared components.
- Global defaults were fragile (`box-sizing` tied to `:root`, global `!important` font-family).
- Auth styles duplicated card and form control sizing rules in multiple files.
- Repeated hard-coded values were common for spacing, radius, and colors (especially auth/login/register).
- One explicit `!important` remained in navbar mobile rules and contributed to specificity pressure.

## What we standardized
- Added shared design tokens in `frontend/src/styles/_tokens.scss` for spacing, typography, color, radii, shadows, and breakpoints.
- Added shared mixins in `frontend/src/styles/_mixins.scss` for responsive breakpoints and reusable layout primitives (`page-container`, `app-card`).
- Normalized app-wide defaults in `frontend/src/app.scss`.
  - global `box-sizing: border-box`
  - consistent typography setup
  - base page/card utility patters
- Refactored auth layout + login/register styles to consume shared tokens mixins, reducing duplicated values and brittle iframe/form sizing overrides.
- Removed unused legacy auth stylesheet (`authHeroVideo.scss`) now that auth video styles are centralized.

### What we deliberately did **not* change
- No routing, auth, or business logic changes.
- No major visual redesign or brand palette overhaul.
- No broad component rewrites outside high-impact styling paths.

## Where tokens live
- `frontend/src/styles/_tokens.scss`
- `frontend/src/styles/_mixins.scss`

Use tokens for:
- colors (`$color-*`)
- spacing (`$space-*`)
- typography(`$font-size-*`)
- radii (`$radius-*`)
- shadows (`$shadow-*`)
- breakpoints (`$bp-*`)

## Breakpoint conventions
- Mobile-first defaults
- `tablet-up`: `min-with: 768px`
- `desktop-up`: `min-with: 1024px`
- `wide`: `1280px` (available token for future use)

Prefer mixins from `_mixins.scss` over raw media queries.

## Layout conventions
- Use `.page` (or `@include page-container`) for centered max-width content with consistent side padding.
- Use `.card` (or `@include app-card`) for elevated panels with standardized radius/padding/background.
- Avoid fixed widths where fluid sizing works; prefer `width: 100%` + `max-width`.

## Naming conventions
- Existing codebase is class-based SCSS with nested blocks.
- For new shared structures, keep a BEM-ish patter (e.g., `.authPage__panelGrid`, `.authHeroVideo__frame`).
- Keep nesting shallow (2-3 levels max) to avoid specificity wars.

## Adding new styles safely
1. Start with tokens/mixins before introducing raw values.
2. Keep page-level styles scoped under the page root class.
3. Avoid `!important`; fix structure/specificity first.
4. Test widths at minimum: `375`, `768`, `1280`.
5. For forms and embeds, ensure parent child both use fluid width and predictable box model.
