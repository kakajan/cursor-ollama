window.LANDING_I18N = {
  en: {
    'nav.why': 'Why',
    'nav.guide': 'Wizard guide',
    'nav.settings': 'Settings & tray',
    'nav.cursor': 'Cursor setup',
    'nav.faq': 'FAQ',
    'nav.github': 'GitHub',
    'badge.wizard': 'Windows wizard',
    'badge.tunnel': 'Cloudflare Tunnel',
    'badge.quick': 'trycloudflare option',
    'badge.secure': 'Bearer auth',
    'badge.mit': 'MIT',
    'hero.eyebrow': 'Free · Open source · 5-minute setup',
    'hero.title': 'The easiest way to connect Ollama to Cursor',
    'hero.sub':
      'Run local models in Cursor IDE without OpenAI bills. cursor-ollama sets up a secure HTTPS tunnel, rewrites model names Cursor accepts, and gives you a tray app to start everything in one click.',
    'hero.cta.guide': 'Start the wizard guide',
    'hero.cta.npm': 'Install from npm',
    'hero.trust.1': 'No OpenAI API calls',
    'hero.trust.2': 'Works with BYOK',
    'hero.trust.3': 'English + Persian UI',
    'term.comment1': '# Fastest path (Windows)',
    'term.comment2': '# Cursor → Settings → Models',
    'term.out1': 'Base URL: https://your-host.example.com/v1',
    'term.out2': 'Model: gpt-4-turbo → Ollama: your-model',
    'term.out3': 'Quick mode: https://….trycloudflare.com/v1',
    'why.title': 'Why developers choose cursor-ollama',
    'why.lead':
      'Cursor runs in the cloud and cannot reach localhost. We solve routing, naming, and security in one package.',
    'why.without.title': 'Without cursor-ollama',
    'why.without.body':
      'Manual tunnel config, exposed Ollama, model names Cursor rejects, and fragile copy-paste setup that breaks after every update.',
    'why.with.title': 'With cursor-ollama',
    'why.with.body':
      'Guided wizard, authenticated proxy, allowlisted model aliases, health checks, tray controls, and a complete uninstall path.',
    'feat.1.title': '5-minute wizard',
    'feat.1.body':
      'Graphical setup on Windows checks prerequisites, writes config, creates shortcuts, and launches tray.',
    'feat.2.title': 'Secure by default',
    'feat.2.body':
      'Strategy C proxy validates Bearer tokens. cloudflared never exposes raw Ollama to the internet.',
    'feat.3.title': 'Model name rewrite',
    'feat.3.body':
      'Pick a Cursor-friendly name like gpt-4-turbo while Ollama runs qwen, gemma, or any local model.',
    'feat.4.title': 'Tray + Settings',
    'feat.4.body':
      'Start/stop stack, copy tunnel URL, refresh trycloudflare links, change ports, and open config from the tray menu.',
    'feat.5.title': 'Built-in verify',
    'feat.5.body':
      'Health endpoints on proxy and tunnel plus cursor-ollama verify before you paste into Cursor.',
    'feat.6.title': 'Clean uninstall',
    'feat.6.body': 'Remove tray, shortcuts, and services with cursor-ollama uninstall or the Windows installer.',
    'how.title': 'How your code reaches local Ollama',
    'how.lead': 'One HTTPS URL in Cursor. Everything else stays on your machine.',
    'how.n1.title': 'Cursor IDE',
    'how.n1.sub': 'cloud backend',
    'how.n2.title': 'Cloudflare Tunnel',
    'how.n2.sub': 'HTTPS + DNS',
    'how.n3.title': 'Auth proxy',
    'how.n3.sub': ':11435',
    'how.n4.title': 'Ollama',
    'how.n4.sub': ':11434',
    'guide.title': 'Complete wizard guide — step by step',
    'guide.lead':
      'Follow every screen in cursor-ollama wizard. Estimated time: 5–15 minutes (named mode) or faster with a temporary trycloudflare link.',
    'guide.tab.wizard': 'Windows wizard',
    'guide.tab.cli': 'CLI path (all OS)',
    'guide.w0.title': 'Welcome',
    'guide.w0.body':
      'Install globally: npm i -g cursor-ollama then run cursor-ollama wizard. Toggle فارسی in the top-right if you prefer Persian.',
    'guide.w1.title': 'Prerequisites',
    'guide.w1.body':
      'Wizard checks Node.js, Ollama, and cloudflared. Install anything marked MISSING before continuing.',
    'guide.w1.l1': 'Node 18+ from nodejs.org',
    'guide.w1.l2': 'Ollama from ollama.com — run ollama serve',
    'guide.w1.l3': 'cloudflared from Cloudflare downloads',
    'guide.w2.title': 'Cloudflare Tunnel',
    'guide.w2.body':
      'Choose your tunnel mode: **Cloudflare domain** (your hostname + tunnel name) or **temporary trycloudflare link** (no domain, no DNS setup).',
    'guide.w2.ports': 'Set Ollama port (default 11434) and proxy port (default 11435) if yours differ.',
    'guide.w2.named': 'Named mode: enter hostname, click Check tunnel, then continue. DNS is routed during install.',
    'guide.w2.quick':
      'Quick mode: wizard starts proxy + trycloudflare automatically and shows your public URL. Refresh or copy it later from tray → Settings.',
    'guide.w3.title': 'Models',
    'guide.w3.body':
      'Choose your local Ollama model and the name Cursor should see (allowlisted alias). Example: gpt-4-turbo → qwen3.6:35b-a3b.',
    'guide.w3.skip': 'Enable Skip pull if the model is already installed locally.',
    'guide.w4.title': 'Windows options',
    'guide.w4.l1': 'Desktop shortcut — quick access to tray',
    'guide.w4.l2': 'Start with Windows — auto-launch tray at login',
    'guide.w4.l3': 'Launch tray after install — recommended',
    'guide.w5.title': 'Install & finish',
    'guide.w5.body':
      'Wizard saves config.json, models.map.json, tunnel YAML (named mode) or quick tunnel URL, creates shortcuts, and shows a Cursor settings block to copy.',
    'guide.w5.close':
      'Click Close wizard when done. You can close the browser tab — the server stops automatically.',
    'guide.c1.title': 'Install & doctor',
    'guide.c2.title': 'Interactive init',
    'guide.c3.title': 'Run stack',
    'guide.c4.title': 'Daily use',
    'settings.title': 'Settings page & tray',
    'settings.lead':
      'After install, manage ports, tunnel mode, and public URLs without editing JSON by hand.',
    'settings.s1.title': 'Open Settings',
    'settings.s1.body':
      'Tray → Settings… or run cursor-ollama settings. Change Ollama/proxy ports, switch named vs quick mode, copy Base URL.',
    'settings.s2.title': 'Copy tunnel URL',
    'settings.s2.body':
      'Tray → Copy tunnel URL copies https://YOUR-HOST/v1 for Cursor. In quick mode, Settings also offers Copy public link.',
    'settings.s3.title': 'Refresh quick tunnel',
    'settings.s3.body':
      'Tray → Refresh quick tunnel (quick mode only) or Settings → Refresh link. Paste the new Base URL into Cursor — the old link stops working.',
    'settings.s4.title': 'Advanced: config file',
    'settings.s4.body':
      'Tray → Open config file edits ~/.cursor-ollama/config.json. After port changes, tray → Stop all → Start all.',
    'cursor.title': 'Connect Cursor IDE in 60 seconds',
    'cursor.lead':
      'After verify passes, paste these values into Cursor Settings → Models (BYOK / OpenAI-compatible).',
    'cursor.s1.title': '1. Open Cursor settings',
    'cursor.s1.body':
      'Cursor → Settings → Models → OpenAI API key section. Enable Override OpenAI Base URL.',
    'cursor.s2.title': '2. Paste your tunnel URL',
    'cursor.s2.body':
      'Base URL must end with /v1. Use the Bearer key from cursor-ollama cursor-config or config.json.',
    'cursor.s3.title': '3. Test in chat',
    'cursor.s3.body':
      'Open a new chat, select your mapped model, and send a message. Traffic stays on your hardware — no OpenAI billing.',
    'cursor.s4.title': '4. Keep stack running',
    'cursor.s4.body':
      'Use tray → Start all or cursor-ollama stack start. Copy tunnel URL from tray when pasting into Cursor. Quick mode: refresh link if Cursor stops responding.',
    'req.title': 'Before you start — checklist',
    'req.node': 'Runs the CLI, wizard server, proxy, and tray.',
    'req.ollama': 'Local LLM server on port 11434 with at least one pulled model.',
    'req.cloudflared': 'Cloudflare Tunnel connector. Required for both named tunnels and trycloudflare quick links.',
    'req.domain': 'Optional: your own domain on Cloudflare DNS. Skip it — use wizard quick mode for a temporary trycloudflare URL.',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'Is this really free?',
    'faq.a1':
      'Yes. cursor-ollama is MIT licensed. You may pay for your domain, electricity, and hardware — not OpenAI tokens.',
    'faq.q2': 'Does Cursor send data to OpenAI?',
    'faq.a2':
      'With BYOK configured to your tunnel URL, chat goes to your proxy → Ollama. Model names like gpt-4-turbo are aliases only.',
    'faq.q3': 'Tunnel health returns 530 / off in tray',
    'faq.a3':
      'Start proxy first, then tunnel. Run cursor-ollama stack start. Missing credentials are auto-repaired; restart tray after updating.',
    'faq.q4': 'How do I uninstall?',
    'faq.a4':
      'Run cursor-ollama uninstall or use Windows Add/Remove Programs. Use --keep-config to preserve settings.',
    'faq.q5': 'Can I use macOS or Linux?',
    'faq.a5':
      'Yes via CLI path. The graphical wizard and tray shortcuts are optimized for Windows; stack commands work everywhere.',
    'faq.q6': 'No Cloudflare domain?',
    'faq.a6':
      'In the wizard choose “No — temporary trycloudflare link”. No DNS or tunnel create needed. Copy/refresh the URL from tray or Settings.',
    'faq.q7': 'Cursor model name variants (gpt-4o, dated names)?',
    'faq.a7':
      'The proxy rewrites exact names, dated variants (gpt-4-turbo-2024-04-09), and falls back to your active mapping so requests reach Ollama.',
    'cta.title': 'Ready for local AI coding in Cursor?',
    'cta.body':
      'Install once, run the wizard, paste three fields into Cursor, and code with your own models tonight.',
    'cta.npm': 'Get cursor-ollama on npm',
    'cta.github': 'Star on GitHub',
    'footer.github': 'GitHub',
    'footer.npm': 'npm',
    'footer.company': 'AYTRONIC CO',
    'footer.license': 'MIT License',
    'footer.tag': 'Built for developers who want local LLMs in Cursor — without the setup headache.',
  },
  fa: {
    'nav.why': 'چرا',
    'nav.guide': 'راهنمای ویزارد',
    'nav.settings': 'Settings و tray',
    'nav.cursor': 'تنظیم Cursor',
    'nav.faq': 'سوالات',
    'nav.github': 'گیت‌هاب',
    'badge.wizard': 'ویزارد ویندوز',
    'badge.tunnel': 'Cloudflare Tunnel',
    'badge.quick': 'لینک موقت trycloudflare',
    'badge.secure': 'Bearer auth',
    'badge.mit': 'MIT',
    'hero.eyebrow': 'رایگان · متن‌باز · راه‌اندازی ۵ دقیقه‌ای',
    'hero.title': 'ساده‌ترین راه اتصال Ollama به Cursor',
    'hero.sub':
      'مدل‌های محلی را در Cursor بدون هزینه OpenAI اجرا کنید. cursor-ollama تونل HTTPS امن می‌سازد، نام مدل را برای Cursor بازنویسی می‌کند و با tray همه‌چیز را یک‌کلیکی start می‌کند.',
    'hero.cta.guide': 'شروع راهنمای ویزارد',
    'hero.cta.npm': 'نصب از npm',
    'hero.trust.1': 'بدون تماس OpenAI',
    'hero.trust.2': 'سازگار با BYOK',
    'hero.trust.3': 'رابط انگلیسی + فارسی',
    'term.comment1': '# سریع‌ترین مسیر (ویندوز)',
    'term.comment2': '# Cursor → Settings → Models',
    'term.out1': 'Base URL: https://your-host.example.com/v1',
    'term.out2': 'Model: gpt-4-turbo → Ollama: your-model',
    'term.out3': 'حالت موقت: https://….trycloudflare.com/v1',
    'why.title': 'چرا توسعه‌دهندگان cursor-ollama را انتخاب می‌کنند',
    'why.lead':
      'Cursor در cloud اجرا می‌شود و به localhost دسترسی ندارد. ما مسیریابی، نام‌گذاری و امنیت را یک‌جا حل می‌کنیم.',
    'why.without.title': 'بدون cursor-ollama',
    'why.without.body':
      'تنظیم دستی tunnel، Ollama در معرض اینترنت، نام مدل رد شده توسط Cursor و setup شکننده.',
    'why.with.title': 'با cursor-ollama',
    'why.with.body':
      'ویزارد راهنما، پروکسی احراز هویت، alias مدل، health check، tray و uninstall کامل.',
    'feat.1.title': 'ویزارد ۵ دقیقه‌ای',
    'feat.1.body':
      'setup گرافیکی ویندوز پیش‌نیازها را چک می‌کند، config می‌نویسد، shortcut می‌سازد و tray را launch می‌کند.',
    'feat.2.title': 'امن به‌صورت پیش‌فرض',
    'feat.2.body':
      'پروکسی Strategy C توکن Bearer را اعتبارسنجی می‌کند. Ollama خام expose نمی‌شود.',
    'feat.3.title': 'بازنویسی نام مدل',
    'feat.3.body':
      'نام سازگار با Cursor مثل gpt-4-turbo انتخاب کنید در حالی که Ollama مدل واقعی را اجرا می‌کند.',
    'feat.4.title': 'Tray + تنظیمات',
    'feat.4.body':
      'start/stop stack، کپی URL، refresh لینک trycloudflare، تغییر پورت و باز کردن config از منوی tray.',
    'feat.5.title': 'verify داخلی',
    'feat.5.body':
      'endpointهای health روی proxy و tunnel به‌علاوه cursor-ollama verify قبل از paste در Cursor.',
    'feat.6.title': 'uninstall تمیز',
    'feat.6.body':
      'با cursor-ollama uninstall یا Programs and Features tray، shortcut و service را حذف کنید.',
    'how.title': 'مسیر کد شما تا Ollama محلی',
    'how.lead': 'یک URL HTTPS در Cursor. بقیه روی ماشین شما می‌ماند.',
    'how.n1.title': 'Cursor IDE',
    'how.n1.sub': 'backend ابری',
    'how.n2.title': 'Cloudflare Tunnel',
    'how.n2.sub': 'HTTPS + DNS',
    'how.n3.title': 'پروکسی auth',
    'how.n3.sub': ':11435',
    'how.n4.title': 'Ollama',
    'how.n4.sub': ':11434',
    'guide.title': 'راهنمای کامل ویزارد — گام‌به‌گام',
    'guide.lead':
      'هر صفحه ویزارد را دنبال کنید. زمان تقریبی: ۵–۱۵ دقیقه (دامنه اختصاصی) یا سریع‌تر با لینک موقت trycloudflare.',
    'guide.tab.wizard': 'ویزارد ویندوز',
    'guide.tab.cli': 'مسیر CLI (همه OS)',
    'guide.w0.title': 'خوش آمدید',
    'guide.w0.body':
      'نصب سراسری: npm i -g cursor-ollama سپس cursor-ollama wizard. برای فارسی دکمه فارسی بالا را بزنید.',
    'guide.w1.title': 'پیش‌نیازها',
    'guide.w1.body':
      'ویزارد Node، Ollama و cloudflared را چک می‌کند. موارد MISSING را قبل از ادامه نصب کنید.',
    'guide.w1.l1': 'Node 18+ از nodejs.org',
    'guide.w1.l2': 'Ollama از ollama.com — ollama serve',
    'guide.w1.l3': 'cloudflared از دانلود Cloudflare',
    'guide.w2.title': 'Cloudflare Tunnel',
    'guide.w2.body':
      'حالت tunnel را انتخاب کنید: **دامنه Cloudflare** (hostname + نام tunnel) یا **لینک موقت trycloudflare** (بدون دامنه و DNS).',
    'guide.w2.ports': 'در صورت نیاز پورت Ollama (پیش‌فرض 11434) و proxy (11435) را تنظیم کنید.',
    'guide.w2.named': 'حالت دامنه: hostname را وارد کنید، Check tunnel بزنید. DNS در نصب route می‌شود.',
    'guide.w2.quick':
      'حالت موقت: ویزارد proxy + trycloudflare را start می‌کند و URL عمومی را نشان می‌دهد. بعداً از tray یا Settings کپی/refresh کنید.',
    'guide.w3.title': 'مدل‌ها',
    'guide.w3.body':
      'مدل Ollama و نام alias برای Cursor انتخاب کنید. مثال: gpt-4-turbo → qwen3.6:35b-a3b.',
    'guide.w3.skip': 'Skip pull را فعال کنید اگر مدل از قبل نصب است.',
    'guide.w4.title': 'گزینه‌های ویندوز',
    'guide.w4.l1': 'میانبر دسکتاپ — دسترسی سریع به tray',
    'guide.w4.l2': 'Start with Windows — اجرای tray با login',
    'guide.w4.l3': 'Launch tray after install — پیشنهادی',
    'guide.w5.title': 'نصب و پایان',
    'guide.w5.body':
      'ویزارد config.json، models.map.json، YAML tunnel (حالت دامنه) یا URL موقت را می‌سازد، shortcutها را می‌سازد و بلوک Cursor را نشان می‌دهد.',
    'guide.w5.close':
      'بستن ویزارد را بزنید. می‌توانید تب مرورگر را ببندید — سرور خودکار متوقف می‌شود.',
    'guide.c1.title': 'نصب و doctor',
    'guide.c2.title': 'init تعاملی',
    'guide.c3.title': 'اجرای stack',
    'guide.c4.title': 'استفاده روزانه',
    'settings.title': 'صفحه Settings و tray',
    'settings.lead':
      'بعد از نصب، پورت‌ها، حالت tunnel و URL عمومی را بدون ویرایش دستی JSON مدیریت کنید.',
    'settings.s1.title': 'باز کردن Settings',
    'settings.s1.body':
      'tray → Settings… یا cursor-ollama settings. پورت‌ها، حالت named/quick و کپی Base URL.',
    'settings.s2.title': 'کپی URL تونل',
    'settings.s2.body':
      'tray → Copy tunnel URL مقدار https://HOST/v1 را برای Cursor کپی می‌کند. در حالت موقت، Copy public link هم هست.',
    'settings.s3.title': 'به‌روزرسانی لینک موقت',
    'settings.s3.body':
      'tray → Refresh quick tunnel (فقط حالت موقت) یا Settings → Refresh link. Base URL جدید را در Cursor paste کنید.',
    'settings.s4.title': 'پیشرفته: فایل config',
    'settings.s4.body':
      'tray → Open config file فایل ~/.cursor-ollama/config.json را باز می‌کند. بعد از تغییر پورت: Stop all → Start all.',
    'cursor.title': 'اتصال Cursor در ۶۰ ثانیه',
    'cursor.lead':
      'بعد از pass شدن verify، این مقادیر را در Cursor Settings → Models (BYOK) paste کنید.',
    'cursor.s1.title': '۱. تنظیمات Cursor',
    'cursor.s1.body':
      'Cursor → Settings → Models → OpenAI API key. Override OpenAI Base URL را فعال کنید.',
    'cursor.s2.title': '۲. URL تونل',
    'cursor.s2.body':
      'Base URL باید با /v1 تمام شود. کلید Bearer از cursor-ollama cursor-config.',
    'cursor.s3.title': '۳. تست در چت',
    'cursor.s3.body':
      'چت جدید باز کنید، مدل mapped را انتخاب کنید و پیام بفرستید. ترافیک روی سخت‌افزار شما می‌ماند.',
    'cursor.s4.title': '۴. stack را روشن نگه دارید',
    'cursor.s4.body':
      'tray → Start all یا cursor-ollama stack start. Copy tunnel URL را برای paste در Cursor بزنید. حالت موقت: در صورت قطعی، لینک را refresh کنید.',
    'req.title': 'قبل از شروع — چک‌لیست',
    'req.node': 'CLI، ویزارد، پروکسی و tray را اجرا می‌کند.',
    'req.ollama': 'سرور LLM محلی روی پورت 11434 با حداقل یک مدل pull شده.',
    'req.cloudflared': 'Cloudflare Tunnel connector — برای tunnel نام‌گذاری‌شده و لینک موقت trycloudflare.',
    'req.domain': 'اختیاری: دامنه روی DNS Cloudflare. بدون دامنه → حالت quick در ویزارد.',
    'faq.title': 'سوالات متداول',
    'faq.q1': 'واقعاً رایگان است؟',
    'faq.a1':
      'بله. cursor-ollama مجوز MIT دارد. هزینه دامنه و برق با شماست — نه توکن OpenAI.',
    'faq.q2': 'آیا Cursor به OpenAI داده می‌فرستد؟',
    'faq.a2':
      'با BYOK روی URL تونل شما، چت به proxy → Ollama می‌رود. نام‌هایی مثل gpt-4-turbo فقط alias هستند.',
    'faq.q3': 'health تونل 530 / off در tray',
    'faq.a3':
      'اول proxy سپس tunnel. cursor-ollama stack start. credentials خودکار repair می‌شود؛ tray را restart کنید.',
    'faq.q4': 'چطور uninstall کنم؟',
    'faq.a4':
      'cursor-ollama uninstall یا Programs and Features. --keep-config برای نگه‌داشتن تنظیمات.',
    'faq.q5': 'macOS یا Linux؟',
    'faq.a5':
      'بله با مسیر CLI. ویزارد گرافیکی برای ویندوز بهینه است؛ stack همه‌جا کار می‌کند.',
    'faq.q6': 'دامنه Cloudflare ندارم',
    'faq.a6':
      'در ویزارد «نه — لینک موقت trycloudflare» را بزنید. بدون DNS و tunnel create. کپی/refresh از tray یا Settings.',
    'faq.q7': 'نام‌های variant مدل Cursor (gpt-4o و …)',
    'faq.a7':
      'پروکسی نام دقیق، variantهای dated (مثل gpt-4-turbo-2024-04-09) و fallback به mapping فعال را rewrite می‌کند.',
    'cta.title': 'آماده کدنویسی AI محلی در Cursor؟',
    'cta.body':
      'یک‌بار نصب کنید، ویزارد را اجرا کنید، سه فیلد را paste کنید و امشب با مدل خودتان کد بزنید.',
    'cta.npm': 'دریافت از npm',
    'cta.github': 'ستاره در GitHub',
    'footer.github': 'گیت‌هاب',
    'footer.npm': 'npm',
    'footer.company': 'AYTRONIC CO',
    'footer.license': 'مجوز MIT',
    'footer.tag': 'برای توسعه‌دهندگانی که LLM محلی در Cursor می‌خواهند — بدون دردسر setup.',
  },
};

window.applyLandingLang = function applyLandingLang(lang) {
  const dict = window.LANDING_I18N[lang] || window.LANDING_I18N.en;
  document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', lang === 'fa');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  const title = lang === 'fa'
    ? 'راه‌اندازی آسان Ollama برای Cursor — cursor-ollama'
    : 'Easy Ollama Setup for Cursor — cursor-ollama';
  document.title = title;

  try {
    localStorage.setItem('cursor-ollama-lang', lang);
  } catch {
    // ignore
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let lang = 'en';
  try {
    lang = localStorage.getItem('cursor-ollama-lang') || 'en';
  } catch {
    lang = 'en';
  }
  if (lang !== 'fa') lang = 'en';

  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.addEventListener('click', () => applyLandingLang(btn.dataset.lang));
  });

  applyLandingLang(lang);
});
