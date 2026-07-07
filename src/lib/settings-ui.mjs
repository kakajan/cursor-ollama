import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { loadConfig, saveConfig } from './config.mjs';
import { copyTextToClipboard } from './cursor-block.mjs';
import { getPublicBaseUrl, getPublicTunnelUrl, isQuickTunnelMode } from './quick-tunnel.mjs';
import { getConfigPath } from './paths.mjs';
import { refreshQuickTunnelStack } from './stack-manager.mjs';
import { startSettingsServer } from './settings-server.mjs';

const execFileAsync = promisify(execFile);

let activeSettingsServer = null;

function openFileInEditor(filePath) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', 'notepad.exe', filePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }).unref();
    return;
  }

  if (process.platform === 'darwin') {
    spawn('open', [filePath], { detached: true, stdio: 'ignore' }).unref();
    return;
  }

  spawn('xdg-open', [filePath], { detached: true, stdio: 'ignore' }).unref();
}

async function openBrowser(url) {
  if (process.platform === 'win32') {
    await execFileAsync('cmd', ['/c', 'start', '', url], { windowsHide: true });
    return;
  }
  if (process.platform === 'darwin') {
    await execFileAsync('open', [url]);
    return;
  }
  await execFileAsync('xdg-open', [url]);
}

export function openConfigFile() {
  const filePath = getConfigPath();
  if (!fs.existsSync(filePath)) {
    saveConfig(loadConfig());
  }
  openFileInEditor(filePath);
  return { filePath };
}

export async function openSettingsPage() {
  if (!activeSettingsServer) {
    activeSettingsServer = await startSettingsServer({
      onClose: () => {
        activeSettingsServer = null;
      },
    });
  }

  await openBrowser(activeSettingsServer.url);
  return { url: activeSettingsServer.url };
}

export async function copyTunnelUrl(options = {}, kind = 'base') {
  const config = loadConfig(options);
  const text =
    kind === 'public' ? getPublicTunnelUrl(config) : getPublicBaseUrl(config);

  if (!text) {
    throw new Error('No tunnel URL yet. Start or refresh the quick tunnel first.');
  }

  await copyTextToClipboard(text);
  return { copied: text, mode: config.tunnelMode || 'named' };
}

export async function refreshQuickTunnel(options = {}) {
  if (!isQuickTunnelMode(loadConfig(options))) {
    throw new Error('Refresh is only available for temporary trycloudflare tunnels');
  }

  const result = await refreshQuickTunnelStack(options);
  const config = loadConfig(options);
  return {
    ...result,
    url: getPublicTunnelUrl(config),
    baseUrl: getPublicBaseUrl(config),
  };
}
