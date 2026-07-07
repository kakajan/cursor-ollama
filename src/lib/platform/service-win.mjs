import fs from 'node:fs';
import path from 'node:path';
import { isWindowsAdmin, runCommand, WINDOWS_SERVICE_HINT } from '../exec.mjs';
import { getConfigDir, getProxyServerPath } from '../paths.mjs';
import { getModelsMapPath } from '../config.mjs';

export async function installProxyService(config) {
  if (!(await isWindowsAdmin())) {
    throw new Error(`Access is denied (Administrator required).\n${WINDOWS_SERVICE_HINT}`);
  }

  const node = process.execPath;
  const proxyScript = getProxyServerPath();
  const mapPath = getModelsMapPath();
  const wrapperDir = path.join(getConfigDir(), 'scripts');
  const wrapper = path.join(wrapperDir, 'start-proxy.cmd');
  const content = `@echo off\r\nset MODELS_MAP_PATH=${mapPath}\r\n"${node}" "${proxyScript}"\r\n`;
  fs.mkdirSync(wrapperDir, { recursive: true });
  fs.writeFileSync(wrapper, content, 'utf8');

  const taskName = 'CursorOllamaProxy';
  await runCommand('schtasks', ['/Delete', '/TN', taskName, '/F'], { allowFail: true });
  await runCommand(
    'schtasks',
    [
      '/Create',
      '/TN',
      taskName,
      '/TR',
      wrapper,
      '/SC',
      'ONSTART',
      '/RL',
      'LIMITED',
      '/F',
    ],
    { inherit: true },
  );
  await runCommand('schtasks', ['/Run', '/TN', taskName], { inherit: true });
  console.log(`Proxy scheduled task installed: ${taskName}`);
}

export async function stopProxyService() {
  await runCommand('schtasks', ['/End', '/TN', 'CursorOllamaProxy'], { allowFail: true });
}

export async function uninstallProxyService() {
  await runCommand('schtasks', ['/End', '/TN', 'CursorOllamaProxy'], { allowFail: true });
  await runCommand('schtasks', ['/Delete', '/TN', 'CursorOllamaProxy', '/F'], { allowFail: true });
}

export async function proxyServiceStatus() {
  try {
    const { stdout } = await runCommand('schtasks', ['/Query', '/TN', 'CursorOllamaProxy', '/FO', 'LIST']);
    console.log(stdout.trim() || 'CursorOllamaProxy task not found');
  } catch {
    console.log('CursorOllamaProxy task not found');
  }
}
