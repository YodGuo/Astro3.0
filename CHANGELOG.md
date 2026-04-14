# Changelog

## [Unreleased]

### URL Structure Refactor (2026-04-13 10:12)

Unified product and news URL hierarchy for improved SEO weight transfer.

**Product URLs**: `/product/[slug]` → `/products/[brand]/[slug]`
- Product detail pages now live under brand/category: e.g. `/products/huawei/ups-5000e`
- Brand slug derived from `product_categories` table via LEFT JOIN in `export-build-data.mjs`
- Products without a category fall back to `/products/other/[slug]`
- New pages: `products/[brand]/[slug].astro`, `products/page/[page].astro`, `products/[brand]/page/[page].astro`
- BreadcrumbList Schema updated to 3-level: Home > Products > Brand > Product
- Deleted: `src/pages/product/[slug].astro`

**News URLs**: `/article/[slug]` → `/news/[tag]/[slug]`
- Article detail pages now live under first tag: e.g. `/news/industry-trends/article-slug`
- Articles without tags fall back to `/news/all/[slug]`
- New pages: `news/[tag]/[slug].astro`, `news/page/[page].astro`
- Moved: `news/[tag]/[page].astro` → `news/[tag]/page/[page].astro` (literal `page` segment avoids ambiguity with `[slug]`)
- BreadcrumbList Schema updated to 3-level: Home > News > Tag > Article
- Deleted: `src/pages/article/[slug].astro`

**Data layer**: `export-build-data.mjs` now includes `brandSlug` per product. `build-data.ts` type updated.

**Link updates**: All product card links, article card links, pagination links, and sitemap URLs updated to new format across 8 files.

**Middleware**: Removed legacy 301 redirects (`/products/[slug]` → `/product/[slug]` and `/news/[slug]` → `/article/[slug]`).

**API**: Added reserved slug validation (`page`, `other`, `all`, `index`) in `POST /api/products`.

### Security

- **SEC-03 [CRITICAL]**: Fixed stored XSS in about page — `storyHtml` now calls `sanitizeHtml()` on each paragraph of `aboutStory.body` before `set:html` injection. Consistent with `terms.astro` and `privacy.astro` patterns. ([`src/pages/about.astro`])
- **SEC-04 [HIGH]**: Changed Passkey `userVerification` from `"preferred"` to `"required"` for admin security. B2B management console now enforces user verification (PIN/biometric) during Passkey authentication. ([`src/lib/auth.ts`])
- **SEC-02 [CRITICAL]**: Added rate limiting to authentication endpoints — `/api/auth/sign-in` (5 req/5min), `/api/auth/sign-up` (3 req/1hr), `/api/auth/forget-password` (3 req/1hr). Prevents brute-force attacks on login and account creation. Note: in-memory limiter is per-isolate; for production global limiting, configure Cloudflare WAF Rate Limiting rules. ([`src/middleware.ts`])
- **SEC-01 [CRITICAL]**: Removed `'unsafe-inline'` from `script-src` CSP directive for public pages. Public prerendered pages now use SHA-256 hashes for inline scripts (dark mode toggle, GTM init) via `<meta>` CSP tag. SSR pages get hash-based CSP via middleware HTTP header. Admin/login pages retain `'unsafe-inline'` (onclick handlers in admin components). `style-src 'unsafe-inline'` retained (374 inline styles across 39 files — tracked for future removal). ([`src/middleware.ts`], [`src/layouts/BaseLayout.astro`])
- **SEC-05 [MEDIUM]**: Set cookie `SameSite` attribute to `"strict"` for `session_token` and `session_data` cookies via Better Auth `advanced.cookies` configuration. Prevents CSRF attacks from cross-site requests on B2B admin console. ([`src/lib/auth.ts`])

### Infrastructure

- **DEPLOY-01 [HIGH]**: Added multi-environment configuration to `wrangler.jsonc` with `[env.staging]` and `[env.production]` sections. Each environment has its own D1 database, KV namespaces, R2 bucket, and Queue resources. Top-level config retained as local dev default. Resource IDs are placeholders (`REPLACE_WITH_*`) to be filled during Cloudflare resource provisioning. Includes deployment instructions in inline comments. ([`wrangler.jsonc`])
- **DEPLOY-03 [LOW]**: Updated `compatibility_date` from `2025-01-01` to `2026-04-01` for latest runtime features and security patches. ([`wrangler.jsonc`])

### Bug Fixes

- **EDGE-02 [HIGH]**: Replaced per-isolate in-memory rate limiter with D1-backed global rate limiter. New `rate-limit-d1.ts` uses fixed-window counters stored in D1 `rate_limits` table, shared across all Worker isolates. Middleware now uses D1 limiter as primary, with in-memory limiter as fallback when D1 is unavailable. Added migration `0016_rate_limits.sql`. ([`src/lib/rate-limit-d1.ts`], [`src/middleware.ts`], [`src/lib/rate-limit.ts`], [`migrations/0016_rate_limits.sql`])
- **EDGE-01 [CRITICAL]**: Fixed SSE notification delivery across Worker isolates. The module-level `Set<ClientConnection>` in `stream.ts` is per-isolate, so SSE push silently fails when queue consumer and SSE connection run in different isolates. Added incremental polling support to `/api/notifications/latest?since=<logId>` endpoint (reads from D1, shared across isolates). Updated client polling in `AdminLayout.astro` to pass `since` parameter for efficient incremental queries. SSE remains as best-effort enhancement; polling is the reliable delivery mechanism. ([`src/pages/api/notifications/stream.ts`], [`src/pages/api/notifications/latest.ts`], [`src/layouts/AdminLayout.astro`], [`src/lib/notification/queue-consumer.ts`])
- **SEO-01 [HIGH]**: Fixed `robots.txt.ts` build-data path resolution — replaced `node:fs`/`import.meta.url` approach (broken in workerd prerender) with direct JSON import. robots.txt now correctly outputs `Sitemap: https://powertech.example.com/sitemap.xml` instead of placeholder domain. ([`src/pages/robots.txt.ts`])
- **DB-01 [MEDIUM]**: Added composite index `(user_id, expires_at)` on `sessions` table for Better Auth's frequent session lookup queries. Migration `0017_sessions_index.sql`. ([`migrations/0017_sessions_index.sql`])
- **SEO-05 [LOW]**: Added `<meta name="robots" content="noindex, nofollow">` support via `noIndex` prop on `BaseLayout.astro`. Article pages now pass `noIndex` when article status is `"draft"`. ([`src/layouts/BaseLayout.astro`], [`src/pages/article/[slug].astro`])
- **SEO-04 [LOW]**: Added clarifying comment to `astro.config.mjs` `site` placeholder — production canonical URLs are generated from `build-data.json domains.public`, not this value. ([`astro.config.mjs`])
- **DB-02 [MEDIUM]**: Added best-effort cleanup of `notification_logs` older than 30 days in queue consumer. Runs after each batch processing, non-critical (failures ignored). Prevents unbounded table growth on D1 free plan (500MB limit). ([`src/lib/notification/queue-consumer.ts`])
- **SEO-02 [MEDIUM]**: Sitemap now respects page visibility settings. `sitemap.xml.ts` checks `news_enabled`, `products_enabled`, `solutions_enabled`, `about_enabled`, `services_enabled`, `privacy_enabled`, `terms_enabled` from build-data settings before including pages. `export-build-data.mjs` now exports these `*_enabled` settings from D1 `site_settings` table. ([`src/pages/sitemap.xml.ts`], [`scripts/export-build-data.mjs`])
- **DEPLOY-02 [MEDIUM]**: Added `deploy-staging` CI job that automatically deploys to Cloudflare Workers staging environment after successful D1-data build on push to main. Downloads build artifacts from `build-with-d1-data` job and runs `wrangler deploy --env staging`. Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. ([`.github/workflows/ci.yml`])
- **MAINT-02 [MEDIUM]**: Defined `AdminUser` interface in `env.d.ts` with typed `role` field (extends Better Auth base User). Updated `App.Locals.user` to use `AdminUser` instead of generic `import("better-auth").User`. Removed `as Record<string, unknown>` casts in `middleware.ts` and `AdminLayout.astro`. `auth-guard.ts` narrowed to `{ role?: string }` (return type still `Record<string, unknown>` for API route compatibility). ([`env.d.ts`], [`src/middleware.ts`], [`src/layouts/AdminLayout.astro`], [`src/lib/auth-guard.ts`])
- **MAINT-01 [MEDIUM]**: Eliminated `any` types across the codebase. Changed `requireAdmin` signature to accept `App.Locals` directly, removing ~40 `as any` casts from API routes. Replaced `catch (error: any)` with `catch (error: unknown)` + `instanceof Error` guards (4 files). Added `NotificationRow` interface for D1 query results. Changed `d1All<T = any>` to `d1All<T>`. Replaced D1 result `(x as any).results` with typed `{ results?: unknown[] }` casts (stats.ts). Enabled `@typescript-eslint/no-explicit-any` as `"warn"` in ESLint. 2 unavoidable `as any` retained with eslint-disable comments (drizzle-orm D1Database type mismatch, Resend SDK internal API). ([`eslint.config.js`], [`src/lib/auth-guard.ts`], [`src/lib/db/index.ts`], [`src/pages/api/notifications/latest.ts`], [`src/pages/api/notifications/stats.ts`], [`src/pages/api/notifications/channels/[id].ts`], [`src/pages/api/tags/index.ts`], [`src/pages/api/tags/[id].ts`], [`src/pages/api/product-categories/index.ts`], [`src/pages/api/product-categories/[id].ts`], [`src/pages/api/media/index.ts`], [`src/pages/sitemap.xml.ts`], [`src/lib/build-data.ts`], [`src/lib/__tests__/sanitize.test.ts`], [`src/lib/auth.ts`], [`src/lib/notification/email.service.ts`])
- **PERF-02 [MEDIUM]**: Integrated Cloudflare Images optimization via `/cdn-cgi/image/` endpoint. Created `image-optimize.ts` utility with `optimizeImage()` function and preset configurations (logo, article, thumbnail, og). Applied to site logo in `BaseLayout.astro` and article content images in `article/[slug].astro` (with `loading="lazy"`). Admin preview images intentionally not optimized (low traffic, no performance benefit). Skips data URIs, relative paths, and already-optimized URLs. ([`src/lib/image-optimize.ts`], [`src/layouts/BaseLayout.astro`], [`src/pages/article/[slug].astro`])

### React Performance (Vercel Best Practices)

- **async-parallel [CRITICAL]**: Eliminated request waterfalls in `NewsForm.tsx` (tags + article fetch), `ProductForm.tsx` (categories + product fetch), and `NotificationChannels.tsx` (settings + channels load). Merged independent sequential useEffect/fetch calls into `Promise.all()` for parallel execution. ([`src/components/admin/NewsForm.tsx`], [`src/components/admin/ProductForm.tsx`], [`src/components/admin/settings/NotificationChannels.tsx`])
- **bundle-dynamic-imports [CRITICAL]**: Converted static imports to `React.lazy()` + `Suspense` for conditionally-rendered heavy components: `MediaPicker` in `NewsForm.tsx`, `UploadModal` and `MediaPreviewModal` in `MediaLibrary.tsx`. Reduces initial bundle size. ([`src/components/admin/NewsForm.tsx`], [`src/components/admin/media/MediaLibrary.tsx`])
- **js-combine-iterations [HIGH]**: Fixed O(n²) algorithm in `NotificationDashboard.tsx` where `Math.max()` was computed inside `.map()` callbacks (daily trend and by-event-type charts). Extracted `maxVal`/`maxEventTotal` computation outside the loop. ([`src/components/admin/settings/NotificationDashboard.tsx`])
- **rendering-hoist-jsx [MEDIUM]**: Extracted ~65 static CSSProperties objects from component bodies to module-level constants across 9 components (MediaPreviewModal 16, MediaLibrary 14, UploadModal 11, NotificationChannels 9, NotificationTemplates 7, NotificationDashboard 4, NotificationLogs 4, SocialLinksManager 2, LoginForm 1). Objects dependent on state/props retained inside components. ([9 component files])
- **rerender-functional-setstate [MEDIUM]**: Converted 6 `setState` calls from closure-captured state reads to functional updater form in `SocialLinksManager.tsx` (3 calls) and `NotificationChannels.tsx` (3 calls). Prevents stale state in rapid successive updates. ([`src/components/admin/settings/SocialLinksManager.tsx`], [`src/components/admin/settings/NotificationChannels.tsx`])
- **rendering-conditional-render [MEDIUM]**: Replaced `{x && <div>}` with `{x ? <div> : null}` ternary expressions in `NewsForm.tsx`, `ProductForm.tsx`, `LoginForm.tsx`, `NotificationLogs.tsx` (4 instances). ([4 component files])
- **rerender-defer-reads [MEDIUM]**: Replaced `loading` state dependency in `MediaPicker.tsx` `useCallback` with `useRef(false)`. Prevents unnecessary callback recreation and IntersectionObserver re-initialization on loading state changes. ([`src/components/admin/media/MediaPicker.tsx`])
- **rerender-move-effect-to-event [MEDIUM]**: Moved `currentEventType` change handler state synchronization from `useEffect` to direct event handler in `NotificationTemplates.tsx`. Removed `currentEventType` from effect dependencies. ([`src/components/admin/settings/NotificationTemplates.tsx`])
- **Shared utilities**: Extracted duplicated `escHtml` function from 4 settings components into `shared-utils.ts`. ([`src/components/admin/settings/shared-utils.ts`])
- **MAINT-01 follow-up**: Reduced `any` usage from 32 to 14 (all justified). Replaced `res.json() as any` with `Record<string, unknown>` (5 files). Added `StatRow` interface in NotificationDashboard. Added `TemplateCacheItem` inline type in NotificationTemplates. Replaced `(data as any).error` with type-safe error access (5 Astro files). Added eslint-disable comments to 6 `(window as any)` patterns for Astro inline script globals. ([11 component files])

### Tests

- Added 2 test cases to `sanitize.test.ts` for about-page story body XSS vectors (script tag injection, inline event handler stripping).
- Added 4 test cases to `rate-limit.test.ts` for auth endpoint rate limiting (sign-in, sign-up, forget-password limits and bucket isolation).

## [0.3.0] - 2026-04-13 02:02

### Features

- **v3.0: Page Content Management** — All public page text now editable from Admin backend.
  - New `page_sections` table (migrations/0014) with page/section/field structure
  - New `GET/PUT /api/page-content` endpoints for reading/writing page content
  - Admin UI: `PageContentSection` accordion component with per-page editing panels
  - Homepage: hero title/subtitle/CTA, solutions bar, CTA section — all from build-data
  - About page: hero, company story (body), contact info — all from build-data
  - Services page: hero, dynamic service items (item_1~N) — all from build-data
  - All fields have safe defaults (original hardcoded text as fallback)

- **v3.0: Privacy Policy & Terms & Conditions pages** — New static pages for legal compliance.
  - New `/privacy` page (prerender=true, content from build-data)
  - New `/terms` page (prerender=true, content from build-data)
  - Page visibility: `privacy_enabled`/`terms_enabled` settings control 404 behavior
  - Footer links: conditional Privacy/Terms links based on enabled settings
  - Sitemap: both pages included with yearly changefreq

- **v3.0: Google Analytics integration** — Conditional GA script injection.
  - `ga_measurement_id` setting in Admin (AnalyticsSettingsSection component)
  - GA scripts injected via `set:html` in BaseLayout (CSP-safe, no unsafe-inline needed)
  - CSP updated: script-src/connect-src/img-src allow Google Analytics domains
  - GA disabled by default (empty measurement ID = no scripts loaded)

### New Files (8)
- `migrations/0014_page_sections.sql` — page_sections table + initial data
- `migrations/0015_v3_settings.sql` — ga_measurement_id, privacy_enabled, terms_enabled
- `src/pages/api/page-content.ts` — GET/PUT page content API
- `src/pages/privacy.astro` — Privacy Policy page
- `src/pages/terms.astro` — Terms & Conditions page
- `src/components/admin/settings/PageContentSection.astro` — Page content editor
- `src/components/admin/settings/AnalyticsSettingsSection.astro` — GA settings

### Modified Files (12)
- `src/lib/db/schema/index.ts` — pageSections table definition
- `scripts/export-build-data.mjs` — page_sections query + pages nested structure
- `scripts/generate-mock-data.mjs` — page sections mock data (59 records)
- `src/lib/build-data.ts` — pages interface + getPageContent() + getGaMeasurementId()
- `src/pages/api/settings.ts` — ALLOWED_KEYS +3 (ga_measurement_id, privacy_enabled, terms_enabled)
- `src/pages/index.astro` — hero/solutions/CTA from build-data
- `src/pages/about.astro` — hero/story/contact from build-data
- `src/pages/services.astro` — hero + dynamic service items from build-data
- `src/layouts/BaseLayout.astro` — GA injection + Footer Privacy/Terms links
- `src/middleware.ts` — PAGE_VISIBILITY_MAP +2, CSP +3 GA domains
- `src/pages/sitemap.xml.ts` — /privacy + /terms entries
- `src/pages/admin/settings/index.astro` — integrated PageContentSection + AnalyticsSettingsSection

## [Unreleased]

### Improvements

- **v2.0**: Add solutions table to build-data pipeline. ([`scripts/export-build-data.mjs`], [`scripts/generate-mock-data.mjs`])
  - `export-build-data.mjs` now queries `SELECT id, slug, industry, title, content FROM solutions`
  - `generate-mock-data.mjs` generates 6 industry solutions (data-centers, healthcare, industrial, telecommunications, finance, government)
  - `build-data.json` now includes `solutions` array with id, slug, industry, title, content
  - Prerequisite for v2.0 full static-ization: solutions pages can now read from build-data instead of D1
  - Build verified: 6 solutions exported, 73 static files
- **v2.0**: Migrate solutions/[industry].astro to build-data primary. ([`src/pages/solutions/[industry].astro`])
  - Removed D1 runtime query (getDBFromEnv, getEnv, drizzle-orm, solutions schema)
  - Data now reads from build-data.json `solutions` array (zero D1 queries at build time)
  - Retains hardcoded fallback when build-data has no matching solution
  - 4 imports removed, 14 lines of D1 query code removed
  - Build verified: 73 static files
- **v2.0**: Complete build-data.ts with type-safe convenience getters. ([`src/lib/build-data.ts`])
  - Updated `BuildData` interface: added `solutions`, `news.tags`, `products.description` fields
  - Added 8 getter functions: `getProducts()`, `getNews()`, `getSolutions()`, `getProductCategories()`, `getNewsTags()`, `getSetting(key)`, `getSettings()`, `getDomains()`
  - All getters are async (lazy-load from build-data.json), return typed data
  - Pages can now use `import { getProducts } from '../../lib/build-data'` instead of raw JSON import
  - Build verified: 73 static files, 0 D1 dependencies
- **v2.0**: Migrate product and article detail pages to build-data primary. ([`src/pages/product/[slug].astro`], [`src/pages/article/[slug].astro`])
  - `product/[slug].astro`: removed D1 query (getDBFromEnv, getEnv, drizzle-orm, products schema), now reads from build-data.json
  - `article/[slug].astro`: removed D1 query + tag join (getDBFromEnv, getEnv, drizzle-orm, newsPosts/tags/newsPostTags schema), now reads from build-data.json with inline tags
  - Both: 5 imports removed each, ~40 lines of D1 code removed total
  - **All public pages now have ZERO D1 runtime dependencies** — fully static prerender
  - Build verified: 73 static files, 0 D1 imports across all public pages
- **v2.0**: Integrate page visibility control into middleware. ([`src/middleware.ts`])
  - Added `isPageEnabled()` call in request pipeline (after domain isolation, before auth)
  - `PAGE_VISIBILITY_MAP` maps 4 sections to setting keys: `/news` → `news_enabled`, `/products` → `products_enabled`, `/solutions` → `solutions_enabled`, `/services` → `services_enabled`
  - Disabled pages return 404 (including all sub-paths, e.g. `/news/xxx`)
  - Fail-open: if D1 is unavailable, pages remain visible
  - Uses KV cache via `batchGetSettings` (5-min TTL)
  - Build verified: 73 static files
- **v2.0**: Migrate products and news list pages to build-data primary. ([`src/pages/products/index.astro`], [`src/pages/news/index.astro`])
  - `products/index.astro`: removed D1 query (getDBFromEnv, getEnv, drizzle-orm, products/productCategories schema), now reads from build-data.json
  - `news/index.astro`: removed D1 query + batch tag loading (getDBFromEnv, getEnv, drizzle-orm, newsPosts/tags/newsPostTags schema), now reads from build-data.json with inline tags
  - Both pages: 4 imports removed each, ~30 lines of D1 code removed total
  - Pagination and category/tag navigation preserved
  - Build verified: 73 static files, 0 D1 dependencies

- **SEO-01**: Dynamic robots.txt — domain now read from build-data instead of hardcoded. ([`src/pages/robots.txt.ts`], [`public/robots.txt` deleted])
- **A11Y-01**: Added Skip Links to BaseLayout and AdminLayout for keyboard navigation. ([`src/layouts/BaseLayout.astro`], [`src/layouts/AdminLayout.astro`], [`src/styles/global.css`])
- **A11Y-02**: Added `for`/`id` label associations to public page forms (product quote form + article comment form). ([`src/pages/product/[slug].astro`], [`src/pages/article/[slug].astro`])
- **PERF-05**: Added React ErrorBoundary component wrapping LoginForm and MediaLibrary. ([`src/components/ErrorBoundary.tsx`], [`src/pages/login.astro`], [`src/pages/admin/media/index.astro`])
- **DX-04**: Removed 4 debug `console.log` statements from AdminLayout (kept `console.error`). ([`src/layouts/AdminLayout.astro`])
- **DB-02**: Added idempotency notes to migrations 0004/0005/0006 (Wrangler D1 tracks applied migrations, so re-execution is not possible). ([`migrations/0004_users_updated_at.sql`], [`migrations/0005_better_auth_columns.sql`], [`migrations/0006_session_user_agent.sql`])
- **SEC-05 [MEDIUM]**: Aligned CSP directives with actual code usage. ([`astro.config.mjs`])
  - Added `script-src 'self' 'unsafe-inline'` (admin settings use inline onclick handlers, BaseLayout uses `<script is:inline>`)
  - Added `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` (726 inline styles, Google Fonts CSS)
  - Added `blob:` to `img-src` (R2 media preview uses blob URLs)
  - Previously CSP was missing script-src/style-src, causing all inline content to be blocked by `default-src 'self'`
  - Note: `'unsafe-inline'` is a temporary measure. Future migration to nonce/hash after PERF-01 (inline style refactor)
  - Build verified: 73 static files

## [0.1.1] - 2026-04-12 23:45

### Bug Fixes

- **SEC-01 [CRITICAL]**: Fix middleware.ts `pathname` variable used before definition (TDZ ReferenceError).
- **SEC-02 [HIGH]**: Fix DomainIsolationSection innerHTML XSS vulnerability.
- **SEC-03 [HIGH]**: Add authentication to 4 unprotected API GET endpoints.
- **SEC-04 [MEDIUM]**: Add Zod validation to 5 PUT endpoints missing input validation.
- **SEC-06 [MEDIUM]**: Fix queue consumer error handling — retryable errors now trigger Cloudflare Queue retry.
- **SEC-09 [MEDIUM]**: Add key whitelist to notification settings PUT endpoint.
- **DB-01 [CRITICAL]**: Fix passkey migration wrong table reference `user` → `users`.

## [0.1.0] - 2026-04-12 22:55

### Features

> **Phase 5 Complete — Theme System** (THEME-01 ~ THEME-09, 15 commits)
> Full CSS custom property token system with brand color/font customization, dark mode
> (system + manual toggle, admin-controllable), semantic admin colors, and zero hardcoded values in `src/`.

- **THEME-09 [HIGH]**: Admin-controllable dark mode toggle setting. ([`migrations/0013_dark_mode_setting.sql`], [`src/pages/api/settings.ts`], [`src/components/admin/settings/ThemeSection.astro`], [`src/layouts/BaseLayout.astro`], [`src/styles/dark-mode.css`], [`src/styles/global.css`], [`scripts/export-build-data.mjs`], [`scripts/generate-mock-data.mjs`], [`env.d.ts`])
  - New setting `dark_mode_enabled` (default: `"false"`) — controls whether dark mode is available on the public site
  - DB migration 0013: `INSERT OR IGNORE INTO site_settings (key, value) VALUES ('dark_mode_enabled', 'false')`
  - Added to API `ALLOWED_KEYS` whitelist
  - Admin UI: checkbox toggle in ThemeSection with description text
  - When disabled (default):
    - Theme-toggle button is NOT rendered in `<nav>` (conditional `{darkModeEnabled && ...}`)
    - Dark mode CSS is NOT injected (extracted to `dark-mode.css`, conditionally loaded via `?raw` import)
    - `prefers-color-scheme: dark` has no effect (no dark CSS variables defined)
    - Site is always in light mode
  - When enabled:
    - Toggle button appears in nav (desktop + mobile hamburger menu)
    - Full dark mode CSS injected (media query + `.dark` class)
    - Three modes: light, dark, system (follows OS preference)
  - Admin panel is unaffected — dark mode toggle always available there (AdminLayout has its own independent toggle)
  - Extracted dark mode CSS from `global.css` to `dark-mode.css` for conditional loading
  - Added `*.css?raw` module declaration in `env.d.ts` for Vite raw import
  - Build verified: `dark_mode_enabled=false` → no dark CSS, no toggle button in HTML, 73 static files
  - **Follow-up**: conditionalized theme toggle JS — when disabled, zero `prefers-color-scheme`/`localStorage`/`theme-toggle` references in built HTML

- **THEME-07 [LOW]**: Warning color tokens + admin component hardcoded color cleanup. ([`src/styles/global.css`], [`src/components/admin/settings/DomainIsolationSection.astro`], [`src/components/admin/settings/ThemeSection.astro`], [`src/components/admin/settings/SiteBrandingSection.astro`])
  - Added `--color-warning-text` (#92400e), `--color-warning-bg` (#fef3c7), `--color-warning-border` (#fde68a) in `:root`
  - Added dark mode overrides: `--color-warning-text: #fcd34d`, semi-transparent bg/border
  - Replaced 13 hardcoded hex colors across 3 admin components:
    - DomainIsolationSection: success/warning status banners + error/success JS status colors
    - ThemeSection: error/success JS status colors
    - SiteBrandingSection: error/success JS status colors
  - Admin components: zero hardcoded hex colors (except doc example values `#059669`, `#2563eb`)
  - Build verified: `--color-warning-bg` in CSS bundle, 73 static files

- **THEME-08 [MEDIUM]**: JS/HTML inline hardcoded color cleanup — entire `src/` tokenized. ([`src/pages/article/[slug].astro`], [`src/pages/product/[slug].astro`], [`src/pages/404.astro`], [`src/pages/500.astro`], [`src/pages/admin/quotes/index.astro`], [`src/pages/admin/solutions/edit.astro`], [`src/layouts/AdminLayout.astro`])
  - Replaced 13 hardcoded hex colors in JS inline styles and HTML attributes:
    - `article/[slug].astro`: `#15803d` → `var(--color-success-text)` (2 comment success messages)
    - `product/[slug].astro`: `#15803d` → `var(--color-success-text)`, `#b91c1c` → `var(--color-danger-text)` (3 form messages)
    - `404.astro` / `500.astro`: `#64748b` → `var(--color-text-tertiary)` (description text)
    - `quotes/index.astro`: status color map → semantic tokens (new/info, contacted/warning, quoted/brand, closed/tertiary)
    - `solutions/edit.astro`: `#065f46` → `var(--color-brand-600)` (input focus outline)
    - `AdminLayout.astro`: `#065f46`/`#dc2626`/`#9ca3af` → brand-800/danger/tertiary (notification status colors)
  - **Milestone**: entire `src/` directory now uses CSS custom properties for all colors (except `global.css` token definitions and doc example values)
  - Build verified: 73 static files

- **THEME-01 [HIGH]**: Theme system — brand color + font family customization with build-time CSS injection. ([`scripts/inject-theme.mjs`], [`src/styles/global.css`], [`src/components/admin/settings/ThemeSection.astro`], [`migrations/0012_theme_settings.sql`], [`src/pages/api/settings.ts`], [`scripts/generate-mock-data.mjs`], [`scripts/export-build-data.mjs`])
  - Created `scripts/inject-theme.mjs`: reads `theme_brand_color` and `theme_font_family` from build-data.json, generates `src/styles/theme-overrides.css`
  - Brand color: single hex input → auto-generates full 10-level palette (50-900) via HSL manipulation
  - Font family: free-text CSS font-family string
  - `global.css` imports `theme-overrides.css` at the end (overrides default `:root` tokens)
  - DB migration 0012: adds `theme_brand_color` and `theme_font_family` to `site_settings`
  - API: added theme keys to `ALLOWED_KEYS` whitelist
  - Admin UI: `ThemeSection` component with color picker + text input sync, live palette preview, font preview
  - `build:mock` now runs `inject-theme.mjs` after generating mock data
  - New `build:theme` npm script for standalone theme injection
  - `export-build-data.mjs`: added theme keys to D1 settings query (synced with mock data)
  - **Verified with custom theme** (#2563eb blue + Inter font): palette correctly generated, colors appear in built HTML, 73 static files no regression

- **THEME-02 [MEDIUM]**: CSS design tokens — radius and shadow custom properties. ([`src/styles/global.css`], [`src/layouts/BaseLayout.astro`], [`src/layouts/AdminLayout.astro`], 13 page/component files)
  - Added `:root` tokens: `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), `--radius-xl` (12px), `--radius-full` (9999px)
  - Added `:root` tokens: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  - Updated global utility classes to use tokens: `.card`, `.badge-gray`, `.btn-primary/secondary`, `.input`
  - Migrated ~100 inline `border-radius` across entire `src/` in 3 batches:
    - Batch 1: 3 high-traffic public pages (article, product, news tag page) — 24 replacements
    - Batch 2: 7 remaining public pages — 17 replacements
    - Batch 3: 9 admin pages + 3 admin components + 2 layouts — ~60 replacements
  - Fixed JS template strings with no-space patterns (`border-radius:9999px`, `border-radius:4px`)
  - Intentionally kept: `border-radius: 50%` (avatar circles), `border-radius: 1px` (tooltip arrows)
  - **Final result**: zero hardcoded `border-radius` in entire `src/` (except `50%` and `1px`)

- **THEME-03 [HIGH]**: Dark mode support via `prefers-color-scheme`. ([`src/styles/global.css`], 16 `.astro` files)
  - Added `@media (prefers-color-scheme: dark)` block in global.css with dark palette:
    - Surface: `#0f172a` / `#1e293b` / `#334155` (Slate 900/800/700)
    - Border: `#475569` / `#334155` (Slate 600/700)
    - Text: `#f1f5f9` / `#cbd5e1` / `#94a3b8` (Slate 50/200/400)
    - Shadows: increased opacity for dark backgrounds
  - Added `--color-text-inverse` token (white text on brand-colored buttons)
  - Replaced all `color: #fff` / `color: white` → `var(--color-text-inverse)` (32 occurrences across 16 files)
  - Fixed 404/500 pages: `background: #2563eb` → `var(--color-brand-600)`
  - Brand colors unchanged in dark mode (emerald works on dark backgrounds)
  - Public pages: zero hardcoded background colors remaining
  - Build verified: `@media(prefers-color-scheme:dark)` present in CSS bundle, 73 static files

- **THEME-04 [MEDIUM]**: Semantic color tokens for admin — dark mode hover adaptation. ([`src/styles/global.css`], 7 admin `.astro` files)
  - Added 14 semantic tokens in `:root`: danger/info/success (text, bg, border) + stat colors (blue, green, purple, amber)
  - Added dark mode overrides: lighter text colors, semi-transparent bg/border for hover states
  - Replaced 21 hardcoded hex colors across 7 admin files
  - Admin pages: zero hardcoded hex colors remaining
  - Build verified: semantic tokens in CSS bundle with dark mode overrides, 73 static files

- **THEME-05 [LOW]**: Remove unused Tailwind CSS dependency. ([`astro.config.mjs`], [`package.json`])
  - `@tailwindcss/vite` was installed and registered as Vite plugin but never used (0 Tailwind directives, 0 utility classes in src/)
  - Removed `import tailwindcss` and `plugins: [tailwindcss()]` from astro.config.mjs
  - Uninstalled `@tailwindcss/vite` (removed 9 packages)
  - Build verified: 73 static files, no regression, 15.30s

- **THEME-06 [HIGH]**: Manual dark mode toggle — desktop + mobile. ([`src/styles/global.css`], [`src/layouts/BaseLayout.astro`])
  - Added `:root.dark` CSS selector (same values as `prefers-color-scheme:dark`, higher priority when user explicitly toggles)
  - Toggle button with sun/moon SVG icons in site header
  - Desktop: button visible in nav bar alongside navigation links
  - Mobile: button inside `<nav>`, visible in hamburger menu with margin spacing
  - JS logic: `localStorage.setItem('theme', 'light'|'dark')`, `document.documentElement.classList.toggle('dark')`
  - Three modes: `light` (manual), `dark` (manual), `system` (default, follows `prefers-color-scheme`)
  - System preference listener: auto-updates when OS changes in `system` mode
  - Build verified: `:root.dark` + `@media(prefers-color-scheme:dark)` both in CSS bundle, 73 static files

- **E2E-01 [HIGH]**: End-to-end verification — full static generation with mock data. ([`docs/e2e-verification-report.md`])
  - Clean rebuild: `rm -rf dist && build:mock && build` → 73 static files in 17.92s
  - Page completeness: 5 core + 6 solutions + 20 products + 15 articles + 12 category pages + 12 tag pages + sitemap
  - Content completeness: product pages have title/summary/description/quote form; article pages have title/summary/TipTap content/tags/comments
  - SEO: sitemap with 46 URLs at powertech.example.com, Product/Article/Breadcrumb JSON-LD schemas, OG meta tags
  - Route correctness: zero legacy detail links, middleware 301 redirects compiled in server bundle
  - Branding: PowerTech Solutions injected from build-data settings
  - Formal verification report archived at `docs/e2e-verification-report.md`

- **HYBRID-10 [MEDIUM]**: CI pipeline — mock data generation + comprehensive static output verification. ([`.github/workflows/ci.yml`])
  - Added `build:mock` step before build: generates mock build-data.json for full prerendered output
  - PR builds now produce 73 static files (was 18 without mock data)
  - Verify static output: checks total >= 70 files, 6 critical pages, product/article/category/tag pages
  - Content verification: branding injection (`PowerTech Solutions`) and sitemap domain (`powertech.example.com`)
  - Fixed D1 verification script: updated paths from `/products/[slug]` to `/product/[slug]` and `/news/[slug]` to `/article/[slug]`
  - Local simulation passed: 73 files, 20 products, 15 articles, 12 categories, 12 tags, branding ✓, domain ✓

- **HYBRID-09 [MEDIUM]**: Extend export-build-data.mjs with full product/news data. ([`scripts/export-build-data.mjs`])
  - Products: added `description` field (HTML content for prerendered detail pages)
  - News: added `content` field (TipTap JSON for prerendered article pages)
  - News: added `tags` array via JOIN on `news_post_tags` + `tags` tables
  - News query now includes `id` field for tag association lookup
  - Output now matches mock data generator structure — `build:full` will produce same quality static pages as `build:mock`
  - Build verified: 73 static files, content intact

- **ROUTE-03 [LOW]**: Update notification template example URLs to match new routes. ([`src/components/admin/settings/settings-shared.ts`])
  - `commentUrl`: `/news/how-to-choose-ups` → `/article/how-to-choose-ups` (2 occurrences)
  - `newsUrl`: `/news/new-launch` → `/article/new-launch`
  - `productUrl`: `/products/ups-3000va` → `/product/ups-3000va` (leftover from ROUTE-01)
  - Verified: zero legacy `/news/[slug]` or `/products/[slug]` example URLs remain in src/

- **ROUTE-02 [HIGH]**: Fix news article vs tag route conflict — move to `/article/[slug]`. ([`src/pages/article/[slug].astro`], [`src/pages/news/[slug].astro` (deleted)], [`src/pages/news/index.astro`], [`src/pages/news/[tag]/index.astro`], [`src/pages/news/[tag]/[page].astro`], [`src/pages/sitemap.xml.ts`], [`src/middleware.ts`])
  - Same pattern as ROUTE-01: `/news/[slug]` and `/news/[tag]` competed for same URL path
  - Moved article detail page to `/article/[slug]`, freeing `/news/[tag]` for tag pages
  - Updated article card links in 3 list pages: `/news/${slug}` → `/article/${slug}`
  - Updated sitemap: article URLs now use `/article/[slug]`
  - Middleware: 301 redirect legacy `/news/[slug]` → `/article/[slug]`
  - All 6 tag pages confirmed generating (product-launch, data-center, sustainability, partnership, industry-trends, all)
  - Build verified: 73 static files, 15 article details at `/article/`, 12 tag/pagination pages at `/news/*/`

- **ROUTE-01 [HIGH]**: Fix product detail vs category route conflict — move to `/product/[slug]`. ([`src/pages/product/[slug].astro`], [`src/pages/products/[slug].astro` (deleted)], [`src/pages/products/index.astro`], [`src/pages/products/[category]/index.astro`], [`src/pages/products/[category]/[page].astro`], [`src/pages/sitemap.xml.ts`], [`src/middleware.ts`])
  - **Root cause**: `/products/[slug].astro` and `/products/[category]/index.astro` competed for the same URL path — Astro resolved in favor of `[slug]`, preventing ALL 6 category pages from generating
  - **Fix**: moved product detail page to `/product/[slug]` (singular), freeing `/products/[category]` for category pages
  - Deleted `src/pages/products/[slug].astro`, created `src/pages/product/[slug].astro`
  - Updated product card links in 3 list pages: `/products/${slug}` → `/product/${slug}`
  - Updated sitemap: product URLs now use `/product/[slug]`
  - Middleware: 301 redirect legacy `/products/[slug]` → `/product/[slug]` (preserves SEO)
  - **Result**: all 6 category pages now generate correctly (ups-systems, pdu, power-distribution, racks, cooling, all)
  - Build verified: 73 static files, 20 product details at `/product/`, 12 category/pagination pages at `/products/*/`

- **HYBRID-08 [HIGH]**: Full content in prerendered detail pages via build-data fallback. ([`scripts/generate-mock-data.mjs`], [`src/pages/products/[slug].astro`], [`src/pages/news/[slug].astro`])
  - Mock data generator now includes complete product data (description HTML, category) and news data (TipTap JSON content, tags)
  - Product detail page: when D1 unavailable, loads `{ name, summary, description }` from build-data
  - News detail page: when D1 unavailable, loads `{ title, summary, content, publishedAt, tags }` from build-data
  - News content rendered through existing TipTap JSON→HTML pipeline (renderTiptapJson)
  - Structured data (JSON-LD) now works in prerendered pages (Article/Product schema)
  - Quote request form and comments section rendered in prerendered pages
  - Verified: product pages contain "Key Features", "Technical Specifications"; news pages contain "Key Highlights", tag badges

- **HYBRID-07 [HIGH]**: Mock data generator and end-to-end build verification. ([`scripts/generate-mock-data.mjs`], [`src/pages/**/*.astro`], [`src/pages/sitemap.xml.ts`])
  - Created `scripts/generate-mock-data.mjs`: generates realistic `build-data.json` with 20 products, 15 news, 5 categories, 5 tags, branding, and domain settings
  - **Critical fix**: replaced all 24 `require()` calls with `await import()` across 11 files — `require()` was silently failing in Vite/Astro build, causing zero product/news detail pages to generate
  - `getStaticPaths` in 4 files changed from sync to async (Astro supports async getStaticPaths)
  - End-to-end verified with mock data: **73 static files** generated (up from 18 without data)
    - 20 product detail pages, 15 news detail pages
    - 32 product category/pagination pages, 27 news tag/pagination pages
    - 6 solution pages, 5 core pages, sitemap.xml
  - Sitemap uses `powertech.example.com` from build-data (not hardcoded fallback)
  - Branding: `PowerTech Solutions` appears in index.html from build-data settings
  - Added `build:mock` npm script for convenience

- **DOMAIN-02 [MEDIUM]**: Admin UI for domain isolation configuration. ([`src/components/admin/settings/DomainIsolationSection.astro`], [`src/pages/admin/settings/index.astro`], [`src/pages/api/settings.ts`])
  - New `DomainIsolationSection` component in Admin → Settings
  - Input fields for `public_domain` and `admin_domain` with normalization (strips protocol/trailing slash)
  - Real-time status indicator: shows active/disabled state with color-coded banner
  - API: added `public_domain` and `admin_domain` to `ALLOWED_KEYS` whitelist
  - Save triggers KV cache invalidation (same pattern as other settings)
  - Build verified: component compiled in server chunk, API keys in settings bundle

- **DOMAIN-01 [HIGH]**: Dual-domain isolation — separate public and admin domains. ([`migrations/0011_domain_isolation.sql`], [`src/middleware.ts`], [`src/pages/sitemap.xml.ts`], [`src/lib/build-data.ts`], [`scripts/export-build-data.mjs`])
  - DB migration: adds `public_domain` and `admin_domain` to `site_settings`
  - Middleware: when both domains configured, blocks `/admin/*` and `/api/*` on public domain (404), redirects public pages on admin domain (301)
  - Middleware: domain settings read from KV cache (fast, no extra D1 query per request)
  - Sitemap: uses `public_domain` from build-data when available
  - Export script: includes domain settings in `build-data.json`
  - Build-data type: added `domains: { public, admin }` field
  - Zero breakage: when domains not configured, behavior is unchanged
  - Build verified: 18 static files, domain isolation code in middleware bundle

- **HYBRID-06 [MEDIUM]**: CI pipeline update — static output verification and D1-powered build. ([`.github/workflows/ci.yml`])
  - Added "Verify static output" step: checks 6 critical pages exist after build
  - Added build artifact upload (7-day retention) for debugging
  - Added `build-with-d1-data` job: runs `build:full` (export + build) on push to main
    - Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets
    - Verifies product/news detail pages are generated from D1 data
  - PR builds use `npm run build` only (no D1 access needed)
  - Local simulation verified: 18 static files, all 6 critical pages present

- **HYBRID-05 [HIGH]**: News list page route refactoring — query params to path params for static generation. ([`src/pages/news/index.astro`], [`src/pages/news/[tag]/index.astro`], [`src/pages/news/[tag]/[page].astro`], [`src/pages/news/[slug].astro`])
  - `/news` → prerendered "all news" page (page 1)
  - `/news/[tag]` → prerendered tag-filtered page (page 1), tags from build-data
  - `/news/[tag]/[page]` → prerendered paginated pages (page 2+, max 10)
  - All 3 new routes use D1-first with build-data fallback
  - Updated `news/[slug].astro` tag links from `/news?tag=X` to `/news/X`
  - Middleware 301 redirect (added in HYBRID-04) now has matching routes
  - Build verified: 18 static HTML/XML files (3 new news tag pages)

- **HYBRID-04 [HIGH]**: Product list page route refactoring — query params to path params for static generation. ([`src/pages/products/index.astro`], [`src/pages/products/[category]/index.astro`], [`src/pages/products/[category]/[page].astro`], [`src/middleware.ts`])
  - `/products` → prerendered "all products" page (page 1)
  - `/products/[category]` → prerendered category page (page 1), categories from build-data
  - `/products/[category]/[page]` → prerendered paginated pages (page 2+, max 10)
  - All 3 new routes use D1-first with build-data fallback
  - Middleware: 301 redirect legacy `/products?category=X&page=Y` → `/products/X/Y`
  - Middleware: 301 redirect legacy `/news?tag=X&page=Y` → `/news/X/Y` (prepared for next iteration)
  - Build verified: 15 static files (3 new product category pages)
  - Fixed duplicate `pathname` variable declaration in middleware

- **HYBRID-03 [MEDIUM]**: Inject build-data branding into prerendered pages. ([`src/pages/index.astro`], [`src/pages/about.astro`], [`src/pages/services.astro`], [`src/pages/solutions/[industry].astro`])
  - All 4 prerendered page groups now pass `buildData={{ settings }}` to BaseLayout
  - About and Solutions pages read `site_name` from build-data (fallback: `'YourCompany'`)
  - When `build-data.json` is present (after `build:export`), prerendered pages reflect admin-configured branding
  - When absent, pages use hardcoded defaults — zero breakage for existing workflows
  - Build verified: 12 static files generated, `site_name` key present in HTML output

- **HYBRID-02 [HIGH]**: Build-time data pipeline — export D1 data for prerendered pages. ([`scripts/export-build-data.mjs`], [`src/pages/products/[slug].astro`], [`src/pages/news/[slug].astro`], [`src/pages/sitemap.xml.ts`], [`package.json`])
  - Created `scripts/export-build-data.mjs`: exports products, news, categories, tags, settings from D1 to `src/data/build-data.json`
  - Supports `--remote` (production D1) and `--local` (local D1) modes
  - Products/news detail pages: `getStaticPaths()` now reads slug list from `build-data.json` (fail-open when file absent)
  - Sitemap: converted from SSR API route to prerendered static XML, reads products/news from `build-data.json`
  - Added npm scripts: `build:export`, `build:export:local`, `build:full` (export + build)
  - Build verified: sitemap.xml is valid XML with 11 URLs; product/news pages gracefully skip when no build-data

- **HYBRID-01 [HIGH]**: Enabled hybrid rendering — static prerender for public pages, SSR for admin/API. ([`astro.config.mjs`], [`src/layouts/BaseLayout.astro`], [`src/pages/index.astro`], [`src/pages/about.astro`], [`src/pages/services.astro`], [`src/pages/solutions/[industry].astro`], [`src/pages/products/[slug].astro`], [`src/pages/news/[slug].astro`])
  - Astro 6 default hybrid mode: pages with `prerender = true` are statically generated, others remain SSR
  - `@astrojs/cloudflare@13.1.8` workerd prerenderer handles static page generation (no patch-package needed)
  - BaseLayout dual-track: accepts optional `buildData` prop for prerender mode, falls back to D1/KV for SSR
  - Prerendered pages: `/`, `/about`, `/services`, `/solutions/[industry]` (6 pages via getStaticPaths)
  - Products/news detail pages: `prerender = true` with empty `getStaticPaths` (placeholder for next iteration)
  - Added `src/lib/build-data.ts` utility module for build-time data access
  - Fixed 3 pages missing `prerender = false` (`login.astro`, `admin/news/new.astro`, `admin/products/new.astro`)
  - Build verified: 11 static HTML files generated, admin/API routes remain SSR

- **BRAND-01 [HIGH]**: Added dynamic site branding management. Site name, description, logo, favicon, and OG image are now managed via Admin → Settings → Site Branding instead of hardcoded. ([`migrations/0010_site_branding.sql`], [`src/components/admin/settings/SiteBrandingSection.astro`], [`src/pages/api/settings.ts`], [`src/layouts/BaseLayout.astro`], [`src/layouts/AdminLayout.astro`])
  - New `site_settings` entries: `site_name`, `site_description`, `site_logo_url`, `site_favicon_url`, `site_og_image_url`
  - Settings API upgraded to UPSERT (`INSERT ... ON CONFLICT DO UPDATE`) with key whitelist validation (22 allowed keys)
  - KV cache auto-invalidation on settings update (`kv.list({ prefix: "settings:batch:" })` + batch delete)
  - Drizzle ORM schema now includes `siteSettings` table definition
  - BaseLayout reads branding settings via `batchGetSettings` (KV cached, 5-min TTL)
  - AdminLayout reads `site_name` and `site_favicon_url` for dynamic admin title/favicon
  - Eliminated 27 hardcoded "YourCompany" references across 14 files
  - Sub-page titles no longer include site name (BaseLayout appends `{pageTitle} — {siteName}` automatically)
  - Logo supports both image mode (`site_logo_url` set) and text mode (falls back to site name)

### Security

- **N-01 [CRITICAL]**: Replaced `isomorphic-dompurify` with pure-string HTML sanitizer. No DOM dependency for Cloudflare Workers compatibility. ([`src/lib/sanitize.ts`])
- **N-02 [CRITICAL]**: Added `requireAdmin` to 7 notification GET endpoints. ([`src/pages/api/notifications/*.ts`])
- **S-03 [CRITICAL]**: Production-enforced `BETTER_AUTH_SECRET` validation. ([`src/lib/auth.ts`])
- **N-04 [CRITICAL]**: Fixed SQL injection in seed-admin.mjs + removed default password. ([`scripts/seed-admin.mjs`])
- **N-05 [HIGH]**: Added `escapeHtml()` to all user-input fields in email templates. ([`src/lib/notification/email.service.ts`])
- **N-06 [HIGH]**: Replaced `String(e)` with `apiError()` in notification subsystem. ([`src/pages/api/notifications/*.ts`])
- **N-07 [MEDIUM]**: Added `sanitizeFilename()` for R2 upload paths. ([`src/pages/api/media/index.ts`])
- **N-08 [HIGH]**: Added HTTPS validation for `BETTER_AUTH_URL`. ([`src/lib/auth.ts`])
- **S-01 [CRITICAL]**: Added `sanitizeHtml()` to `solutions/[industry].astro` before `set:html` — stored XSS fix. ([`src/pages/solutions/[industry].astro`])
- **S-02 [LOW]**: Changed `X-Frame-Options` from `SAMEORIGIN` to `DENY` in middleware — now consistent with CSP `frame-ancestors 'none'`. B2B SaaS has no embedding requirement. ([`src/middleware.ts`])
- **S-03 [MEDIUM]**: Added `default-src 'self'` to CSP directives as fallback for unspecified resource types. Confirmed that Astro 6 `security.csp` auto-generates `script-src` and `style-src` with per-page hashes — audit finding SEC-04 is already resolved. ([`astro.config.mjs`])
- **S-04 [CRITICAL]**: Added code-level rate limiting for public POST endpoints. `POST /api/quote-requests` limited to 5 req/min/IP, `POST /api/comments` limited to 3 req/min/IP. Returns `429 Too Many Requests` with `Retry-After` header when exceeded. Uses in-memory sliding-window counter (per-Worker-isolate). For global rate limiting, configure Cloudflare WAF rules. ([`src/lib/rate-limit.ts`, `src/middleware.ts`])
- **S-05 [LOW]**: Health endpoint (`GET /api/health`) no longer exposes database connection status (`"db": "connected"`) to unauthenticated callers. Returns `200 { status: "ok" }` or `503 { status: "unavailable" }`. Also added actual DB connectivity check via `SELECT 1`. ([`src/pages/api/health.ts`])

### Infrastructure

- **CI-01 [CRITICAL]**: Added GitHub Actions CI pipeline (`.github/workflows/ci.yml`). Runs on push to `main` and PRs: lint → type check → test → build. Uses Node.js 22 with npm cache. Also fixed 5 pre-existing lint errors to unblock CI: removed unused `check` import, fixed `no-useless-escape` in regex, added `cause` to re-thrown errors in webhook service, fixed stale eslint-disable directive. ([`.github/workflows/ci.yml`, `src/lib/db/schema/index.ts`, `src/lib/__tests__/sanitize-filename.test.ts`, `src/pages/api/media/index.ts`, `src/lib/notification/webhook.service.ts`, `src/components/admin/settings/NotificationTemplates.tsx`])
- **E-01 [CRITICAL]**: Added `queues.consumers` to `wrangler.jsonc` — notification queue messages are now processed by `queue-consumer.ts` (email + webhook delivery). Previously messages were enqueued but never consumed in production. Added dead-letter queue `notification-queue-dlq` for failed messages. Upgraded `@astrojs/cloudflare` from 13.1.0 to 13.1.8 to fix prerender worker inheriting queue consumer bindings ([ERR_MULTIPLE_CONSUMERS]). ([`wrangler.jsonc`, `package.json`])
- **DB-01 [MEDIUM]**: Added composite primary key `(post_id, tag_id)` to `news_post_tags` table — prevents duplicate tag associations. Migration uses `SELECT DISTINCT` to deduplicate existing data before applying constraint. Also added `ON DELETE CASCADE` to foreign keys. ([`migrations/0008_add_constraints.sql`, `src/lib/db/schema/index.ts`])
- **DB-02 [MEDIUM]**: Added CHECK constraints on status/role fields: `quote_requests.status IN ('new','contacted','quoted','closed')`, `news_posts.status IN ('draft','published')`, `comments.status IN ('pending','approved','rejected')`, `users.role IN ('admin','user')`. Invalid values are now rejected at the database level. ([`migrations/0008_add_constraints.sql`])

### Deferred

- **EDGE-01b [HIGH] — SSE Durable Object migration (BLOCKED)**: Created `NotificationHub` DO class ([`src/lib/notification/notification-hub.ts`]) to replace module-level `Set<ClientConnection>` in SSE stream endpoint. However, `@astrojs/cloudflare@13.1.8` does not support exporting DO classes from the Worker entrypoint. Blocked on [astro#13837](https://github.com/withastro/astro/pull/13837) (merged but not yet released). The DO class is ready for integration once a compatible adapter version is available. Added TODO comments in `stream.ts` and `queue-consumer.ts` referencing the migration path.
- **CSP**: Replaced `'unsafe-inline'` CSP with Astro 6 built-in CSP (`security.csp`). ([`astro.config.mjs`, `src/middleware.ts`])
- **Build fix**: Exported `escapeHtml`, fixed `queue-consumer.ts` import. ([`src/lib/notification/template-engine.ts`, `src/lib/notification/queue-consumer.ts`])

### Performance

- **SEO-01 [CRITICAL]**: Added `<link rel="canonical">` to `BaseLayout.astro` using `Astro.url.href`. All public pages now output canonical tags, preventing duplicate content issues from URL parameters, trailing slashes, and protocol variations. ([`src/layouts/BaseLayout.astro`])
- **SEO-02 [CRITICAL]**: Created `public/robots.txt` — blocks `/admin/`, `/api/`, `/login` from crawlers. Prevents index pollution and crawl budget waste on admin/API routes. Includes sitemap reference. ([`public/robots.txt`])
- **SEO-03 [MEDIUM]**: Enhanced sitemap with `<lastmod>`, `<changefreq>`, `<priority>` metadata. Products use `createdAt`, articles use `publishedAt`. Removed `/services` from sitemap (redirects to sub-pages). Priority hierarchy: homepage 1.0 > products 0.9 > news index 0.8 > about/products detail 0.7 > articles/solutions 0.6. ([`src/pages/sitemap.xml.ts`])
- **SEO-04 [MEDIUM]**: Added article-specific Open Graph meta tags to news detail pages. `og:type` now correctly set to `"article"` (was inheriting `"website"` from BaseLayout). Added `article:published_time`, `article:author`, and `article:tag` meta tags. BaseLayout now accepts `ogType` and `articleMeta` props for OG customization. ([`src/layouts/BaseLayout.astro`, `src/pages/news/[slug].astro`])
- **UX-01 [MEDIUM]**: Created custom 404 and 500 error pages with consistent branding (BaseLayout + Tailwind). Both pages are prerendered at build time (no D1 dependency). Fixes `isPageEnabled()` redirects to `/404` which previously showed Astro's default unstyled page. ([`src/pages/404.astro`, `src/pages/500.astro`])
- **P-03**: Lazy-loaded Tiptap editor via `React.lazy()` + `Suspense`. ([`src/components/admin/LazyNewsForm.tsx`])
- **P-04 [MEDIUM]**: Upgraded notification settings cache from simple TTL to Stale-While-Revalidate (SWR) pattern. Fresh data served for 60s, stale data served for up to 5min with background revalidation via `waitUntil()`. Reduces D1 query latency for notification processing path. ([`src/lib/notification/settings-cache.ts`])
- **P-05 [MEDIUM]**: Added image transformation support to media proxy route (`/media/*`). Accepts `?w=300&f=webp` query parameters to resize and convert images via Cloudflare Images binding. Width capped at 2000px to prevent abuse. Formats: webp, avif, jpeg, png. Original behavior preserved when no parameters provided (direct R2 passthrough). ([`src/pages/media/[...path].ts`])

### Testing

- **A-01**: 67 unit tests covering sanitization, template engine, rate limiter, webhook SSRF protection, and filename sanitization. ([`src/lib/__tests__/`])

### Observability

- **LOG-01 [LOW]**: Added request logging middleware for API and admin routes. Logs `method`, `path`, `status`, and `duration` on every request. Errors include the error object. Static assets and public pages are not logged to reduce noise. ([`src/middleware.ts`])
- **LOG-02 [LOW]**: Created structured JSON logger (`src/lib/logger.ts`) and migrated middleware and API error handler from `console.log/error` to JSON-formatted output. Compatible with Cloudflare Logpush and Grafana Loki. Remaining 27 `console.*` calls in notification services can be migrated incrementally. ([`src/lib/logger.ts`, `src/middleware.ts`, `src/lib/api-response.ts`])

### Dependencies

- **DEP-01 [HIGH]**: Ran `npm audit fix` — upgraded `@cloudflare/vite-plugin` from 1.25.6 to 1.31.2, fixing 5 HIGH severity vulnerabilities in `undici`. ([`package.json`, `package-lock.json`])
- **DEP-02 [MEDIUM]**: Added `@better-auth/passkey` (1.6.2) and `@simplewebauthn/server` for WebAuthn/Passkey authentication support. ([`package.json`])

### Authentication

- **AUTH-01 [MEDIUM]**: Added Passkey (WebAuthn) support for passwordless login. Uses `@better-auth/passkey` plugin with `@simplewebauthn/server`. RP config auto-derived from `BETTER_AUTH_URL`. Login page now shows "Sign in with Passkey" button above the password form. Passkey registration is available to authenticated users via the better-auth API. Password login remains fully functional (incremental, zero-risk change). ([`src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/components/LoginForm.tsx`, `astro.config.mjs`, `migrations/0009_passkey.sql`])

### Media Library

- **MEDIA-01 [HIGH]**: Added media library backend enhancements. New `DELETE /api/media/[id]` endpoint (admin only, deletes D1 record + R2 object with best-effort cleanup). Upgraded `GET /api/media` with cursor-based pagination (`?cursor=&limit=&search=`), SQL LIKE search with proper escaping, and `hasMore`/`nextCursor` response fields. Added zero-dependency image dimension parser (`src/lib/media/image-dimensions.ts`) supporting PNG/JPEG/WebP/GIF via pure binary analysis. Added media utility functions (`src/lib/media/utils.ts`): `getOptimizedImageUrl()`, `formatFileSize()`, `escapeLikeString()`. ([`src/pages/api/media/[id].ts`, `src/pages/api/media/index.ts`, `src/lib/media/`])
- **MEDIA-02 [HIGH]**: Added media library management UI at `/admin/media`. ([`src/pages/admin/media/index.astro`, `src/components/admin/media/MediaLibrary.tsx`, `src/components/admin/media/UploadModal.tsx`, `src/components/admin/media/MediaPreviewModal.tsx`])
- **MEDIA-03 [MEDIUM]**: Added MediaPicker component and integrated into news editor. ([`src/components/admin/media/MediaPicker.tsx`, `src/components/admin/NewsForm.tsx`])
- **MEDIA-04 [MEDIUM]**: Enhanced image serving with advanced transformation parameters. Added `h` (height, 1-4000px), `q` (quality, 1-100, default 80), `fit` (scale-down/cover/contain/crop) query parameters. Added Accept header automatic format negotiation (AVIF > WebP). Added anti-loop detection via `Via` header. Added `?original=true` bypass for downloading untransformed files. Migrated error responses to unified format. ([`src/pages/media/[...path].ts`])

### Maintenance

- **DOC-01 [LOW]**: Created `.env.example` documenting all environment variables: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `ADMIN_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFICATION_SSE_URL`. Includes usage notes, default values, and secret setup commands. Also lists all Cloudflare bindings (DB, R2, SESSION, SETTINGS_CACHE, IMAGES, NOTIFICATION_QUEUE) for reference. ([`.env.example`])
- **S-06 [LOW]**: Fixed SSE endpoint CORS fallback in `stream.ts`. Previously fell back to `Access-Control-Allow-Origin: *` when `BETTER_AUTH_URL` was unset, which is incompatible with `Access-Control-Allow-Credentials: true` per browser spec (causes silent CORS failure). Now dynamically echoes the request `Origin` header, or derives origin from `X-Forwarded-Host` / request URL. ([`src/pages/api/notifications/stream.ts`])
- **LOG-03 [LOW]**: Migrated all remaining 30 `console.log/warn/error` calls to structured JSON logger across 11 files. Zero raw `console.*` calls remain in application code (only `logger.ts` itself uses console for output). ([11 files])

### API

- **API-01 [MEDIUM]**: Extended `api-response.ts` with unified response helpers. New format: `{ ok: true/false, data?, error?: { message, code } }`. Added `apiSuccess()`, `apiBadRequest()`, `apiUnauthorized()`, `apiForbidden()`, `apiNotFound()`, `apiRateLimited()`, `apiUnavailable()`. Existing `apiError()` is backward-compatible. ([`src/lib/api-response.ts`, `src/lib/__tests__/api-response.test.ts`])
- **API-02 [LOW]**: Migrated **all** API routes to unified response format. Replaced ~154 manual `JSON.stringify({ error })` calls with `apiBadRequest`/`apiNotFound`/`apiUnavailable`/`apiSuccess`/`apiUnauthorized`/`apiForbidden` across 29 files. Zero raw `JSON.stringify({ error })` calls remain. All responses now follow `{ ok: true/false, data?, error?: { message, code } }` format. ([29 API route files])

### Maintenance

- **A-04**: Removed unused `@opentelemetry/api`. ([`package.json`])

### Build

- **Shiki**: Disabled Shiki syntax highlighting (`markdown.syntaxHighlight: false` in `astro.config.mjs`). The project has no `.md`/`.mdx` content files, and Shiki's inline styles were incompatible with CSP, generating a build warning on every `npm run build`. This also reduces build time by ~15s (Shiki engine no longer loaded). ([`astro.config.mjs`])
- **N-04 (cleanup)**: Removed hardcoded default password `admin123` and direct SQL user insertion from `scripts/seed-admin.sql`. The file now contains only a commented-out `UPDATE users SET role` statement with a warning to use `seed-admin.mjs` instead (which handles proper password hashing via Better Auth). ([`scripts/seed-admin.sql`])

### Performance

- **A-03**: Added KV caching to `isPageEnabled()` via existing `batchGetSettings()` (5-minute TTL). Previously, every page view triggered a direct D1 query; now results are cached in Cloudflare KV. Added `getKV()` convenience function, updated `AppEnv` interface with `SETTINGS_CACHE` and `SESSION` KV type declarations, and eliminated all `as KVNamespace` type casts across the codebase. Updated 8 page files to pass KV instance. ([`src/lib/env.ts`, `src/lib/page-visibility.ts`, `src/layouts/BaseLayout.astro`, `src/lib/notification/settings-cache.ts`, `src/pages/**/*.astro`])

### Maintenance

- **A-02**: Refactored `src/pages/admin/settings/index.astro` from a 1370-line monolith into 7 focused modules. Extracted 5 React components (`NotificationDashboard`, `NotificationChannels`, `NotificationTemplates`, `NotificationLogs`, `SocialLinksManager`) and 1 Astro component (`PageVisibilitySection`), plus a shared constants file (`settings-shared.ts`). The entry page is now 162 lines (−88%). All components use inline styles to avoid CSS conflicts and are self-contained with their own state management. ([`src/components/admin/settings/`, `src/pages/admin/settings/index.astro`])

### Type Safety

- **Double check**: Fixed 29 TypeScript type errors found during full project audit. Categories: (1) `response.json()` returning `unknown` in 3 settings React components — added type assertions; (2) undefined variable `e` in `NotificationTemplates.tsx` onFocus callbacks — added parameter declarations; (3) D1 possibly undefined in 8 notification API endpoints — added null guards; (4) KV instance typed as `{}` in `settings-cache.ts` — added `KVNamespace` type assertion. `npx tsc --noEmit` now passes with 0 errors. ([`src/components/admin/settings/*.tsx`, `src/lib/notification/settings-cache.ts`, `src/pages/api/notifications/*.ts`])
