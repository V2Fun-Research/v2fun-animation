// A conservative starting point; shot timing still needs review against the user's clip.
export function cameraPreference(value, cinematicShots, config={}){
 const style=['clear','mv','auto','custom'].includes(value)?value:'auto';
 if(style==='custom'){
  const shots=config.cameraShots;
  if(!Array.isArray(shots)||!shots.length)return {...cameraPreference('auto',cinematicShots),style:'custom',pending:true};
  let end=0;
  for(const shot of shots){
   if(!Number.isFinite(shot.t)||!Number.isFinite(shot.end)||Math.abs(shot.t-end)>1e-5||shot.end<=shot.t||typeof shot.name!=='string')throw Error('Custom camera shots need continuous time ranges starting at 0 seconds');
   for(const pose of [shot.a,shot.b])if(!Array.isArray(pose)||pose.length!==6||!pose.every(Number.isFinite)||pose[2]<=0||pose[4]<=0||pose[4]>=180)throw Error('Invalid custom camera pose');
   end=shot.end;
  }
  return {style,mode:'cinema',shots,seconds:true,duration:end,pending:false};
 }
 if(style==='mv')return {style,mode:'cinema',shots:cinematicShots};
 if(style==='clear')return {style,mode:'fixed',shots:cinematicShots};
 return {style,mode:'cinema',shots:[
  {t:0,end:9,name:'Gentle opening',a:[-.2,1.4,5.4,1,40,0],b:[.2,1.5,5.1,1,40,0]},
  {t:9,end:18,name:'Full-body follow',a:[.2,1.5,5.1,1,40,0],b:[-.15,1.45,5.2,1,40,0]},
  {t:18,end:27,name:'Soft closing',a:[-.15,1.45,5.2,1,40,0],b:[0,1.5,5.5,1,40,0]}
 ]};
}
