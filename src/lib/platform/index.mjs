import os from 'node:os';

export async function getPlatformService() {
  const platform = os.platform();
  if (platform === 'win32') {
    return import('./service-win.mjs');
  }
  if (platform === 'darwin') {
    return import('./service-darwin.mjs');
  }
  return import('./service-linux.mjs');
}

export async function installProxyService(config) {
  const mod = await getPlatformService();
  return mod.installProxyService(config);
}

export async function stopProxyService() {
  const mod = await getPlatformService();
  return mod.stopProxyService();
}

export async function uninstallProxyService() {
  const mod = await getPlatformService();
  return mod.uninstallProxyService();
}

export async function proxyServiceStatus() {
  const mod = await getPlatformService();
  return mod.proxyServiceStatus();
}
