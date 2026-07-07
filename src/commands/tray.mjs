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
  getActiveMapping,
  isActiveMapping,
  listMappings,
  setOllamaBackend,
} from '../lib/models-map.mjs';
import { listLocalModels } from '../lib/ollama.mjs';
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

function menuItem(title, { enabled = true, checked = false } = {}) {
  return {
    title,
    tooltip: title,
    checked,
    enabled,
  };
}

function createTrayState() {
  return {
    menu: null,
    stackControlItems: [],
    modelItems: [],
    lastLocalModels: [],
  };
}

/** One row per scope; label flips between Start and Stop from live stack status. */
export function stackControlTitle(scope, status) {
  switch (scope) {
    case 'all':
      return status.proxyUp || status.tunnelUp ? 'Stop all' : 'Start all';
    case 'proxy':
      return status.proxyUp ? 'Stop proxy' : 'Start proxy';
    case 'tunnel':
      return status.tunnelUp ? 'Stop tunnel' : 'Start tunnel';
    default:
      throw new Error(`Unknown stack control scope: ${scope}`);
  }
}

export async function applyStackControlItems(systray, trayState, status) {
  for (const entry of trayState.stackControlItems) {
    const title = stackControlTitle(entry.scope, status);
    if (entry.item.title === title) {
      continue;
    }

    entry.item.title = title;
    entry.item.tooltip = title;
    await systray.sendAction({
      type: 'update-item',
      item: entry.item,
      seq_id: entry.seqId,
    });
  }
}

function modelTooltip(statusText, config, options) {
  const active = getActiveMapping(config, options);
  return `cursor-ollama | ${statusText} | ${active.cursorName} → ${active.ollamaName}`;
}

function localModelsChanged(previous, next) {
  return (
    previous.length !== next.length || next.some((name, index) => name !== previous[index])
  );
}

function modelEntryId(entry) {
  if (entry.type === 'mapping') {
    return `mapping:${entry.mapping.cursorName}\u0000${entry.mapping.ollamaName}`;
  }
  return `ollama:${entry.name}`;
}

function modelEntryTitle(entry) {
  return entry.type === 'mapping'
    ? formatMappingLabel(entry.mapping)
    : `Ollama: ${entry.name}`;
}

/** Radio-style selection: at most one model row checked (mapping wins over Ollama row). */
export function getSelectedModelSeqId(config, options, modelItems) {
  for (const entry of modelItems) {
    if (entry.type === 'mapping' && isActiveMapping(config, entry.mapping, options)) {
      return modelEntryId(entry);
    }
  }

  const active = getActiveMapping(config, options);
  for (const entry of modelItems) {
    if (entry.type === 'ollama' && entry.name === active.ollamaName) {
      return modelEntryId(entry);
    }
  }

  return null;
}

export function isModelMenuItemChecked(config, options, modelItems, entry) {
  const selectedSeqId = getSelectedModelSeqId(config, options, modelItems);
  return selectedSeqId != null && modelEntryId(entry) === selectedSeqId;
}

/**
 * Push title/check changes to the tray via update-item.
 *
 * The tray binary ignores menu items on update-menu, so per-item updates with
 * an explicit seq_id (item index, separators included) are the only way to
 * change rows after the menu is created.
 */
export async function applyModelSelection(systray, options, trayState) {
  const config = loadConfig(options);
  const mappings = listMappings(config, options);

  const mappingEntries = trayState.modelItems.filter((entry) => entry.type === 'mapping');
  mappingEntries.forEach((entry, index) => {
    if (mappings[index]) {
      entry.mapping = mappings[index];
    }
  });

  for (const entry of trayState.modelItems) {
    const title = modelEntryTitle(entry);
    const checked = isModelMenuItemChecked(config, options, trayState.modelItems, entry);
    if (entry.item.checked === checked && entry.item.title === title) {
      continue;
    }

    entry.item.title = title;
    entry.item.tooltip = title;
    entry.item.checked = checked;
    await systray.sendAction({
      type: 'update-item',
      item: entry.item,
      seq_id: entry.seqId,
    });
  }
}

async function buildMenu(status, options, trayState) {
  const iconPath = getTrayIconPath();
  if (!fs.existsSync(iconPath)) {
    throw new Error(`Tray icon not found: ${iconPath}`);
  }

  const config = loadConfig(options);
  const mappings = listMappings(config, options);
  const localModels = await listLocalModels(config.ollamaPort);
  const statusText = formatStackStatus(status);

  trayState.stackControlItems = [];
  trayState.modelItems = [];
  trayState.lastLocalModels = [...localModels];

  const items = [];
  for (const scope of ['all', 'proxy', 'tunnel']) {
    const item = menuItem(stackControlTitle(scope, status));
    trayState.stackControlItems.push({ scope, item, seqId: -1 });
    items.push(item);
  }
  items.push(TRAY_SEPARATOR);

  for (const mapping of mappings) {
    const item = menuItem(formatMappingLabel(mapping));
    trayState.modelItems.push({ type: 'mapping', mapping, item, seqId: -1 });
    items.push(item);
  }

  if (localModels.length > 0) {
    items.push(TRAY_SEPARATOR);
    for (const name of localModels) {
      const item = menuItem(`Ollama: ${name}`);
      trayState.modelItems.push({ type: 'ollama', name, item, seqId: -1 });
      items.push(item);
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

  for (const entry of trayState.stackControlItems) {
    entry.seqId = items.indexOf(entry.item);
  }

  for (const entry of trayState.modelItems) {
    // seq_id is the item's index in the flat items list (separators count).
    entry.seqId = items.indexOf(entry.item);
    entry.item.checked = isModelMenuItemChecked(
      config,
      options,
      trayState.modelItems,
      entry,
    );
  }

  return {
    icon: iconPath,
    isTemplateIcon: os.platform() === 'darwin',
    title: '',
    tooltip: modelTooltip(statusText, config, options),
    items,
  };
}

async function updateTooltip(systray, options, trayState, statusText) {
  const config = loadConfig(options);
  trayState.menu.tooltip = modelTooltip(statusText, config, options);
  await systray.sendAction({
    type: 'update-menu',
    menu: trayState.menu,
    preserveIds: true,
  });
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

  let systray = null;
  let exiting = false;
  let restarting = false;
  let timer;
  const trayState = createTrayState();

  const shutdown = async () => {
    releaseTrayPid();
  };

  const onSystrayError = async (err) => {
    if (exiting || restarting) return;
    if (timer) clearInterval(timer);
    await shutdown();
    console.error(err);
    process.exit(1);
  };

  const handleClick = async (action) => {
    if (exiting) return;

    const clickedTitle = action.item?.title ?? '';
    const clickedModel = trayState.modelItems.find(
      (entry) => entry.item.title === clickedTitle,
    );
    if (clickedModel) {
      try {
        if (clickedModel.type === 'mapping') {
          activateMapping(
            loadConfig(options),
            clickedModel.mapping.cursorName,
            clickedModel.mapping.ollamaName,
            options,
          );
        } else {
          setOllamaBackend(loadConfig(options), clickedModel.name, options);
        }
        await applyModelSelection(systray, options, trayState);
        const status = await getStackStatus(options);
        await updateTooltip(systray, options, trayState, formatStackStatus(status));
      } catch (err) {
        await updateTooltip(systray, options, trayState, `error: ${err.message}`).catch(
          () => {},
        );
      }
      return;
    }

    try {
      switch (clickedTitle) {
        case 'Start all':
          await startAllStack(options);
          break;
        case 'Stop all':
          await stopAllStack(options);
          break;
        case 'Start proxy':
          await startProxyStack(options);
          break;
        case 'Stop proxy':
          await stopProxyStack(options);
          break;
        case 'Start tunnel':
          await startTunnelStack(options);
          break;
        case 'Stop tunnel':
          await stopTunnelStack(options);
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
          await stopAllStack(options);
          await systray.kill(false);
          await shutdown();
          process.exit(0);
          return;
        default:
          break;
      }
      const status = await getStackStatus(options);
      await applyStackControlItems(systray, trayState, status);
      await updateTooltip(systray, options, trayState, formatStackStatus(status));
    } catch (err) {
      await updateTooltip(systray, options, trayState, `error: ${err.message}`).catch(
        () => {},
      );
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  };

  const startSystray = async (status) => {
    trayState.menu = await buildMenu(status, options, trayState);
    systray = new SysTray({
      menu: trayState.menu,
      debug: false,
      copyDir: true,
    });
    trayState.systray = systray;
    await systray.ready();
    systray.onError(onSystrayError);
    await systray.onClick(handleClick);
  };

  const refreshMenu = async () => {
    if (exiting || restarting || !systray) return;

    const status = await getStackStatus(options);
    const statusText = formatStackStatus(status);
    const cfg = loadConfig(options);
    const localModels = await listLocalModels(cfg.ollamaPort);

    // The tray binary can't add/remove rows at runtime, so a changed model
    // list requires respawning the tray process with a fresh menu.
    if (localModelsChanged(trayState.lastLocalModels, localModels)) {
      restarting = true;
      try {
        await systray.kill(false);
        await startSystray(status);
      } finally {
        restarting = false;
      }
      return;
    }

    await applyStackControlItems(systray, trayState, status);
    await applyModelSelection(systray, options, trayState);
    await updateTooltip(systray, options, trayState, statusText);
  };

  try {
    const initialStatus = await getStackStatus(options);
    await startSystray(initialStatus);
  } catch (err) {
    await shutdown();
    console.error(`Tray failed to start: ${err.message}`);
    console.error('If using global install: npm i -g cursor-ollama@latest');
    console.error('Or run from repo: node bin/cursor-ollama.mjs tray');
    process.exit(1);
  }

  timer = setInterval(() => {
    refreshMenu().catch(() => {});
  }, 5000);

  process.on('SIGINT', async () => {
    exiting = true;
    if (timer) clearInterval(timer);
    await stopAllStack(options);
    await systray.kill(false);
    await shutdown();
    process.exit(0);
  });
}
