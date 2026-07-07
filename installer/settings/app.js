const I18N = {
  fa: {
    title: 'cursor-ollama',
    subtitle: 'پورت‌ها و تنظیمات tunnel',
    'settings.title': 'تنظیمات',
    'settings.lead':
      'پورت‌ها یا حالت tunnel را تغییر دهید. بعد از تغییر پورت، proxy و tunnel را از tray ری‌استارت کنید.',
    'settings.tunnelMode': 'حالت tunnel',
    'settings.modeNamed': 'دامنه Cloudflare',
    'settings.modeQuick': 'لینک موقت trycloudflare',
    'settings.ollamaPort': 'پورت Ollama',
    'settings.proxyPort': 'پورت proxy',
    'settings.hostname': 'Hostname tunnel',
    'settings.tunnelName': 'نام tunnel',
    'settings.currentUrl': 'لینک عمومی فعلی',
    'settings.cursorBaseUrl': 'Base URL برای Cursor',
    'settings.quickHint': 'لینک‌های موقت با refresh عوض می‌شوند. بعد از refresh تنظیمات Cursor را هم به‌روز کنید.',
    'settings.loadingFetch': 'در حال دریافت لینک موقت...',
    'settings.loadingRefresh': 'در حال ساخت لینک جدید موقت...',
    'settings.saved': 'ذخیره شد. اگر پورت عوض شد، proxy و tunnel را از tray ری‌استارت کنید.',
    'settings.refreshed': 'لینک موقت به‌روز شد.',
    'settings.copied': 'در clipboard کپی شد.',
    'settings.configPath': 'فایل کامل تنظیمات:',
    'btn.save': 'ذخیره',
    'btn.close': 'بستن',
    'btn.copyUrl': 'کپی Base URL',
    'btn.copyPublic': 'کپی لینک عمومی',
    'btn.refreshQuick': 'به‌روزرسانی لینک',
  },
  en: {
    title: 'cursor-ollama',
    subtitle: 'Ports and tunnel settings',
    'settings.title': 'Settings',
    'settings.lead':
      'Change ports or tunnel mode. Restart proxy/tunnel from the tray after port changes.',
    'settings.tunnelMode': 'Tunnel mode',
    'settings.modeNamed': 'Cloudflare domain',
    'settings.modeQuick': 'Temporary trycloudflare link',
    'settings.ollamaPort': 'Ollama port',
    'settings.proxyPort': 'Proxy port',
    'settings.hostname': 'Tunnel hostname',
    'settings.tunnelName': 'Tunnel name',
    'settings.currentUrl': 'Current public URL',
    'settings.cursorBaseUrl': 'Cursor Base URL',
    'settings.quickHint': 'Temporary links change when refreshed. Update Cursor Settings after refresh.',
    'settings.loadingFetch': 'Fetching temporary link...',
    'settings.loadingRefresh': 'Creating a new temporary link...',
    'settings.saved': 'Saved. If ports changed, restart proxy and tunnel from the tray.',
    'settings.refreshed': 'Temporary link refreshed.',
    'settings.copied': 'Copied to clipboard.',
    'settings.configPath': 'Full config file:',
    'btn.save': 'Save',
    'btn.close': 'Close',
    'btn.copyUrl': 'Copy Base URL',
    'btn.copyPublic': 'Copy public link',
    'btn.refreshQuick': 'Refresh link',
  },
};

let lang = 'en';
let quickLoadingKey = 'settings.loadingFetch';

function t(key) {
  return I18N[lang][key] || key;
}

function getSelectedTunnelMode() {
  return document.getElementById('tunnelModeQuick')?.checked ? 'quick' : 'named';
}

function updateTunnelModeUi() {
  const quick = getSelectedTunnelMode() === 'quick';
  document.getElementById('namedSettingsFields').style.display = quick ? 'none' : 'block';
  document.getElementById('quickSettingsFields').style.display = quick ? 'block' : 'none';
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
  document.getElementById('quickLoadingText').textContent = t(quickLoadingKey);
  updateTunnelModeUi();
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

function showStatus(text, ok = true) {
  const box = document.getElementById('statusBox');
  box.style.display = 'block';
  box.textContent = text;
  box.style.borderColor = ok ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)';
}

function setQuickLoading(loading, messageKey = quickLoadingKey) {
  const fields = document.getElementById('quickSettingsFields');
  const banner = document.getElementById('quickLoadingBanner');
  const text = document.getElementById('quickLoadingText');

  quickLoadingKey = messageKey || quickLoadingKey;
  fields.classList.toggle('is-loading', loading);
  banner.style.display = loading ? 'flex' : 'none';
  text.textContent = t(quickLoadingKey);

  ['btnCopyUrl', 'btnCopyPublic', 'btnRefreshQuick'].forEach((id) => {
    document.getElementById(id).disabled = loading;
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function fillQuickUrls(data) {
  document.getElementById('quickTunnelUrl').value = data.url || '';
  document.getElementById('quickBaseUrl').value = data.baseUrl || '';
}

async function loadTunnelUrl(messageKey = 'settings.loadingFetch') {
  setQuickLoading(true, messageKey);
  try {
    const data = await api('/api/tunnel-url');
    fillQuickUrls(data);
    return data;
  } finally {
    setQuickLoading(false);
  }
}

async function bootstrap() {
  const { config, configPath } = await api('/api/config');
  document.getElementById('ollamaPort').value = config.ollamaPort || 11434;
  document.getElementById('proxyPort').value = config.proxyPort || 11435;
  document.getElementById('tunnelHostname').value = config.tunnelHostname || '';
  document.getElementById('tunnelName').value = config.tunnelName || 'cursor-ollama';
  document.getElementById('configPathBox').textContent = `${t('settings.configPath')} ${configPath}`;

  if (config.tunnelMode === 'quick') {
    document.getElementById('tunnelModeQuick').checked = true;
  } else {
    document.getElementById('tunnelModeNamed').checked = true;
  }

  applyI18n();
  if (getSelectedTunnelMode() === 'quick') {
    try {
      await loadTunnelUrl('settings.loadingFetch');
    } catch (err) {
      showStatus(err.message, false);
    }
  }
}

document.querySelectorAll('.lang-switch button').forEach((btn) => {
  btn.addEventListener('click', () => {
    lang = btn.dataset.lang;
    applyI18n();
  });
});

document.getElementById('tunnelModeNamed').addEventListener('change', updateTunnelModeUi);
document.getElementById('tunnelModeQuick').addEventListener('change', async () => {
  updateTunnelModeUi();
  if (getSelectedTunnelMode() === 'quick') {
    try {
      await loadTunnelUrl('settings.loadingFetch');
    } catch (err) {
      showStatus(err.message, false);
    }
  }
});

document.getElementById('btnSave').addEventListener('click', async () => {
  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  try {
    await api('/api/save', {
      method: 'POST',
      body: JSON.stringify({
        tunnelMode: getSelectedTunnelMode(),
        ollamaPort: document.getElementById('ollamaPort').value,
        proxyPort: document.getElementById('proxyPort').value,
        tunnelHostname: document.getElementById('tunnelHostname').value.trim(),
        tunnelName: document.getElementById('tunnelName').value.trim(),
      }),
    });
    showStatus(t('settings.saved'), true);
    if (getSelectedTunnelMode() === 'quick') {
      await loadTunnelUrl('settings.loadingFetch');
    }
  } catch (err) {
    showStatus(err.message, false);
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('btnCopyUrl').addEventListener('click', async () => {
  const text = document.getElementById('quickBaseUrl').value;
  if (!text) {
    showStatus('No Base URL yet. Refresh the quick tunnel first.', false);
    return;
  }
  await copyText(text);
  showStatus(t('settings.copied'), true);
});

document.getElementById('btnCopyPublic').addEventListener('click', async () => {
  const text = document.getElementById('quickTunnelUrl').value;
  if (!text) {
    showStatus('No public link yet. Refresh the quick tunnel first.', false);
    return;
  }
  await copyText(text);
  showStatus(t('settings.copied'), true);
});

document.getElementById('btnRefreshQuick').addEventListener('click', async () => {
  setQuickLoading(true, 'settings.loadingRefresh');
  try {
    const data = await api('/api/tunnel/refresh', { method: 'POST', body: '{}' });
    fillQuickUrls(data);
    showStatus(t('settings.refreshed'), true);
  } catch (err) {
    showStatus(err.message, false);
  } finally {
    setQuickLoading(false);
  }
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
