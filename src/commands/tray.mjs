import os from 'node:os';
import SysTray from 'systray2';
import { printCursorBlock } from '../lib/cursor-block.mjs';
import { loadConfig, getAuthKey } from '../lib/config.mjs';
import {
  formatStackStatus,
  getStackStatus,
  startAllStack,
  startProxyStack,
  startTunnelStack,
  stopAllStack,
  stopProxyStack,
  stopTunnelStack,
} from '../lib/stack-manager.mjs';
import { getTrayIconPath } from '../lib/tray-icon.mjs';

function menuItem(title, enabled = true) {
  return {
    title,
    tooltip: title,
    checked: false,
    enabled,
  };
}

function buildMenu(statusText) {
  return {
    icon: getTrayIconPath(),
    isTemplateIcon: os.platform() === 'darwin',
    title: '',
    tooltip: `cursor-ollama | ${statusText}`,
    items: [
      menuItem('Start all'),
      menuItem('Stop all'),
      SysTray.separator,
      menuItem('Start proxy'),
      menuItem('Stop proxy'),
      menuItem('Start tunnel'),
      menuItem('Stop tunnel'),
      SysTray.separator,
      menuItem('Show Cursor config'),
      SysTray.separator,
      menuItem('Exit'),
    ],
  };
}

async function refreshTray(systray, options) {
  const status = await getStackStatus(options);
  systray.sendAction({
    type: 'update-menu',
    menu: buildMenu(formatStackStatus(status)),
  });
  return status;
}

export async function runTray(options = {}) {
  loadConfig(options);

  let systray;
  let exiting = false;

  const initialStatus = await getStackStatus(options);
  systray = new SysTray({
    menu: buildMenu(formatStackStatus(initialStatus)),
    debug: false,
    copyDir: true,
  });

  systray.onClick(async (action) => {
    if (exiting) return;

    try {
      switch (action.item.title) {
        case 'Start all':
          await startAllStack(options);
          break;
        case 'Stop all':
          await stopAllStack();
          break;
        case 'Start proxy':
          await startProxyStack(options);
          break;
        case 'Stop proxy':
          await stopProxyStack();
          break;
        case 'Start tunnel':
          await startTunnelStack(options);
          break;
        case 'Stop tunnel':
          await stopTunnelStack();
          break;
        case 'Show Cursor config': {
          const config = loadConfig(options);
          printCursorBlock(config, getAuthKey(config, null));
          break;
        }
        case 'Exit':
          exiting = true;
          await stopAllStack();
          systray.kill(false);
          process.exit(0);
          return;
        default:
          break;
      }
    } catch (err) {
      systray.sendAction({
        type: 'update-menu',
        menu: buildMenu(`error: ${err.message}`),
      });
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    await refreshTray(systray, options);
  });

  const timer = setInterval(() => {
    refreshTray(systray, options).catch(() => {});
  }, 5000);

  systray.on('error', (err) => {
    clearInterval(timer);
    console.error(err);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    exiting = true;
    clearInterval(timer);
    await stopAllStack();
    systray.kill(false);
    process.exit(0);
  });
}
