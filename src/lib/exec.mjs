import { spawn, execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const executableCache = new Map();

const WINDOWS_EXECUTABLE_EXTS = ['.exe', '.cmd', '.bat', '.com'];

export function pickWindowsExecutable(candidates = []) {
  const trimmed = candidates.map((line) => line.trim()).filter(Boolean);
  if (trimmed.length === 0) return '';

  for (const ext of WINDOWS_EXECUTABLE_EXTS) {
    const match = trimmed.find((candidate) => candidate.toLowerCase().endsWith(ext));
    if (match) return match;
  }

  return trimmed[0];
}

function resolveNpmCmdShim(shimPath, cmdName) {
  const ext = path.extname(shimPath).toLowerCase();
  if (ext !== '.cmd' && ext !== '.bat') return '';

  const shimDir = path.dirname(shimPath);
  const packageName = cmdName || path.basename(shimPath, ext);
  const candidates = [
    path.join(shimDir, 'node_modules', packageName, 'bin', `${packageName}.exe`),
    path.join(shimDir, 'node_modules', packageName, 'bin', packageName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return '';
}

function finalizeWindowsExecutable(resolved, cmd) {
  if (!resolved) return resolved;
  if (/\.exe$/i.test(resolved)) return resolved;

  const npmBinary = resolveNpmCmdShim(resolved, cmd);
  if (npmBinary) return npmBinary;

  return resolved;
}

export function needsShellSpawn(resolvedPath) {
  return process.platform === 'win32' && /\.(cmd|bat)$/i.test(resolvedPath);
}

function spawnCommand(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: options.inherit ? 'inherit' : 'pipe',
      shell: options.shell ?? needsShellSpawn(cmd),
      env: { ...process.env, ...options.env },
      cwd: options.cwd,
      windowsHide: options.windowsHide,
    });

    let stdout = '';
    let stderr = '';

    if (!options.inherit) {
      child.stdout?.on('data', (d) => {
        stdout += d.toString();
      });
      child.stderr?.on('data', (d) => {
        stderr += d.toString();
      });
    }

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0 || options.allowFail) {
        resolve({ code, stdout, stderr });
      } else {
        reject(new Error(`${cmd} ${args.join(' ')} failed (${code}): ${stderr || stdout}`));
      }
    });
  });
}

export async function resolveExecutable(cmd) {
  if (process.platform !== 'win32') return cmd;
  if (/[/\\]/.test(cmd) || /\.(exe|cmd|bat|com)$/i.test(cmd)) return cmd;
  if (executableCache.has(cmd)) return executableCache.get(cmd);

  try {
    const { stdout } = await spawnCommand('where.exe', [cmd], { allowFail: true });
    const resolved = finalizeWindowsExecutable(pickWindowsExecutable(stdout.split(/\r?\n/)), cmd);
    if (resolved) {
      executableCache.set(cmd, resolved);
      return resolved;
    }
  } catch {
    // fall through
  }

  return cmd;
}

export function commandExists(cmd) {
  return new Promise((resolve) => {
    const checker = process.platform === 'win32' ? 'where.exe' : 'which';
    const child = spawn(checker, [cmd], { stdio: 'ignore' });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

export async function runCommand(cmd, args = [], options = {}) {
  const resolved = await resolveExecutable(cmd);
  return spawnCommand(resolved, args, options);
}

export function spawnBackground(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const { env, cwd, shell, ...spawnOptions } = options;
    const child = spawn(cmd, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      shell: shell ?? needsShellSpawn(cmd),
      env: { ...process.env, ...env },
      cwd,
      ...spawnOptions,
    });

    child.once('error', reject);
    child.once('spawn', () => resolve(child));
  });
}

export async function runCapture(cmd, args = []) {
  const { stdout } = await runCommand(cmd, args);
  return stdout.trim();
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isWindowsAdmin() {
  if (process.platform !== 'win32') return true;
  const { code } = await runCommand('net', ['session'], { allowFail: true });
  return code === 0;
}

export const WINDOWS_SERVICE_HINT =
  'On Windows, service install needs an elevated terminal (Run as Administrator).\n' +
  '  Easiest: cursor-ollama tray\n' +
  '  Or: cursor-ollama proxy start  +  cursor-ollama tunnel run\n' +
  '  Or setup with: cursor-ollama setup --skip-service';

export const CLOUDFLARED_INSTALL_HINT =
  'Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ ' +
  '(or npm i -g cloudflared, then restart the terminal)';

export async function fetchOk(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`);
  }
  return res;
}

export { execFileAsync, spawnCommand };
