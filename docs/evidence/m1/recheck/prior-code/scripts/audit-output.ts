import { publicationFor } from '../src/lib/publication.js';
import { renderEntrySync } from '../src/lib/content.js';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { load } from 'cheerio';
import { args } from './args.js';
import { filesIn, sourceState } from '../src/lib/source-admission.js';
import { withBase } from '../src/lib/urls.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { ContractError } from '../src/lib/errors.js';
import { buildInputs, privateRoutes, syntheticRoutes } from '../src/lib/build-identity.js';
import { buildMode } from '../src/lib/site-config.js';

function normalizedHTML(html: string) { return load(html,null,false).html().replace(/>\s+</g,'><').replace(/\s+/g,' ').trim(); }
export function auditOutput(directory: string) {
  const root = resolve(directory);
  const info = JSON.parse(readFileSync(join(root, 'build-info.json'), 'utf8'));
  const files = filesIn(root);
  if (info.schema !== 'unity-build-info/1' || !['preview', 'qualification'].includes(buildMode(info.mode)) || info.deployEligible !== false || info.corpusScope !== 'private-editorial-preview' || info.currentSourceQualified !== false || stableJSON(info.routes) !== stableJSON(privateRoutes) || stableJSON(info.syntheticRoutes) !== stableJSON(syntheticRoutes)) throw new ContractError('INVALID_ARTIFACT_IDENTITY', 'Expected the selected private reading corpus');
  if (info.configSha256 !== sha256(stableJSON(info.config)) || Object.entries(buildInputs()).some(([key, value]) => info[key] !== value)) throw new ContractError('STALE_BUILD_INPUTS', 'Source/config/dependency/renderer identities no longer match');
  if (stableJSON(info.sourceIntake) !== stableJSON(sourceState())) throw new ContractError('STALE_SOURCE_IDENTITY', 'Artifact source identity differs from actual admission');
  const selected=publicationFor(info.mode,info.config);
  if (stableJSON(info.publicationManifest) !== stableJSON(selected.manifest) || info.publicationManifestSha256 !== selected.manifestSha256) throw new ContractError('PUBLICATION_MANIFEST_MISMATCH','Artifact differs from production selection');
  const routeFiles=info.routes.map((r:string)=>r.endsWith('/') ? (r==='/'?'index.html':r.slice(1)+'index.html') : r.slice(1));
  for (const file of [...routeFiles, 'favicon.svg', 'robots.txt', 'build-info.json']) {
    if (!files.includes(file)) throw new ContractError('MISSING_OUTPUT', file);
  }
  const allowed = /^(?:favicon\.svg|robots\.txt|build-info\.json|_astro\/[\w.-]+\.(?:css|woff2?|ttf))$/;
  for (const file of files) {
    if (!allowed.test(file) && !routeFiles.includes(file)) throw new ContractError('UNEXPECTED_OUTPUT', file);
  }
  function targetOf(href: string, from: string, resource = false) {
    const url = new URL(href, `https://output.invalid${from}`);
    if (url.username || url.password) throw new ContractError('UNSAFE_OUTPUT_URL', href);
    if (url.origin !== 'https://output.invalid' && url.origin !== info.config.origin) {
      if (resource || url.protocol !== 'https:' || url.username || url.password) throw new ContractError('UNSAFE_OUTPUT_URL', href);
      return null;
    }
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
  for (const file of files.filter(f => f.endsWith('.svg'))) {
    const raw = readFileSync(join(root, file), 'utf8');
    const $ = load(raw, { xmlMode: true });
    const tags = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'title', 'desc']);
    if (/<!DOCTYPE/i.test(raw) || $('svg').length !== 1 || $('*').toArray().some(el => 'attribs' in el && (!tags.has(el.name) || Object.keys(el.attribs).some(key => /^(?:on|href$|xlink:href$|style$)/i.test(key))))) throw new ContractError('UNSAFE_SVG', file);
  }
  for (const file of files.filter(f => f.endsWith('.html'))) {
    const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
    const from = withBase(route, info.config.basePath);
    const $ = load(readFileSync(join(root, file), 'utf8'));
    const entry=selected.entries.find(e=>e.route===route);
    if (entry) {
      const expected=load(renderEntrySync(selected.corpus,entry,info.config.basePath),null,false).html();
      const actual=$('[data-canonical-body]').filter((_i,el)=>$(el).attr('data-canonical-body')===entry.id);
      if (actual.length!==1 || normalizedHTML(actual.html() ?? '')!==normalizedHTML(expected)) throw new ContractError('CONTENT_PARITY_FAILURE',entry.id);
    }
    if (readFileSync(join(root,file),'utf8').includes('DRAFT_SENTINEL_NOT_FOR_OUTPUT')) throw new ContractError('DRAFT_LEAK',file);
    if ($('h1').length !== 1 || !$('meta[name="robots"]').attr('content')?.includes('noindex')) throw new Error(`Invalid private page structure: ${file}`);
    if ($('link[rel="canonical"]').attr('href') !== info.config.origin + from) throw new Error(`Canonical mismatch: ${file}`);
    if ($('.katex-error').length) throw new Error(`KaTeX error: ${file}`);
    if ($('script,iframe,object,embed,foreignObject').length || $('*').toArray().some(el => 'attribs' in el && Object.keys(el.attribs).some(key => /^on/i.test(key)))) throw new ContractError('ACTIVE_OUTPUT', file);
    for (const el of $('a[href],link[href],img[src],script[src]').toArray()) {
      const value = $(el).attr('href') ?? $(el).attr('src');
      if (value) targetOf(value, from, el.tagName !== 'a');
    }
  }
  for (const file of files.filter(f => f.endsWith('.css'))) {
    const css = readFileSync(join(root, file), 'utf8');
    for (const match of css.matchAll(/url\((?:["']?)([^)'"\s]+)(?:["']?)\)/g)) {
      if (!match[1].startsWith('data:')) targetOf(match[1], withBase('/' + file, info.config.basePath), true);
    }
  }
  const inventory = files.map(path => { const raw = readFileSync(join(root, path)); return { path, bytes: raw.length, sha256: sha256(raw) }; });
  return { status: 'PASS', mode: info.mode, basePath: info.config.basePath, deployEligible: false, files: inventory, artifactSha256: sha256(stableJSON(inventory)) };
}

if (process.argv[1]?.endsWith('audit-output.ts')) {
  const options = args(['dir']);
  if (!options.dir) throw new Error('--dir required');
  const receipt = auditOutput(options.dir);
  const evidence = process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m0';
  mkdirSync(evidence, { recursive: true });
  writeFileSync(`${evidence}/${receipt.basePath === '/' ? 'root' : 'subpath'}-artifact.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ ...receipt, files: receipt.files.length }));
}
