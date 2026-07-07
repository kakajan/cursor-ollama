import fs from 'node:fs';
import path from 'node:path';
import { runCommand } from '../exec.mjs';
import { getPackageRoot, getProxyServerPath } from '../paths.mjs';
import { getModelsMapPath } from '../config.mjs';

export async function installProxyService(config) {
  const node = process.execPath;
  const proxyScript = getProxyServerPath();
  const mapPath = getModelsMapPath();
  const wrapper = path.join(getPackageRoot(), 'scripts', 'start-proxy.cmd');
  const content = `@echo off\r\nset MODELS_MAP_PATH=${mapPath}\r\n"${node}" "${proxyScript}"\r\n`;
  fs.mkdirSync(path.dirname(wrapper), { recursive: true });
  fs.writeFileSync(wrapper, content, 'utf8');

  const taskName = 'CursorOllamaProxy';
  await runCommand('schtasks', ['/Delete', '/TN', taskName, '/F'], { allowFail: true, shell: true });
  await runCommand(
    'schtasks',
    [
      '/Create',
      '/TN',
      taskName,
      '/TR',
      `"${wrapper}"`,
      '/SC',
      'ONSTART',
      '/RL',
      'LIMITED',
      '/F',
    ],
    { shell: true, inherit: true }
  );
  await runCommand('schtasks', ['/Run', '/TN', taskName], { shell: true, inherit: true });
  console.log(`Proxy scheduled task installed: ${taskName}`);
}

export async function stopProxyService() {
  await runCommand('schtasks', ['/End', '/TN', 'CursorOllamaProxy'], { allowFail: true, shell: true });
}

export async function proxyServiceStatus() {
  try {
    const { stdout } = await runCommand('schtasks', ['/Query', '/TN', 'CursorOllamaProxy', '/FO', 'LIST'], {
      shell: true,
    });
    console.log(stdout.trim() || 'CursorOllamaProxy task not found');
  } catch {
    console.log('CursorOllamaProxy task not found');
  }
}
