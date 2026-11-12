import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});mkdirSync('artifacts/memory',{recursive:true});
try{
await page.goto('http://127.0.0.1:5174/frames');await page.waitForFunction(()=>document.querySelectorAll('.frame-grid canvas').length===31&&[...document.querySelectorAll('.frame-grid canvas')].every(c=>c.width>300));
const report=await page.evaluate(async()=>{const {frames,compose,demoPhotos}=await import('/src/engine.js');const {auditArtwork}=await import('/src/artworkLayout.js');const photos=demoPhotos(42);if(new Set(photos).size!==4)throw Error('four distinct photos');const out=[];
for(const f of frames.filter(f=>f.assetArtwork)){
 const c=document.createElement('canvas');await compose(c,f,photos);const normal=c.toDataURL();const warnings=auditArtwork(c,f);const solid=['#c94b63','#30a7a1','#6548c3','#dd9e32'].map(color=>{const p=document.createElement('canvas');p.width=600;p.height=760;const x=p.getContext('2d');x.fillStyle=color;x.fillRect(0,0,600,760);return p.toDataURL();});await compose(c,f,solid);const ctx=c.getContext('2d');const failures=[];const expected=[[201,75,99],[48,167,161],[101,72,195],[221,158,50]];
 for(let i=0;i<4;i++){const s=f.slots[i];for(const dx of [.2,.5,.8])for(const dy of [.2,.5,.8]){const pixel=ctx.getImageData(s.x+s.w*dx,s.y+s.h*dy,1,1).data;if(expected[i].some((v,n)=>v!==pixel[n]))failures.push(`${i}/${dx}/${dy}: ${pixel}`);}}
 const fixture=c.toDataURL();await compose(c,f,photos,{effect:'Monochrome',caption:'Four moments, made to keep.',date:true});out.push({id:f.id,normal,fixture,edited:c.toDataURL(),dimensions:[c.width,c.height],warnings,failures});
}
return out;});
for(const f of report)for(const key of ['normal','fixture','edited']){writeFileSync(`artifacts/memory/${f.id}-${key}.png`,Buffer.from(f[key].split(',')[1],'base64'));delete f[key];}
console.log(JSON.stringify(report,null,2));writeFileSync('artifacts/memory/render-report.json',JSON.stringify(report,null,2));for(const f of report)assert.deepEqual(f.failures,[],f.id);assert.deepEqual(errors,[]);
}finally{await browser.close();}
