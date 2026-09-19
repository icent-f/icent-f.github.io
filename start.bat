@echo off
setlocal
REM ============================================================
REM  启动「Pay3Cents 的博客」本地服务器
REM  需要本机已安装 Python 3（只用标准库，无需装依赖）
REM  用 tools/serve.py 而不是 python -m http.server：
REM  它会给响应加上 CORS 头（giscus 留言板主题跨域加载要用）
REM  并禁用缓存，改完刷新即生效
REM ============================================================
cd /d "%~dp0"

set PORT=8080
echo.
echo  ==========================================
echo   Pay3Cents 的博客
echo   正在启动：http://127.0.0.1:%PORT%
echo   按 Ctrl+C 可停止服务器
echo  ==========================================
echo.

start "" "http://127.0.0.1:%PORT%"

where python >nul 2>nul
if %errorlevel%==0 (
    python tools\serve.py %PORT%
) else (
    py tools\serve.py %PORT%
)

endlocal
