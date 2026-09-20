# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""Create/resume one quoted motion or retarget task using the shared ledger."""
import argparse,base64,hashlib,json,math,mimetypes,time
from pathlib import Path
from runtime import SKILL
from v2fun_client import Client,load_config
from task_budget import Budget,save

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def data_url(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(Path(path).read_bytes()).decode()
def downloads(value):
    if isinstance(value,list):
        for item in value:yield from downloads(item)
    elif isinstance(value,dict):
        if 'asset_path' in value and 'download_url' in value:yield value
        else:
            for v in value.values():yield from downloads(v)
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('stage',choices=['capture','retarget']);p.add_argument('--project',type=Path,required=True);p.add_argument('--quote-sha256');p.add_argument('--authorization');p.add_argument('--config',type=Path);p.add_argument('--motion-index',type=int,default=0);a=p.parse_args()
    project=a.project.resolve();jobs=project/'api-jobs';plan_path=jobs/'animation-plan.json';plan=json.loads(plan_path.read_text());record=jobs/('animation-'+a.stage+'.json');endpoint='/videos/motion_detections' if a.stage=='capture' else '/motions/animations'
    if a.stage=='retarget' and plan['retarget']!='api':raise ValueError('Plan specifies local retargeting; no API call is needed')
    if not (project/'dist/animation.json').is_file():raise ValueError('Run scaffold.py before executing the plan')
    if not plan.get('server'):raise ValueError('Legacy quote lacks server binding; refresh an unsubmitted quote or explicitly migrate original task and quote')
    client=Client(load_config(project,a.config),binding=plan['server']);lock=jobs/'pipeline.lock'
    with lock.open('x') as f:f.write('v2fun-animation '+a.stage)
    try:
        if record.exists():
            state=json.loads(record.read_text())
            if state.get('server')!=plan['server']:raise ValueError('Task server differs from quote; restore original binding')
            if not state.get('task_uuid'):raise ValueError('Submission outcome unknown; do not repeat POST. Resolve the recorded attempt first.')
            if state.get('plan_sha256')!=sha(plan_path):raise ValueError('Plan changed; restore the original plan to recover this task')
            if state.get('status')=='COMPLETED':
                state.update(client.request(endpoint+'/'+state['task_uuid']));save(record,state)
        else:
            if not a.authorization or a.quote_sha256!=sha(plan_path):raise ValueError('Record actual user spending authorization and the exact reviewed quote hash')
            if time.time()-plan['created_at']>86400:raise ValueError('Quote is older than 24h; refresh it and report updated costs first')
            for name,file in [('video',plan['video']),('model',plan['model_file'])]:
                if sha(file)!=plan[name+'_sha256']:raise ValueError('Input changed after the quote')
            balance=client.request('/balance')['balance'];stage_cost=plan['services'][0 if a.stage=='capture' else 1]['budget_credits']
            # Capture requires enough balance for the whole accepted plan; recovery and retarget use remaining stage cost.
            required=plan['budget_credits'] if a.stage=='capture' else stage_cost
            if not isinstance(balance,(int,float)) or not math.isfinite(balance) or balance<required:raise ValueError('Insufficient or unavailable current balance')
            if a.stage=='capture':
                mime=mimetypes.guess_type(plan['video'])[0] or 'application/octet-stream'
                payload={'model':plan['capture_model'],'input_video':data_url(plan['video'],mime),'start_time_seconds':plan['start'],'duration_seconds':plan['duration'],'options':{'block':False}}
            else:
                capture=json.loads((jobs/'animation-capture.json').read_text())
                if capture.get('server')!=plan['server']:raise ValueError('Capture server differs from retarget server')
                if capture['status']!='COMPLETED':raise ValueError('Capture must complete before retargeting')
                motions=capture['metadata']['motions']
                if not 0<=a.motion_index<len(motions):raise ValueError('Select a valid tracked person')
                payload={'input_model':data_url(plan['model_file'],'model/gltf-binary'),'input_motion':motions[a.motion_index]['bvh_path'],'fps':-1,'options':{'block':False}}
            ledger=jobs/'budget-ledger.json'
            if not ledger.exists():save(ledger,{'max_new_tasks':len(plan['services']),'stage_limits':{'motion':1,'animation':int(plan['retarget']=='api')},'authorization':a.authorization,'authorization_history':[],'entries':{}})
            budget=Budget(project);budget.reserve(record,'motion' if a.stage=='capture' else 'animation')
            state={'server':client.binding(),'status':'SUBMITTING','endpoint':endpoint,'plan_sha256':sha(plan_path),'authorization':a.authorization,'motion_index':a.motion_index,'request_parameters':{k:v for k,v in payload.items() if not k.startswith('input_')},'balance_before':balance};save(record,state)
            try:result=client.request(endpoint,payload)
            except Exception:
                state['submission_outcome']='uncertain';save(record,state);budget.outcome(record,'uncertain');raise RuntimeError('Submission outcome unknown; task was not resubmitted') from None
            state.update(result);save(record,state)
            if not state.get('task_uuid'):budget.outcome(record,'uncertain');raise RuntimeError('No task ID returned; do not resubmit')
            budget.outcome(record,'created',state['task_uuid']);print(json.dumps({'task_uuid':state['task_uuid'],'status':state['status']}),flush=True)
        deadline=time.time()+1800
        while state['status'] not in {'COMPLETED','FAILED'} and time.time()<deadline:
            time.sleep(15)
            try:state.update(client.request(endpoint+'/'+state['task_uuid']));save(record,state);print(json.dumps({'status':state['status']}),flush=True)
            except Exception:print('Query failed; backing off for 120 seconds',flush=True);time.sleep(120)
        if state['status']!='COMPLETED':print(json.dumps({'status':state['status'],'resume_record':str(record)}));return
        assets=project/'dist/assets';assets.mkdir(exist_ok=True);wanted='.bvh' if a.stage=='capture' else '.glb';saved=[]
        for d in downloads(state.get('metadata',{})):
            if not d['asset_path'].lower().endswith(wanted):continue
            content=client.download(d['download_url'])
            if wanted=='.bvh' and not content.lstrip().startswith(b'HIERARCHY'):raise ValueError('Invalid BVH download')
            if wanted=='.glb' and content[:4]!=b'glTF':raise ValueError('Invalid GLB download')
            filename=Path(d['asset_path']).name;(assets/filename).write_bytes(content);saved.append(filename)
        if not saved:raise ValueError('No matching downloadable asset; inspect the saved response without creating another task')
        config_path=project/'dist/animation.json';config=json.loads(config_path.read_text());config['hands']=plan['hands']
        if a.stage=='capture':
            meta=state['metadata'];save(assets/'motion-meta.json',{'motions':meta['motions'],'fps':meta['fps']});config['motionIndex']=state['motion_index']
        else:
            results=[Path(v).name for v in state.get('result',[]) if isinstance(v,str) and v.endswith('.glb')]
            chosen=next((v for v in results if v in saved),None)
            if chosen is None:raise ValueError('No unambiguous animated result; inspect response and select the actual animated GLB')
            config['animatedModel']='assets/'+chosen;config['motionIndex']=state['motion_index']
        save(config_path,config)
        try:after=client.request('/balance')['balance'];state['balance_after']=after;save(record,state);print(json.dumps({'balance_remaining':after,'balance_delta':state.get('balance_before',after)-after,'note':'Balance delta may include other concurrent account activity'}))
        except Exception:print('Post-task balance unavailable; do not infer it')
        print(json.dumps({'status':'COMPLETED','files':saved,'hands_requested':plan['hands'],'hand_tracks_verified':False}))
    finally:lock.unlink(missing_ok=True)
if __name__=='__main__':main()
