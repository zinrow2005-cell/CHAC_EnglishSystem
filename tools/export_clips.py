#!/usr/bin/env python3
"""Export manually CONFIRMED teacher segments only. Run from addon root."""
import json,subprocess,sys,re,pathlib
p=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'CHAC_HJ_segments_review.json')
d=json.loads(p.read_text(encoding='utf8'))
audio=pathlib.Path('addons/PB1_HJ/audio/teacher_HJ.m4a')
if not audio.is_file():raise SystemExit('找不到錄音檔，請在補充包根目錄執行')
out=pathlib.Path('addons/PB1_HJ/audio/confirmed_clips');out.mkdir(parents=True,exist_ok=True)
manifest=[]
for i,s in enumerate(d.get('segments',[]),1):
 if s.get('status')!='confirmed':continue
 start,end=float(s['start']),float(s['end'])
 if not(0<=start<end<=184.11):raise SystemExit(f'第 {i} 段時間錯誤')
 name=re.sub(r'[^a-z0-9_-]+','_',s['name'].lower()).strip('_') or 'segment'
 dest=out/f'{i:02d}_{s["letter"]}_{name}.m4a'
 subprocess.run(['ffmpeg','-nostdin','-y','-loglevel','error','-ss',str(start),'-i',str(audio),'-t',str(end-start),'-vn','-c:a','aac','-b:a','128k',str(dest)],check=True)
 manifest.append({**s,'file':str(dest).replace('\\','/')})
(out/'confirmed_manifest.json').write_text(json.dumps({'segments':manifest},ensure_ascii=False,indent=2),encoding='utf8')
print('Exported',len(manifest),'confirmed segments')
