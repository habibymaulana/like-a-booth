import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
try {
 await page.addInitScript(() => {
  window.audioCalls = [];
  const Native = window.AudioContext;
  window.AudioContext = class extends Native {
   constructor(...args) { super(...args); window.audioCalls.push({ active: navigator.userActivation.isActive }); }
  };
 });
 await page.goto('http://127.0.0.1:5173');
 assert.equal(await page.locator('.sound-toggle').count(), 0);
 await page.getByRole('button', { name: 'Start session', exact: true }).click();
 await page.waitForURL('**/frames');
 assert.deepEqual(await page.evaluate(() => window.audioCalls), [{ active: true }]);
 await page.waitForFunction(() => !document.querySelector('.camera-flash'));
 await page.getByRole('button', { name: 'Try Editor', exact: true }).click();
 await page.waitForFunction(() => document.querySelector('.editor-preview canvas')?.width > 300);
 await page.getByRole('tab', { name: 'Customize', exact: true }).click();
 const input = page.getByLabel('Your caption'); assert.equal(await input.inputValue(), '');
 assert.equal(await page.getByLabel('Add today’s date').isChecked(), false);
 const blank = await page.locator('.editor-preview canvas').evaluate(c => c.toDataURL());
 await input.fill('Our four moments');
 await page.waitForFunction(old => document.querySelector('.editor-preview canvas').toDataURL() !== old, blank);
 const custom = await page.locator('.editor-preview canvas').evaluate(c => c.toDataURL());
 for (const [name, data] of Object.entries({ blank, custom })) writeFileSync(`artifacts/refinement/${name}.png`, Buffer.from(data.split(',')[1], 'base64'));
 await input.fill('   ');
 await page.waitForFunction(old => document.querySelector('.editor-preview canvas').toDataURL() === old, blank);
 await input.fill('Keep me');
 await page.getByRole('tab', { name: 'Frame', exact: true }).click();
 await page.locator('.mini-frames').getByRole('button', { name: 'Classic Booth', exact: true }).click();
 await page.getByRole('tab', { name: 'Customize', exact: true }).click();
 assert.equal(await input.inputValue(), 'Keep me');
 await page.getByRole('button', { name: 'Reset edits', exact: true }).click();
 assert.equal(await input.inputValue(), '');
 await input.fill('Our four moments');
 await page.waitForTimeout(300);
 const final = await page.locator('.editor-preview canvas').evaluate(c => c.toDataURL());
 await page.getByRole('button', { name: 'Preview finished artwork', exact: true }).click();
 await page.waitForURL('**/result');
 assert.equal(await page.locator('.result-image img').getAttribute('src'), final);
 await page.goto('http://127.0.0.1:5173');
 await page.evaluate(() => { window.AudioContext = class { constructor() { throw new Error('Audio unavailable'); } }; });
 await page.getByRole('button', { name: 'Start session', exact: true }).click();
 await page.waitForURL('**/frames');
 assert.deepEqual(errors, []);
 console.log('Gesture audio, no toggle, audio failure navigation, empty/whitespace/custom captions, switching, reset and exact result passed.');
} finally { await browser.close(); }
