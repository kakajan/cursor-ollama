import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getPackageRoot() {
  return path.resolve(__dirname, '../..');
}

export function getConfigDir() {
  return process.env.CURSOR_OLLAMA_CONFIG_DIR || path.join(os.homedir(), '.cursor-ollama');
}

export function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

export function getModelsMapPath(local = false) {
  if (process.env.MODELS_MAP_PATH) {
    return process.env.MODELS_MAP_PATH;
  }
  if (local) {
    const localPath = path.join(process.cwd(), 'config', 'models.map.json');
    if (fs.existsSync(localPath)) {
      return localPath;
    }
  }
  const homePath = path.join(getConfigDir(), 'models.map.json');
  if (fs.existsSync(homePath)) {
    return homePath;
  }
  return path.join(getPackageRoot(), 'config', 'models.map.json');
}

export function getTunnelTemplatePath() {
  return path.join(getPackageRoot(), 'config', 'tunnel.yml.template');
}

export function getProxyServerPath() {
  return path.join(getPackageRoot(), 'config', 'proxy', 'server.mjs');
}

export function getMockOllamaPath() {
  return path.join(getPackageRoot(), 'test', 'mock-ollama.mjs');
}

export function expandHome(input) {
  if (input.startsWith('~/')) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

export function ensureConfigDir() {
  fs.mkdirSync(getConfigDir(), { recursive: true });
}
