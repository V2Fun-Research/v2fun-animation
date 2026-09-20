import {bakeAvatar} from './animation-tools.js';
import {bakeBVH} from './bvh-export.js';
export function setupExports({avatar,media,host,recordButton,status}){
 const panel=document.createElement('div');panel.className='animation-tools export-panel';panel.innerHTML='<div class="section-label">Export</div><div class="export-actions"><button data-export="glb">Animated GLB</button><a class="download-button" href="#" download="source-motion.bvh">Original BVH</a><button data-export="repaired-bvh">Repaired BVH</button></div>';host.append(panel);panel.querySelector('a').href=avatar.motionPath;
 function download(data,type,name){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
 let busy=false;
 for(const button of panel.querySelectorAll('button'))button.onclick=async()=>{
  if(busy||recordButton.getAttribute('aria-pressed')==='true')return;
  busy=true;avatar.exporting=true;const playing=!media.paused,oldGround=avatar.grounding.select.value,inputs=[...host.querySelectorAll('button,input,select')],states=inputs.map(e=>e.disabled);media.pause();inputs.forEach(e=>e.disabled=true);status.textContent='Baking animation…';
  try{await new Promise(r=>setTimeout(r,0));if(button.dataset.export==='glb')download(await bakeAvatar(avatar),'model/gltf-binary','character-aligned-'+oldGround+'.glb');else{avatar.grounding.select.value='on';download(bakeBVH(avatar,t=>avatar.update(t)),'text/plain','character-aligned-grounded.bvh')}status.textContent='Export saved · Local retargeting · No API credits used.'}
  catch(e){status.textContent='Export failed: '+e.message;console.error(e)}
  finally{avatar.grounding.select.value=oldGround;avatar.update(media.currentTime-avatar.start);inputs.forEach((e,i)=>e.disabled=states[i]);busy=false;avatar.exporting=false;if(playing)media.play().catch(()=>{})}
 };
 new MutationObserver(()=>panel.querySelectorAll('button').forEach(b=>b.disabled=busy||recordButton.getAttribute('aria-pressed')==='true')).observe(recordButton,{attributes:true,attributeFilter:['aria-pressed']});
}
