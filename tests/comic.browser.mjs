import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
try {
  await page.goto('http://127.0.0.1:5173/frames');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const photos = [1,2,3,4].map(i => `data:image/jpeg;base64,${readFileSync(`artifacts/custom/reconstruction/photo-${i}.jpg`).toString('base64')}`);
  const result = await page.evaluate(async photos => {
    const { frames, compose } = await import('/src/engine.js');
    const { drawCustomFrame, prepareCustomArtwork } = await import('/src/customFrames.js');
    const f = frames.find(f => f.id === 'web-slinging-comic');
    await prepareCustomArtwork(f);
    const c = document.createElement('canvas');
    await compose(c, f, photos);
    const full = c.toDataURL();
    c.width = f.w; c.height = f.h;
    drawCustomFrame(c.getContext('2d'), f, {}, 'foreground');
    const overlay = c.toDataURL();
    const { comicOpenings, comicForeground } = await import('/src/comicGeometry.js');
    const mask = document.createElement('canvas'); mask.width = f.w; mask.height = f.h;
    const m = mask.getContext('2d');
    for (const p of comicOpenings) m.fill(new Path2D(p));
    m.globalCompositeOperation = 'destination-out';
    for (const p of comicForeground) m.fill(new Path2D(p));
    const holes = m.getImageData(0, 0, f.w, f.h).data;
    const pixels = c.getContext('2d').getImageData(0, 0, f.w, f.h).data;
    let opaqueInside = 0, checked = 0;
    for (let i = 3; i < holes.length; i += 4) {
      if (holes[i] === 255) { checked++; if (pixels[i] > 1) opaqueInside++; }
    }
    if (opaqueInside) throw new Error(`${opaqueInside} opaque placeholder pixels in openings`);
    const { CUSTOM_ASSETS } = await import('/src/customFrames.js');
    const original = await new Promise(resolve => { const i = new Image(); i.onload = () => resolve(i); i.src = CUSTOM_ASSETS.webSlinging; });
    const source = document.createElement('canvas'); source.width = f.w; source.height = f.h;
    const sc = source.getContext('2d'); sc.imageSmoothingQuality = 'high';
    sc.drawImage(original, 76, 206, 304, 856, 0, 0, 608, 1712);
    const sourcePixels = sc.getImageData(0, 0, f.w, f.h).data;
    m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, f.w, f.h);
    for (const p of comicOpenings) m.fill(new Path2D(p));
    const openingPixels = m.getImageData(0, 0, f.w, f.h).data;
    let preserved = 0;
    for (let i = 3; i < openingPixels.length; i += 4) {
      if (openingPixels[i] === 0) {
        for (let k = -3; k <= 0; k++) if (Math.abs(pixels[i+k] - sourcePixels[i+k]) > 2) throw new Error(`Artwork outside openings changed at ${((i-3)/4)%608},${Math.floor(((i-3)/4)/608)}: ${pixels[i+k]} vs ${sourcePixels[i+k]}`);
        preserved++;
      }
    }
    return { full, overlay, checked, preserved };

  }, photos);
  for (const [name, data] of Object.entries({ full: result.full, overlay: result.overlay })) writeFileSync(`artifacts/custom/reconstruction/${name}.png`, Buffer.from(data.split(',')[1], 'base64'));
  await page.getByRole('heading', { name: 'Web-Slinging Comic', exact: true }).click();
  const card = page.locator('.frame-card').filter({ has: page.getByRole('heading', { name: 'Web-Slinging Comic', exact: true }) });
  await card.locator('canvas').screenshot({ path: 'artifacts/custom/reconstruction/studio.png' });
  await page.getByRole('button', { name: 'Try Editor', exact: true }).click();
  await page.waitForURL('**/editor');
  await page.waitForFunction(() => document.querySelector('.editor-preview canvas')?.width === 608);
  await page.locator('.editor-preview canvas').screenshot({ path: 'artifacts/custom/reconstruction/simulation.png' });
  const editor = await page.locator('.editor-preview canvas').evaluate(c => c.toDataURL());
  await page.getByRole('button', { name: 'Preview finished artwork', exact: true }).click();
  await page.waitForURL('**/result');
  assert.equal(await page.locator('.result-image img').getAttribute('src'), editor);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download PNG', exact: true }).click();
  const file = await download;
  await file.saveAs('artifacts/custom/reconstruction/download.png');
  assert.equal(readFileSync('artifacts/custom/reconstruction/download.png').toString('base64'), editor.split(',')[1]);
  await page.locator('.result-image').screenshot({ path: 'artifacts/custom/reconstruction/results.png' });
  assert.deepEqual(errors, []);
  writeFileSync('artifacts/custom/reconstruction/validation.json', JSON.stringify({
    transparentOpeningPixelsChecked: result.checked, unchangedExteriorArtworkPixels: result.preserved,
    studio: 'rendered', simulation: 'rendered', results: 'identical to editor',
    downloadedPNG: 'byte-identical to editor', errors,
  }, null, 2));
} finally { await browser.close(); }
