import sherpa_onnx, soundfile as sf, sys, numpy as np
from scipy.signal import resample_poly
D='/opt/tts/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17/'
rec=sherpa_onnx.OfflineRecognizer.from_sense_voice(model=D+'model.int8.onnx',tokens=D+'tokens.txt',language='auto',use_itn=True,num_threads=4)
for f in sys.argv[1:]:
  a,sr=sf.read(f,dtype='float32')
  if a.ndim>1:a=a.mean(1)
  if sr!=16000:a=resample_poly(a,16000,sr).astype('float32');sr=16000
  s=rec.create_stream();s.accept_waveform(sr,a);rec.decode_stream(s);print(f,'|',s.result.text)
