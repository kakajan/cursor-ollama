import http from 'node:http';

export function startMockOllama(port = 0) {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const bodyText = Buffer.concat(chunks).toString('utf8');

      if (req.method === 'GET' && req.url === '/api/tags') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ models: [{ name: 'qwen2.5-coder:7b' }] }));
        return;
      }

      if (req.method === 'GET' && req.url === '/v1/models') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ data: [{ id: 'qwen2.5-coder:7b' }] }));
        return;
      }

      if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        let parsed = {};
        try {
          parsed = JSON.parse(bodyText);
        } catch {
          res.writeHead(400);
          res.end('bad json');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            model: parsed.model,
            choices: [{ message: { role: 'assistant', content: 'mock response' } }],
          })
        );
        return;
      }

      res.writeHead(404);
      res.end('not found');
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
    server.on('error', reject);
  });
}

import { pathToFileURL } from 'node:url';

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const port = Number(process.env.MOCK_OLLAMA_PORT || process.argv[2] || 11434);
  startMockOllama(port).then(({ port: p }) => {
    console.log(`mock-ollama listening on http://127.0.0.1:${p}`);
  });
}
