import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { load } from 'cheerio';
import { args } from './args.js';
import { filesIn } from '../src/lib/source-admission.js';
import { withBase } from '../src/lib/urls.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { ContractError } from '../src/lib/errors.js';

export function auditOutput(directory: string) {
  const root = resolve(directory);
  const info = JSON.parse(readFileSync(join(root, 'build-info.json'), 'utf8'));
  const files = filesIn(root);
  if (info.deployEligible !== false) throw new Error('M0 output must be non-deployable');
  const allowed = /^(?:index\.html|start\/index\.html|404\.html|fixtures\/math\/index\.html|favicon\.svg|robots\.txt|build-info\.json|_astro\/[\w.-]+\.(?:css|woff2?|ttf))$/;
  for (const file of files) {
    if (!allowed.test(file)) throw new ContractError('UNEXPECTED_OUTPUT', file);
  }
  function targetOf(href: string, from: string) {
    const url = new URL(href, `https://output.invalid${from}`);
    if (url.hostname !== 'output.invalid') return null;
    if (!url.pathname.startsWith(info.config.basePath)) throw new ContractError('BASE_PATH_FAILURE', `${from}: ${href}`);
    const relative = decodeURIComponent(url.pathname.slice(info.config.basePath.length));
    let target = join(root, relative);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target) || !statSync(target).isFile()) throw new ContractError('BROKEN_OUTPUT_LINK', `${from}: ${href}`);
    if (url.hash) {
      const $ = load(readFileSync(target, 'utf8'));
      if (!$('[id]').toArray().some(el => $(el).attr('id') === decodeURIComponent(url.hash.slice(1)))) throw new ContractError('BROKEN_FRAGMENT', href);
    }
    return target;
  }
  for (const file of files.filter(f => f.endsWith('.html'))) {
    const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
    const from = withBase(route, info.config.basePath);
    const $ = load(readFileSync(join(root, file), 'utf8'));
    if ($('h1').length !== 1 || !$('meta[name="robots"]').attr('content')?.includes('noindex')) throw new Error(`Invalid private page structure: ${file}`);
    if ($('link[rel="canonical"]').attr('href') !== info.config.origin + from) throw new Error(`Canonical mismatch: ${file}`);
    if ($('.katex-error').length) throw new Error(`KaTeX error: ${file}`);
    for (const el of $('a[href],link[href],img[src],script[src]').toArray()) {
      const value = $(el).attr('href') ?? $(el).attr('src');
      if (value) targetOf(value, from);
    }
  }
  for (const file of files.filter(f => f.endsWith('.css'))) {
    const css = readFileSync(join(root, file), 'utf8');
    for (const match of css.matchAll(/url\((?:["']?)([^)'"\s]+)(?:["']?)\)/g)) {
      if (!match[1].startsWith('data:')) targetOf(match[1], withBase('/' + file, info.config.basePath));
    }
  }
  const inventory = files.map(path => { const raw = readFileSync(join(root, path)); return { path, bytes: raw.length, sha256: sha256(raw) }; });
  return { status: 'PASS', mode: info.mode, basePath: info.config.basePath, deployEligible: false, files: inventory, artifactSha256: sha256(stableJSON(inventory)) };
}

if (process.argv[1]?.endsWith('audit-output.ts')) {
  const options = args(['dir']);
  if (!options.dir) throw new Error('--dir required');
  const receipt = auditOutput(options.dir);
  mkdirSync('docs/evidence/m0', { recursive: true });
  writeFileSync(`docs/evidence/m0/${receipt.basePath === '/' ? 'root' : 'subpath'}-artifact.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ ...receipt, files: receipt.files.length }));
}
