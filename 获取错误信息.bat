@echo off
chcp 65001 >nul
title 获取错误信息指南
color 0B

echo ========================================
echo     如何获取错误信息帮助诊断问题
echo ========================================
echo.
echo 请按照以下步骤操作：
echo.
echo [步骤1] 打开浏览器开发者工具
echo    - 按 F12 键
echo    - 或右键点击页面，选择"检查"/"审查元素"
echo.
echo [步骤2] 查看控制台（Console）
echo    - 点击"Console"标签页
echo    - 查看是否有红色错误信息
echo    - 如果有错误，请复制所有红色文字
echo.
echo [步骤3] 查看网络（Network）
echo    - 点击"Network"标签页
echo    - 刷新页面（F5）
echo    - 查看是否有红色标记的文件（加载失败）
echo    - 记录失败的文件名称
echo.
echo [步骤4] 检查页面元素
echo    - 在开发者工具中，点击左上角的"选择元素"图标
echo    - 点击页面空白处
echo    - 查看Elements标签页中是否有 #app 元素
echo    - 查看 #app 元素的内容是什么
echo.
echo [步骤5] 尝试访问测试页面
echo    - 在浏览器地址栏输入: http://localhost:3000/test
echo    - 看是否能显示内容
echo.
echo ========================================
echo.
echo 请将以下信息提供给我：
echo 1. 控制台中的错误信息（截图或文字）
echo 2. Network中失败的文件名称
echo 3. #app 元素的内容
echo 4. 访问 /test 页面的结果
echo.
pause

