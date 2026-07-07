import fs from 'node:fs';
import { loadConfig } from './config.mjs';
import { runCommand, fetchOk } from './exec.mjs';

export function getTunnelYmlPath(config) {
  return `${config.cloudflaredDir}/${config.tunnelName}-tunnel.yml`;
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

export async function installTunnelService(config) {
  const yml = assertTunnelConfig(config);
  console.log(`Installing cloudflared service from ${yml} ...`);
  await runCommand('cloudflared', ['--config', yml, 'service', 'install'], {
    allowFail: true,
    inherit: true,
  });
}

export async function runTunnelForeground(config) {
  const yml = assertTunnelConfig(config);
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
      await fetchOk(`https://${config.tunnelHostname}/`, { method: 'HEAD' });
      console.log('\nStatus: tunnel hostname responds over HTTPS');
    } catch {
      console.log('\nStatus: tunnel hostname not reachable (tunnel or proxy may be stopped)');
    }
  }
}

export function loadTunnelConfig(options = {}) {
  return loadConfig(options);
}
