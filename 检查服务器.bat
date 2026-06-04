@echo off
chcp 65001 >nul
title 检查开发服务器
color 0B

echo ========================================
echo     检查开发服务器状态
echo ========================================
echo.

echo [检查] 正在检查3000端口是否被占用...
netstat -ano | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo [√] 3000端口已被占用，开发服务器可能正在运行
    echo.
    echo 请打开浏览器，访问: http://localhost:3000
    echo.
    echo 如果页面仍然空白，请查看运行 npm run dev 的窗口
    echo 看是否有错误信息
) else (
    echo [×] 3000端口未被占用，开发服务器未运行
    echo.
    echo 请运行以下命令启动开发服务器：
    echo   npm run dev
    echo.
    echo 或者双击 start.bat 文件
)

echo.
echo ========================================
pause

