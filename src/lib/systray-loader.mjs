import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function rebuildMenuItemIds(tray, menu) {
  tray.internalIdMap = new Map();
  const counter = { id: 1 };

  const walk = (item) => {
    const id = counter.id++;
    tray.internalIdMap.set(id, item);
    item.__id = id;
    if (item.items) {
      item.items.forEach(walk);
    }
  };

  menu.items.forEach(walk);
}

export function loadSysTray() {
  const mod = require('systray2');
  let BaseSysTray = mod;

  if (typeof BaseSysTray !== 'function') {
    BaseSysTray = mod.default;
  }
  if (typeof BaseSysTray !== 'function' && BaseSysTray?.default) {
    BaseSysTray = BaseSysTray.default;
  }
  if (typeof BaseSysTray !== 'function') {
    throw new Error(
      'Failed to load systray2. Update cursor-ollama: npm i -g cursor-ollama@latest',
    );
  }

  class PatchedSysTray extends BaseSysTray {
    async sendAction(action) {
      const preserveIds = action.preserveIds === true;
      if (
        (action.type === 'update-menu' || action.type === 'update-menu-and-item') &&
        !preserveIds
      ) {
        rebuildMenuItemIds(this, action.menu);
      }
      const payload = { ...action };
      delete payload.preserveIds;
      return super.sendAction(payload);
    }
  }

  return PatchedSysTray;
}

export const TRAY_SEPARATOR = {
  title: '<SEPARATOR>',
  tooltip: '',
  enabled: true,
};
