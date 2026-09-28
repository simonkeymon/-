# 人工智能简史 · 工程蓝图版 v2（国内外 AI 诞生史 · 中文旁白）

成片：`ai_history_v2.mp4`（3:20，1920×1080，30fps，中文旁白 + 字幕 + 配乐）

15 张图纸：1950 图灵之问 → 1956 达特茅斯 → 1960s 感知机与 ELIZA → 1974 两次寒冬 → 1977 吴方法 / 1981 中国人工智能学会 →
1997 深蓝 → 2011 Siri · 小冰 · Alexa · 讯飞 → 2012 AlexNet · 百度 IDL · 旷视 · 商汤 → 2016 AlphaGo（李世石、柯洁）→
2017 Transformer · GPT · BERT → 2022 Midjourney · Stable Diffusion · 文心一格 · ChatGPT →
2023 百模大战（GPT-4 · Claude · Gemini · Llama · 文心一言 · 通义千问 · 讯飞星火 · ChatGLM · 百川 · 豆包 · 混元 · Kimi）→
2025 Sora · 可灵 · o1 · DeepSeek-R1 → 2026 今天 → 开放式提问结尾

| 文件 | 内容 |
|---|---|
| `narration.py` | 旁白稿（显示文字 + TTS 读音写法），唯一的文案来源 |
| `tts.py` | 离线 TTS（sherpa-onnx + Kokoro 多语种模型，音色 100），生成 `voice.wav`、`timing.json`、`narration.srt` |
| `asr.py` | 用 SenseVoice 把配音转写回文字，核对发音 |
| `music.py` / `mix.py` | 合成配乐，并在旁白出现时自动压低音乐 |
| `parts/*.html`, `scenes.js`, `engine.js` | 图纸画面、程序化图形、动画引擎（场景时长跟随旁白） |
| `build.py` / `render.js` | 拼页面、逐帧渲染 |

## 重新生成
```bash
pip install numpy scipy soundfile sherpa-onnx imageio-ffmpeg
# 模型：k2-fsa/sherpa-onnx releases 中的 kokoro-multi-lang-v1_1（解压到 /opt/tts/）
python3 tts.py && python3 music.py && python3 mix.py && python3 build.py
export FFMPEG=$(python3 -c "import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())")
node render.js 0 6017 seg/all.mp4
$FFMPEG -i seg/all.mp4 -i soundtrack.wav -c:v copy -c:a aac -b:a 192k -shortest ai_history_v2.mp4
```
