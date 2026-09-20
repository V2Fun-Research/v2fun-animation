import * as T from 'three';
import {footSampler} from './grounding.js';
export function setupAlignment(avatar,{host,media,recordButton,config={}}){
 const sampler=footSampler(avatar,config.footBones??{}),baseUpdate=avatar.update.bind(avatar),group=avatar.group;
 const floorY=(config.floorY??-.01)*(avatar.displayUnit??1);
 const panel=document.createElement('div');panel.className='animation-tools alignment-panel';
 panel.innerHTML=`<div class="section-label">Adjust</div><div class="adjust-fields"><label>Placement <select aria-label="Stage placement"><option value="center">Stage center</option><option value="original">Original position</option></select></label>
 <label>Tilt <input aria-label="Tilt correction" type="checkbox" checked></label>
 <label>Pitch <input aria-label="Pitch correction" type="number" min="-30" max="30" step="0.5" style="width:58px">°</label>
 <label>Roll <input aria-label="Roll correction" type="number" min="-30" max="30" step="0.5" style="width:58px">°</label>
 <label>Ground repair <select aria-label="MMD ground repair"><option value="on" selected>On · continuous contact</option><option value="off">Off · preserve jumps</option></select></label></div><span data-metric></span>
`;
 host.append(panel);
 const placement=panel.querySelector('[aria-label="Stage placement"]'),tilt=panel.querySelector('[aria-label="Tilt correction"]'),pitch=panel.querySelector('[aria-label="Pitch correction"]'),roll=panel.querySelector('[aria-label="Roll correction"]'),select=panel.querySelector('[aria-label="MMD ground repair"]'),metric=panel.querySelector('[data-metric]');
 select.value=config.groundMode==='off'?'off':'on';placement.value=config.placement==='original'?'original':'center';tilt.checked=config.enabled!==false;
 pitch.value=config.pitchDegrees??0;roll.value=config.rollDegrees??0;
 const pivot=new T.Vector3(),rotated=new T.Vector3(),anchor=new T.Vector3(),rotation=new T.Quaternion();let latest,baseY=0;
 function reset(){group.position.set(0,0,0);group.quaternion.identity();group.updateMatrixWorld(true)}
 reset();baseUpdate(0);avatar.target.Hips.getWorldPosition(anchor);
 function transform(){
  avatar.target.Hips.getWorldPosition(pivot);
  rotation.setFromEuler(new T.Euler(tilt.checked?T.MathUtils.degToRad(Number(pitch.value)||0):0,0,tilt.checked?T.MathUtils.degToRad(Number(roll.value)||0):0,'XYZ'));
  rotated.copy(pivot).applyQuaternion(rotation);group.quaternion.copy(rotation);group.position.copy(pivot).sub(rotated);
  if(placement.value==='center'){group.position.x-=anchor.x;group.position.z-=anchor.z}
  group.updateMatrixWorld(true);
 }
 function calibrate(){reset();baseUpdate(0);transform();const soles=sampler.measure();baseY=floorY-Math.min(soles.Left.min,soles.Right.min)}
 avatar.update=t=>{
  // Reset the presentation transform before retargeting and Bullet simulation.
  reset();baseUpdate(t);transform();group.position.y+=baseY;group.updateMatrixWorld(true);
  const before=sampler.measure(),low=Math.min(before.Left.min,before.Right.min),offset=select.value==='on'?floorY-low:0;
  group.position.y+=offset;group.updateMatrixWorld(true);const after=sampler.measure();latest={before,after,offset,floorY,baseY,pitchDegrees:tilt.checked?+pitch.value:0,rollDegrees:tilt.checked?+roll.value:0};
  const cm=x=>(x/(avatar.displayUnit??1)*100).toFixed(1);metric.textContent='Lowest sole: '+cm(low-floorY)+' → '+cm(Math.min(after.Left.min,after.Right.min)-floorY)+' cm';
 };
 for(const input of [placement,tilt,pitch,roll])input.onchange=()=>{if(input.type==='number')input.value=T.MathUtils.clamp(Number(input.value)||0,-30,30);calibrate();avatar.update(media.currentTime-avatar.start)};
 select.onchange=()=>avatar.update(media.currentTime-avatar.start);
 new MutationObserver(()=>panel.querySelectorAll('input,select').forEach(el=>el.disabled=recordButton.getAttribute('aria-pressed')==='true')).observe(recordButton,{attributes:true,attributeFilter:['aria-pressed']});
 calibrate();avatar.update(media.currentTime-avatar.start);
 avatar.grounding={sampler,select,get metrics(){return latest},baseUpdate,floorY};avatar.alignment={placement,tilt,pitch,roll,anchor};return panel;
}
