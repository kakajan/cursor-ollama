# Build Cursor-Ollama-Setup.exe with Inno Setup 6+
param(
  [string]$IsccPath = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

Write-Host "Installing npm dependencies..."
npm ci --omit=dev

$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force -Path $dist | Out-Null

if (-not (Test-Path $IsccPath)) {
  Write-Error "Inno Setup not found at: $IsccPath`nInstall from https://jrsoftware.org/isdl.php"
}

Write-Host "Compiling installer..."
& $IsccPath (Join-Path $root 'installer\windows\cursor-ollama.iss')

Write-Host "Done. Output in dist\"
