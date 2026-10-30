@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo   WebUI 图鉴  -  http://localhost:8080
echo   关闭此窗口即停止服务
echo ========================================
where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8080/library.html
    python -m http.server 8080
    goto :eof
)
where npx >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8080/library.html
    npx --yes serve -l 8080 .
    goto :eof
)
echo [错误] 没找到 python 或 npx，请先装一个。
pause
