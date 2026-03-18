#!/usr/bin/env python3
"""
STT server using Whisper with PyAV for audio format conversion
"""
import sys
import os
import tempfile
import whisper

# Load model once
print("Loading Whisper model...", file=sys.stderr)
model = whisper.load_model("base")
print("Model loaded", file=sys.stderr)

def process_audio(input_path, output_path="/tmp/converted.wav"):
    """Convert audio file to WAV format using PyAV"""
    try:
        import av
        
        # Open input file
        container = av.open(input_path)
        
        # Find audio stream
        audio_stream = None
        for stream in container.streams:
            if stream.type == 'audio':
                audio_stream = stream
                break
        
        if not audio_stream:
            return None, "No audio stream found"
        
        # Create output file with WAV format
        output_container = av.open(output_path, mode='w', format='wav')
        out_stream = output_container.add_stream('pcm_s16le', rate=16000)
        
        # Decode and re-encode
        for frame in container.decode(audio_stream):
            # Resample to mono, 16kHz
            frame = frame.reformat(layout='mono', rate=16000)
            for packet in out_stream.encode(frame):
                output_container.mux(packet)
        
        # Flush encoder
        for packet in out_stream.encode():
            output_container.mux(packet)
        
        output_container.close()
        container.close()
        
        return output_path, None
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None, str(e)

def transcribe(audio_path):
    """Transcribe audio file"""
    wav_path = "/tmp/stt_input.wav"
    
    # Remove old file
    if os.path.exists(wav_path):
        os.remove(wav_path)
    
    # First, try direct transcription (works with some formats)
    try:
        result = model.transcribe(audio_path, language='zh')
        text = result['text'].strip()
        if text:
            print(f"Direct transcription: {text}", file=sys.stderr)
            return text
    except Exception as e:
        print(f"Direct transcription failed: {e}", file=sys.stderr)
    
    # Try to convert using PyAV
    converted, error = process_audio(audio_path, wav_path)
    
    if error:
        print(f"Conversion error: {error}", file=sys.stderr)
        return ""
    
    # Transcribe converted file
    result = model.transcribe(wav_path, language='zh')
    return result['text'].strip()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: stt_server.py <audio_file>", file=sys.stderr)
        sys.exit(1)
    
    audio_file = sys.argv[1]
    text = transcribe(audio_file)
    print(text)
