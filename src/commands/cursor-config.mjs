import { loadConfig, getAuthKey, loadModelsMap } from '../lib/config.mjs';
import { printCursorBlock } from '../lib/cursor-block.mjs';

export async function runCursorConfig(options = {}) {
  const config = loadConfig({ local: options.local });
  const modelsMap = loadModelsMap({ local: options.local });
  const authKey = getAuthKey(config, modelsMap);
  printCursorBlock(config, authKey);
}
