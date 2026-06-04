@echo off
chcp 65001 >nul
title Pengbao AI - Backend
color 0B

echo ========================================
echo     Start Backend (3001)
echo ========================================
echo.

if not exist "server\package.json" (
  echo [ERROR] server\package.json not found
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found
  pause
  exit /b 1
)

cd server
call npm install
if errorlevel 1 (
  echo [ERROR] Backend install failed
  pause
  exit /b 1
)

call npm run start

echo.
echo [INFO] Backend stopped
pause
