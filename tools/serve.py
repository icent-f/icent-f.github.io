#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地静态服务器（带 CORS 头）。

比 `python -m http.server` 多两件事：

1. 发送 Access-Control-Allow-Origin
   giscus 是用 <link crossorigin="anonymous"> 加载自定义主题 CSS 的，
   而那个 CSS 住在我们的站点上、请求来自 giscus.app 的 iframe，
   属于跨域请求。python 自带的 http.server 不发 CORS 头，
   缺了它本地就加载不出留言板主题（线上 GitHub Pages 自带 CORS，不受影响）。

2. 禁用缓存
   改完 CSS / JS 刷新即生效，不用每次 Ctrl+F5。

用法：
    python tools/serve.py          # 默认 8080
    python tools/serve.py 9000     # 换端口
"""
import functools
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def log_message(self, *args):
        pass          # 静音，免得刷屏


def main():
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(Handler, directory=ROOT)
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        print("==========================================")
        print("  Pay3Cents 的博客")
        print("  正在启动：http://127.0.0.1:%d" % PORT)
        print("  按 Ctrl+C 可停止服务器")
        print("==========================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n已停止。")


if __name__ == "__main__":
    main()
