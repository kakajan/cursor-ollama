# Build Cursor-Ollama-Setup.exe with Inno Setup 6+
param(
  [string]$IsccPath = '',
  [string]$NodeVersion = '20.19.0'
)

$ErrorActionPreference = 'Stop'

function Resolve-IsccPath {
  param([string]$PreferredPath)

  if ($PreferredPath -and (Test-Path $PreferredPath)) {
    return $PreferredPath
  }

  if ($env:ISCC -and (Test-Path $env:ISCC)) {
    return $env:ISCC
  }

  $candidates = @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  return $null
}
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$pkg = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$appVersion = $pkg.version

Write-Host "Building Cursor-Ollama-Setup-$appVersion.exe ..."

Write-Host "Installing npm dependencies..."
npm ci --omit=dev

$vendorNode = Join-Path $root 'vendor\node'
$nodeExe = Join-Path $vendorNode 'node.exe'

if (-not (Test-Path $nodeExe)) {
  Write-Host "Downloading Node.js $NodeVersion (win-x64)..."
  $nodeZip = "node-v$NodeVersion-win-x64.zip"
  $nodeUrl = "https://nodejs.org/dist/v$NodeVersion/$nodeZip"
  $cacheDir = Join-Path $root 'vendor\cache'
  $zipPath = Join-Path $cacheDir $nodeZip

  New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
  if (-not (Test-Path $zipPath)) {
    Invoke-WebRequest -Uri $nodeUrl -OutFile $zipPath -UseBasicParsing
  }

  $extractDir = Join-Path $cacheDir "node-v$NodeVersion-win-x64"
  if (-not (Test-Path $extractDir)) {
    Expand-Archive -Path $zipPath -DestinationPath $cacheDir -Force
  }

  if (Test-Path $vendorNode) {
    Remove-Item -Recurse -Force $vendorNode
  }
  Move-Item -Path $extractDir -Destination $vendorNode
  Write-Host "Node.js runtime staged at vendor\node"
} else {
  Write-Host "Using cached Node.js runtime at vendor\node"
}

$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force -Path $dist | Out-Null

$IsccPath = Resolve-IsccPath -PreferredPath $IsccPath
if (-not $IsccPath) {
  Write-Error @"
Inno Setup not found. Install from https://jrsoftware.org/isdl.php
Expected one of:
  ${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe
  $env:ProgramFiles\Inno Setup 6\ISCC.exe
  $env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe
Or on CI: choco install innosetup -y
Or pass -IsccPath / set ISCC to your ISCC.exe path
"@
}

$iss = Join-Path $root 'installer\windows\cursor-ollama.iss'
Write-Host "Compiling installer with Inno Setup..."
& $IsccPath "/DAppVersion=$appVersion" $iss

$outFile = Join-Path $dist "Cursor-Ollama-Setup-$appVersion.exe"
if (Test-Path $outFile) {
  $sizeMb = [math]::Round((Get-Item $outFile).Length / 1MB, 1)
  Write-Host "Done: $outFile ($sizeMb MB)"
} else {
  Write-Error "Installer was not produced at expected path: $outFile"
}
