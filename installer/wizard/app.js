const STEP_COUNT = 6;

const I18N = {
  fa: {
    title: 'cursor-ollama',
    subtitle: 'اتصال Ollama محلی به Cursor از طریق Cloudflare Tunnel',
    'welcome.title': 'خوش آمدید',
    'welcome.lead':
      'این ویزارد تنظیمات، میانبر دسکتاپ، اجرای خودکار با ویندوز و tray را برای شما پیکربندی می‌کند.',
    'welcome.hint':
      'قبل از شروع مطمئن شوید Ollama و cloudflared نصب شده‌اند. برای دامنه اختصاصی حساب Cloudflare لازم است؛ در غیر این صورت لینک موقت trycloudflare ساخته می‌شود.',
    'checks.title': 'پیش‌نیازها',
    'checks.lead': 'وضعیت ابزارهای مورد نیاز را بررسی می‌کنیم.',
    'tunnel.title': 'Cloudflare Tunnel',
    'tunnel.lead': 'انتخاب کنید Cursor از چه مسیری به proxy محلی وصل شود.',
    'tunnel.domainQuestion': 'دامنه روی Cloudflare دارید؟',
    'tunnel.hasDomain': 'بله — از دامنه خودم استفاده می‌کنم',
    'tunnel.noDomain': 'نه — لینک موقت trycloudflare بساز',
    'tunnel.quickHint':
      'دامنه Cloudflare لازم نیست. بعد از نصب یک URL موقت trycloudflare.com ساخته می‌شود. بعداً از tray یا Settings می‌توانید لینک را کپی یا به‌روز کنید.',
    'tunnel.hostname': 'Hostname (بدون https://)',
    'tunnel.name': 'نام tunnel',
    'tunnel.ollamaPort': 'پورت Ollama',
    'tunnel.proxyPort': 'پورت proxy',
    'tunnel.cmdHint': 'اگر tunnel ندارید، در PowerShell اجرا کنید:',
    'tunnel.refresh': 'بررسی tunnel',
    'tunnel.found': 'tunnel پیدا شد — می‌توانید ادامه دهید.',
    'tunnel.missing': 'tunnel هنوز پیدا نشد. بعد از create دوباره بررسی کنید.',
    'tunnel.missingNamed': 'tunnel «{name}» پیدا نشد. موجود: {tunnels}',
    'tunnel.listFailed': 'cloudflared tunnel list ناموفق بود: {error}',
    'models.title': 'مدل‌ها',
    'models.lead': 'مدل Ollama و نام مدل در Cursor را انتخاب کنید.',
    'models.ollama': 'مدل Ollama',
    'models.cursor': 'نام مدل در Cursor',
    'models.skipPull': 'بدون pull — فقط از مدل نصب‌شده محلی استفاده شود',
    'options.title': 'گزینه‌های ویندوز',
    'options.lead': 'میانبر و اجرای خودکار را انتخاب کنید.',
    'options.shortcut': 'ساخت میانبر دسکتاپ (آیکن cursor-ollama)',
    'options.startup': 'اجرای tray با بالا آمدن ویندوز',
    'options.tray': 'بعد از نصب، tray را در پس‌زمینه اجرا کن',
    'install.title': 'نصب',
    'install.lead': 'در حال ذخیره تنظیمات و راه‌اندازی…',
    'btn.back': 'قبلی',
    'btn.next': 'بعدی',
    'btn.install': 'نصب و اتمام',
    'btn.done': 'بستن ویزارد',
    'closed.title': 'ویزارد بسته شد',
    'closed.lead': 'می‌توانید این تب مرورگر را ببندید. سرویس ویزارد متوقف شده است.',
    'closed.hint': 'اگر tray نصب شده، از آیکن کنار ساعت استفاده کنید.',
  },
  en: {
    title: 'cursor-ollama',
    subtitle: 'Connect local Ollama to Cursor via Cloudflare Tunnel',
    'welcome.title': 'Welcome',
    'welcome.lead':
      'This wizard configures settings, desktop shortcut, Windows startup, and the system tray.',
    'welcome.hint':
      'Ensure Ollama and cloudflared are installed. A Cloudflare domain is optional — you can use a temporary trycloudflare link instead.',
    'checks.title': 'Prerequisites',
    'checks.lead': 'Checking required tools.',
    'tunnel.title': 'Cloudflare Tunnel',
    'tunnel.lead': 'Choose how Cursor reaches your local proxy.',
    'tunnel.domainQuestion': 'Do you have a domain on Cloudflare?',
    'tunnel.hasDomain': 'Yes — use my Cloudflare domain',
    'tunnel.noDomain': 'No — create a temporary trycloudflare link',
    'tunnel.quickHint':
      'No Cloudflare domain needed. After install we create a temporary trycloudflare.com URL. You can refresh or copy it later from tray or Settings.',
    'tunnel.hostname': 'Hostname (without https://)',
    'tunnel.name': 'Tunnel name',
    'tunnel.ollamaPort': 'Ollama port',
    'tunnel.proxyPort': 'Proxy port',
    'tunnel.cmdHint': 'If you need a new tunnel, run in PowerShell:',
    'tunnel.refresh': 'Check tunnel',
    'tunnel.found': 'Tunnel found — you can continue.',
    'tunnel.missing': 'Tunnel not found yet. Create it, then check again.',
    'tunnel.missingNamed': 'No tunnel named "{name}". Existing: {tunnels}',
    'tunnel.listFailed': 'cloudflared tunnel list failed: {error}',
    'models.title': 'Models',
    'models.lead': 'Choose Ollama model and Cursor allowlisted name.',
    'models.ollama': 'Ollama model',
    'models.cursor': 'Cursor model name',
    'models.skipPull': 'Skip pull — use locally installed model only',
    'options.title': 'Windows options',
    'options.lead': 'Choose shortcut and startup behavior.',
    'options.shortcut': 'Create desktop shortcut (cursor-ollama icon)',
    'options.startup': 'Start tray when Windows boots',
    'options.tray': 'Launch tray in background after install',
    'install.title': 'Install',
    'install.lead': 'Saving configuration and setting up…',
    'btn.back': 'Back',
    'btn.next': 'Next',
    'btn.install': 'Install & finish',
    'btn.done': 'Close wizard',
    'closed.title': 'Wizard closed',
    'closed.lead': 'You can close this browser tab. The wizard server has stopped.',
    'closed.hint': 'If tray was enabled, use the icon near the clock to manage proxy and tunnel.',
  },
};

const CHECK_LABELS = {
  node: { fa: 'Node.js', en: 'Node.js' },
  ollama: { fa: 'Ollama', en: 'Ollama' },
  cloudflared: { fa: 'cloudflared', en: 'cloudflared' },
};

let lang = 'en';
let step = 0;
let installing = false;

const stepsEl = document.getElementById('steps');
const panels = [...document.querySelectorAll('.panel')];
const btnBack = document.getElementById('btnBack');
const btnNext = document.getElementById('btnNext');

function t(key) {
  return I18N[lang][key] || key;
}

function getSelectedTunnelMode() {
  return document.getElementById('tunnelModeQuick')?.checked ? 'quick' : 'named';
}

function updateTunnelModeUi() {
  const quick = getSelectedTunnelMode() === 'quick';
  document.getElementById('namedTunnelFields').style.display = quick ? 'none' : 'block';
  document.getElementById('quickTunnelHint').style.display = quick ? 'block' : 'none';
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
  updateButtons();
  updateTunnelModeUi();
}

function renderSteps() {
  stepsEl.innerHTML = '';
  for (let i = 0; i < STEP_COUNT; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'step-dot';
    if (i < step) dot.classList.add('done');
    if (i === step) dot.classList.add('active');
    stepsEl.appendChild(dot);
  }
}

function showStep(next) {
  step = next;
  panels.forEach((panel, index) => {
    panel.classList.toggle('active', index === step);
  });
  renderSteps();
  updateButtons();

  if (step === 1) loadChecks();
  if (step === 2) refreshTunnelStatus();
  if (step === 3) loadModels();
}

function updateButtons() {
  btnBack.disabled = step === 0 || installing;
  if (step === STEP_COUNT - 1) {
    btnNext.textContent = installing ? '…' : t('btn.done');
    btnNext.disabled = installing;
    return;
  }
  if (step === STEP_COUNT - 2) {
    btnNext.textContent = t('btn.install');
    return;
  }
  btnNext.textContent = t('btn.next');
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

async function loadChecks() {
  const list = document.getElementById('checks-list');
  list.innerHTML = '';
  const { checks } = await api('/api/checks');
  for (const check of checks) {
    const row = document.createElement('div');
    row.className = 'check-row';
    const label = CHECK_LABELS[check.name]?.[lang] || check.name;
    row.innerHTML = `<strong>${label}</strong><span class="status ${check.ok ? 'ok' : 'fail'}">${check.ok ? 'OK' : 'MISSING'}</span>`;
    list.appendChild(row);
  }
}

async function loadModels() {
  const select = document.getElementById('ollamaModel');
  select.innerHTML = '';
  const { models, defaultModel } = await api('/api/models');
  if (models.length === 0) {
    const opt = document.createElement('option');
    opt.value = defaultModel;
    opt.textContent = defaultModel;
    select.appendChild(opt);
    return;
  }
  for (const name of models) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
}

function formatTunnelStatusMessage({ found, name, tunnels, error }) {
  if (error) {
    return t('tunnel.listFailed').replace('{error}', error);
  }
  if (found) {
    return t('tunnel.found');
  }
  if (tunnels.length > 0) {
    return t('tunnel.missingNamed')
      .replace('{name}', name)
      .replace('{tunnels}', tunnels.join(', '));
  }
  return t('tunnel.missing');
}

async function refreshTunnelStatus() {
  const tunnelName = document.getElementById('tunnelName').value.trim() || 'cursor-ollama';
  const box = document.getElementById('tunnelStatus');
  box.style.display = 'block';
  box.textContent = '…';
  const data = await api(`/api/tunnels?name=${encodeURIComponent(tunnelName)}`);
  box.textContent = formatTunnelStatusMessage(data);
  box.style.borderColor = data.found
    ? 'rgba(74,222,128,0.35)'
    : data.error
      ? 'rgba(248,113,113,0.35)'
      : 'rgba(251,191,36,0.35)';
}

function logLine(text, type = '') {
  const log = document.getElementById('progressLog');
  const line = document.createElement('div');
  line.className = `line ${type}`;
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

async function runInstall() {
  installing = true;
  showStep(STEP_COUNT - 1);
  updateButtons();

  const payload = {
    tunnelMode: getSelectedTunnelMode(),
    tunnelHostname: document.getElementById('tunnelHostname').value.trim(),
    tunnelName: document.getElementById('tunnelName').value.trim(),
    ollamaPort: document.getElementById('ollamaPort').value,
    proxyPort: document.getElementById('proxyPort').value,
    ollamaSourceModel: document.getElementById('ollamaModel').value,
    cursorModelName: document.getElementById('cursorModel').value.trim(),
    skipModelPull: document.getElementById('skipPull').checked,
    createShortcut: document.getElementById('createShortcut').checked,
    startWithWindows: document.getElementById('startWithWindows').checked,
    launchTray: document.getElementById('launchTray').checked,
  };

  try {
    const result = await api('/api/install', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    for (const line of result.log || []) {
      logLine(line.text, line.type || 'ok');
    }
    if (result.cursorBlock) {
      const block = document.getElementById('cursorBlock');
      block.style.display = 'block';
      block.textContent = result.cursorBlock;
    }
  } catch (err) {
    logLine(err.message, 'err');
  } finally {
    installing = false;
    updateButtons();
  }
}

async function closeWizard() {
  btnNext.disabled = true;
  btnNext.textContent = '…';

  try {
    await api('/api/close', { method: 'POST' });
  } catch {
    // Server may already be shutting down.
  }

  const shell = document.querySelector('.shell');
  if (shell) {
    shell.innerHTML = `
      <header class="header closed-shell">
        <img class="logo-img" src="/logo.svg" alt="">
        <h1>${t('closed.title')}</h1>
        <p>${t('closed.lead')}</p>
        <p class="closed-hint">${t('closed.hint')}</p>
      </header>
    `;
  }
  document.querySelector('.lang-switch')?.remove();

  window.close();
}

async function bootstrap() {
  const { config } = await api('/api/config');
  if (config) {
    document.getElementById('tunnelHostname').value = config.tunnelHostname || '';
    document.getElementById('tunnelName').value = config.tunnelName || 'cursor-ollama';
    document.getElementById('ollamaPort').value = config.ollamaPort || 11434;
    document.getElementById('proxyPort').value = config.proxyPort || 11435;
    document.getElementById('cursorModel').value = config.cursorModelName || 'gpt-4o-mini';
    document.getElementById('skipPull').checked = Boolean(config.skipModelPull);
    if (config.tunnelMode === 'quick') {
      document.getElementById('tunnelModeQuick').checked = true;
    } else {
      document.getElementById('tunnelModeNamed').checked = true;
    }
  } else {
    document.getElementById('tunnelName').value = 'cursor-ollama';
  }

  for (let i = 0; i < STEP_COUNT; i += 1) {
    const dot = document.createElement('div');
    dot.className = 'step-dot';
    stepsEl.appendChild(dot);
  }
  renderSteps();
  applyI18n();
}

document.querySelectorAll('.lang-switch button').forEach((btn) => {
  btn.addEventListener('click', () => {
    lang = btn.dataset.lang;
    applyI18n();
    if (step === 1) loadChecks();
  });
});

document.getElementById('refreshTunnels').addEventListener('click', refreshTunnelStatus);
document.getElementById('tunnelModeNamed').addEventListener('change', updateTunnelModeUi);
document.getElementById('tunnelModeQuick').addEventListener('change', updateTunnelModeUi);

btnBack.addEventListener('click', () => {
  if (step > 0) showStep(step - 1);
});

btnNext.addEventListener('click', async () => {
  if (step === STEP_COUNT - 1) {
    await closeWizard();
    return;
  }
  if (step === STEP_COUNT - 2) {
    await runInstall();
    return;
  }
  showStep(step + 1);
});

bootstrap();
