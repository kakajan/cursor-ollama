export function printCursorBlock(config, authKey) {
  console.log('');
  console.log('========================================');
  console.log(' Cursor Settings → Models');
  console.log('========================================');
  console.log('  Override OpenAI Base URL: ON');
  console.log(`  Base URL:  https://${config.tunnelHostname}/v1`);
  console.log(`  OpenAI API Key: ${authKey}`);
  console.log(`  Add model: ${config.cursorModelName}`);
  console.log(`  Disable built-in ${config.cursorModelName} toggle if present`);
  console.log(`  Ollama runs: ${config.ollamaSourceModel}`);
  console.log('========================================');
  console.log('');
}
