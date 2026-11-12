import {traceShape} from './shapes';

export const ART_SPACING={outer:24,gap:12,text:8,photo:14};
export const rect=(x,y,w,h)=>({x,y,w,h});
export const normalizedBox=(frame,x,y,w,h)=>rect(x*frame.w,y*frame.h,w*frame.w,h*frame.h);
const textMetrics=(ctx,value,size,font,weight)=>{
 ctx.font=`${weight} ${size}px ${font}`;
 const m=ctx.measureText(value||'Mg');
 return {width:value?ctx.measureText(value).width:0,ascent:m.actualBoundingBoxAscent||size*.78,descent:m.actualBoundingBoxDescent||size*.22};
};
function splitLines(ctx,value,width,maxLines){
 const lines=[];let line='';
 for(const word of value.split(/\s+/u)){
   const trial=line?`${line} ${word}`:word;
   if(ctx.measureText(trial).width<=width)line=trial;
   else{
     if(line)lines.push(line);
     line=word;
     // Break unspaced strings by Unicode code point rather than overflowing.
     if(ctx.measureText(line).width>width){let chunk='';for(const char of line){if(ctx.measureText(chunk+char).width>width&&chunk){lines.push(chunk);chunk=char;}else chunk+=char;}line=chunk;}
   }
 }
 if(line)lines.push(line);
 return {lines:lines.slice(0,maxLines),truncated:lines.length>maxLines};
}
function transformBox(ctx,b){const t=ctx.getTransform();const corners=[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]].map(([x,y])=>({x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f}));const x=Math.min(...corners.map(p=>p.x)),y=Math.min(...corners.map(p=>p.y));return rect(x,y,Math.max(...corners.map(p=>p.x))-x,Math.max(...corners.map(p=>p.y))-y);}
export function recordAsset(ctx,label,box){ctx.canvas.layoutItems?.push({kind:'asset',label,...transformBox(ctx,box)});}

// Font fitting changes font size, never horizontal glyph scale. Actual ink bounds
// determine baselines, with wrapping and a final ellipsis for pathological input.
export function drawText(ctx,value,box,{size=18,minSize=size*.75,font='sans-serif',weight='400',align='left',maxLines=1,label='text'}={}){
 value=String(value??'').trim();if(!value||box.w<=0||box.h<=0)return [];
 ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';
 let chosen,step=size;
 for(;step>=minSize-.01;step-=.5){
   textMetrics(ctx,value,step,font,weight);
   const fit=splitLines(ctx,value,box.w,maxLines),m=textMetrics(ctx,'Mg',step,font,weight),lineHeight=Math.max(step*1.18,m.ascent+m.descent+2);
   if(!fit.truncated&&fit.lines.every(s=>ctx.measureText(s).width<=box.w)&&Math.max(...fit.lines.map(s=>ctx.measureText(s).actualBoundingBoxAscent||step*.78))+Math.max(...fit.lines.map(s=>ctx.measureText(s).actualBoundingBoxDescent||0))+lineHeight*(fit.lines.length-1)<=box.h){chosen={...fit,m,lineHeight,size:step};break;}
 }
 if(!chosen){const fitSize=Math.min(minSize,box.h/1.2);const m=textMetrics(ctx,'Mg',fitSize,font,weight),lineHeight=fitSize*1.2;const fit=splitLines(ctx,value,box.w,Math.max(1,Math.min(maxLines,Math.floor(box.h/lineHeight))));const lines=fit.lines;
   if(fit.truncated&&lines.length){let last=lines.at(-1);while(last&&ctx.measureText(last+'…').width>box.w)last=Array.from(last).slice(0,-1).join('');lines[lines.length-1]=last+'…';}
   chosen={lines,m,lineHeight,size:fitSize};
 }
 textMetrics(ctx,'Mg',chosen.size,font,weight);
 chosen.m.ascent=Math.max(...chosen.lines.map(s=>ctx.measureText(s).actualBoundingBoxAscent||0));chosen.m.descent=Math.max(...chosen.lines.map(s=>ctx.measureText(s).actualBoundingBoxDescent||0));
 let blockHeight=chosen.m.ascent+chosen.m.descent+chosen.lineHeight*(chosen.lines.length-1);
 while(blockHeight>box.h&&chosen.size>8){chosen.size*=.95;textMetrics(ctx,'Mg',chosen.size,font,weight);chosen.lineHeight=chosen.size*1.2;chosen.m.ascent=Math.max(...chosen.lines.map(s=>ctx.measureText(s).actualBoundingBoxAscent||0));chosen.m.descent=Math.max(...chosen.lines.map(s=>ctx.measureText(s).actualBoundingBoxDescent||0));blockHeight=chosen.m.ascent+chosen.m.descent+chosen.lineHeight*(chosen.lines.length-1);}
 const top=box.y+(box.h-blockHeight)/2;
 const output=[];
 chosen.lines.forEach((line,i)=>{
   const m=ctx.measureText(line),width=m.width;
   const overhang=m.actualBoundingBoxLeft||0,inkWidth=overhang+(m.actualBoundingBoxRight||width);
   const left=(align==='center'?box.x+(box.w-inkWidth)/2:align==='right'?box.x+box.w-inkWidth:box.x)+overhang;
   const baseline=top+chosen.m.ascent+i*chosen.lineHeight;
   ctx.fillText(line,left,baseline);
   const bounds=transformBox(ctx,rect(left-(m.actualBoundingBoxLeft||0),baseline-(m.actualBoundingBoxAscent||chosen.m.ascent),(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||width),(m.actualBoundingBoxAscent||chosen.m.ascent)+(m.actualBoundingBoxDescent||0)));
   const item={kind:'text',label,text:line,fontSize:chosen.size,...bounds,zone:transformBox(ctx,box)};ctx.canvas.layoutItems?.push(item);output.push(item);
 });ctx.restore();return output;
}

// Preserve fixed legacy baselines while measuring/fitting their designated width.
export function baselineText(ctx,value,x,y,size,font='sans-serif',align='center',width){
 const margin=12;const available=width??(align==='left'?ctx.canvas.width-margin-x:align==='right'?x-margin:Math.min(x-margin,ctx.canvas.width-margin-x)*2);
 const m=textMetrics(ctx,String(value),size,font,'400');const left=align==='center'?x-available/2:align==='right'?x-available:x;
 return drawText(ctx,value,rect(left,y-m.ascent,available,m.ascent+m.descent),{size,minSize:size*.8,font,align,label:String(value)});
}

export function artworkZones(f){
 const u=f.w/600,expanded=f.decorations?.expanded,tech=['camera','crt','monitor'].includes(f.decorations?.style);
 const first=Math.min(...f.slots.map(s=>s.y)),bottom=Math.max(...f.slots.map(s=>s.y+s.h));
 return {
  outer:normalizedBox(f,ART_SPACING.outer/600,ART_SPACING.outer*u/f.h,1-ART_SPACING.outer/300,1-2*ART_SPACING.outer*u/f.h),
  header:rect(40*u,28*u,f.w-80*u,Math.max(0,first-56*u)),
  title:expanded?rect(40*u,tech?82:64,f.w-(['track','fast','finish'].includes(f.decorations.style)?180:80)*u,tech?76:60):rect(f.w*.1,f.h-105,f.w*.8,28),
  subtitle:expanded?rect(40*u,tech?160:150,f.w-80*u,tech?40:24):rect(f.w*.12,f.h-124,f.w*.76,18),
  technical:rect(40*u,bottom+30*u,f.w-80*u,30*u),
  decoration:rect(40*u,f.h-150,f.w-80*u,48),
  footer:rect(40*u,bottom+20,f.w-80*u,Math.max(0,f.h-bottom-44)),
  branding:rect(32*u,f.h-(expanded?85:69),f.w-64*u,expanded?36:22),
  date:rect(32*u,f.h-44,f.w-64*u,13),
 };
}
let fontReady;
export function ensureArtworkFonts(){return fontReady??=Promise.all([document.fonts.ready,...['sans-serif','serif','monospace','cursive'].map(font=>document.fonts.load(`400 24px ${font}`))]);}
const overlaps=(a,b)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;
export function auditArtwork(canvas,frame){
 const items=canvas.layoutItems||[],warnings=[];const texts=items.filter(i=>i.kind==='text');
 const probe=document.createElement('canvas').getContext('2d');
 const hitPhoto=b=>frame.slots.some(s=>{probe.resetTransform();probe.translate(s.x+s.w/2,s.y+s.h/2);probe.rotate(s.rotation);traceShape(probe,s.shape,s.w+4,s.h+4);for(let y=0;y<=4;y++)for(let x=0;x<=8;x++)if(probe.isPointInPath(b.x+b.w*x/8,b.y+b.h*y/4))return true;return false;});
 for(const t of texts){
   if(t.x<10||t.y<10||t.x+t.w>frame.w-10||t.y+t.h>frame.h-10)warnings.push({type:'edge',text:t.text});
   if(t.x<t.zone.x-1||t.y<t.zone.y-1||t.x+t.w>t.zone.x+t.zone.w+1||t.y+t.h>t.zone.y+t.zone.h+1)warnings.push({type:'zone',text:t.text});
   if(hitPhoto(t))warnings.push({type:'photo',text:t.text});
   for(const a of items.filter(i=>i.kind==='asset'))if(overlaps(t,a))warnings.push({type:'asset',text:t.text,asset:a.label});
 }
 for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++)if(overlaps(texts[i],texts[j]))warnings.push({type:'text',text:texts[i].text,other:texts[j].text});
 return warnings;
}
