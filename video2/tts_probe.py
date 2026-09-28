import sherpa_onnx, soundfile as sf, sys
M='/opt/tts/kokoro-multi-lang-v1_1/'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
  model=M+'model.onnx',voices=M+'voices.bin',tokens=M+'tokens.txt',data_dir=M+'espeak-ng-data',dict_dir=M+'dict',
  lexicon=M+'lexicon-us-en.txt,'+M+'lexicon-zh.txt'),num_threads=4),rule_fsts=M+'date-zh.fst,'+M+'phone-zh.fst,'+M+'number-zh.fst',max_num_sentences=1)
tts=sherpa_onnx.OfflineTts(cfg)
lines=open(sys.argv[1],encoding='utf8').read().strip().split('\n');sid=int(sys.argv[2])
for i,l in enumerate(lines):
  a=tts.generate(l,sid=sid,speed=1.0);sf.write(f'probe_{i:02d}.wav',a.samples,a.sample_rate)
