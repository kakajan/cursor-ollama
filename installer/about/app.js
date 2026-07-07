const I18N = {
  fa: {
    title: 'cursor-ollama',
    subtitle: 'اتصال Ollama محلی به Cursor از طریق Cloudflare Tunnel.',
    'about.title': 'درباره پروژه',
    'about.body':
      'CLI متن‌باز و رایگان با ویزارد ویندوز، پروکسی امن، بازنویسی نام مدل، کنترل از tray و لینک موقت trycloudflare (اختیاری).',
    'support.title': 'حمایت',
    'support.body': 'به repo ستاره بدهید، باگ گزارش کنید یا در GitHub Issues سوال بپرسید.',
    'contribute.title': 'مشارکت',
    'contribute.body':
      'Pull request و بهبود مستندات خوش‌آمد است. Fork کنید و تجربه setup خود را به اشتراک بگذارید.',
    'link.home': 'صفحه پروژه',
    'link.docs': 'راهنمای کامل',
    'link.github': 'GitHub',
    'link.issues': 'گزارش مشکل / سوال',
    'link.npm': 'npm',
    'link.star': '⭐ ستاره در GitHub',
    'btn.close': 'بستن',
  },
  en: {
    title: 'cursor-ollama',
    subtitle: 'Connect local Ollama to Cursor IDE via Cloudflare Tunnel.',
    'about.title': 'About',
    'about.body':
      'Free, open-source CLI with Windows wizard, secure proxy, model name rewrite, tray controls, and optional temporary trycloudflare links.',
    'support.title': 'Support',
    'support.body': 'Star the repo, report bugs, or ask questions on GitHub Issues.',
    'contribute.title': 'Contribute',
    'contribute.body':
      'Pull requests and documentation improvements are welcome. Fork the repository and share your setup tips.',
    'link.home': 'Project homepage',
    'link.docs': 'Full guide',
    'link.github': 'GitHub repository',
    'link.issues': 'Report issue / ask question',
    'link.npm': 'npm package',
    'link.star': '⭐ Star on GitHub',
    'btn.close': 'Close',
  },
};

let lang = 'en';
let meta = null;

function t(key) {
  return I18N[lang][key] || key;
}

function applyI18n() {
  document.documentElement.lang = lang;
  document.body.classList.toggle('rtl', lang === 'fa');
  document.body.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  renderLinks();
}

function renderLinks() {
  if (!meta) return;

  const support = document.getElementById('supportLinks');
  const contribute = document.getElementById('contributeLinks');

  support.innerHTML = `
    <a class="btn btn-ghost link-btn" href="${meta.homepage}" target="_blank" rel="noopener">${t('link.home')}</a>
    <a class="btn btn-ghost link-btn" href="${meta.homepage}" target="_blank" rel="noopener">${t('link.docs')}</a>
    <a class="btn btn-ghost link-btn" href="${meta.bugs}" target="_blank" rel="noopener">${t('link.issues')}</a>
    <a class="btn btn-ghost link-btn" href="${meta.npm}" target="_blank" rel="noopener">${t('link.npm')}</a>
  `;

  contribute.innerHTML = `
    <a class="btn btn-primary link-btn" href="${meta.repository}" target="_blank" rel="noopener">${t('link.star')}</a>
    <a class="btn btn-ghost link-btn" href="${meta.repository}" target="_blank" rel="noopener">${t('link.github')}</a>
    <a class="btn btn-ghost link-btn" href="${meta.bugs}" target="_blank" rel="noopener">${t('link.issues')}</a>
  `;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return data;
}

async function bootstrap() {
  meta = await api('/api/info');
  document.getElementById('versionLine').textContent = `v${meta.version} · ${meta.license}`;
  document.getElementById('licenseLine').textContent = `${meta.license} · ${meta.author}`;
  applyI18n();
}

document.querySelectorAll('.lang-switch button').forEach((btn) => {
  btn.addEventListener('click', () => {
    lang = btn.dataset.lang;
    applyI18n();
  });
});

document.getElementById('btnClose').addEventListener('click', async () => {
  try {
    await api('/api/close', { method: 'POST' });
  } catch {
    // Server may already be shutting down.
  }
  window.close();
});

bootstrap();
