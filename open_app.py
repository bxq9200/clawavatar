#!/usr/bin/env python3
import os
import subprocess

# 打开浏览器为桌面应用模式
url = "http://127.0.0.1:18790/index.html"

# 使用 Safari 打开，设置为全屏 app 模式
subprocess.Popen([
    'open', '-a', 'Safari', url,
    '--args', '-kiosk', '-fullscreen'
])
