import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
export async function bakeAvatar(avatar,{fps=30,name='Retargeted motion'}={}){
 const nodes=[];avatar.group.traverse(o=>nodes.push(o));
 const saved=nodes.map(o=>[o,o.position.clone(),o.quaternion.clone(),o.scale.clone()]);
 const duration=avatar.duration;if(!(duration>0&&Number.isFinite(duration)))throw Error('Invalid animation duration');
 const count=Math.ceil(duration*fps),times=Array.from({length:count+1},(_,i)=>Math.min(i/fps,duration));
 const channels=nodes.map(o=>({o,p:[],q:[],s:[]}));
 try{
  for(const t of times){avatar.update(t);for(const c of channels){c.p.push(...c.o.position);c.q.push(...c.o.quaternion);c.s.push(...c.o.scale)}}
  const tracks=[];for(const c of channels){tracks.push(new T.VectorKeyframeTrack(c.o.uuid+'.position',times,c.p),new T.QuaternionKeyframeTrack(c.o.uuid+'.quaternion',times,c.q),new T.VectorKeyframeTrack(c.o.uuid+'.scale',times,c.s))}
  const clip=new T.AnimationClip(name,duration,tracks);clip.optimize();avatar.update(0);
  return await new GLTFExporter().parseAsync(avatar.group,{binary:true,animations:[clip],onlyVisible:false,trs:true});
 }finally{for(const [o,p,q,s]of saved){o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s)}avatar.group.updateMatrixWorld(true)}
}
