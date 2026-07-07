import path from 'node:path';
import { getPackageRoot } from './paths.mjs';

export function getTrayIconPath() {
  const assetsDir = path.join(getPackageRoot(), 'assets');
  const file = process.platform === 'win32' ? 'tray-icon.ico' : 'tray-icon.png';
  return path.resolve(assetsDir, file);
}
