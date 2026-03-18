const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 18790;

// macOS 本地语音
const VOICES = {
  'Shelley (中文（中国大陆）)': '雪莱 - 普通话女声',
  'Tingting': '婷婷 - 普通话女声',
  'Sandy (中文（中国大陆）)': '珊迪 - 普通话女声',
  'Meijia': '美佳 - 普通话女声',
  'Sinji': '善怡 - 普通话女声',
  'Reed (中文（中国大陆）)': '里德 - 普通话男声',
  'Rocko (中文（中国大陆）)': '罗科 - 普通话男声',
  'Eddy (中文（中国大陆）)': '艾迪 - 普通话男声',
  'Grandma (中文（中国大陆）)': '奶奶 - 普通话女声',
  'Grandpa (中文（中国大陆）)': '爷爷 - 普通话男声'
};

// 移除 emoji 的函数
function removeEmoji(text) {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
             .replace(/[🎵🎉😂🥰😳😄✅🎤🔊]/g, '')
             .trim();
}

let currentVoice = 'Tingting';

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 返回 index.html
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && req.url === '/voices') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(VOICES));
    return;
  }

  if (req.method === 'POST' && req.url === '/setVoice') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { voice } = JSON.parse(body);
        if (VOICES[voice] || voice === 'Tingting') {
          currentVoice = voice;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, voice: VOICES[voice] || voice }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid voice' }));
        }
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // TTS - 文字转语音
  if (req.method === 'POST' && req.url === '/tts') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        const cleanText = removeEmoji(text);
        const voice = currentVoice;
        
        const aiffFile = '/tmp/avatar_tts.aiff';
        const m4aFile = '/tmp/avatar_tts.m4a';
        
        try { fs.unlinkSync(aiffFile); } catch(e) {}
        try { fs.unlinkSync(m4aFile); } catch(e) {}
        
        const say = spawn('/usr/bin/say', ['-v', voice, '-r', '165', '-o', aiffFile, cleanText]);
        
        say.on('close', () => {
          const convert = spawn('/usr/bin/afconvert', ['-f', 'm4af', '-d', 'aac', aiffFile, m4aFile]);
          convert.on('close', () => {
            fs.readFile(m4aFile, (err, data) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read audio: ' + err.message }));
                return;
              }
              res.writeHead(200, { 
                'Content-Type': 'audio/mp4',
                'Cache-Control': 'no-cache, no-store'
              });
              res.end(data);
            });
          });
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // STT - 语音转文字 (Whisper)
  if (req.method === 'POST' && req.url === '/stt') {
    let body = [];
    
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    
    req.on('end', () => {
      const buffer = Buffer.concat(body);
      console.log('Received audio, size:', buffer.length);
      
      // 保存上传的音频文件
      const ext = req.headers['content-type']?.includes('wav') ? 'wav' : 'webm';
      const inputFile = `/tmp/stt_input.${ext}`;
      fs.writeFileSync(inputFile, buffer);
      
      // 使用 Python 脚本处理（支持 PyAV 转换）
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      const python = spawn('/usr/bin/python3', [
        path.join(__dirname, 'stt_server.py'),
        inputFile
      ]);
      
      let output = '';
      
      python.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        console.error('STT:', data.toString().trim());
      });
      
      python.on('close', (code) => {
        const text = output.trim();
        console.log('Whisper result:', text || '(empty)');
        if (text) {
          res.end(JSON.stringify({ text }));
        } else {
          res.end(JSON.stringify({ error: '未能识别到声音' }));
        }
      });
      
      python.on('error', (err) => {
        console.log('STT error:', err.message);
        res.end(JSON.stringify({ error: err.message }));
      });
    });
    return;
  }

  // Chat - AI 对话
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        
        const agent = spawn('openclaw', ['agent', '--agent', 'main', '--message', message, '--json'], {
          env: { ...process.env }
        });
        
        let output = '';
        
        agent.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        agent.stderr.on('data', (data) => {});
        
        agent.on('close', (code) => {
          try {
            const jsonStart = output.indexOf('{');
            if (jsonStart === -1) {
              throw new Error('No JSON found');
            }
            
            const jsonStr = output.substring(jsonStart);
            const data = JSON.parse(jsonStr);
            const reply = data?.result?.payloads?.[0]?.text || '抱歉，我现在有点忙';
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply }));
          } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ reply: '抱歉，响应解析失败' }));
          }
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Avatar API server running on http://127.0.0.1:${PORT}`);
});
