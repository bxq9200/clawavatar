# ClawAvatar 🦞

> 小龙虾虚拟形象桌面应用 - 基于 OpenClaw 的 AI 助手

[English](./README_EN.md) | 中文

[![License](https://img.shields.io/github/license/ivanbai/clawavatar)](LICENSE)
[![Version](https://img.shields.io/github/v/release/ivanbai/clawavatar)](https://github.com/ivanbai/clawavatar/releases)

## ✨ 特性

- 🦞 **可爱小龙虾形象** - 3种风格切换（可爱/像素/科技）
- 💬 **智能对话** - 基于 OpenClaw 的 AI 对话能力
- 🎤 **语音交互** - 支持语音识别和语音合成
- 👆 **互动反馈** - 点击小龙虾会有可爱反应
- 🔊 **语音播报** - 可开关的语音播报功能
- 🖥️ **桌面应用** - 基于 Electron 的原生 macOS 应用

## 📸 截图

| 可爱风格 | 像素风格 | 科技风格 |
|---------|---------|---------|
| 🦞 | 🎨 | ⚡ |

## 🚀 快速开始

### 环境要求

- macOS (Apple Silicon)
- Python 3.9+
- Node.js 18+
- OpenClaw (可选，用于 AI 对话)

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/ivanbai/clawavatar.git
cd clawavatar
```

#### 2. 一键启动

```bash
./start.sh
```

启动脚本会自动检查并安装所需依赖：
- Python3 + pip3
- openai-whisper (语音识别)
- av/PyAV (音频处理)
- Node.js
- OpenClaw (可选)

#### 3. 手动启动（可选）

```bash
# 启动后端服务
cd clawavatar
node server.js

# 启动应用（另一个终端）
open dist/mac-arm64/ClawAvatar.app
```

### 访问方式

- **桌面应用**: 双击 `ClawAvatar.app`
- **浏览器**: 打开 http://127.0.0.1:18790

## 📖 使用说明

### 基础功能

1. **文字对话**: 在输入框输入文字，按回车发送
2. **语音对话**: 点击麦克风 🎤 按钮录音，再次点击停止
3. **切换形象**: 点击右上角 🦞 按钮切换风格
4. **开关语音**: 点击右上角 🔊 按钮开关语音播报
5. **切换声音**: 点击右下角 👤 按钮选择不同音色

### 形象风格

| 图标 | 名称 | 说明 |
|-----|------|------|
| 🦞 | 可爱风格 | 默认风格，圆润可爱 |
| 🎨 | 像素风格 | 复古像素风 |
| ⚡ | 科技风格 | 霓虹蓝色发光效果 |

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript
- **后端**: Node.js
- **语音识别**: OpenAI Whisper
- **语音合成**: macOS say / Edge TTS
- **桌面**: Electron
- **AI**: OpenClaw

## 📁 项目结构

```
clawavatar/
├── dist/
│   └── mac-arm64/
│       └── ClawAvatar.app    # 打包的应用
├── server.js                 # 后端服务
├── stt_server.py              # 语音识别服务
├── start.sh                  # 启动脚本
├── index.html                 # 前端页面
├── package.json              # Node 依赖
├── README.md                 # 中文说明
└── wechat_donate.jpg         # 微信打赏码
```

## ❓ 常见问题

### Q: 端口被占用怎么办？

```bash
# 查看占用进程
lsof -i :18790

# 杀掉占用进程
pkill -f "node server"
```

### Q: 语音识别失败？

确保已安装 whisper：
```bash
pip3 install --upgrade openai-whisper
```

### Q: AI 对话不可用？

确保已安装 OpenClaw：
```bash
npm install -g openclaw
```

### Q: 如何查看日志？

```bash
tail -f /tmp/clawavatar_server.log
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 了解详情

## ☕ 支持作者

如果这个项目对你有帮助，可以扫码打赏支持：

![微信支付](./wechat_donate.jpg)

---

<div align="center">

Made with ❤️ by [Ivan Bai](https://github.com/ivanbai)

</div>
