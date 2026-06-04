@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Downloading anthropics/skills from GitHub (no Git needed)...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0下载-anthropics-skills-免Git.ps1"

if %errorlevel% neq 0 (
    echo.
    echo Download failed. Check network and try again.
)

echo.
pause
