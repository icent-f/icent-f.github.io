@echo off
setlocal
REM 扫描 content/所有文章/ 下的 Markdown，重建 data/posts.json
cd /d "%~dp0"
echo.
where python >nul 2>nul
if %errorlevel%==0 (
    python tools\build_index.py
) else (
    py tools\build_index.py
)
echo.
pause
endlocal
