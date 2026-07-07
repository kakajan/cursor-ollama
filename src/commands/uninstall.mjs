import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { runUninstall } from '../lib/uninstall.mjs';

function printLog(lines = []) {
  for (const line of lines) {
    const prefix = line.type === 'err' ? '!' : '-';
    console.log(`${prefix} ${line.text}`);
  }
}

export async function runUninstallCommand(options = {}) {
  if (!options.yes) {
    const rl = readline.createInterface({ input, output });
    try {
      console.log('This removes cursor-ollama tray, shortcuts, background stack, and optional services.');
      console.log('Cloudflare tunnel DNS and remote tunnel are not deleted automatically.');
      const answer = await rl.question('Continue uninstall? [y/N] ');
      if (!/^y(es)?$/i.test(answer.trim())) {
        console.log('Cancelled.');
        return;
      }
    } finally {
      rl.close();
    }
  }

  const result = await runUninstall({
    keepConfig: options.keepConfig === true,
    keepTunnel: options.keepTunnel === true,
    removeServices: options.removeServices !== false,
    removeTunnelConfig: options.removeTunnelConfig === true,
    local: options.local,
  });

  printLog(result.log);
}
