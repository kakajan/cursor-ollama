import { loadConfig, getModelsMapPath } from '../lib/config.mjs';
import { startProxy } from '../../config/proxy/server.mjs';
import {
  installProxyService,
  stopProxyService,
  proxyServiceStatus,
} from '../lib/platform/index.mjs';

export async function runProxyCommand(action, options = {}) {
  const config = loadConfig({ local: options.local });
  const mapPath = getModelsMapPath(options.local);
  process.env.MODELS_MAP_PATH = mapPath;

  if (action === 'install') {
    await installProxyService(config);
    return;
  }

  if (action === 'start') {
    const { port } = await startProxy({ configPath: mapPath, port: config.proxyPort });
    console.log(`cursor-ollama proxy listening on http://127.0.0.1:${port}`);
    return;
  }

  if (action === 'stop') {
    await stopProxyService();
    console.log('Proxy service stop requested.');
    return;
  }

  if (action === 'status') {
    await proxyServiceStatus();
    return;
  }

  throw new Error(`Unknown proxy action: ${action}`);
}
