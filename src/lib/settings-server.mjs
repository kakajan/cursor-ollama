import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { loadConfig, parsePort, saveConfig } from './config.mjs';
import { writeModelsMap } from './models-map.mjs';
import { getPublicBaseUrl, getPublicTunnelUrl, isQuickTunnelMode } from './quick-tunnel.mjs';
import { refreshQuickTunnelStack } from './stack-manager.mjs';
import { getConfigPath, getPackageRoot } from './paths.mjs';
import { syncTunnelConfigFile } from './tunnel.mjs';

const SETTINGS_DIR = path.join(getPackageRoot(), 'installer', 'settings');
const WIZARD_DIR = path.join(getPackageRoot(), 'installer', 'wizard');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
  });
}

function resolveStaticPath(urlPath) {
  if (urlPath === '/styles.css') {
    return path.join(WIZARD_DIR, 'styles.css');
  }
  if (urlPath === '/logo.svg') {
    return path.join(WIZARD_DIR, 'logo.svg');
  }
  if (urlPath === '/logo.png') {
    return path.join(WIZARD_DIR, 'logo.png');
  }

  const filePath = path.normalize(path.join(SETTINGS_DIR, urlPath.replace(/^\//, '')));
  if (!filePath.startsWith(SETTINGS_DIR)) {
    return null;
  }
  return filePath;
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = resolveStaticPath(urlPath);
  if (!filePath || !fs.existsSync(filePath)) {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, pathname, onClose) {
  if (pathname === '/api/config' && req.method === 'GET') {
    const config = loadConfig();
    sendJson(res, 200, {
      config,
      configPath: getConfigPath(),
    });
    return;
  }

  if (pathname === '/api/tunnel-url' && req.method === 'GET') {
    const config = loadConfig();
    sendJson(res, 200, {
      mode: config.tunnelMode || 'named',
      hostname: config.tunnelHostname || '',
      url: getPublicTunnelUrl(config),
      baseUrl: getPublicBaseUrl(config),
    });
    return;
  }

  if (pathname === '/api/tunnel/refresh' && req.method === 'POST') {
    try {
      const result = await refreshQuickTunnelStack();
      const config = loadConfig();
      sendJson(res, 200, {
        ok: true,
        mode: config.tunnelMode,
        hostname: config.tunnelHostname,
        url: getPublicTunnelUrl(config),
        baseUrl: getPublicBaseUrl(config),
        result,
      });
    } catch (err) {
      sendJson(res, 400, { error: err.message || String(err) });
    }
    return;
  }

  if (pathname === '/api/save' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const result = await applySettingsUpdate(body);
      sendJson(res, 200, {
        ok: true,
        config: result.config,
        tunnel: result.tunnel,
        message:
          'Settings saved. Restart proxy and tunnel from the tray menu if ports changed.',
      });
    } catch (err) {
      sendJson(res, 400, { error: err.message || String(err) });
    }
    return;
  }

  if (pathname === '/api/close' && req.method === 'POST') {
    sendJson(res, 200, { ok: true });
    setTimeout(() => onClose(), 150);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

async function applySettingsUpdate(input = {}) {
  const current = loadConfig();
  const tunnelMode = input.tunnelMode === 'quick' ? 'quick' : 'named';
  const config = saveConfig({
    ...current,
    tunnelMode,
    tunnelHostname:
      tunnelMode === 'quick'
        ? current.tunnelMode === 'quick'
          ? current.tunnelHostname
          : ''
        : String(input.tunnelHostname || current.tunnelHostname).trim(),
    tunnelName: String(input.tunnelName || current.tunnelName).trim(),
    ollamaPort: parsePort(input.ollamaPort, current.ollamaPort, 'Ollama port'),
    proxyPort: parsePort(input.proxyPort, current.proxyPort, 'Proxy port'),
  });

  writeModelsMap(config);

  let tunnel = { updated: false };
  if (!isQuickTunnelMode(config)) {
    try {
      tunnel = await syncTunnelConfigFile(config);
    } catch (err) {
      tunnel = { updated: false, error: err.message };
    }
  }

  return { config, tunnel };
}

export function findSettingsPort(preferred = 17436) {
  return preferred;
}

export function startSettingsServer(options = {}) {
  const port = options.port || findSettingsPort();
  let closing = false;

  const server = http.createServer(async (req, res) => {
    const pathname = req.url.split('?')[0];
    try {
      if (pathname.startsWith('/api/')) {
        await handleApi(req, res, pathname, () => {
          if (!closing) {
            closing = true;
            server.close();
            options.onClose?.();
          }
        });
        return;
      }
      serveStatic(req, res);
    } catch (err) {
      sendJson(res, 500, { error: err.message || String(err) });
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        port,
        url: `http://127.0.0.1:${port}/`,
        close: () =>
          new Promise((closeResolve) => {
            server.close(() => closeResolve());
          }),
      });
    });
  });
}
