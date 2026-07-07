import os from 'node:os';
import path from 'node:path';
import { getPackageRoot } from './paths.mjs';

export function getTrayIconPath() {
  const assetsDir = path.join(getPackageRoot(), 'assets');
  if (process.platform === 'win32') {
    return path.join(assetsDir, 'tray-icon.ico');
  }
  return path.join(assetsDir, 'tray-icon.png');
}
