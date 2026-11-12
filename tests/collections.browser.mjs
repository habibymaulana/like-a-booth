import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});mkdirSync('artifacts/collections',{recursive:true});
try{
await page.goto('http://127.0.0.1:5174/frames');await page.waitForFunction(()=>document.querySelectorAll('.frame-grid canvas').length===29&&[...document.querySelectorAll('.frame-grid canvas')].every(c=>c.width>300));
const report=await page.evaluate(async()=>{
 const {frames,compose,demoPhotos,clipShape}=await import('/src/engine.js');const photos=demoPhotos();const sheet=document.createElement('canvas');sheet.width=1500;sheet.height=1500;const sc=sheet.getContext('2d');sc.fillStyle='#f4f2ee';sc.fillRect(0,0,1500,1500);const results=[];
 for(let i=12;i<frames.length;i++){
   const f=frames[i],c=document.createElement('canvas'),plain=document.createElement('canvas');await compose(c,f,photos);await compose(plain,f,photos,{decorations:false});
   if(c.toDataURL()!==document.querySelectorAll('.frame-grid canvas')[i].toDataURL())throw Error(`preview mismatch ${f.id}`);
   const p=plain.getContext('2d'),ctx=c.getContext('2d');for(const s of f.slots){const x=s.x+s.w/2,y=s.y+s.h/2;if(String(ctx.getImageData(x,y,1,1).data)!==String(p.getImageData(x,y,1,1).data))throw Error(`covered center ${f.id}`);}
   await compose(plain,f,photos,{transparent:true});if(plain.getContext('2d').getImageData(0,0,1,1).data[3])throw Error(`alpha ${f.id}`);
   const key=f.fields[0].key,edited=document.createElement('canvas');await compose(edited,f,photos,{text:{[f.id]:{[key]:'YOUR OWN EDITION'}}});if(c.toDataURL()===edited.toDataURL())throw Error(`text edit ${f.id}`);
   const n=i-12,x=n%6*250,y=Math.floor(n/6)*500,ratio=Math.min(215/f.w,435/f.h);sc.drawImage(c,x+(250-f.w*ratio)/2,y+10,f.w*ratio,f.h*ratio);sc.fillStyle='#101015';sc.font='12px sans-serif';sc.textAlign='center';sc.fillText(f.name,x+125,y+470);
   results.push({name:f.name,dimensions:[c.width,c.height],previewMatch:true,alpha:true,textEdit:true});
 }
 for(const shape of ['rounded','screen','organic']){const c=document.createElement('canvas');c.width=c.height=100;const x=c.getContext('2d');x.translate(50,50);clipShape(x,shape,100,100);x.fillRect(-50,-50,100,100);if(x.getImageData(0,0,1,1).data[3]||x.getImageData(50,50,1,1).data[3]!==255)throw Error(`mask ${shape}`);}
 return {frames:results,sheet:sheet.toDataURL()};
});writeFileSync('artifacts/collections/contact-sheet.png',Buffer.from(report.sheet.split(',')[1],'base64'));delete report.sheet;
for(const category of ['Label & Packaging','Music Mood','Retro Tech','Indie & Dark','Doodle & Comic','Race & Sport']){await page.getByRole('button',{name:category,exact:true}).click();const count=await page.locator('.frame-grid .frame-card').count();assert(count>=2&&count<=3);}
await page.getByRole('button',{name:'Music Mood',exact:true}).click();await page.getByRole('button',{name:/Now Playing MUSIC MOOD/i}).click();await page.getByRole('button',{name:'Try Editor',exact:true}).click();await page.getByText('Simulation Take',{exact:true}).waitFor();await page.getByRole('tab',{name:'Customize'}).click();await page.getByLabel('Song title').fill('An original moment');await page.getByLabel('Artist name').fill('My soundtrack');await page.getByLabel('Mood tag').fill('DAY DREAM');await page.getByLabel('Add today’s date').check();
for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
await page.screenshot({path:'artifacts/collections/editor-320.png',fullPage:true});await page.getByRole('button',{name:'Preview finished artwork'}).click();await page.waitForURL('**/result');const dl=page.waitForEvent('download');await page.getByRole('link',{name:'Download PNG'}).click();assert.equal(await(await dl).failure(),null);
await page.goto('http://127.0.0.1:5174/frames');for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
assert.deepEqual(errors,[]);report.errors=errors;report.responsive='Frame Studio and populated music editor at all five widths';report.download='customized music PNG completed';writeFileSync('artifacts/collections/report.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
