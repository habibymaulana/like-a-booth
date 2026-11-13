// Manually traced on the 608 × 1712 strip, extracted from source
// (76, 206, 304, 856) at 2×. No color classification is used.
export const comicOpenings = [
  'M60 215 L536 202 L536 462 L60 485 Z',
  'M62 529 L535 526 L535 786 L63 810 Z',
  'M65 854 L534 850 L533 1111 L65 1136 Z',
  'M62 1184 L532 1172 L531 1434 L62 1456 Z',
];

// Only artwork intersecting an opening needs a separate foreground mask.
// Everything outside the four paths is retained from the source layer.
export const comicForeground = [
  // Top character silhouette, including the extended fingers and white keyline.
  'M0 0 H608 V198 L255 208 L211 262 L177 251 L145 253 L135 299 L151 309 L178 324 L211 337 Q225 338 219 350 Q209 366 185 358 L158 349 L142 354 L146 379 L155 414 Q158 438 143 442 Q128 445 121 425 L109 389 L99 374 L96 437 Q95 469 79 473 Q65 475 65 454 L65 404 L58 396 L28 415 L0 427 Z',
  // Yellow comic burst and its original white / black edging.
  'M510 674 L557 714 L580 642 L608 639 V891 L488 815 L525 802 L466 743 L533 756 Z',
  // Lower character: trace the crown, face and shoulder above the panel edge.
  'M0 1457 L46 1425 L69 1401 L80 1389 Q108 1373 135 1372 L174 1384 L179 1365 Q187 1339 217 1337 Q249 1335 265 1360 Q279 1382 269 1403 L263 1420 Q263 1440 250 1452 L235 1454 L221 1445 L218 1469 L0 1515 Z',
  // Web strand that crosses the upper-right corner of panel two.
  'M476 529 Q502 499 527 462 L541 449 Q521 485 500 515 L491 529 Z',
];

export const comicPhotoBounds = [
  { x: 58, y: 201, w: 480, h: 286 },
  { x: 60, y: 524, w: 477, h: 288 },
  { x: 63, y: 848, w: 473, h: 290 },
  { x: 60, y: 1170, w: 474, h: 288 },
];
