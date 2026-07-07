# cursor-ollama

![CI](https://github.com/kakajan/cursor-ollama/actions/workflows/ci.yml/badge.svg)

cursor-ollama یک ابزار آزاد و متن‌باز است برای وقتی که می‌خواهید مدل‌های محلی [Ollama](https://ollama.com) را داخل [Cursor IDE](https://cursor.com) استفاده کنید، بدون درگیری با تنظیمات تونل، نام مدل‌ها و پروکسی.

من این پروژه را چون خودم به آن نیاز داشتم ساختم: یک مسیر ساده، قابل فهم و قابل تکرار برای وصل کردن Cursor به Ollama. اگر فقط می‌خواهید سریع راه بیفتید، ویزارد ویندوز کار را قدم‌به‌قدم جلو می‌برد. اگر اهل ترمینال هستید، همه چیز با CLI هم در دسترس است.

**Landing page:** [kakajan.github.io/cursor-ollama](https://kakajan.github.io/cursor-ollama)
**Package:** [npmjs.com/package/cursor-ollama](https://www.npmjs.com/package/cursor-ollama)
**License:** MIT

```bash
npm i -g cursor-ollama
cursor-ollama wizard
```

## What It Does

Cursor برای بعضی قابلیت‌ها از بک‌اند ابری خودش استفاده می‌کند و مستقیم به `localhost` شما دسترسی ندارد. cursor-ollama یک آدرس HTTPS قابل استفاده در Cursor می‌سازد و درخواست‌ها را با احراز هویت به Ollama محلی شما می‌رساند.

مسیر کلی این است:

```text
Cursor -> Cloudflare Tunnel -> cursor-ollama proxy -> Ollama
```

چند کار مهم را هم خودش انجام می‌دهد:

- ساخت پروکسی امن با Bearer token
- بازنویسی نام مدل‌ها تا Cursor نام مدل را قبول کند
- پشتیبانی از Cloudflare Tunnel با دامنه شخصی یا لینک موقت trycloudflare
- ویزارد گرافیکی برای ویندوز
- tray برای start/stop، کپی لینک، تنظیمات و refresh لینک موقت
- health check و دستور verify برای پیدا کردن مشکل قبل از رفتن سراغ Cursor

## Requirements

قبل از شروع این‌ها را لازم دارید:

| Tool | Why |
|------|-----|
| [Node.js 18+](https://nodejs.org) | اجرای CLI، wizard، proxy و tray |
| [Ollama](https://ollama.com/download) | اجرای مدل‌های محلی روی سیستم شما |
| [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) | ساخت تونل HTTPS برای Cursor |
| Cloudflare domain | اختیاری است؛ اگر دامنه ندارید از حالت quick و لینک موقت trycloudflare استفاده کنید |

## Quick Start

### Windows, The Friendly Way

```powershell
npm install -g cursor-ollama
cursor-ollama wizard
```

ویزارد مرورگر را باز می‌کند و آرام جلو می‌رود:

1. چک می‌کند Node، Ollama و cloudflared نصب باشند.
2. می‌پرسد دامنه Cloudflare دارید یا لینک موقت می‌خواهید.
3. پورت‌های Ollama و proxy را تنظیم می‌کند.
4. مدل واقعی Ollama و نامی که Cursor باید ببیند را می‌گیرد.
5. shortcut، اجرای خودکار ویندوز و tray را تنظیم می‌کند.
6. در پایان یک block آماده برای Cursor Settings می‌دهد.

اگر پروژه را clone کرده‌اید، این فایل‌ها هم برای اجرای سریع وجود دارند:

```cmd
bin\Cursor-Ollama-Wizard.cmd
bin\Cursor-Ollama-Tray.cmd
```

### CLI, All Platforms

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

اگر دامنه Cloudflare ندارید، در init یا wizard حالت quick را انتخاب کنید. در این حالت یک لینک موقت شبیه `https://something.trycloudflare.com/v1` می‌گیرید. هر وقت لینک را refresh کردید باید Base URL را در Cursor هم به‌روز کنید.

## Connect Cursor

بعد از اینکه `cursor-ollama verify` موفق شد:

1. در Cursor بروید به `Settings -> Models`.
2. بخش OpenAI-compatible یا BYOK را باز کنید.
3. `Override OpenAI Base URL` را فعال کنید.
4. Base URL را بگذارید روی آدرس تونل، مثلا:

```text
https://YOUR-TUNNEL-HOST/v1
```

5. API Key همان `ollamaAuthKey` داخل config است. دستور زیر آن را آماده چاپ می‌کند:

```bash
cursor-ollama cursor-config
```

6. نام مدلی را که انتخاب کرده‌اید اضافه کنید؛ مثلا `gpt-4-turbo` یا `gpt-4o-mini`. این فقط alias است و داخل سیستم شما به مدل واقعی Ollama map می‌شود.

## Daily Use

برای استفاده روزمره معمولاً همین کافی است:

```bash
cursor-ollama tray
```

از tray می‌توانید:

- proxy و tunnel را start/stop کنید.
- Base URL را برای Cursor کپی کنید.
- لینک quick tunnel را refresh کنید.
- پورت‌ها و حالت tunnel را از Settings تغییر دهید.
- فایل config را باز کنید.
- وضعیت stack را ببینید.
- uninstall تمیز انجام دهید.

اگر tray نمی‌خواهید:

```bash
cursor-ollama stack start
cursor-ollama stack status
cursor-ollama stack stop
```

## Commands

| Command | Use |
|---------|-----|
| `cursor-ollama wizard` | ویزارد گرافیکی، مخصوصاً راحت برای ویندوز |
| `cursor-ollama init` | راه‌اندازی تعاملی در ترمینال |
| `cursor-ollama doctor` | بررسی نصب بودن پیش‌نیازها |
| `cursor-ollama setup` | ساخت config، tunnel، proxy و mapping مدل |
| `cursor-ollama verify` | تست سلامت Ollama، proxy و tunnel |
| `cursor-ollama cursor-config` | چاپ تنظیمات آماده برای Cursor |
| `cursor-ollama tray` | اجرای tray در پس‌زمینه |
| `cursor-ollama settings` | صفحه تنظیمات پورت، tunnel و لینک quick |
| `cursor-ollama proxy start` | اجرای proxy در foreground |
| `cursor-ollama proxy install` | نصب proxy به عنوان service |
| `cursor-ollama tunnel run` | اجرای tunnel در foreground |
| `cursor-ollama tunnel install` | نصب cloudflared به عنوان service |
| `cursor-ollama stack start` | روشن کردن proxy و tunnel با هم |
| `cursor-ollama uninstall` | حذف tray، shortcut و serviceها |

فلگ‌های کاربردی:

```bash
cursor-ollama setup --skip-pull
cursor-ollama setup --skip-tunnel
cursor-ollama wizard --port 17435
cursor-ollama settings --config
cursor-ollama uninstall --keep-config
```

## Tunnel Modes

### Named Tunnel

اگر دامنه‌ای روی Cloudflare DNS دارید، این حالت تمیزتر و پایدارتر است:

```text
https://ollama.example.com/v1
```

cursor-ollama فایل tunnel را طوری می‌نویسد که ترافیک به proxy روی `127.0.0.1:11435` برسد، نه مستقیم به Ollama.

### Quick Tunnel

اگر فقط می‌خواهید سریع تست کنید یا هنوز دامنه ندارید، quick mode را انتخاب کنید. cloudflared یک لینک موقت می‌سازد:

```text
https://random.trycloudflare.com/v1
```

این لینک دائمی نیست. اگر refresh شد یا از کار افتاد، از tray یا Settings لینک جدید را کپی کنید و در Cursor جایگزین کنید.

## Configuration

در نصب معمولی فایل‌ها اینجا ذخیره می‌شوند:

| File | Purpose |
|------|---------|
| `~/.cursor-ollama/config.json` | تنظیمات اصلی |
| `~/.cursor-ollama/models.map.json` | map نام Cursor به مدل واقعی Ollama |
| `~/.cursor-ollama/tray.pid` | جلوگیری از اجرای چند tray همزمان |
| `~/.cloudflared/<name>-tunnel.yml` | config تونل named |

نمونه config:

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

| Problem | Try This |
|---------|----------|
| Cursor says `AI Model Not Found` | نام مدل را در `models.map.json` و Cursor یکی کنید. aliasهای رایج مثل `gpt-4o` و dated variants هم rewrite می‌شوند. |
| `401 Unauthorized` | کلید داخل Cursor باید با `ollamaAuthKey` یکی باشد. |
| Tunnel is off | اول proxy را روشن کنید، بعد tunnel را. `cursor-ollama stack start` و سپس `cursor-ollama verify` را بزنید. |
| Quick tunnel expired | از tray یا Settings لینک را refresh کنید و Base URL جدید را در Cursor بگذارید. |
| Port changed | از Settings ذخیره کنید، بعد `Stop all` و `Start all`. |
| Cloudflare `Error 1033` | tunnel وصل نیست یا DNS به tunnel اشتباه اشاره می‌کند. |
| Built-in Cursor models broken | وقتی می‌خواهید از مدل‌های خود Cursor استفاده کنید، Override Base URL را خاموش کنید. |

## Privacy Note

cursor-ollama باعث می‌شود درخواست مدل به Ollama محلی شما برسد و هزینه OpenAI ندهید، اما Cursor همچنان ممکن است برای تجربه IDE از سرویس‌های خودش استفاده کند. اگر دنبال حریم خصوصی کامل هستید، قبل از ارسال کد حساس، رفتار نسخه فعلی Cursor و تنظیمات حریم خصوصی‌تان را بررسی کنید.

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

Build installer for Windows:

```powershell
npm run build:win
# or
powershell -ExecutionPolicy Bypass -File installer/windows/build.ps1
```

## Support And Contribute

این پروژه با علاقه ساخته شده و آزاد منتشر شده تا هر کسی بتواند از آن استفاده کند، یاد بگیرد، تغییرش دهد و بهترش کند.

اگر cursor-ollama به کارتان آمد:

- در GitHub ستاره بدهید تا پروژه راحت‌تر دیده شود.
- اگر باگی دیدید، issue باز کنید و تا جای ممکن log و سیستم‌عامل را بنویسید.
- اگر ایده یا بهبود دارید، pull request بفرستید.
- اگر مستندات جایی نامفهوم بود، همان هم یک contribution ارزشمند است.
- پروژه را به کسی که با Cursor و Ollama کار می‌کند معرفی کنید.

من دوست دارم این ابزار ساده بماند: کاری که قول می‌دهد را انجام دهد، بی‌دردسر نصب شود، و اگر مشکلی پیش آمد با پیام و راهنمای روشن کمک کند. مشارکت شما دقیقاً به همین بهتر شدن کمک می‌کند.

## Documentation Map

| File | Purpose |
|------|---------|
| [`docs/index.html`](docs/index.html) | landing page دو زبانه |
| [`docs/i18n.js`](docs/i18n.js) | متن‌های انگلیسی و فارسی landing |
| [`docs/seo.json`](docs/seo.json) | تنظیمات SEO و social preview |
| [`docs/README.md`](docs/README.md) | راهنمای نگهداری landing و GitHub Pages |
| [`installer/wizard/`](installer/wizard/) | سورس UI ویزارد |
| [`assets/`](assets/) | لوگو و آیکن‌ها |

## License

MIT
