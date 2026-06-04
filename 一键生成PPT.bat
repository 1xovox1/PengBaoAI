@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Building PPTX from HTML...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0一键生成PPT.ps1"

echo.
pause

