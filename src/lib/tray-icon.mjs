import fs from 'node:fs';
import path from 'node:path';
import { getPackageRoot } from './paths.mjs';

export const APP_ICON_PNG = 'logo.png';
export const APP_ICON_ICO = 'logo.ico';
export const APP_ICON_TRAY_PNG = 'tray-icon.png';

export function getAppIconPngPath() {
  return path.resolve(getPackageRoot(), 'assets', APP_ICON_PNG);
}

export function getAppIconIcoPath() {
  return path.resolve(getPackageRoot(), 'assets', APP_ICON_ICO);
}

export function getTrayIconPngPath() {
  return path.resolve(getPackageRoot(), 'assets', APP_ICON_TRAY_PNG);
}

/**
 * System tray icon — derived from assets/logo.png.
 * Windows systray2 only renders .ico; PNG (even tray-icon.png) shows a blank square.
 */
export function getTrayIconPath() {
  if (process.platform === 'win32') {
    const ico = getAppIconIcoPath();
    if (fs.existsSync(ico)) return ico;
  }

  const trayPng = getTrayIconPngPath();
  if (fs.existsSync(trayPng)) return trayPng;

  return getAppIconPngPath();
}

/** Windows .lnk shortcuts / installer — .ico derived from logo.png */
export function getShortcutIconPath() {
  if (process.platform === 'win32') {
    const ico = getAppIconIcoPath();
    if (fs.existsSync(ico)) return ico;
  }
  return getAppIconPngPath();
}

export function getAppIconPath() {
  return getShortcutIconPath();
}
