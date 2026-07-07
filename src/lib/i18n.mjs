const INSTALL_MESSAGES = {
  en: {
    'ollama.running': 'Ollama is running',
    'ollama.starting': 'Starting Ollama…',
    'ollama.ready': 'Ollama is ready',
    'config.saved': 'Saved {path}',
    'model.localVerified': 'Local model verified',
    'model.ready': 'Ollama model is ready',
    'model.error': 'Model: {error}',
    'quick.mode': 'Temporary trycloudflare link mode',
    'proxy.started': 'Proxy started',
    'quick.link': 'Temporary link: {url}',
    'quick.baseUrl': 'Base URL for Cursor: {url}',
    'quick.alreadyRunning': 'Tunnel was already running',
    'quick.error': 'Temporary link: {error}',
    'tunnel.file': 'Tunnel file: {path}',
    'tunnel.credentialsVerified': 'Tunnel credentials verified',
    'tunnel.credentialsError': 'Tunnel credentials: {error}',
    'tunnel.dns': 'DNS → {hostname}',
    'tunnel.dnsError': 'DNS: {error}',
    'tunnel.notFound': 'Tunnel not found — complete setup later',
    'windows.launchersCreated': 'Launcher files created in AppData',
    'windows.shortcutsCreated': 'Desktop and Start menu shortcuts created',
    'windows.autoStartEnabled': 'Auto-start with Windows enabled',
    'windows.unsupported': 'Shortcuts/startup only supported on Windows',
    'tray.background': 'Tray running in background (pid {pid})',
    'tray.error': 'Tray: {error}',
  },
  fa: {
    'ollama.running': 'Ollama در حال اجراست',
    'ollama.starting': 'در حال راه‌اندازی Ollama…',
    'ollama.ready': 'Ollama آماده شد',
    'config.saved': 'ذخیره {path}',
    'model.localVerified': 'مدل محلی تأیید شد',
    'model.ready': 'مدل Ollama آماده است',
    'model.error': 'مدل: {error}',
    'quick.mode': 'حالت لینک موقت trycloudflare',
    'proxy.started': 'Proxy راه‌اندازی شد',
    'quick.link': 'لینک موقت: {url}',
    'quick.baseUrl': 'Base URL برای Cursor: {url}',
    'quick.alreadyRunning': 'Tunnel از قبل در حال اجرا بود',
    'quick.error': 'لینک موقت: {error}',
    'tunnel.file': 'فایل tunnel: {path}',
    'tunnel.credentialsVerified': 'اعتبارنامه tunnel تأیید شد',
    'tunnel.credentialsError': 'اعتبارنامه tunnel: {error}',
    'tunnel.dns': 'DNS → {hostname}',
    'tunnel.dnsError': 'DNS: {error}',
    'tunnel.notFound': 'tunnel پیدا نشد — بعداً setup را کامل کنید',
    'windows.launchersCreated': 'فایل‌های launcher در AppData ساخته شد',
    'windows.shortcutsCreated': 'میانبر دسکتاپ و منوی Start ساخته شد',
    'windows.autoStartEnabled': 'اجرای خودکار با ویندوز فعال شد',
    'windows.unsupported': 'میانبر/startup فقط در Windows پشتیبانی می‌شود',
    'tray.background': 'Tray در پس‌زمینه (pid {pid})',
    'tray.error': 'Tray: {error}',
  },
};

export function resolveLang(lang) {
  return lang === 'fa' ? 'fa' : 'en';
}

export function t(key, lang = 'en', vars = {}) {
  const dict = INSTALL_MESSAGES[resolveLang(lang)];
  let text = dict[key] || INSTALL_MESSAGES.en[key] || key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
