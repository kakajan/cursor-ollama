import { saveConfig } from './config.mjs';
import { fetchOk, sleep } from './exec.mjs';
import { writeModelsMap } from './models-map.mjs';

export const QUICK_TUNNEL_METRICS_PORT = 57555;
export const QUICK_TUNNEL_URL_REGEX = /https:\/\/([a-z0-9-]+\.trycloudflare\.com)/i;

export function isQuickTunnelMode(config = {}) {
  return config.tunnelMode === 'quick';
}

export function normalizeQuickHostname(value = '') {
  return String(value)
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .toLowerCase();
}

export function getPublicTunnelUrl(config = {}) {
  const hostname = normalizeQuickHostname(config.tunnelHostname);
  return hostname ? `https://${hostname}` : '';
}

export function getPublicBaseUrl(config = {}) {
  const url = getPublicTunnelUrl(config);
  return url ? `${url}/v1` : '';
}

export function parseQuickTunnelFromLogs(text = '') {
  const match = QUICK_TUNNEL_URL_REGEX.exec(text);
  return match ? normalizeQuickHostname(match[1]) : null;
}

export async function fetchQuickTunnelHostname(metricsPort = QUICK_TUNNEL_METRICS_PORT) {
  const res = await fetch(`http://127.0.0.1:${metricsPort}/quicktunnel`);
  if (!res.ok) {
    throw new Error(`Quick tunnel metrics returned ${res.status}`);
  }

  const data = await res.json();
  const hostname = normalizeQuickHostname(data.hostname || data.url || '');
  if (!hostname) {
    throw new Error('Quick tunnel metrics did not return a hostname');
  }

  return hostname;
}

export async function waitForQuickTunnelHostname({
  metricsPort = QUICK_TUNNEL_METRICS_PORT,
  logs = null,
  timeoutMs = 45000,
} = {}) {
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < timeoutMs) {
    const fromLogs = logs ? parseQuickTunnelFromLogs(`${logs.stdout || ''}${logs.stderr || ''}`) : null;
    if (fromLogs) {
      return fromLogs;
    }

    try {
      return await fetchQuickTunnelHostname(metricsPort);
    } catch (err) {
      lastError = err.message;
      await sleep(500);
    }
  }

  throw new Error(
    `Timed out waiting for trycloudflare URL` + (lastError ? `: ${lastError}` : ''),
  );
}

export function getQuickTunnelMetricsPort(config = {}) {
  return config.quickTunnelMetricsPort || QUICK_TUNNEL_METRICS_PORT;
}

export function buildQuickTunnelArgs(config = {}) {
  const metricsPort = getQuickTunnelMetricsPort(config);
  const proxyPort = config.proxyPort || 11435;

  return [
    'tunnel',
    '--no-autoupdate',
    '--metrics',
    `127.0.0.1:${metricsPort}`,
    '--url',
    `http://127.0.0.1:${proxyPort}`,
  ];
}

export function persistQuickTunnelHostname(config, hostname, options = {}) {
  const updated = saveConfig({
    ...config,
    tunnelMode: 'quick',
    tunnelHostname: normalizeQuickHostname(hostname),
  });
  writeModelsMap(updated, options);
  return updated;
}

export async function waitForQuickTunnelHealth(hostname, timeoutMs = 45000) {
  const clean = normalizeQuickHostname(hostname);
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < timeoutMs) {
    try {
      await fetchOk(`https://${clean}/health`);
      return clean;
    } catch (err) {
      lastError = err.message;
      await sleep(1500);
    }
  }

  throw new Error(
    `Quick tunnel did not become reachable at https://${clean}/health` +
      (lastError ? `: ${lastError}` : ''),
  );
}
