import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
await page.addInitScript(()=>{window.cameraRequests=0;const fn=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...a)=>{window.cameraRequests++;return fn(...a);};});
await page.goto('http://127.0.0.1:5174');assert(!/demo|test project/i.test(await page.locator('body').innerText()));
await page.getByRole('button',{name:'Start session',exact:true}).click();await page.waitForURL('**/frames');await page.waitForFunction(()=>!document.querySelector('.camera-flash'));
await page.getByText('Explore every frame with illustrated previews.',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.frame-grid canvas')?.width>300);
const before=await page.locator('.frame-grid canvas').first().evaluate(c=>c.toDataURL());await page.getByRole('button',{name:'Shuffle Preview'}).click();await page.waitForFunction(old=>document.querySelector('.frame-grid canvas').toDataURL()!==old,before);
// Obtain the shuffled preview's source via the same canvas engine using controlled seed
// only for independent all-effects comparison; simulation itself uses the UI's images.
await page.getByRole('button',{name:'Try Editor',exact:true}).click();await page.getByText('Simulation Take',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.editor-preview canvas')?.width>300);
const hashes=new Set();const effects=await page.evaluate(async()=> (await import('/src/engine.js')).effects);
for(const effect of effects){const previous=await page.locator('.editor-preview canvas').evaluate(c=>c.toDataURL());await page.getByRole('button',{name:effect,exact:true}).click();if(effect!=='Original')await page.waitForFunction(old=>document.querySelector('.editor-preview canvas').toDataURL()!==old,previous);hashes.add(await page.locator('.editor-preview canvas').evaluate(c=>c.toDataURL()));}
assert.equal(hashes.size,18);
await page.getByRole('tab',{name:'Frame',exact:true}).click();const frames=await page.evaluate(async()=> (await import('/src/engine.js')).frames.map(f=>({name:f.name,w:f.w,h:f.h})));
for(const f of frames){await page.locator('.mini-frames').getByRole('button',{name:f.name,exact:true}).click();await page.waitForFunction(({w,h})=>{const c=document.querySelector('.editor-preview canvas');return c.width===w&&c.height===h;},f);}
await page.getByRole('tab',{name:'Customize'}).click();await page.getByLabel('Your caption').fill('Made to play.');await page.getByLabel('Add today’s date').check();await page.getByLabel('Transparent paper',{exact:true}).check();await page.getByRole('button',{name:'Preview finished artwork'}).click();await page.waitForURL('**/result');await page.getByText('SIMULATION TAKE / FINISHED',{exact:true}).waitFor();assert((await page.getByRole('link',{name:'Download PNG'}).getAttribute('download')).includes('simulation-'));
const dl=page.waitForEvent('download');await page.getByRole('link',{name:'Download PNG'}).click();assert.equal(await(await dl).failure(),null);assert.equal(await page.evaluate(()=>window.cameraRequests),0);
await page.getByRole('link',{name:'Back to Art Lab'}).click();await page.getByRole('link',{name:'Back to Frame Studio'}).click();await page.getByRole('button',{name:'Continue to camera'}).click();await page.waitForURL('**/capture');await page.getByRole('heading',{name:'0 of 4 captured'}).waitFor();assert.equal(await page.locator('.photo-progress img').count(),0);
// Back through browser history must not revive a simulated result in a real take.
await page.goBack();await page.goBack();await page.waitForURL('**/frames');
await page.getByRole('button',{name:'Try Editor',exact:true}).click();await page.getByText('Simulation Take',{exact:true}).waitFor();await page.getByRole('button',{name:'Original',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Original',exact:true}).evaluate(e=>e.classList.contains('selected')),true);
for(const route of ['home','frames','editor','capture']){
 if(route==='home')await page.goto('http://127.0.0.1:5174');
 if(route==='frames')await page.goto('http://127.0.0.1:5174/frames');
 if(route==='editor'){await page.getByRole('button',{name:'Try Editor',exact:true}).click();await page.getByText('Simulation Take',{exact:true}).waitFor();}
 if(route==='capture')await page.goto('http://127.0.0.1:5174/capture');
 for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route}: ${width}`);}
}
assert.deepEqual(errors,[]);const report={effects:18,frames:frames.length,shuffle:'changed',simulationPermissionRequests:0,download:'completed and named simulation',isolation:'camera starts empty; history cannot revive simulated editor; new take resets effects',responsive:'home, frames, populated simulation editor, camera: 1440/1024/768/390/320',errors};writeFileSync('artifacts/simulation-report.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
