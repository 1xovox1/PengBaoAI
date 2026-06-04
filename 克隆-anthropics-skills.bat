@echo off
chcp 65001 >nul
echo 正在克隆 anthropics/skills 到当前目录...
echo.
cd /d "%~dp0"
git clone https://github.com/anthropics/skills.git
if %errorlevel% equ 0 (
    echo.
    echo 克隆完成。仓库位置: %~dp0skills
    echo 技能在 skills\skills\ 目录下，可复制需要的技能到 .cursor\skills\
) else (
    echo.
    echo 克隆失败：未检测到 Git 或 Git 未加入系统 PATH。
    echo.
    echo 请任选一种方式：
    echo   1. 安装 Git 后重新运行本脚本
    echo   2. 改用「下载-anthropics-skills-免Git.bat」无需 Git 直接下载
    echo.
)
pause
