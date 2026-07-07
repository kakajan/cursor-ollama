window.LANDING_I18N = {
  en: {
    'nav.why': 'Why',
    'nav.guide': 'Guide',
    'nav.settings': 'Settings & tray',
    'nav.cursor': 'Cursor setup',
    'nav.faq': 'FAQ',
    'nav.github': 'GitHub',
    'badge.wizard': 'Windows wizard',
    'badge.tunnel': 'Cloudflare Tunnel',
    'badge.quick': 'No domain option',
    'badge.secure': 'Bearer auth',
    'badge.mit': 'MIT',
    'hero.eyebrow': 'Free, open source, made for developers who want local models',
    'hero.title': 'Connect Ollama to Cursor without fighting the setup',
    'hero.sub':
      'cursor-ollama is a small open-source tool I built to make local AI in Cursor feel simple: run a wizard, get a secure HTTPS URL, paste it into Cursor, and keep using your own Ollama models.',
    'hero.cta.guide': 'Show me the guide',
    'hero.cta.npm': 'Install from npm',
    'hero.trust.1': 'No OpenAI token bill',
    'hero.trust.2': 'Works with Cursor BYOK',
    'hero.trust.3': 'English + Persian',
    'term.comment1': '# Friendly path on Windows',
    'term.comment2': '# Cursor -> Settings -> Models',
    'term.out1': 'Base URL: https://your-host.example.com/v1',
    'term.out2': 'Cursor alias: gpt-4-turbo -> Ollama model',
    'term.out3': 'No domain: https://random.trycloudflare.com/v1',
    'why.title': 'Why this exists',
    'why.lead':
      'Cursor cannot simply call your localhost Ollama from its cloud flow. The hard parts are routing, authentication, model names, and keeping it easy enough to use again tomorrow.',
    'why.without.title': 'The manual way',
    'why.without.body':
      'You wire a tunnel by hand, worry about exposing Ollama, rename models until Cursor accepts them, and then forget which command fixed it last time.',
    'why.with.title': 'With cursor-ollama',
    'why.with.body':
      'A guided setup, an authenticated proxy, model aliases, health checks, tray controls, settings page, and a clean uninstall path live in one small tool.',
    'feat.1.title': 'A calm wizard',
    'feat.1.body':
      'The Windows wizard checks requirements, asks only what it needs, writes the config, creates shortcuts, and starts the tray.',
    'feat.2.title': 'Safer tunnel path',
    'feat.2.body':
      'Requests go through the cursor-ollama proxy with Bearer auth. Raw Ollama is not published directly to the internet.',
    'feat.3.title': 'Model aliases',
    'feat.3.body':
      'Use a Cursor-friendly name such as gpt-4-turbo while Ollama runs qwen, gemma, llama, or any local model you choose.',
    'feat.4.title': 'Tray + Settings',
    'feat.4.body':
      'Start and stop the stack, copy the Cursor URL, refresh quick links, change ports, and open config without digging through folders.',
    'feat.5.title': 'Verify before guessing',
    'feat.5.body':
      'Health checks for Ollama, proxy, and tunnel help you see what is wrong before you paste settings into Cursor.',
    'feat.6.title': 'Easy to leave cleanly',
    'feat.6.body':
      'Uninstall removes tray items, shortcuts, and services. You can keep config if you plan to come back later.',
    'how.title': 'How the request travels',
    'how.lead': 'Cursor gets one HTTPS URL. Ollama stays on your machine behind the proxy.',
    'how.n1.title': 'Cursor IDE',
    'how.n1.sub': 'cloud flow',
    'how.n2.title': 'Cloudflare Tunnel',
    'how.n2.sub': 'public HTTPS',
    'how.n3.title': 'Auth proxy',
    'how.n3.sub': ':11435',
    'how.n4.title': 'Ollama',
    'how.n4.sub': ':11434',
    'guide.title': 'Simple setup guide',
    'guide.lead':
      'First run usually takes 5 to 15 minutes. If you use the temporary trycloudflare option, it is often faster because you do not need DNS.',
    'guide.tab.wizard': 'Windows wizard',
    'guide.tab.cli': 'CLI path',
    'guide.w0.title': 'Install and open the wizard',
    'guide.w0.body':
      'Install globally with npm i -g cursor-ollama, then run cursor-ollama wizard. Use the Persian switch if you prefer the guide in Persian.',
    'guide.w1.title': 'Check requirements',
    'guide.w1.body':
      'The wizard checks Node.js, Ollama, and cloudflared. If something is missing, install it and run the check again.',
    'guide.w1.l1': 'Node.js 18 or newer from nodejs.org',
    'guide.w1.l2': 'Ollama from ollama.com, with at least one model pulled',
    'guide.w1.l3': 'cloudflared from Cloudflare downloads',
    'guide.w2.title': 'Choose the tunnel',
    'guide.w2.body':
      'Use named mode if you own a Cloudflare domain. Use quick mode if you just want a temporary trycloudflare URL with no DNS setup.',
    'guide.w2.ports': 'Keep the default ports unless you already use 11434 or 11435.',
    'guide.w2.named': 'Named mode: enter hostname and tunnel name. DNS is routed during install.',
    'guide.w2.quick':
      'Quick mode: the wizard starts proxy and trycloudflare, then shows the public URL you can copy into Cursor.',
    'guide.w3.title': 'Pick your model',
    'guide.w3.body':
      'Choose the real Ollama model and the alias Cursor should see. Example: Cursor asks for gpt-4-turbo, Ollama receives qwen2.5-coder:7b.',
    'guide.w3.skip': 'Turn on Skip pull if the model is already installed.',
    'guide.w4.title': 'Windows comfort options',
    'guide.w4.l1': 'Desktop shortcut for quick access',
    'guide.w4.l2': 'Start with Windows if you want the tray ready after login',
    'guide.w4.l3': 'Launch tray after install so you can copy the Cursor URL right away',
    'guide.w5.title': 'Finish and copy Cursor settings',
    'guide.w5.body':
      'The wizard saves config, model mapping, tunnel settings or quick URL, then shows the values Cursor needs.',
    'guide.w5.close':
      'When you close the wizard tab, the temporary wizard server stops. The tray can keep the stack running.',
    'guide.c1.title': 'Install and check',
    'guide.c2.title': 'Initialize config',
    'guide.c3.title': 'Start and verify',
    'guide.c4.title': 'Use it day to day',
    'settings.title': 'Settings and tray',
    'settings.lead':
      'The tray is there for the boring daily work: start things, copy links, refresh quick tunnel URLs, and change settings without hand-editing JSON.',
    'settings.s1.title': 'Open Settings',
    'settings.s1.body':
      'Use Tray -> Settings or run cursor-ollama settings. Change ports, switch tunnel mode, and copy the Base URL.',
    'settings.s2.title': 'Copy tunnel URL',
    'settings.s2.body':
      'Tray -> Copy tunnel URL gives you the exact /v1 URL Cursor expects.',
    'settings.s3.title': 'Refresh quick tunnel',
    'settings.s3.body':
      'Quick links are temporary. Refresh from tray or Settings, then paste the new Base URL in Cursor.',
    'settings.s4.title': 'Open config when needed',
    'settings.s4.body':
      'Advanced users can open ~/.cursor-ollama/config.json from the tray. Restart the stack after port changes.',
    'cursor.title': 'Connect Cursor in one minute',
    'cursor.lead':
      'After verify passes, Cursor only needs three values: Base URL, API key, and the model alias.',
    'cursor.s1.title': '1. Open Cursor Models',
    'cursor.s1.body':
      'Go to Cursor Settings -> Models and enable Override OpenAI Base URL in the OpenAI-compatible section.',
    'cursor.s2.title': '2. Paste the tunnel URL',
    'cursor.s2.body':
      'The Base URL must end with /v1. Use the Bearer key printed by cursor-ollama cursor-config.',
    'cursor.s3.title': '3. Send a test message',
    'cursor.s3.body':
      'Open a new chat, select your alias, and send a small message. The model work happens on your own hardware.',
    'cursor.s4.title': '4. Keep the stack running',
    'cursor.s4.body':
      'Use Tray -> Start all or cursor-ollama stack start. If a quick URL stops working, refresh it and update Cursor.',
    'req.title': 'Before you start',
    'req.node': 'Runs the CLI, wizard server, proxy, and tray.',
    'req.ollama': 'Runs your local model on port 11434 by default.',
    'req.cloudflared': 'Creates the HTTPS tunnel Cursor can reach.',
    'req.domain': 'Optional. Without a domain, quick mode gives you a temporary trycloudflare URL.',
    'faq.title': 'Questions people usually ask',
    'faq.q1': 'Is it really free?',
    'faq.a1':
      'Yes. cursor-ollama is MIT licensed. You may still pay for hardware, electricity, or a domain, but not OpenAI tokens for these routed requests.',
    'faq.q2': 'Is this fully private?',
    'faq.a2':
      'The model request is routed to your Ollama through your tunnel, but Cursor is still Cursor. Review Cursor privacy settings before sending sensitive code.',
    'faq.q3': 'Tunnel health returns 530 or tray says off',
    'faq.a3':
      'Start proxy first, then tunnel. Run cursor-ollama stack start and cursor-ollama verify to see which part is failing.',
    'faq.q4': 'How do I uninstall?',
    'faq.a4':
      'Run cursor-ollama uninstall or use Windows Add/Remove Programs. Add --keep-config if you want to keep your settings.',
    'faq.q5': 'Can I use macOS or Linux?',
    'faq.a5':
      'Yes, use the CLI path. The friendliest wizard and shortcut flow is currently focused on Windows.',
    'faq.q6': 'What if I do not have a Cloudflare domain?',
    'faq.a6':
      'Choose the temporary trycloudflare option. It needs no DNS setup, but the URL can change when refreshed.',
    'faq.q7': 'Why use model names like gpt-4o or gpt-4-turbo?',
    'faq.a7':
      'They are aliases Cursor accepts. The proxy rewrites them to the real Ollama model you selected.',
    'cta.title': 'If this saves you time, help it grow',
    'cta.body':
      'Star the repo, open issues, improve docs, send pull requests, or share it with a developer who wants local models in Cursor. Small contributions keep open-source tools alive.',
    'cta.npm': 'Install from npm',
    'cta.github': 'Support on GitHub',
    'footer.github': 'GitHub',
    'footer.npm': 'npm',
    'footer.company': 'AYTRONIC CO',
    'footer.license': 'MIT License',
    'footer.tag': 'Built with care for developers who want local Ollama models in Cursor without the setup headache.',
  },
  fa: {
    'nav.why': 'چرا',
    'nav.guide': 'راهنما',
    'nav.settings': 'تنظیمات و tray',
    'nav.cursor': 'تنظیم Cursor',
    'nav.faq': 'سوالات',
    'nav.github': 'گیت‌هاب',
    'badge.wizard': 'ویزارد ویندوز',
    'badge.tunnel': 'تونل Cloudflare',
    'badge.quick': 'بدون نیاز به دامنه',
    'badge.secure': 'احراز هویت Bearer',
    'badge.mit': 'MIT',
    'hero.eyebrow': 'رایگان، متن‌باز، ساخته‌شده برای برنامه‌نویس‌هایی که مدل محلی می‌خواهند',
    'hero.title': 'Ollama را بدون دردسر به Cursor وصل کنید',
    'hero.sub':
      'cursor-ollama ابزار کوچکی است که از دل نیاز واقعی ساخته شد: یک ویزارد ساده اجرا کنید، یک آدرس HTTPS امن بگیرید، آن را در Cursor وارد کنید و با مدل‌های Ollama خودتان کدنویسی کنید.',
    'hero.cta.guide': 'راهنما را ببینم',
    'hero.cta.npm': 'نصب از npm',
    'hero.trust.1': 'بدون هزینه توکن OpenAI',
    'hero.trust.2': 'سازگار با BYOK در Cursor',
    'hero.trust.3': 'انگلیسی و فارسی',
    'term.comment1': '# مسیر راحت در ویندوز',
    'term.comment2': '# Cursor -> Settings -> Models',
    'term.out1': 'Base URL: https://your-host.example.com/v1',
    'term.out2': 'نام در Cursor: gpt-4-turbo -> مدل Ollama',
    'term.out3': 'بدون دامنه: https://random.trycloudflare.com/v1',
    'why.title': 'چرا این ابزار ساخته شد',
    'why.lead':
      'Cursor در بعضی مسیرها نمی‌تواند مستقیم localhost شما را صدا بزند. بخش سخت ماجرا تونل، امنیت، اسم مدل‌ها و تکرارپذیر بودن setup است.',
    'why.without.title': 'روش دستی',
    'why.without.body':
      'تونل را دستی تنظیم می‌کنید، نگران exposed شدن Ollama هستید، اسم مدل را چند بار عوض می‌کنید تا Cursor قبول کند و آخرش هم یادتان نمی‌ماند کدام دستور مشکل را حل کرد.',
    'why.with.title': 'با cursor-ollama',
    'why.with.body':
      'ویزارد راهنما، پروکسی امن، alias مدل، health check، کنترل از tray، صفحه تنظیمات و uninstall تمیز در یک ابزار کوچک جمع شده‌اند.',
    'feat.1.title': 'ویزارد آرام و روشن',
    'feat.1.body':
      'ویزارد ویندوز پیش‌نیازها را چک می‌کند، فقط سوال‌های لازم را می‌پرسد، config می‌نویسد، shortcut می‌سازد و tray را اجرا می‌کند.',
    'feat.2.title': 'مسیر امن‌تر برای تونل',
    'feat.2.body':
      'درخواست‌ها از پروکسی cursor-ollama با Bearer auth عبور می‌کنند. Ollama خام مستقیم روی اینترنت منتشر نمی‌شود.',
    'feat.3.title': 'Alias برای مدل‌ها',
    'feat.3.body':
      'یک نام قابل قبول برای Cursor مثل gpt-4-turbo بگذارید، اما پشت صحنه qwen، gemma، llama یا هر مدل محلی دیگر اجرا شود.',
    'feat.4.title': 'Tray و تنظیمات',
    'feat.4.body':
      'stack را روشن و خاموش کنید، لینک Cursor را کپی کنید، لینک موقت را refresh کنید، پورت‌ها را تغییر دهید و config را راحت باز کنید.',
    'feat.5.title': 'قبل از حدس زدن verify کنید',
    'feat.5.body':
      'health check برای Ollama، proxy و tunnel کمک می‌کند قبل از وارد کردن تنظیمات در Cursor بفهمید مشکل دقیقاً کجاست.',
    'feat.6.title': 'خروج تمیز',
    'feat.6.body':
      'uninstall، tray، shortcut و serviceها را حذف می‌کند. اگر خواستید بعداً برگردید، می‌توانید config را نگه دارید.',
    'how.title': 'درخواست از چه مسیری می‌رود',
    'how.lead': 'Cursor فقط یک URL امن می‌بیند. Ollama پشت پروکسی روی سیستم شما می‌ماند.',
    'how.n1.title': 'Cursor IDE',
    'how.n1.sub': 'جریان ابری',
    'how.n2.title': 'Cloudflare Tunnel',
    'how.n2.sub': 'HTTPS عمومی',
    'how.n3.title': 'پروکسی امن',
    'how.n3.sub': ':11435',
    'how.n4.title': 'Ollama',
    'how.n4.sub': ':11434',
    'guide.title': 'راهنمای ساده راه‌اندازی',
    'guide.lead':
      'بار اول معمولاً ۵ تا ۱۵ دقیقه زمان می‌برد. اگر حالت موقت trycloudflare را انتخاب کنید، چون DNS لازم ندارد، معمولاً سریع‌تر راه می‌افتد.',
    'guide.tab.wizard': 'ویزارد ویندوز',
    'guide.tab.cli': 'مسیر CLI',
    'guide.w0.title': 'نصب و اجرای ویزارد',
    'guide.w0.body':
      'با npm i -g cursor-ollama نصب کنید و بعد cursor-ollama wizard را اجرا کنید. اگر فارسی راحت‌تر است، از دکمه فارسی بالای صفحه استفاده کنید.',
    'guide.w1.title': 'چک کردن پیش‌نیازها',
    'guide.w1.body':
      'ویزارد Node.js، Ollama و cloudflared را بررسی می‌کند. اگر چیزی missing بود، نصبش کنید و دوباره check بزنید.',
    'guide.w1.l1': 'Node.js نسخه ۱۸ یا جدیدتر از nodejs.org',
    'guide.w1.l2': 'Ollama از ollama.com، همراه با حداقل یک مدل نصب‌شده',
    'guide.w1.l3': 'cloudflared از صفحه دانلود Cloudflare',
    'guide.w2.title': 'انتخاب نوع تونل',
    'guide.w2.body':
      'اگر دامنه روی Cloudflare دارید named mode را انتخاب کنید. اگر فقط یک لینک سریع و موقت می‌خواهید، quick mode مناسب‌تر است و DNS نمی‌خواهد.',
    'guide.w2.ports': 'تا وقتی پورت‌ها اشغال نیستند، همان 11434 و 11435 را نگه دارید.',
    'guide.w2.named': 'حالت named: hostname و نام tunnel را وارد کنید. DNS هنگام نصب route می‌شود.',
    'guide.w2.quick':
      'حالت quick: ویزارد proxy و trycloudflare را اجرا می‌کند و URL عمومی را برای Cursor نشان می‌دهد.',
    'guide.w3.title': 'انتخاب مدل',
    'guide.w3.body':
      'مدل واقعی Ollama و نامی را که Cursor باید ببیند انتخاب کنید. مثال: Cursor نام gpt-4-turbo را می‌فرستد، اما Ollama مدل qwen2.5-coder:7b را اجرا می‌کند.',
    'guide.w3.skip': 'اگر مدل از قبل نصب شده، Skip pull را روشن کنید.',
    'guide.w4.title': 'گزینه‌های راحتی در ویندوز',
    'guide.w4.l1': 'میانبر دسکتاپ برای دسترسی سریع',
    'guide.w4.l2': 'Start with Windows برای آماده بودن tray بعد از login',
    'guide.w4.l3': 'Launch tray after install تا همان لحظه لینک Cursor را کپی کنید',
    'guide.w5.title': 'پایان نصب و کپی تنظیمات Cursor',
    'guide.w5.body':
      'ویزارد config، mapping مدل‌ها، تنظیمات تونل یا URL موقت را ذخیره می‌کند و مقدارهایی را نشان می‌دهد که Cursor لازم دارد.',
    'guide.w5.close':
      'وقتی تب ویزارد را ببندید، سرور موقت ویزارد متوقف می‌شود. tray می‌تواند stack را روشن نگه دارد.',
    'guide.c1.title': 'نصب و بررسی',
    'guide.c2.title': 'ساخت config',
    'guide.c3.title': 'اجرا و verify',
    'guide.c4.title': 'استفاده روزمره',
    'settings.title': 'Settings و tray',
    'settings.lead':
      'tray برای کارهای روزمره است: روشن کردن سرویس‌ها، کپی لینک، refresh لینک موقت و تغییر تنظیمات بدون ویرایش دستی JSON.',
    'settings.s1.title': 'باز کردن Settings',
    'settings.s1.body':
      'از Tray -> Settings یا دستور cursor-ollama settings استفاده کنید. پورت‌ها، نوع تونل و Base URL همان‌جا در دسترس است.',
    'settings.s2.title': 'کپی URL تونل',
    'settings.s2.body':
      'Tray -> Copy tunnel URL همان آدرس /v1 را می‌دهد که Cursor انتظار دارد.',
    'settings.s3.title': 'Refresh لینک موقت',
    'settings.s3.body':
      'لینک‌های quick موقت هستند. از tray یا Settings لینک تازه بگیرید و Base URL جدید را در Cursor وارد کنید.',
    'settings.s4.title': 'باز کردن config در صورت نیاز',
    'settings.s4.body':
      'کاربرهای حرفه‌ای می‌توانند ~/.cursor-ollama/config.json را از tray باز کنند. بعد از تغییر پورت، stack را restart کنید.',
    'cursor.title': 'اتصال Cursor در یک دقیقه',
    'cursor.lead':
      'بعد از موفق بودن verify، Cursor فقط سه مقدار لازم دارد: Base URL، API key و نام مدل alias.',
    'cursor.s1.title': '۱. باز کردن Models در Cursor',
    'cursor.s1.body':
      'در Cursor به Settings -> Models بروید و Override OpenAI Base URL را در بخش OpenAI-compatible فعال کنید.',
    'cursor.s2.title': '۲. وارد کردن URL تونل',
    'cursor.s2.body':
      'Base URL باید با /v1 تمام شود. کلید Bearer را از cursor-ollama cursor-config بردارید.',
    'cursor.s3.title': '۳. ارسال پیام تست',
    'cursor.s3.body':
      'یک چت تازه باز کنید، alias مدل را انتخاب کنید و یک پیام کوتاه بفرستید. اجرای مدل روی سخت‌افزار خودتان انجام می‌شود.',
    'cursor.s4.title': '۴. روشن نگه داشتن stack',
    'cursor.s4.body':
      'از Tray -> Start all یا cursor-ollama stack start استفاده کنید. اگر URL موقت از کار افتاد، refresh کنید و Cursor را به‌روز کنید.',
    'req.title': 'قبل از شروع',
    'req.node': 'CLI، wizard server، proxy و tray را اجرا می‌کند.',
    'req.ollama': 'مدل محلی شما را معمولاً روی پورت 11434 اجرا می‌کند.',
    'req.cloudflared': 'تونل HTTPS قابل دسترس برای Cursor را می‌سازد.',
    'req.domain': 'اختیاری است. بدون دامنه هم quick mode یک لینک موقت trycloudflare می‌دهد.',
    'faq.title': 'سوال‌هایی که معمولاً پیش می‌آید',
    'faq.q1': 'واقعاً رایگان است؟',
    'faq.a1':
      'بله. cursor-ollama با مجوز MIT منتشر شده. ممکن است هزینه سخت‌افزار، برق یا دامنه داشته باشید، اما برای این درخواست‌های route شده توکن OpenAI نمی‌خرید.',
    'faq.q2': 'کاملاً خصوصی است؟',
    'faq.a2':
      'درخواست مدل از تونل شما به Ollama می‌رسد، اما Cursor همچنان Cursor است. قبل از ارسال کد حساس، تنظیمات حریم خصوصی Cursor را بررسی کنید.',
    'faq.q3': 'health تونل 530 است یا tray می‌گوید off',
    'faq.a3':
      'اول proxy و بعد tunnel را روشن کنید. cursor-ollama stack start و cursor-ollama verify نشان می‌دهد کدام بخش مشکل دارد.',
    'faq.q4': 'چطور uninstall کنم؟',
    'faq.a4':
      'cursor-ollama uninstall را اجرا کنید یا از Windows Add/Remove Programs استفاده کنید. اگر config را می‌خواهید نگه دارید --keep-config اضافه کنید.',
    'faq.q5': 'macOS یا Linux هم پشتیبانی می‌شود؟',
    'faq.a5':
      'بله، از مسیر CLI استفاده کنید. راحت‌ترین جریان wizard و shortcut فعلاً روی ویندوز متمرکز است.',
    'faq.q6': 'دامنه Cloudflare ندارم، چه کنم؟',
    'faq.a6':
      'گزینه temporary trycloudflare را انتخاب کنید. DNS نمی‌خواهد، فقط اگر لینک عوض شد باید Base URL را در Cursor به‌روز کنید.',
    'faq.q7': 'چرا اسم‌هایی مثل gpt-4o یا gpt-4-turbo استفاده می‌شود؟',
    'faq.a7':
      'این‌ها aliasهایی هستند که Cursor قبول می‌کند. proxy آن‌ها را به مدل واقعی Ollama که انتخاب کرده‌اید rewrite می‌کند.',
    'cta.title': 'اگر این ابزار وقتتان را نجات داد، کمک کنید رشد کند',
    'cta.body':
      'به repo ستاره بدهید، issue باز کنید، مستندات را بهتر کنید، pull request بفرستید یا آن را به برنامه‌نویسی معرفی کنید که می‌خواهد مدل محلی را در Cursor استفاده کند. همین کمک‌های کوچک ابزارهای متن‌باز را زنده نگه می‌دارند.',
    'cta.npm': 'نصب از npm',
    'cta.github': 'حمایت در GitHub',
    'footer.github': 'گیت‌هاب',
    'footer.npm': 'npm',
    'footer.company': 'AYTRONIC CO',
    'footer.license': 'مجوز MIT',
    'footer.tag': 'با علاقه ساخته شده برای برنامه‌نویس‌هایی که Ollama محلی را در Cursor می‌خواهند، بدون دردسر setup.',
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
    ? 'اتصال ساده Ollama به Cursor — cursor-ollama'
    : 'Connect Ollama to Cursor without setup pain — cursor-ollama';
  document.title = title;

  try {
    localStorage.setItem('cursor-ollama-lang', lang);
  } catch {
    // localStorage can be unavailable in strict browser modes.
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
