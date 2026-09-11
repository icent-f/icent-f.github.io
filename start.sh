#!/usr/bin/env bash
# 启动「Pay3Cents 的博客」本地服务器（Git Bash / WSL 可用）
# 用法： bash start.sh   （或 chmod +x start.sh && ./start.sh）
cd "$(dirname "$0")" || exit 1
PORT=8080
echo "=========================================="
echo "  Pay3Cents 的博客"
echo "  正在启动：http://127.0.0.1:$PORT"
echo "  按 Ctrl+C 可停止服务器"
echo "=========================================="
# 尝试自动打开浏览器
if command -v xdg-open >/dev/null 2>&1; then xdg-open "http://127.0.0.1:$PORT" >/dev/null 2>&1 & fi
python3 -m http.server "$PORT"
