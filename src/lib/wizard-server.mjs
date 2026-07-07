import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { DEFAULTS, loadConfig } from './config.mjs';
import { commandExists, runCommand } from './exec.mjs';
import { listLocalModels } from './ollama.mjs';
import { getConfigPath, getPackageRoot } from './paths.mjs';
import { parseTunnelList, tunnelExistsInList } from './tunnel.mjs';
import { runInstallFromWizard } from './install-flow.mjs';

const WIZARD_DIR = path.join(getPackageRoot(), 'installer', 'wizard');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.ico': 'image/x-icon',
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

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(WIZARD_DIR, urlPath.replace(/^\//, '')));
  if (!filePath.startsWith(WIZARD_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }
  if (!fs.existsSync(filePath)) {
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
    const hasFile = fs.existsSync(getConfigPath());
    sendJson(res, 200, {
      config: hasFile ? config : null,
    });
    return;
  }

  if (pathname === '/api/checks' && req.method === 'GET') {
    const names = ['node', 'ollama', 'cloudflared'];
    const checks = [];
    for (const name of names) {
      checks.push({ name, ok: await commandExists(name) });
    }
    sendJson(res, 200, { checks });
    return;
  }

  if (pathname === '/api/models' && req.method === 'GET') {
    const config = loadConfig();
    const models = await listLocalModels(config.ollamaPort);
    sendJson(res, 200, {
      models,
      defaultModel: config.ollamaSourceModel || DEFAULTS.ollamaSourceModel,
    });
    return;
  }

  if (pathname.startsWith('/api/tunnels') && req.method === 'GET') {
    const url = new URL(req.url, 'http://127.0.0.1');
    const name = (url.searchParams.get('name') || '').trim() || DEFAULTS.tunnelName;
    try {
      const result = await runCommand('cloudflared', ['tunnel', 'list']);
      const list = result.stdout;
      const tunnels = parseTunnelList(list).map((entry) => entry.name);
      sendJson(res, 200, {
        found: tunnelExistsInList(list, name),
        name,
        tunnels,
        list: list.trim(),
        error: null,
      });
    } catch (err) {
      sendJson(res, 200, {
        found: false,
        name,
        tunnels: [],
        list: '',
        error: err.message || String(err),
      });
    }
    return;
  }

  if (pathname === '/api/install' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const result = await runInstallFromWizard(body);
      sendJson(res, 200, result);
    } catch (err) {
      sendJson(res, 500, { error: err.message || String(err) });
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

export function findWizardPort(preferred = 17435) {
  return preferred;
}

export function startWizardServer(options = {}) {
  const port = options.port || findWizardPort();
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

export function getWizardDir() {
  return WIZARD_DIR;
}

export { WIZARD_DIR };
