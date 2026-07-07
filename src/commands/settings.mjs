import { openConfigFile, openSettingsPage } from '../lib/settings-ui.mjs';

export async function runSettings(options = {}) {
  if (options.config) {
    openConfigFile();
    console.log('Opened config.json in your default editor.');
    return;
  }

  const { url } = await openSettingsPage();
  console.log(`Settings: ${url}`);
  console.log('Press Ctrl+C here to stop the settings server.');
}
