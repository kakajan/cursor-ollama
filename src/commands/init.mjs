import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { DEFAULTS, generateAuthKey, saveConfig } from '../lib/config.mjs';
import { writeModelsMap } from '../lib/models-map.mjs';
import { printCursorBlock } from '../lib/cursor-block.mjs';
import { getConfigDir } from '../lib/paths.mjs';
import { listLocalModels } from '../lib/ollama.mjs';

async function ask(rl, question, defaultValue) {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || defaultValue || '';
}

async function askYesNo(rl, question, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer.startsWith('y');
}

async function askForModel(rl, localModels) {
  if (localModels.length === 0) {
    return ask(rl, 'Ollama model name', DEFAULTS.ollamaSourceModel);
  }

  console.log('\nLocal Ollama models:');
  localModels.forEach((name, index) => {
    console.log(`  ${index + 1}) ${name}`);
  });
  console.log(`  m) Enter model name manually`);
  console.log(`  d) Default (${DEFAULTS.ollamaSourceModel})`);

  while (true) {
    const answer = (await rl.question(`Choose model [1]: `)).trim().toLowerCase();
    if (!answer || answer === '1') {
      return localModels[0];
    }
    if (answer === 'd') {
      return DEFAULTS.ollamaSourceModel;
    }
    if (answer === 'm') {
      return ask(rl, 'Ollama model name', DEFAULTS.ollamaSourceModel);
    }
    const index = Number(answer);
    if (Number.isInteger(index) && index >= 1 && index <= localModels.length) {
      return localModels[index - 1];
    }
    if (answer.includes(':') || answer.includes('.')) {
      return answer;
    }
    console.log('Invalid choice. Enter a number, model name, m, or d.');
  }
}

export async function runInit() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('cursor-ollama init — first-time setup\n');

    const tunnelHostname = await ask(rl, 'Tunnel hostname (no https://)', DEFAULTS.tunnelHostname);
    const tunnelName = await ask(rl, 'Cloudflare tunnel name', DEFAULTS.tunnelName);

    const localModels = await listLocalModels(DEFAULTS.ollamaPort);
    if (localModels.length > 0) {
      console.log(`\nFound ${localModels.length} local model(s) from Ollama.`);
    } else {
      console.log('\nOllama is not running or has no local models yet.');
    }

    const ollamaSourceModel = await askForModel(rl, localModels);
    const cursorModelName = await ask(rl, 'Cursor model name (allowlisted)', DEFAULTS.cursorModelName);
    const skipModelPull = await askYesNo(
      rl,
      'Skip pulling model during setup (use existing local model only)?',
      false,
    );

    const config = saveConfig({
      tunnelHostname,
      tunnelName,
      ollamaSourceModel,
      cursorModelName,
      ollamaAuthKey: generateAuthKey(),
      secureTunnel: true,
      skipModelPull,
    });

    const { mapPath } = writeModelsMap(config);
    console.log(`\nWrote ${getConfigDir()}/config.json`);
    console.log(`Wrote ${mapPath}`);

    printCursorBlock(config, config.ollamaAuthKey);

    console.log('Next steps:');
    console.log('  1. cloudflared tunnel login');
    console.log(`  2. cloudflared tunnel create ${config.tunnelName}`);
    console.log('  3. cursor-ollama setup');
    console.log('  4. cursor-ollama tunnel run   # or: tunnel install for OS service');
    if (skipModelPull) {
      console.log('     (setup will not pull; ensure the model is already installed locally)');
    }
  } finally {
    rl.close();
  }
}
