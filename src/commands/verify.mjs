import { spawn } from 'node:child_process';
import { loadConfig, getAuthKey, loadModelsMap } from '../lib/config.mjs';
import { writeModelsMap } from '../lib/models-map.mjs';
import { printCursorBlock } from '../lib/cursor-block.mjs';
import { fetchOk, sleep } from '../lib/exec.mjs';
import { getMockOllamaPath, getProxyServerPath } from '../lib/paths.mjs';
import { startProxy } from '../../config/proxy/server.mjs';

let mockProc = null;
let proxyServer = null;

async function cleanup() {
  if (proxyServer) {
    await new Promise((resolve) => proxyServer.close(resolve));
    proxyServer = null;
  }
  if (mockProc) {
    mockProc.kill();
    mockProc = null;
  }
}

export async function runVerify(options = {}) {
  const config = loadConfig({ local: options.local });
  let modelsMap = loadModelsMap({ local: options.local });
  let authKey = getAuthKey(config, modelsMap);
  let ollamaPort = config.ollamaPort;
  let proxyPort = config.proxyPort;

  if (options.mock) {
    const mockPort = 11499;
    ollamaPort = mockPort;
    config.ollamaPort = mockPort;
    if (!authKey) authKey = 'ollama';
    config.ollamaAuthKey = authKey;
    const { mapPath } = writeModelsMap(config, { local: options.local });
    modelsMap = { authKey };

    mockProc = spawn(process.execPath, [getMockOllamaPath(), String(mockPort)], {
      stdio: 'ignore',
      detached: false,
    });
    await sleep(1000);

    const mapPathResolved = mapPath;
    process.env.MODELS_MAP_PATH = mapPathResolved;
    const started = await startProxy({ configPath: mapPathResolved, port: proxyPort });
    proxyServer = started.server;
    await sleep(500);

    process.on('exit', cleanup);
  }

  let pass = 0;
  let fail = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      pass += 1;
    } catch (err) {
      console.log(`[FAIL] ${name}${err.message ? `: ${err.message}` : ''}`);
      fail += 1;
    }
  }

  try {
    await check('local ollama /api/tags', () =>
      fetchOk(`http://127.0.0.1:${ollamaPort}/api/tags`)
    );

    await check('proxy /v1/models (auth)', () =>
      fetchOk(`http://127.0.0.1:${proxyPort}/v1/models`, {
        headers: { Authorization: `Bearer ${authKey}` },
      })
    );

    await check('proxy chat rewrite', () =>
      fetchOk(`http://127.0.0.1:${proxyPort}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.cursorModelName,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
    );

    if (!options.mock && config.tunnelHostname) {
      await check('tunnel /v1/models', () =>
        fetchOk(`https://${config.tunnelHostname}/v1/models`, {
          headers: { Authorization: `Bearer ${authKey}` },
        })
      );
    }

    printCursorBlock(config, authKey);
    console.log(`Results: ${pass} passed, ${fail} failed`);

    if (fail > 0) {
      process.exitCode = 1;
    }
  } finally {
    if (options.mock) {
      await cleanup();
    }
  }
}
