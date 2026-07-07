import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function loadSysTray() {
  const mod = require('systray2');
  const SysTray = mod.default || mod;
  if (typeof SysTray !== 'function') {
    throw new Error('Failed to load systray2. Try: npm i -g cursor-ollama@latest');
  }
  return SysTray;
}

export const TRAY_SEPARATOR = {
  title: '<SEPARATOR>',
  tooltip: '',
  enabled: true,
};
