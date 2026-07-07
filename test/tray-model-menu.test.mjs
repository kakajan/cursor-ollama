import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import {
  applyModelSelection,
  applyStackControlItems,
  getSelectedModelSeqId,
  isModelMenuItemChecked,
  stackControlTitle,
} from '../src/commands/tray.mjs';
import { saveConfig, loadConfig } from '../src/lib/config.mjs';
import { writeModelsMap, setOllamaBackend } from '../src/lib/models-map.mjs';

function writeActiveMapping(tempHome, cursorName, ollamaName) {
  const mapPath = path.join(tempHome, 'models.map.json');
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  map.activeMapping = { cursorName, ollamaName };
  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
}

describe('tray model menu selection', () => {
  let tempHome;
  const options = {};

  const makeModelItems = () => [
    {
      type: 'mapping',
      seqId: 5,
      mapping: { cursorName: 'local-ai', ollamaName: 'qwen3.6:35b-a3b' },
      item: { title: 'local-ai → qwen3.6:35b-a3b', tooltip: '', checked: false, enabled: true },
    },
    {
      type: 'ollama',
      seqId: 7,
      name: 'qwen3.6:35b-a3b',
      item: { title: 'Ollama: qwen3.6:35b-a3b', tooltip: '', checked: false, enabled: true },
    },
    {
      type: 'ollama',
      seqId: 8,
      name: 'gemma4:12b',
      item: { title: 'Ollama: gemma4:12b', tooltip: '', checked: false, enabled: true },
    },
  ];

  before(() => {
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-ollama-tray-test-'));
    process.env.CURSOR_OLLAMA_CONFIG_DIR = tempHome;

    saveConfig({
      cursorModelName: 'local-ai',
      ollamaSourceModel: 'gemma4:12b',
    });
    writeModelsMap(loadConfig(), options);
  });

  after(() => {
    delete process.env.CURSOR_OLLAMA_CONFIG_DIR;
    fs.rmSync(tempHome, { recursive: true, force: true });
  });

  it('prefers an exact mapping match over the Ollama row', () => {
    const modelItems = makeModelItems();
    writeActiveMapping(tempHome, 'local-ai', 'qwen3.6:35b-a3b');
    const config = loadConfig();

    assert.equal(
      getSelectedModelSeqId(config, options, modelItems),
      'mapping:local-ai\u0000qwen3.6:35b-a3b',
    );
    assert.equal(isModelMenuItemChecked(config, options, modelItems, modelItems[0]), true);
    assert.equal(isModelMenuItemChecked(config, options, modelItems, modelItems[1]), false);
  });

  it('selects a single Ollama row when no mapping matches', () => {
    const modelItems = makeModelItems();
    writeActiveMapping(tempHome, 'local-ai', 'gemma4:12b');
    const config = loadConfig();

    assert.equal(getSelectedModelSeqId(config, options, modelItems), 'ollama:gemma4:12b');
    assert.equal(isModelMenuItemChecked(config, options, modelItems, modelItems[2]), true);
    assert.equal(isModelMenuItemChecked(config, options, modelItems, modelItems[0]), false);
    assert.equal(isModelMenuItemChecked(config, options, modelItems, modelItems[1]), false);
  });

  it('applyModelSelection sends update-item actions with seq ids after a switch', async () => {
    const modelItems = makeModelItems();
    // Start from qwen active so rows need updating after switch to gemma.
    writeActiveMapping(tempHome, 'local-ai', 'qwen3.6:35b-a3b');
    modelItems[0].item.checked = true;

    const actions = [];
    const fakeSystray = {
      sendAction: async (action) => {
        actions.push(action);
      },
    };
    const trayState = { modelItems };

    setOllamaBackend(loadConfig(), 'gemma4:12b', options);
    await applyModelSelection(fakeSystray, options, trayState);

    assert.ok(actions.length > 0);
    assert.ok(actions.every((action) => action.type === 'update-item'));
    assert.ok(actions.every((action) => Number.isInteger(action.seq_id) && action.seq_id >= 0));

    // Mapping row title reflects the new backend and keeps the single check.
    assert.equal(modelItems[0].item.title, 'local-ai → gemma4:12b');

    const checkedRows = modelItems.filter((entry) => entry.item.checked);
    assert.equal(checkedRows.length, 1);
    assert.equal(checkedRows[0].type, 'mapping');
    assert.equal(checkedRows[0].mapping.ollamaName, 'gemma4:12b');
  });

  it('stackControlTitle flips labels from live proxy/tunnel status', () => {
    assert.equal(
      stackControlTitle('all', { proxyUp: false, tunnelUp: false }),
      'Start all',
    );
    assert.equal(
      stackControlTitle('all', { proxyUp: true, tunnelUp: false }),
      'Stop all',
    );
    assert.equal(stackControlTitle('proxy', { proxyUp: true, tunnelUp: false }), 'Stop proxy');
    assert.equal(stackControlTitle('tunnel', { proxyUp: true, tunnelUp: false }), 'Start tunnel');
  });

  it('applyStackControlItems updates stack rows via update-item', async () => {
    const actions = [];
    const fakeSystray = {
      sendAction: async (action) => {
        actions.push(action);
      },
    };
    const trayState = {
      stackControlItems: [
        {
          scope: 'all',
          seqId: 0,
          item: { title: 'Start all', tooltip: 'Start all', checked: false, enabled: true },
        },
        {
          scope: 'proxy',
          seqId: 2,
          item: { title: 'Start proxy', tooltip: 'Start proxy', checked: false, enabled: true },
        },
        {
          scope: 'tunnel',
          seqId: 3,
          item: { title: 'Start tunnel', tooltip: 'Start tunnel', checked: false, enabled: true },
        },
      ],
    };

    await applyStackControlItems(fakeSystray, trayState, {
      proxyUp: true,
      tunnelUp: false,
    });

    assert.equal(actions.length, 2);
    assert.equal(trayState.stackControlItems[0].item.title, 'Stop all');
    assert.equal(trayState.stackControlItems[1].item.title, 'Stop proxy');
    assert.equal(trayState.stackControlItems[2].item.title, 'Start tunnel');
    assert.ok(actions.every((action) => action.type === 'update-item'));
  });
});
