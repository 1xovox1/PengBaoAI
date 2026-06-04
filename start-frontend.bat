@echo off
chcp 65001 >nul
title Pengbao AI - Frontend
color 0A

echo ========================================
echo     Start Frontend (3000)
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing frontend dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Frontend install failed
    pause
    exit /b 1
  )
)

echo [INFO] Frontend will open at http://localhost:3000
echo.

call npm run dev

echo.
echo [INFO] Frontend stopped
pause
