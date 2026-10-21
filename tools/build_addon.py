#!/usr/bin/env python3
"""Build reviewed CHAC H-J supplemental content. Requires ffmpeg for clips."""
import json, argparse, pathlib, re, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parent.parent
DURATION=184.11
LETTERS='HIJ'
def clean_word(s): return s.strip().lower()
def fail(msg): raise ValueError(msg)
def validate(doc):
    if not isinstance(doc.get('segments'),list):fail('缺少 segments 陣列')
    warnings=[]; confirmed=[]; seen_words={}; intervals=[]
    for i,s in enumerate(doc['segments'],1):
        if s.get('status')!='confirmed': continue
        letter=str(s.get('letter','')).upper(); typ=s.get('type')
        if letter not in LETTERS:fail(f'第 {i} 段字母只能是 H/I/J')
        if typ not in ('pair','single'):fail(f'第 {i} 段類別錯誤')
        try: start=float(s['start']);end=float(s['end'])
        except (KeyError,ValueError,TypeError):fail(f'第 {i} 段時間無效')
        if not (0 <= start < end <= DURATION+.5):fail(f'第 {i} 段時間超出原音長度')
        if not str(s.get('transcript','')).strip(): fail(f'第 {i} 段缺少老師實際講話內容')
        name=str(s.get('name','')).strip()
        # Pair explicitly requires two comma-/slash-/plus-separated words; do not infer from bare names.
        parts=re.split(r'\s*[,，+/、&]\s*',name)
        if len(parts)!=(2 if typ=='pair' else 1):
            fail(f'第 {i} 段名稱請填 '+('兩個單字，以逗號分開，例如 word1, word2' if typ=='pair' else '一個單字'))
        words=[clean_word(w) for w in parts]
        if any(not re.fullmatch(r'[a-z]+(?:-[a-z]+)?',w) for w in words):fail(f'第 {i} 段名稱不是合法英文單字')
        for word in words:
            if word in seen_words:fail(f'重複單字 {word}：第 {seen_words[word]} 與 {i} 段')
            seen_words[word]=i
        intervals.append((start,end,i)); confirmed.append({'letter':letter,'type':typ,'words':words,'start':start,'end':end,'transcript':s['transcript'].strip(),'zh':str(s.get('zh','')).strip()})
    for (a,b,i),(c,d,j) in zip(sorted(intervals),sorted(intervals)[1:]):
        if b>c+0.12:fail(f'第 {i} 與第 {j} 段錄音時間重疊')
    for l in LETTERS:
        lp=[x for x in confirmed if x['letter']==l]
        if lp and sum(x['type']=='pair' for x in lp)!=1: warnings.append(f'{l} 已確認片段尚未恰有一個雙字共同教學片段')
    if not confirmed:warnings.append('目前無已確認片段，不產生正式單字卡')
    return confirmed,warnings

def main():
    ap=argparse.ArgumentParser();ap.add_argument('review',nargs='?',default='CHAC_HJ_segments_review.json');ap.add_argument('--no-audio',action='store_true');args=ap.parse_args()
    path=pathlib.Path(args.review)
    if not path.is_absolute():path=ROOT/path
    doc=json.loads(path.read_text(encoding='utf-8'))
    confirmed,warnings=validate(doc)
    dest=ROOT/'addons/PB1_HJ';(dest/'audio/clips').mkdir(parents=True,exist_ok=True)
    items=[]; image_missing=[]; audio=dest/'audio/teacher_HJ.m4a'
    for s in confirmed:
        slug='_'.join(s['words']);file=dest/'audio/clips'/f'{s["letter"].lower()}_{slug}.m4a'
        if not args.no_audio:
            if not audio.exists():fail('找不到原始錄音')
            subprocess.run(['ffmpeg','-nostdin','-y','-loglevel','error','-ss',str(s['start']),'-i',str(audio),'-t',str(s['end']-s['start']),'-vn','-c:a','aac','-b:a','128k',str(file)],check=True)
        for word in s['words']:
            pic=dest/'images'/f'{word}.webp'; image_missing.append(str(pic.relative_to(ROOT)) if not pic.exists() else None)
            items.append({'letter':s['letter'],'word':word,'zh':s['zh'] if s['type']=='single' else '', 'sentence':'','translation':'','image':str(pic.relative_to(ROOT)) if pic.exists() else None,'teacherAudio':str(file.relative_to(ROOT)), 'teacherGroup':slug,'reviewedTranscript':s['transcript'],'status':'needs_content_review'})
    report={'totalReviewedSegments':len(confirmed),'words':len(items),'warnings':warnings,'missingImage':list(filter(None,image_missing)),'missingSentence':[w['word'] for w in items], 'readyForPublication':False, 'note':'Requires per-word Chinese translations, sentences, approved crayon images and actual review before publishing'}
    (dest/'manifest.json').write_text(json.dumps({'addonId':'PB1_HJ','version':3,'words':items},ensure_ascii=False,indent=2),encoding='utf-8')
    (dest/'quality_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    (dest/'manifest.js').write_text('window.CHAC_HJ_ADDON = '+json.dumps({'addonId':'PB1_HJ','version':3,'words':items},ensure_ascii=False)+';\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':
    try:main()
    except (ValueError,subprocess.CalledProcessError,FileNotFoundError) as e:print('產生失敗:',e,file=sys.stderr);sys.exit(1)
