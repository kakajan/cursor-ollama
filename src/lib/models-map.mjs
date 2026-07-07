import fs from 'node:fs';
import path from 'node:path';
import { loadModelsMap, saveConfig } from './config.mjs';
import { ensureConfigDir, getConfigDir, getModelsMapPath } from './paths.mjs';

function mergeMappings(config, existing = []) {
  const mappings = [...existing];
  const upsert = (cursorName, ollamaName) => {
    const idx = mappings.findIndex((entry) => entry.cursorName === cursorName);
    const entry = {
      cursorName,
      ollamaName,
      recommendedFor: 'chat, cmd+k',
    };
    if (idx >= 0) {
      mappings[idx] = { ...mappings[idx], ...entry };
    } else {
      mappings.push(entry);
    }
  };

  upsert(config.cursorModelName, config.ollamaSourceModel);
  return mappings;
}

export function buildModelsMap(config, existingMap = null) {
  const authKey = config.ollamaAuthKey || existingMap?.authKey || 'ollama';
  const mappings = mergeMappings(config, existingMap?.mappings || []);

  return {
    strategy: 'proxy-rewrite',
    authKey,
    cursorApiKey: authKey,
    cursorBaseUrl: `https://${config.tunnelHostname}/v1`,
    proxyPort: config.proxyPort,
    ollamaPort: config.ollamaPort,
    secureTunnel: config.secureTunnel !== false,
    activeMapping: {
      cursorName: config.cursorModelName,
      ollamaName: config.ollamaSourceModel,
    },
    mappings,
  };
}

export function writeModelsMap(config, options = {}) {
  const existingMap = options.existingMap ?? loadModelsMap(options);
  const map = buildModelsMap(config, existingMap);
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

export function formatMappingLabel(mapping) {
  return `${mapping.cursorName} → ${mapping.ollamaName}`;
}

export function getActiveMapping(config, options = {}) {
  const map = loadModelsMap(options);
  if (map?.activeMapping?.cursorName && map?.activeMapping?.ollamaName) {
    return map.activeMapping;
  }

  return {
    cursorName: config.cursorModelName,
    ollamaName: config.ollamaSourceModel,
  };
}

export function isActiveMapping(config, mapping, options = {}) {
  const active = getActiveMapping(config, options);
  return (
    active.cursorName === mapping.cursorName &&
    active.ollamaName === mapping.ollamaName
  );
}

export function listMappings(config, options = {}) {
  const map = loadModelsMap(options);
  if (map?.mappings?.length) {
    return map.mappings;
  }

  return [
    {
      cursorName: config.cursorModelName,
      ollamaName: config.ollamaSourceModel,
      recommendedFor: 'chat, cmd+k',
    },
  ];
}

export function activateMapping(config, cursorName, ollamaName, options = {}) {
  const updated = saveConfig({
    ...config,
    cursorModelName: cursorName,
    ollamaSourceModel: ollamaName,
  });
  const existingMap = loadModelsMap(options);
  return writeModelsMap(updated, { ...options, existingMap });
}

export function setOllamaBackend(config, ollamaName, options = {}) {
  return activateMapping(config, config.cursorModelName, ollamaName, options);
}

export { getModelsMapPath };
