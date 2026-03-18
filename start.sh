#!/bin/bash
# ClawAvatar 启动脚本 - 自动检查并安装依赖

echo "🦞 ClawAvatar 启动中..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Python3
echo -n "检查 Python3... "
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    echo -e "${GREEN}✓${NC} $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} 未找到 Python3，请先安装"
    exit 1
fi

# 检查 pip
echo -n "检查 pip... "
if command -v pip3 &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} 未找到 pip3"
    exit 1
fi

# 检查 Whisper
echo -n "检查 Whisper... "
if python3 -c "import whisper" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 已安装"
else
    echo -e "${YELLOW}!${NC} 正在安装 Whisper..."
    pip3 install openai-whisper
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Whisper 安装成功"
    else
        echo -e "${RED}✗${NC} Whisper 安装失败"
        exit 1
    fi
fi

# 检查 PyAV (音频处理)
echo -n "检查 PyAV... "
if python3 -c "import av" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 已安装"
else
    echo -e "${YELLOW}!${NC} 正在安装 PyAV..."
    pip3 install av
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} PyAV 安装成功"
    else
        echo -e "${RED}✗${NC} PyAV 安装失败"
        exit 1
    fi
fi

# 检查 Node.js
echo -n "检查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} 未找到 Node.js，请先安装"
    exit 1
fi

# 检查 Whisper 模型
echo -n "检查 Whisper 模型... "
MODEL_DIR="$HOME/.cache/whisper"
if [ -f "$MODEL_DIR/base.pt" ]; then
    echo -e "${GREEN}✓${NC} 已存在"
else
    echo -e "${YELLOW}!${NC} 首次运行将自动下载模型（约 145MB）"
fi

# 检查 OpenClaw (可选)
echo -n "检查 OpenClaw... "
if command -v openclaw &> /dev/null; then
    OPENCLAW_VERSION=$(openclaw --version 2>&1 | head -1)
    echo -e "${GREEN}✓${NC} $OPENCLAW_VERSION"
    USE_OPENCLAW=true
else
    echo -e "${YELLOW}!${NC} 未安装（语音对话功能将不可用）"
    USE_OPENCLAW=false
fi

# 检查端口 18790 是否被占用
echo -n "检查端口 18790... "
if lsof -i :18790 &> /dev/null; then
    echo -e "${YELLOW}!${NC} 端口已被占用，将尝试使用现有服务"
else
    echo -e "${GREEN}✓${NC} 可用"
fi

echo ""
echo "========================================"
echo "🦞 所有依赖检查完成！"
echo "========================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 杀掉旧的进程
echo "清理旧进程..."
pkill -f "node server" 2>/dev/null
pkill -f "ClawAvatar" 2>/dev/null

# 启动后端服务
echo "启动后端服务..."
node server.js > /tmp/clawavatar_server.log 2>&1 &
SERVER_PID=$!
sleep 2

# 检查服务是否启动成功
if curl -s http://127.0.0.1:18790/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 后端服务已启动 (PID: $SERVER_PID)"
else
    echo -e "${RED}✗${NC} 后端服务启动失败，请查看日志: /tmp/clawavatar_server.log"
    exit 1
fi

# 启动 Electron 应用
echo "启动 ClawAvatar 应用..."

# 检查打包的 app 是否存在
if [ -d "dist/mac-arm64/ClawAvatar.app" ]; then
    open dist/mac-arm64/ClawAvatar.app --args --no-sandbox
else
    # 尝试用 electron 直接运行
    if command -v electron &> /dev/null; then
        electron . --no-sandbox
    else
        echo -e "${RED}✗${NC} 未找到 Electron，请运行: npm install -g electron"
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "🎉 ClawAvatar 启动完成！"
echo "========================================"
echo ""
echo "服务地址: http://127.0.0.1:18790"
echo "日志文件: /tmp/clawavatar_server.log"
echo ""
echo "如需停止服务，请运行: pkill -f 'node server'"
echo ""
