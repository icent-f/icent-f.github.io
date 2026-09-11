@echo off
setlocal
REM ============================================================
REM  启动「Pay3Cents 的博客」本地服务器
REM  需要本机已安装 Python 3（自带 http.server，无需装依赖）
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
    python -m http.server %PORT%
) else (
    py -m http.server %PORT%
)

endlocal
