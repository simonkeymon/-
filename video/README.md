# 人工智能简史 · 工程蓝图版

成片：`ai_history_blueprint.mp4`（3:01，1920×1080，30fps，含配乐）

| 文件 | 内容 |
|---|---|
| `STYLE.md` | 风格规范（色板、字体、版式、运动规则） |
| `STORYBOARD.md` | 分镜表 |
| `narration.srt` | 旁白稿（带时间轴，可录音或用 TTS 配音） |
| `parts/*.html` | 每张图纸的画面（`build.py` 拼成 `index.html`） |
| `scenes.js` / `engine.js` | 程序化图形 / 时间轴动画引擎 |
| `music.py` | 合成配乐，生成 `music.wav` |
| `render.js` | 逐帧渲染成 H.264 片段 |

## 重新生成
```bash
pip install numpy scipy imageio-ffmpeg
export FFMPEG=$(python3 -c "import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())")
python3 build.py && python3 music.py
node render.js 0 5430 seg/all.mp4        # 或拆成几段并行
$FFMPEG -i seg/all.mp4 -i music.wav -c:v copy -c:a aac -b:a 192k -shortest ai_history_blueprint.mp4
```
在浏览器打开 `index.html?play` 可实时预览，`index.html?t=95` 跳到指定秒数。
