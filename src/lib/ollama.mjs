import { runCommand } from './exec.mjs';

export function modelNameMatches(available, wanted) {
  if (!wanted) return false;
  if (available.includes(wanted)) return true;

  const wantedBase = wanted.split(':')[0];
  return available.some((name) => {
    if (name === wanted) return true;
    if (name.startsWith(`${wantedBase}:`)) return true;
    if (!wanted.includes(':') && name.split(':')[0] === wanted) return true;
    return false;
  });
}

export async function listLocalModels(port = 11434) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((model) => model.name).filter(Boolean);
  } catch {
    return [];
  }
}

export async function modelExistsLocally(modelName, port = 11434) {
  const models = await listLocalModels(port);
  return modelNameMatches(models, modelName);
}

export async function ensureModelAvailable(config, options = {}) {
  const skipPull = options.skipPull === true;
  const modelName = config.ollamaSourceModel;

  if (await modelExistsLocally(modelName, config.ollamaPort)) {
    console.log(`Model ${modelName} is already available locally.`);
    return;
  }

  if (skipPull) {
    throw new Error(
      `Model ${modelName} is not installed locally. Run: ollama pull ${modelName}`,
    );
  }

  console.log(`Pulling model ${modelName}...`);
  await runCommand('ollama', ['pull', modelName], { inherit: options.inherit !== false });
}
