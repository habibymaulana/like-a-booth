// Original user artwork is sampled as separate native header/footer and sticker
// assets. The six white source placeholders are never drawn into the composition.
export const MEMORY_ASSET='/assets/frames/Kawaii%20Photobooth%20Memory%20Strip%20Template.png';
const slots=[265,575,885,1195].map(y=>({x:68,y,w:427,h:270,shape:'rounded',rotation:0}));
export const memoryFrames=[
 {id:'midnight-memory',name:'Midnight Memory',note:'Four moments, one special day.',bg:'#202747',ink:'#202747',variant:'midnight',branding:{x:111,y:1680,w:206,h:24},date:{x:123,y:1712,w:180,h:12}},
 {id:'daydream-memory',name:'Daydream Memory',note:'Good times, tucked into a scrapbook.',bg:'#eee7ee',ink:'#202747',variant:'daydream',branding:{x:230,y:1663,w:225,h:24},date:{x:245,y:1694,w:182,h:12}},
].map(f=>({...f,w:543,h:1800,category:'Memory Scrapbook',collection:'MEMORY SCRAPBOOK',assetArtwork:true,palette:{paper:f.bg,ink:f.ink,accent:'#c73740'},slots:slots.map(s=>({...s})),decorations:{memory:f.variant,ink:f.ink,captionFont:'cursive',collection:'MEMORY SCRAPBOOK'},layout:{branding:f.branding,date:f.date}}));

let prepared;
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const load=()=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Memory artwork could not be loaded.'));i.src=MEMORY_ASSET;});
function polygon(ctx,points,x=0,y=0){ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(px-x,py-y):ctx.moveTo(px-x,py-y));ctx.closePath();}

// Retain native pixels in sticker silhouettes, clear connected neutral source
// placeholder pixels, and restore a three-pixel native sticker halo. Enclosed
// character highlights remain intact; no source photo rectangle is copied.
function isolate(source,points,paper=false){
 const pad=paper?0:6,x=Math.floor(Math.min(...points.map(p=>p[0])))-pad,y=Math.floor(Math.min(...points.map(p=>p[1])))-pad;
 const w=Math.ceil(Math.max(...points.map(p=>p[0])))-x+pad+1,h=Math.ceil(Math.max(...points.map(p=>p[1])))-y+pad+1,c=canvas(w,h),ctx=c.getContext('2d');
 const mask=canvas(w,h),m=mask.getContext('2d');polygon(m,points,x,y);m.fill();m.lineJoin='round';m.lineWidth=pad*2;m.stroke();
 ctx.drawImage(source,-x,-y);ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);
 if(paper)return {canvas:c,x,y};
 const image=ctx.getImageData(0,0,w,h),d=image.data,n=w*h,candidate=new Uint8Array(n),visited=new Uint8Array(n),wall=new Uint8Array(n),queue=new Int32Array(n);
 for(let p=0;p<n;p++){const i=p*4,lum=d[i]*.299+d[i+1]*.587+d[i+2]*.114;candidate[p]=d[i+3]>0&&lum<145&&Math.min(d[i],d[i+1],d[i+2])<100?1:0;}
 const neighbors=(p,visit)=>{if(p%w)visit(p-1);if(p%w<w-1)visit(p+1);if(p>=w)visit(p-w);if(p<n-w)visit(p+w);};
 // Discard the dark source paper connected to the crop boundary; outlined
 // sticker ink remains isolated by its original light die-cut edge.
 for(let start=0;start<n;start++){if(!candidate[start]||visited[start])continue;let read=0,write=0,edge=false;visited[start]=1;queue[write++]=start;
  while(read<write){const p=queue[read++];if(p%w===0||p%w===w-1||p<w||p>=n-w)edge=true;neighbors(p,q=>{if(candidate[q]&&!visited[q]){visited[q]=1;queue[write++]=q;}});}
  if(!edge)for(let j=0;j<write;j++)wall[queue[j]]=1;
 }
 // Close anti-aliased one-pixel contour gaps, then keep original pixels inside
 // the ink silhouette. This removes source photo borders, not sticker fills.
 const closed=new Uint8Array(wall);for(let p=0;p<n;p++)if(wall[p])neighbors(p,q=>{closed[q]=1;});
 const outside=new Uint8Array(n);let read=0,write=0;const seed=p=>{if(!closed[p]&&!outside[p]){outside[p]=1;queue[write++]=p;}};
 for(let x=0;x<w;x++){seed(x);seed(n-w+x);}for(let y=0;y<h;y++){seed(y*w);seed(y*w+w-1);}
 while(read<write)neighbors(queue[read++],seed);
 const distance=new Uint8Array(n);distance.fill(255);read=0;write=0;
 for(let p=0;p<n;p++)if(!outside[p]&&d[p*4+3]){distance[p]=0;queue[write++]=p;}
 while(read<write){const p=queue[read++],depth=distance[p]+1;if(depth>3)continue;neighbors(p,q=>{if(distance[q]===255&&d[q*4+3]){distance[q]=depth;queue[write++]=q;}});}
 for(let p=0;p<n;p++)if(distance[p]>3)d[p*4+3]=0;
 ctx.globalCompositeOperation='source-over';ctx.putImageData(image,0,0);return {canvas:c,x,y};
}
function band(image,x,y,w,h,top=0,bottom=0){const c=canvas(w,h),ctx=c.getContext('2d');ctx.drawImage(image,x,y,w,h,0,0,w,h);if(top||bottom){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,top?'#0000':'#000');if(top)g.addColorStop(top/h,'#000');if(bottom)g.addColorStop(1-bottom/h,'#000');g.addColorStop(1,bottom?'#0000':'#000');ctx.globalCompositeOperation='destination-in';ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}return c;}
const midnightStickers=[
 {points:[[495,863],[508,879],[525,872],[530,880],[519,892],[527,907],[514,904],[501,917],[496,911],[497,898],[483,895],[485,888],[497,884]],dx:0,dy:14},
 {points:[[274,196],[288,177],[283,165],[291,153],[306,151],[299,127],[312,102],[333,79],[349,77],[377,110],[394,114],[421,100],[457,93],[471,97],[471,133],[482,164],[485,191],[510,209],[517,226],[488,237],[474,232],[469,248],[445,249],[432,239],[338,239],[322,249],[294,246],[286,233],[273,227]],dx:0,dy:0},
 {points:[[82,212],[122,205],[128,211],[106,243],[118,242],[124,249],[95,281],[102,282],[100,289],[53,330],[45,335],[43,326],[63,282],[35,286],[28,280],[32,271]],dx:0,dy:0},
 {points:[[468,480],[488,511],[518,492],[531,497],[519,525],[541,539],[521,553],[528,580],[501,573],[483,603],[466,581],[438,593],[438,569],[404,554],[426,536],[415,510],[444,516]],dx:0,dy:25},
 {points:[[18,568],[145,531],[155,540],[152,550],[161,554],[164,566],[174,569],[180,592],[32,631],[26,619],[19,621],[15,603],[9,599]],dx:0,dy:10,paper:true},
 {points:[[5,824],[23,799],[53,788],[87,794],[117,815],[134,845],[140,874],[129,899],[107,914],[83,928],[58,934],[27,922],[10,905],[3,874]],dx:0,dy:40},
 {points:[[30,1087],[52,1112],[76,1098],[84,1104],[68,1127],[83,1156],[74,1164],[49,1152],[25,1178],[17,1174],[20,1142],[4,1134],[9,1124],[27,1120]],dx:0,dy:95},
 // Restore the ears above the native footer crop; its lower half is already there.
 {points:[[357,1193],[376,1172],[384,1149],[405,1129],[424,1127],[440,1143],[449,1171],[475,1144],[493,1132],[510,1137],[516,1155],[505,1184],[488,1202],[500,1228],[502,1260],[483,1285],[478,1305],[449,1320],[408,1318],[378,1308],[354,1317],[339,1305],[349,1287],[338,1265],[339,1231]],dx:0,dy:352},
];
const daydreamStickers=[
 {points:[[624,698],[630,712],[641,719],[630,729],[623,747],[617,729],[606,722],[616,714]],dx:-600,dy:350},
 {points:[[902,237],[1036,216],[1047,225],[1040,237],[1052,241],[1045,255],[1054,270],[909,294],[904,282],[894,279],[898,265],[889,260]],dx:-543,dy:0,paper:true},
 {points:[[1032,409],[1048,401],[1064,410],[1077,401],[1085,410],[1085,431],[1065,467],[1030,510],[1013,485],[1004,464],[1004,436],[1008,417],[1022,409]],dx:-543,dy:25},
 {points:[[971,552],[991,546],[1014,550],[1039,564],[1048,585],[1049,610],[1035,632],[1008,643],[976,663],[978,637],[960,626],[944,605],[941,579],[950,564]],dx:-508,dy:10},
 {points:[[529,764],[613,746],[630,755],[642,798],[654,805],[668,884],[660,898],[581,912],[566,890],[558,857],[534,855],[524,813],[521,785]],dx:-522,dy:40},
 {points:[[929,847],[1067,885],[1052,931],[913,891]],dx:-543,dy:0,paper:true},
 {points:[[981,1094],[997,1081],[1012,1093],[1020,1088],[1045,1102],[1085,1105],[1085,1163],[1062,1180],[1031,1172],[1003,1160],[982,1247],[967,1257],[958,1248]],dx:-543,dy:352},
];
export async function prepareMemoryFrame(frame){
 if(!frame.decorations.memory)return;
 if(!prepared)prepared=load().then(image=>{
  if(image.width!==1086||image.height!==1448)throw Error('The supplied memory artwork has changed dimensions.');
  const sprites=specs=>specs.map(s=>({...isolate(image,s.points,s.paper),dx:s.dx,dy:s.dy}));
  return {image,midnight:sprites(midnightStickers),daydream:sprites(daydreamStickers),bands:{midnight:{header:band(image,0,0,543,215,0,18),footer:band(image,0,1180,543,268,12,0),footerY:1532},daydream:{header:band(image,543,0,543,242,0,7),footer:band(image,543,1185,543,263,12,0),footerY:1537}}};
 }).catch(error=>{prepared=null;throw error;});
 await prepared;
}
let current;
export async function prepareMemoryArtwork(frame){await prepareMemoryFrame(frame);if(frame.decorations.memory)current=await prepared;}
export function drawMemoryFrame(ctx,frame,opts,layer){
 const type=frame.decorations.memory;if(!type||!current)throw Error('Memory artwork was not prepared.');
 const w=frame.w,h=frame.h;
 ctx.save();ctx.beginPath();ctx.roundRect(0,0,w,h,8);ctx.clip();
 if(layer==='background'){
  const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,opts.bg||frame.bg);gradient.addColorStop(1,type==='midnight'?'#171d38':'#c9bfdc');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.globalAlpha=.35;
  ctx.fillStyle=type==='midnight'?'#59618d':'#b5abd0';
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(w*.55,-30);ctx.lineTo((i-2)*220,h);ctx.lineTo((i-2)*220+100,h);ctx.closePath();ctx.fill();}
  ctx.restore();
  if(type==='daydream'){
   const tile=canvas(28,80),t=tile.getContext('2d');t.drawImage(current.image,547,650,28,80,0,0,28,80);ctx.globalAlpha=.08;ctx.fillStyle=ctx.createPattern(tile,'repeat');ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
  }
  // Native typography, paper collage, corner checks, tickets and board are intact.
  const bands=current.bands[type];ctx.drawImage(bands.header,0,0);ctx.drawImage(bands.footer,0,bands.footerY);
  frame.slots.forEach(s=>{ctx.save();ctx.shadowColor='#15182c66';ctx.shadowBlur=6;ctx.shadowOffsetY=3;ctx.fillStyle='#f6efe7';ctx.beginPath();ctx.roundRect(s.x-12,s.y-12,s.w+24,s.h+24,36);ctx.fill();ctx.restore();ctx.strokeStyle=type==='midnight'?'#c6bdb9':'#aca3ca';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(s.x-3,s.y-3,s.w+6,s.h+6,19);ctx.stroke();});
 }else{
  if(type==='daydream'){ctx.fillStyle='#d2333b';for(const [x,y,r] of [[28,345,10],[24,866,6],[515,1290,8]]){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}}
  for(const s of current[type])ctx.drawImage(s.canvas,s.x+s.dx,s.y+s.dy);
 }
 ctx.restore();
}
