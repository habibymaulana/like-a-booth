export function pngFile(dataURL,name){
 const prefix='data:image/png;base64,';if(!dataURL.startsWith(prefix))throw Error('PNG artwork is unavailable.');
 const bytes=Uint8Array.from(atob(dataURL.slice(prefix.length)),c=>c.charCodeAt(0));return new File([bytes],name,{type:'image/png'});
}
export function downloadFile(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
export async function shareFile(file,nav=navigator,download=downloadFile){
 let supported=false;try{supported=!!nav.share&&!!nav.canShare&&nav.canShare({files:[file]});}catch{/* Fall back when the browser rejects file sharing. */}
 if(!supported){download(file);return 'downloaded';}
 try{await nav.share({files:[file],title:'like a booth',text:'A little moment, made to keep.'});return 'shared';}
 catch(error){if(error.name==='AbortError')return 'cancelled';download(file);return 'downloaded';}
}
export async function deliveryRequest(action,{token,body,headers={},signal}={}){
 const response=await fetch(`/api/delivery/${action}`,{method:action==='config'?'GET':'POST',headers:{...headers,...(token?{Authorization:`Bearer ${token}`}:{})},body,signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
 if(!response.ok){let message='Private delivery is unavailable.';try{message=(await response.json()).error||message;}catch{/* Static-only hosting has no delivery API. */}const error=new Error(message);error.status=response.status;throw error;}return response;
}
