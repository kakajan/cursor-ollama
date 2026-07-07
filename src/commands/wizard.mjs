import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { startWizardServer } from '../lib/wizard-server.mjs';

const execFileAsync = promisify(execFile);

async function openBrowser(url) {
  if (process.platform === 'win32') {
    await execFileAsync('cmd', ['/c', 'start', '', url], { windowsHide: true });
    return;
  }
  if (process.platform === 'darwin') {
    await execFileAsync('open', [url]);
    return;
  }
  await execFileAsync('xdg-open', [url]);
}

export async function runWizard(options = {}) {
  const started = await startWizardServer({
    port: options.port,
    onClose: () => process.exit(0),
  });

  console.log(`Setup wizard: ${started.url}`);
  console.log('Press Ctrl+C here to stop the wizard server.');

  if (options.noBrowser !== true) {
    await openBrowser(started.url);
  }

  await new Promise((resolve) => {
    started.server.on('close', resolve);
    process.on('SIGINT', async () => {
      await started.close();
      resolve();
    });
  });
}
