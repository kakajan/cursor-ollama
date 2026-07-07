import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from './config.mjs';
import { runCommand, fetchOk } from './exec.mjs';
import { getTunnelTemplatePath } from './paths.mjs';

export function parseTunnelYml(content) {
  const tunnelMatch = content.match(/^tunnel:\s*(\S+)/m);
  const credsMatch = content.match(/^credentials-file:\s*(.+)$/m);
  return {
    tunnelId: tunnelMatch?.[1]?.trim() || '',
    credentialsFile: credsMatch?.[1]?.trim() || '',
  };
}

export function readTunnelYml(ymlPath) {
  return parseTunnelYml(fs.readFileSync(ymlPath, 'utf8'));
}

export function tokenToCredentialsJson(token) {
  const data = JSON.parse(Buffer.from(token.trim(), 'base64').toString('utf8'));
  if (!data.a || !data.s || !data.t) {
    throw new Error('Invalid cloudflared tunnel token');
  }

  return `${JSON.stringify(
    {
      AccountTag: data.a,
      TunnelSecret: data.s,
      TunnelID: data.t,
    },
    null,
    2,
  )}\n`;
}

export async function ensureTunnelCredentials(ymlPath) {
  const { tunnelId, credentialsFile } = readTunnelYml(ymlPath);
  if (!credentialsFile) {
    throw new Error(`Tunnel config missing credentials-file: ${ymlPath}`);
  }

  if (fs.existsSync(credentialsFile)) {
    return credentialsFile;
  }

  if (!tunnelId) {
    throw new Error(`Tunnel config missing tunnel id: ${ymlPath}`);
  }

  const { code, stdout, stderr } = await runCommand('cloudflared', ['tunnel', 'token', tunnelId], {
    allowFail: true,
  });
  const token = stdout.trim();
  if (code !== 0 || !token) {
    throw new Error(
      `Missing tunnel credentials: ${credentialsFile}\n` +
        `Run: cloudflared tunnel login && cloudflared tunnel create <name>\n` +
        `Or: cursor-ollama setup\n` +
        (stderr.trim() ? `cloudflared: ${stderr.trim()}` : ''),
    );
  }

  fs.mkdirSync(path.dirname(credentialsFile), { recursive: true });
  fs.writeFileSync(credentialsFile, tokenToCredentialsJson(token), 'utf8');
  return credentialsFile;
}

export function getTunnelYmlPath(config) {
  const standard = `${config.cloudflaredDir}/${config.tunnelName}-tunnel.yml`;
  if (fs.existsSync(standard)) return standard;

  const legacy = `${config.cloudflaredDir}/${config.tunnelName}.yml`;
  if (fs.existsSync(legacy)) return legacy;

  return standard;
}

export function parseTunnelList(stdout = '') {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('ID') && !line.startsWith('You can'))
    .map((line) => {
      const parts = line.split(/\s+/);
      return { id: parts[0], name: parts[1] };
    })
    .filter((entry) => entry.id && entry.name);
}

export function findTunnelEntry(tunnelListStdout, tunnelName) {
  return parseTunnelList(tunnelListStdout).find((entry) => entry.name === tunnelName) || null;
}

export function findTunnelId(tunnelListStdout, tunnelName) {
  return findTunnelEntry(tunnelListStdout, tunnelName)?.id || '';
}

export function tunnelExistsInList(tunnelListStdout, tunnelName) {
  return Boolean(findTunnelEntry(tunnelListStdout, tunnelName));
}

export async function listCloudflaredTunnels() {
  try {
    const result = await runCommand('cloudflared', ['tunnel', 'list']);
    return result.stdout;
  } catch {
    return '';
  }
}

export function renderTunnelConfig(template, values) {
  return template
    .replace(/\{\{TUNNEL_ID\}\}/g, values.tunnelId)
    .replace(/\{\{CREDENTIALS_FILE\}\}/g, values.credentialsFile.replace(/\\/g, '/'))
    .replace(/\{\{TUNNEL_HOSTNAME\}\}/g, values.tunnelHostname)
    .replace(/\{\{PROXY_PORT\}\}/g, String(values.proxyPort));
}

export async function syncTunnelConfigFile(config) {
  fs.mkdirSync(config.cloudflaredDir, { recursive: true });
  const tunnelList = await listCloudflaredTunnels();

  if (!tunnelExistsInList(tunnelList, config.tunnelName)) {
    return { updated: false, reason: 'tunnel-not-found' };
  }

  const tunnelId = findTunnelId(tunnelList, config.tunnelName);
  const credentialsFile = `${config.cloudflaredDir}/${tunnelId}.json`;
  const tunnelYml = getTunnelYmlPath(config);
  const template = fs.readFileSync(getTunnelTemplatePath(), 'utf8');

  fs.writeFileSync(
    tunnelYml,
    renderTunnelConfig(template, {
      tunnelId,
      credentialsFile,
      tunnelHostname: config.tunnelHostname,
      proxyPort: config.proxyPort,
    }),
    'utf8',
  );

  return { updated: true, path: tunnelYml };
}

export async function routeTunnelDns(config, { force = false } = {}) {
  const args = force
    ? ['tunnel', 'route', 'dns', '-f', config.tunnelName, config.tunnelHostname]
    : ['tunnel', 'route', 'dns', config.tunnelName, config.tunnelHostname];
  await runCommand('cloudflared', args, { allowFail: true, inherit: true });
}

export function assertTunnelConfig(config) {
  const yml = getTunnelYmlPath(config);
  if (!fs.existsSync(yml)) {
    throw new Error(
      `Tunnel config not found: ${yml}\nRun: cursor-ollama setup (or cloudflared tunnel create + setup)`,
    );
  }
  return yml;
}

export async function prepareTunnelConfig(config) {
  const yml = assertTunnelConfig(config);
  await ensureTunnelCredentials(yml);
  return yml;
}

export async function installTunnelService(config) {
  const yml = await prepareTunnelConfig(config);
  console.log(`Installing cloudflared service from ${yml} ...`);
  await runCommand('cloudflared', ['--config', yml, 'service', 'install'], {
    allowFail: true,
    inherit: true,
  });
}

export async function uninstallTunnelService(config) {
  const yml = getTunnelYmlPath(config);
  if (!fs.existsSync(yml)) {
    return { removed: false };
  }

  await runCommand('cloudflared', ['--config', yml, 'service', 'uninstall'], {
    allowFail: true,
    inherit: true,
  });
  return { removed: true, configPath: yml };
}

export async function runTunnelForeground(config) {
  const yml = await prepareTunnelConfig(config);
  console.log(`Running tunnel in foreground (${config.tunnelHostname} → proxy :${config.proxyPort})`);
  console.log(`Config: ${yml}`);
  console.log('Press Ctrl+C to stop.\n');
  await runCommand('cloudflared', ['--config', yml, 'tunnel', 'run'], { inherit: true });
}

export async function printTunnelInfo(config) {
  const yml = getTunnelYmlPath(config);
  const exists = fs.existsSync(yml);

  console.log('Cloudflare Tunnel');
  console.log(`  Name:     ${config.tunnelName}`);
  console.log(`  Hostname: https://${config.tunnelHostname}`);
  console.log(`  Config:   ${yml}${exists ? '' : ' (missing — run cursor-ollama setup)'}`);
  console.log(`  Target:   http://127.0.0.1:${config.proxyPort} (proxy, not Ollama directly)`);
  console.log('');
  console.log('Run tunnel:');
  console.log('  cursor-ollama tunnel run          # foreground (dev)');
  console.log('  cursor-ollama tunnel install      # OS service (production)');
  console.log('');
  console.log('Manual:');
  console.log(`  cloudflared --config "${yml}" tunnel run`);

  if (exists) {
    try {
      await fetchOk(`https://${config.tunnelHostname}/health`);
      console.log('\nStatus: tunnel /health responds over HTTPS');
    } catch {
      console.log('\nStatus: tunnel /health not reachable (run proxy + tunnel)');
    }
  }
}

export function loadTunnelConfig(options = {}) {
  return loadConfig(options);
}
