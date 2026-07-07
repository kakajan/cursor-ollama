# cursor-ollama

![CI](https://github.com/kakajan/cursor-ollama/actions/workflows/ci.yml/badge.svg)

cursor-ollama is a free, open-source CLI that connects local [Ollama](https://ollama.com) models to [Cursor IDE](https://cursor.com) through a secure Cloudflare Tunnel and a small OpenAI-compatible proxy.

I built it because I wanted local models in Cursor without repeating the same fragile tunnel setup every time. The goal is simple: install it, run a friendly wizard, paste a few values into Cursor, and get back to building.

- **Landing page:** [kakajan.github.io/cursor-ollama](https://kakajan.github.io/cursor-ollama)
- **Package:** [npmjs.com/package/cursor-ollama](https://www.npmjs.com/package/cursor-ollama)
- **License:** MIT
- **فارسی:** [راهنمای فارسی](#راهنمای-فارسی)

```bash
npm i -g cursor-ollama
cursor-ollama wizard
```

## What It Does

Cursor can use OpenAI-compatible endpoints, but some Cursor flows cannot simply reach `localhost` on your machine. cursor-ollama gives Cursor a public HTTPS `/v1` endpoint, protects it with Bearer auth, and forwards requests to your local Ollama server.

```text
Cursor -> Cloudflare Tunnel -> cursor-ollama proxy -> Ollama
```

It handles the boring parts for you:

- Secure proxy with Bearer token validation
- Cursor-friendly model aliases mapped to real Ollama models
- Cloudflare named tunnel or temporary trycloudflare quick tunnel
- Windows browser wizard for first-time setup
- System tray for start/stop, settings, quick URL refresh, and copy-paste config
- Health checks before you paste settings into Cursor
- Clean uninstall path for shortcuts, tray files, and services

## Requirements

| Tool | Why You Need It |
|------|------------------|
| [Node.js 18+](https://nodejs.org) | Runs the CLI, wizard, proxy, and tray |
| [Ollama](https://ollama.com/download) | Runs your local models |
| [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | Creates the HTTPS tunnel Cursor can reach |
| Cloudflare domain | Optional. Use quick mode if you do not have one |

## Quick Start

### Windows Wizard

```powershell
npm install -g cursor-ollama
cursor-ollama wizard
```

The wizard walks you through:

1. Checking Node.js, Ollama, and cloudflared
2. Choosing a tunnel mode: your Cloudflare domain or a temporary trycloudflare URL
3. Setting Ollama and proxy ports
4. Choosing the real Ollama model and the model alias Cursor should see
5. Creating shortcuts, optional Windows startup, and launching the tray
6. Showing the Cursor settings block you can copy

After clone/install, these launchers are also available:

```cmd
bin\Cursor-Ollama-Wizard.cmd
bin\Cursor-Ollama-Tray.cmd
```

### CLI Path, All Platforms

```bash
npm install -g cursor-ollama

cursor-ollama doctor
cursor-ollama init

# named tunnel only
cloudflared tunnel login
cloudflared tunnel create cursor-ollama

cursor-ollama setup
cursor-ollama tray
cursor-ollama cursor-config
cursor-ollama verify
```

If you do not have a Cloudflare domain, choose quick mode. It gives you a temporary URL like:

```text
https://random.trycloudflare.com/v1
```

Quick URLs can change. When you refresh the link, update the Base URL in Cursor too.

## Connect Cursor

After `cursor-ollama verify` passes:

1. Open `Cursor Settings -> Models`.
2. Enable `Override OpenAI Base URL` in the OpenAI-compatible/BYOK section.
3. Paste your tunnel URL as the Base URL. It must end with `/v1`.
4. Use the generated Bearer key as the API key.
5. Add the model alias you selected, for example `gpt-4-turbo` or `gpt-4o-mini`.

You can print the exact values anytime:

```bash
cursor-ollama cursor-config
```

Example:

```text
Base URL: https://YOUR-TUNNEL-HOST/v1
API Key:  from cursor-ollama cursor-config
Model:    gpt-4-turbo
```

The model name is only an alias Cursor accepts. The proxy rewrites it to the real Ollama model you configured.

## Daily Use

Most days, start the tray and use its menu:

```bash
cursor-ollama tray
```

From the tray you can:

- Start or stop proxy and tunnel
- Copy the Cursor Base URL
- Refresh a quick tunnel URL
- Open Settings
- Open the config file
- Show Cursor config
- Uninstall cleanly

If you prefer terminal commands:

```bash
cursor-ollama stack start
cursor-ollama stack status
cursor-ollama stack stop
```

## Commands

| Command | What It Does |
|---------|--------------|
| `cursor-ollama wizard` | Opens the browser setup wizard |
| `cursor-ollama init` | Interactive terminal setup |
| `cursor-ollama doctor` | Checks required tools |
| `cursor-ollama setup` | Writes config, model mapping, proxy, and tunnel setup |
| `cursor-ollama verify` | Tests Ollama, proxy, and tunnel health |
| `cursor-ollama cursor-config` | Prints the Cursor settings block |
| `cursor-ollama tray` | Starts the tray in the background |
| `cursor-ollama settings` | Opens settings for ports, tunnel mode, and quick URLs |
| `cursor-ollama proxy start` | Runs the proxy in the foreground |
| `cursor-ollama proxy install` | Installs the proxy service |
| `cursor-ollama tunnel run` | Runs cloudflared in the foreground |
| `cursor-ollama tunnel install` | Installs the tunnel service |
| `cursor-ollama stack start` | Starts proxy and tunnel together |
| `cursor-ollama uninstall` | Removes tray, shortcuts, and services |

Useful flags:

```bash
cursor-ollama setup --skip-pull
cursor-ollama setup --skip-tunnel
cursor-ollama wizard --port 17435
cursor-ollama settings --config
cursor-ollama uninstall --keep-config
```

## Tunnel Modes

### Named Tunnel

Use this when you own a domain on Cloudflare DNS:

```text
https://ollama.example.com/v1
```

cursor-ollama writes the tunnel config so traffic goes to the local proxy on `127.0.0.1:11435`, not directly to Ollama.

### Quick Tunnel

Use this when you want to try the project without a domain:

```text
https://random.trycloudflare.com/v1
```

It is fast and friendly for testing, but the URL is temporary. Copy or refresh it from the tray or Settings page.

## Configuration

Default config files:

| File | Purpose |
|------|---------|
| `~/.cursor-ollama/config.json` | Main settings |
| `~/.cursor-ollama/models.map.json` | Cursor aliases mapped to Ollama models |
| `~/.cursor-ollama/tray.pid` | Prevents duplicate tray instances |
| `~/.cloudflared/<name>-tunnel.yml` | Named tunnel config |

Example:

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

## Troubleshooting

| Problem | What To Try |
|---------|-------------|
| `AI Model Not Found` | Make sure Cursor uses the same alias stored in `models.map.json`. |
| `401 Unauthorized` | The Cursor API key must match `ollamaAuthKey`. |
| Tunnel is off | Start proxy first, then tunnel. Run `cursor-ollama stack start` and `cursor-ollama verify`. |
| Quick tunnel expired | Refresh the link from tray or Settings and update Cursor Base URL. |
| Port changed | Save settings, then stop and start the stack. |
| Cloudflare `Error 1033` | The tunnel is disconnected or DNS points to the wrong tunnel. |
| Built-in Cursor models stop working | Turn off Override Base URL when you want to use Cursor-native models. |

## Privacy Note

cursor-ollama routes model requests to your local Ollama through your tunnel, so those routed requests do not bill OpenAI tokens. Still, Cursor is an IDE with its own cloud features. Before sending sensitive code, review Cursor's current privacy settings and your own security requirements.

## Development

```bash
git clone git@github.com:kakajan/cursor-ollama.git
cd cursor-ollama
npm install

node bin/cursor-ollama.mjs wizard
node bin/cursor-ollama.mjs verify --mock
npm test
npm pack --dry-run
```

Build the Windows installer:

```powershell
npm run build:win
# or
powershell -ExecutionPolicy Bypass -File installer/windows/build.ps1
```

## Support And Contribute

This project is built with care and released openly so other developers can use it, learn from it, and make it better.

If cursor-ollama saves you time:

- Star the repository so more people can find it.
- Open an issue when something breaks, and include logs, OS, and the command you ran.
- Send a pull request for bugs, docs, translations, tests, or UX polish.
- Share it with someone trying to use local models in Cursor.

I want this tool to stay simple: do the job, explain itself, and help when something goes wrong. Every thoughtful contribution helps.

## Documentation Map

| File | Purpose |
|------|---------|
| [`docs/index.html`](docs/index.html) | Bilingual landing page shell |
| [`docs/i18n.js`](docs/i18n.js) | English and Persian landing copy |
| [`docs/seo.json`](docs/seo.json) | SEO and social preview metadata |
| [`docs/README.md`](docs/README.md) | Landing and SEO maintenance guide |
| [`installer/wizard/`](installer/wizard/) | Wizard UI source |
| [`assets/`](assets/) | Logos and icons |

## راهنمای فارسی

cursor-ollama یک ابزار رایگان و متن‌باز است برای وصل کردن مدل‌های محلی Ollama به Cursor. ایده‌اش ساده است: یک آدرس HTTPS امن می‌سازد، درخواست‌های Cursor را با یک پروکسی کوچک و Bearer auth می‌گیرد، نام مدل را به مدل واقعی Ollama تبدیل می‌کند و همه چیز را به سیستم خودتان می‌رساند.

من این ابزار را چون خودم به آن نیاز داشتم ساختم؛ با این هدف که راه‌اندازی Ollama در Cursor از یک کار شکننده و تکراری به یک مسیر ساده و قابل اعتماد تبدیل شود.

### شروع سریع

در ویندوز راحت‌ترین مسیر ویزارد است:

```powershell
npm install -g cursor-ollama
cursor-ollama wizard
```

ویزارد پیش‌نیازها را بررسی می‌کند، نوع تونل را می‌پرسد، مدل Ollama و نام قابل قبول برای Cursor را می‌گیرد، shortcut و tray می‌سازد و در پایان تنظیمات آماده Cursor را نشان می‌دهد.

اگر با ترمینال راحت‌ترید:

```bash
cursor-ollama doctor
cursor-ollama init
cursor-ollama setup
cursor-ollama tray
cursor-ollama verify
cursor-ollama cursor-config
```

### بدون دامنه Cloudflare

اگر دامنه ندارید، حالت quick را انتخاب کنید. یک لینک موقت مثل این می‌گیرید:

```text
https://random.trycloudflare.com/v1
```

این لینک دائمی نیست. هر وقت refresh شد، باید Base URL جدید را در Cursor وارد کنید.

### اتصال به Cursor

بعد از اینکه `cursor-ollama verify` موفق شد:

1. به `Cursor Settings -> Models` بروید.
2. گزینه `Override OpenAI Base URL` را فعال کنید.
3. آدرس تونل را با `/v1` وارد کنید.
4. کلید Bearer را از `cursor-ollama cursor-config` بردارید.
5. نام alias مدل را اضافه کنید، مثلاً `gpt-4-turbo`.

### استفاده روزمره

```bash
cursor-ollama tray
```

از tray می‌توانید stack را روشن و خاموش کنید، URL را کپی کنید، لینک quick را refresh کنید، Settings را باز کنید و config را ببینید.

### حریم خصوصی

درخواست مدل از مسیر تونل شما به Ollama محلی می‌رسد و برای این درخواست‌ها توکن OpenAI مصرف نمی‌شود. با این حال Cursor همچنان یک IDE با قابلیت‌های ابری است. قبل از ارسال کد حساس، تنظیمات حریم خصوصی Cursor و نیازهای امنیتی خودتان را بررسی کنید.

### حمایت و مشارکت

اگر این ابزار به کارتان آمد، با یک star در GitHub، گزارش باگ، اصلاح مستندات، pull request یا معرفی پروژه به یک برنامه‌نویس دیگر کمک بزرگی می‌کنید. ابزارهای متن‌باز با همین مشارکت‌های کوچک زنده می‌مانند.

## License

MIT
