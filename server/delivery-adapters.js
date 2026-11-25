import {put,get,head,list,del} from '@vercel/blob';
function hasN8nSecret(env){return typeof env.N8N_WEBHOOK_SECRET==='string'&&env.N8N_WEBHOOK_SECRET.length>=32;}
async function postN8nWebhook(url,secret,payload,{idempotencyKey,timeoutMs=15000}={}){
 const headers={'Content-Type':'application/json','X-Like-A-Booth-Secret':secret};
 if(idempotencyKey)headers['Idempotency-Key']=idempotencyKey;
 return fetch(url,{method:'POST',redirect:'error',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(timeoutMs)});
}
async function sendViaN8n(env,{to,url,expiresAt,mode='camera',sessionId='',idempotencyKey}){
 const timeoutMs=Number(env.N8N_EMAIL_TIMEOUT_MS)>0?Number(env.N8N_EMAIL_TIMEOUT_MS):15000;
 const response=await postN8nWebhook(env.N8N_EMAIL_WEBHOOK_URL,env.N8N_WEBHOOK_SECRET,{to,gallery_url:url,expires_at:new Date(expiresAt).toISOString(),expires_at_ms:expiresAt,mode,session_id:sessionId,idempotency_key:idempotencyKey},{idempotencyKey,timeoutMs});
 if(!response.ok)throw Error('Email workflow rejected the request');
 const raw=await response.json();const data=Array.isArray(raw)&&raw.length===1?raw[0]:raw;
 if(data?.status!=='sent'&&data?.accepted!==true)throw Error('Email workflow did not confirm delivery');
}
async function sendViaResend(env,{to,url,expiresAt,idempotencyKey}){
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({from:env.RESEND_FROM,to:[to],subject:'Your like a booth artwork',text:`Your private artwork is ready:\n\n${url}\n\nThis link expires at ${new Date(expiresAt).toISOString()}. Anyone with the link can view it. Download a copy before it expires. Only the finished artwork was uploaded. Storage deletion runs after expiry on the configured cleanup schedule.`}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Email provider rejected the request');const data=await response.json();if(!data.id)throw Error('Email provider did not accept the request');
}
export function adapters(env){
 const token=env.BLOB_READ_WRITE_TOKEN;
 return {
 store:{
  put:(path,data)=>put(path,data,{access:'private',token,contentType:'image/png',addRandomSuffix:false,allowOverwrite:false,cacheControlMaxAge:60}),
  async read(path){const response=await get(path,{access:'private',token,useCache:false});if(!response)return null;return Buffer.from(await new Response(response.stream).arrayBuffer());},
  async exists(path){try{await head(path,{token});return true;}catch(error){if(error.status===404||error.name==='BlobNotFoundError')return false;throw error;}},
  list:options=>list({...options,token}),remove:path=>del(path,{token}),
 },
 async limit(key,max,seconds){
  // Atomic increment + expiry, shared by every instance. Fail closed on outage.
  const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
  const response=await fetch(env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:`Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',script,1,`lab-delivery:${key}`,seconds]),signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('Rate limit service unavailable');const data=await response.json();if(data.error||!Number.isInteger(data.result))throw Error('Invalid rate limit response');return data.result<=max;
 },
 async sendEmail(message){
  if(env.N8N_EMAIL_WEBHOOK_URL&&hasN8nSecret(env))return sendViaN8n(env,message);
  if(env.RESEND_API_KEY&&env.RESEND_FROM)return sendViaResend(env,message);
  throw Error('Email delivery provider is not configured');
 },
 async logEvent(entry){
  if(!env.N8N_LOG_WEBHOOK_URL||!hasN8nSecret(env))return;
  try{await postN8nWebhook(env.N8N_LOG_WEBHOOK_URL,env.N8N_WEBHOOK_SECRET,entry,{timeoutMs:2500});}catch{/* Optional telemetry must not block delivery. */}
 },
 };
}
