import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { saveConfig, loadConfig, generateAuthKey } from '../src/lib/config.mjs';
import { writeModelsMap, buildModelsMap } from '../src/lib/models-map.mjs';

describe('CLI config', () => {
  let tempHome;

  before(() => {
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-ollama-test-'));
    process.env.CURSOR_OLLAMA_CONFIG_DIR = tempHome;
  });

  after(() => {
    delete process.env.CURSOR_OLLAMA_CONFIG_DIR;
    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('saveConfig and loadConfig round-trip', () => {
    const key = generateAuthKey();
    saveConfig({
      tunnelHostname: 'test.example.com',
      tunnelName: 'test-tunnel',
      ollamaAuthKey: key,
    });

    const loaded = loadConfig();
    assert.equal(loaded.tunnelHostname, 'test.example.com');
    assert.equal(loaded.tunnelName, 'test-tunnel');
    assert.equal(loaded.ollamaAuthKey, key);
  });

  it('writeModelsMap creates mapping file', () => {
    const config = loadConfig();
    const { mapPath, map } = writeModelsMap(config);
    assert.ok(fs.existsSync(mapPath));
    assert.equal(map.mappings[0].cursorName, config.cursorModelName);
    assert.equal(map.mappings[0].ollamaName, config.ollamaSourceModel);
    assert.equal(map.authKey, config.ollamaAuthKey);
  });

  it('buildModelsMap uses secure tunnel by default', () => {
    const map = buildModelsMap({ ...loadConfig(), ollamaAuthKey: 'secret' });
    assert.equal(map.secureTunnel, true);
    assert.equal(map.cursorBaseUrl, `https://${loadConfig().tunnelHostname}/v1`);
  });
});
