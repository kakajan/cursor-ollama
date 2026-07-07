# cursor-ollama

![CI](https://github.com/kakajan/cursor-ollama/actions/workflows/ci.yml/badge.svg)

**CLI tool** to expose local [Ollama](https://ollama.com) to [Cursor IDE](https://cursor.com) via **Cloudflare Tunnel** and a **Strategy C proxy** (Bearer auth + model name rewrite).

**Landing page:** [kakajan.github.io/cursor-ollama](https://kakajan.github.io/cursor-ollama) · **AYTRONIC CO** · [`docs/seo.json`](docs/seo.json)

```bash
npm i -g cursor-ollama
# or
npx cursor-ollama init
```

## Install

```bash
npm install -g cursor-ollama
```

Requirements: Node.js 18+, [Ollama](https://ollama.com/download), [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/), Cloudflare domain.

## Quick start

```bash
cursor-ollama doctor          # check prerequisites
cursor-ollama init            # interactive wizard → ~/.cursor-ollama/
cloudflared tunnel login
cloudflared tunnel create cursor-ollama
cursor-ollama setup           # pull model, proxy service, tunnel
cursor-ollama cursor-config   # print Cursor Settings block
```

### From repo (development)

```bash
git clone git@github.com:kakajan/cursor-ollama.git
cd cursor-ollama
npm install
node bin/cursor-ollama.mjs init
cp env.example .env           # optional: legacy local mode
node bin/cursor-ollama.mjs setup --local
```

## Commands

| Command | Description |
|---------|-------------|
| `cursor-ollama init` | Interactive first-time setup |
| `cursor-ollama setup` | Full install (Ollama, proxy, tunnel) |
| `cursor-ollama verify` | Health checks |
| `cursor-ollama verify --mock` | Test without real Ollama |
| `cursor-ollama cursor-config` | Print Cursor copy-paste block |
| `cursor-ollama doctor` | Check node, ollama, cloudflared |
| `cursor-ollama proxy start` | Foreground proxy (dev) |
| `cursor-ollama proxy install` | Install OS proxy service |
| `cursor-ollama proxy stop` | Stop OS proxy service |
| `cursor-ollama proxy status` | Service status |

Flags for `setup`: `--local`, `--skip-tunnel`, `--skip-service`

## Config locations

| Global install (default) | Local dev (`--local`) |
|--------------------------|------------------------|
| `~/.cursor-ollama/config.json` | `./.env` |
| `~/.cursor-ollama/models.map.json` | `./config/models.map.json` |

## Cursor configuration

1. **Cursor Settings → Models**
2. Enable **Override OpenAI Base URL**
3. Base URL: `https://YOUR-TUNNEL-HOST/v1`
4. OpenAI API Key: your `OLLAMA_AUTH_KEY` from config
5. **Add model:** `gpt-4o-mini` (or your `cursorModelName`)
6. Disable built-in model with the same name

Example reference setup:

- Base URL: `https://antigravity.xilo.ir/v1`
- Cursor model: `gpt-4o-mini` → Ollama runs `qwen2.5-coder:7b`

## Architecture

```
Cursor cloud → https://TUNNEL/v1 → cloudflared → proxy :11435 → Ollama :11434
```

The proxy rewrites Cursor-allowlisted model names and validates Bearer auth.

## What works in Cursor

| Feature | Supported |
|---------|-----------|
| Chat | Yes |
| Cmd+K | Yes (varies by Cursor version) |
| Agent / Composer | Partial |
| Tab autocomplete | No (cloud-only) |
| Fully private | No (prompts hit Cursor servers) |

## Development

```bash
npm test
npm run test:unit
npm run test:integration
node bin/cursor-ollama.mjs verify --mock
npm pack --dry-run
```

Legacy shell wrappers (`scripts/setup.sh`, etc.) delegate to the CLI.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `AI Model Not Found` | Use allowlisted name (`gpt-4o-mini`); check `models.map.json` |
| `401 Unauthorized` | API key in Cursor must match `ollamaAuthKey` |
| Proxy not running | `cursor-ollama proxy start` or `cursor-ollama proxy install` |
| Built-in models broken | Toggle Override Base URL off when using Cursor-native models |

## License

MIT
