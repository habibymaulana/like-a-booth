# Delivery implementation plan (audit before implementation)

The app is currently a static React/Vite SPA. Results holds the finished Canvas PNG as a data URL; Download PNG is a direct local download. There is no API, cloud configuration, QR dependency, email provider, persistent server state or storage provisioning. Vercel rewrites currently send every request to the SPA. Available disk is approximately 1 GB; use only small, necessary dependencies.

Smallest viable local change: construct a PNG File from the existing finished result before the share click; check navigator.canShare({files}) and call navigator.share directly from that click. Unsupported sharing downloads the same PNG. Cancellation should not trigger a surprise download. No upload is involved.

Opt-in cloud architecture: one Vercel Function route with configuration, upload, authorized artwork read, email and cleanup actions; one PRIVATE Blob object per finished image; no account or photo database. Separate signed 256-bit nonce capabilities for read and email-owner access, valid for 24 hours. Session ID alone is never sufficient. Gallery links keep the read capability in the URL fragment and retrieve PNGs using Authorization headers. No raw Blob URL is returned. QR is rendered locally only after a real successful cloud upload.

Upload body is a raw PNG capped at 3 MB (below the Vercel Function payload limit); validate PNG structure, CRCs, decompressed pixels, dimensions and termination. Global, IP, owner and recipient rate limits require a shared atomic Redis REST store; do not use process memory as a production limiter. Resend is optional and separately gated. Creation/email require explicit UI actions and same-origin checks. Credentials remain server-only.

Reject access at exactly 24 hours before reading Blob, independent of cleanup. An authenticated hourly cleanup job actually deletes expired objects, with paginated bounded work and retryable failures. Access expiry is exact; physical deletion is scheduled and cannot honestly be promised to occur at the exact expiry second. Enablement requires operator confirmation of private storage, configured durable limits and an installed cleanup schedule. Cloud controls stay disabled when prerequisites are missing; no placeholder links, QR or success messages.

No services will be provisioned, no credentials assumed, no storage calls or real email sends made during local testing. Provider adapters will be dependency-injected for integration tests. Production acceptance still requires authorized deployment, a real private-store test, cross-device QR scan, Resend delivery and observed cron cleanup.

## Implemented scope

Download PNG remains first and primary. Share Photo passes a prebuilt, byte-identical PNG File to `navigator.share` only after `navigator.canShare({files})`. The native call runs synchronously from the click before any awaited work. Missing/false/throwing canShare and sharing failures trigger a local download; AbortError reports cancellation without downloading. No upload occurs in this path. The Results delivery panel defaults to unconfigured and cannot show a private link, QR or email form until the corresponding server response enables it. Local Vite explicitly serves disabled delivery configuration and rejects mutations.

When configured, separate upload/email consent controls submit the existing finished PNG only. Raw captures and edit history are never uploaded. Results identify Simulation Take artwork, including on the private gallery. Homepage/editor privacy copy now says local by default, rather than promising that optional cloud delivery never exists.

### Code map

- `src/delivery.js`: File conversion, native share/download fallback and same-origin API client.
- `src/PhotoDelivery.jsx`: Results delivery panel and `/gallery` viewer; local QR generation and object-URL cleanup.
- `src/main.jsx`, `src/style.css`: integration and existing design-system styling; privacy copy.
- `api/delivery/[action].js`: one Node Vercel Function entrypoint; no Next.js/Express.
- `server/delivery-core.js`: PNG validation, scoped signed capabilities, quotas, expiry and deletion lifecycle.
- `server/delivery-handler.js`: bounded HTTP bodies, origin checks, binary delivery and cron authentication.
- `server/delivery-adapters.js`: private Blob, atomic Redis REST limits and optional Resend REST transport.
- `vercel.json`: API routes excluded from SPA fallback; gallery no-store/no-referrer/noindex headers.
- `vercel.delivery.example.json`: opt-in hourly cleanup configuration, deliberately **not active** in the default config.
- `delivery.env.example`: blank server-only environment template.
- `vite.config.js`: disabled local API response, with no credentials or provider calls.
- `package.json`, `package-lock.json`: `@vercel/blob` for the server adapter, `qrcode` for local QR encoding. No Resend/Redis SDK is needed. Blob SDK and credentials do not enter the browser bundle.
- `tests/delivery.test.js`, `tests/delivery-adapters.test.js`, `tests/delivery.browser.mjs`: lifecycle/security/share/provider-contract/browser tests.
- README.md, DESIGN.md, VALIDATION.md and this document: current operational and privacy notes.

### API contract

| Path | Method | Authorization / behavior |
| --- | --- | --- |
| `/api/delivery/config` | GET | Public capability flags only; never secret values. |
| `/api/delivery/session` | POST | Same-origin; explicit consent; binary PNG body, 3 MB cap. Returns private fragment URL, expiry and separate email-owner token only after successful private storage write. |
| `/api/delivery/artwork` | POST | Read capability in Authorization header; returns PNG with no-store/no-referrer/nosniff and expiry/provenance headers. |
| `/api/delivery/email` | POST | Email-owner capability, valid recipient and separate consent; returns accepted only after the provider accepts the request. |
| `/api/delivery/cleanup` | GET | Constant-time CRON_SECRET bearer authentication; actually lists/deletes expired objects. Continues when uploads/email are disabled or the limiter/signing key is unavailable. |

Upload uses `application/octet-stream` plus `X-Artwork-Type: image/png` so Vercel's Node request helper preserves the binary body as a Buffer. The server then validates PNG bytes, not a claimed filename. It accepts 8-bit RGB/RGBA, non-interlaced Canvas PNGs up to 4096×8192 and 16 million pixels, with valid CRCs, bounded inflate length, valid row filters, complete IEND and no trailing payload. Unsupported chunks/formats are rejected. The local PNG download retains its full quality even when a file exceeds the cloud size limit.

Only `sessions/<server expiry>/<random id>.png` is stored. Access tokens contain a 32-byte random nonce, random 16-byte ID, provenance and server timestamps, signed with HMAC-SHA256. Read and email scopes are not interchangeable. Signatures are compared in constant time. No raw Blob URL is returned. URL fragments keep capabilities out of HTTP request paths/referrers; the client submits its read token in a POST Authorization header. Browser history, clipboard, email and screenshots can still contain a capability. Anyone who possesses it can view/download until expiry. Operators should not log Authorization headers or request bodies.

Expiry is checked before and after the storage read, and again before email submission. Email requires at least one minute of remaining link life; inbox delays can still exceed remaining validity. Links deny access at 24 hours regardless of cron. Cleanup scans up to 5,000 objects per invocation, paginates, preserves live objects and retries failed deletions on subsequent invocations. It returns counts and `more` for monitoring. Keep Blob credentials and the cleanup secret installed until all retained sessions are deleted, even after turning new uploads off. Hourly deletion may lag expiry by roughly one interval plus execution/cache propagation; provider or scheduler outages can delay it further. Already-downloaded copies, recipient inboxes and provider backups cannot be recalled by application cleanup.

### Abuse limits

An atomic Redis EVAL increments and expires counters across Function instances. Keys are HMAC digests, not raw email/IP values. No image, access token or recipient address is stored in Redis. Failure or malformed responses fail closed.

- Upload: 5 per client IP/hour, 100 globally/hour.
- Email: 5 per client IP/hour, 3 per session/day, 3 per normalized recipient/day, 50 globally/hour.
- Resend requests use a stable per-session/recipient idempotency key. Provider errors never produce a success response. A retry may return the same accepted email without sending another.
- The handler trusts Vercel's injected `x-real-ip`; alternative hosting needs an explicitly trusted proxy configuration. Reverse proxies/NAT may group users under one limit. Counters bound abuse; they do not verify ownership of an email address.

## Required configuration — not performed

All secrets are server-side only. Do **not** use a `VITE_` prefix. Copy the blank template to an ignored `.env.local` only for an authorized Vercel development environment, or configure server environment variables in an already-authorized project. Plain `npm run dev` intentionally keeps cloud delivery disabled regardless of local environment values.

| Variable | Required use |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Credential for an actual **PRIVATE** Vercel Blob store. Public storage is unsupported. SDK `access: private` enforces the adapter's write/read mode. |
| `DELIVERY_SIGNING_SECRET` | At least 64 characters; use a securely generated random secret. Rotating it revokes existing links. |
| `DELIVERY_ORIGIN` | Canonical production HTTPS origin, e.g. `https://your-domain.example`; no path/query/credentials. Preview domains need their own isolated settings/store. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Durable atomic rate-limit service, with EVAL support and expiry enabled. |
| `CRON_SECRET` | At least 32 random characters; used only by authenticated cleanup requests. |
| `DELIVERY_PRIVATE_STORE_CONFIRMED=true` | Operator confirms the configured store is private. |
| `DELIVERY_CLEANUP_CONFIGURED=true` | Operator confirms a working hourly scheduler and deletion monitoring. This flag does not create or verify a schedule. |
| `DELIVERY_ENABLED=true` | Enables opt-in uploads/gallery reads only after the above prerequisites exist. Defaults off. |
| `N8N_EMAIL_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` | Optional n8n webhook URL (`POST`) + >=32-char shared secret (`X-Like-A-Booth-Secret`) for Gmail/HTML email delivery. Preferred over Resend when set. |
| `N8N_LOG_WEBHOOK_URL` | Optional n8n webhook URL (`POST`) for non-sensitive activity logs (session created, email status, cleanup counts) to Google Sheets. |
| `RESEND_API_KEY`, `RESEND_FROM` | Optional alternative sending credential and verified sender/domain if not routing email through n8n. |
| `DELIVERY_EMAIL_ENABLED=true` | Optional separate email switch; requires either n8n email webhook or Resend settings, plus enabled delivery. Defaults off. |

After authorization, merge the example cron entry into the tracked Vercel config, preserving rewrites/headers. The example assumes a plan supporting hourly cron or an existing authorized external scheduler calling the authenticated cleanup URL. Vercel Hobby's daily-only cron cannot meet the stated hourly cleanup cadence; do not silently enable hourly copy on a daily schedule. No plan changes, scheduler, Redis instance, Blob store, verified domain or emails were created here.

Keep default-disabled flags until an authorized production acceptance test confirms: the store is actually private, raw unauthenticated reads fail, file delivery works across real devices, a phone scans the generated QR, Resend accepts and delivers the link, and the scheduled job deletes a real expired object. Monitor cron failures and `more=true`; retain cleanup credentials during shutdown. Never promise exact-to-the-second physical deletion or inbox delivery.

## Validation and current blockers

Executed locally with mocked provider adapters and a production-build browser harness:

- Lint and production build pass.
- 60 unit tests pass, including the pre-existing Canvas/effect checks.
- Local Share Photo: exact finished PNG bytes, PNG File MIME type, canShare before share, active browser user gesture, cancellation and real fallback-download event verified. Native OS share dialogs were stubbed; real iOS/Android share-sheet acceptance remains unverified.
- Cloud browser flow used the actual HTTP handler/core with an in-memory private-store adapter and injected email adapter, not live services. Explicit consent gates upload and email. QR appears only after the successful handler response; its encoded segments match the returned valid gallery URL.
- An isolated second browser context opens the private gallery and receives the exact uploaded PNG bytes. Advancing the test server clock yields an expired gallery before cleanup. Authenticated cleanup removes the stored bytes. Production scheduler/Blob deletion remains unverified.
- Token tampering, wrong scopes, bare IDs, exact expiry, in-flight expiry, missing config, invalid PNG/CRC/trailing bytes/size, origin/MIME checks, concurrent upload quotas, email validation/limits/provider errors, cleanup pagination/retries and cleanup-after-disable are covered.
- Provider-contract tests use mocked SDK/fetch, including private writes, origin-cache-bypassing reads, atomic Redis commands and Resend idempotency. No real provider was called.
- Results tested at 1440/1024/768/390/320px with no horizontal overflow and no application/console errors in the delivery journey.
- Original browser regression passes: camera flash navigation, four confirmed synthetic-camera captures, all 29 PNG dimensions and shape clipping checks, processed result and reduced motion.
- Source/build audit finds no server credential variable names in the generated browser bundle. No photo/token logging was added.

Evidence: `artifacts/delivery/browser-report.json`, `local-results-320.png`, `cloud-results-320.png`, `private-gallery-390.png`. **Cloud screenshots/QR use the isolated automated test host and are not live deliverable links.** The actual local application honestly shows cloud delivery unavailable.

Blockers: authorized real service configuration, an approved hourly scheduler/plan, authorized deployment and live storage/QR/email/cleanup acceptance. Physical camera, Safari/iOS downloads and actual native share-sheet behavior remain device acceptance checks. No commits, pushes, deployments, real uploads or real emails were performed.

## Reproduce

```sh
cd /Users/apple/like-a-booth
npm run dev -- --port 5174
npm run lint
npm test
npm run build
node tests/delivery.browser.mjs
node tests/browser.mjs
```

The delivery browser test serves the compiled build through isolated Playwright routes at a synthetic HTTPS host, intercepting all requests and using only fake credentials/adapters. It does not require or use `.env` or actual services. The original browser regression expects a local Vite server on port 5174 and installed macOS Google Chrome.

## Provider references checked

- [Web Share API and transient user activation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).
- [Vercel private Blob and authenticated reads](https://vercel.com/docs/vercel-blob), [Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk).
- [Node request-body binary handling](https://vercel.com/docs/functions/runtimes/node-js), [Vercel request IP headers](https://vercel.com/docs/headers/request-headers).
- [Vercel cron plan limits](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing).
- [Upstash Redis REST protocol](https://upstash.com/docs/redis/features/restapi).
- [Resend send-email contract](https://resend.com/docs/api-reference/emails/send-email).
