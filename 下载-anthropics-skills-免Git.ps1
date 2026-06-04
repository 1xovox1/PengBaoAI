# Download anthropics/skills as ZIP (no Git required)
$ErrorActionPreference = "Stop"
$zipUrl = "https://github.com/anthropics/skills/archive/refs/heads/main.zip"
$root = $PSScriptRoot
$zipPath = Join-Path $root "skills-main.zip"
$folderPath = Join-Path $root "skills-main"
$targetPath = Join-Path $root "skills"

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

if (Test-Path $targetPath) { Remove-Item $targetPath -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $root -Force
Rename-Item $folderPath $targetPath
Remove-Item $zipPath -Force

Write-Host ""
Write-Host "Download OK. Folder: $targetPath"
Write-Host "Run ""安装全部技能到Cursor.bat"" to install skills into Cursor."
