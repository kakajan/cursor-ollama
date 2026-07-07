import fs from 'node:fs';
import path from 'node:path';
import { ensureConfigDir, getConfigDir, getModelsMapPath } from './paths.mjs';

export function buildModelsMap(config) {
  const authKey = config.ollamaAuthKey || 'ollama';
  return {
    strategy: 'proxy-rewrite',
    authKey,
    cursorApiKey: authKey,
    cursorBaseUrl: `https://${config.tunnelHostname}/v1`,
    proxyPort: config.proxyPort,
    ollamaPort: config.ollamaPort,
    secureTunnel: config.secureTunnel !== false,
    mappings: [
      {
        cursorName: config.cursorModelName,
        ollamaName: config.ollamaSourceModel,
        recommendedFor: 'chat, cmd+k',
      },
    ],
  };
}

export function writeModelsMap(config, options = {}) {
  const map = buildModelsMap(config);
  let mapPath = options.path;

  if (!mapPath) {
    if (options.local) {
      mapPath = path.join(process.cwd(), 'config', 'models.map.json');
      fs.mkdirSync(path.dirname(mapPath), { recursive: true });
    } else {
      ensureConfigDir();
      mapPath = path.join(getConfigDir(), 'models.map.json');
    }
  } else {
    fs.mkdirSync(path.dirname(mapPath), { recursive: true });
  }

  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8');
  return { mapPath, map };
}
