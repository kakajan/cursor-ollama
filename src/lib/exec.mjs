import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function commandExists(cmd) {
  return new Promise((resolve) => {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    const child = spawn(checker, [cmd], { stdio: 'ignore', shell: process.platform === 'win32' });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

export function runCommand(cmd, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: options.inherit ? 'inherit' : 'pipe',
      shell: options.shell ?? false,
      env: { ...process.env, ...options.env },
      cwd: options.cwd,
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

export async function runCapture(cmd, args = []) {
  const { stdout } = await runCommand(cmd, args);
  return stdout.trim();
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchOk(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`);
  }
  return res;
}

export { execFileAsync };
