@echo off
chcp 65001 >nul
title 更新依赖包
color 0B

echo ========================================
echo         更新依赖包（修复Sass警告）
echo ========================================
echo.

echo [信息] 正在更新依赖包...
echo.

call npm install

if %errorlevel% equ 0 (
    echo.
    echo [成功] 依赖包更新完成！
    echo [提示] Sass警告已修复，现在可以正常运行项目了
) else (
    echo.
    echo [错误] 依赖包更新失败
)

echo.
pause

