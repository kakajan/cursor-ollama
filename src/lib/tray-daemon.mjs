import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { getConfigDir, getPackageRoot } from './paths.mjs';

export function getTrayPidPath() {
  return path.join(getConfigDir(), 'tray.pid');
}

export function readTrayPid() {
  try {
    const raw = fs.readFileSync(getTrayPidPath(), 'utf8').trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isFinite(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

export function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

export function clearTrayPid() {
  try {
    fs.unlinkSync(getTrayPidPath());
  } catch {
    // ignore missing file
  }
}

export function writeTrayPid(pid = process.pid) {
  fs.mkdirSync(getConfigDir(), { recursive: true });
  fs.writeFileSync(getTrayPidPath(), String(pid), 'utf8');
}

export function acquireTrayPid(pid = process.pid) {
  fs.mkdirSync(getConfigDir(), { recursive: true });
  const pidPath = getTrayPidPath();

  const writeExclusive = () => {
    fs.writeFileSync(pidPath, String(pid), { encoding: 'utf8', flag: 'wx' });
  };

  try {
    writeExclusive();
    return { acquired: true, pid };
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  const existingPid = readTrayPid();
  if (existingPid === pid) {
    return { acquired: true, pid };
  }
  if (isProcessRunning(existingPid)) {
    return { acquired: false, pid: existingPid };
  }

  clearTrayPid();
  try {
    writeExclusive();
    return { acquired: true, pid };
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    const lockedBy = readTrayPid();
    return { acquired: false, pid: lockedBy || null };
  }
}

export function releaseTrayPid() {
  if (readTrayPid() === process.pid) {
    clearTrayPid();
  }
}

export function isTrayRunning() {
  const pid = readTrayPid();
  if (!pid) return { running: false };
  if (isProcessRunning(pid)) return { running: true, pid };
  clearTrayPid();
  return { running: false };
}

export function stopTrayDaemon() {
  const { running, pid } = isTrayRunning();
  if (!running) return false;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // ignore stale pid
    }
  }

  clearTrayPid();
  return true;
}

export function spawnTrayBackground(options = {}) {
  const cliPath = path.join(getPackageRoot(), 'bin', 'cursor-ollama.mjs');
  const args = [cliPath, 'tray', '--foreground'];
  if (options.local) args.push('--local');

  const child = spawn(process.execPath, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: process.env,
  });

  child.unref();
  return child.pid;
}
