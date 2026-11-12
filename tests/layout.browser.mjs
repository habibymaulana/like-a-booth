import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const phase=process.env.LAYOUT_PHASE||'after';const dir=`artifacts/layout/${phase}`;mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{await page.goto('http://127.0.0.1:5174/frames');await page.evaluate(()=>document.fonts.ready);
const outputs=await page.evaluate(async()=>{const {frames,compose,demoPhotos}=await import('/src/engine.js');const {auditArtwork}=await import('/src/artworkLayout.js');const photos=demoPhotos(42);const out=[];
for(const long of [false,true]){const sheet=document.createElement('canvas');sheet.width=1800;sheet.height=2700;const sc=sheet.getContext('2d');sc.fillStyle='#f4f2ee';sc.fillRect(0,0,sheet.width,sheet.height);
for(let i=0;i<frames.length;i++){const f=frames[i];const opts=long?{date:true,caption:'A very long caption with wonderful memories to keep',text:{[f.id]:Object.fromEntries((f.fields||[]).map(v=>[v.key,v.key==='song'?'A soundtrack for all the unforgettable evenings together':v.key==='artist'?'The little orchestra of our everyday lives':v.key==='mood'?'Very good company, always and forever':'An extended multi word heading for unforgettable moments']))}}:{};const c=document.createElement('canvas');await compose(c,f,photos,opts);assertDummy(c.width===f.w&&c.height===f.h);const size=Math.min(265/f.w,485/f.h),x=i%6*300,y=Math.floor(i/6)*540;sc.drawImage(c,x+(300-f.w*size)/2,y+8,f.w*size,f.h*size);sc.fillStyle='#101015';sc.font='13px sans-serif';sc.textAlign='center';sc.fillText(f.name,x+150,y+520);out.push({id:f.id,long,png:c.toDataURL(),items:c.layoutItems||[],warnings:auditArtwork(c,f)});}
out.push({id:'contact-sheet',long,png:sheet.toDataURL()});}return out;function assertDummy(v){if(!v)throw Error('dimensions');}});
for(const o of outputs){writeFileSync(`${dir}/${o.id}${o.long?'-long':''}.png`,Buffer.from(o.png.split(',')[1],'base64'));delete o.png;if(o.warnings)assert.deepEqual(o.warnings,[],`${o.id} long=${o.long}`);}
writeFileSync(`${dir}/measurements.json`,JSON.stringify(outputs,null,2));assert.deepEqual(errors,[]);console.log(`${phase}: 58 full-resolution outputs, two contact sheets, no console errors`);
}finally{await browser.close();}
