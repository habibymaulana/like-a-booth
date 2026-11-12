# like a booth

A browser-local creative photobooth built for Adrian with React, Vite, JavaScript, Tailwind CSS, React Router, Lucide, and Canvas 2D.

## Run

```sh
cd /Users/apple/like-a-booth
npm install
npm run dev
```

Open the localhost URL printed by Vite. Camera access requires localhost or HTTPS. Grant camera access only after selecting **Enable camera**. Microphone access is never requested.

```sh
npm run build
npm run lint
npm test
node tests/browser.mjs
node tests/stage2.browser.mjs
node tests/simulation.browser.mjs
```

The browser integration script uses installed macOS Google Chrome and the local server on port 5174; adjust these two settings for another environment. It uses a synthetic camera, not a physical camera.

## Experience

`/` editorial homepage, moving frame gallery, preview dialogs, interactive before/after comparison.
`/frames` all 29 templates and Shuffle Preview illustrations.
`/capture` explicit camera permission, mirror, camera switching, four separately confirmed three-second captures, retakes.
`/editor` Frame / Effects / Customize panels, intensity, ink pairs, paper and caption customization, original comparison, date and transparency.
`/result` actual exported PNG preview and download.

Sessions are memory-only. Refreshing clears photos and safely returns the editor to frame selection. Simulation Take sessions are explicitly labeled; real sessions never insert demo photos.

## Architecture

- `src/main.jsx`: routes, session state, shared UI components, camera lifecycle.
- `src/engine.js`: centralized layouts, deterministic demo generator, pixel processing and composition.
- `src/decorations.js`: original twelve-theme art manifest, vector motifs and cached paper textures.
- `src/shapes.js`: shared clipping and outline paths.
- `src/FlashTransition.jsx`: one opacity-only white flash coordinated with routing.
- `src/style.css`: design tokens, responsive system, animation and motion alternatives.
- `tests/engine.test.js`: metadata and deterministic pixel tests.
- `tests/browser.mjs`: browser flow, synthetic capture, Canvas export and screenshots.
- `artifacts/`: browser reports and screenshots when generated.

All thumbnails, editor previews and exports use the same `compose` function and frame geometry. Canvas ellipse, arc, custom arch and scalloped clipping create true masks. Images use cover scaling without distortion. Subject position adjusts vertical cropping; different frame aspect ratios necessarily crop photos. Captures retain original sensor aspect ratio, and mirror is baked into the original capture exactly as shown. Customizable transparent paper leaves transparent pixels around masks inside a rectangular PNG.

Demo portraits are original locally drawn illustrations generated with a seeded PRNG. They never use third-party portraits or image services.

Effects operate on Canvas pixel data: photographic color transforms, grayscale gradients, edge-derived sketch/ink, quantization, comic contours, halftone, selectable duotone, pixel sampling and simulated risograph registration. These are algorithmic effects, not AI facial models. Halftone density is fixed; intensity blends the processed result. Processing is bounded to 1400 pixels per source edge, yields between images, and uses a capped cache. Export compositions retain their configured dimensions. Very low-powered devices may still pause briefly during pixel processing.

Camera tracks stop on route exit and camera switching. No photo uploads, analytics, cloud storage, database, login or backend. Google Fonts is the only external resource; system fallbacks work offline. Photos are not sent to the font service.

## Vercel readiness

Build command: `npm run build`; output: `dist`; framework: Vite. `vercel.json` handles SPA routes. Create a new repository named `like-a-booth`, then connect one Vercel project after acceptance. No repository, commits, pushes or deployments were created by this implementation.

## Limitations

Physical-camera acceptance and mobile hardware download behavior require manual testing. Rear-camera selection depends on the browser/device; facing mode is a preference. Shutter audio is synthesized and off by default. Sessions do not survive reloads. Color and geometry vary deliberately by template. PNG export uses browser fonts, so exact glyph shapes can vary across systems. Pencil Sketch and Ink Outline are lightweight finite-difference edge treatments; they are not generative models.

Stage 2 refinement details, frame themes, verification and screenshot links are documented in [STAGE2.md](STAGE2.md). Review locally at http://127.0.0.1:5174 when the development server uses port 5174. To select that port explicitly, run `npm run dev -- --port 5174`.

## Simulation Take

Choose a frame, then **Try Editor** to open Art Lab with four locally generated illustrations. **Shuffle Preview** refreshes those illustrations. Simulation Take supports the same 29 layouts, eighteen effects, customization, Canvas rendering and PNG download as captured sessions. Its editor and result identify the generated source; downloads include `simulation-` in the filename. **Back to Frame Studio** returns to frame selection.

Session mode is explicit (`simulation` or `camera`). Starting either take resets edits and the previous result. Continue to Camera always clears illustration images; opening the camera route directly also initializes a real take when necessary. No permission is requested for Simulation Take. See [SIMULATION.md](SIMULATION.md) for validation.

## Expanded collections

Frame Studio now includes 29 originals: the initial 12 plus 17 designs across Label & Packaging, Music Mood, Retro Tech, Indie & Dark, Doodle & Comic, and Race & Sport. Collection pills filter the catalog without changing the selected frame. New definitions, palettes, four-slot geometry and original vector artwork live in `src/collections.js`, plugged into the existing composition pipeline. Rounded, screen and organic masks extend `src/shapes.js`.

Customize exposes per-frame title/subtitle/mood fields, or song title/artist/subtitle/mood for music designs. Edits are keyed by frame ID, so switching layouts cannot overwrite another frame’s text. Date and caption controls remain shared. Player controls, barcodes, timecodes and meters are decorative printed artwork, not integrations or functional music playback. No artist logos, names, lyrics or downloaded templates are included.

Run `node tests/collections.browser.mjs` for targeted collection checks. See `artifacts/collections/contact-sheet.png` for all 17 new designs and `artifacts/collections/report.json` for browser evidence.

## Artwork layout quality

Shared measurement, wrapping, font readiness, layout regions and collision diagnostics live in `src/artworkLayout.js`. See [LAYOUT-REFINEMENT.md](LAYOUT-REFINEMENT.md) for the 29-frame audit, before/after evidence and limitations. Tape Monitor now uses a 600×1640 export to preserve photo crop ratios with dedicated metadata rows.

```sh
node tests/layout.browser.mjs
node tests/layoutReview.browser.mjs
```

The before artifacts are a preserved baseline; do not regenerate them after source changes when comparing this refinement. Final normal/long outputs live in `artifacts/layout/after/`.
