import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function loadSysTray() {
  const mod = require('systray2');
  let SysTray = mod;

  if (typeof SysTray !== 'function') {
    SysTray = mod.default;
  }
  if (typeof SysTray !== 'function' && SysTray?.default) {
    SysTray = SysTray.default;
  }
  if (typeof SysTray !== 'function') {
    throw new Error(
      'Failed to load systray2. Update cursor-ollama: npm i -g cursor-ollama@latest',
    );
  }

  return SysTray;
}

export const TRAY_SEPARATOR = {
  title: '<SEPARATOR>',
  tooltip: '',
  enabled: true,
};
