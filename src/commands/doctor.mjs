import { commandExists } from '../lib/exec.mjs';

const CHECKS = [
  { name: 'node', hint: 'https://nodejs.org' },
  { name: 'ollama', hint: 'https://ollama.com/download' },
  { name: 'cloudflared', hint: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/' },
];

export async function runDoctor(options = {}) {
  let failed = 0;

  for (const check of CHECKS) {
    const ok = await commandExists(check.name);
    if (ok) {
      console.log(`[OK] ${check.name}`);
    } else {
      console.log(`[MISSING] ${check.name} — install from ${check.hint}`);
      failed += 1;
    }
  }

  if (failed > 0 && !options.reportOnly) {
    process.exitCode = 1;
  }

  return failed === 0;
}
