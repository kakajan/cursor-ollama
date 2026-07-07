import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function resolveModelsMapPath() {
  if (process.env.MODELS_MAP_PATH && fs.existsSync(process.env.MODELS_MAP_PATH)) {
    return process.env.MODELS_MAP_PATH;
  }

  const homePath = path.join(os.homedir(), '.cursor-ollama', 'models.map.json');
  if (fs.existsSync(homePath)) {
    return homePath;
  }

  const localPath = path.join(ROOT, 'config', 'models.map.json');
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  return process.env.MODELS_MAP_PATH || homePath;
}

function loadConfig(configPath) {
  const resolved = configPath || resolveModelsMapPath();
  let raw = fs.readFileSync(resolved, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1);
  }
  return JSON.parse(raw);
}

function buildModelMap(mappings = []) {
  const map = new Map();
  for (const entry of mappings) {
    map.set(entry.cursorName, entry.ollamaName);
  }
  return map;
}

function extractBearer(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function rewriteModelInBody(bodyBuffer, modelMap) {
  const text = bodyBuffer.toString('utf8');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Invalid JSON body', status: 400 };
  }

  if (!parsed.model || typeof parsed.model !== 'string') {
    return { body: bodyBuffer, parsed };
  }

  const ollamaName = modelMap.get(parsed.model);
  if (!ollamaName) {
    return {
      error: `Unknown model "${parsed.model}". Allowed: ${[...modelMap.keys()].join(', ')}`,
      status: 400,
    };
  }

  parsed.model = ollamaName;
  return { body: Buffer.from(JSON.stringify(parsed)), parsed, rewritten: true };
}

function proxyRequest(req, res, config, modelMap) {
  const secure = config.secureTunnel !== false;
  if (secure) {
    const token = extractBearer(req);
    const expected = config.authKey || config.cursorApiKey;
    if (!expected) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy auth key not configured' }));
      return;
    }
    if (!token || token !== expected) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
  }

  const ollamaPort = config.ollamaPort || 11434;
  const targetPath = req.url || '/';

  const needsRewrite =
    req.method === 'POST' &&
    (targetPath.startsWith('/v1/chat/completions') ||
      targetPath.startsWith('/v1/completions') ||
      targetPath.startsWith('/v1/embeddings'));

  const forward = (bodyBuffer) => {
    const options = {
      hostname: '127.0.0.1',
      port: ollamaPort,
      path: targetPath,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${ollamaPort}` },
    };

    delete options.headers['content-length'];
    if (bodyBuffer && bodyBuffer.length > 0) {
      options.headers['content-length'] = String(bodyBuffer.length);
    } else {
      delete options.headers['content-length'];
    }

    const upstream = http.request(options, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    });

    upstream.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: 'Ollama upstream unavailable', detail: err.message }));
    });

    if (bodyBuffer && bodyBuffer.length > 0) {
      upstream.write(bodyBuffer);
    }
    upstream.end();
  };

  if (!needsRewrite) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      forward(null);
      return;
    }

    readBody(req)
      .then((body) => forward(body))
      .catch(() => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read request body' }));
      });
    return;
  }

  readBody(req)
    .then((body) => {
      const result = rewriteModelInBody(body, modelMap);
      if (result.error) {
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      forward(result.body);
      return;
    })
    .catch(() => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read request body' }));
    });
}

export function createProxyServer(options = {}) {
  const configPath = options.configPath || resolveModelsMapPath();
  const inlineConfig = options.config;

  const server = http.createServer((req, res) => {
    const config = inlineConfig || loadConfig(configPath);
    const modelMap = buildModelMap(config.mappings || []);
    proxyRequest(req, res, config, modelMap);
  });

  return { server, configPath };
}

export function startProxy(options = {}) {
  const configPath = options.configPath || resolveModelsMapPath();
  const { server } = createProxyServer({ configPath });
  const config = loadConfig(configPath);
  const port = options.port || config.proxyPort || 11435;

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port, config });
    });
    server.on('error', reject);
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const configPath = resolveModelsMapPath();
  startProxy({ configPath })
    .then(({ port }) => {
      console.log(`cursor-ollama proxy listening on http://127.0.0.1:${port}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
