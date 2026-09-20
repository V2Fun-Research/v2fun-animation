import * as T from 'three';
// Exact CPU skinning of foot-weighted surface vertices, in normalized world units.
export function footSampler(avatar,footBones={}){
 const meshes=[],bones=[];avatar.model.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);if(o.isBone)bones.push(o)});
 const samples={Left:[],Right:[]};
 for(const side of ['Left','Right']){
  const foot=footBones[side]?bones.find(b=>b.name===footBones[side]):avatar.target?.[side+'Foot']??bones.find(b=>new RegExp(side+'.*(foot|ankle)','i').test(b.name));
  if(!foot)throw Error('Map '+side+' foot bone before enabling ground repair');
  const influence=new Set();foot.traverse(b=>{if(b.isBone)influence.add(b)});
  for(const mesh of meshes){const g=mesh.geometry,ix=g.attributes.skinIndex,w=g.attributes.skinWeight;if(!ix||!w)continue;
   if(g.attributes.skinIndex1||g.attributes.skinWeight1)throw Error('Merge extra skin influences before ground repair');
   for(let i=0;i<g.attributes.position.count;i++){let weight=0;for(let k=0;k<4;k++)if(influence.has(mesh.skeleton.bones[ix.getComponent(i,k)]))weight+=w.getComponent(i,k);if(weight>.65)samples[side].push({mesh,index:i})}
  }
  if(!samples[side].length)throw Error('No usable foot surface vertices for '+side);
 }
 const p=new T.Vector3();
 function measure(){avatar.group.updateMatrixWorld(true);meshes.forEach(m=>m.skeleton.update());const out={};for(const side of ['Left','Right']){let min=Infinity;for(const {mesh,index}of samples[side])min=Math.min(min,mesh.getVertexPosition(index,p).applyMatrix4(mesh.matrixWorld).y);out[side]={min}}return out}
 return {measure,counts:Object.fromEntries(Object.entries(samples).map(([k,p])=>[k,p.length]))};
}
export function groundTrial(avatar,options={}){
 const sampler=footSampler(avatar,options.footBones),baseUpdate=avatar.update.bind(avatar),baseY=avatar.group.position.y;
 return {update(t){avatar.group.position.y=baseY;baseUpdate(t);const before=sampler.measure(),offset=(options.floorY??0)-Math.min(before.Left.min,before.Right.min);avatar.group.position.y+=offset;avatar.group.updateMatrixWorld(true);return {offset,before,after:sampler.measure()}},sampler};
}
