import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => {
  if (m.type() === 'error') errors.push(m.text());
});

mkdirSync('artifacts/custom', { recursive: true });

try {
  await page.goto('http://127.0.0.1:5174/frames');
  
  // Wait for the grid to have 36 canvases
  await page.waitForFunction(() => document.querySelectorAll('.frame-grid canvas').length === 36);

  // Check the ordering in the DOM
  const frameCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.frame-grid .frame-card h3')).map(h => h.textContent);
  });

  console.log('Total frames in DOM:', frameCards.length);
  console.log('First 7 frames:', frameCards.slice(0, 7));

  // Verify the top 5 are the 5 new frames
  const expectedTop5 = [
    'About You',
    'Cosy Micasa Cottage',
    'Midnight Memo',
    'Ferrari Racing',
    'Web-Slinging Comic',
  ];
  assert.deepEqual(frameCards.slice(0, 5), expectedTop5, 'Top 5 frames in "All frames" must be the newest releases');

  // Verify category filtering works
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.collection-tabs button')).find(b => b.textContent === 'Music & Editorial');
    btn?.click();
  });
  await page.waitForTimeout(300);

  const musicCards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.frame-grid .frame-card h3')).map(h => h.textContent);
  });
  console.log('Music & Editorial category frames:', musicCards);
  assert.ok(musicCards.includes('About You'));

  // Switch back to "All frames"
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.collection-tabs button')).find(b => b.textContent === 'All frames');
    btn?.click();
  });
  await page.waitForTimeout(300);

  // Now render each of the 5 new custom frames at full resolution using compose
  const renderResults = await page.evaluate(async () => {
    const { frames, compose, demoPhotos } = await import('/src/engine.js');
    const photos = demoPhotos(42);
    const targetIds = [
      'about-you',
      'cosy-micasa',
      'midnight-memo',
      'ferrari-racing',
      'web-slinging-comic',
    ];

    const out = [];
    for (const id of targetIds) {
      const f = frames.find(item => item.id === id);
      if (!f) throw new Error(`Frame ${id} not found`);

      // Normal render with 4 distinct demo photos
      const cNormal = document.createElement('canvas');
      await compose(cNormal, f, photos);
      const normalData = cNormal.toDataURL('image/png');

      // Edited render with monochrome + caption + date
      const cEdited = document.createElement('canvas');
      await compose(cEdited, f, photos, {
        effect: 'Monochrome',
        caption: 'Four moments, made to keep.',
        date: true,
      });
      const editedData = cEdited.toDataURL('image/png');

      out.push({
        id: f.id,
        name: f.name,
        category: f.category,
        collection: f.collection,
        releaseOrder: f.releaseOrder,
        dimensions: [f.w, f.h],
        normalData,
        editedData,
      });
    }
    return out;
  });

  // Save the full resolution PNGs
  for (const r of renderResults) {
    writeFileSync(`artifacts/custom/${r.id}-normal.png`, Buffer.from(r.normalData.split(',')[1], 'base64'));
    writeFileSync(`artifacts/custom/${r.id}-edited.png`, Buffer.from(r.editedData.split(',')[1], 'base64'));
    console.log(`Saved artifacts/custom/${r.id}-normal.png and edited.png (${r.dimensions[0]}x${r.dimensions[1]})`);
    delete r.normalData;
    delete r.editedData;
  }

  writeFileSync('artifacts/custom/validation-report.json', JSON.stringify({ renderResults, errors }, null, 2));
  console.log('Validation finished without errors!');
  assert.deepEqual(errors, [], 'No browser console errors');
} finally {
  await browser.close();
}

