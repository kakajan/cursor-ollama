import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  ensureConfigDir,
  expandHome,
  getConfigDir,
  getConfigPath,
  getModelsMapPath,
} from './paths.mjs';

export const DEFAULTS = {
  tunnelHostname: 'ollama-you.example.com',
  tunnelName: 'cursor-ollama',
  tunnelMode: 'named',
  ollamaPort: 11434,
  proxyPort: 11435,
  quickTunnelMetricsPort: 57555,
  ollamaSourceModel: 'qwen2.5-coder:7b',
  cursorModelName: 'gpt-4o-mini',
  secureTunnel: true,
  modelAliasStrategy: 'proxy-rewrite',
  cloudflaredDir: '~/.cloudflared',
  skipModelPull: false,
};

function parseEnvFile(content) {
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  }
  return result;
}

function envToConfig(env) {
  const tunnelMode = env.TUNNEL_MODE === 'quick' ? 'quick' : 'named';
  return {
    tunnelHostname:
      tunnelMode === 'quick'
        ? String(env.TUNNEL_HOSTNAME ?? '').trim()
        : env.TUNNEL_HOSTNAME || DEFAULTS.tunnelHostname,
    tunnelName: env.TUNNEL_NAME || DEFAULTS.tunnelName,
    tunnelMode,
    ollamaPort: Number(env.OLLAMA_PORT || DEFAULTS.ollamaPort),
    proxyPort: Number(env.PROXY_PORT || DEFAULTS.proxyPort),
    quickTunnelMetricsPort: Number(env.QUICK_TUNNEL_METRICS_PORT || DEFAULTS.quickTunnelMetricsPort),
    ollamaSourceModel: env.OLLAMA_SOURCE_MODEL || DEFAULTS.ollamaSourceModel,
    cursorModelName: env.CURSOR_MODEL_NAME || DEFAULTS.cursorModelName,
    ollamaAuthKey: env.OLLAMA_AUTH_KEY || '',
    secureTunnel: env.SECURE_TUNNEL !== 'false',
    modelAliasStrategy: env.MODEL_ALIAS_STRATEGY || DEFAULTS.modelAliasStrategy,
    cloudflaredDir: expandHome(env.CLOUDFLARED_DIR || DEFAULTS.cloudflaredDir),
    skipModelPull: env.SKIP_MODEL_PULL === 'true',
  };
}

function normalizeConfig(raw = {}) {
  const tunnelMode = raw.tunnelMode === 'quick' ? 'quick' : 'named';
  const rawHostname =
    tunnelMode === 'quick'
      ? raw.tunnelHostname ?? ''
      : raw.tunnelHostname || DEFAULTS.tunnelHostname;

  return {
    tunnelHostname: String(rawHostname).trim(),
    tunnelName: raw.tunnelName || DEFAULTS.tunnelName,
    tunnelMode,
    ollamaPort: Number(raw.ollamaPort ?? DEFAULTS.ollamaPort),
    proxyPort: Number(raw.proxyPort ?? DEFAULTS.proxyPort),
    quickTunnelMetricsPort: Number(raw.quickTunnelMetricsPort ?? DEFAULTS.quickTunnelMetricsPort),
    ollamaSourceModel: raw.ollamaSourceModel || DEFAULTS.ollamaSourceModel,
    cursorModelName: raw.cursorModelName || DEFAULTS.cursorModelName,
    ollamaAuthKey: raw.ollamaAuthKey || '',
    secureTunnel: raw.secureTunnel !== false,
    modelAliasStrategy: raw.modelAliasStrategy || DEFAULTS.modelAliasStrategy,
    cloudflaredDir: expandHome(raw.cloudflaredDir || DEFAULTS.cloudflaredDir),
    skipModelPull: raw.skipModelPull === true,
  };
}

export function generateAuthKey() {
  return crypto.randomBytes(24).toString('hex');
}

export function parsePort(value, fallback, label = 'Port') {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const num = Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num < 1 || num > 65535) {
    throw new Error(`${label} must be an integer between 1 and 65535`);
  }

  return num;
}

export function loadConfig(options = {}) {
  const { local = false } = options;

  if (local) {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      return normalizeConfig(envToConfig(parseEnvFile(fs.readFileSync(envPath, 'utf8'))));
    }
  }

  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return normalizeConfig(raw);
  }

  if (local) {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      return normalizeConfig(envToConfig(parseEnvFile(fs.readFileSync(envPath, 'utf8'))));
    }
  }

  return normalizeConfig(DEFAULTS);
}

export function saveConfig(config) {
  ensureConfigDir();
  const normalized = normalizeConfig(config);
  fs.writeFileSync(getConfigPath(), `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}

export function loadModelsMap(options = {}) {
  const mapPath = getModelsMapPath(options.local);
  if (!fs.existsSync(mapPath)) {
    return null;
  }
  let raw = fs.readFileSync(mapPath, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1);
  }
  return JSON.parse(raw);
}

export function getAuthKey(config, modelsMap) {
  return config.ollamaAuthKey || modelsMap?.authKey || modelsMap?.cursorApiKey || 'ollama';
}

export { getConfigDir, getConfigPath, getModelsMapPath };
