# One-click build PPTX from HTML
$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$req = Join-Path $root "tools\requirements.txt"
$html = Join-Path $root "2026_AI战略规划汇报.html"
$out = Join-Path $root "2026_AI战略规划汇报.pptx"

Write-Host "Installing dependencies..." -ForegroundColor Cyan
python -m pip install -r $req

Write-Host "Building PPTX..." -ForegroundColor Cyan
python (Join-Path $root "tools\html_to_pptx.py") --html $html --out $out

Write-Host ""
Write-Host "OK: $out" -ForegroundColor Green

