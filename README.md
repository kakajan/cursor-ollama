# cursor-ollama



![CI](https://github.com/kakajan/cursor-ollama/actions/workflows/ci.yml/badge.svg)



**CLI tool** to expose local [Ollama](https://ollama.com) to [Cursor IDE](https://cursor.com) via **Cloudflare Tunnel** and a **Strategy C proxy** (Bearer auth + model name rewrite).



**Landing page:** [kakajan.github.io/cursor-ollama](https://kakajan.github.io/cursor-ollama) (English + Persian) · **AYTRONIC CO** · [`docs/seo.json`](docs/seo.json)



```bash

npm i -g cursor-ollama

cursor-ollama wizard    # Windows: graphical setup (recommended)

# or

cursor-ollama init      # terminal wizard

```



## Requirements



| Tool | Purpose |

|------|---------|

| [Node.js 18+](https://nodejs.org) | CLI runtime |

| [Ollama](https://ollama.com/download) | Local LLM server (`:11434`) |

| [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | Cloudflare Tunnel connector |
| Cloudflare domain | **Optional** — use your own hostname, or pick **temporary trycloudflare link** in the wizard (no domain needed) |



## Quick start



### Windows (recommended)



```powershell

npm install -g cursor-ollama

cursor-ollama wizard

```



The browser wizard (English default, Persian optional, **Vazirmatn** font) walks through:



1. Prerequisites check (Node, Ollama, cloudflared)

2. **Tunnel mode:** Cloudflare domain **or** temporary trycloudflare link (no domain)

3. Hostname + tunnel name (named mode) **or** auto-generated public URL (quick mode)

4. Ollama port + proxy port (defaults `11434` / `11435`)

5. Ollama model + Cursor allowlisted model name

6. Desktop shortcut, Windows startup, launch tray



Or double-click after clone/install:



```cmd

bin\Cursor-Ollama-Wizard.cmd

bin\Cursor-Ollama-Tray.cmd

```



**Build a setup `.exe`** (requires [Inno Setup 6+](https://jrsoftware.org/isdl.php)):

The installer bundles Node.js — end users do **not** need Node installed separately.

```powershell
npm run build:win
# or
powershell -ExecutionPolicy Bypass -File installer/windows/build.ps1

# → dist/Cursor-Ollama-Setup-1.4.0.exe
```

On GitHub, push a `v*` tag or run the **Windows Installer** workflow manually to produce a release artifact.



### CLI (all platforms)



```bash

cursor-ollama doctor          # check prerequisites

cursor-ollama init            # interactive setup → ~/.cursor-ollama/

cloudflared tunnel login

cloudflared tunnel create cursor-ollama

cursor-ollama setup           # pull model, proxy, tunnel config, DNS route

cursor-ollama tray            # system tray in background (Windows/macOS/Linux)

cursor-ollama cursor-config   # print Cursor Settings block

cursor-ollama verify          # health checks (local + tunnel)

```



### From repo (development)



```bash

git clone git@github.com:kakajan/cursor-ollama.git

cd cursor-ollama

npm install

node bin/cursor-ollama.mjs wizard

node bin/cursor-ollama.mjs init

node bin/cursor-ollama.mjs setup --local   # uses ./.env

```



## Commands



| Command | Description |

|---------|-------------|

| `cursor-ollama wizard` | Graphical setup wizard in browser |

| `cursor-ollama init` | Interactive terminal first-time setup |

| `cursor-ollama setup` | Full install (Ollama pull, proxy, tunnel, DNS) |

| `cursor-ollama verify` | Health checks (Ollama, proxy, tunnel HTTPS) |

| `cursor-ollama verify --mock` | Test without real Ollama |

| `cursor-ollama cursor-config` | Print Cursor copy-paste block |

| `cursor-ollama doctor` | Check node, ollama, cloudflared |

| `cursor-ollama proxy start` | Foreground proxy (dev) |

| `cursor-ollama proxy install` | Install OS proxy service |

| `cursor-ollama proxy stop` | Stop OS proxy service |

| `cursor-ollama proxy status` | Service status |

| `cursor-ollama tunnel run` | Run Cloudflare tunnel in foreground |

| `cursor-ollama tunnel install` | Install cloudflared OS service |

| `cursor-ollama tunnel status` | Tunnel config + HTTPS `/health` check |

| `cursor-ollama tray` | System tray in background (survives terminal close) |

| `cursor-ollama stack [action]` | Start/stop proxy + tunnel (`start`, `stop`, `status`, …) |

| `cursor-ollama settings` | Open settings page (ports, tunnel mode, quick link copy/refresh) |

| `cursor-ollama settings --config` | Open `config.json` in editor |

| `cursor-ollama uninstall` | Remove tray, shortcuts, services (optional `--keep-config`) |



**Setup flags:** `--local`, `--skip-tunnel`, `--skip-service`, `--skip-pull`



**Wizard flags:** `--port 17435`, `--no-browser`

**Settings flags:** `--config` (open config file instead of browser UI)



## Tunnel modes



| Mode | When to use | Public URL |

|------|-------------|------------|

| **Named** (`tunnelMode: "named"`) | You have a domain on Cloudflare DNS | `https://your-host.example.com/v1` |

| **Quick** (`tunnelMode: "quick"`) | No domain — testing or first try | `https://random.trycloudflare.com/v1` (changes on refresh) |



In the wizard, answer **“Do you have a domain on Cloudflare?”**



- **Yes** → enter hostname + tunnel name; wizard writes YAML and routes DNS (same as before).

- **No** → install starts a **trycloudflare** quick tunnel automatically. Copy or refresh the link from **tray** or **Settings…**.



Quick tunnels are **temporary**. After **Refresh quick tunnel**, update Base URL in Cursor Settings.



## System tray



```bash

cursor-ollama tray

```



Runs **detached in the background** — close the terminal safely. A second instance is prevented via `~/.cursor-ollama/tray.pid`.



Tray menu:



- **Start/Stop all**, **Start/Stop proxy**, **Start/Stop tunnel** — one row per scope; label toggles with live status

- Switch **Cursor model** preset or **Ollama backend** (updates `models.map.json` live)

- **Copy tunnel URL** — copies `https://…/v1` to clipboard (Cursor Base URL)

- **Refresh quick tunnel** — new trycloudflare link (quick mode only; update Cursor after refresh)

- **Settings…** — browser page: ports, tunnel mode, copy/refresh quick link

- **Open config file** — edit `~/.cursor-ollama/config.json` in Notepad

- **Show Cursor config** — opens copy-paste block + clipboard

- **About…** — project info, links, support & contribute (GitHub, Issues, docs)

- **Exit** — stops managed processes and closes tray



Use the wizard/installer **Start with Windows** option, or add `cursor-ollama tray` to Startup manually.



## Windows installer & shortcuts



| Artifact | Purpose |

|----------|---------|

| `cursor-ollama wizard` | Browser setup wizard |

| `bin/Cursor-Ollama-Wizard.cmd` | Double-click to open wizard |

| `bin/Cursor-Ollama-Tray.cmd` | Double-click to start tray |

| `installer/windows/build.ps1` | Build `Cursor-Ollama-Setup-*.exe` |

| `%LOCALAPPDATA%\cursor-ollama\launchers\` | Generated `.cmd` launchers |

| Desktop / Startup shortcuts | `assets/logo.ico` (from `logo.png`) |



## Running the tunnel



**Named tunnel:** `cursor-ollama setup` writes `~/.cloudflared/<tunnel-name>-tunnel.yml` pointing to **proxy `:11435`**, not Ollama directly.



**Quick tunnel:** no YAML or DNS — `cloudflared tunnel --url http://127.0.0.1:11435` (started by tray / stack / wizard install).



**Production (admin / services):**



```bash

cursor-ollama setup

cursor-ollama proxy install

cursor-ollama tunnel install

```



**Development / no admin:**



```bash

cursor-ollama tray

# or two terminals:

cursor-ollama proxy start

cursor-ollama tunnel run

```



**Health endpoints** (no auth required):



```bash

curl http://127.0.0.1:11435/health

curl https://YOUR-TUNNEL-HOST/health

cursor-ollama verify

```



One-time Cloudflare setup (before `setup`):



```bash

cloudflared tunnel login

cloudflared tunnel create cursor-ollama

# if hostname already routed to another tunnel:

cloudflared tunnel route dns -f cursor-ollama YOUR-TUNNEL-HOST

```



## Config locations



| Global install (default) | Local dev (`--local`) |

|--------------------------|------------------------|

| `~/.cursor-ollama/config.json` | `./.env` |

| `~/.cursor-ollama/models.map.json` | `./config/models.map.json` |

| `~/.cursor-ollama/tray.pid` | — |

| `~/.cloudflared/<name>-tunnel.yml` | — |



Example `config.json` fields:



```json

{

  "tunnelHostname": "ollama.example.com",

  "tunnelName": "cursor-ollama",

  "tunnelMode": "named",

  "ollamaPort": 11434,

  "proxyPort": 11435,

  "quickTunnelMetricsPort": 57555,

  "ollamaSourceModel": "qwen2.5-coder:7b",

  "cursorModelName": "gpt-4o-mini",

  "ollamaAuthKey": "...",

  "secureTunnel": true,

  "skipModelPull": false

}

```



## Cursor configuration



1. **Cursor Settings → Models**

2. Enable **Override OpenAI Base URL**

3. Base URL: `https://YOUR-TUNNEL-HOST/v1`

4. OpenAI API Key: your `ollamaAuthKey` from config

5. **Add model:** your `cursorModelName` (e.g. `gpt-4o-mini`)

6. Disable built-in model with the same name if present



Run `cursor-ollama cursor-config` anytime to print the block.



## Architecture



```

Cursor cloud → https://TUNNEL/v1 → cloudflared → proxy :11435 → Ollama :11434

```



The proxy rewrites Cursor-allowlisted model names (including dated variants like `gpt-4-turbo-2024-04-09` and `gpt-4o`) and validates Bearer auth before forwarding.



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

node bin/cursor-ollama.mjs wizard --no-browser

npm pack --dry-run

```



Legacy shell wrappers (`scripts/setup.sh`, etc.) delegate to the CLI.



## Troubleshooting



| Error | Fix |

|-------|-----|

| `AI Model Not Found` | Use allowlisted name (`gpt-4o-mini`); check `models.map.json`. Proxy also accepts dated variants (`gpt-4-turbo-2024-04-09`). |

| GPU idle but tray shows on | Restart tray after proxy update; Cursor may send variant model names — ensure latest `cursor-ollama` |

| Quick tunnel URL expired | Tray → **Refresh quick tunnel** or Settings → Refresh link; paste new Base URL in Cursor |

| Changed Ollama/proxy port | Save in **Settings…** or edit `config.json`; tray → Stop all → Start all |

| `401 Unauthorized` | API key in Cursor must match `ollamaAuthKey` |

| Proxy not running | `cursor-ollama proxy start` or `cursor-ollama tray` → Start all |

| Windows `Access is denied` on install | Use `cursor-ollama tray` or `proxy start` + `tunnel run`; or run PowerShell as Administrator for services |

| `spawn cloudflared ENOENT` (Windows) | Fixed in latest CLI — update package; cloudflared must be in PATH |

| Cloudflare `Error 1033` | Tunnel disconnected — run `cursor-ollama tunnel run` or tray → Start tunnel; check `tunnel status` |

| Cloudflare `403 Forbidden` on `/health` | Cloudflare Access / WAF blocking — disable policy for tunnel hostname in dashboard |

| Tunnel `/health` fails but local OK | DNS may point to wrong tunnel — `cloudflared tunnel route dns -f <name> <host>` |

| Built-in models broken | Toggle Override Base URL off when using Cursor-native models |



## Documentation



| File | Purpose |

|------|---------|

| [`README.md`](README.md) | This file — full CLI reference |

| [`docs/index.html`](docs/index.html) | Landing page (EN + FA, Vazirmatn) |

| [`docs/logo.svg`](docs/logo.svg) | Landing nav logo (synced from `assets/logo.svg`) |
| [`docs/logo.png`](docs/logo.png) | Landing favicon (32×32, from `assets/logo.png`) |
| [`docs/i18n.js`](docs/i18n.js) | Landing page translations |

| [`docs/README.md`](docs/README.md) | GitHub Pages & SEO notes |

| [`docs/seo.json`](docs/seo.json) | Central SEO config |

| [`installer/wizard/`](installer/wizard/) | Setup wizard UI source |



## License



MIT


