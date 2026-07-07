import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runDoctor } from './commands/doctor.mjs';
import { runInit } from './commands/init.mjs';
import { runSetup } from './commands/setup.mjs';
import { runVerify } from './commands/verify.mjs';
import { runCursorConfig } from './commands/cursor-config.mjs';
import { runProxyCommand } from './commands/proxy.mjs';

function getVersion() {
  const pkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
  return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
}

export async function runCli(argv) {
  const program = new Command();

  program
    .name('cursor-ollama')
    .description('Cloudflare Tunnel + Ollama proxy for Cursor IDE')
    .version(getVersion());

  program
    .command('init')
    .description('Interactive first-time setup wizard')
    .action(async () => {
      await runInit();
    });

  program
    .command('setup')
    .description('Full install: Ollama pull, proxy service, Cloudflare tunnel')
    .option('--local', 'Use ./.env and ./config from current directory')
    .option('--skip-tunnel', 'Skip cloudflared tunnel setup')
    .option('--skip-service', 'Skip OS proxy service install')
    .action(async (opts) => {
      await runSetup(opts);
    });

  program
    .command('verify')
    .description('Health checks for Ollama, proxy, and tunnel')
    .option('--local', 'Use local project config')
    .option('--mock', 'Run against mock Ollama (CI/dev)')
    .action(async (opts) => {
      await runVerify(opts);
    });

  program
    .command('cursor-config')
    .description('Print Cursor Settings copy-paste block')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runCursorConfig(opts);
    });

  program
    .command('doctor')
    .description('Check prerequisites (node, ollama, cloudflared)')
    .option('--report-only', 'Print status without failing when tools are missing')
    .action(async (opts) => {
      await runDoctor(opts);
    });

  const proxy = program.command('proxy').description('Manage the local proxy');

  proxy
    .command('install')
    .description('Install proxy OS service')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runProxyCommand('install', opts);
    });

  proxy
    .command('start')
    .description('Start proxy in foreground (dev)')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runProxyCommand('start', opts);
    });

  proxy
    .command('stop')
    .description('Stop proxy OS service')
    .action(async () => {
      await runProxyCommand('stop');
    });

  proxy
    .command('status')
    .description('Show proxy OS service status')
    .action(async () => {
      await runProxyCommand('status');
    });

  await program.parseAsync(argv);
}
