import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runCommand } from '../exec.mjs';
import { getProxyServerPath } from '../paths.mjs';
import { getModelsMapPath } from '../config.mjs';

export async function installProxyService(config) {
  const node = process.execPath;
  const proxyScript = getProxyServerPath();
  const mapPath = getModelsMapPath();
  const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.cursor-ollama.proxy.plist');

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.cursor-ollama.proxy</string>
  <key>ProgramArguments</key>
  <array>
    <string>${node}</string>
    <string>${proxyScript}</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>MODELS_MAP_PATH</key><string>${mapPath}</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>`;

  fs.writeFileSync(plistPath, plist, 'utf8');
  await runCommand('launchctl', ['unload', plistPath], { allowFail: true });
  await runCommand('launchctl', ['load', plistPath], { inherit: true });
  console.log(`Proxy launchd agent installed: ${plistPath}`);
}

export async function stopProxyService() {
  const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', 'com.cursor-ollama.proxy.plist');
  await runCommand('launchctl', ['unload', plistPath], { allowFail: true, inherit: true });
}

export async function proxyServiceStatus() {
  await runCommand('launchctl', ['list'], { allowFail: true, inherit: true });
}
