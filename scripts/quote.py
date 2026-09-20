# -*- coding: utf-8 -*-
#!/usr/bin/env python3
"""Read-only live pricing and balance; writes a reviewable task plan, never submits."""
import argparse, hashlib, html, json, math, re, time
from pathlib import Path
from urllib.request import urlopen
from runtime import SKILL
from v2fun_client import Client, load_config
from media_info import duration
PRICING='https://doc.v2fun.art/zh/pricing'
def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def parse_prices(raw):
    text=re.sub(r'<script\b[\s\S]*?</script>','',raw,flags=re.I)
    text=html.unescape(re.sub('<[^>]+>',' ',text));text=re.sub(r'\s+',' ',text)
    def rate(label):
        m=re.search(label+r'.{0,100}?([0-9.]+)\s*积分\s*/\s*([0-9.]+)\s*秒',text)
        if not m:raise ValueError('Pricing format changed; review official pricing before creating a quote')
        return {'credits':float(m[1]),'seconds':float(m[2])}
    m=re.search(r'动画重定向\s+单次调用\s+([0-9.]+)\s*积分',text)
    if not m:raise ValueError('Missing retargeting price')
    return {'turbo':rate('基础版'),'pro':rate('高级版'),'retarget':float(m[1])}
def estimate(seconds,rate):
    return {'proportional':round(seconds/rate['seconds']*rate['credits'],4),'budget':math.ceil(seconds/rate['seconds'])*rate['credits']}
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--project',type=Path,required=True);p.add_argument('--video',type=Path,required=True);p.add_argument('--model',type=Path);p.add_argument('--hands',choices=['yes','no'],required=True);p.add_argument('--retarget',choices=['local','api']);p.add_argument('--start',type=float,default=0);p.add_argument('--duration',type=float);p.add_argument('--config',type=Path);a=p.parse_args()
    for record in (a.project/'api-jobs').glob('animation-*.json'):
        if record.name=='animation-plan.json':continue
        state=json.loads(record.read_text())
        if state.get('task_uuid') or state.get('status')=='SUBMITTING':raise ValueError('Existing task requires its original quote. Resume it; use a separate project for a new plan.')
    model=(a.model or SKILL/'assets/default.glb').resolve();video=a.video.resolve();total=duration(video);seconds=a.duration if a.duration is not None else total-a.start
    if not math.isfinite(seconds) or seconds<=0 or a.start<0 or a.start+seconds>total+.05:raise ValueError('Invalid clip range')
    raw=model.read_bytes();doc=json.loads(raw[20:20+int.from_bytes(raw[12:16],'little')])
    if not doc.get('skins'):raise ValueError('Model has no skin. Rig it or use default.glb before quoting motion transfer.')
    retarget=a.retarget or ('api' if a.hands=='yes' else 'local');mode='pro' if a.hands=='yes' else 'turbo'
    with urlopen(PRICING,timeout=30) as r:pricing=r.read().decode()
    rates=parse_prices(pricing);balance=Client(load_config(a.project,a.config)).request('/balance')['balance']
    if not isinstance(balance,(int,float)) or not math.isfinite(balance):raise ValueError('Unknown balance schema; do not infer credits')
    amount=estimate(seconds,rates[mode]);extra=rates['retarget'] if retarget=='api' else 0
    services=[{'service':'Video motion capture','endpoint':'/videos/motion_detections','model':mode,'calls':1,'seconds':seconds,'estimated_credits':amount['proportional'],'budget_credits':amount['budget']}]
    if retarget=='api':services.append({'service':'Animation retargeting','endpoint':'/motions/animations','calls':1,'estimated_credits':extra,'budget_credits':extra})
    budget=amount['budget']+extra
    plan={'schema':1,'created_at':time.time(),'pricing_source':PRICING,'pricing_sha256':hashlib.sha256(pricing.encode()).hexdigest(),'rates':rates,'rounding_note':'Proportional estimate; reserve complete 3-second units because server rounding is not specified. Actual billing may differ.','video':str(video),'video_sha256':digest(video),'model_file':str(model),'model_sha256':digest(model),'using_default':a.model is None,'hands':a.hands=='yes','capture_model':mode,'retarget':retarget,'start':a.start,'duration':seconds,'video_duration':total,'services':services,'estimated_credits':amount['proportional']+extra,'budget_credits':budget,'balance_before':balance,'estimated_balance_after':balance-amount['proportional']-extra,'budget_balance_after':balance-budget,'sufficient_balance':balance>=budget}
    out=a.project.resolve()/'api-jobs/animation-plan.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(plan,indent=2))
    print(json.dumps({'plan':str(out),'quote_sha256':digest(out),'services':services,'estimate':plan['estimated_credits'],'budget':budget,'balance':balance,'estimated_remaining':plan['estimated_balance_after'],'budget_remaining':plan['budget_balance_after'],'sufficient_balance':plan['sufficient_balance'],'pricing_source':PRICING},indent=2))
if __name__=='__main__':main()
