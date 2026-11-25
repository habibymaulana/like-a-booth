Manual reconstruction geometry is in src/comicGeometry.js. Source PNG is unchanged.
The four holes are erased geometrically at native output resolution; selected
foreground silhouettes are restored from the original source. No RGB thresholds.
Photos use the existing engine's aspect-preserving cover crop. Slot four now
covers y=1170..1458, including the slanted opening ending at y=1456 on the left.

Validation: node tests/comic.browser.mjs (existing dev server at :5173).
459,238 fully interior opening pixels are transparent. Exterior source artwork
is preserved within Canvas interpolation rounding (2 channel levels).
Full-resolution photographic output: full.png (608 x 1712).
Reusable derived transparent overlay: overlay.png; runtime regenerates it from
source + geometry, so there is no additional production asset dependency.
Photographic fixtures: four distinct Unsplash portraits, fetched using image IDs
recorded in this task; used locally only for validation.
Studio, Simulation Take, Art Lab, Results and PNG download were exercised.
Results and downloaded PNG match the Art Lab canvas exactly. UI uses existing
illustrated simulation sources; full.png separately validates four real photos.
Visual inspection: full image and 2x crops of panel borders, separator, character
silhouettes and panel four bottom. No remaining placeholder bands observed.
Original raster softness and small traced-edge antialiasing remain at enlargement.
61 unit tests, ESLint and production build passed. No commit, push or deploy.
