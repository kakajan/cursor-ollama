import {
  formatStackStatus,
  getStackStatus,
  startAllStack,
  stopAllStack,
  startProxyStack,
  stopProxyStack,
  startTunnelStack,
  stopTunnelStack,
} from '../lib/stack-manager.mjs';

export async function runStackCommand(action = 'status', options = {}) {
  switch (action) {
    case 'start':
      await startAllStack(options);
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
    case 'stop':
      await stopAllStack(options);
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
    case 'proxy-start':
      await startProxyStack(options);
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
    case 'proxy-stop':
      await stopProxyStack(options);
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
    case 'tunnel-start':
      await startTunnelStack(options);
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
    case 'tunnel-stop':
      await stopTunnelStack(options);
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
    case 'status':
    default:
      console.log(formatStackStatus(await getStackStatus(options)));
      return;
  }
}
