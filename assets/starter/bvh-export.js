import * as T from 'three';
// Bake the target skeleton in viewer world space (Y-up, metres).
// All joints carry translation channels so intermediate object transforms survive.
export function bakeBVH(avatar,update,{fps=30}={}){
 const bones=[];avatar.model.traverse(o=>{if(o.isBone)bones.push(o)});
 if(!bones.length)throw Error('No target skeleton to export');
 const set=new Set(bones),parent=new Map(),children=new Map(bones.map(b=>[b,[]]));
 for(const b of bones){let p=b.parent;while(p&&!set.has(p))p=p.parent;parent.set(b,p??null);if(p)children.get(p).push(b)}
 const roots=bones.filter(b=>!parent.get(b));if(roots.length!==1)throw Error('BVH requires one connected skeleton');
 const order=[];function walk(b){order.push(b);children.get(b).forEach(walk)}walk(roots[0]);
 const names=order.map(b=>b.name.replace(/[\s{}:]/g,'_'));if(new Set(names).size!==names.length||names.some(n=>!n))throw Error('BVH joint names must be unique');
 const saved=[];avatar.group.traverse(o=>saved.push([o,o.position.clone(),o.quaternion.clone(),o.scale.clone()]));
 const offsets=new Map(),rows=[],euler=new T.Euler(0,0,0,'ZXY');const previous=new Map();
 function pose(b){const p=b.getWorldPosition(new T.Vector3()),q=b.getWorldQuaternion(new T.Quaternion()),scale=b.getWorldScale(new T.Vector3());if(Math.max(scale.x,scale.y,scale.z)-Math.min(scale.x,scale.y,scale.z)>1e-5||Math.min(scale.x,scale.y,scale.z)<=0)throw Error('BVH cannot represent mirrored or non-uniform bone scales');const pb=parent.get(b);if(pb){const inv=pb.getWorldQuaternion(new T.Quaternion()).invert();p.sub(pb.getWorldPosition(new T.Vector3())).applyQuaternion(inv);q.premultiply(inv)}return {p,q}}
 const number=x=>{if(!Number.isFinite(x))throw Error('Non-finite BVH sample');return Math.abs(x)<1e-9?'0':x.toFixed(8)};
 try{
  if(!(avatar.duration>0&&Number.isFinite(avatar.duration)))throw Error('Invalid motion duration');
  update(0);avatar.group.updateMatrixWorld(true);for(const b of order)offsets.set(b,parent.get(b)?pose(b).p:new T.Vector3());
  const count=Math.ceil(avatar.duration*fps)+1;
  for(let i=0;i<count;i++){update(Math.min(i/fps,avatar.duration));avatar.group.updateMatrixWorld(true);const row=[];for(const b of order){const {p,q}=pose(b);p.sub(offsets.get(b));euler.setFromQuaternion(q,'ZXY');const angles=[euler.z,euler.x,euler.y].map(T.MathUtils.radToDeg),prev=previous.get(b);if(prev)for(let j=0;j<3;j++)angles[j]+=360*Math.round((prev[j]-angles[j])/360);previous.set(b,angles);row.push(...p,...angles)}rows.push(row.map(number).join(' '))}
  const lines=['HIERARCHY'];function joint(b,depth){const tab='  '.repeat(depth),i=order.indexOf(b);lines.push(tab+(depth?'JOINT ':'ROOT ')+names[i],tab+'{',tab+'  OFFSET '+offsets.get(b).toArray().map(number).join(' '),tab+'  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation');if(children.get(b).length)for(const child of children.get(b))joint(child,depth+1);else lines.push(tab+'  End Site',tab+'  {',tab+'    OFFSET 0 0 0',tab+'  }');lines.push(tab+'}')}joint(roots[0],0);lines.push('MOTION','Frames: '+count,'Frame Time: '+(1/fps).toFixed(10),...rows);return lines.join('\n')+'\n';
 }finally{for(const [o,p,q,s]of saved){o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s)}avatar.group.updateMatrixWorld(true)}
}
