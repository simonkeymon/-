"""Synthesize narration per chunk, lay out scene timing, write voice.wav + timing.json + narration.srt."""
import json, numpy as np, soundfile as sf, sherpa_onnx
from scipy.signal import resample_poly
from narration import SCENES
M='/opt/tts/kokoro-multi-lang-v1_1/'; SID=100; SPEED=1.14; SR=44100
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
  model=M+'model.onnx',voices=M+'voices.bin',tokens=M+'tokens.txt',data_dir=M+'espeak-ng-data',dict_dir=M+'dict',
  lexicon=M+'lexicon-us-en.txt,'+M+'lexicon-zh.txt'),num_threads=4),rule_fsts=M+'date-zh.fst,'+M+'phone-zh.fst,'+M+'number-zh.fst',max_num_sentences=1)
tts=sherpa_onnx.OfflineTts(cfg)
LEAD={'s00':1.6}; DEFAULT_LEAD=0.8; GAP=0.22; TAIL=1.0; MINDUR=9.5; END_HOLD=4.5

def trim(a, thr=0.01):
    idx=np.where(np.abs(a)>thr)[0]
    return a[max(0,idx[0]-200):idx[-1]+800] if len(idx) else a

clips=[]; starts={}; subs=[]; t=0.0
for sid,chunks in SCENES:
    starts[sid]=round(t,3); cur=t+LEAD.get(sid,DEFAULT_LEAD)
    for ch in chunks:
        disp=ch[0]; say=ch[1] if len(ch)>1 else ch[0]
        g=tts.generate(say,sid=SID,speed=SPEED)
        a=resample_poly(trim(np.array(g.samples)),SR*1,g.sample_rate).astype(np.float32) if g.sample_rate!=SR else trim(np.array(g.samples))
        d=len(a)/SR; clips.append((cur,a))
        # subtitle pieces: split long lines at commas, time by character share
        pieces=[]; buf=''
        for part in disp.replace('，','，|').replace('；','；|').split('|'):
            if len(buf)+len(part)>24 and buf: pieces.append(buf); buf=part
            else: buf+=part
        if buf: pieces.append(buf)
        merged=[]
        for p in pieces:
            if merged and (len(merged[-1])<9) and len(merged[-1])+len(p)<=34: merged[-1]+=p
            else: merged.append(p)
        pieces=merged
        tot=sum(len(p) for p in pieces); s=cur
        for p in pieces:
            e=s+d*len(p)/tot; subs.append({'s':round(s,3),'e':round(e,3),'text':p.rstrip('，；')}); s=e
        cur+=d+GAP
    t=max(cur-GAP+TAIL, t+MINDUR)
    print(sid, 'start', starts[sid], 'dur', round(t-starts[sid],2))
total=round(t+END_HOLD,3)
voice=np.zeros(int(total*SR)+SR,dtype=np.float32)
for s,a in clips: i=int(s*SR); voice[i:i+len(a)]+=a
voice=voice[:int(total*SR)]; voice*=0.9/np.abs(voice).max()
sf.write('voice.wav',voice,SR)
json.dump({'total':total,'starts':starts,'subs':subs},open('timing.json','w',encoding='utf8'),ensure_ascii=False,indent=1)
def ts(x): h=int(x//3600); m=int(x%3600//60); s=x%60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s%1)*1000)):03d}'.replace(',1000',',999')
with open('narration.srt','w',encoding='utf8') as f:
    for i,c in enumerate(subs,1): f.write(f"{i}\n{ts(c['s'])} --> {ts(c['e'])}\n{c['text']}\n\n")
print('total',total)
