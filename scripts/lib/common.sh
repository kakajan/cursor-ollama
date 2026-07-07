#!/usr/bin/env bash
# Shared helpers for cursor-ollama-tunnel setup scripts

set -euo pipefail

_lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$_lib_dir/../.." && pwd)"
SCRIPT_DIR="$(cd "$_lib_dir/.." && pwd)"

load_env() {
  local env_file="$ROOT_DIR/.env"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi

  TUNNEL_HOSTNAME="${TUNNEL_HOSTNAME:-ollama-you.example.com}"
  TUNNEL_NAME="${TUNNEL_NAME:-cursor-ollama}"
  OLLAMA_PORT="${OLLAMA_PORT:-11434}"
  PROXY_PORT="${PROXY_PORT:-11435}"
  OLLAMA_SOURCE_MODEL="${OLLAMA_SOURCE_MODEL:-qwen2.5-coder:7b}"
  CURSOR_MODEL_NAME="${CURSOR_MODEL_NAME:-gpt-4o-mini}"
  SECURE_TUNNEL="${SECURE_TUNNEL:-true}"
  MODEL_ALIAS_STRATEGY="${MODEL_ALIAS_STRATEGY:-proxy-rewrite}"
  CLOUDFLARED_DIR="${CLOUDFLARED_DIR:-$HOME/.cloudflared}"
}

expand_home() {
  local p="$1"
  if [[ "$p" == "~/"* ]]; then
    echo "$HOME/${p:2}"
  else
    echo "$p"
  fi
}

generate_auth_key() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
  else
    node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
  fi
}

write_models_map() {
  local auth_key="$1"
  local map_file="$ROOT_DIR/config/models.map.json"
  local base_url="https://${TUNNEL_HOSTNAME}/v1"

  cat > "$map_file" <<EOF
{
  "strategy": "proxy-rewrite",
  "authKey": "${auth_key}",
  "cursorApiKey": "${auth_key}",
  "cursorBaseUrl": "${base_url}",
  "proxyPort": ${PROXY_PORT},
  "ollamaPort": ${OLLAMA_PORT},
  "secureTunnel": ${SECURE_TUNNEL},
  "mappings": [
    {
      "cursorName": "${CURSOR_MODEL_NAME}",
      "ollamaName": "${OLLAMA_SOURCE_MODEL}",
      "recommendedFor": "chat, cmd+k"
    }
  ]
}
EOF
  echo "$map_file"
}

print_cursor_block() {
  local auth_key="$1"
  echo ""
  echo "========================================"
  echo " Cursor Settings → Models"
  echo "========================================"
  echo "  Override OpenAI Base URL: ON"
  echo "  Base URL:  https://${TUNNEL_HOSTNAME}/v1"
  echo "  OpenAI API Key: ${auth_key}"
  echo "  Add model: ${CURSOR_MODEL_NAME}"
  echo "  Disable built-in ${CURSOR_MODEL_NAME} toggle if present"
  echo "  Ollama runs: ${OLLAMA_SOURCE_MODEL}"
  echo "========================================"
  echo ""
}

require_cmd() {
  local cmd="$1"
  local hint="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' not found. $hint" >&2
    exit 1
  fi
}

check_ollama() {
  if curl -sf "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null 2>&1; then
    return 0
  fi
  echo "Starting Ollama..."
  if command -v ollama >/dev/null 2>&1; then
    (ollama serve >/dev/null 2>&1 &) || true
    sleep 2
  fi
  curl -sf "http://127.0.0.1:${OLLAMA_PORT}/api/tags" >/dev/null
}

render_tunnel_config() {
  local tunnel_id="$1"
  local creds="$2"
  local out="$3"
  sed \
    -e "s|{{TUNNEL_ID}}|${tunnel_id}|g" \
    -e "s|{{CREDENTIALS_FILE}}|${creds}|g" \
    -e "s|{{TUNNEL_HOSTNAME}}|${TUNNEL_HOSTNAME}|g" \
    -e "s|{{PROXY_PORT}}|${PROXY_PORT}|g" \
    "$ROOT_DIR/config/tunnel.yml.template" > "$out"
}
