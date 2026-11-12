# Stage 2 — flash and collectible frame refinement

Project: `/Users/apple/like-a-booth`. Existing routes, capture workflow, twelve layouts and eighteen filters are preserved. No dependencies, backend or services were added. No commits, pushes or deployments were performed.

## Files

Created:
- `src/FlashTransition.jsx`: reusable opacity-only navigation transition.
- `src/decorations.js`: original decorative art manifest and Canvas primitives.
- `src/shapes.js`: extracted shared photo clipping / outline geometry.
- `tests/stage2.browser.mjs`: targeted browser regression checks and artifacts.
- `STAGE2.md`: this report.
- `artifacts/stage2/`: screenshots, twelve exported frame PNGs, download and machine-readable test report.

Changed:
- `src/main.jsx`: flash integration, selected-card semantics, collection labels and explicit homepage demo identification.
- `src/engine.js`: decoration metadata, two rendering layers, improved demo framing and footer spacing. Actual photo capture and effect algorithms are unchanged.
- `src/style.css`: removes aperture geometry; white overlay, refined card sizing, selected state, mobile spacing and hero readability.
- `tests/browser.mjs`: checks the replacement flash overlay rather than the removed shutter class.
- `README.md`, `DESIGN.md`, `VALIDATION.md`: updated usage and architecture notes.

## Flash root cause and fix

The old `.aperture` element extended 70% beyond the viewport, carried a `70vmax` dark border and animated a large scale and rotation. That geometry produced the enormous gray/dark rotating object.

The old component, aperture, flash keyframes and oversized transforms were removed. A fixed `inset: 0` white overlay now animates only opacity using the browser compositor. Timeline: 120ms fade-in, 60ms peak and 300ms fade-out (480ms total). Navigation is requested 150ms into the transition, during the white peak. Existing optional synthesized sound remains user-controlled and off by default.

A synchronous navigation lock prevents repeated clicks. Finish/cancel callbacks, a timeout fallback, visibility-change handling and reduced-motion handling restore the page and remove the overlay. All listeners and timers are cleaned up on unmount. Reduced motion navigates immediately without a visible flash. No camera request occurs during navigation.

## Twelve original decorative themes

| Frame | Artwork |
| --- | --- |
| Classic Booth | Seeded paper fibers, double borders, registration crosses, small frame numbers and archive typography. |
| Oval Archive | Double oval outlines, original leaf sprigs, fine flourish, paper grain and serif archival title. |
| Circle Club | Offset circular outlines, playful rings, dot grid and geometric sparkle marks on cobalt. |
| Arch Museum | Repeated architectural arch outlines, portrait labels, classical column detail, paired laurels and stone-like paper. |
| Editorial Contact | Fine contact-sheet grid, numbered caption strips, registration crosses and editorial rules. |
| Chrome Orbit | Lightweight silver gradients, elliptical orbit lines, metallic-looking stars and layered chrome rings. |
| Soft Ribbon | Flowing layered-paper waves, fine oval contours, small drawn bow and soft serif title. |
| Flower Cut | Original seven-petal blossoms, leaf sprig, scalloped contour and dotted botanical border. |
| Film Negative | Rounded film perforations, exposure numbers, ISO-style technical lettering, fine grain and cream-on-black ink. |
| Polaroid Scatter | Original striped torn-edge washi tape, paper overlay, sketched stars, circular sticker and cursive-style photo captions. |
| Postcard Studio | Illustrated mountain postage stamp, original circular postmark, travel path, paper grain and postcard typography. |
| Art Gallery | Asymmetric abstract geometry, fine line motif, numbered museum labels and collection typography. |

## Shared rendering

The existing `compose` function now calls background decorations before drawing photos, and foreground outlines/details afterward. Standard captions and optional dates finish the image. The manifest supports normalized placement, scale, rotation, opacity, patterns and layer order. All artwork is original Canvas geometry, including reusable paths; no external artwork, asynchronous SVG loads, CSS-only export decorations or expensive filter effects are used.

Photo clipping and outlines both call `traceShape`. Existing rectangle, oval, circle, arch, scallop and rotated photo geometry is preserved. Cover scaling retains aspect ratio. Demo-only illustrations are smaller and centered for safer crops; real captures are untouched.

## Verification

- `npm run lint`: passes.
- `npm test`: 21 focused metadata and image-effect tests pass.
- `npm run build`: production build passes.
- `node tests/stage2.browser.mjs`: passes in installed headless Google Chrome.
- `node tests/browser.mjs`: original regression journey passes, including four synthetic-camera countdown captures and confirmations.
- Twelve decorated gallery canvases match independently composed PNG data exactly. Every design changes meaningful pixel regions versus decoration-disabled output, preserves photo-center pixels and retains transparent outer corners.
- Editor Canvas and result PNG are byte-identical for the tested demo composition. An actual browser PNG download completes successfully.
- Twelve demo PNGs are approximately 146–755 KB each; file size depends on photo detail and effects in real sessions.
- Live animation-frame samples verify one white peak and one navigation after a rapid triple click; no old geometry or camera request. Keyboard Enter, animation cancellation, reduced motion and subsequent frame interaction pass.
- Screenshots: `flash-before.png`, `flash-fade-in.png`, `flash-peak.png`, `flash-after.png`. Before/after and timing samples use a live pass. Separate fade-in/peak screenshots pause the actual compositor at 60ms/150ms so screenshot encoding cannot miss the short peak.
- Homepage orbit, Frame Studio, camera screen and populated editor have no document horizontal overflow at 1440, 1024, 768, 390 and 320px. Desktop moving transforms, hover pause and reduced-motion animation suppression pass.
- No application page errors or HTTP resource errors during the targeted journey.
- Representative desktop/mobile layouts and exported oval, chrome, postcard and polaroid artwork were visually reviewed.

Machine-readable evidence: [browser report](artifacts/stage2/report.json).
Visual evidence: [desktop frame gallery](artifacts/stage2/frames-1440.png), [mobile gallery](artifacts/stage2/frames-320.png), [white peak](artifacts/stage2/flash-peak.png), [decorated oval PNG](artifacts/stage2/frame-oval.png).

## Remaining acceptance checks

Physical camera hardware, actual mobile front/rear switching, iOS/Safari downloads and screen-reader acceptance are unverified. Automated camera tests use Chrome's synthetic device. Very wide photo slots still necessarily crop some of the source background; images are never stretched. Mobile retains the existing bounded orbital movement. Google Fonts remains the only external resource; decorative assets and photo processing are entirely local.

## Review

Local URL: http://127.0.0.1:5174

```sh
cd /Users/apple/like-a-booth
npm run dev -- --port 5174
```

An existing development server on port 5174 serves the updated source; no additional server or deployment is required for local review.
