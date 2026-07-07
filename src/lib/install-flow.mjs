import fs from 'node:fs';
import path from 'node:path';
import { DEFAULTS, generateAuthKey, loadConfig, parsePort, saveConfig } from './config.mjs';
import { formatCursorBlockText } from './cursor-block.mjs';
import { runCommand, fetchOk, sleep } from './exec.mjs';
import { writeModelsMap } from './models-map.mjs';
import { ensureModelAvailable } from './ollama.mjs';
import { getConfigDir, getTunnelTemplatePath } from './paths.mjs';
import {
  ensureTunnelCredentials,
  findTunnelId,
  listCloudflaredTunnels,
  renderTunnelConfig,
  routeTunnelDns,
  tunnelExistsInList,
} from './tunnel.mjs';
import { spawnTrayBackground } from './tray-daemon.mjs';
import {
  configureWindowsIntegration,
  writeWindowsLaunchers,
} from './windows-install.mjs';
import { isQuickTunnelMode } from './quick-tunnel.mjs';
import { startProxyStack, startTunnelStack } from './stack-manager.mjs';

function log(lines, text, type = 'ok') {
  lines.push({ text, type });
}

async function ensureOllama(config, lines) {
  try {
    await fetchOk(`http://127.0.0.1:${config.ollamaPort}/api/tags`);
    log(lines, 'Ollama در حال اجراست');
    return;
  } catch {
    log(lines, 'در حال راه‌اندازی Ollama…');
    await runCommand('ollama', ['serve'], { allowFail: true });
    await sleep(3000);
    await fetchOk(`http://127.0.0.1:${config.ollamaPort}/api/tags`);
    log(lines, 'Ollama آماده شد');
  }
}

export async function runInstallFromWizard(input = {}) {
  const lines = [];
  const tunnelMode = input.tunnelMode === 'quick' ? 'quick' : 'named';

  const config = saveConfig({
    tunnelMode,
    tunnelHostname:
      tunnelMode === 'quick' ? '' : input.tunnelHostname || DEFAULTS.tunnelHostname,
    tunnelName: input.tunnelName || DEFAULTS.tunnelName,
    ollamaPort: parsePort(input.ollamaPort, DEFAULTS.ollamaPort, 'Ollama port'),
    proxyPort: parsePort(input.proxyPort, DEFAULTS.proxyPort, 'Proxy port'),
    ollamaSourceModel: input.ollamaSourceModel || DEFAULTS.ollamaSourceModel,
    cursorModelName: input.cursorModelName || DEFAULTS.cursorModelName,
    ollamaAuthKey: generateAuthKey(),
    secureTunnel: true,
    skipModelPull: input.skipModelPull === true,
  });

  log(lines, `ذخیره ${getConfigDir()}\\config.json`);

  const { mapPath } = writeModelsMap(config);
  log(lines, `ذخیره ${mapPath}`);

  await ensureOllama(config, lines);

  try {
    await ensureModelAvailable(config, {
      skipPull: config.skipModelPull,
      inherit: false,
    });
    log(lines, config.skipModelPull ? 'مدل محلی تأیید شد' : 'مدل Ollama آماده است');
  } catch (err) {
    log(lines, `مدل: ${err.message}`, 'err');
  }

  fs.mkdirSync(config.cloudflaredDir, { recursive: true });

  if (isQuickTunnelMode(config)) {
    log(lines, 'حالت لینک موقت trycloudflare');
    try {
      await startProxyStack();
      log(lines, 'Proxy راه‌اندازی شد');
      const quick = await startTunnelStack();
      const latest = loadConfig();
      writeModelsMap(latest);
      log(lines, `لینک موقت: https://${latest.tunnelHostname}`);
      log(lines, `Base URL برای Cursor: https://${latest.tunnelHostname}/v1`);
      if (quick.alreadyRunning) {
        log(lines, 'Tunnel از قبل در حال اجرا بود');
      }
    } catch (err) {
      log(lines, `لینک موقت: ${err.message}`, 'err');
    }
  } else {
    let tunnelList = await listCloudflaredTunnels();

    if (tunnelExistsInList(tunnelList, config.tunnelName)) {
      const tunnelId = findTunnelId(tunnelList, config.tunnelName);
      const creds = `${config.cloudflaredDir}/${tunnelId}.json`;
      const tunnelYml = `${config.cloudflaredDir}/${config.tunnelName}-tunnel.yml`;
      const template = fs.readFileSync(getTunnelTemplatePath(), 'utf8');
      fs.writeFileSync(
        tunnelYml,
        renderTunnelConfig(template, {
          tunnelId,
          credentialsFile: creds,
          tunnelHostname: config.tunnelHostname,
          proxyPort: config.proxyPort,
        }),
        'utf8',
      );
      log(lines, `فایل tunnel: ${tunnelYml}`);

      try {
        await ensureTunnelCredentials(tunnelYml);
        log(lines, 'اعتبارنامه tunnel تأیید شد');
      } catch (err) {
        log(lines, `اعتبارنامه tunnel: ${err.message}`, 'err');
      }

      try {
        await routeTunnelDns(config, { force: true });
        log(lines, `DNS → ${config.tunnelHostname}`);
      } catch (err) {
        log(lines, `DNS: ${err.message}`, 'err');
      }
    } else {
      log(lines, 'tunnel پیدا نشد — بعداً setup را کامل کنید', 'err');
    }
  }

  if (process.platform === 'win32') {
    await writeWindowsLaunchers(config);
    log(lines, 'فایل‌های launcher در AppData ساخته شد');

    const integration = await configureWindowsIntegration({
      createShortcut: input.createShortcut !== false,
      startWithWindows: input.startWithWindows !== false,
    });
    for (const msg of integration.messages) {
      log(lines, msg);
    }
  } else {
    log(lines, 'میانبر/startup فقط در Windows پشتیبانی می‌شود');
  }

  if (input.launchTray !== false) {
    try {
      const pid = spawnTrayBackground();
      log(lines, `Tray در پس‌زمینه (pid ${pid})`);
    } catch (err) {
      log(lines, `Tray: ${err.message}`, 'err');
    }
  }

  return {
    ok: true,
    log: lines,
    cursorBlock: formatCursorBlockText(loadConfig(), config.ollamaAuthKey),
    config: loadConfig(),
  };
}

export async function loadExistingWizardConfig() {
  return loadConfig();
}
