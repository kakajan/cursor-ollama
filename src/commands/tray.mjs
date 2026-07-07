import fs from 'node:fs';
import os from 'node:os';
import { showCursorConfig } from '../lib/cursor-block.mjs';
import { copyTunnelUrl, openConfigFile, openSettingsPage, refreshQuickTunnel } from '../lib/settings-ui.mjs';
import { openAboutPage } from '../lib/about-ui.mjs';
import { loadConfig, getAuthKey } from '../lib/config.mjs';
import { isQuickTunnelMode } from '../lib/quick-tunnel.mjs';
import {
  activateMapping,
  formatMappingLabel,
  isActiveMapping,
  listMappings,
  setOllamaBackend,
} from '../lib/models-map.mjs';
import { modelNameMatches, listLocalModels } from '../lib/ollama.mjs';
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
import { prepareTunnelConfig } from '../lib/tunnel.mjs';
import { loadSysTray, TRAY_SEPARATOR } from '../lib/systray-loader.mjs';
import {
  acquireTrayPid,
  isTrayRunning,
  releaseTrayPid,
  spawnTrayBackground,
} from '../lib/tray-daemon.mjs';

const CHECK = '✓ ';

function menuItem(title, enabled = true, checked = false) {
  return {
    title,
    tooltip: title.replace(/^✓ /, ''),
    checked,
    enabled,
  };
}

function mappingMenuTitle(mapping, active) {
  const label = formatMappingLabel(mapping);
  return active ? `${CHECK}${label}` : label;
}

function ollamaMenuTitle(name, active) {
  return active ? `${CHECK}Ollama: ${name}` : `Ollama: ${name}`;
}

async function buildMenu(statusText, options, clickHandlers) {
  clickHandlers.clear();

  const iconPath = getTrayIconPath();
  if (!fs.existsSync(iconPath)) {
    throw new Error(`Tray icon not found: ${iconPath}`);
  }

  const config = loadConfig(options);
  const mappings = listMappings(config, options);
  const localModels = await listLocalModels(config.ollamaPort);
  const items = [
    menuItem('Start all'),
    menuItem('Stop all'),
    TRAY_SEPARATOR,
    menuItem('Start proxy'),
    menuItem('Stop proxy'),
    menuItem('Start tunnel'),
    menuItem('Stop tunnel'),
    TRAY_SEPARATOR,
  ];

  for (const mapping of mappings) {
    const active = isActiveMapping(config, mapping);
    const title = mappingMenuTitle(mapping, active);
    const handler = async () => {
      activateMapping(loadConfig(options), mapping.cursorName, mapping.ollamaName, options);
    };
    clickHandlers.set(title, handler);
    clickHandlers.set(title.replace(CHECK, ''), handler);
    items.push(menuItem(title, true, active));
  }

  if (localModels.length > 0) {
    items.push(TRAY_SEPARATOR);
    for (const name of localModels) {
      const active = modelNameMatches([name], config.ollamaSourceModel);
      const title = ollamaMenuTitle(name, active);
      const handler = async () => {
        setOllamaBackend(loadConfig(options), name, options);
      };
      clickHandlers.set(title, handler);
      clickHandlers.set(title.replace(CHECK, ''), handler);
      items.push(menuItem(title, true, active));
    }
  }

  items.push(
    TRAY_SEPARATOR,
    menuItem('Copy tunnel URL'),
    ...(isQuickTunnelMode(config) ? [menuItem('Refresh quick tunnel')] : []),
    menuItem('Settings…'),
    menuItem('Open config file'),
    menuItem('Show Cursor config'),
    menuItem('About…'),
    TRAY_SEPARATOR,
    menuItem('Exit'),
  );

  const modelHint = `${config.cursorModelName} → ${config.ollamaSourceModel}`;

  return {
    icon: iconPath,
    isTemplateIcon: os.platform() === 'darwin',
    title: '',
    tooltip: `cursor-ollama | ${statusText} | ${modelHint}`,
    items,
  };
}

async function refreshTray(systray, options, clickHandlers) {
  const status = await getStackStatus(options);
  await systray.sendAction({
    type: 'update-menu',
    menu: await buildMenu(formatStackStatus(status), options, clickHandlers),
  });
  return status;
}

function resolveClickHandler(clickHandlers, title) {
  return clickHandlers.get(title) || clickHandlers.get(title.replace(CHECK, ''));
}

export async function runTray(options = {}) {
  if (!options.foreground) {
    const { running, pid } = isTrayRunning();
    if (running) {
      console.log(`Tray already running (pid ${pid}).`);
      return;
    }

    const childPid = spawnTrayBackground(options);
    console.log(`Tray started in background (pid ${childPid}).`);
    console.log('You can close this terminal. Use tray menu Exit to quit.');
    return;
  }

  const SysTray = loadSysTray();
  const config = loadConfig(options);
  const lock = acquireTrayPid();
  if (!lock.acquired) {
    console.log(`Tray already running (pid ${lock.pid}).`);
    return;
  }

  try {
    if (!isQuickTunnelMode(config)) {
      await prepareTunnelConfig(config);
    }
  } catch (err) {
    console.error(`Tunnel config: ${err.message}`);
  }

  let systray;
  let exiting = false;
  let timer;
  const clickHandlers = new Map();

  const shutdown = async () => {
    releaseTrayPid();
  };

  try {
    const initialStatus = await getStackStatus(options);
    systray = new SysTray({
      menu: await buildMenu(formatStackStatus(initialStatus), options, clickHandlers),
      debug: false,
      copyDir: true,
    });

    await systray.ready();
  } catch (err) {
    await shutdown();
    console.error(`Tray failed to start: ${err.message}`);
    console.error('If using global install: npm i -g cursor-ollama@latest');
    console.error('Or run from repo: node bin/cursor-ollama.mjs tray');
    process.exit(1);
  }

  systray.onError(async (err) => {
    if (timer) clearInterval(timer);
    await shutdown();
    console.error(err);
    process.exit(1);
  });

  await systray.onClick(async (action) => {
    if (exiting) return;

    const title = action.item.title;

    try {
      const mappingHandler = resolveClickHandler(clickHandlers, title);
      if (mappingHandler) {
        await mappingHandler();
        await refreshTray(systray, options, clickHandlers);
        return;
      }

      switch (title) {
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
          const cfg = loadConfig(options);
          await showCursorConfig(cfg, getAuthKey(cfg, null));
          break;
        }
        case 'Copy tunnel URL':
          await copyTunnelUrl(options, 'base');
          break;
        case 'Refresh quick tunnel':
          await refreshQuickTunnel(options);
          break;
        case 'Settings…':
          await openSettingsPage();
          break;
        case 'Open config file':
          openConfigFile();
          break;
        case 'About…':
          await openAboutPage();
          break;
        case 'Exit':
          exiting = true;
          if (timer) clearInterval(timer);
          await stopAllStack();
          await systray.kill(false);
          await shutdown();
          process.exit(0);
          return;
        default:
          break;
      }
    } catch (err) {
      await systray.sendAction({
        type: 'update-menu',
        menu: await buildMenu(`error: ${err.message}`, options, clickHandlers),
      });
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    await refreshTray(systray, options, clickHandlers);
  });

  timer = setInterval(() => {
    refreshTray(systray, options, clickHandlers).catch(() => {});
  }, 5000);

  process.on('SIGINT', async () => {
    exiting = true;
    if (timer) clearInterval(timer);
    await stopAllStack();
    await systray.kill(false);
    await shutdown();
    process.exit(0);
  });
}
