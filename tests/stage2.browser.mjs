import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=process.env.BOOTH_URL||'http://127.0.0.1:5174';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const directory='artifacts/stage2';mkdirSync(directory,{recursive:true});
const errors=[],missing=[];page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
const report={};
try{
  await page.addInitScript(()=>{window.cameraRequests=0;const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=(...args)=>{window.cameraRequests++;return original(...args);};});
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500);
  await page.screenshot({path:`${directory}/flash-before.png`});
  // Real requestAnimationFrame samples, with a rapid triple click in the same task.
  await page.evaluate(()=>{
    window.flashSamples=[];window.frameNavigations=0;
    const push=history.pushState.bind(history);history.pushState=(...args)=>{if(String(args[2]).includes('/frames'))window.frameNavigations++;return push(...args);};
    window.flashStart=performance.now();
    function sample(){const el=document.querySelector('.camera-flash');const box=el?.getBoundingClientRect();window.flashSamples.push({ms:performance.now()-window.flashStart,opacity:el?+getComputedStyle(el).opacity:0,present:!!el,path:location.pathname,width:box?.width,height:box?.height});if(performance.now()-window.flashStart<850)requestAnimationFrame(sample);}requestAnimationFrame(sample);
    const button=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Start session'));button.click();button.click();button.click();
  });
  await page.waitForURL('**/frames');await page.waitForFunction(()=>!document.querySelector('.camera-flash'));await page.waitForTimeout(450);
  await page.screenshot({path:`${directory}/flash-after.png`});
  report.flash=await page.evaluate(()=>({samples:window.flashSamples,navigations:window.frameNavigations,cameraRequests:window.cameraRequests,oldGeometry:document.querySelectorAll('.aperture,.shutter').length}));
  assert.equal(report.flash.navigations,1);assert.equal(report.flash.cameraRequests,0);assert.equal(report.flash.oldGeometry,0);
  assert(report.flash.samples.some(s=>s.opacity>.99));assert(report.flash.samples.some(s=>s.opacity>0&&s.opacity<1));
  assert(report.flash.samples.filter(s=>s.present).every(s=>s.width===1440&&s.height===1000));
  const peakIndex=report.flash.samples.findIndex(s=>s.opacity===1);
  for(let i=peakIndex+1;i<report.flash.samples.length;i++)assert(report.flash.samples[i].opacity<=report.flash.samples[i-1].opacity+.001,'Flash must not repeat');
  // Separately sample the real compositor timeline for reliable visual artifacts.
  // Pausing here avoids depending on screenshot encoder speed during a 60ms peak.
  await page.goto(base);await page.getByRole('button',{name:'Start session',exact:true}).click();
  await page.evaluate(()=>{const a=document.querySelector('.camera-flash').getAnimations()[0];a.pause();a.currentTime=60;});
  await page.screenshot({path:`${directory}/flash-fade-in.png`});
  await page.evaluate(()=>{const a=document.querySelector('.camera-flash')?.getAnimations()[0];if(a){a.currentTime=150;}});
  await page.screenshot({path:`${directory}/flash-peak.png`});
  await page.evaluate(()=>document.querySelector('.camera-flash')?.getAnimations()[0]?.play());
  await page.waitForURL('**/frames');await page.waitForFunction(()=>!document.querySelector('.camera-flash'));
  report.flash.screenshots='before/after live; fade-in and peak compositor paused at 60/150ms in a separate pass';
  // A cancelled animation must still reveal a usable frame studio.
  await page.goto(base);await page.getByRole('button',{name:'Start session',exact:true}).focus();await page.keyboard.press('Enter');
  await page.evaluate(()=>document.querySelector('.camera-flash')?.getAnimations()[0]?.cancel());
  await page.waitForURL('**/frames');await page.waitForFunction(()=>!document.querySelector('.camera-flash'));
  await page.getByRole('button',{name:/Circle Club/}).click();
  report.flash.cancelled='cleaned up; frame controls remain usable; Enter navigation works';
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);const start=Date.now();await page.getByRole('button',{name:'Start session',exact:true}).click();await page.waitForURL('**/frames');await page.waitForFunction(()=>!document.querySelector('.camera-flash'));report.flash.reducedMotion='immediate navigation, overlay removed';report.flash.reducedMotionWallMs=Date.now()-start;
  await page.emulateMedia({reducedMotion:'no-preference'});

  await page.goto(`${base}/frames`);await page.waitForFunction(()=>[...document.querySelectorAll('.frame-grid canvas')].every(c=>c.width>300));await page.evaluate(()=>document.fonts.ready);
  report.frames=await page.evaluate(async()=>{
    const {frames,compose,demoPhotos}=await import('/src/engine.js');const photos=demoPhotos();const results=[];
    const canvases=[...document.querySelectorAll('.frame-grid canvas')];
    for(let i=0;i<frames.length;i++){
      const f=frames[i],decorated=document.createElement('canvas'),plain=document.createElement('canvas'),alpha=document.createElement('canvas');
      await compose(decorated,f,photos);await compose(plain,f,photos,{decorations:false});await compose(alpha,f,photos,{transparent:true});
      const d=decorated.getContext('2d').getImageData(0,0,f.w,f.h).data,p=plain.getContext('2d').getImageData(0,0,f.w,f.h).data;
      let changed=0;for(let j=0;j<d.length;j+=4)if(d[j]!==p[j]||d[j+1]!==p[j+1]||d[j+2]!==p[j+2])changed++;
      if(changed<500)throw Error(`No meaningful decoration: ${f.id}`);
      for(const s of f.slots){const x=Math.round(s.x+s.w/2),y=Math.round(s.y+s.h/2),j=(y*f.w+x)*4;for(let channel=0;channel<4;channel++)if(d[j+channel]!==p[j+channel])throw Error(`Decoration covers photo center: ${f.id}`);}
      if(alpha.getContext('2d').getImageData(0,0,1,1).data[3]!==0)throw Error(`Lost transparent corner: ${f.id}`);
      const png=decorated.toDataURL('image/png');if(canvases[i].toDataURL('image/png')!==png)throw Error(`Thumbnail/export mismatch: ${f.id}`);
      results.push({id:f.id,size:`${f.w}x${f.h}`,changedPixels:changed,previewPixelMatch:true,png,bytes:Math.round((png.length-22)*.75)});
    }
    const same=demoPhotos(42),again=demoPhotos(42);if(same.some((p,i)=>p!==again[i])||new Set(same).size!==4)throw Error('Demo seed or variation regression');
    return results;
  });
  for(const result of report.frames){writeFileSync(`${directory}/frame-${result.id}.png`,Buffer.from(result.png.split(',')[1],'base64'));delete result.png;}

  const widths=[1440,1024,768,390,320];report.responsive=[];
  async function check(name){for(const width of widths){await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} overflow at ${width}`);if([1440,390,320].includes(width))await page.screenshot({path:`${directory}/${name}-${width}.png`,fullPage:true,animations:'disabled'});}report.responsive.push({page:name,widths});}
  await page.goto(base);await check('home');
  // Transform positions actually change, and hovering pauses the moving elements.
  await page.setViewportSize({width:1440,height:1000});await page.mouse.move(0,0);
  const transform=await page.locator('.orbit-path').first().evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(150);assert.notEqual(await page.locator('.orbit-path').first().evaluate(e=>getComputedStyle(e).transform),transform);
  await page.locator('.orbit-photo').first().hover({force:true});assert.equal(await page.locator('.orbit-path').first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');report.orbit='moving transforms and hover pause verified';
  await page.goto(`${base}/frames`);await check('frames');
  await page.getByRole('button',{name:/Try Editor/}).click();await page.waitForFunction(()=>document.querySelector('.editor-preview canvas')?.width>300);await check('editor');
  await page.setViewportSize({width:1024,height:1000});
  const editorPng=await page.locator('.editor-preview canvas').evaluate(c=>c.toDataURL('image/png'));
  await page.getByRole('button',{name:'Preview finished artwork'}).click();await page.waitForURL('**/result');
  assert.equal(await page.locator('.result-image img').getAttribute('src'),editorPng);report.editorExport='editor canvas and result PNG data are byte-identical';
  const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'Download PNG'}).click();const download=await downloadPromise;await download.saveAs(`${directory}/download.png`);assert.equal(await download.failure(),null);report.download='browser download completed';
  await page.goto(`${base}/capture`);await check('camera');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);assert.equal(await page.locator('.orbit-path').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);report.errors=errors;report.missingResources=missing;
  writeFileSync(`${directory}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,flash:{...report.flash,samples:`${report.flash.samples.length} animation frame samples`}},null,2));
}finally{await browser.close();}
