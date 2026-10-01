import { readFileSync } from 'node:fs';
import { filesIn } from './source-admission.js';
import { sha256, stableJSON } from './identity.js';

import { activePublication } from './publication.js';
export const privateRoutes = activePublication().manifest.routes;
export const syntheticRoutes = ['/fixtures/math/'];
export function buildInputs() {
  const paths = [
    'astro.config.mjs', 'tsconfig.json', '.node-version', '.npmrc', 'package.json', 'package-lock.json', 'config/research-source.json', '.github/workflows/site.yml',
    ...['src', 'scripts', 'public', 'research/publication'].flatMap(folder => filesIn(folder).filter(path => !path.split('/').includes('__pycache__')).map(path => `${folder}/${path}`))
  ].sort();
  const files = paths.map(path => { const raw = readFileSync(path); return { path, bytes: raw.length, sha256: sha256(raw) }; });
  return {
    inputsSha256: sha256(stableJSON(files)),
    lockfileSha256: sha256(readFileSync('package-lock.json')),
    contentSha256: sha256(stableJSON(files.filter(file => file.path.startsWith('research/publication/'))))
  };
}
