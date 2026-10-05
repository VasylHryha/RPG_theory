import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { filesIn } from './source-admission.js';
import { sha256, stableJSON } from './identity.js';

export const syntheticRoutes = ['/fixtures/math/'];
export function buildInputs(root=process.cwd()) {
  const paths = [
    'astro.config.mjs', 'tsconfig.json', '.node-version', '.npmrc', 'package.json', 'package-lock.json', 'config/research-source.json', 'config/publication-policy.json', 'CONTRIBUTING.md', 'RIGHTS.md',
    ...['src', 'scripts', 'public', '.github', 'research/publication', 'licenses'].flatMap(folder => filesIn(resolve(root,folder)).filter(path => !path.split('/').includes('__pycache__') && !(folder==='research/publication' && path==='reviews.yaml')).map(path => `${folder}/${path}`))
  ].sort();
  const files = paths.map(path => { const raw = readFileSync(resolve(root,path)); return { path, bytes: raw.length, sha256: sha256(raw) }; });
  return {
    inputsSha256: sha256(stableJSON(files)),
    lockfileSha256: sha256(readFileSync(resolve(root,'package-lock.json'))),
    contentSha256: sha256(stableJSON(files.filter(file => file.path.startsWith('research/publication/'))))
  };
}
