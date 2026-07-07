import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { getAppMeta } from './about-meta.mjs';
import { getPackageRoot } from './paths.mjs';

const ABOUT_DIR = path.join(getPackageRoot(), 'installer', 'about');
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

  const filePath = path.normalize(path.join(ABOUT_DIR, urlPath.replace(/^\//, '')));
  if (!filePath.startsWith(ABOUT_DIR)) {
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
  if (pathname === '/api/info' && req.method === 'GET') {
    sendJson(res, 200, getAppMeta());
    return;
  }

  if (pathname === '/api/close' && req.method === 'POST') {
    sendJson(res, 200, { ok: true });
    setTimeout(() => onClose(), 150);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

export function findAboutPort(preferred = 17437) {
  return preferred;
}

export function startAboutServer(options = {}) {
  const port = options.port || findAboutPort();
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
