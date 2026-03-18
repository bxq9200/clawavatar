#!/usr/bin/env python3
# 使用 macOS 的语音识别功能
import subprocess
import os
import json
import sys

# 创建一个简单的语音识别脚本
script = '''
use framework "Speech"
use framework "AVFoundation"

set audioInput to current application's AVAudioSession's sharedInstance()
audioInput's setCategory:(current application's AVAudioSession's categoryRecord) error:(missing value)
audioInput's setActive:true error:(missing value)

set speechRecognizer to current application's SFSpeechRecognizer's alloc()'s initWithLocale:(current application's NSLocale's localeWithLocaleIdentifier:"zh-CN")

set request to current application's SFSpeechAudioBufferRecognitionRequest's alloc()'s init()

set audioEngine to current application's AVAudioEngine's alloc()'s init()
set inputNode to audioEngine's inputNode

set recognitionTask to speechRecognizer's recognitionTaskWithRequest(request) errorHandler:^(error as (any), done as (boolean))
    if error is not missing value
        log "Error: " & error's localizedDescription() as text
        return
    end if
end recognitionTaskWithRequest

audioEngine's prepare()
audioEngine's startAndReturnError:(missing value)

delay 5

audioEngine's stop()
'''

# 简单方法：使用 say 命令测试
result = subprocess.run(['say', '-v', '?', 'zh_CN'], capture_output=True, text=True)
print("Available Chinese voices:")
for line in result.stdout.split('\n'):
    if 'zh' in line.lower():
        print(line)
