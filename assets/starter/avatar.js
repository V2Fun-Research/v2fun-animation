import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {BVHLoader} from 'three/addons/loaders/BVHLoader.js';
export async function loadAvatar(scene,config){
 if(config.animatedModel)return loadAnimatedAvatar(scene,config);
 const meta=await fetch(config.motionMeta).then(r=>{if(!r.ok)throw Error('Motion metadata unavailable');return r.json()}),segment=meta.motions[config.motionIndex??0];
 const motionPath='assets/'+segment.bvh_path.split('/').pop();
 const failures=[],manager=new T.LoadingManager();manager.onError=u=>failures.push(u);
 const [model,data]=await Promise.all([config.avatarFormat==='fbx'?new FBXLoader(manager).loadAsync(config.avatar):new GLTFLoader(manager).loadAsync(config.avatar).then(g=>g.scene),new BVHLoader().loadAsync(motionPath)]);
 model.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.pose();o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals()}});model.updateMatrixWorld(true);
 const bones=[];model.traverse(o=>{if(o.isBone)bones.push(o)});const target=Object.fromEntries(bones.map(b=>[b.name.replace(/^mixamorig:?/,''),b]));
 const box=new T.Box3().setFromObject(model),height=box.max.y-box.min.y,group=new T.Group();group.add(model);scene.add(group);group.scale.setScalar(1.9/height);group.updateMatrixWorld(true);
 const root=data.skeleton.bones[0];root.updateMatrixWorld(true);const source=Object.fromEntries(data.skeleton.bones.filter(b=>b.name!=='ENDSITE').map(b=>[b.name.toLowerCase(),b]));
 const mapping={Hips:'pelvis',Spine:'spine1',Spine1:'spine2',Spine2:'spine3',Neck:'neck',Head:'head'};
 for(const side of ['Left','Right']){const en=side.toLowerCase();for(const [a,b]of [['Shoulder','collar'],['Arm','shoulder'],['ForeArm','elbow'],['Hand','wrist'],['UpLeg','hip'],['Leg','knee'],['Foot','ankle'],['ToeBase','foot']])mapping[side+a]=en+'_'+b;if(config.hands)for(const f of ['Thumb','Index','Middle','Ring','Pinky'])for(let i=1;i<=3;i++)mapping[side+'Hand'+f+i]=en+'_'+f.toLowerCase()+i}
 Object.assign(mapping,config.mapping??{});for(const k of Object.keys(mapping))mapping[k]=mapping[k].toLowerCase();
 const missing=Object.entries(mapping).filter(([t,s])=>!target[t]||!source[s]);if(missing.length)throw Error('Missing body/finger mappings: '+JSON.stringify(missing));
 const pairs=Object.entries(mapping).map(([t,s])=>({target:target[t],s:source[s],sq:source[s].getWorldQuaternion(new T.Quaternion()).invert(),tq:target[t].getWorldQuaternion(new T.Quaternion())}));
 const depth=b=>{let n=0;while(b.parent){n++;b=b.parent}return n};pairs.sort((a,b)=>depth(a.target)-depth(b.target));
 const pos=b=>b.getWorldPosition(new T.Vector3()),length=(a,b,c)=>pos(a).distanceTo(pos(b))+pos(b).distanceTo(pos(c));const ratio=length(target.LeftUpLeg,target.LeftLeg,target.LeftFoot)/length(source.left_hip,source.left_knee,source.left_ankle)/target.Hips.parent.getWorldScale(new T.Vector3()).x;
 const rest=bones.map(b=>({b,p:b.position.clone(),q:b.quaternion.clone()})),hipsRest=target.Hips.position.clone(),clip=data.clip,mixer=new T.AnimationMixer(root);mixer.clipAction(clip).play();
 const tracks=clip.tracks.filter(t=>t.name.endsWith('.quaternion')),calibration=tracks.every(t=>Math.abs(t.values[0])+Math.abs(t.values[1])+Math.abs(t.values[2])+Math.abs(t.values[3]-1)<1e-7),frameOffset=config.frameOffsetSeconds==='auto'?(calibration?(clip.tracks[0].times[1]??0):0):Number(config.frameOffsetSeconds??0);
 mixer.setTime(frameOffset);const origin=root.position.clone(),q=new T.Quaternion(),parentQ=new T.Quaternion();
 function update(t){mixer.setTime(T.MathUtils.clamp(t+frameOffset,frameOffset,clip.duration-.0001));root.updateMatrixWorld(true);for(const r of rest){r.b.position.copy(r.p);r.b.quaternion.copy(r.q)}target.Hips.position.copy(hipsRest).addScaledVector(root.position.clone().sub(origin),ratio);group.updateMatrixWorld(true);for(const p of pairs){p.s.getWorldQuaternion(q);q.multiply(p.sq).multiply(p.tq);p.target.parent.getWorldQuaternion(parentQ);p.target.quaternion.copy(parentQ.invert().multiply(q)).normalize();p.target.updateMatrixWorld(true)}group.updateMatrixWorld(true)}
 update(0);return {model,group,target,bones,pairs,clip,source,update,motionPath,start:segment.motion_start_time_seconds??0,duration:clip.duration-frameOffset,displayUnit:1,textureFailures:failures,frameOffset,ratio,retargetMethod:'local-body-and-finger-world-rest'};
}

async function loadAnimatedAvatar(scene,config){
 const gltf=await new GLTFLoader().loadAsync(config.animatedModel);if(!gltf.animations.length)throw Error('Retargeted GLB has no animation');
 const model=gltf.scene;model.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals()}});model.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(model),height=box.max.y-box.min.y;const group=new T.Group();group.add(model);group.scale.setScalar(1.9/height);model.position.y-=box.min.y;scene.add(group);
 let hips;model.traverse(o=>{if(o.isBone&&/hips|pelvis/i.test(o.name)&&!hips)hips=o});if(!hips)throw Error('No hips/root bone found in animated GLB');
 const clip=gltf.animations[0],mixer=new T.AnimationMixer(model);mixer.clipAction(clip).play();
 const meta=await fetch(config.motionMeta).then(r=>r.json());const segment=meta.motions[config.motionIndex??0];
 const fingerTracks=clip.tracks.filter(t=>/thumb|index|middle|ring|pinky|finger/i.test(t.name));
 if(config.hands&&!fingerTracks.length)throw Error('Hand capture was requested but the GLB contains no recognizable finger tracks; inspect the result before delivery');
 return {model,group,displayUnit:1,motionPath:'assets/'+segment.bvh_path.split('/').pop(),target:{Hips:hips},duration:clip.duration,start:segment.motion_start_time_seconds??0,update(t){mixer.setTime(T.MathUtils.clamp(t,0,clip.duration-.0001));group.updateMatrixWorld(true)}};
}
