# Artwork layout refinement

Existing Like a Booth application refined in place. All 29 frames, 18 effects, four-photo capture, mirror behavior, Simulation Take, original visual identity and shared composition pipeline remain. No dependencies, backend, commits, pushes or deployments were added. The flash transition and camera implementation were not modified.

## Root causes

### Pocket Camera

The original grid left only 20px between 425px windows. Expanded paths plus thick bezels consumed that gutter. Batteries were placed relative to each window, while GOOD COMPANY used independent header coordinates; the upper-right battery and mood label occupied the same area. Numbering was offset left into the narrow adjacent-photo gutter. The footer metadata's baseline was close enough that its glyph ascenders touched the lower bezel. Branding was effectively against the 20px outer border.

### CRT Memory

The same narrow grid and width-based scaling crowded the title/subtitle, row numbering and technical details. Monitor knobs occupied side gutters without reserved clearance. Footer typography used baselines rather than measured glyph boxes, leaving little room between the lower windows, waveform and branding.

### Tape Monitor

The original 35px vertical gap was mostly consumed by two expanded bezels. REC/timecode baselines were positioned inside this remaining gap with small type. Header, controls, caption and date did not share reserved regions. Fitting all these elements into the previous strip height left insufficient vertical clearance.

## Exact changes

- Pocket Camera and CRT Memory now use 360×300 windows at x=90/550 and y=310/705 in their unchanged 1000×1300 outputs. This provides 100px horizontal and 95px vertical gutters before bezel expansion.
- Dedicated title, subtitle/mood columns and technical header rows separate text from photo outlines. One header battery replaces four identical redundant battery drawings. Power status, all four image numbers, waveform and playback decoration remain.
- CRT's twelve knobs remain, relocated into clear center/right gutters. Numbering sits in rows above the windows, not beside adjacent images.
- Retro-tech footer information, waveforms, playback controls, captions and dates have separate measured regions.
- Tape Monitor now exports at **600×1640**. Its 440×234 windows begin at y=240 and use a 300px pitch, giving 66px inter-window gaps. This closely preserves the original window crop ratio instead of making faces more tightly cropped. Each photo has a dedicated 20px metadata row, larger REC/timecode labels and clearance from the bezel. The extra canvas height preserves all four windows and decorative controls.
- The music frames reserve more footer room. Their window height/pitch changes to 230/270px; Cassette Pop separates track/artist text from its equalizer in distinct columns. Playback controls no longer compete with optional dates/captions.
- Indie Zine, Campus Chaos and Finish Line numbering moves above photos; right-hand numbers no longer intrude into left-hand windows. Finish Line checkers occupy a separate header area, and racing titles reserve room for diagonal graphics.
- Packaging barcode and rule placement now clears long text. Long headings wrap/fit rather than being horizontally compressed.
- Original-frame footer titles, captions and dates use distinct bands. Measured cursive ink resolves Polaroid Scatter's title/caption/date collisions. The original twelve photo geometries remain unchanged.
- Editor artwork remains centered at its native ratio in a stable minimum-height stage; mobile frame choices retain bounded scrolling. No editor redesign or new controls were added.

## Shared helpers

New `src/artworkLayout.js` provides:

- Artwork spacing tokens and normalized-box utilities, with per-frame logical outer/header/title/subtitle/technical/decoration/footer/branding/date regions.
- `drawText`: Canvas `measureText` advance and actual ink metrics, font-aware baselines, natural font-size fitting, word wrapping, Unicode code-point splitting for unspaced input, line limits and last-resort ellipsis. No horizontal glyph squashing.
- `baselineText`: compatibility for existing decorative labels while retaining their established placement.
- Font readiness before composition: browser FontFaceSet readiness plus artwork-family load requests. All previews and exports wait for the same fonts.
- Recorded ink/asset bounds and `auditArtwork` diagnostics. Text/photo checks sample the actual translated/rotated clipping path, including oval, arch, circle and decorative masks; they do not assume rectangular photos.

The engine still draws one shared composition for thumbnails, Art Lab, results and downloaded PNGs. Layout records are browser-local diagnostics and are not uploaded or included in PNG metadata.

## Audit scope and artifacts

All registered frames were rendered with four distinct seeded illustrations, using both default and extended editable text/caption/date content: **58 full-resolution PNGs before and 58 after**. All 29 frames were reviewed in normal/long contact sheets, with full-resolution inspection of the three priority frames, long Cassette Pop, and cursive Polaroid Scatter. The final priority exports and representative 320px editor were visually inspected after validation.

- Baseline outputs: `artifacts/layout/before/`
- Final outputs: `artifacts/layout/after/`
- Full measured bounds and collision results: `artifacts/layout/after/measurements.json`
- Normal/long overview sheets: `artifacts/layout/after/contact-sheet.png` and `contact-sheet-long.png`
- Before/after comparisons: `artifacts/layout/comparison/pocket-camera.png`, `crt-memory.png`, `tape-monitor.png`; each has a `-long.png` counterpart.
- Priority editor screenshots: `artifacts/layout/comparison/<frame-id>-editor-<width>.png`
- Responsive/customized-result report: `artifacts/layout/review-report.json`

All other registered frames were included: Classic Booth, Oval Archive, Circle Club, Arch Museum, Editorial Contact, Chrome Orbit, Soft Ribbon, Flower Cut, Film Negative, Polaroid Scatter, Postcard Studio, Art Gallery, Heart Facts, Serving Size, Now Playing, Playlist Mood, Cassette Pop, Midnight Monochrome, After Dark Strip, Indie Zine, Sketch Pop, Campus Chaos, Daylight Saver, Track Star, Fast Lane and Finish Line. Layouts without confirmed issues retain their photo positions, decorative personality and palette; shared measured typography applies to all.

## Verification performed

- ESLint passes.
- Production build passes.
- 26 Vitest tests pass: original 21 geometry/effect tests plus five safe-area/gutter/crop-ratio tests.
- `node tests/layout.browser.mjs` passes: all 58 final compositions have the registered dimensions, with zero reported text/zone/photo/registered-asset collision warnings and no console errors.
- `node tests/layoutReview.browser.mjs` passes: 12 long/unspaced/accented text cases across sans-serif, serif, cursive and monospace stay within their zones and line limits. Six before/after composites are generated.
- Priority editor layouts checked at 1440, 1024, 768, 390 and 320px: no document overflow, correct canvas display ratio, successful customized downloads, byte-identical editor/result PNGs.
- `node tests/stage2.browser.mjs` passes: all 29 gallery canvases match independent exported PNGs; output dimensions, alpha corners, original clipping masks, photo-center preservation, reduced motion, orbit behavior and flash cleanup pass. The unchanged flash also passes rapid clicks, cancellation and keyboard navigation.
- `node tests/browser.mjs` passes: four confirmed three-second captures using Chrome's synthetic camera, Art Lab entry, processed result, all 29 export dimensions and shape clipping checks.
- No application exceptions or console errors in the targeted final layout/review journeys.

## Changed files

Created `src/artworkLayout.js`, `tests/artworkLayout.test.js`, `tests/layout.browser.mjs`, `tests/layoutReview.browser.mjs`, this report and `artifacts/layout/`.

Updated `src/engine.js`, `src/collections.js`, `src/decorations.js`, `src/style.css`, README.md, DESIGN.md and VALIDATION.md. Camera behavior, the transition, routing and photo-effect algorithms were not changed.

## Limits

The collision checker is a diagnostic tool, not a formal proof of every ornament's raster coverage: it measures text, samples actual photo paths and checks explicitly registered foreground assets. Background ornament placement also received visual review. Extremely long text may require ellipsis; printed technical detail necessarily becomes small in narrow mobile thumbnails. System/cursive fallback glyphs can vary by browser, which is why fitting uses actual font metrics. Physical camera, Safari/iOS and screen-reader acceptance remain unverified; automated capture uses a synthetic device.

Review locally at http://127.0.0.1:5174.
