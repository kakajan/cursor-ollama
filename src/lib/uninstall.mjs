import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from './config.mjs';
import { getConfigDir } from './paths.mjs';
import { stopAllStack } from './stack-manager.mjs';
import { stopTrayDaemon } from './tray-daemon.mjs';
import { getTunnelYmlPath, readTunnelYml, uninstallTunnelService } from './tunnel.mjs';
import { uninstallProxyService } from './platform/index.mjs';
import { removeWindowsIntegration } from './windows-install.mjs';

function log(lines, text, type = 'ok') {
  lines.push({ text, type });
}

function removePath(target, lines, label) {
  try {
    if (!fs.existsSync(target)) return false;
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      fs.rmSync(target, { recursive: true, force: true });
    } else {
      fs.unlinkSync(target);
    }
    log(lines, `Removed ${label}`);
    return true;
  } catch (err) {
    log(lines, `Could not remove ${label}: ${err.message}`, 'err');
    return false;
  }
}

function removeConfigDir(lines) {
  const configDir = getConfigDir();
  const names = ['config.json', 'models.map.json', 'tray.pid', 'proxy.pid', 'tunnel.pid'];
  let removedAny = false;

  for (const name of names) {
    if (removePath(path.join(configDir, name), lines, path.join(configDir, name))) {
      removedAny = true;
    }
  }

  try {
    const entries = fs.readdirSync(configDir);
    if (entries.length === 0) {
      fs.rmdirSync(configDir);
      log(lines, `Removed ${configDir}`);
      removedAny = true;
    }
  } catch {
    // ignore missing dir
  }

  return removedAny;
}

function removeTunnelArtifacts(config, lines) {
  const yml = getTunnelYmlPath(config);
  if (!fs.existsSync(yml)) {
    return;
  }

  const { credentialsFile } = readTunnelYml(fs.readFileSync(yml, 'utf8'));
  removePath(yml, lines, yml);
  if (credentialsFile) {
    removePath(credentialsFile, lines, credentialsFile);
  }
}

export async function runUninstall(options = {}) {
  const lines = [];
  const config = loadConfig(options);

  log(lines, 'Stopping tray…');
  if (stopTrayDaemon()) {
    log(lines, 'Tray stopped');
  } else {
    log(lines, 'Tray was not running');
  }

  log(lines, 'Stopping proxy and tunnel…');
  await stopAllStack();
  log(lines, 'Background stack stopped');

  if (options.removeServices !== false) {
    log(lines, 'Removing proxy service…');
    try {
      await uninstallProxyService();
      log(lines, 'Proxy service removed');
    } catch (err) {
      log(lines, `Proxy service: ${err.message}`, 'err');
    }

    if (!options.keepTunnel) {
      log(lines, 'Removing cloudflared service…');
      try {
        await uninstallTunnelService(config);
        log(lines, 'Cloudflared service removed');
      } catch (err) {
        log(lines, `Cloudflared service: ${err.message}`, 'err');
      }
    }
  }

  if (process.platform === 'win32') {
    log(lines, 'Removing Windows shortcuts and launchers…');
    const removed = await removeWindowsIntegration();
    for (const msg of removed.messages) {
      log(lines, msg);
    }
  }

  if (options.removeTunnelConfig && !options.keepTunnel) {
    log(lines, 'Removing local tunnel config files…');
    removeTunnelArtifacts(config, lines);
  }

  if (!options.keepConfig) {
    log(lines, 'Removing user config…');
    removeConfigDir(lines);
  } else {
    log(lines, 'Kept user config in ~/.cursor-ollama');
  }

  log(lines, 'Uninstall complete');
  return { ok: true, log: lines };
}
