@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "SOURCE=.cursor\skills"
set "USER_SKILLS=%USERPROFILE%\.cursor\skills"

if not exist "%SOURCE%" (
    echo 未找到 .cursor\skills，请先运行「下载」和「安装全部技能到Cursor」。
    pause
    exit /b 1
)

echo 正在把当前项目的技能复制到 Cursor 用户目录...
echo 目标: %USER_SKILLS%
echo 复制后，任意新窗口、新项目都会看到这些技能。
echo.

if not exist "%USER_SKILLS%" mkdir "%USER_SKILLS%"

for /d %%i in ("%SOURCE%\*") do (
    if /i not "%%~nxi"=="README.md" (
        echo 复制: %%~nxi
        xcopy "%%i" "%USER_SKILLS%\%%~nxi\" /E /I /Y /Q >nul
    )
)

echo.
echo 已完成。请重新打开或切换项目窗口，在 Settings - Skills 中即可看到这些技能。
pause
