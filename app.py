#!/usr/bin/env python3
import webview
import threading
import http.server
import socketserver
import os

PORT = 18791

# 切换到脚本所在目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 简单的 HTTP 服务器
class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

# 启动 HTTP 服务器
def start_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

# 在后台启动服务器
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

print(f"Server started on port {PORT}")

# 创建窗口
window = webview.create_window(
    'OpenClaw Avatar',
    f'http://127.0.0.1:{PORT}/index.html',
    width=400,
    height=650,
    resizable=False,
    frameless=True,
    transparent=True
)

# 启动
webview.start()
