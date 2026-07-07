import {
  installTunnelService,
  loadTunnelConfig,
  printTunnelInfo,
  runTunnelForeground,
} from '../lib/tunnel.mjs';

export async function runTunnelCommand(action, options = {}) {
  const config = loadTunnelConfig(options);

  switch (action) {
    case 'run':
    case 'start':
      await runTunnelForeground(config);
      break;
    case 'install':
      await installTunnelService(config);
      break;
    case 'info':
    case 'status':
      await printTunnelInfo(config);
      break;
    default:
      throw new Error(`Unknown tunnel action: ${action}`);
  }
}
