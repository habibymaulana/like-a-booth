import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {createHandler} from './server/delivery-handler.js';
import {adapters} from './server/delivery-adapters.js';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 const localDelivery=env.DELIVERY_ENABLED==='true'&&env.DELIVERY_LOCAL_MODE==='true';
 const handler=localDelivery?createHandler({env,...adapters(env)}):null;
 return {plugins:[react(),tailwindcss(),{name:'local-delivery',configureServer(server){server.middlewares.use('/api/delivery/',(req,res)=>{
  if(handler){const action=(req.url||'').split('?')[0].replace(/^\/+/,'');req.query={action};return handler(req,res);}
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'&&/(?:^|\/)config(?:\?|$)/.test(req.url||'')){res.end(JSON.stringify({enabled:false,emailEnabled:false}));}
  else{res.statusCode=503;res.end(JSON.stringify({error:'Private delivery is not configured in local Vite development.'}));}
 });}}]};
});
