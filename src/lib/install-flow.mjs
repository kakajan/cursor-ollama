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
import { resolveLang, t } from './i18n.mjs';

function log(lines, text, type = 'ok') {
  lines.push({ text, type });
}

async function ensureOllama(config, lines, lang) {
  try {
    await fetchOk(`http://127.0.0.1:${config.ollamaPort}/api/tags`);
    log(lines, t('ollama.running', lang));
    return;
  } catch {
    log(lines, t('ollama.starting', lang));
    await runCommand('ollama', ['serve'], { allowFail: true });
    await sleep(3000);
    await fetchOk(`http://127.0.0.1:${config.ollamaPort}/api/tags`);
    log(lines, t('ollama.ready', lang));
  }
}

export async function runInstallFromWizard(input = {}) {
  const lines = [];
  const lang = resolveLang(input.lang);
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

  log(lines, t('config.saved', lang, { path: `${getConfigDir()}\\config.json` }));

  const { mapPath } = writeModelsMap(config);
  log(lines, t('config.saved', lang, { path: mapPath }));

  await ensureOllama(config, lines, lang);

  try {
    await ensureModelAvailable(config, {
      skipPull: config.skipModelPull,
      inherit: false,
    });
    log(
      lines,
      config.skipModelPull ? t('model.localVerified', lang) : t('model.ready', lang),
    );
  } catch (err) {
    log(lines, t('model.error', lang, { error: err.message }), 'err');
  }

  fs.mkdirSync(config.cloudflaredDir, { recursive: true });

  if (isQuickTunnelMode(config)) {
    log(lines, t('quick.mode', lang));
    try {
      await startProxyStack();
      log(lines, t('proxy.started', lang));
      const quick = await startTunnelStack();
      const latest = loadConfig();
      writeModelsMap(latest);
      log(lines, t('quick.link', lang, { url: `https://${latest.tunnelHostname}` }));
      log(lines, t('quick.baseUrl', lang, { url: `https://${latest.tunnelHostname}/v1` }));
      if (quick.alreadyRunning) {
        log(lines, t('quick.alreadyRunning', lang));
      }
    } catch (err) {
      log(lines, t('quick.error', lang, { error: err.message }), 'err');
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
      log(lines, t('tunnel.file', lang, { path: tunnelYml }));

      try {
        await ensureTunnelCredentials(tunnelYml);
        log(lines, t('tunnel.credentialsVerified', lang));
      } catch (err) {
        log(lines, t('tunnel.credentialsError', lang, { error: err.message }), 'err');
      }

      try {
        await routeTunnelDns(config, { force: true });
        log(lines, t('tunnel.dns', lang, { hostname: config.tunnelHostname }));
      } catch (err) {
        log(lines, t('tunnel.dnsError', lang, { error: err.message }), 'err');
      }
    } else {
      log(lines, t('tunnel.notFound', lang), 'err');
    }
  }

  if (process.platform === 'win32') {
    await writeWindowsLaunchers(config);
    log(lines, t('windows.launchersCreated', lang));

    const integration = await configureWindowsIntegration({
      createShortcut: input.createShortcut !== false,
      startWithWindows: input.startWithWindows !== false,
      lang,
    });
    for (const msg of integration.messages) {
      log(lines, msg);
    }
  } else {
    log(lines, t('windows.unsupported', lang));
  }

  if (input.launchTray !== false) {
    try {
      const pid = spawnTrayBackground();
      log(lines, t('tray.background', lang, { pid }));
    } catch (err) {
      log(lines, t('tray.error', lang, { error: err.message }), 'err');
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
