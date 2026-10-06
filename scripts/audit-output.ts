import { publicationAssets,rssXML,verifyArchive } from '../src/lib/publication-assets.js';
import {renderLibrary,renderHistory,renderDownloadTools,renderArticles,renderCite,renderSourceBacklinks} from '../src/lib/library.js';
import { publicationFor, isHistorical, assertBuildAllowed } from '../src/lib/publication.js';
import { renderStatus, renderRecordDetails, renderReferences, renderNavigation, renderHomeStatus, renderHomeContext, renderEditorialState, renderBeginnerDiagram, renderTechnicalGuide } from '../src/lib/presentation.js';
import { renderEntrySync } from '../src/lib/content.js';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { load } from 'cheerio';
import { args } from './args.js';
import { filesIn } from '../src/lib/source-admission.js';
import { safePath, withBase } from '../src/lib/urls.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { ContractError } from '../src/lib/errors.js';
import { buildInputs, syntheticRoutes } from '../src/lib/build-identity.js';
import { buildMode } from '../src/lib/site-config.js';
import { cssResourceURLs } from './css-resources.js';
import { requiresMathStyles } from '../src/lib/markdown.js';
import { renderFooter,renderAbout,renderLegal,publicationCredit } from '../src/lib/publication-policy.js';
import { renderSearchFallback, searchInputs, searchIdentity, searchable } from '../src/lib/search.js';
import { pageMetadata, metadataJSON, sitemapXML } from '../src/lib/site-metadata.js';

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
  if (info.schema !== 'unity-build-info/1' || info.deployEligible !== (info.mode==='release') || info.corpusScope !== (info.mode==='preview'?'private-editorial-preview':info.mode==='release'?'current':'reviewed-current-qualification') || stableJSON(info.syntheticRoutes) !== stableJSON(info.mode==='release'?[]:syntheticRoutes)) throw new ContractError('INVALID_ARTIFACT_IDENTITY', 'Expected the selected reading corpus');
  buildMode(info.mode);
  if(info.mode==='release')assertBuildAllowed(info.mode,info.config,info.sourceIntake);
  if (info.configSha256 !== sha256(stableJSON(info.config)) || Object.entries(buildInputs()).some(([key, value]) => info[key] !== value)) throw new ContractError('STALE_BUILD_INPUTS', 'Source/config/dependency/renderer identities no longer match');
  const selected=publicationFor(info.mode,info.config);
  if (stableJSON(info.sourceIntake) !== stableJSON(selected.admission)) throw new ContractError('STALE_SOURCE_IDENTITY', 'Artifact source identity differs from actual admission');
  if(info.currentSourceQualified!==selected.admission.currentSourceQualified || stableJSON(info.routes)!==stableJSON(selected.manifest.routes)) throw new ContractError('INVALID_ARTIFACT_IDENTITY','Selection/admission mismatch');
  if (stableJSON(info.publicationManifest) !== stableJSON(selected.manifest) || info.publicationManifestSha256 !== selected.manifestSha256) throw new ContractError('PUBLICATION_MANIFEST_MISMATCH','Artifact differs from production selection');
  const assets=publicationAssets(selected,info.config);
  const search=JSON.parse(readFileSync(join(root,'search-manifest.json'),'utf8'));
  const indexed=searchInputs(root,selected.entries,path=>readFileSync(path,'utf8'));
  if(search.schema!=='unity-search/1' || search.basePath!==info.config.basePath || search.publicationManifestSha256!==selected.manifestSha256 || stableJSON(search.inputs)!==stableJSON(indexed) || search.inputsSha256!==searchIdentity(indexed,info.config.basePath,selected.manifestSha256) || info.searchManifestSha256!==sha256(stableJSON(search)))throw new ContractError('STALE_SEARCH_INDEX','Search selection/config/HTML identity differs');
  for(const f of search.files)if(!/^pagefind\/[\w./-]+$/.test(f.path) || f.path.split('/').includes('..') || !existsSync(join(root,f.path)) || sha256(readFileSync(join(root,f.path)))!==f.sha256)throw new ContractError('SEARCH_ASSET_MISMATCH',f.path);
  if(!readFileSync(join(root,'search-client.js')).equals(readFileSync('public/search-client.js')))throw new ContractError('SEARCH_CLIENT_MISMATCH','Client bytes differ from owned source');
  if(readFileSync(join(root,'sitemap.xml'),'utf8')!==sitemapXML(selected,info.config))throw new ContractError('SITEMAP_PARITY_FAILURE','Published selection only');
  if(stableJSON(info.releaseMetadata)!==stableJSON(assets.identity))throw new ContractError('RELEASE_METADATA_PARITY_FAILURE','Build identity mismatch');
  for(const [path,expected] of assets.files) {
    if(!existsSync(join(root,path.slice(1))) || !readFileSync(join(root,path.slice(1))).equals(expected))throw new ContractError('EXPORT_PARITY_FAILURE',path);
  }
  verifyArchive(readFileSync(join(root,assets.zipPath.slice(1))));
  if(readFileSync(join(root,'rss.xml'),'utf8')!==rssXML(selected,info.config))throw new ContractError('RSS_PARITY_FAILURE','rss.xml');
  const routeFiles=info.routes.map((r:string)=>r.endsWith('/') ? (r==='/'?'index.html':r.slice(1)+'index.html') : r.slice(1));
  for (const file of [...routeFiles, 'favicon.svg', 'robots.txt', 'build-info.json']) {
    if (!files.includes(file)) throw new ContractError('MISSING_OUTPUT', file);
  }
  const allowed = /^(?:favicon\.svg|robots\.txt|build-info\.json|_astro\/[\w.-]+\.(?:css|woff2?|ttf))$/;
  for (const file of files) {
    if (!allowed.test(file) && !routeFiles.includes(file) && !search.files.some((f:{path:string})=>f.path===file)) throw new ContractError('UNEXPECTED_OUTPUT', file);
  }
  const approvedMailContact = publicationCredit().approvedContact?.url;
  function targetOf(href: string, from: string, resource = false) {
    // Only the recorded public contact may be used as a mail link; it is never
    // an asset destination and arbitrary mail addresses remain refused.
    if (!resource && href.startsWith('mailto:') && href === approvedMailContact) return null;
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
  function auditCSS(raw: string, from: string) {
    // Token boundaries and string bytes must survive normalization: stripping
    // comments from a quoted URL can turn forged data into a trusted font.
    for(const value of cssResourceURLs(raw,from)) {
      // Astro embeds small KaTeX fonts. Admit only exact installed dependency
      // bytes, never arbitrary data URLs or active SVG/HTML payloads.
      if(value.startsWith('data:')) {
        const font=value.match(/^data:font\/woff2;base64,([A-Za-z0-9+/]+={0,2})$/);
        if(!font || !packagedFonts.has(font[1])) throw new ContractError('UNSAFE_OUTPUT_URL',value);
      } else targetOf(value,from,true);
    }
  }
  const fontRoot=join(dirname(createRequire(import.meta.url).resolve('katex/package.json')),'dist/fonts');
  const packagedFonts=new Set(filesIn(fontRoot).filter(path=>path.endsWith('.woff2')).map(path=>readFileSync(join(fontRoot,path)).toString('base64')));
  const svgURLAttributes=['fill','stroke','filter','clip-path','mask','cursor','marker','marker-start','marker-mid','marker-end'];
  function auditSVGStyles($: ReturnType<typeof load>, from: string) {
    // SVG presentation attributes carry CSS URLs too, without a style attribute.
    // Use the same normalized resource checks for inline and standalone SVG.
    for(const el of $('*').toArray()) for(const attribute of svgURLAttributes) {
      const value=$(el).attr(attribute);if(value!==undefined)auditCSS(value,from);
    }
  }
  for(const file of files) if(readFileSync(join(root,file)).includes(Buffer.from('DRAFT_SENTINEL_NOT_FOR_OUTPUT'))) throw new ContractError('DRAFT_LEAK',file);
  for (const file of files.filter(f => f.endsWith('.svg'))) {
    const raw = readFileSync(join(root, file), 'utf8');
    const $ = load(raw, { xmlMode: true });
    const tags = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'title', 'desc']);
    if (/<!DOCTYPE|<\?(?!xml\s)/i.test(raw) || $('svg').length !== 1 || $('*').toArray().some(el => 'attribs' in el && (!tags.has(el.name) || Object.keys(el.attribs).some(key => /^(?:on|href$|xlink:href$|style$|xml:base$)/i.test(key))))) throw new ContractError('UNSAFE_SVG', file);
    auditSVGStyles($,withBase('/'+file,info.config.basePath));
  }
  for (const file of files.filter(f => f.endsWith('.html'))) {
    const route = file === 'index.html' ? '/' : '/' + file.replace(/index\.html$/, '');
    const from = withBase(route, info.config.basePath);
    const $ = load(readFileSync(join(root, file), 'utf8'));
    const entry=selected.entries.find(e=>e.route===route);
    const expectedContent=entry?renderEntrySync(selected.corpus,entry,info.config.basePath):'';
    const expectedDetails=entry?renderRecordDetails(selected.corpus,entry,info.config.basePath):'';
    const expectedMath=entry?requiresMathStyles(expectedContent+expectedDetails):$('math').length>0;
    const mathURL=/\/_astro\/katex(?:\.min)?\.[\w-]+\.css$/;
    const mathStyles=$('[data-math-stylesheet], link[rel="stylesheet"]').filter((_i,el)=>$(el).attr('data-math-stylesheet')!==undefined || mathURL.test($(el).attr('href')??''));
    if(mathStyles.length!==(expectedMath?1:0) || expectedMath && (!mathStyles.is('head > link[rel="stylesheet"]') || mathStyles.attr('data-math-stylesheet')===undefined || !mathURL.test(mathStyles.attr('href')??''))) throw new ContractError('MATH_STYLESHEET_PARITY_FAILURE',file);
    if (entry) {
      const expected=load(expectedContent,null,false).html();
      const actual=$('[data-canonical-body]').filter((_i,el)=>$(el).attr('data-canonical-body')===entry.id);
      if (actual.length!==1 || normalizedHTML(actual.html() ?? '')!==normalizedHTML(expected)) throw new ContractError('CONTENT_PARITY_FAILURE',entry.id);
      const guide=renderTechnicalGuide(selected,entry,expectedContent,info.config.basePath);
      const actualGuide=$('[data-technical-guide]');
      if(guide ? actualGuide.length!==1 || actualGuide.attr('data-technical-guide')!==entry.id || normalizedHTML(actualGuide.html() ?? '')!==normalizedHTML(guide) : actualGuide.length!==0) throw new ContractError('CONTENT_PARITY_FAILURE',`${entry.id}: technical guide`);
      if($('head > title').length!==1 || $('head > title').text()!==`${entry.title} · RRG` || $('head > meta[name="description"]').length!==1 || $('head > meta[name="description"]').attr('content')!==entry.description) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',entry.id);
      if($('h1').length!==1 || $('h1').text().replace(/\s+/g,' ').trim()!==entry.title.replace(/\s+/g,' ').trim()) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',entry.id);
      if(['DOC-HOME','DOC-START'].includes(entry.id) && !isHistorical(entry)) {
        const state=$('[data-editorial-state]').filter((_i,el)=>$(el).attr('data-editorial-state')===entry.id);
        if(state.length!==1 || normalizedHTML(state.html() ?? '')!==normalizedHTML(renderEditorialState(selected.corpus,entry))) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',`${entry.id}: editorial state`);
      }
      if(!['DOC-HOME','DOC-START'].includes(entry.id) || isHistorical(entry)) {
        const lede=$('.article-lede');
        if(lede.length!==1 || lede.text().replace(/\s+/g,' ').trim()!==entry.description.replace(/\s+/g,' ').trim()) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',`${entry.id}: visible description`);
        for(const [attribute,expectedHTML] of [['data-record-status',renderStatus(selected.corpus,entry)],['data-record-details',expectedDetails]]) {
          const region=$(`[${attribute}]`).filter((_i,el)=>$(el).attr(attribute)===entry.id);
          if(region.length!==1 || normalizedHTML(region.html() ?? '')!==normalizedHTML(expectedHTML)) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',`${entry.id}: ${attribute}`);
        }
      }
      if(entry.id==='DOC-HOME' && !isHistorical(entry)) {
        const projection=$('[data-source-projection="DOC-STATUS"]');const status=selected.entries.find(e=>e.id==='DOC-STATUS')!;
        if(projection.length!==1 || !entry.dependsOn.includes(status.id) || normalizedHTML(projection.html() ?? '')!==normalizedHTML(renderHomeStatus(selected.corpus,status,info.config.basePath))) throw new ContractError('CONTENT_PARITY_FAILURE','DOC-HOME status projection');
      }
    }
    const expectedDiagram=entry && !isHistorical(entry)?renderBeginnerDiagram(entry.id):'';
    const diagrams=$('[data-beginner-diagram]');
    if(expectedDiagram ? diagrams.length!==1 || normalizedHTML(diagrams.toArray().map(el=>$.html(el)).join(''))!==normalizedHTML(expectedDiagram) : diagrams.length!==0) throw new ContractError('DIAGRAM_PARITY_FAILURE',file);
    const generatedRegions:[string,string][]=[];
    if(entry?.id==='DOC-HOME' && !isHistorical(entry))generatedRegions.push(['data-home-context',renderHomeContext(selected.corpus,entry,info.config.basePath)]);
    if(entry && !['DOC-HOME','DOC-START'].includes(entry.id))generatedRegions.push(['data-download-tools',renderDownloadTools(selected,entry,info.config.basePath)]);
    if(entry?.id==='DOC-LIBRARY')generatedRegions.push(['data-document-library',renderLibrary(selected,info.config.basePath)]);
    if(entry?.id==='DOC-CONTROL')generatedRegions.push(['data-website-history',renderHistory(selected,info.config.basePath)]);
    if(route==='/articles/')generatedRegions.push(['data-article-index',renderArticles(selected,info.config.basePath)]);
    if(route==='/cite/')generatedRegions.push(['data-citation',renderCite(selected,info.config)]);
    if(route==='/references/')generatedRegions.push(['data-source-backlinks',renderSourceBacklinks(selected,info.config.basePath)]);
    if(route==='/about/')generatedRegions.push(['data-about',renderAbout(publicationCredit(),info.config.basePath)]);
    if(route==='/legal/')generatedRegions.push(['data-legal',renderLegal(publicationCredit(),info.config.basePath)]);
    if(route==='/search/')generatedRegions.push(['data-search-fallback',renderSearchFallback(selected,info.config.basePath)]);
    generatedRegions.push(['data-publication-footer',renderFooter(info.config.basePath)]);
    for(const [attr,expected] of generatedRegions)if($(`[${attr}]`).length!==1 || normalizedHTML($(`[${attr}]`).html() ?? '')!==normalizedHTML(expected))throw new ContractError('LIBRARY_PARITY_FAILURE',`${file}: ${attr}`);
    if(route==='/references/') {
      if($('[data-bibliography]').length!==1 || normalizedHTML($('[data-bibliography]').html() ?? '')!==normalizedHTML(renderReferences(selected.references,selected.entries,info.config.basePath))) throw new ContractError('BIBLIOGRAPHY_PARITY_FAILURE','Literature text/destinations/scope/users');
    }
    if($('[data-publication-navigation]').length!==1 || normalizedHTML($('[data-publication-navigation]').html() ?? '')!==normalizedHTML(renderNavigation(selected,route,info.config.basePath))) throw new ContractError('NAVIGATION_PARITY_FAILURE',route);
    const robots=$('head > meta[name="robots"]');
    const noindex=info.mode!=='release' || !entry || entry.publicationState!=='published';
    if ($('h1').length !== 1 || robots.length!==1 || robots.attr('content')!==(noindex?'noindex, nofollow':'index, follow')) throw new ContractError('INVALID_PRIVATE_PAGE',file);
    const canonical=$('head > link[rel="canonical"]');
    if (canonical.length!==1 || canonical.attr('href') !== info.config.origin + from) throw new ContractError('CANONICAL_PARITY_FAILURE',file);
    const socialTitle=entry?.title??$('head > title').text().replace(/ · RRG$/,'');
    const metadata=$('head > script[data-site-metadata]');
    if(metadata.length!==1 || metadata.attr('type')!=='application/ld+json' || metadata.html()!==metadataJSON(pageMetadata(socialTitle,$('head > meta[name="description"]').attr('content')??'',route,info.config,entry)))throw new ContractError('STRUCTURED_METADATA_PARITY_FAILURE',file);
    const indexBodies=$('[data-pagefind-body]');
    if(indexBodies.length!==(entry && searchable(entry)?1:0))throw new ContractError('SEARCH_BODY_MISMATCH',file);
    for(const [property,value] of [['og:title',socialTitle],['og:description',$('head > meta[name="description"]').attr('content')],['og:url',info.config.origin+from]]) {
      const meta=$(`head > meta[property="${property}"]`);
      if(meta.length!==1 || meta.attr('content')!==value) throw new ContractError('CONTENT_METADATA_PARITY_FAILURE',`${file}: ${property}`);
    }
    if ($('.katex-error').length) throw new Error(`KaTeX error: ${file}`);
    const client=$('script[data-search-client]');
    if(route==='/search/' ? client.length!==1 || client.attr('type')!=='module' || client.attr('src')!==withBase('/search-client.js',info.config.basePath) || client.html()!=='' : client.length!==0)throw new ContractError('SEARCH_CLIENT_MISMATCH',file);
    if ($('script').toArray().some(el=>!$(el).is('head > script[data-site-metadata]') && !$(el).is('script[data-search-client]')) || $('iframe,object,embed,foreignObject,base,style,noscript,animate,animateMotion,animateTransform,set').length || $('meta[http-equiv]').toArray().some(el=>$(el).attr('http-equiv')?.toLowerCase()==='refresh') || $('*').toArray().some(el => 'attribs' in el && Object.keys(el.attribs).some(key => /^(?:on|srcdoc$|ping$|autoplay$|xml:base$)/i.test(key)))) throw new ContractError('ACTIVE_OUTPUT', file);
    auditSVGStyles($,from);
    for (const el of $('*').toArray()) {
      for(const attribute of ['href','src','xlink:href','poster','background','action','formaction']) {
        const value=$(el).attr(attribute);
        if(value)targetOf(value,from,!($(el).is('a') && attribute==='href'));
      }
      for(const attribute of ['srcset','imagesrcset']) {
        const value=$(el).attr(attribute);
        if(value===undefined)continue;
        for(const candidate of value.split(',')) {
          const fields=candidate.trim().split(/\s+/);
          if(!fields[0] || fields.length>2 || fields[1] && (!/^(?:[1-9]\d*w|\d+(?:\.\d+)?x)$/.test(fields[1]) || parseFloat(fields[1])<=0)) throw new ContractError('UNSAFE_OUTPUT_URL',value);
          targetOf(fields[0],from,true);
        }
      }
      const style=$(el).attr('style');if(style!==undefined)auditCSS(style,from);
    }
  }
  for (const file of files.filter(f => f.endsWith('.css'))) {
    auditCSS(readFileSync(join(root,file),'utf8'),withBase('/'+file,info.config.basePath));
  }
  const inventory = files.map(path => { const raw = readFileSync(join(root, path)); return { path, bytes: raw.length, sha256: sha256(raw) }; });
  return { status: 'PASS', mode: info.mode, basePath: info.config.basePath, deployEligible: info.mode==='release', files: inventory, artifactSha256: sha256(stableJSON(inventory)) };
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
