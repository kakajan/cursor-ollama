import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runCommand } from '../exec.mjs';
import { getProxyServerPath } from '../paths.mjs';
import { getModelsMapPath } from '../config.mjs';

const UNIT = '/etc/systemd/system/cursor-ollama-proxy.service';

export async function installProxyService(config) {
  const node = process.execPath;
  const proxyScript = getProxyServerPath();
  const mapPath = getModelsMapPath();
  const unit = `[Unit]
Description=Cursor Ollama Proxy (Strategy C)
After=network.target

[Service]
Type=simple
User=${os.userInfo().username}
WorkingDirectory=${path.dirname(proxyScript)}
Environment=MODELS_MAP_PATH=${mapPath}
ExecStart=${node} ${proxyScript}
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
`;

  fs.writeFileSync(UNIT, unit, 'utf8');
  await runCommand('sudo', ['systemctl', 'daemon-reload'], { inherit: true });
  await runCommand('sudo', ['systemctl', 'enable', '--now', 'cursor-ollama-proxy.service'], { inherit: true });
  console.log(`Proxy systemd service installed: ${UNIT}`);
}

export async function stopProxyService() {
  await runCommand('sudo', ['systemctl', 'stop', 'cursor-ollama-proxy.service'], { allowFail: true, inherit: true });
}

export async function proxyServiceStatus() {
  await runCommand('systemctl', ['status', 'cursor-ollama-proxy.service', '--no-pager'], {
    allowFail: true,
    inherit: true,
  });
}
