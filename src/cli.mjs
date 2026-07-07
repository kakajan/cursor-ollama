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
import { runTunnelCommand } from './commands/tunnel.mjs';
import { runWizard } from './commands/wizard.mjs';
import { runSettings } from './commands/settings.mjs';
import { runAbout } from './commands/about.mjs';
import { runStackCommand } from './commands/stack.mjs';
import { runUninstallCommand } from './commands/uninstall.mjs';
import { runTray } from './commands/tray.mjs';

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
    .option('--skip-pull', 'Skip ollama pull; require model already installed locally')
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

  const tunnel = program.command('tunnel').description('Manage Cloudflare Tunnel (cloudflared)');

  tunnel
    .command('run')
    .description('Run tunnel in foreground (dev)')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runTunnelCommand('run', opts);
    });

  tunnel
    .command('start')
    .description('Alias for tunnel run')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runTunnelCommand('run', opts);
    });

  tunnel
    .command('install')
    .description('Install cloudflared OS service')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runTunnelCommand('install', opts);
    });

  tunnel
    .command('status')
    .description('Show tunnel config path and reachability')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runTunnelCommand('status', opts);
    });

  program
    .command('wizard')
    .description('Open graphical setup wizard (Windows installer UI)')
    .option('--local', 'Use local project config')
    .option('--port <number>', 'Wizard HTTP port', '17435')
    .option('--no-browser', 'Do not open the default browser')
    .action(async (opts) => {
      await runWizard({
        local: opts.local,
        port: Number(opts.port),
        noBrowser: opts.noBrowser,
      });
    });

  program
    .command('settings')
    .description('Open settings page or config.json for ports and tunnel hostname')
    .option('--config', 'Open config.json in editor instead of the settings page')
    .action(async (opts) => {
      await runSettings(opts);
    });

  program
    .command('about')
    .description('Open about page (project info, support, contribute)')
    .action(async () => {
      await runAbout();
    });

  program
    .command('stack [action]')
    .description('Start/stop proxy + tunnel (start|stop|status|proxy-start|proxy-stop|tunnel-start|tunnel-stop)')
    .option('--local', 'Use local project config')
    .action(async (action, opts) => {
      await runStackCommand(action || 'status', opts);
    });

  program
    .command('uninstall')
    .description('Remove tray, shortcuts, services, and optional user config')
    .option('--yes', 'Skip confirmation prompt')
    .option('--keep-config', 'Keep ~/.cursor-ollama config and models map')
    .option('--keep-tunnel', 'Do not uninstall cloudflared service')
    .option('--remove-tunnel-config', 'Remove local tunnel yml and credentials file')
    .option('--skip-services', 'Do not remove proxy/cloudflared OS services')
    .option('--local', 'Use local project config')
    .action(async (opts) => {
      await runUninstallCommand({
        yes: opts.yes,
        keepConfig: opts.keepConfig,
        keepTunnel: opts.keepTunnel,
        removeTunnelConfig: opts.removeTunnelConfig,
        removeServices: !opts.skipServices,
        local: opts.local,
      });
    });

  program
    .command('tray')
    .description('System tray icon to start/stop proxy and tunnel (runs in background)')
    .option('--local', 'Use local project config')
    .option('--foreground', 'Keep tray attached to this terminal (debug)')
    .action(async (opts) => {
      await runTray(opts);
    });

  await program.parseAsync(argv);
}
