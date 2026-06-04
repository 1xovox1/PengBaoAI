@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "LOG=%~dp0ppt_build.log"
echo ============================== > "%LOG%"
echo %date% %time% >> "%LOG%"
echo ============================== >> "%LOG%"

echo Building PPTX from HTML (no Python required)...
echo.
echo (Log: %LOG%)
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js was not found.
  echo Please install Node.js LTS, then re-run this script.
  echo Node.js was not found.>> "%LOG%"
  pause
  exit /b 1
)

echo Installing converter dependencies (tools^)...
pushd tools
where npm >nul 2>nul
if %errorlevel% neq 0 (
  popd
  echo npm was not found. Please reinstall Node.js; it should include npm.
  echo npm was not found.>> "%LOG%"
  pause
  exit /b 1
)

call npm install >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
  popd
  echo npm install failed. Please check network and try again.
  echo npm install failed. See log: %LOG%
  pause
  exit /b 1
)
popd

echo Building PPTX...
node "tools\html_to_pptx.mjs" --html "2026_AI战略规划汇报.html" --out "2026_AI战略规划汇报.pptx" >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
  echo Build failed. See log: %LOG%
  pause
  exit /b 1
)

echo.
echo Done. Output: %~dp02026_AI战略规划汇报.pptx
echo.
pause

