import http from 'node:http';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { buildModelMap, createProxyServer, resolveOllamaModel } from './server.mjs';

const TEST_KEY = 'test-key-ci-only';

function request(port, { method = 'GET', path = '/', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function startMockOllama() {
  let lastBody = null;

  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      lastBody = Buffer.concat(chunks).toString('utf8');

      if (req.method === 'GET' && req.url === '/v1/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: [{ id: 'qwen2.5-coder:7b' }] }));
        return;
      }

      if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        const parsed = JSON.parse(lastBody);
        if (parsed.stream) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });
          res.write(`data: ${JSON.stringify({ model: parsed.model, choices: [{ delta: { content: 'hi' } }] })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ model: parsed.model, choices: [{ message: { content: 'hello' } }] }));
        return;
      }

      res.writeHead(404);
      res.end('not found');
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({
        server,
        port,
        getLastBody: () => lastBody,
      });
    });
  });
}

describe('proxy server', () => {
  let mock;
  let proxy;
  let proxyPort;

  before(async () => {
    mock = await startMockOllama();
    ({ server: proxy } = createProxyServer({
      config: {
        authKey: TEST_KEY,
        secureTunnel: true,
        proxyPort: 0,
        ollamaPort: mock.port,
        mappings: [{ cursorName: 'gpt-4o-mini', ollamaName: 'qwen2.5-coder:7b' }],
        activeMapping: { cursorName: 'gpt-4o-mini', ollamaName: 'qwen2.5-coder:7b' },
      },
    }));

    await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
    proxyPort = proxy.address().port;
  });

  after(async () => {
    await new Promise((resolve) => proxy.close(resolve));
    await new Promise((resolve) => mock.server.close(resolve));
  });

  it('rejects missing Bearer token with 401', async () => {
    const res = await request(proxyPort, { path: '/v1/models' });
    assert.equal(res.status, 401);
  });

  it('rejects wrong Bearer token with 401', async () => {
    const res = await request(proxyPort, {
      path: '/v1/models',
      headers: { Authorization: 'Bearer wrong-key' },
    });
    assert.equal(res.status, 401);
  });

  it('serves GET /health without auth for tunnel diagnostics', async () => {
    const res = await request(proxyPort, { path: '/health' });
    assert.equal(res.status, 200);
    assert.match(res.body, /"ok":true/);
    assert.match(res.body, /"service":"cursor-ollama-proxy"/);
  });

  it('serves HEAD /health without auth', async () => {
    const res = await request(proxyPort, { method: 'HEAD', path: '/health' });
    assert.equal(res.status, 200);
  });

  it('passes through GET /v1/models', async () => {
    const res = await request(proxyPort, {
      path: '/v1/models',
      headers: { Authorization: `Bearer ${TEST_KEY}` },
    });
    assert.equal(res.status, 200);
    assert.match(res.body, /qwen2\.5-coder:7b/);
  });

  it('rewrites model name on chat completions', async () => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hi' }],
    });

    const res = await request(proxyPort, {
      method: 'POST',
      path: '/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${TEST_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });

    assert.equal(res.status, 200);
    assert.match(mock.getLastBody(), /qwen2\.5-coder:7b/);
    assert.doesNotMatch(mock.getLastBody(), /gpt-4o-mini/);
  });

  it('rewrites dated Cursor model variants via prefix match', async () => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [{ role: 'user', content: 'hi' }],
    });

    const res = await request(proxyPort, {
      method: 'POST',
      path: '/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${TEST_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });

    assert.equal(res.status, 200);
    assert.match(mock.getLastBody(), /qwen2\.5-coder:7b/);
  });

  it('falls back to active mapping for other Cursor model names', async () => {
    const body = JSON.stringify({
      model: 'gpt-4-turbo-2024-04-09',
      messages: [{ role: 'user', content: 'hi' }],
    });

    const res = await request(proxyPort, {
      method: 'POST',
      path: '/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${TEST_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });

    assert.equal(res.status, 200);
    assert.match(mock.getLastBody(), /qwen2\.5-coder:7b/);
  });

  it('resolveOllamaModel prefers exact and prefix matches', () => {
    const map = buildModelMap([{ cursorName: 'gpt-4-turbo', ollamaName: 'qwen3.6:35b-a3b' }]);
    const config = {
      activeMapping: { cursorName: 'gpt-4-turbo', ollamaName: 'qwen3.6:35b-a3b' },
    };

    assert.equal(resolveOllamaModel('gpt-4-turbo', map, config), 'qwen3.6:35b-a3b');
    assert.equal(resolveOllamaModel('gpt-4-turbo-2024-04-09', map, config), 'qwen3.6:35b-a3b');
    assert.equal(resolveOllamaModel('gpt-4o', map, config), 'qwen3.6:35b-a3b');
  });

  it('resolveOllamaModel prefers most specific prefix mapping', () => {
    const map = buildModelMap([
      { cursorName: 'gpt-4', ollamaName: 'generic-gpt4' },
      { cursorName: 'gpt-4-turbo', ollamaName: 'qwen3.6:35b-a3b' },
    ]);

    assert.equal(
      resolveOllamaModel('gpt-4-turbo-2024-04-09', map, {}),
      'qwen3.6:35b-a3b',
    );
  });

  it('rewrites streaming chat completions', async () => {
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [{ role: 'user', content: 'hi' }],
    });

    const res = await request(proxyPort, {
      method: 'POST',
      path: '/v1/chat/completions',
      headers: {
        Authorization: `Bearer ${TEST_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });

    assert.equal(res.status, 200);
    assert.match(mock.getLastBody(), /qwen2\.5-coder:7b/);
    assert.match(res.body, /mock response|hi|data:/);
  });
});
