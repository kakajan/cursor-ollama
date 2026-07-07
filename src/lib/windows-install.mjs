import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCommand } from './exec.mjs';
import { getPackageRoot } from './paths.mjs';
import { getShortcutIconPath } from './tray-icon.mjs';

export function getLocalAppDir() {
  return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'cursor-ollama');
}

export function getLaunchersDir() {
  return path.join(getLocalAppDir(), 'launchers');
}

export function getTrayLauncherPath() {
  return path.join(getLaunchersDir(), 'Cursor-Ollama-Tray.cmd');
}

export function getWizardLauncherPath() {
  return path.join(getLaunchersDir(), 'Cursor-Ollama-Wizard.cmd');
}

function quote(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function writeWindowsLaunchers(config = {}) {
  if (process.platform !== 'win32') return { tray: '', wizard: '' };

  const launchersDir = getLaunchersDir();
  fs.mkdirSync(launchersDir, { recursive: true });

  const nodeExe = process.execPath;
  const cliPath = path.join(getPackageRoot(), 'bin', 'cursor-ollama.mjs');
  const trayPath = getTrayLauncherPath();
  const wizardPath = getWizardLauncherPath();

  const trayCmd = `@echo off\r\n${quote(nodeExe)} ${quote(cliPath)} tray\r\n`;
  const wizardCmd = `@echo off\r\nstart "" ${quote(nodeExe)} ${quote(cliPath)} wizard\r\n`;

  fs.writeFileSync(trayPath, trayCmd, 'utf8');
  fs.writeFileSync(wizardPath, wizardCmd, 'utf8');

  return { tray: trayPath, wizard: wizardPath, nodeExe, cliPath };
}

function psEscape(value) {
  return String(value).replace(/'/g, "''");
}

async function createShortcut({ shortcutPath, targetPath, shortcutArgs = '', iconPath, description = '' }) {
  const ps = [
    '$WshShell = New-Object -ComObject WScript.Shell',
    `$Shortcut = $WshShell.CreateShortcut('${psEscape(shortcutPath)}')`,
    `$Shortcut.TargetPath = '${psEscape(targetPath)}'`,
    `$Shortcut.Arguments = '${psEscape(shortcutArgs)}'`,
    `$Shortcut.WorkingDirectory = '${psEscape(path.dirname(targetPath))}'`,
    `$Shortcut.IconLocation = '${psEscape(iconPath)},0'`,
    `$Shortcut.Description = '${psEscape(description)}'`,
    '$Shortcut.Save()',
  ].join('; ');

  await runCommand(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps],
    { allowFail: true },
  );
}

export async function configureWindowsIntegration(options = {}) {
  const messages = [];
  if (process.platform !== 'win32') {
    return { messages: ['Windows integration skipped (not Windows).'] };
  }

  const { tray, wizard } = await writeWindowsLaunchers();
  const iconPath = getShortcutIconPath();

  if (options.createShortcut !== false) {
    const desktop = path.join(os.homedir(), 'Desktop', 'Cursor Ollama.lnk');
    const startMenu = path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'Cursor Ollama.lnk',
    );

    await createShortcut({
      shortcutPath: desktop,
      targetPath: tray,
      iconPath,
      description: 'cursor-ollama system tray',
    });
    await createShortcut({
      shortcutPath: startMenu,
      targetPath: tray,
      iconPath,
      description: 'cursor-ollama system tray',
    });

    const wizardDesktop = path.join(os.homedir(), 'Desktop', 'Cursor Ollama Setup.lnk');
    await createShortcut({
      shortcutPath: wizardDesktop,
      targetPath: wizard,
      iconPath,
      description: 'cursor-ollama setup wizard',
    });

    messages.push('میانبر دسکتاپ و منوی Start ساخته شد');
  }

  if (options.startWithWindows !== false) {
    const startup = path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'Startup',
      'Cursor Ollama.lnk',
    );
    await createShortcut({
      shortcutPath: startup,
      targetPath: tray,
      iconPath,
      description: 'cursor-ollama tray at login',
    });
    messages.push('اجرای خودکار با ویندوز فعال شد');
  }

  return { messages, tray, wizard, iconPath };
}

export async function removeWindowsStartupShortcut() {
  if (process.platform !== 'win32') return;
  const startup = path.join(
    process.env.APPDATA || '',
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
    'Startup',
    'Cursor Ollama.lnk',
  );
  try {
    fs.unlinkSync(startup);
  } catch {
    // ignore
  }
}

function removeShortcut(shortcutPath) {
  try {
    fs.unlinkSync(shortcutPath);
    return true;
  } catch {
    return false;
  }
}

export async function removeWindowsIntegration() {
  const messages = [];
  if (process.platform !== 'win32') {
    return { messages: ['Windows integration skipped (not Windows).'] };
  }

  const shortcuts = [
    path.join(os.homedir(), 'Desktop', 'Cursor Ollama.lnk'),
    path.join(os.homedir(), 'Desktop', 'Cursor Ollama Setup.lnk'),
    path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'Cursor Ollama.lnk',
    ),
    path.join(
      process.env.APPDATA || '',
      'Microsoft',
      'Windows',
      'Start Menu',
      'Programs',
      'Startup',
      'Cursor Ollama.lnk',
    ),
  ];

  let removed = 0;
  for (const shortcutPath of shortcuts) {
    if (removeShortcut(shortcutPath)) {
      removed += 1;
    }
  }

  if (removed > 0) {
    messages.push(`Removed ${removed} shortcut(s)`);
  } else {
    messages.push('No shortcuts found');
  }

  try {
    fs.rmSync(getLaunchersDir(), { recursive: true, force: true });
    messages.push('Removed AppData launchers');
  } catch {
    messages.push('Launchers folder was not found');
  }

  return { messages };
}
