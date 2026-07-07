import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { startAboutServer } from './about-server.mjs';

const execFileAsync = promisify(execFile);

let activeAboutServer = null;

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

export async function openAboutPage() {
  if (!activeAboutServer) {
    activeAboutServer = await startAboutServer({
      onClose: () => {
        activeAboutServer = null;
      },
    });
  }

  await openBrowser(activeAboutServer.url);
  return { url: activeAboutServer.url };
}
