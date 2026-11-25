import {createDeliveryService,DeliveryError,MAX_PNG} from './delivery-core.js';
const json=(res,status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
async function body(req,max){if(req.body!==undefined){const data=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));if(data.length>max)throw new DeliveryError(413,'Request too large.');return data;}const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>max)throw new DeliveryError(413,'Request too large.');chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks);}
export function createHandler(deps){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Vary','Origin');
 try{
  const service=createDeliveryService(deps),action=req.query?.action;
  if(action==='config'&&req.method==='GET')return json(res,200,{enabled:service.config.enabled,emailEnabled:service.config.emailEnabled,maxBytes:MAX_PNG});
  if(action==='cleanup'){
   if(!service.config.cleanupReady)throw new DeliveryError(503,'Cleanup storage is not configured.');
   if(req.method!=='GET')throw new DeliveryError(405,'Method not allowed.');
   // Secret comparison is constant-time via a fixed-length digests in the runtime.
   const {createHash,timingSafeEqual}=await import('node:crypto');const expected=createHash('sha256').update(`Bearer ${deps.env.CRON_SECRET}`).digest(),actual=createHash('sha256').update(req.headers.authorization||'').digest();if(!timingSafeEqual(expected,actual))throw new DeliveryError(401,'Unauthorized.');return json(res,200,await service.cleanup());
  }
  if(!service.config.enabled)throw new DeliveryError(503,'Private delivery is not configured.');
  if(req.method!=='POST')throw new DeliveryError(405,'Method not allowed.');
  if(req.headers.origin!==service.config.origin)throw new DeliveryError(403,'Same-origin requests required.');
  const token=(req.headers.authorization||'').replace(/^Bearer /,'');
  // Vercel supplies/overwrites x-real-ip. Do not trust client IP headers on other hosts.
  const ip=req.headers['x-real-ip']||'unknown';
  if(action==='session'){
   if(req.headers['content-type']!=='application/octet-stream'||req.headers['x-artwork-type']!=='image/png')throw new DeliveryError(415,'PNG artwork with binary transport is required.');
   return json(res,201,await service.create(await body(req,MAX_PNG),{ip,mode:req.headers['x-session-mode'],consent:req.headers['x-upload-consent']}));
  }
  if(action==='artwork'){const result=await service.read(token);res.statusCode=200;res.setHeader('Content-Type','image/png');res.setHeader('Content-Disposition','inline; filename="like-a-booth.png"');res.setHeader('X-Session-Expires',String(result.expiresAt));res.setHeader('X-Session-Mode',result.mode);return res.end(result.data);}
  if(action==='email'){if(req.headers['content-type']!=='application/json')throw new DeliveryError(415,'JSON content type required.');let payload;try{payload=JSON.parse((await body(req,2048)).toString());}catch(error){if(error.status)throw error;throw new DeliveryError(400,'Invalid request.');}return json(res,202,await service.email(token,payload.email,ip,payload.consent));}
  throw new DeliveryError(404,'Not found.');
 }catch(error){return json(res,error.status||503,{error:error instanceof DeliveryError?error.message:'Delivery is temporarily unavailable. Please try again.'});}
};}
