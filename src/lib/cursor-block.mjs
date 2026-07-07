import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { getConfigDir } from './paths.mjs';
import { getPublicBaseUrl } from './quick-tunnel.mjs';

export function printCursorBlock(config, authKey) {
  console.log(formatCursorBlockText(config, authKey));
}

export function formatCursorBlockText(config, authKey) {
  const baseUrl = getPublicBaseUrl(config) || `https://${config.tunnelHostname}/v1`;
  const modeLine =
    config.tunnelMode === 'quick'
      ? '  Tunnel mode: temporary trycloudflare link'
      : '  Tunnel mode: Cloudflare domain';

  return [
    '========================================',
    ' Cursor Settings → Models',
    '========================================',
    modeLine,
    '  Override OpenAI Base URL: ON',
    `  Base URL:  ${baseUrl}`,
    `  OpenAI API Key: ${authKey}`,
    `  Add model: ${config.cursorModelName}`,
    `  Disable built-in ${config.cursorModelName} toggle if present`,
    `  Ollama runs: ${config.ollamaSourceModel}`,
    '========================================',
    '',
  ].join('\n');
}

export async function copyTextToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      const child = spawn('clip', [], { stdio: ['pipe', 'ignore', 'ignore'], windowsHide: true });
      child.on('error', reject);
      child.stdin.write(text);
      child.stdin.end();
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to copy to clipboard'));
      });
      return;
    }

    const cmd = process.platform === 'darwin' ? 'pbcopy' : 'xclip';
    const args = process.platform === 'darwin' ? [] : ['-selection', 'clipboard'];
    const child = spawn(cmd, args, { stdio: ['pipe', 'ignore', 'ignore'] });
    child.on('error', reject);
    child.stdin.write(text);
    child.stdin.end();
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('Failed to copy to clipboard'));
    });
  });
}

function openConfigFile(filePath) {
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', 'notepad.exe', filePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }).unref();
    return;
  }

  if (process.platform === 'darwin') {
    spawn('open', [filePath], { detached: true, stdio: 'ignore' }).unref();
    return;
  }

  spawn('xdg-open', [filePath], { detached: true, stdio: 'ignore' }).unref();
}

/** Tray-friendly: save, copy to clipboard, and open the config block in an editor. */
export async function showCursorConfig(config, authKey) {
  const text = formatCursorBlockText(config, authKey);
  const filePath = path.join(getConfigDir(), 'cursor-config.txt');
  fs.mkdirSync(getConfigDir(), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');

  let copied = false;
  try {
    await copyTextToClipboard(text);
    copied = true;
  } catch {
    // clipboard optional — file still opens
  }

  openConfigFile(filePath);

  return { filePath, copied };
}
