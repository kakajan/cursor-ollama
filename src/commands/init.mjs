import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { DEFAULTS, generateAuthKey, saveConfig } from '../lib/config.mjs';
import { writeModelsMap } from '../lib/models-map.mjs';
import { printCursorBlock } from '../lib/cursor-block.mjs';
import { getConfigDir } from '../lib/paths.mjs';

async function ask(rl, question, defaultValue) {
  const suffix = defaultValue ? ` [${defaultValue}]` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || defaultValue || '';
}

export async function runInit() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('cursor-ollama init — first-time setup\n');

    const tunnelHostname = await ask(rl, 'Tunnel hostname (no https://)', DEFAULTS.tunnelHostname);
    const tunnelName = await ask(rl, 'Cloudflare tunnel name', DEFAULTS.tunnelName);
    const ollamaSourceModel = await ask(rl, 'Ollama model to pull', DEFAULTS.ollamaSourceModel);
    const cursorModelName = await ask(rl, 'Cursor model name (allowlisted)', DEFAULTS.cursorModelName);

    const config = saveConfig({
      tunnelHostname,
      tunnelName,
      ollamaSourceModel,
      cursorModelName,
      ollamaAuthKey: generateAuthKey(),
      secureTunnel: true,
    });

    const { mapPath } = writeModelsMap(config);
    console.log(`\nWrote ${getConfigDir()}/config.json`);
    console.log(`Wrote ${mapPath}`);

    printCursorBlock(config, config.ollamaAuthKey);

    console.log('Next steps:');
    console.log('  1. cloudflared tunnel login');
    console.log(`  2. cloudflared tunnel create ${config.tunnelName}`);
    console.log('  3. cursor-ollama setup');
  } finally {
    rl.close();
  }
}
