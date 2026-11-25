import {randomBytes,createHmac,timingSafeEqual} from 'node:crypto';
import {inflateSync} from 'node:zlib';
export const TTL=24*60*60*1000,MAX_PNG=3*1024*1024;
export class DeliveryError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new DeliveryError(status,message);};
function validWebhookUrl(raw){
 try{
  const u=new URL(raw);
  if((u.protocol==='https:'||u.protocol==='http:')&&!u.search&&!u.hash&&!u.username&&!u.password)return u.href;
 }catch{/* Ignore unconfigured or invalid webhook URLs. */}
 return undefined;
}
export function configuration(env){
 let origin;try{const u=new URL(env.DELIVERY_ORIGIN);if(u.protocol==='https:'&&u.pathname==='/'&&!u.search&&!u.hash&&!u.username&&!u.password)origin=u.origin;}catch{/* Disabled until a canonical HTTPS origin is provided. */}
 const enabled=env.DELIVERY_ENABLED==='true'&&env.DELIVERY_PRIVATE_STORE_CONFIRMED==='true'&&env.DELIVERY_CLEANUP_CONFIGURED==='true'&&!!origin&&env.DELIVERY_SIGNING_SECRET?.length>=64&&env.CRON_SECRET?.length>=32&&!!env.BLOB_READ_WRITE_TOKEN&&!!env.UPSTASH_REDIS_REST_URL&&!!env.UPSTASH_REDIS_REST_TOKEN;
 const cleanupReady=env.DELIVERY_PRIVATE_STORE_CONFIRMED==='true'&&!!env.BLOB_READ_WRITE_TOKEN&&env.CRON_SECRET?.length>=32;
 const n8nSecretReady=typeof env.N8N_WEBHOOK_SECRET==='string'&&env.N8N_WEBHOOK_SECRET.length>=32;
 const n8nEmailEnabled=!!(validWebhookUrl(env.N8N_EMAIL_WEBHOOK_URL)&&n8nSecretReady);
 const resendEmailEnabled=!!(env.RESEND_API_KEY&&env.RESEND_FROM);
 const emailProvider=n8nEmailEnabled?'n8n':resendEmailEnabled?'resend':null;
 const n8nLogEnabled=!!(validWebhookUrl(env.N8N_LOG_WEBHOOK_URL)&&n8nSecretReady);
 return {enabled,origin,cleanupReady:!!cleanupReady,emailEnabled:!!(enabled&&env.DELIVERY_EMAIL_ENABLED==='true'&&emailProvider),emailProvider,n8nLogEnabled};
}
const mac=(s,key)=>createHmac('sha256',key).update(s).digest('base64url');
export const digest=(s,key)=>mac(s,key);
export function signCapability(claims,scope,key){const data=Buffer.from(JSON.stringify({...claims,scope})).toString('base64url');return `${data}.${mac(data,key)}`;}
export function verifyCapability(token,scope,key,now=Date.now()){
 if(typeof token!=='string'||token.length>1500)fail(404,'This private link is unavailable.');
 const [data,signature,...extra]=token.split('.');const expected=mac(data||'',key);const a=Buffer.from(signature||''),b=Buffer.from(expected);
 if(extra.length||a.length!==b.length||!timingSafeEqual(a,b))fail(404,'This private link is unavailable.');
 let c;try{c=JSON.parse(Buffer.from(data,'base64url'));}catch{fail(404,'This private link is unavailable.');}
 if(c.scope!==scope||!/^\w{32}$/.test(c.id)||!/^[-\w]{43}$/.test(c.nonce)||!Number.isSafeInteger(c.expiresAt)||!Number.isSafeInteger(c.createdAt)||c.expiresAt-c.createdAt!==TTL||c.createdAt>now+60000||!['camera','simulation'].includes(c.mode))fail(404,'This private link is unavailable.');
 if(now>=c.expiresAt)fail(410,'This private session has expired.');return c;
}
export const artworkPath=c=>`sessions/${c.expiresAt}/${c.id}.png`;
export const galleryURL=(origin,c,key)=>`${origin}/gallery#access=${signCapability(c,'read',key)}`;
export function validateEmail(value){if(typeof value!=='string'||value.length>254||! /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(value)||value.includes('..')||value.startsWith('.')||value.split('@')[0].endsWith('.'))fail(400,'Enter a valid email address.');return value.toLowerCase();}
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
export function validatePNG(input){
 const data=Buffer.from(input);if(data.length>MAX_PNG)fail(413,'PNG must be 3 MB or smaller.');
 if(data.length<45||!data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))fail(400,'A valid PNG is required.');
 let offset=8,width,height,channels,ended=false,seenData=false,dataEnded=false;const chunks=[];
 while(offset+12<=data.length){const len=data.readUInt32BE(offset),end=offset+12+len;if(end>data.length)fail(400,'Invalid PNG structure.');const type=data.toString('ascii',offset+4,offset+8),payload=data.subarray(offset+8,offset+8+len);
  if(crc32(data.subarray(offset+4,offset+8+len))!==data.readUInt32BE(offset+8+len))fail(400,'Invalid PNG checksum.');
  if(offset===8&&type!=='IHDR')fail(400,'Missing PNG header.');
  if(type==='IHDR'){if(width||len!==13)fail(400,'Invalid PNG header.');width=payload.readUInt32BE(0);height=payload.readUInt32BE(4);channels=payload[9]===6?4:payload[9]===2?3:0;if(!width||!height||width>4096||height>8192||width*height>16000000||payload[8]!==8||!channels||payload[10]||payload[11]||payload[12])fail(400,'Unsupported PNG dimensions or encoding.');}
  else if(type==='IDAT'){if(dataEnded)fail(400,'Invalid PNG data order.');seenData=true;chunks.push(payload);}
  else if(type==='IEND'){if(len||!seenData||end!==data.length)fail(400,'Invalid PNG ending.');ended=true;offset=end;break;}
  else {if(!['sRGB','gAMA','cHRM','pHYs'].includes(type))fail(400,'Unsupported PNG chunk.');if(seenData)dataEnded=true;}
  offset=end;
 }
 if(!ended||offset!==data.length)fail(400,'Incomplete PNG.');const row=width*channels+1,expected=row*height;let pixels;try{pixels=inflateSync(Buffer.concat(chunks),{maxOutputLength:expected});}catch{fail(400,'Invalid PNG pixel data.');}if(pixels.length!==expected)fail(400,'Invalid PNG pixel length.');for(let y=0;y<height;y++)if(pixels[y*row]>4)fail(400,'Invalid PNG row filter.');return {width,height,data};
}
export function createDeliveryService({env,store,limit,sendEmail,logEvent,now=Date.now}){
 const config=configuration(env),key=env.DELIVERY_SIGNING_SECRET;
 const ready=()=>{if(!config.enabled)fail(503,'Private delivery is not configured.');};
 const quota=async(name,identity,max,seconds)=>{if(!await limit(`${name}:${digest(identity,key)}`,max,seconds))fail(429,'Too many requests. Please try again later.');};
 const safeLog=async entry=>{if(!logEvent)return;try{await logEvent(entry);}catch{/* Non-blocking telemetry log. */}};
 return {
 config,
 async create(bytes,{ip,mode,consent}){ready();if(consent!=='yes'||!['camera','simulation'].includes(mode))fail(400,'Explicit upload consent is required.');await quota('upload-global','global',100,3600);await quota('upload-ip',ip,5,3600);const image=validatePNG(bytes);const createdAt=now(),claims={id:randomBytes(16).toString('hex'),nonce:randomBytes(32).toString('base64url'),mode,createdAt,expiresAt:createdAt+TTL};await store.put(artworkPath(claims),image.data);await safeLog({event:'session_created',sessionId:claims.id,mode,status:'created',expiresAt:new Date(claims.expiresAt).toISOString(),timestamp:new Date(createdAt).toISOString()});return {url:galleryURL(config.origin,claims,key),expiresAt:claims.expiresAt,mode,emailToken:signCapability(claims,'email',key)};},
 async read(token){ready();const c=verifyCapability(token,'read',key,now());const data=await store.read(artworkPath(c));if(!data)fail(404,'This private artwork is unavailable.');verifyCapability(token,'read',key,now());return {data,expiresAt:c.expiresAt,mode:c.mode};},
 async email(token,email,ip,consent){ready();if(!config.emailEnabled)fail(503,'Email delivery is not configured.');if(consent!==true)fail(400,'Explicit email consent is required.');const c=verifyCapability(token,'email',key,now());const recipient=validateEmail(email);await quota('email-global','global',50,3600);await quota('email-ip',ip,5,3600);await quota('email-session',c.id,3,86400);await quota('email-recipient',recipient,3,86400);if(!await store.exists(artworkPath(c)))fail(404,'This private artwork is unavailable.');verifyCapability(token,'email',key,now());if(c.expiresAt-now()<60000)fail(410,'This session expires too soon to email. Please download the PNG.');const url=galleryURL(config.origin,c,key);const recipientDomain=recipient.split('@')[1]||'';try{await sendEmail({to:recipient,url,expiresAt:c.expiresAt,mode:c.mode,sessionId:c.id,idempotencyKey:digest(c.id+':'+recipient,key)});await safeLog({event:'email_sent',sessionId:c.id,mode:c.mode,status:'sent',recipientDomain,expiresAt:new Date(c.expiresAt).toISOString(),timestamp:new Date(now()).toISOString()});}catch(error){await safeLog({event:'email_failed',sessionId:c.id,mode:c.mode,status:'failed',recipientDomain,expiresAt:new Date(c.expiresAt).toISOString(),timestamp:new Date(now()).toISOString()});throw error;}return {accepted:true};},
 async cleanup(){if(!config.cleanupReady)fail(503,'Cleanup storage is not configured.');let cursor,removed=0,examined=0;do{const page=await store.list({prefix:'sessions/',cursor,limit:1000});for(const blob of page.blobs){const m=/^sessions\/(\d{13})\/\w{32}\.png$/.exec(blob.pathname);if(m&&Number(m[1])<=now()){await store.remove(blob.pathname);removed++;}examined++;}cursor=page.hasMore?page.cursor:undefined;}while(cursor&&examined<5000);const result={removed,examined,more:!!cursor};await safeLog({event:'cleanup_completed',status:result.more?'partial':'ok',removed:result.removed,examined:result.examined,timestamp:new Date(now()).toISOString()});return result;},
 };
}
