@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "skills\skills" (
    echo 未找到 skills\skills 目录。
    echo 请先双击运行 "克隆-anthropics-skills.bat" 完成克隆后再运行本脚本。
    pause
    exit /b 1
)

echo 正在将 skills 下的全部技能复制到 .cursor\skills\ ...
echo.

if not exist ".cursor" mkdir .cursor
if not exist ".cursor\skills" mkdir .cursor\skills

for /d %%i in (skills\skills\*) do (
    echo 安装: %%~nxi
    xcopy "%%i" ".cursor\skills\%%~nxi\" /E /I /Y /Q >nul
)

echo.
echo 全部 17 个技能已安装到 .cursor\skills\
echo 在 Cursor 里对话时，AI 会自动按需选用这些技能。
pause
