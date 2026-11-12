# Validation

Executed locally on 12 November 2026 using Node, Vite, Vitest, ESLint and headless installed Google Chrome.

## Verified

- Production Vite build succeeds; static React SPA generated in `dist`.
- ESLint source checks pass.
- 21 Vitest tests pass: twelve unique four-slot frame geometries, bounded slots, mask variety, landscape output, deterministic effects, alpha preservation, zero intensity and seeded randomness.
- Browser demo journey: Start session → shutter → frame studio → demo editor → Comic Pop → finished PNG preview.
- Shutter overlay absent after navigation.
- All twelve Canvas compositions produce PNGs at their configured dimensions and preserve transparent outer corners.
- Oval, circle, arch and scallop clipping have transparent corners and opaque centers.
- Chrome synthetic camera: explicit permission, live video, four three-second captures, individual confirmation, editor entry.
- Homepage, frame selector, camera and populated editor checked at 1440, 1024, 768, 390 and 320px without document horizontal overflow.
- Reduced-motion emulation produces no orbit animation.
- No application `pageerror` events during the automated browser journey.
- Desktop and mobile homepage screenshots visually inspected. Screenshots and machine-readable browser report are in `artifacts/`.
- Source audit: no upload endpoints, microphone requests, storage services, analytics, backend, account flow or external AI calls. Fonts load from Google Fonts with local fallbacks. No competitor source or assets accessed.

## Implementation inspection (not physical-device acceptance)

- One shared composition engine serves frame thumbnails, editor and final export.
- Before/after artwork uses processed Canvas output; original data URLs remain untouched.
- Camera track cleanup runs on route exit and camera replacement; outstanding camera requests stop tracks after unmount.
- CSS uses transforms for orbit animation, hover pause and reduced-motion alternatives.
- Modal keyboard focus containment and restoration, Escape, native button interactions and focus outlines are implemented.

## Still unverified / limitations

- Physical camera image quality, actual rear/front camera switching, real permission denial UI and phone hardware.
- Safari/iOS download behavior, accessibility with a screen reader, and exhaustive keyboard-only acceptance.
- Download was validated as an actual PNG data URL and finished preview; saving through every OS file picker was not tested.
- Export text rendering varies by browser. Very large/low-memory devices may pause briefly during bounded image processing.
- Editor and capture sessions intentionally reset on browser reload.
- Mobile uses bounded, smaller orbital motion rather than the full desktop ellipse.
- Fixed halftone dot density; effects expose intensity. Flat Art is posterization, not AI illustration.

No commit, push, repository creation or deployment performed. Vercel SPA configuration is ready for user acceptance.

## Stage 2 refinement

See [STAGE2.md](STAGE2.md) and `artifacts/stage2/report.json` for the flash and decoration regression checks. The Stage 2 flash replaces the original mechanical shutter described in the first implementation. New screenshots live in `artifacts/stage2/`. Frame Studio thumbnails are compared byte-for-byte with actual decorated PNGs for all twelve designs, and the populated editor is compared with the final result PNG. Chrome completed an actual PNG download. Synthetic camera regression checks still pass; physical hardware remains unverified.

## Complete artwork layout audit

Latest results and reproducible commands: [LAYOUT-REFINEMENT.md](LAYOUT-REFINEMENT.md). All 29 frames have before/after normal and long-text PNGs. The final 58-case audit has no recorded collisions. 26 unit tests, lint, build, priority responsive/editor/download checks, gallery/export equality, mask/alpha checks and synthetic-camera regression pass. Checker coverage and physical-device limitations are documented separately from verified results.
