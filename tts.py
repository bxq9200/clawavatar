#!/usr/bin/env python3
import sys
import edge_tts
import asyncio

async def main():
    text = sys.argv[1] if len(sys.argv) > 1 else "你好"
    voice = sys.argv[2] if len(sys.argv) > 2 else "zh-CN-XiaoxiaoNeural"
    output = sys.argv[3] if len(sys.argv) > 3 else "/tmp/avatar_speech.mp3"
    
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output)

if __name__ == "__main__":
    asyncio.run(main())
