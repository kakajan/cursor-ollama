import http from 'node:http';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createProxyServer } from '../config/proxy/server.mjs';
import { startMockOllama } from './mock-ollama.mjs';

const TEST_KEY = 'test-key-ci-only';

function request(port, opts) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, ...opts }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

describe('integration: proxy -> mock ollama', () => {
  let mock;
  let proxy;
  let proxyPort;

  before(async () => {
    mock = await startMockOllama(0);
    ({ server: proxy } = createProxyServer({
      config: {
        authKey: TEST_KEY,
        secureTunnel: true,
        ollamaPort: mock.port,
        mappings: [{ cursorName: 'gpt-4o-mini', ollamaName: 'qwen2.5-coder:7b' }],
      },
    }));
    await new Promise((resolve) => proxy.listen(0, '127.0.0.1', resolve));
    proxyPort = proxy.address().port;
  });

  after(async () => {
    await new Promise((resolve) => proxy.close(resolve));
    await new Promise((resolve) => mock.server.close(resolve));
  });

  it('end-to-end chat with cursor model name', async () => {
    const body = JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] });
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
    const json = JSON.parse(res.body);
    assert.equal(json.model, 'qwen2.5-coder:7b');
    assert.match(json.choices[0].message.content, /mock response/);
  });
});
