# Collection expansion

Existing app extended in place. The original 12 frames and all five routes, 18 effects, camera features, Simulation Take, orbit and PNG pipeline are preserved. No dependencies, backend or external artwork added. No commit, push or deployment performed.

## Public wording and transition

The previous refinement already removed public demo wording. Shuffle Preview and Try Editor remain the public controls, with generated illustrations identified in Simulation Take. Catalog counts now read 29 dynamically.

The existing fixed white opacity-only flash remains in use: 120ms fade in, 60ms peak, 300ms fade out, navigation at the peak, duplicate-click protection, cleanup/watchdog and reduced-motion bypass. No giant aperture/gray geometry was reintroduced. Capture regression verifies navigation and overlay removal. Earlier targeted flash checks are documented in STAGE2.md.

## Added frames

| Collection | Original designs | Artwork |
| --- | --- | --- |
| Label & Packaging | Heart Facts; Serving Size | Barcode-like marks, serving information, label rules and structured typography. |
| Music Mood | Now Playing; Playlist Mood; Cassette Pop | Original track metadata, progress lines, playback symbols, waveform details and mood gradients. |
| Retro Tech | Pocket Camera; CRT Memory; Tape Monitor | Rounded screen windows, bezel contours, battery marks, monitor knobs and faux recording/timecodes. |
| Indie & Dark | Midnight Monochrome; After Dark Strip; Indie Zine | Dark paper, deterministic speckles, layered paper/tape, fine stars and editorial issue marks. |
| Doodle & Comic | Sketch Pop; Campus Chaos; Daylight Saver | Organic/arch masks, grid paper, hand-drawn outlines, arrows, starbursts and note boxes. |
| Race & Sport | Track Star; Fast Lane; Finish Line | Checker motifs, dynamic stripes, number badges and performance-style lettering. |

All seventeen provide four photo slots, original palettes, category metadata, shared filtering and PNG rendering. Original names and generic text are used; no competitor UI, artist branding or song lyrics are built in. Music controls, codes and technical markings are decorative artwork only.

Customize adds frame-specific title/subtitle/mood controls, or song title/artist/subtitle/mood on music frames. Shared caption and optional date remain. Per-frame text values persist when switching layouts within the same take and reset for a new take. Empty values remain intentionally empty.

## Files

Created `src/collections.js`, `tests/collections.browser.mjs`, `public/favicon.svg`, this report and `artifacts/collections/`.

Updated `src/engine.js`, `src/decorations.js`, `src/shapes.js`, `src/main.jsx`, `src/style.css`, `index.html`, `tests/engine.test.js`, `tests/simulation.browser.mjs`, README.md and DESIGN.md. The new favicon also resolves a browser-console 404 found during validation.

## Validation

- Lint and production build pass; 21 unit tests cover the expanded 29-frame geometry, mask catalog and deterministic image effects.
- Targeted browser tests pass for all 17 new frames: independent composition matches the actual gallery PNG exactly, transparent corners remain, photo-center pixels are unobscured, and editable text changes exported pixels.
- Rounded, screen and organic clipping preserve transparent corners and opaque centers in Canvas.
- Collection filters, editable music fields, optional date and customized PNG download pass through the UI.
- Frame Studio and populated music editor have no horizontal overflow at 1440/1024/768/390/320px.
- Original browser regression passes with all 29 output dimensions, original clipping checks, sample-to-editor flow, camera flash cleanup, reduced motion and four confirmed synthetic-camera captures.
- No console errors or application exceptions in the final collection test.
- All seventeen designs were visually reviewed in `artifacts/collections/contact-sheet.png`.

Physical-camera hardware and iOS/Safari acceptance remain unverified. Canvas cover cropping necessarily trims some source background; photographs are never stretched. Google Fonts remains the existing external font resource; photo processing and all decorative artwork stay local.

Review: http://127.0.0.1:5174
