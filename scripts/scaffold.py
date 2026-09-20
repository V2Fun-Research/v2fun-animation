# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""Create an isolated English animation viewer. No API calls or publishing."""
import argparse,json,shutil
from pathlib import Path
from runtime import SKILL
from media_info import duration
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--project',type=Path,required=True);p.add_argument('--video',type=Path,required=True);p.add_argument('--model',type=Path);p.add_argument('--camera-style',choices=['clear','mv','auto','custom'],default='auto');p.add_argument('--camera-brief',default='');p.add_argument('--camera-shots',type=Path);p.add_argument('--three-dir',type=Path,required=True);a=p.parse_args()
root=a.project.resolve();video=a.video.resolve();model=(a.model or SKILL/'assets/default.glb').resolve();three=a.three_dir.resolve()
if (root/'dist').exists():raise SystemExit('Existing dist directory; adapt the existing viewer instead of overwriting it')
seconds=duration(video)
brief=a.camera_brief.strip()
camera_style='custom' if brief or a.camera_shots else a.camera_style
if camera_style=='custom' and not brief:raise SystemExit('Custom cameras require --camera-brief with the user description')
shots=json.loads(a.camera_shots.read_text()) if a.camera_shots else []
if not isinstance(shots,list):raise SystemExit('--camera-shots must contain a JSON list')
if model.suffix.lower() not in {'.glb','.fbx'}:raise SystemExit('Scaffold supports GLB/FBX. Use the PMX archive workflow without converting it.')
model_name='avatar'+model.suffix.lower()
if not model.is_file():raise SystemExit('Model file missing')
version=json.loads((three/'package.json').read_text())['version']
if version!='0.180.0':raise SystemExit('Starter validated on Three.js 0.180.0; reconcile versions explicitly')
root.mkdir(parents=True,exist_ok=True);shutil.copytree(SKILL/'assets/starter',root/'dist');assets=root/'dist/assets';assets.mkdir(exist_ok=True)
shutil.copy2(model,assets/model_name);shutil.copy2(video,assets/('source'+video.suffix.lower()))
(root/'dist/animation.json').write_text(json.dumps({'video':'assets/source'+video.suffix.lower(),'avatar':'assets/'+model_name,'avatarFormat':model.suffix.lower()[1:],'duration':seconds,'motionMeta':'assets/motion-meta.json','animatedModel':None,'hands':False,'motionIndex':0,'frameOffsetSeconds':'auto','mapping':{},'cameraPreference':camera_style,'cameraBrief':brief,'cameraShots':shots,'cameraBriefStatus':('authored-needs-review' if shots else 'pending') if camera_style=='custom' else 'preset','alignment':{'placement':'center','enabled':True,'pitchDegrees':0,'rollDegrees':0},'grounding':{'mode':'continuous','floorY':-.01,'footBones':{}}},indent=2))
vendor=root/'dist/vendor/three';vendor.mkdir(parents=True)
for name in ['three.module.js','three.core.js']:shutil.copy2(three/'build'/name,vendor/name)
for name in ['loaders/FBXLoader.js','libs/fflate.module.js','curves/NURBSCurve.js','curves/NURBSUtils.js','loaders/GLTFLoader.js','loaders/BVHLoader.js','controls/OrbitControls.js','utils/BufferGeometryUtils.js','exporters/GLTFExporter.js']:
 target=vendor/'addons'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(three/'examples/jsm'/name,target)
shutil.copy2(three/'LICENSE',vendor/'LICENSE')
shutil.copy2(SKILL/'licenses/fflate-0.8.2.txt',vendor/'FFLATE-LICENSE')
shutil.copy2(SKILL/'scripts/serve.cjs',root/'serve.cjs')
(root/'package.json').write_text(json.dumps({'private':True,'scripts':{'start':'node serve.cjs'},'dependencies':{'three':'0.180.0'}},indent=2))
(root/'.gitignore').write_text('node_modules/\napi-jobs/\n.v2fun/\n.sites-runtime/\n')
print(json.dumps({'project':str(root),'video_duration':seconds,'using_default':a.model is None,'ready_for_motion':True}))
