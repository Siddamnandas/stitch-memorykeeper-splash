# Production Readiness Audit – MemoryKeeper

## A. Executive Summary
- **High:** (SEC-001 now in progress) AI calls have been rerouted through `/api/ai.ts` + `src/lib/aiProxyClient.ts`, eliminating bundled keys and moderating content, but Supabase profiles remain world-readable (`SUPABASE_DATABASE_SETUP.sql:28`), so secrets/privacy stay the top blocker until RLS tightens.
- **High:** PWA installability/offline gaps are narrowing (maskable icons, screenshots, `/offline.html`, Workbox `NetworkFirst` caching, update toast, and A2HS prompt now ship), but Lighthouse PWA ≥95 + cross-device install tests remain blocking until verified.
- **High:** No production observability: Sentry/web-vitals unused, analytics absent, and CI references `npm run test:run`/`test:e2e` that do not exist (`package.json:6`, `.github/workflows/ci.yml:39`), so regressions will ship silently.
- **High:** Offline sync only covers memories; profiles, attachments, and queued actions are lost because `queueBackgroundSync` short-circuits when Supabase is unavailable (`src/lib/syncService.ts:205`) and `IndexedDB` stores all profiles under a `'default'` key (`src/lib/indexedDBService.ts:118`).
- **Medium:** Bundle size exceeds 500 kB (`dist/assets/index-BmOPM2Fb.js`), `html2canvas`/`aiService` load on initial render, and `reportWebVitals` is never wired (`src/reportWebVitals.tsx:1`), risking slow FCP/LCP on budget devices.
- **Medium:** Senior-focused UX gaps persist—no `prefers-reduced-motion` handling despite aggressive animations (`src/index.css:72`), splash/test buttons ship to prod, and i18n strings are hard-coded.
- **Medium:** Engagement loops (analytics, push reminders, feature flags, payments) are unimplemented, so growth and monetization levers from the PRD are missing entirely.
- **Low (informational):** `npm audit --production` currently reports 0 known vulns, but without locked CI this can change unnoticed.
- **ETA:** ~5–6 weeks to production assuming 2 FE, 2 BE, 1 Infra engineer, with Must-level items tackled in parallel and Supabase Edge + Stripe access provisioned.

## B. Readiness Scorecard
| Area | Status | Why | Blocking? |
| --- | --- | --- | --- |
| PWA Core & Runtime | Amber | Manifest/offline/update UX now implemented, but Lighthouse ≥95 + device install tests still pending. | Yes |
| Performance & Stability | Amber | 500 kB main chunk, heavy libs eagerly loaded, no web-vitals/Sentry wiring. | Yes |
| Security & Privacy | Red | OpenAI key exposed client-side, RLS allows public profile reads, no AI consent enforcement or env validation. | Yes |
| Data, Sync & State | Amber | IndexedDB keyed to `'default'`, no migrations, background sync only fires when Supabase enabled, pending queues drop. | Yes |
| AI Integration & Cost Controls | Red | No moderation/backoff/token metering, all calls hit expensive models directly from browsers. | Yes |
| Accessibility & Senior UX | Amber | No prefers-reduced-motion, inconsistent focus targets, splash ships with debug UI, English-only strings. | No |
| Engagement, Analytics & Growth | Red | No analytics SDK, no push notifications/feature flags/post-install education, gamification not instrumented. | Yes |
| Payments & Entitlements | Red | Premium paywall is cosmetic; no Stripe/Paddle flows or entitlements mapping. | Yes |
| CI/CD & Ops | Amber | GitHub Actions call missing scripts, Lighthouse config absent, no release/versioning or runtime monitoring. | Yes |
| Testing | Red | No unit/integration/e2e suites, no mocking of Supabase/AI, device-matrix untested. | Yes |

## C. Prioritized To-Do List (MoSCoW)

* **Must** — Harden PWA manifest, install education, and offline update UX  
  **Owner:** FE • **Effort:** M • **Risk:** H  
  **Acceptance Criteria:**  
  - Manifest exposes scope, maskable 192/512 icons, screenshots, shortcuts, and per-OS theme colors; lighthouse PWA audit ≥ 95.  
  - Capture `beforeinstallprompt`, show an accessible “Add to Home” card with senior-friendly guidance and fallback deep link on `MemoryKeeperSplash`.  
  - Provide `/offline.html` fallback plus a `virtual:pwa-register` toast so “New version available” appears within 5 s and reloads after `skipWaiting()`.  
  - Workbox precache/runtime lists include Supabase REST domains and media assets; broken PNG placeholders removed.  
  **Exact Files & Diffs:**  
  - `public/manifest.json`, `public/icons/*`, `public/screenshots/*` now specify maskable icons, theme colors, screenshots, and shortcuts with accurate scopes/start URLs.  
  - `public/offline.html` provides the offline fallback page referenced by Workbox.  
  - `src/hooks/useA2HS.ts` + `src/components/AddToHomeScreenPrompt.tsx` capture `beforeinstallprompt` and guide Android/iOS users through installation.  
  - `vite.config.js` imports the manifest JSON, switches `registerType` to `prompt`, precaches offline assets, and configures Workbox `NetworkFirst`/`BackgroundSync` strategies for Supabase.  
  - `src/components/ServiceWorkerToast.tsx` (wired up in `src/App.tsx`) uses `virtual:pwa-register` to show update/offline-ready toasts within seconds of a new SW.  
  **Links:** `public/manifest.json:1`, `public/offline.html:1`, `vite.config.js:1`, `src/hooks/useA2HS.ts:1`, `src/components/AddToHomeScreenPrompt.tsx:1`, `src/components/ServiceWorkerToast.tsx:1`

* **Must** — Move AI/Whisper calls server-side with safety, metering, and fallbacks  
  **Owner:** BE • **Effort:** L • **Risk:** H  
  **Acceptance Criteria:**  
  - Introduce Supabase Edge (or Cloudflare Worker) endpoint that proxies chat/image/Whisper calls, enforces moderation (OpenAI `omni-moderation-latest`), strips PII, and logs token usage per user/session.  
  - Browser bundle no longer bundles `openai` or raw API keys; `dangerouslyAllowBrowser` removed and Whisper uploads go through signed URLs.  
  - Add exponential backoff + circuit breaker (e.g., `AbortController` with 20 s timeout) and fallback to cheaper model when budgets exceed plan.  
  - Respect `ai_consent_*` flags before firing any AI calls; surface friendly rejection toast when consent is missing.  
  **Exact Files & Diffs:**  
  - `src/lib/aiProxyClient.ts` to centralize fetch helpers with AbortControllers, consent gates, and exponential backoff.  
  - `api/ai.ts` (Edge Function) with model routing, moderation, usage logging, and retries.  
  **Links:** `src/lib/aiProxyClient.ts`, `src/lib/aiService.ts:38`, `src/lib/enhancedSpeechService.ts:137`, `.env.example:8`, `api/ai.ts`

* **Must** — Enforce Supabase RLS + runtime env validation  
  **Owner:** BE • **Effort:** M • **Risk:** H  
  **Acceptance Criteria:**  
  - Update SQL policies so only owners can `select` profiles; add `invited_family` policy for shared views; add audit logging triggers.  
  - Create `src/lib/env.ts` (Zod) to validate `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `POSTHOG_KEY`, `SENTRY_DSN`, `OPENAI_PROXY_URL`, etc., failing fast if missing.  
  - Extend `.env.example` with secure defaults and documentation for `VITE_ENABLE_SUPABASE`, analytics, Stripe, push keys.  
  - Supabase client should only initialize with validated config and log once (no console spam in prod).  
  **Exact Files & Diffs:**  
  - `SUPABASE_DATABASE_SETUP.sql`  
    ```diff
    -create policy "Public profiles are viewable by everyone." on profiles
    -  for select using (true);
    +create policy "Profiles are only viewable by owner or approved family" on profiles
    +  for select using (
    +    auth.uid() = id
    +    or auth.uid() = invited_family_id
    +  );
    ```  
  - `src/lib/supabaseClient.ts`  
    ```diff
    -const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
    -const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    +import { env } from './env';
    +const SUPABASE_URL = env.VITE_SUPABASE_URL;
    +const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
    ```  
  **Links:** `SUPABASE_DATABASE_SETUP.sql:28`, `src/lib/supabaseClient.ts:4`, `.env.example:1`

* **Must** — Service worker update awareness & offline queue coverage  
  **Owner:** FE • **Effort:** M • **Risk:** M  
  **Acceptance Criteria:**  
  - Use `virtual:pwa-register` in `src/index.tsx` to surface update events via a dedicated `<UpdateToast />`.  
  - Extend background sync to cover Supabase REST endpoints + profile mutations; `queueBackgroundSync` should persist requests (IndexedDB or Workbox `RequestQueue`).  
  - Add `/public/offline.html` screen with simple journaling instructions and a CTA to reopen the app when back online.  
  - `SyncStatusIndicator` exposes “Retry” button tied to new `useServiceWorkerUpdates` hook.  
  **Exact Files & Diffs:**  
  - `src/index.tsx`  
    ```diff
    -import App from './App.tsx';
    +import App from './App.tsx';
    +import { registerSW } from 'virtual:pwa-register';
    +
    +const updateSW = registerSW({
    +  onNeedRefresh() {
    +    window.dispatchEvent(new CustomEvent('pwa:update-available'));
    +  }
    +});
    ```  
  - `src/lib/backgroundSyncManager.ts`  
    ```diff
    -        const registration = await navigator.serviceWorker.register('/sw.js');
    +        const registration = await navigator.serviceWorker.ready;
    ```  
  **Links:** `src/index.tsx:1`, `src/hooks/useDataSync.ts:33`, `src/lib/backgroundSyncManager.ts:58`

* **Must** — Add analytics, consented instrumentation, and remote flags  
  **Owner:** BE • **Effort:** M • **Risk:** M  
  **Acceptance Criteria:**  
  - Add lightweight analytics module (PostHog or Supabase `event_log`) that respects user consent + regional opt-outs.  
  - Emit events for `journal_started`, `journal_saved`, `game_started`, `game_completed`, `streak_day`, `install_a2hs`, `premium_upgrade`.  
  - Fetch remote feature flags (Supabase table) to gate AI Studio, collaboration, payments, etc., without redeploys.  
  - Update privacy modal/onboarding to capture analytics consent separately from AI consent.  
  **Exact Files & Diffs:**  
  - `package.json`  
    ```diff
    +    "analytics:check": "posthog-node --verify",
    +    "dev": "vite",
    ```  
  - `src/lib/analytics.ts` (new) w/ `track(event, props)` exporting no-ops when consent denied.  
  - `src/components/MemoryKeeperMain.tsx` emit events inside `handleAddMemory` and `GameSelection`.  
  **Links:** `package.json:6`, `src/components/MemoryKeeperMain.tsx:336`, `src/components/GameSelection.tsx`

* **Should** — Reduce bundle size and enforce performance budgets  
  **Owner:** FE • **Effort:** M • **Risk:** M  
  **Acceptance Criteria:**  
  - Defer `html2canvas`, `jspdf`, and `aiService` via `import()` inside respective components; base chunk ≤ 250 kB, AI chunk lazy-loaded.  
  - Add `npm run analyze` (source-map-explorer) and `performance-budget.json` used by CI to fail builds when chunks exceed thresholds.  
  - Wire `reportWebVitals` to send metrics to analytics/Sentry.  
  - Remove production `console.log` spam from `App`/`ErrorContext` and guard expensive logs behind `if (import.meta.env.DEV)`.  
  **Exact Files & Diffs:**  
  - `src/components/DataExportImport.tsx`  
    ```diff
    -import { backupService } from '../lib/backupService';
    +const backupServicePromise = import('../lib/backupService');
    ...
    +const backupService = await backupServicePromise;
    ```  
  - `package.json`  
    ```diff
    +    "analyze": "source-map-explorer dist/assets/*.js",
    ```  
  **Links:** `dist/assets/index-BmOPM2Fb.js`, `src/components/MemoryKeeperMain.tsx:1`, `src/reportWebVitals.tsx:1`

* **Should** — Multi-profile IndexedDB, migrations, and sync observability  
  **Owner:** FE/BE • **Effort:** M • **Risk:** M  
  **Acceptance Criteria:**  
  - Bump IndexedDB version to 2, store profiles by `userId`, and add migration code to upgrade `'default'` entries.  
  - Track `lastSyncTime` per user (e.g., `localStorage['lastSyncTime:${userId}']`).  
  - Extend `backgroundSyncManager` to emit structured `SyncStatus` events for analytics + Sentry breadcrumbs.  
  - Add CLI script to backfill remote Supabase data for users whose local caches diverged.  
  **Exact Files & Diffs:**  
  - `src/lib/indexedDBService.ts`  
    ```diff
    -const DB_VERSION = 1;
    +const DB_VERSION = 2;
    ...
    -      const profilesStore = db.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
    +      const profilesStore = db.createObjectStore(PROFILES_STORE, { keyPath: 'id' });
    +      profilesStore.createIndex('by-userId', 'userId', { unique: true });
    ```  
  - `src/hooks/useDataSync.ts` store/retrieve `lastSyncTime:${user.id}`.  
  **Links:** `src/lib/indexedDBService.ts:34`, `src/hooks/useDataSync.ts:73`, `src/lib/dataMigrationService.ts:25`

* **Should** — Accessibility + motion-safe senior UX polish  
  **Owner:** FE/Design • **Effort:** M • **Risk:** M  
  **Acceptance Criteria:**  
  - Wrap animated utilities with `@media (prefers-reduced-motion: reduce)` and provide `data-reduced-motion` toggles in settings.  
  - Remove “TEST BUTTON” debug UI; convert splash actions to semantic buttons with 44px targets and ARIA labels describing next screen.  
  - Add `aria-live="polite"` to `SyncStatusIndicator` so screen readers announce offline/queue states; ensure color contrast meets WCAG AA.  
  - Internationalize visible strings via `useTranslation` hook (start with splash, onboarding).  
  **Exact Files & Diffs:**  
  - `src/index.css`  
    ```diff
    +@media (prefers-reduced-motion: reduce) {
    +  .animate-shimmer,
    +  [class*="animate-"] {
    +    animation: none !important;
    +  }
    +}
    ```  
  - `src/components/MemoryKeeperSplash.tsx` remove debug button and inject translated copy.  
  - `src/components/SyncStatusIndicator.tsx` add `aria-live`.  
  **Links:** `src/index.css:72`, `src/components/MemoryKeeperSplash.tsx:32`, `src/components/SyncStatusIndicator.tsx:41`

* **Should** — Testing & CI alignment  
  **Owner:** Infra • **Effort:** M • **Risk:** M  
  **Acceptance Criteria:**  
  - Add Vitest + React Testing Library unit tests for `syncService`, `inputSanitizer`, and `backgroundSyncManager`.  
  - Add Playwright e2e covering onboarding → offline journal → reconnect sync, and run in CI using `npx playwright test`.  
  - Update `package.json` scripts (`test`, `test:ci`, `test:e2e`) and adjust `.github/workflows/ci.yml` to call them; include `lighthouserc.json`.  
  - Publish HTML/trace artifacts as workflow outputs; fail pipeline when budgets or coverage (<80% for `src/lib`) missed.  
  **Exact Files & Diffs:**  
  - `package.json`  
    ```diff
    +    "test": "vitest",
    +    "test:ci": "vitest run --coverage",
    +    "test:e2e": "playwright test",
    ```  
  - `.github/workflows/ci.yml` replace `npm run test:run` with `npm run test:ci`.  
  - `tests/e2e/memorykeeper.spec.ts` (new).  
  **Links:** `package.json:6`, `.github/workflows/ci.yml:39`, `playwright.config.ts`

* **Could** — Payments & entitlements scaffolding  
  **Owner:** BE • **Effort:** M • **Risk:** L  
  **Acceptance Criteria:**  
  - Introduce `supabase/functions/stripe-webhook.ts` validating signatures, storing `subscription_status`, and mapping to Supabase `feature_flags` table.  
  - Add `VITE_ENABLE_PAYMENTS` flag and `useEntitlements()` hook to gate premium-only components.  
  - Provide grace period (7 days) + client banner when billing lapses; add manual override UI for support.  
  **Exact Files & Diffs:**  
  - `supabase/functions/stripe-webhook.ts` (new).  
  - `src/lib/entitlements.ts` (new) reading Supabase `profiles.premium_expires_at`.  
  - `docs/PRD.md` update payments section with decided SKUs.  
  **Links:** `docs/PRD.md`, `src/components/PremiumFeaturesDetails.tsx`, `vercel.json`

## D. Gaps Requiring Product Decisions
- Finalize privacy/GDPR policy: data retention duration, export formats, and who can approve “family collaborator” access to memories.
- Confirm AI safety boundaries (what content to block, whether grief/trauma prompts should trigger escalation) and copy for AI consent decline.
- Define notification strategy: daily reminder cadence, fallback channels (email vs push), and senior-friendly opt-out copy.
- Clarify premium packaging (which games/features are freemium vs paid, pricing, grace periods) and revenue-sharing expectations.
- Approve engagement loops (XP/coins, weekly challenges, install education) so analytics/feature flags align with PM KPIs.

## E. Test Plan Summary
- **Unit (Vitest):** cover `syncService` conflict resolution, `backgroundSyncManager` retry/backoff, `inputSanitizer`, IndexedDB migrations via fake IndexedDB; target ≥80% statements in `src/lib`.
- **Integration:** MSW-powered tests for Supabase-edge proxies (AI + payments), ensuring env validation fails fast; smoke test Workbox queue with `workbox-background-sync` mocked.
- **E2E (Playwright):** flows for onboarding + consent, offline journaling + background sync, AI prompt fallback when consent revoked, A2HS/install banner interactions on Chrome + Safari.
- **Accessibility regression:** use `axe-core` in CI for key screens (Splash, MemoryKeeperMain, Games) and screenshot diff for large-text mode.
- **Performance audits:** Lighthouse CI against production preview with 3G/low-end CPU profile and budgets (<2.5 s LCP, <0.1 CLS).

## F. Deployment Plan
- **Environments:**  
  - *Local dev:* Vite + mock Supabase/AIs.  
  - *Staging (`develop`):* Vercel preview with staging Supabase project, `POSTHOG_API_KEY_STAGING`, `SENTRY_DSN_STAGING`.  
  - *Production (`main`):* Vercel prod URL, Supabase prod project, push/Stripe keys, VAPID keys for push.
- **Required secrets:** `VITE_SUPABASE_URL/ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` (server only), `OPENAI_PROXY_URL`, `POSTHOG_API_KEY`, `SENTRY_DSN`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `VAPID_PUBLIC/PRIVATE`, `VERCEL_TOKEN`.
- **CI sequence:** lint → type-check → vitest (coverage) → build → Playwright e2e → Lighthouse CI (`lighthouserc.json`) → deploy to staging → run smoke tests (`npm run smoke` hitting `/memory-keeper-main`, offline SW check) → manual approval → prod deploy. Publish build artifacts (coverage, playwright traces, lighthouse reports) for traceability.
- **Smoke checks after deploy:** verify PWA install banner, offline journaling with airplane mode, AI proxy health (Edge function heartbeat), Stripe webhook dry-run, analytics events arriving in PostHog.
- **Canary + rollback:** release behind feature flags for 5% of prod users (Supabase `feature_flags.canary=true`), monitor Sentry/PostHog dashboards for 1 h, then ramp to 100%. Roll back by redeploying previous Vercel build + revoke new feature flag rows; background sync queue can be cleared via Supabase RPC if migration issues surface.

---

## Execution Plan (Tracker-Ready)

### Day 0–1: Fire-Drill Fixes (Security + Installability)
1. **SEC-001: Remove browser OpenAI client + rotate keys + add AI proxy**  
   - Remove `openai` bundling, create `/api/ai` Edge/Worker proxy with moderation + logging, rotate `OPENAI_API_KEY`.  
   - **Accept:** Browser bundles lack API keys; network tab shows only proxy calls; direct OpenAI calls from client 401.
2. **DB-001: Lock down RLS on profiles + add audit triggers**  
   - Replace public profile policy with owner/approved-family read, add audit logging for `profiles`/`memories`.  
   - **Accept:** Cross-user select denied under RLS tests; audit rows written on mutations.
3. **PWA-001: Manifest + maskable icons + A2HS education**  
   - Add maskable icons, `scope:/`, `start_url:"/"`, screenshots/shortcuts, handle `beforeinstallprompt` with senior-friendly CTA.  
   - **Accept:** Lighthouse PWA ≥95; install works on Android Chrome + iOS Safari (standalone).

### Week 1: Offline & Observability Foundation
4. **PWA-002: Workbox runtime caching + offline queue + update flow**  
   - `NetworkFirst` for Supabase GET, Workbox queue for POST, `/offline.html`, `virtual:pwa-register` toast.  
   - **Accept:** Airplane-mode journal queues and syncs on reconnect; update toast shows within 5 s.
5. **OPS-001: Env schema validation + .env.example refresh**  
   - Add Zod env parser, expand `.env.example`, silence prod console noise.  
   - **Accept:** App fails fast on missing envs; prod logs clean.
6. **OBS-001: Sentry + Web Vitals wiring**  
   - Initialize Sentry (release/env/traces) and stream Web Vitals to Sentry/PostHog.  
   - **Accept:** Staging errors + vitals visible on dashboards.

### Week 2: Data, Senior UX, Performance
7. **DATA-001: IndexedDB v2 with per-user stores + migration**  
   - Key caches by `userId`, add migration for `'default'`, track `lastSyncTime:{userId}`.  
   - **Accept:** Account switch shows distinct caches; migration succeeds on upgrade.
8. **A11Y-001: Motion-safe, larger targets, live regions, i18n scaffolding**  
   - Respect `prefers-reduced-motion`, enlarge buttons (≥44px), add `aria-live` to sync indicator, remove debug UI, start `useTranslation`.  
   - **Accept:** Axe CI passes; motion disabled removes animations.
9. **PERF-001: Code-splitting + CI performance budgets**  
   - Lazy-load `html2canvas`/`jspdf`/AI modules, add analyzer + budgets.  
   - **Accept:** Base chunk ≤250 kB; Lighthouse LCP <2.5s on 3G profile.

### Week 3: Analytics, Flags, Tests, CI/CD
10. **GROW-001: Analytics events + consent gating**  
    - Lightweight tracker with consent; emit journaling/game/install/premium events.  
    - **Accept:** Events visible in staging, suppressed when consent off.
11. **CFG-001: Remote feature flags + canary toggles**  
    - Supabase `feature_flags` table + hook gating AI Studio, payments, collab; support canary ramp.  
    - **Accept:** Toggle features without redeploy; canary at 5% works.
12. **QA-001: Unit + e2e tests + CI workflow fixes**  
    - Vitest suites (sync queue, env, sanitizers) + Playwright e2e (onboarding/offline/update/a2hs), align GitHub Actions, add Lighthouse CI config.  
    - **Accept:** CI green; `src/lib` coverage ≥80%; artifacts published.
13. **AI-001: Moderation, metering, backoff, fallback**  
    - Apply moderation before generation, log tokens per user, add exponential backoff + cheaper model fallback.  
    - **Accept:** Abusive prompts blocked gracefully; usage metrics recorded.

### Optional Week 4: Monetization & Growth
14. **PAY-001: Stripe webhooks + entitlements gating**  
    - Stripe webhook storing `subscription_status`, `useEntitlements()` hook, grace period + downgrade banner.  
    - **Accept:** Upgrades/downgrades reflected within 60 s; grace period respected.
15. **RET-001: Push reminders + post-install education**  
    - Daily ritual reminders, streak nudges, post-install education screens + permission gating.  
    - **Accept:** Push works on Android staging; iOS fallback copy shipped; opt-in/out documented.

### Hotfix Batch PR Template
> “Implementing SEC-001, DB-001, and PWA-001 as hotfix batch A: remove client OpenAI, rotate keys, add AI proxy; lock RLS on profiles; fix manifest/icons and A2HS flow. Targets: no AI keys in bundle, Lighthouse PWA ≥95, RLS denies cross-profile reads.”

### Deployment Gate Checklist
- [ ] No AI/API keys in client bundle (`source-map-explorer`).
- [ ] Lighthouse CI: PWA ≥95, Perf ≥90, LCP <2.5 s, CLS <0.1.
- [ ] A2HS works (Android) + standalone on iOS; update toast visible.
- [ ] Airplane-mode journaling queues and syncs on reconnect.
- [ ] RLS negative test denies cross-user profile reads.
- [ ] Sentry receiving errors + vitals from staging.
- [ ] Playwright suite green on Chrome & Safari.
- [ ] Feature flags support 5% canary with rollback doc linked.
