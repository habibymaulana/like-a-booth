# Design system

A modern editorial studio: porcelain paper, cobalt ink, generous margins, original illustrated portraits, and expressive masks. Photography takes priority over controls. No competitor assets.

Tokens live in `src/style.css` under `:root`: porcelain #F4F2EE, near black #101015, cobalt #4D5DFF, lavender #DDD7F4, muted UI gray, restrained borders and shared corner radii. Additional tangerine, green and silver are confined to frame artwork.

Space Grotesk supplies headings and branding; DM Sans supplies UI; Instrument Serif italic supplies editorial emphasis. System sans and serif fallbacks keep the application usable without fonts.

Reusable components: Button, Header, FrameCard, FilterCard, Modal, Toast, Progress, Preview and Shutter. Controls use visible focus rings. The dialog restores focus, traps Tab and supports Escape. Native buttons support keyboard interaction.

Desktop orbit: six independently phased photographs travel along a transform-only elliptical circuit. Hovering the gallery pauses movement. Mobile uses smaller bounded orbital motion to preserve the central reading area. Reduced motion disables all continuous animation and uses an immediate navigation transition. The 480ms camera-flash transition uses a fixed white overlay: 120ms fade-in, 60ms peak and 300ms fade-out. Navigation occurs at the white peak; finish, cancellation, reduced motion and a watchdog release the overlay and navigation lock. No aperture geometry remains. Optional sound is off by default.

Frame geometries and output sizes are centralized in `frames` in `src/engine.js`. A frame contains four slots with coordinates, dimensions, mask shape and rotation. One composition renderer owns all previews and downloads. Add layouts by metadata rather than duplicating renderers.

Responsive layouts adapt at 1050, 768 and 430px. Camera stage stays within 680px; editor separates artwork from compact tabs. All routes preserve the same typography, tokens, progress and control styling.

## Collectible frame decorations

`src/decorations.js` holds the twelve-theme manifest and original vector motifs. Background and foreground layers use normalized placement, rotation, opacity, shared paths, cached seeded paper textures and lightweight gradients. Shape outlines reuse `src/shapes.js`, the same paths used for clipping photographs. The composition engine embeds every decoration directly in the Canvas; no decoration depends on CSS or an external asset loader. Photos stay above background artwork; outlines and small margin details follow the photos. Captions occupy the footer.

Frame Studio keeps output proportions, uses consistent thumbnail areas, a distinct selected outline and check, collection labels, compact mobile sizing and a sticky action bar with scroll clearance. Demo illustrations use smaller centered subjects to preserve faces within wide masks.

## Expanded lineup

The original twelve layouts remain intact. `src/collections.js` adds seventeen fully declarative designs with category, palette, slot geometry and editable text metadata. Its original Canvas vector renderer plugs into the existing background/foreground layer contract. Seven collection pills, including Originals, keep the full 29-frame catalog browseable. New text controls appear only for frames with declared fields; music fields use original generic defaults. All new shapes reuse one trace function for both masks and outlines.

## Canvas typography and safe areas

Artwork typography uses `measureText` ink bounds for baseline alignment, bounded wrapping/font fitting and restrained ellipsis. Font readiness is shared between previews and exports. Frame metadata carries logical layout zones. Drawn text and selected foreground asset bounds feed path-aware diagnostics against the actual rotated clipping shapes. The three retro-tech layouts reserve header, numbering, bezel gutters, technical footer, waveform, controls and branding zones. See LAYOUT-REFINEMENT.md for confirmed repairs and output dimensions.
