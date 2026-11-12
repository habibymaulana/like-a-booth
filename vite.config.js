import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tailwindcss(),{name:'local-delivery-disabled',configureServer(server){server.middlewares.use('/api/delivery/',(req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');if(req.method==='GET'&&/(?:^|\/)config(?:\?|$)/.test(req.url||'')){res.end(JSON.stringify({enabled:false,emailEnabled:false}));}else{res.statusCode=503;res.end(JSON.stringify({error:'Private delivery is not configured in local Vite development.'}));}});}}]});
