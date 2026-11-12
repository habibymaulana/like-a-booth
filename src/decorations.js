import {baselineText,drawText} from './artworkLayout';
import {drawCollection} from './collections';
import {traceShape} from './shapes';

// All artwork is original, synchronous Canvas vector geometry. Coordinates in the
// manifest are fractions of the output size; motif sizes are fractions of width.
// The same two layers run in every thumbnail, editor and downloaded PNG.
const motif = (type,x,y,size,extra={}) => ({type,x,y,size,...extra});
export const decorationManifest = {
  classic: {
    collection:'PAPER EDITIONS',ink:'#39372f',accent:'#9b6e4b',texture:11,outline:'double',
    title:'THE EVERYDAY ARCHIVE',subtitle:'FOUR MOMENTS, KEPT FOREVER',
    layers:{background:[motif('rule',.5,.013,.91),motif('rule',.5,.915,.91)],foreground:[]},
  },
  oval: {
    collection:'BOTANICAL ARCHIVE',ink:'#484235',accent:'#6e795c',texture:22,outline:'oval',captionFont:'serif',
    title:'Les petits moments',subtitle:'BOTANICAL ARCHIVE · VOL. 02',
    layers:{background:[motif('sprig',.075,.08,.15,{rotation:-25}),motif('sprig',.91,.32,.15,{rotation:160}),motif('sprig',.075,.57,.15,{rotation:-20}),motif('sprig',.92,.81,.15,{rotation:155}),motif('flourish',.5,.014,.17)],foreground:[]},
  },
  circle: {
    collection:'PLAYFUL GEOMETRY',ink:'#fffbea',accent:'#dce8a1',secondary:'#a0aaff',texture:null,outline:'offset',
    title:'THE CIRCLE CLUB',subtitle:'EVERY SIDE IS YOUR GOOD SIDE',
    layers:{background:[motif('rings',.035,.265,.12,{opacity:.7}),motif('rings',.97,.71,.13),motif('star',.5,.47,.043),motif('star',.055,.92,.025),motif('star',.91,.93,.04),motif('dotgrid',.5,.025,.12)],foreground:[]},
  },
  arch: {
    collection:'MUSEUM COLLECTION',ink:'#4d3d2f',accent:'#816b49',texture:44,outline:'arch',captionFont:'serif',
    title:'Musée des moments',subtitle:'THE PORTRAIT COLLECTION / NO. 04',
    layers:{background:[motif('laurel',.12,.94,.07),motif('laurel',.88,.94,.07),motif('column',.5,.47,.035)],foreground:[]},
  },
  editorial: {
    collection:'CONTACT SHEETS',ink:'#22252a',accent:'#ad4638',texture:55,outline:'contact',
    title:'PERSONAL / CONTACT SHEET',subtitle:'SELECTED MOMENTS · AN INDEPENDENT EDITION',
    layers:{background:[motif('grid',.5,.5,.96,{opacity:.12}),motif('rule',.5,.052,.92),motif('rule',.5,.935,.92)],foreground:[]},
  },
  chrome: {
    collection:'ORBITAL STUDIES',ink:'#202639',accent:'#eef4ff',secondary:'#626d87',texture:null,outline:'chrome',
    title:'FUTURE NOSTALGIA',subtitle:'ORBITAL STUDIES / 06',
    layers:{background:[motif('metalOrbit',.5,.5,.97,{rotation:-28}),motif('metalOrbit',.5,.5,.91,{rotation:32}),motif('star',.5,.045,.06,{chrome:true}),motif('star',.945,.49,.075,{chrome:true}),motif('star',.06,.91,.055,{chrome:true})],foreground:[]},
  },
  ribbon: {
    collection:'SOFT IMPRESSIONS',ink:'#82495a',accent:'#b9657c',secondary:'#fae7dc',texture:77,outline:'ribbon',captionFont:'serif',
    title:'Take it softly',subtitle:'A LITTLE TENDERNESS, IN FOUR PARTS',
    layers:{background:[motif('wave',.055,.5,.12),motif('wave',.94,.5,.1,{rotation:180}),motif('bow',.5,.013,.055)],foreground:[]},
  },
  flower: {
    collection:'GARDEN NOTES',ink:'#485238',accent:'#6d7d4d',secondary:'#f6dfb5',texture:88,outline:'flower',captionFont:'serif',
    title:'In good company',subtitle:'PICKED FROM THE EVERYDAY GARDEN',
    layers:{background:[motif('flower',.5,.09,.075),motif('flower',.05,.485,.065),motif('flower',.94,.49,.07),motif('sprig',.5,.48,.09,{rotation:20}),motif('flower',.085,.93,.06),motif('sprig',.9,.94,.09,{rotation:70})],foreground:[]},
  },
  film: {
    collection:'ANALOG ORIGINALS',ink:'#eee3c7',accent:'#c6a05b',texture:99,outline:'film',
    title:'EXPOSURE / FOUR',subtitle:'35 MM · ISO 400 · ALL LIGHT IS GOOD LIGHT',
    layers:{background:[],foreground:[]},
  },
  polaroid: {
    collection:'SCRAPBOOK CLUB',ink:'#5a4a41',accent:'#56775f',secondary:'#d9b6a6',texture:111,outline:'polaroid',captionFont:'cursive',
    title:'little things, lately',subtitle:'NOTES FROM A VERY GOOD DAY',
    layers:{background:[motif('paper',.5,.48,.8,{rotation:4}),motif('handstar',.5,.37,.06,{rotation:12}),motif('sticker',.5,.87,.07,{rotation:-12}),motif('handstar',.08,.49,.035,{rotation:15})],foreground:[]},
  },
  postcard: {
    collection:'SENT WITH LOVE',ink:'#5c342d',accent:'#8c4634',texture:122,outline:'postcard',captionFont:'serif',
    title:'A postcard from right here',subtitle:'SOMEWHERE GOOD / WISH YOU WERE HERE',
    layers:{background:[motif('rule',.5,.84,.94),motif('stamp',.91,.91,.09,{rotation:5}),motif('postmark',.79,.89,.1,{rotation:-12}),motif('travel',.16,.91,.19)],foreground:[]},
  },
  gallery: {
    collection:'PRIVATE COLLECTION',ink:'#343c3c',accent:'#56716c',secondary:'#c67a5c',texture:133,outline:'gallery',
    title:'THE ART OF BEING HERE',subtitle:'A PRIVATE COLLECTION / FOUR ORIGINALS',
    layers:{background:[motif('abstract',.5,.48,.92),motif('star',.57,.86,.035),motif('rule',.5,.92,.91)],foreground:[]},
  },
};

const textureCache = new Map();
function paperTexture(ctx,w,h,seed) {
  let tile = textureCache.get(seed);
  if (!tile) {
    tile = document.createElement('canvas');tile.width=tile.height=96;
    const c=tile.getContext('2d');let n=seed;
    const next=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
    for(let i=0;i<170;i++){
      c.fillStyle=i%2?'rgba(35,29,22,.045)':'rgba(255,255,255,.15)';
      c.fillRect(next()*96,next()*96,.5+next(),.5+next()*2);
    }
    textureCache.set(seed,tile);
  }
  ctx.fillStyle=ctx.createPattern(tile,'repeat');ctx.fillRect(0,0,w,h);
}
function line(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function text(ctx,content,x,y,size,font='sans-serif',align='center'){
  baselineText(ctx,content,x,y,size,font,align);
}
function star(ctx,points=4,inner=.22){
  ctx.beginPath();for(let i=0;i<points*2;i++){
    const a=i*Math.PI/points-Math.PI/2,r=i%2?inner:.5;
    const x=Math.cos(a)*r,y=Math.sin(a)*r;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }ctx.closePath();
}
function sprig(ctx) {
  ctx.beginPath();ctx.moveTo(0,.5);ctx.bezierCurveTo(-.1,.15,.17,-.2,0,-.5);ctx.stroke();
  for(let i=0;i<5;i++){
    const y=.32-i*.17,side=i%2?1:-1;
    ctx.save();ctx.translate(.03,y);ctx.rotate(side*.8);
    ctx.beginPath();ctx.ellipse(side*.12,-.07,.055,.16,side*.55,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}
function motifPath(ctx,d,theme){
  switch(d.type){
    case 'rule':line(ctx,-.5,0,.5,0);break;
    case 'sprig':sprig(ctx);break;
    case 'laurel':ctx.save();ctx.translate(-.22,0);ctx.rotate(-.65);sprig(ctx);ctx.restore();ctx.save();ctx.translate(.22,0);ctx.scale(-1,1);ctx.rotate(-.65);sprig(ctx);ctx.restore();break;
    case 'flourish':
      for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(sign*.22,-.2,sign*.55,.16,sign*.4,.05);ctx.bezierCurveTo(sign*.2,-.08,sign*.2,.12,sign*.45,.12);ctx.stroke();}
      ctx.save();ctx.scale(.13,.13);star(ctx);ctx.fill();ctx.restore();break;
    case 'rings':for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(i*.055,0,.3+i*.09,0,Math.PI*2);ctx.stroke();}break;
    case 'star':
      if(d.chrome){const gradient=ctx.createLinearGradient(-.5,-.5,.5,.5);gradient.addColorStop(0,'#fff');gradient.addColorStop(.4,'#fff');gradient.addColorStop(.5,'#727b8c');gradient.addColorStop(.7,'#e8edf5');gradient.addColorStop(1,'#495467');ctx.fillStyle=gradient;}
      star(ctx);ctx.fill();break;
    case 'dotgrid':for(let y=0;y<3;y++)for(let x=0;x<5;x++){ctx.beginPath();ctx.arc((x-2)*.16,(y-1)*.13,.018,0,Math.PI*2);ctx.fill();}break;
    case 'column':for(let i=-1;i<=1;i++)line(ctx,i*.2,-.6,i*.2,.6);line(ctx,-.5,-.65,.5,-.65);line(ctx,-.5,.65,.5,.65);break;
    case 'grid':for(let i=-5;i<=5;i++){line(ctx,i*.1,-.65,i*.1,.65);line(ctx,-.5,i*.13,.5,i*.13);}break;
    case 'metalOrbit':{
      const gradient=ctx.createLinearGradient(-.5,0,.5,.2);gradient.addColorStop(0,'#f9fcff');gradient.addColorStop(.3,'#6b7586');gradient.addColorStop(.55,'#fff');gradient.addColorStop(1,'#677084');ctx.strokeStyle=gradient;
      ctx.lineWidth=.012;ctx.beginPath();ctx.ellipse(0,0,.5,.24,0,0,Math.PI*2);ctx.stroke();break;
    }
    case 'wave':
      ctx.fillStyle=theme.secondary;ctx.beginPath();ctx.moveTo(-.3,-11);ctx.bezierCurveTo(1,-7,-1,-4,.1,0);ctx.bezierCurveTo(1,4,-1,7,.2,11);ctx.lineTo(.75,11);ctx.bezierCurveTo(-.5,7,1.5,4,.6,0);ctx.bezierCurveTo(-.5,-4,1.5,-7,.3,-11);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(.2,-11);ctx.bezierCurveTo(1.4,-7,-.8,-4,.35,0);ctx.bezierCurveTo(1.4,4,-.8,7,.5,11);ctx.stroke();break;
    case 'bow':
      ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-.8,-.7,-.6,.6,0,0);ctx.bezierCurveTo(.8,-.7,.6,.6,0,0);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-.1,.3,-.3,.35,-.25,.6);ctx.moveTo(0,0);ctx.bezierCurveTo(.3,.2,.1,.5,.4,.55);ctx.stroke();break;
    case 'flower':
      ctx.fillStyle=theme.secondary;for(let i=0;i<7;i++){ctx.save();ctx.rotate(i*Math.PI*2/7);ctx.beginPath();ctx.ellipse(0,-.25,.12,.23,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();}
      ctx.fillStyle=theme.accent;ctx.beginPath();ctx.arc(0,0,.12,0,Math.PI*2);ctx.fill();break;
    case 'paper':ctx.fillStyle='#f9f4e57a';ctx.fillRect(-.5,-.6,1,1.2);ctx.setLineDash([.01,.01]);ctx.strokeRect(-.48,-.58,.96,1.16);break;
    case 'handstar':star(ctx,5,.2);ctx.stroke();ctx.translate(.045,.01);star(ctx,5,.2);ctx.globalAlpha*=.3;ctx.stroke();break;
    case 'sticker':ctx.fillStyle='#bfc9a9';ctx.beginPath();ctx.arc(0,0,.5,0,Math.PI*2);ctx.fill();ctx.setLineDash([.03,.04]);ctx.beginPath();ctx.arc(0,0,.42,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.scale(.7,.7);star(ctx,5,.24);ctx.fillStyle=theme.ink;ctx.fill();break;
    case 'stamp':
      ctx.fillStyle='#f9e9c9';ctx.fillRect(-.5,-.5,1,1);ctx.lineWidth=.035;ctx.setLineDash([.045,.045]);ctx.strokeRect(-.47,-.47,.94,.94);ctx.setLineDash([]);ctx.lineWidth=.018;ctx.strokeRect(-.35,-.36,.7,.62);
      ctx.beginPath();ctx.arc(.1,-.15,.11,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-.3,.2);ctx.lineTo(-.08,-.1);ctx.lineTo(.06,.06);ctx.lineTo(.18,-.06);ctx.lineTo(.32,.2);ctx.stroke();text(ctx,'L A B',0,.4,.12,'monospace');break;
    case 'postmark':ctx.lineWidth=.012;for(const radius of [.4,.48]){ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();}text(ctx,'SENT WITH',0,-.09,.11,'monospace');text(ctx,'LOVE',0,.09,.17,'serif');for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(.3,i*.15-.15);ctx.bezierCurveTo(.6,i*.15-.25,.8,i*.15-.05,1,i*.15-.15);ctx.stroke();}break;
    case 'travel':ctx.setLineDash([.025,.025]);ctx.beginPath();ctx.moveTo(-.5,.04);ctx.bezierCurveTo(-.1,-.4,.15,.4,.5,-.05);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(.4,-.14);ctx.lineTo(.55,-.08);ctx.lineTo(.47,.09);ctx.stroke();break;
    case 'abstract':
      ctx.fillStyle=theme.secondary;ctx.globalAlpha*=.23;ctx.beginPath();ctx.arc(-.32,-.05,.29,0,Math.PI*2);ctx.fill();ctx.fillStyle=theme.accent;ctx.fillRect(-.03,-.6,.1,1.1);ctx.beginPath();ctx.moveTo(-.45,.55);ctx.lineTo(.45,.3);ctx.lineTo(.45,.5);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(-.45,.4);ctx.bezierCurveTo(.4,-.1,-.4,-.3,.45,-.55);ctx.stroke();break;
  }
}
function drawMotif(ctx,d,frame,theme){
  ctx.save();ctx.translate(d.x*frame.w,d.y*frame.h);ctx.rotate((d.rotation||0)*Math.PI/180);
  const size=d.size*frame.w;ctx.scale(size,size);ctx.globalAlpha=d.opacity??1;
  ctx.strokeStyle=theme.accent;ctx.fillStyle=theme.accent;ctx.lineWidth=1.6/size;
  ctx.lineCap='round';ctx.lineJoin='round';motifPath(ctx,d,theme);ctx.restore();
}
function outline(ctx,s,padding,color,width,dash=[]){
  ctx.save();ctx.translate(s.x+s.w/2,s.y+s.h/2);ctx.rotate(s.rotation);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);
  traceShape(ctx,s.shape,s.w+padding*2,s.h+padding*2);ctx.stroke();ctx.restore();
}
function registration(ctx,x,y,size=7){line(ctx,x-size,y,x+size,y);line(ctx,x,y-size,x,y+size);}
function tape(ctx,s,index,theme){
  ctx.save();ctx.translate(s.x+s.w*.48,s.y-15);ctx.rotate(s.rotation+(index%2?-.12:.12));
  ctx.fillStyle=index%2?'#c5c9a8df':'#d3af9bdc';
  const w=s.w*.44,h=34;ctx.beginPath();ctx.moveTo(-w/2,-h/2);for(let i=0;i<=8;i++)ctx.lineTo(-w/2+i*w/8,-h/2+(i%2?3:0));ctx.lineTo(w/2,h/2);for(let i=8;i>=0;i--)ctx.lineTo(-w/2+i*w/8,h/2-(i%2?3:0));ctx.closePath();ctx.fill();
  ctx.strokeStyle=theme.ink;ctx.globalAlpha=.18;ctx.lineWidth=1;for(let i=-w/2;i<w/2;i+=12)line(ctx,i,-h/2,i+8,h/2);ctx.restore();
}

export function drawDecorations(ctx,frame,opts,layer){
  const art=frame.decorations;if(!art||opts.decorations===false)return;if(art.expanded){drawCollection(ctx,frame,opts,layer);return;}
  const theme={...art,ink:opts.accent||art.ink};
  ctx.save();ctx.strokeStyle=theme.accent;ctx.fillStyle=theme.ink;ctx.lineWidth=1.5;
  if(layer==='background'){
    if(art.texture&&!opts.transparent)paperTexture(ctx,frame.w,frame.h,art.texture);
    if(frame.id==='chrome'&&!opts.transparent&&!opts.bg){const gradient=ctx.createLinearGradient(0,0,frame.w,frame.h);gradient.addColorStop(0,'#f1f2ef');gradient.addColorStop(.3,'#a2a7b1');gradient.addColorStop(.55,'#e6e9ed');gradient.addColorStop(.8,'#a5a8b0');gradient.addColorStop(1,'#caced6');ctx.fillStyle=gradient;ctx.fillRect(0,0,frame.w,frame.h);}
    // A slightly inset perimeter leaves true transparent outer corners on alpha exports.
    if(['classic','oval','arch','postcard'].includes(frame.id)){
      ctx.globalAlpha=.5;ctx.strokeRect(16,16,frame.w-32,frame.h-32);ctx.globalAlpha=1;
    }
  }
  for(const d of art.layers[layer])drawMotif(ctx,d,frame,theme);
  if(layer==='foreground'){
    frame.slots.forEach((s,i)=>{
      switch(art.outline){
        case 'double':outline(ctx,s,5,theme.ink,1.5);outline(ctx,s,10,theme.accent,.8);break;
        case 'oval':outline(ctx,s,7,theme.ink,2);outline(ctx,s,15,theme.accent,1.3);break;
        case 'offset':outline(ctx,s,7,theme.ink,2);outline(ctx,{...s,x:s.x+7,y:s.y-4},13,theme.secondary,2);break;
        case 'arch':outline(ctx,s,7,theme.ink,1.3);outline(ctx,s,14,theme.accent,1.3);break;
        case 'contact':outline(ctx,s,6,theme.ink,1);break;
        case 'chrome':outline(ctx,s,5,'#f4f8ff',7);outline(ctx,s,10,'#667183',2);outline(ctx,s,14,'#e9eff8',1.5);break;
        case 'ribbon':outline(ctx,s,6,theme.ink,1);outline(ctx,s,11,theme.secondary,3);break;
        case 'flower':outline(ctx,s,7,theme.ink,2);outline(ctx,s,14,theme.accent,1.2,[2,5]);break;
        case 'film':outline(ctx,s,4,'#eee3c7',1);break;
        case 'polaroid':{
          tape(ctx,s,i,theme);ctx.save();ctx.translate(s.x+s.w/2,s.y+s.h/2);ctx.rotate(s.rotation);ctx.fillStyle=theme.ink;text(ctx,['a little hello','the good light','stay a little','one for keeps'][i],0,s.h/2+32,19,'cursive');ctx.restore();break;
        }
        case 'postcard':outline(ctx,s,6,'#f9e9cc',5);outline(ctx,s,12,theme.ink,1);break;
        case 'gallery':outline(ctx,s,7,theme.ink,1.3);break;
      }
      ctx.strokeStyle=theme.accent;ctx.lineWidth=1;ctx.fillStyle=theme.ink;
      if(['classic','editorial'].includes(frame.id)){
        registration(ctx,s.x-14,s.y-14,5);registration(ctx,s.x+s.w+14,s.y+s.h+14,5);
        if(frame.id==='classic')text(ctx,`0${i+1}`,frame.w-23,s.y+s.h/2,9,'monospace');
      }
      if(frame.id==='editorial'){
        ctx.fillStyle=theme.accent;ctx.fillRect(s.x,s.y-24,30,16);ctx.fillStyle='#fff';text(ctx,`0${i+1}`,s.x+15,s.y-12,10,'monospace');ctx.fillStyle=theme.ink;text(ctx,['THE FIRST LIGHT','A DIFFERENT ANGLE','IN THE MOMENT','THE LAST WORD'][i],s.x+39,s.y-12,10,'monospace','left');
      }
      if(frame.id==='arch'){
        text(ctx,`PORTRAIT ${['I','II','III','IV'][i]} / STUDY`,s.x+s.w/2,s.y+s.h+27,10,'serif');
      }
      if(frame.id==='gallery'){
        const x=s.x+s.w-105,y=s.y+s.h+12;ctx.fillStyle='#f8f5ed';ctx.fillRect(x,y,105,24);ctx.fillStyle=theme.ink;text(ctx,`0${i+1} — UNTITLED`,x+6,y+15,9,'monospace','left');
      }
      if(frame.id==='film'){
        ctx.fillStyle=theme.accent;ctx.save();ctx.translate(49,s.y+65);ctx.rotate(-Math.PI/2);text(ctx,`LAB 400  ›  ${String(i+1).padStart(2,'0')} A`,0,0,12,'monospace');ctx.restore();
      }
    });
    if(frame.id==='film'){
      ctx.fillStyle='#eee3c7';for(let y=24;y<frame.h-165;y+=42){ctx.beginPath();ctx.roundRect(16,y,17,26,3);ctx.roundRect(frame.w-33,y,17,26,3);ctx.fill();}
    }
    // Caption furniture stays below all photo slots and never crosses a face.
    const photoBottom=Math.max(...frame.slots.map(s=>s.y+s.h/2+Math.abs(Math.sin(s.rotation))*s.w/2+Math.cos(s.rotation)*s.h/2+(frame.id==='polaroid'?49:0)));
    const top=frame.h-120;
    ctx.strokeStyle=theme.accent;ctx.lineWidth=1;ctx.globalAlpha=.55;
    if(top>photoBottom+6){line(ctx,frame.w*.12,top,frame.w*.32,top);line(ctx,frame.w*.68,top,frame.w*.88,top);}
    ctx.globalAlpha=1;ctx.fillStyle=theme.ink;
    if(frame.layout.subtitle.y>photoBottom+6)drawText(ctx,art.subtitle,frame.layout.subtitle,{size:Math.min(11,Math.max(8,frame.w*.009)),font:'monospace',align:'center',label:'archive subtitle'});
    drawText(ctx,art.title,frame.layout.title,{size:Math.min(28,Math.round(frame.w*(art.captionFont==='serif'?.034:.026))),font:art.captionFont||'sans-serif',align:'center',label:'archive title'});
  }
  ctx.restore();
}
