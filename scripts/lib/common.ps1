# Shared helpers for cursor-ollama-tunnel (Windows)

$_CommonLibDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$_ProjectRoot = (Resolve-Path (Join-Path $_CommonLibDir "..\..")).Path

function Get-ProjectRoot {
    return $_ProjectRoot
}

function Import-ProjectEnv {
    param([string]$Root = (Get-ProjectRoot))

    $envFile = Join-Path $Root ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
            $parts = $_ -split '=', 2
            if ($parts.Count -eq 2) {
                Set-Item -Path "env:$($parts[0].Trim())" -Value $parts[1].Trim()
            }
        }
    }
    if (-not $env:TUNNEL_HOSTNAME) { $env:TUNNEL_HOSTNAME = "ollama-you.example.com" }
    if (-not $env:TUNNEL_NAME) { $env:TUNNEL_NAME = "cursor-ollama" }
    if (-not $env:OLLAMA_PORT) { $env:OLLAMA_PORT = "11434" }
    if (-not $env:PROXY_PORT) { $env:PROXY_PORT = "11435" }
    if (-not $env:OLLAMA_SOURCE_MODEL) { $env:OLLAMA_SOURCE_MODEL = "qwen2.5-coder:7b" }
    if (-not $env:CURSOR_MODEL_NAME) { $env:CURSOR_MODEL_NAME = "gpt-4o-mini" }
    if (-not $env:SECURE_TUNNEL) { $env:SECURE_TUNNEL = "true" }
    if (-not $env:CLOUDFLARED_DIR) { $env:CLOUDFLARED_DIR = "$env:USERPROFILE\.cloudflared" }
}

function New-AuthKey {
    return -join ((1..48) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
}

function Write-ModelsMap {
    param(
        [string]$AuthKey,
        [string]$Root = (Get-ProjectRoot)
    )

    Import-ProjectEnv -Root $Root
    $mapPath = Join-Path $Root "config\models.map.json"
    $baseUrl = "https://$($env:TUNNEL_HOSTNAME)/v1"
    $secure = if ($env:SECURE_TUNNEL -eq 'false') { 'false' } else { 'true' }

    $json = @"
{
  "strategy": "proxy-rewrite",
  "authKey": "$AuthKey",
  "cursorApiKey": "$AuthKey",
  "cursorBaseUrl": "$baseUrl",
  "proxyPort": $($env:PROXY_PORT),
  "ollamaPort": $($env:OLLAMA_PORT),
  "secureTunnel": $secure,
  "mappings": [
    {
      "cursorName": "$($env:CURSOR_MODEL_NAME)",
      "ollamaName": "$($env:OLLAMA_SOURCE_MODEL)",
      "recommendedFor": "chat, cmd+k"
    }
  ]
}
"@

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($mapPath, $json, $utf8NoBom)
    return $mapPath
}

function Write-CursorBlock {
    param([string]$AuthKey)

    Import-ProjectEnv
    Write-Host ""
    Write-Host "========================================"
    Write-Host " Cursor Settings -> Models"
    Write-Host "========================================"
    Write-Host "  Override OpenAI Base URL: ON"
    Write-Host "  Base URL:  https://$($env:TUNNEL_HOSTNAME)/v1"
    Write-Host "  OpenAI API Key: $AuthKey"
    Write-Host "  Add model: $($env:CURSOR_MODEL_NAME)"
    Write-Host "  Disable built-in $($env:CURSOR_MODEL_NAME) toggle if present"
    Write-Host "  Ollama runs: $($env:OLLAMA_SOURCE_MODEL)"
    Write-Host "========================================"
    Write-Host ""
}

function Test-CommandExists {
    param([string]$Name, [string]$Hint)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Error "$Name not found. $Hint"
        exit 1
    }
}

function Test-OllamaRunning {
    Import-ProjectEnv
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$($env:OLLAMA_PORT)/api/tags" -TimeoutSec 5 | Out-Null
        return $true
    } catch {
        Write-Host "Starting Ollama..."
        Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        try {
            Invoke-RestMethod -Uri "http://127.0.0.1:$($env:OLLAMA_PORT)/api/tags" -TimeoutSec 5 | Out-Null
            return $true
        } catch {
            return $false
        }
    }
}

function Expand-HomePath {
    param([string]$Path)
    if ($Path.StartsWith('~/')) {
        return Join-Path $env:USERPROFILE $Path.Substring(2)
    }
    return $Path
}
