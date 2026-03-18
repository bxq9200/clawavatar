#!/usr/bin/env python3
import subprocess
import os
import sys

# 使用 macOS 的 say 命令来测试语音
# 真正的语音识别需要更多配置

if len(sys.argv) < 2:
    print("Usage: python stt.py <audio_file>")
    sys.exit(1)

audio_file = sys.argv[1]

# 使用 openai-whisper 来转写
# 首先检查是否安装
try:
    import whisper
except ImportError:
    print("Installing whisper...")
    subprocess.run([sys.executable, "-m", "pip", "install", "whisper"], check=True)
    import whisper

# 加载模型
print("Loading model...")
model = whisper.load_model("base")

# 转写
print("Transcribing...")
result = model.transcribe(audio_file, language="zh")
print(result["text"])
