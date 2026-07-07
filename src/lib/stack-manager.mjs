import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { getAuthKey, loadConfig } from './config.mjs';
import {
  CLOUDFLARED_INSTALL_HINT,
  commandExists,
  fetchOk,
  runCommand,
  resolveExecutable,
  sleep,
  spawnBackground,
} from './exec.mjs';
import { getConfigDir, getModelsMapPath, getProxyServerPath } from './paths.mjs';
import { prepareTunnelConfig } from './tunnel.mjs';
import {
  buildQuickTunnelArgs,
  getQuickTunnelMetricsPort,
  isQuickTunnelMode,
  persistQuickTunnelHostname,
  waitForQuickTunnelHealth,
  waitForQuickTunnelHostname,
} from './quick-tunnel.mjs';

const state = {
  proxy: null,
  tunnel: null,
};

function getStackPidPath(name) {
  return path.join(getConfigDir(), `${name}.pid`);
}

function readStackPid(name) {
  try {
    const raw = fs.readFileSync(getStackPidPath(name), 'utf8').trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isFinite(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function writeStackPid(name, pid) {
  fs.mkdirSync(getConfigDir(), { recursive: true });
  fs.writeFileSync(getStackPidPath(name), String(pid), 'utf8');
}

function clearStackPid(name) {
  try {
    fs.unlinkSync(getStackPidPath(name));
  } catch {
    // ignore missing file
  }
}

function isPidRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function isStackPidRunning(name) {
  const pid = readStackPid(name);
  if (!isPidRunning(pid)) {
    if (pid) clearStackPid(name);
    return false;
  }
  return true;
}

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

async function getListeningPidByPort(port) {
  if (process.platform === 'win32') {
    const { code, stdout } = await runCommand('netstat', ['-ano'], { allowFail: true });
    if (code !== 0) return null;

    for (const line of stdout.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 5) continue;
      const localAddress = parts[1];
      const state = parts[3];
      const pidRaw = parts[4];
      if (!localAddress.includes(`:${port}`)) continue;
      if (state.toUpperCase() !== 'LISTENING') continue;
      const pid = Number.parseInt(pidRaw, 10);
      if (Number.isInteger(pid) && pid > 0) return pid;
    }
    return null;
  }

  const lsof = await runCommand('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
    allowFail: true,
  });
  if (lsof.code === 0) {
    const pid = Number.parseInt(lsof.stdout.trim().split(/\r?\n/)[0] || '', 10);
    if (Number.isInteger(pid) && pid > 0) return pid;
  }

  const ss = await runCommand('ss', ['-ltnp'], { allowFail: true });
  if (ss.code === 0) {
    for (const line of ss.stdout.split(/\r?\n/)) {
      if (!line.includes(`:${port}`)) continue;
      const match = line.match(/pid=(\d+)/);
      if (match) {
        const pid = Number.parseInt(match[1], 10);
        if (Number.isInteger(pid) && pid > 0) return pid;
      }
    }
  }

  return null;
}

async function isCursorOllamaProxyPort(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    if (!res.ok) return false;
    const payload = await res.json().catch(() => null);
    return payload?.service === 'cursor-ollama-proxy';
  } catch {
    return false;
  }
}

async function waitForTunnelHealth(hostname, timeoutMs = 45000) {
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < timeoutMs) {
    try {
      await fetchOk(`https://${hostname}/health`);
      return;
    } catch (err) {
      lastError = err.message;
      await sleep(1500);
    }
  }

  throw new Error(
    `Tunnel did not become reachable at https://${hostname}/health` +
      (lastError ? `: ${lastError}` : ''),
  );
}

function killPid(pid) {
  if (!pid || !isPidRunning(pid)) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
    });
  } else {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // ignore stale pid
    }
  }
}

function stopProcess(child) {
  killPid(child?.pid);
}

function stopTrackedProcess(name, child) {
  stopProcess(child);
  if (child && state[name] === child) {
    state[name] = null;
  }

  const pid = readStackPid(name);
  if (pid && (!child || pid !== child.pid)) {
    killPid(pid);
  }
  clearStackPid(name);
}

function attachLogging(child, label, buffers, pidName) {
  if (pidName && child.pid) {
    writeStackPid(pidName, child.pid);
  }

  child.stdout?.on('data', (chunk) => {
    if (buffers?.stdout) buffers.stdout += chunk.toString();
    process.stderr.write(`[${label}] ${chunk}`);
  });
  child.stderr?.on('data', (chunk) => {
    if (buffers?.stderr) buffers.stderr += chunk.toString();
    process.stderr.write(`[${label}] ${chunk}`);
  });
  child.on('exit', () => {
    if (state.proxy === child) state.proxy = null;
    if (state.tunnel === child) state.tunnel = null;
    if (pidName) clearStackPid(pidName);
  });
}

export function isProxyManagedRunning() {
  return Boolean(
    (state.proxy && state.proxy.exitCode === null) || isStackPidRunning('proxy'),
  );
}

export function isTunnelManagedRunning() {
  return Boolean(
    (state.tunnel && state.tunnel.exitCode === null) || isStackPidRunning('tunnel'),
  );
}

export async function getStackStatus(options = {}) {
  const config = loadConfig(options);
  const authKey = getAuthKey(config, null);
  let proxyUp = isProxyManagedRunning();
  let tunnelUp = isTunnelManagedRunning();

  if (!proxyUp) {
    try {
      await waitForPort(config.proxyPort, 1000);
      proxyUp = true;
    } catch {
      try {
        await fetchOk(`http://127.0.0.1:${config.proxyPort}/health`);
        proxyUp = true;
      } catch {
        try {
          await fetchOk(`http://127.0.0.1:${config.proxyPort}/v1/models`, {
            headers: { Authorization: `Bearer ${authKey}` },
          });
          proxyUp = true;
        } catch {
          proxyUp = false;
        }
      }
    }
  }

  if (!tunnelUp && config.tunnelHostname) {
    try {
      await fetchOk(`https://${config.tunnelHostname}/health`);
      tunnelUp = true;
    } catch {
      tunnelUp = false;
    }
  }

  return { config, proxyUp, tunnelUp };
}

export async function startProxyStack(options = {}) {
  const config = loadConfig(options);

  if (isProxyManagedRunning()) {
    return { alreadyRunning: true };
  }

  let portAlreadyListening = false;
  try {
    await waitForPort(config.proxyPort, 1000);
    portAlreadyListening = true;
  } catch {
    portAlreadyListening = false;
  }

  if (portAlreadyListening) {
    if (!(await isCursorOllamaProxyPort(config.proxyPort))) {
      throw new Error(
        `Port ${config.proxyPort} is already in use by another process. ` +
          'Stop that process or change proxy port in settings.',
      );
    }

    const listenerPid = await getListeningPidByPort(config.proxyPort);
    if (!listenerPid) {
      throw new Error(
        `Proxy is already running on port ${config.proxyPort}, but its PID could not be detected. ` +
          'Stop it manually, then retry.',
      );
    }

    writeStackPid('proxy', listenerPid);
    return { alreadyRunning: true, external: true, pid: listenerPid };
  }

  const mapPath = getModelsMapPath(options.local);
  if (!fs.existsSync(mapPath)) {
    throw new Error(`Missing models map: ${mapPath}. Run cursor-ollama init && setup first.`);
  }

  const child = spawn(process.execPath, [getProxyServerPath()], {
    env: { ...process.env, MODELS_MAP_PATH: mapPath },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  attachLogging(child, 'proxy', null, 'proxy');
  state.proxy = child;
  await waitForPort(config.proxyPort);
  return { started: true };
}

export async function stopProxyStack() {
  stopTrackedProcess('proxy', state.proxy);
  state.proxy = null;
}

export async function startTunnelStack(options = {}) {
  const config = loadConfig(options);

  if (isTunnelManagedRunning()) {
    return { alreadyRunning: true };
  }

  if (config.tunnelHostname) {
    try {
      await fetchOk(`https://${config.tunnelHostname}/health`);
      return { alreadyRunning: true };
    } catch {
      // not reachable yet
    }
  }

  if (!(await commandExists('cloudflared'))) {
    throw new Error(`cloudflared not found in PATH. ${CLOUDFLARED_INSTALL_HINT}`);
  }

  let cloudflared;
  try {
    cloudflared = await resolveExecutable('cloudflared');
  } catch (err) {
    throw new Error(`cloudflared not found in PATH. ${CLOUDFLARED_INSTALL_HINT}`, { cause: err });
  }

  if (isQuickTunnelMode(config)) {
    return startQuickTunnelStack(config, cloudflared, options);
  }

  const yml = await prepareTunnelConfig(config);
  let child;
  const logs = { stdout: '', stderr: '' };
  try {
    child = await spawnBackground(cloudflared, ['--config', yml, 'tunnel', 'run']);
  } catch (err) {
    throw new Error(`Failed to start cloudflared (${cloudflared}). ${CLOUDFLARED_INSTALL_HINT}`, {
      cause: err,
    });
  }

  attachLogging(child, 'tunnel', logs, 'tunnel');
  state.tunnel = child;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (child.exitCode !== null) {
      const detail = logs.stderr.trim().split(/\r?\n/).filter(Boolean).pop() || logs.stdout.trim();
      throw new Error(
        `cloudflared exited (code ${child.exitCode}).` +
          (detail ? ` ${detail}` : '') +
          `\nConfig: ${yml}`,
      );
    }
    await sleep(500);
  }

  if (config.tunnelHostname) {
    await waitForTunnelHealth(config.tunnelHostname);
  }

  return { started: true, configPath: yml, mode: 'named' };
}

async function startQuickTunnelStack(config, cloudflared, options = {}) {
  try {
    await waitForPort(config.proxyPort, 5000);
  } catch {
    throw new Error(
      `Proxy must be running on port ${config.proxyPort} before starting a quick tunnel`,
    );
  }

  const logs = { stdout: '', stderr: '' };
  const metricsPort = getQuickTunnelMetricsPort(config);
  let child;

  try {
    child = await spawnBackground(cloudflared, buildQuickTunnelArgs(config));
  } catch (err) {
    throw new Error(`Failed to start quick tunnel (${cloudflared}). ${CLOUDFLARED_INSTALL_HINT}`, {
      cause: err,
    });
  }

  attachLogging(child, 'tunnel', logs, 'tunnel');
  state.tunnel = child;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (child.exitCode !== null) {
      const detail = logs.stderr.trim().split(/\r?\n/).filter(Boolean).pop() || logs.stdout.trim();
      throw new Error(
        `Quick tunnel exited (code ${child.exitCode}).` + (detail ? ` ${detail}` : ''),
      );
    }
    await sleep(500);
  }

  const hostname = await waitForQuickTunnelHostname({ metricsPort, logs });
  const updated = persistQuickTunnelHostname(config, hostname, options);
  await waitForQuickTunnelHealth(updated.tunnelHostname);

  return {
    started: true,
    mode: 'quick',
    hostname: updated.tunnelHostname,
    url: `https://${updated.tunnelHostname}`,
    metricsPort,
  };
}

export async function refreshQuickTunnelStack(options = {}) {
  const config = loadConfig(options);
  if (!isQuickTunnelMode(config)) {
    throw new Error('Refresh is only available for temporary trycloudflare tunnels');
  }

  await stopTunnelStack();
  await sleep(750);

  const status = await getStackStatus(options);
  if (!status.proxyUp) {
    await startProxyStack(options);
  }

  const result = await startTunnelStack(options);
  const updated = loadConfig(options);
  return {
    ...result,
    url: updated.tunnelHostname ? `https://${updated.tunnelHostname}` : '',
    baseUrl: updated.tunnelHostname ? `https://${updated.tunnelHostname}/v1` : '',
  };
}

export async function stopTunnelStack() {
  stopTrackedProcess('tunnel', state.tunnel);
  state.tunnel = null;
}

export async function startAllStack(options = {}) {
  await startProxyStack(options);
  await startTunnelStack(options);
  return getStackStatus(options);
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

export { getTunnelYmlPath } from './tunnel.mjs';
