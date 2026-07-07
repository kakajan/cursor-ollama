import fs from 'node:fs';
import path from 'node:path';
import { getPackageRoot } from './paths.mjs';

let cachedMeta = null;

export function getAppMeta() {
  if (cachedMeta) {
    return cachedMeta;
  }

  const pkgPath = path.join(getPackageRoot(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const repoRaw = pkg.repository?.url || 'https://github.com/kakajan/cursor-ollama';
  const repository = repoRaw
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/^git@github\.com:/, 'https://github.com/');

  cachedMeta = {
    name: pkg.name || 'cursor-ollama',
    version: pkg.version || '0.0.0',
    description: pkg.description || '',
    license: pkg.license || 'MIT',
    author: pkg.author || '',
    homepage: pkg.homepage || 'https://kakajan.github.io/cursor-ollama/',
    repository,
    bugs: pkg.bugs?.url || 'https://github.com/kakajan/cursor-ollama/issues',
    npm: 'https://www.npmjs.com/package/cursor-ollama',
  };

  return cachedMeta;
}
