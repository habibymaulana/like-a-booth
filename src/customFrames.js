import { comicOpenings, comicForeground, comicPhotoBounds } from './comicGeometry';

// Custom photobooth frames integrated from user-supplied assets.
// Prepares transparent foreground overlays and multi-slot geometry for four photos.

const canvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`Failed to load asset: ${src}`));
  img.src = src;
});

// Assets in public/assets/frames/
export const CUSTOM_ASSETS = {
  aboutYou: '/assets/frames/About%20You_%20Like%20a%20Booth.png',
  micasa: '/assets/frames/Cosy%20Micasa%20Cottage%20Photo%20Strip%20Frame.png',
  midnightMemo: '/assets/frames/Midnight%20Memo%20Photobooth%20Collage.png',
  ferrari: '/assets/frames/Scuderia%20Ferrari%20Racing%20Photobooth%20Frame.png',
  webSlinging: '/assets/frames/Web-Slinging%20Comic%20Photo%20Booth%20Strip.png',
};

// 1. About You (887x1774) - angled filmstrip
const aboutYouSlots = [
  { x: 397, y: 312, w: 386, h: 288, shape: 'rounded', rotation: -0.076 },
  { x: 375, y: 613, w: 384, h: 276, shape: 'rounded', rotation: -0.076 },
  { x: 353, y: 900, w: 384, h: 274, shape: 'rounded', rotation: -0.076 },
  { x: 331, y: 1185, w: 384, h: 310, shape: 'rounded', rotation: -0.076 },
];

// 2. Cosy Micasa Cottage (941x1672) - cottage photo strip
const micasaSlots = [
  { x: 231, y: 227, w: 479, h: 267, shape: 'rounded', rotation: 0 },
  { x: 230, y: 535, w: 480, h: 285, shape: 'rounded', rotation: 0 },
  { x: 231, y: 861, w: 479, h: 286, shape: 'rounded', rotation: 0 },
  { x: 231, y: 1187, w: 479, h: 287, shape: 'rounded', rotation: 0 },
];

// 3. Midnight Memo (941x1672) - adapted 4-slot newsprint scrapbook
const memoSlots = [
  { x: 274, y: 312, w: 390, h: 232, shape: 'rounded', rotation: 0 },
  { x: 274, y: 588, w: 390, h: 232, shape: 'rounded', rotation: 0 },
  { x: 274, y: 864, w: 390, h: 232, shape: 'rounded', rotation: 0 },
  { x: 274, y: 1140, w: 390, h: 234, shape: 'rounded', rotation: 0 },
];

// 4. Scuderia Ferrari Racing (724x2172) - motorsport photo strip
const ferrariSlots = [
  { x: 62, y: 237, w: 600, h: 389, shape: 'rounded', rotation: 0 },
  { x: 62, y: 688, w: 600, h: 377, shape: 'rounded', rotation: 0 },
  { x: 62, y: 1126, w: 600, h: 354, shape: 'rounded', rotation: 0 },
  { x: 62, y: 1538, w: 600, h: 361, shape: 'rounded', rotation: 0 },
];

// 5. Web-Slinging Comic (608x1712) - comic book strip panels (2x of 304x856)
const comicSlots = comicPhotoBounds.map(s => ({ ...s, shape: 'rect', rotation: 0 }));

export const customFrames = [
  {
    id: 'about-you',
    name: 'About You',
    note: 'Do you think I have forgotten about you?',
    category: 'Music & Editorial',
    collection: 'MUSIC & EDITORIAL',
    releaseOrder: 36,
    w: 887,
    h: 1774,
    bg: '#242426',
    ink: '#181818',
    assetArtwork: true,
    palette: { paper: '#242426', ink: '#181818', accent: '#f4f2ee' },
    slots: aboutYouSlots.map(s => ({ ...s })),
    decorations: { custom: 'about-you', ink: '#181818', captionFont: 'serif', collection: 'MUSIC & EDITORIAL' },
    layout: { branding: { x: 443, y: 1700, w: 320, h: 22 }, date: { x: 443, y: 1730, w: 200, h: 14 } },
  },
  {
    id: 'cosy-micasa',
    name: 'Cosy Micasa Cottage',
    note: 'Little cottage moments, right at home.',
    category: 'Cozy & Lifestyle',
    collection: 'COZY & LIFESTYLE',
    releaseOrder: 35,
    w: 941,
    h: 1672,
    bg: '#f7f3eb',
    ink: '#733221',
    assetArtwork: true,
    palette: { paper: '#f7f3eb', ink: '#733221', accent: '#b36442' },
    slots: micasaSlots.map(s => ({ ...s, x: s.x - 8, y: s.y - 8, w: s.w + 16, h: s.h + 16, shape: 'rect' })),
    decorations: { custom: 'cosy-micasa', ink: '#733221', captionFont: 'cursive', collection: 'COZY & LIFESTYLE' },
    layout: { branding: { x: 470, y: 1595, w: 260, h: 20 }, date: { x: 470, y: 1625, w: 180, h: 14 } },
  },
  {
    id: 'midnight-memo',
    name: 'Midnight Memo',
    note: 'Four moments from the midnight edition.',
    category: 'Vintage & Scrapbook',
    collection: 'VINTAGE & SCRAPBOOK',
    releaseOrder: 34,
    w: 941,
    h: 1672,
    bg: '#252528',
    ink: '#f5efe7',
    assetArtwork: true,
    palette: { paper: '#252528', ink: '#f5efe7', accent: '#c9933b' },
    slots: memoSlots.map(s => ({ ...s })),
    decorations: { custom: 'midnight-memo', ink: '#f5efe7', captionFont: 'serif', collection: 'VINTAGE & SCRAPBOOK' },
    layout: { branding: { x: 470, y: 1595, w: 280, h: 20 }, date: { x: 470, y: 1625, w: 180, h: 14 } },
  },
  {
    id: 'ferrari-racing',
    name: 'Ferrari Racing',
    note: 'Speed, precision, and four fast moments.',
    category: 'Racing & Motorsport',
    collection: 'RACING & MOTORSPORT',
    releaseOrder: 33,
    w: 724,
    h: 2172,
    bg: '#0c0d10',
    ink: '#ffffff',
    assetArtwork: true,
    palette: { paper: '#0c0d10', ink: '#ffffff', accent: '#e10600' },
    slots: ferrariSlots.map(s => ({ ...s })),
    decorations: { custom: 'ferrari-racing', ink: '#ffffff', captionFont: 'sans-serif', collection: 'RACING & MOTORSPORT' },
    layout: { branding: { x: 362, y: 2090, w: 320, h: 22 }, date: { x: 362, y: 2120, w: 200, h: 14 } },
  },
  {
    id: 'web-slinging-comic',
    name: 'Web-Slinging Comic',
    note: 'Action-packed panels with your friendly neighborhood hero.',
    category: 'Comic & Pop Art',
    collection: 'COMIC & POP ART',
    releaseOrder: 32,
    w: 608,
    h: 1712,
    bg: '#141c2c',
    ink: '#e23636',
    assetArtwork: true,
    palette: { paper: '#141c2c', ink: '#e23636', accent: '#ffd23f' },
    slots: comicSlots.map(s => ({ ...s })),
    decorations: { custom: 'web-slinging-comic', ink: '#e23636', captionFont: 'sans-serif', collection: 'COMIC & POP ART' },
    layout: { branding: { x: 304, y: 1640, w: 280, h: 20 }, date: { x: 304, y: 1668, w: 180, h: 12 } },
  },
];

// Cache for prepared overlay canvases
const cache = new Map();

// Helper to prepare About You overlay (removes fake checkerboard inside windows)
function prepareAboutYouOverlay(img) {
  const w = 887, h = 1774;
  const c = canvas(w, h);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const rot = -0.076;
  const cos = Math.cos(-rot), sin = Math.sin(-rot);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (const s of aboutYouSlots) {
        const cx = s.x + s.w / 2;
        const cy = s.y + s.h / 2;
        const dx = x - cx;
        const dy = y - cy;
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        // Inside slot rectangle with generous margin up to black border
        if (Math.abs(rx) <= (s.w / 2 + 6) && Math.abs(ry) <= (s.h / 2 + 6)) {
          const idx = (y * w + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          // Clear checkerboard pixels (light neutral), preserving dark camera body and border ink
          if (lum > 130 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) {
            d[idx + 3] = 0; // Transparent
          }
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

// Helper to prepare Midnight Memo (background card + overlay stickers)
function prepareMidnightMemo(img) {
  const w = 941, h = 1672;

  // Foreground overlay with transparent windows
  const fg = canvas(w, h);
  const fctx = fg.getContext('2d');
  fctx.drawImage(img, 0, 0);

  const imgData = fctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Clear card photo windows and old card interior
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      for (const s of memoSlots) {
        if (x >= s.x - 4 && x <= s.x + s.w + 4 && y >= s.y - 4 && y <= s.y + s.h + 4) {
          const idx = (y * w + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          // Preserve dark camera sticker at bottom-left corner
          const isCamera = (x <= 315 && y >= 1100 && y <= 1300 && (r < 180 || g < 180 || b < 180));
          if (!isCamera) {
            d[idx + 3] = 0; // Clear window opening
          }
        }
      }
      // Also clear old divider and margin areas inside card (y: 265..1378)
      if (x >= 268 && x <= 670 && y >= 265 && y <= 1378) {
        const inSlot = memoSlots.some(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
        if (!inSlot) {
          const idx = (y * w + x) * 4;
          const isCamera = (x <= 315 && y >= 1100 && y <= 1300 && d[idx] < 180);
          const isTicket = (x >= 640 && y >= 950 && y <= 1060);
          if (!isCamera && !isTicket) {
            d[idx + 3] = 0;
          }
        }
      }
    }
  }
  fctx.putImageData(imgData, 0, 0);

  // Background card layer
  const bg = canvas(w, h);
  const bctx = bg.getContext('2d');
  bctx.drawImage(img, 0, 0);
  // Fill the 4-slot card body with clean vintage cream
  bctx.fillStyle = '#f5efe7';
  bctx.shadowColor = '#00000030';
  bctx.shadowBlur = 8;
  bctx.shadowOffsetX = 2;
  bctx.shadowOffsetY = 4;
  bctx.fillRect(254, 250, 430, 1170);
  bctx.shadowColor = 'transparent';

  // Draw delicate slot frame borders
  bctx.strokeStyle = '#d4cdc2';
  bctx.lineWidth = 1.5;
  memoSlots.forEach(s => {
    bctx.strokeRect(s.x - 2, s.y - 2, s.w + 4, s.h + 4);
  });

  return { bg, fg };
}

// Helper to prepare Web-Slinging Comic (cropped 4-photo strip scaled 2x to 608x1712)
function prepareWebSlingingComic(img) {
  const targetW = 608, targetH = 1712;
  const cropX = 76, cropY = 206, cropW = 304, cropH = 856;

  const c = canvas(targetW, targetH);
  const ctx = c.getContext('2d');

  // Draw 2x scaled crop
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

  // Punch complete geometric openings, then restore only traced foreground.
  ctx.globalCompositeOperation = 'destination-out';
  for (const path of comicOpenings) ctx.fill(new Path2D(path));
  ctx.globalCompositeOperation = 'source-over';
  ctx.save();
  const foreground = new Path2D();
  for (const path of comicForeground) foreground.addPath(new Path2D(path));
  ctx.clip(foreground);
  const openings = new Path2D();
  for (const path of comicOpenings) openings.addPath(new Path2D(path));
  ctx.clip(openings);
  ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
  ctx.restore();
  return c;
}

export async function prepareCustomArtwork(frame) {
  const type = frame.decorations?.custom;
  if (!type || cache.has(type)) return;

  switch (type) {
    case 'about-you': {
      const img = await loadImage(CUSTOM_ASSETS.aboutYou);
      const overlay = prepareAboutYouOverlay(img);
      cache.set('about-you', { img, overlay });
      break;
    }
    case 'cosy-micasa': {
      const img = await loadImage(CUSTOM_ASSETS.micasa);
      cache.set('cosy-micasa', { img });
      break;
    }
    case 'midnight-memo': {
      const img = await loadImage(CUSTOM_ASSETS.midnightMemo);
      const { bg, fg } = prepareMidnightMemo(img);
      cache.set('midnight-memo', { img, bg, fg });
      break;
    }
    case 'ferrari-racing': {
      const img = await loadImage(CUSTOM_ASSETS.ferrari);
      cache.set('ferrari-racing', { img });
      break;
    }
    case 'web-slinging-comic': {
      const img = await loadImage(CUSTOM_ASSETS.webSlinging);
      const overlay = prepareWebSlingingComic(img);
      cache.set('web-slinging-comic', { img, overlay });
      break;
    }
  }
}

export function drawCustomFrame(ctx, frame, opts, layer) {
  const type = frame.decorations?.custom;
  if (!type) return;

  const data = cache.get(type);
  if (!data) return;

  const { w, h } = frame;

  if (layer === 'background') {
    if (type === 'midnight-memo' && data.bg) {
      ctx.drawImage(data.bg, 0, 0, w, h);
    } else if (type === 'web-slinging-comic') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
    } else if (type === 'about-you') {
      ctx.fillStyle = '#e8e4df';
      ctx.fillRect(0, 0, w, h);

    } else if (type === 'ferrari-racing') {
      ctx.fillStyle = '#0c0d10';
      ctx.fillRect(0, 0, w, h);
    }
  } else if (layer === 'foreground') {
    if (type === 'about-you' && data.overlay) {
      ctx.drawImage(data.overlay, 0, 0, w, h);
    } else if (type === 'cosy-micasa' && data.img) {
      ctx.drawImage(data.img, 0, 0, w, h);
    } else if (type === 'midnight-memo' && data.fg) {
      ctx.drawImage(data.fg, 0, 0, w, h);
    } else if (type === 'ferrari-racing' && data.img) {
      ctx.drawImage(data.img, 0, 0, w, h);
    } else if (type === 'web-slinging-comic' && data.overlay) {
      ctx.drawImage(data.overlay, 0, 0, w, h);
    }
  }
}
