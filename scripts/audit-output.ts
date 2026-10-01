import { publicationFor, isHistorical } from '../src/lib/publication.js';
import { renderStatus, renderRecordDetails, renderReferences, renderNavigation, renderHomeStatus, renderEditorialState } from '../src/lib/presentation.js';
import { renderEntrySync } from '../src/lib/content.js';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { load } from 'cheerio';
import { args } from './args.js';
import { filesIn, sourceState } from '../src/lib/source-admission.js';
import { safePath, withBase } from '../src/lib/urls.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { ContractError } from '../src/lib/errors.js';
import { buildInputs, syntheticRoutes } from '../src/lib/build-identity.js';
import { buildMode } from '../src/lib/site-config.js';

function normalizedHTML(html: string) {
  const $=load(html,null,false);
  function normalize(node: any, preserve=false) {
    const exact=preserve || ['pre','code'].includes(node.name);
    if(node.type==='comment') { $(node).remove(); return; }
    if(node.type==='text' && !exact) { node.data=node.data.replace(/\s+/g,' '); if(!node.data.trim()) $(node).remove(); }
    node.children?.slice().forEach((child:any)=>normalize(child,exact));
  }
  normalize($.root()[0]); return $.html();
}
export function auditOutput(directory: string) {
  const root = resolve(directory);
  const info = JSON.parse(readFileSync(join(root, 'build-info.json'), 'utf8'));
  const files = filesIn(root);
  if (info.schema !== 'unity-build-info/1' || !['preview', 'qualification'].includes(buildMode(info.mode)) || info.deployEligible !== false || info.corpusScope !== (info.mode==='preview'?'private-editorial-preview':'reviewed-current-qualification') || stableJSON(info.syntheticRoutes) !== stableJSON(syntheticRoutes)) throw new ContractError('INVALID_ARTIFACT_IDENTITY', 'Expected the selected private reading corpus');
  if (info.configSha256 !== sha256(stableJSON(info.config)) || Object.entries(buildInputs()).some(([key, value]) => info[key] !== value)) throw new ContractError('STALE_BUILD_INPUTS', 'Source/config/dependency/renderer identities no longer match');
  if (stableJSON(info.sourceIntake) !== stableJSON(sourceState())) throw new ContractError('STALE_SOURCE_IDENTITY', 'Artifact source identity differs from actual admission');
  const selected=publicationFor(info.mode,info.config);
  if(info.currentSourceQualified!==selected.corpus.admission.currentSourceQualified || stableJSON(info.routes)!==stableJSON(selected.manifest.routes)) throw new ContractError('INVALID_ARTIFACT_IDENTITY','Selection/admission mismatch');
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
    const pathname=safePath(url.pathname);
    const relative = pathname.slice(info.config.basePath.length);
    let target = resolve(root, relative);
    if(!target.startsWith(root+'/') && target!==root) throw new ContractError('UNSAFE_OUTPUT_URL',href);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target) || !statSync(target).isFile()) throw new ContractError('BROKEN_OUTPUT_LINK', `${from}: ${href}`);
    if (url.hash) {
      const $ = load(readFileSync(target, 'utf8'));
      if (!$('[id]').toArray().some(el => $(el).attr('id') === decodeURIComponent(url.hash.slice(1)))) throw new ContractError('BROKEN_FRAGMENT', href);
    }
    return target;
  }
  for(const file of files) if(readFileSync(join(root,file)).includes(Buffer.from('DRAFT_SENTINEL_NOT_FOR_OUTPUT'))) throw new ContractError('DRAFT_LEAK',file);
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
      if($('head > title').text()!==`${entry.title} · Unity Theory` || $('meta[name="description"]').attr('content')!==entry.description) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',entry.id);
      if($('h1').length!==1 || $('h1').text().replace(/\s+/g,' ').trim()!==entry.title.replace(/\s+/g,' ').trim()) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',entry.id);
      if(['DOC-HOME','DOC-START'].includes(entry.id) && !isHistorical(entry)) {
        const state=$('[data-editorial-state]').filter((_i,el)=>$(el).attr('data-editorial-state')===entry.id);
        if(state.length!==1 || normalizedHTML(state.html() ?? '')!==normalizedHTML(renderEditorialState(selected.corpus,entry))) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',`${entry.id}: editorial state`);
      }
      if(!['DOC-HOME','DOC-START'].includes(entry.id) || isHistorical(entry)) {
        for(const [attribute,expectedHTML] of [['data-record-status',renderStatus(selected.corpus,entry)],['data-record-details',renderRecordDetails(selected.corpus,entry,info.config.basePath)]]) {
          const region=$(`[${attribute}]`).filter((_i,el)=>$(el).attr(attribute)===entry.id);
          if(region.length!==1 || normalizedHTML(region.html() ?? '')!==normalizedHTML(expectedHTML)) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',`${entry.id}: ${attribute}`);
        }
      }
      if(entry.id==='DOC-HOME' && !isHistorical(entry)) {
        const projection=$('[data-source-projection="DOC-STATUS"]');const status=selected.entries.find(e=>e.id==='DOC-STATUS')!;
        if(projection.length!==1 || !entry.dependsOn.includes(status.id) || normalizedHTML(projection.html() ?? '')!==normalizedHTML(renderHomeStatus(selected.corpus,status,info.config.basePath))) throw new ContractError('CONTENT_PARITY_FAILURE','DOC-HOME status projection');
      }
    }
    if(route==='/references/') {
      if($('[data-bibliography]').length!==1 || normalizedHTML($('[data-bibliography]').html() ?? '')!==normalizedHTML(renderReferences(selected.references,selected.entries,info.config.basePath))) throw new ContractError('BIBLIOGRAPHY_PARITY_FAILURE','Literature text/destinations/scope/users');
    }
    if($('[data-publication-navigation]').length!==1 || normalizedHTML($('[data-publication-navigation]').html() ?? '')!==normalizedHTML(renderNavigation(selected,route,info.config.basePath))) throw new ContractError('NAVIGATION_PARITY_FAILURE',route);
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
  const evidence = process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m1';
  mkdirSync(evidence, { recursive: true });
  writeFileSync(`${evidence}/${receipt.basePath === '/' ? 'root' : 'subpath'}-artifact.json`, JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ ...receipt, files: receipt.files.length }));
}
