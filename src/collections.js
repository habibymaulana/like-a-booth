import {baselineText,drawText,rect,recordAsset} from './artworkLayout';
import {traceShape} from './shapes';

const field=(key,label,value,max=32)=>({key,label,default:value,max});
const editorial=[field('title','Title','Small moments, big feeling'),field('subtitle','Subtitle','AN INDEPENDENT EDITION'),field('mood','Mood tag','GOOD COMPANY',18)];
const music=[field('song','Song title','Late Night Replay'),field('artist','Artist name','Favorite Track'),field('subtitle','Subtitle','A little soundtrack for this moment',42),field('mood','Mood tag','ON REPEAT',18)];
const strip=(shape='rounded',offset=0)=>[0,1,2,3].map(i=>({x:70+(i%2?offset:0),y:185+i*280,w:460-offset,h:245,shape,rotation:0}));
const grid=(shape='screen')=>[0,1,2,3].map(i=>({x:65+i%2*445,y:260+Math.floor(i/2)*440,w:425,h:390,shape,rotation:0}));
const specs=[
 ['heart-facts','Heart Facts','Label & Packaging','#f5efdc','#171b19','#c94f54','facts','rect',false],
 ['serving-size','Serving Size','Label & Packaging','#e6eccd','#27372b','#76905d','serving','rounded',false],
 ['now-playing','Now Playing','Music Mood','#232936','#f0eddc','#d3f49a','player','rounded',false],
 ['playlist-mood','Playlist Mood','Music Mood','#ddd7f4','#35324a','#7662b3','playlist','oval',false],
 ['cassette-pop','Cassette Pop','Music Mood','#fac7a7','#493549','#a33b70','cassette','rounded',false],
 ['pocket-camera','Pocket Camera','Retro Tech','#cdd4dc','#303847','#637b96','camera','screen',true],
 ['crt-memory','CRT Memory','Retro Tech','#e0cfad','#3c382f','#7b714e','crt','screen',true],
 ['tape-monitor','Tape Monitor','Retro Tech','#252e2f','#e5edcf','#e58c68','monitor','screen',false],
 ['midnight-monochrome','Midnight Monochrome','Indie & Dark','#191b23','#ede9df','#8b94b0','midnight','arch',false],
 ['after-dark','After Dark Strip','Indie & Dark','#2d2536','#ece0c9','#db9bba','afterdark','oval',false],
 ['indie-zine','Indie Zine','Indie & Dark','#ddd8ca','#292a31','#966358','zine','rect',true],
 ['sketch-pop','Sketch Pop','Doodle & Comic','#f8efda','#383941','#e37654','sketch','organic',false],
 ['campus-chaos','Campus Chaos','Doodle & Comic','#e7ebda','#293d48','#637fba','campus','rounded',true],
 ['daylight-saver','Daylight Saver','Doodle & Comic','#f7dda0','#6b4932','#e59058','daylight','arch',false],
 ['track-star','Track Star','Race & Sport','#dbecae','#252e29','#637c48','track','rounded',false],
 ['fast-lane','Fast Lane','Race & Sport','#e56f51','#282a30','#f7ebd4','fast','rect',false],
 ['finish-line','Finish Line','Race & Sport','#e9e8e1','#232e42','#4d5dff','finish','rounded',true],
];
export const newFrames=specs.map(([id,name,category,bg,ink,accent,style,shape,poster],i)=>({
 id,name,category,collection:category.toUpperCase(),note:'Four moments. Your own edition.',w:poster?1000:600,h:style==='monitor'?1640:poster?1300:1500,bg,
 palette:{paper:bg,ink,accent},slots:['camera','crt'].includes(style)?[0,1,2,3].map(n=>({x:90+n%2*460,y:310+Math.floor(n/2)*395,w:360,h:300,shape,rotation:0})):style==='monitor'?[0,1,2,3].map(n=>({x:80,y:240+n*300,w:440,h:234,shape,rotation:0})):category==='Music Mood'?[0,1,2,3].map(n=>({x:70,y:185+n*270,w:460,h:230,shape,rotation:0})):poster?grid(shape):strip(shape,style==='zine'?15:0),
 fields:category==='Music Mood'?music:editorial.map(f=>f.key==='title'?{...f,default:name.toUpperCase()}:f),
 decorations:{expanded:true,style,ink,accent,collection:category.toUpperCase(),edition:i+13},
}));

function line(c,x,y,x2,y2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function text(c,s,x,y,size,width,align='left',font='sans-serif'){
 baselineText(c,s,x,y,size,font,align,width);
}
function star(c,x,y,r){c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.23:r;i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.stroke();}
function checkers(c,x,y,w,h,size){for(let row=0;row<h/size;row++)for(let col=0;col<w/size;col++)if((row+col)%2===0)c.fillRect(x+col*size,y+row*size,size,size);}
function bars(c,x,y,w,h,seed=3){let n=seed;for(let i=0;i<w;i+=4){n=(n*17+11)%97;c.fillRect(x+i,y,(n%3)+1,h*(.4+n/162));}}
function waves(c,x,y,w,h){for(let i=0;i<36;i++){const height=(.15+Math.abs(Math.sin(i*1.7))*.85)*h;c.fillRect(x+i*w/36,y-height/2,w/60,height);}}
function play(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(x-r*.2,y-r*.4);c.lineTo(x+r*.4,y);c.lineTo(x-r*.2,y+r*.4);c.closePath();c.fill();}
function arrow(c,x,y,w){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+w*.5,y-18,x+w,y);c.lineTo(x+w-10,y-14);c.moveTo(x+w,y);c.lineTo(x+w-14,y+8);c.stroke();}

// Canvas-only original artwork. Foreground marks stay in margins and header/footer
// bands, so the subject masks and all four photographs remain unobstructed.
export function drawCollection(c,f,opts,layer){
 const a=f.decorations,style=a.style,w=f.w,h=f.h,scale=w/600;
 const ink=opts.accent||a.ink,accent=a.accent;
 const values=Object.fromEntries(f.fields.map(v=>[v.key,opts.text?.[f.id]?.[v.key]??v.default]));
 c.save();c.strokeStyle=ink;c.fillStyle=ink;c.lineWidth=1.5*scale;
 if(layer==='background'){
   if(style==='playlist'&&!opts.transparent&&!opts.bg){const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#e8d9e6');gradient.addColorStop(.5,'#ddd7f4');gradient.addColorStop(1,'#bdcce4');c.fillStyle=gradient;c.fillRect(0,0,w,h);}
   c.fillStyle=accent;c.globalAlpha=.13;
   if(['campus','sketch'].includes(style)){for(let x=25;x<w;x+=25*scale)line(c,x,22,x,h-100);for(let y=25;y<h-100;y+=25*scale)line(c,22,y,w-22,y);}
   if(['midnight','afterdark','zine'].includes(style)){for(let i=0;i<220;i++){const x=20+(i*137%(w-40)),y=20+(i*71%(h-40));c.fillRect(x,y,(i%4+1)*scale,scale);}}
   if(['fast','daylight'].includes(style)){c.beginPath();c.moveTo(w*.75,20);c.lineTo(w-20,20);c.lineTo(w*.25,h-100);c.lineTo(w*.05,h-100);c.closePath();c.fill();}
   if(style==='zine'){c.save();c.translate(w/2,h/2);c.rotate(-.035);c.fillStyle='#fbf5df';c.fillRect(-w*.46,-h*.39,w*.92,h*.78);c.restore();}
   c.globalAlpha=1;c.strokeStyle=accent;c.strokeRect(20,20,w-40,h-40);
   c.restore();return;
 }
 if(['camera','crt','monitor'].includes(style)){drawTech(c,f,opts,values);c.restore();return;}
 // Slot furniture reuses the exact path used to clip the exported photographs.
 f.slots.forEach((s,i)=>{
   c.save();c.translate(s.x+s.w/2,s.y+s.h/2);c.rotate(s.rotation);
   const bezel=['camera','crt','monitor'].includes(style);c.strokeStyle=bezel?accent:ink;c.lineWidth=bezel?12*scale:2*scale;
   traceShape(c,s.shape,s.w+12*scale,s.h+12*scale);c.stroke();
   if(style==='sketch'||style==='zine'){c.rotate(.008);c.lineWidth=scale;traceShape(c,s.shape,s.w+20*scale,s.h+18*scale);c.stroke();}
   c.restore();
   c.fillStyle=ink;c.strokeStyle=ink;c.lineWidth=scale;
   if(w>=1000)drawText(c,String(i+1).padStart(2,'0'),rect(s.x,s.y-37,65,18),{size:14,font:'monospace',label:`number-${i}`});else text(c,`${String(i+1).padStart(2,'0')}`,s.x-20*scale,s.y+16*scale,9*scale,24*scale,'center','monospace');
   if(style==='monitor'){text(c,'REC ●',s.x+5*scale,s.y-17*scale,10*scale,90*scale,'left','monospace');text(c,`00:00:0${i+1}`,s.x+s.w,s.y-17*scale,10*scale,100*scale,'right','monospace');}
   if(style==='camera'){c.strokeRect(s.x+s.w-50*scale,s.y-28*scale,40*scale,13*scale);c.fillRect(s.x+s.w-46*scale,s.y-24*scale,24*scale,5*scale);}
   if(style==='crt'){for(let n=0;n<3;n++){c.beginPath();c.arc(s.x+s.w+22*scale,s.y+s.h-25*scale-n*20*scale,4*scale,0,7);c.stroke();}}
   if(['zine','campus'].includes(style)){c.save();c.globalAlpha=.7;c.fillStyle=accent;c.translate(s.x+s.w*.3,s.y-14*scale);c.rotate(i%2?.08:-.08);c.fillRect(0,-8*scale,s.w*.35,16*scale);c.restore();}
 });
 const isMusic=f.category==='Music Mood';
 drawText(c,`LIKE A BOOTH / ${String(a.edition).padStart(2,'0')}`,rect(40*scale,30,w-80*scale,22),{size:Math.min(14*scale,18),font:'monospace',label:'edition'});
 drawText(c,(isMusic?f.name:values.title)||'',f.layout.title,{size:Math.min(39*scale,56),minSize:24,maxLines:2,label:'title'});
 drawText(c,values.mood||'',rect(w*.58,124,w*.42-40*scale,22),{size:Math.min(12*scale,16),align:'right',font:'monospace',label:'mood'});
 if(['facts','serving'].includes(style)){
   c.lineWidth=style==='facts'?9*scale:3*scale;line(c,40*scale,146*scale,w-40*scale,146*scale);c.lineWidth=scale;
   const y=h-170;line(c,40*scale,y-25*scale,w-40*scale,y-25*scale);
   text(c,style==='facts'?'SERVINGS OF JOY  /  4':'CONTENTS: FOUR GOOD MOMENTS',40*scale,y,12*scale,w-80*scale,'left','monospace');
   text(c,'Original moments 100%   /   Added worries 0%',40*scale,y+23*scale,10*scale,w-80*scale,'left','monospace');bars(c,40*scale,h-125,w*.3,38*scale,a.edition);recordAsset(c,'barcode',rect(40*scale,h-125,w*.3,38*scale));
 }else if(isMusic){
   const y=h-255;c.fillStyle=accent;const textWidth=style==='cassette'?w*.43:w-80*scale;
   drawText(c,values.song||'',rect(40*scale,y,textWidth,52),{size:25*scale,minSize:20,maxLines:2,label:'song'});c.fillStyle=ink;
   drawText(c,values.artist||'',rect(40*scale,y+60,textWidth,36),{size:16*scale,minSize:13,maxLines:2,label:'artist'});
   if(style==='cassette'){waves(c,w*.62,y+40,w*.27,28*scale);c.strokeRect(w*.60,y+14,w*.3,52*scale);recordAsset(c,'cassette equalizer',rect(w*.60,y+14,w*.3,52*scale));}
   c.globalAlpha=.35;line(c,40*scale,h-135,w-40*scale,h-135);c.globalAlpha=1;c.lineWidth=3*scale;line(c,40*scale,h-135,w*.58,h-135);c.lineWidth=scale;
   play(c,w/2,h-100,13*scale);recordAsset(c,'playback',rect(w/2-16*scale,h-116,32*scale,32*scale));text(c,'Ⅰ◀',w/2-50*scale,h-95,13*scale,30*scale,'center');text(c,'▶Ⅰ',w/2+50*scale,h-95,13*scale,30*scale,'center');
 }else if(['camera','crt','monitor'].includes(style)){
   text(c,style==='camera'?'POCKET ARCHIVE / DIGITAL STILL':style==='crt'?'CHANNEL 04 / MEMORY SIGNAL':'PLAYBACK / FOUR STORED MOMENTS',40*scale,h-180,12*scale,w-80*scale,'left','monospace');
   c.fillStyle=accent;waves(c,40*scale,h-130,w*.38,22*scale);play(c,w-60*scale,h-130,18*scale);
 }else if(['track','fast','finish'].includes(style)){
   const checkX=w>=1000?w*.72:40*scale;checkers(c,checkX,132*scale,80*scale,20*scale,10*scale);recordAsset(c,'checker motif',rect(checkX,132*scale,80*scale,20*scale));
   c.fillStyle=accent;c.fillRect(40*scale,h-185,65*scale,55*scale);c.fillStyle=ink;
   text(c,style==='track'?'01':style==='fast'?'04':'P1',72*scale,h-145,32*scale,60*scale,'center');
   text(c,'PERSONAL BEST / FOUR MOMENTS',120*scale,h-164,12*scale,w-160*scale,'left','monospace');
   for(let n=0;n<3;n++)line(c,w-90*scale+n*15*scale,55*scale,w-120*scale+n*15*scale,110*scale);
 }else{
   c.strokeStyle=accent;c.lineWidth=2*scale;
   star(c,40*scale,h*.43,17*scale);star(c,w-40*scale,h*.69,14*scale);
   if(['sketch','campus','daylight'].includes(style)){arrow(c,40*scale,145*scale,100*scale);arrow(c,w*.68,h-145,80*scale);c.strokeRect(40*scale,h-190,w*.53,45*scale);text(c,'KEEP THIS FEELING',50*scale,h-160,12*scale,w*.5,'left','monospace');}
   else{c.fillStyle=accent;text(c,style==='midnight'?'AFTER HOURS / BEFORE FOREVER':style==='afterdark'?'FOUR FRAMES FROM THE NIGHT':'CUT / KEEP / REPEAT',40*scale,h-150,15*scale,w-80*scale,'left','monospace');for(let i=0;i<30;i++)c.fillRect(40*scale+i*6*scale,h-124,(i%3+1)*scale,10*scale);}
 }
 c.fillStyle=ink;
 drawText(c,values.subtitle||'',f.layout.subtitle,{size:Math.min(14*scale,18),minSize:12,maxLines:2,font:'monospace',label:'subtitle'});
 c.restore();
}

function drawTech(c,f,opts,values){
 const {w,h}=f,a=f.decorations,u=w/600,grid=f.slots[0].w<400;
 const ink=opts.accent||a.ink;c.strokeStyle=ink;c.fillStyle=ink;
 const left=grid?65:40,right=w-left;
 drawText(c,`LIKE A BOOTH / ${a.edition}`,rect(left,grid?40:30,w-left*2,24),{size:grid?16:13,font:'monospace',label:'edition'});
 drawText(c,values.title,rect(left,grid?82:70,w-left*2,grid?76:70),{size:grid?50:39,minSize:grid?30:24,maxLines:2,label:'title'});
 drawText(c,values.subtitle,rect(left,grid?174:150,grid?530:300,grid?42:36),{size:grid?18:14,minSize:grid?15:12,maxLines:2,font:'monospace',label:'subtitle'});
 drawText(c,values.mood,rect(grid?650:365,grid?174:150,grid?285:195,grid?42:36),{size:grid?18:14,minSize:grid?15:12,maxLines:2,align:'right',font:'monospace',label:'mood'});
 if(a.style==='camera'){
   drawText(c,'POWER / AUTO',rect(left,222,380,22),{size:15,font:'monospace',label:'power'});
   const b=rect(right-80,225,72,18);c.lineWidth=2;c.strokeRect(b.x,b.y,b.w,b.h);c.fillRect(b.x+5,b.y+5,46,8);c.fillRect(b.x+b.w,b.y+5,6,8);recordAsset(c,'battery',rect(b.x-2,b.y-2,b.w+10,b.h+4));
 }else if(a.style==='crt')drawText(c,'SIGNAL / COLOR · CHANNEL 04',rect(left,222,w-left*2,22),{size:15,font:'monospace',label:'signal'});
 f.slots.forEach((s,i)=>{
   const row=rect(s.x,s.y-(grid?57:43),s.w,grid?24:20);
   drawText(c,`${String(i+1).padStart(2,'0')} / ${grid?'STILL':'TAPE'}`,rect(row.x,row.y,grid?150:100,row.h),{size:grid?16:13,font:'monospace',label:`number-${i}`});
   if(!grid){drawText(c,'REC ●',rect(s.x+135,row.y,100,row.h),{size:14,font:'monospace',label:`rec-${i}`});drawText(c,`00:00:0${i+1}`,rect(s.x+s.w-140,row.y,140,row.h),{size:14,align:'right',font:'monospace',label:`time-${i}`});}
   c.save();c.translate(s.x+s.w/2,s.y+s.h/2);c.strokeStyle=a.accent;c.lineWidth=grid?18:10;traceShape(c,s.shape,s.w+12,s.h+12);c.stroke();c.restore();
   if(a.style==='crt'){c.strokeStyle=ink;c.lineWidth=2;for(let n=0;n<3;n++){const x=i%2?952:500,y=s.y+s.h/2-25+n*25;c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.stroke();recordAsset(c,`CRT knob ${i}-${n}`,rect(x-6,y-6,12,12));}}
 });
 const footerY=grid?1055:Math.max(...f.slots.map(s=>s.y+s.h))+40;
 drawText(c,a.style==='camera'?'POCKET ARCHIVE / DIGITAL STILL':a.style==='crt'?'CHANNEL 04 / MEMORY SIGNAL':'PLAYBACK / FOUR STORED MOMENTS',rect(left,footerY,w-left*2,30),{size:grid?19:14,minSize:grid?16:12,font:'monospace',label:'technical footer'});
 const wave=rect(left,grid?1118:footerY+65,w*.38,grid?36:28);c.fillStyle=a.accent;waves(c,wave.x,wave.y+wave.h/2,wave.w,wave.h);recordAsset(c,'waveform',wave);
 const radius=grid?24:18,x=right-radius,y=wave.y+wave.h/2;play(c,x,y,radius);recordAsset(c,'playback',rect(x-radius-2,y-radius-2,radius*2+4,radius*2+4));
}
