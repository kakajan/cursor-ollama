import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { saveConfig, loadConfig, generateAuthKey, loadModelsMap } from '../src/lib/config.mjs';
import { writeModelsMap, buildModelsMap, activateMapping, getActiveMapping, isActiveMapping } from '../src/lib/models-map.mjs';

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

  it('writeModelsMap preserves extra mappings', () => {
    const config = loadConfig();
    writeModelsMap(config);
    const existing = loadModelsMap();
    existing.mappings.push({
      cursorName: 'gpt-4o',
      ollamaName: 'deepseek-coder-v2:16b',
      recommendedFor: 'chat',
    });
    fs.writeFileSync(
      path.join(tempHome, 'models.map.json'),
      `${JSON.stringify(existing, null, 2)}\n`,
    );

    writeModelsMap(config);
    const map = loadModelsMap();
    assert.equal(map.mappings.length, 2);
    assert.equal(map.mappings[1].cursorName, 'gpt-4o');
  });

  it('activateMapping updates config and models map', () => {
    const config = loadConfig();
    activateMapping(config, 'gpt-4o', 'llama3.2:3b');
    const loaded = loadConfig();
    assert.equal(loaded.cursorModelName, 'gpt-4o');
    assert.equal(loaded.ollamaSourceModel, 'llama3.2:3b');
    const map = loadModelsMap();
    assert.ok(map.mappings.some((entry) => entry.cursorName === 'gpt-4o'));
    assert.equal(map.activeMapping.ollamaName, 'llama3.2:3b');
  });

  it('getActiveMapping prefers models.map activeMapping', () => {
    const config = loadConfig();
    writeModelsMap(config);
    const existing = loadModelsMap();
    existing.activeMapping = {
      cursorName: 'gpt-4o',
      ollamaName: 'deepseek-coder-v2:16b',
    };
    fs.writeFileSync(
      path.join(tempHome, 'models.map.json'),
      `${JSON.stringify(existing, null, 2)}\n`,
    );

    const active = getActiveMapping(loadConfig());
    assert.equal(active.cursorName, 'gpt-4o');
    assert.equal(active.ollamaName, 'deepseek-coder-v2:16b');
    assert.equal(
      isActiveMapping(loadConfig(), {
        cursorName: 'gpt-4o',
        ollamaName: 'deepseek-coder-v2:16b',
      }),
      true,
    );
  });

  it('keeps empty tunnel hostname in quick mode', () => {
    saveConfig({
      ...loadConfig(),
      tunnelMode: 'quick',
      tunnelHostname: '',
    });

    const loaded = loadConfig();
    assert.equal(loaded.tunnelMode, 'quick');
    assert.equal(loaded.tunnelHostname, '');
  });
});
