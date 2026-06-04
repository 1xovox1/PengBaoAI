@echo off
chcp 65001 >nul
title Pengbao AI - Start
color 0A

echo ========================================
echo     Pengbao AI Startup Script
echo     Frontend:3000  Backend:3001
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

echo [INFO] Node.js version:
node -v
echo.

if exist "server\package.json" (
  echo [INFO] Starting backend (3001)...
  cd server
  start cmd /k npm install ^&^& npm run start
  cd ..
  timeout /t 2 >nul
) else (
  echo [WARN] server\package.json not found
)
echo.

echo [INFO] Starting frontend (3000)...
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
echo [INFO] Backend runs at http://localhost:3001
echo.

call npm run dev

echo.
echo [INFO] Frontend stopped
pause
