import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { loadConfig, saveConfig, generateAuthKey } from '../lib/config.mjs';
import { writeModelsMap } from '../lib/models-map.mjs';
import { runDoctor } from './doctor.mjs';
import { runVerify } from './verify.mjs';
import { runCommand, fetchOk, sleep, WINDOWS_SERVICE_HINT, isWindowsAdmin } from '../lib/exec.mjs';
import { getConfigPath, getTunnelTemplatePath } from '../lib/paths.mjs';
import { installProxyService } from '../lib/platform/index.mjs';
import { ensureModelAvailable } from '../lib/ollama.mjs';
import {
  findTunnelId,
  listCloudflaredTunnels,
  routeTunnelDns,
  tunnelExistsInList,
  ensureTunnelCredentials,
} from '../lib/tunnel.mjs';

function renderTunnelConfig(template, values) {
  return template
    .replace(/\{\{TUNNEL_ID\}\}/g, values.tunnelId)
    .replace(/\{\{CREDENTIALS_FILE\}\}/g, values.credentialsFile.replace(/\\/g, '/'))
    .replace(/\{\{TUNNEL_HOSTNAME\}\}/g, values.tunnelHostname)
    .replace(/\{\{PROXY_PORT\}\}/g, String(values.proxyPort));
}

async function ensureOllama(config) {
  try {
    await fetchOk(`http://127.0.0.1:${config.ollamaPort}/api/tags`);
    return;
  } catch {
    console.log('Starting Ollama...');
    await runCommand('ollama', ['serve'], { allowFail: true });
    await sleep(3000);
    await fetchOk(`http://127.0.0.1:${config.ollamaPort}/api/tags`);
  }
}

async function waitForTunnel(config, tunnelList = '') {
  const rl = readline.createInterface({ input, output });
  try {
    console.log('\nRun once: cloudflared tunnel login');
    console.log(`Then:     cloudflared tunnel create ${config.tunnelName}`);
    if (tunnelList.trim()) {
      console.log('\nExisting tunnels:');
      console.log(tunnelList.trim());
      console.log(`\nIf your tunnel uses a different name, run: cursor-ollama init`);
    }
    console.log('');
    await rl.question('Press Enter after tunnel is created...');
  } finally {
    rl.close();
  }
}

export async function runSetup(options = {}) {
  const ok = await runDoctor();
  if (!ok) {
    throw new Error('Prerequisites missing. Run cursor-ollama doctor for details.');
  }

  let config = loadConfig({ local: options.local });

  if (!options.local && !fs.existsSync(getConfigPath())) {
    console.warn('No ~/.cursor-ollama/config.json found — run cursor-ollama init for tunnel hostname and model names.');
    console.warn('Continuing with defaults for now...\n');
  }

  if (!config.ollamaAuthKey) {
    config.ollamaAuthKey = generateAuthKey();
    config = saveConfig(config);
  }

  console.log('Checking Ollama...');
  await ensureOllama(config);

  await ensureModelAvailable(config, {
    skipPull: options.skipPull === true || config.skipModelPull === true,
    inherit: true,
  });

  const { mapPath } = writeModelsMap(config, { local: options.local });
  console.log(`Wrote ${mapPath}`);

  if (!options.skipService) {
    if (process.platform === 'win32' && !(await isWindowsAdmin())) {
      console.log('Skipping proxy service install (Administrator required).');
      console.log(WINDOWS_SERVICE_HINT);
    } else {
      console.log('Installing proxy service...');
      try {
        await installProxyService(config);
      } catch (err) {
        console.warn(`Proxy service install failed: ${err.message}`);
        if (process.platform === 'win32') {
          console.warn(WINDOWS_SERVICE_HINT);
        } else {
          console.warn('You can run: cursor-ollama proxy start');
        }
      }
    }
  }

  if (!options.skipTunnel) {
    fs.mkdirSync(config.cloudflaredDir, { recursive: true });

    let tunnelList = await listCloudflaredTunnels();

    if (!tunnelExistsInList(tunnelList, config.tunnelName)) {
      await waitForTunnel(config, tunnelList);
      tunnelList = await listCloudflaredTunnels();
    }

    const tunnelId = findTunnelId(tunnelList, config.tunnelName);
    if (!tunnelId) {
      throw new Error(`Could not find tunnel named ${config.tunnelName}`);
    }

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
      'utf8'
    );
    console.log(`Wrote tunnel config: ${tunnelYml}`);

    await ensureTunnelCredentials(tunnelYml);

    await routeTunnelDns(config, { force: true });

    console.log('Installing cloudflared service...');
    if (process.platform === 'win32' && !(await isWindowsAdmin())) {
      console.log('Skipping cloudflared service install (Administrator required).');
      console.log(`Run manually: cursor-ollama tunnel run`);
    } else {
      await runCommand('cloudflared', ['--config', tunnelYml, 'service', 'install'], {
        allowFail: true,
        inherit: true,
      });
    }
  }

  await runVerify({ local: options.local });
  console.log('Setup complete.');
}
