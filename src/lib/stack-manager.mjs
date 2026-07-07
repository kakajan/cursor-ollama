import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import { getAuthKey, loadConfig } from './config.mjs';
import { commandExists, fetchOk } from './exec.mjs';
import { getModelsMapPath, getProxyServerPath } from './paths.mjs';
import { assertTunnelConfig, getTunnelYmlPath } from './tunnel.mjs';

const state = {
  proxy: null,
  tunnel: null,
};

function waitForPort(port, timeoutMs = 8000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const socket = net.connect(port, '127.0.0.1');
      socket.on('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
          return;
        }
        setTimeout(tryOnce, 250);
      });
    };
    tryOnce();
  });
}

function stopProcess(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      shell: true,
      stdio: 'ignore',
    });
  } else {
    child.kill('SIGTERM');
  }
}

function attachLogging(child, label) {
  child.stdout?.on('data', (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });
  child.on('exit', () => {
    if (state.proxy === child) state.proxy = null;
    if (state.tunnel === child) state.tunnel = null;
  });
}

export function isProxyManagedRunning() {
  return Boolean(state.proxy && state.proxy.exitCode === null);
}

export function isTunnelManagedRunning() {
  return Boolean(state.tunnel && state.tunnel.exitCode === null);
}

export async function getStackStatus(options = {}) {
  const config = loadConfig(options);
  const authKey = getAuthKey(config, null);
  let proxyUp = isProxyManagedRunning();
  let tunnelUp = isTunnelManagedRunning();

  if (!proxyUp) {
    try {
      await fetchOk(`http://127.0.0.1:${config.proxyPort}/v1/models`, {
        headers: { Authorization: `Bearer ${authKey}` },
      });
      proxyUp = true;
    } catch {
      proxyUp = false;
    }
  }

  if (!tunnelUp && config.tunnelHostname) {
    try {
      await fetchOk(`https://${config.tunnelHostname}/v1/models`, {
        headers: { Authorization: `Bearer ${authKey}` },
      });
      tunnelUp = true;
    } catch {
      tunnelUp = false;
    }
  }

  return { config, proxyUp, tunnelUp };
}

export async function startProxyStack(options = {}) {
  if (isProxyManagedRunning()) {
    return { alreadyRunning: true };
  }

  const config = loadConfig(options);
  const mapPath = getModelsMapPath(options.local);
  if (!fs.existsSync(mapPath)) {
    throw new Error(`Missing models map: ${mapPath}. Run cursor-ollama init && setup first.`);
  }

  const child = spawn(process.execPath, [getProxyServerPath()], {
    env: { ...process.env, MODELS_MAP_PATH: mapPath },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  attachLogging(child, 'proxy');
  state.proxy = child;
  await waitForPort(config.proxyPort);
  return { started: true };
}

export async function stopProxyStack() {
  stopProcess(state.proxy);
  state.proxy = null;
}

export async function startTunnelStack(options = {}) {
  if (isTunnelManagedRunning()) {
    return { alreadyRunning: true };
  }

  if (!(await commandExists('cloudflared'))) {
    throw new Error('cloudflared not found in PATH');
  }

  const config = loadConfig(options);
  const yml = assertTunnelConfig(config);
  const child = spawn('cloudflared', ['--config', yml, 'tunnel', 'run'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    shell: process.platform === 'win32',
  });

  attachLogging(child, 'tunnel');
  state.tunnel = child;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return { started: true, configPath: yml };
}

export async function stopTunnelStack() {
  stopProcess(state.tunnel);
  state.tunnel = null;
}

export async function startAllStack(options = {}) {
  await startProxyStack(options);
  await startTunnelStack(options);
}

export async function stopAllStack() {
  await stopTunnelStack();
  await stopProxyStack();
}

export function formatStackStatus(status) {
  const proxy = status.proxyUp ? 'on' : 'off';
  const tunnel = status.tunnelUp ? 'on' : 'off';
  return `proxy: ${proxy} | tunnel: ${tunnel}`;
}

export { getTunnelYmlPath };
