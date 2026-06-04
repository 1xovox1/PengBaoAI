@echo off
chcp 65001 >nul
title 检查项目问题
color 0E

echo ========================================
echo         检查项目配置
echo ========================================
echo.

echo [1] 检查 node_modules...
if exist "node_modules" (
    echo [√] node_modules 存在
) else (
    echo [×] node_modules 不存在，请运行 npm install
)

echo.
echo [2] 检查关键文件...
if exist "src\main.js" (
    echo [√] src\main.js 存在
) else (
    echo [×] src\main.js 不存在
)

if exist "src\App.vue" (
    echo [√] src\App.vue 存在
) else (
    echo [×] src\App.vue 不存在
)

if exist "src\router\index.js" (
    echo [√] src\router\index.js 存在
) else (
    echo [×] src\router\index.js 不存在
)

if exist "index.html" (
    echo [√] index.html 存在
) else (
    echo [×] index.html 不存在
)

echo.
echo [3] 检查 package.json...
if exist "package.json" (
    echo [√] package.json 存在
    type package.json | findstr "vue" >nul
    if %errorlevel% equ 0 (
        echo [√] package.json 包含 vue
    ) else (
        echo [×] package.json 可能有问题
    )
) else (
    echo [×] package.json 不存在
)

echo.
echo ========================================
echo         检查完成
echo ========================================
echo.
echo 请打开浏览器开发者工具（F12）查看控制台错误
echo 访问地址: http://localhost:3000
echo.
pause

