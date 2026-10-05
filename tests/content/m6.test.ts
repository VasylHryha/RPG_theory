import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadCanonicalCorpus, renderEntrySync } from '../../src/lib/content.js';
import { publicationFor, selectPublication, withdrawnTombstone } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { searchable, searchAttributes, searchInputs, searchStatus } from '../../src/lib/search.js';
import { sitemapXML, pageMetadata } from '../../src/lib/site-metadata.js';
import { websiteReviewState } from '../../src/lib/website-review.js';
import { installSyntheticReview } from './fidelity-fixture.js';
import { indexSearch } from '../../scripts/index-search.js';
import { auditOutput } from '../../scripts/audit-output.js';
import { escapeHTML } from '../../src/lib/presentation.js';

test('M6 real drafts never enter search/sitemap; private utility metadata invents no author or institution',()=>{
 const config=loadSiteConfig(),selection=publicationFor('preview',config);
 assert.deepEqual(selection.manifest.searchIds,[]);assert.deepEqual(selection.manifest.sitemapIds,[]);
 assert.doesNotMatch(sitemapXML(selection,config),/<loc>/);
 const metadata=pageMetadata('Search','Browse','/search/',config);
 assert.equal('author' in metadata,false);assert.doesNotMatch(JSON.stringify(metadata),/ScholarlyArticle|Organization|peer.review/);
 for(const e of selection.entries)assert.equal(searchable(e),false);
});
test('M6 correction transaction invalidates dependants, requires explicit synthetic rereview and excludes the replaced route',async()=>{
 const corpus=loadCanonicalCorpus(),definition=structuredClone(corpus.entries.get('UT-D01')!),dependent=structuredClone(corpus.entries.get('DOC-CONCEPT-GEOMETRY')!);
 corpus.entries=new Map([[definition.id,definition],[dependent.id,dependent]]);
 dependent.dependsOn=[definition.id];dependent.related=[];dependent.body='Synthetic explanation using :claim[UT-D01].';definition.dependsOn=[];definition.related=[];
 for(const e of corpus.entries.values()){e.publicationState='published';e.publishedAt='2026-10-01';e.rightsRef='SYNTHETIC';installSyntheticReview(corpus,e.id);}
 const release={releaseId:'synthetic-mechanics-only',releaseAt:'2026-10-05',historicalIds:[],rights:[{id:'SYNTHETIC',outcome:'approved' as const,entryIds:[definition.id,dependent.id],evidenceRef:'isolated test; no approval'}]},config=loadSiteConfig();
 const before=selectPublication(corpus,config,release,'qualification');
 definition.plainLanguage+=' Synthetic change control, not an adopted theory change.';
 assert.equal(websiteReviewState(corpus,definition.id),'stale');assert.equal(websiteReviewState(corpus,dependent.id),'stale');
 assert.throws(()=>selectPublication(corpus,config,release,'qualification'),/REVIEW_REQUIRED/);
 for(const e of corpus.entries.values())installSyntheticReview(corpus,e.id);
 const after=selectPublication(corpus,config,release,'qualification');assert.notEqual(before.manifestSha256,after.manifestSha256);
 const root=mkdtempSync(join(tmpdir(),'unity-m6-correction-'));
 try {
  for(const e of after.entries) {
   const file=join(root,e.route.slice(1),'index.html');mkdirSync(join(file,'..'),{recursive:true});
   const attrs=Object.entries(searchAttributes(e)).map(([k,v])=>`${k}="${escapeHTML(v)}"`).join(' ');
   writeFileSync(file,`<html lang="en"><body><h1>${escapeHTML(e.title)}</h1><div data-canonical-body="${e.id}" ${attrs}>${renderEntrySync(corpus,e)}</div></body></html>`);
  }
  const built=await indexSearch(root,after,'/');assert.equal(built.inputs.length,2);
  definition.publicationState='withdrawn';definition.withdrawalReason='Synthetic correction only';definition.correctionRef='Synthetic history record';
  dependent.dependsOn=[];dependent.body='Synthetic corrected explanation; previous definition is withdrawn.';installSyntheticReview(corpus,dependent.id);installSyntheticReview(corpus,definition.id);
  const final=selectPublication(corpus,config,{...release,historicalIds:[definition.id]},'qualification');
  assert.equal(final.manifest.searchIds.includes(definition.id),false);assert.equal(final.manifest.exportIds.includes(definition.id),false);
  assert.match(withdrawnTombstone(definition).title,/withdrawn/);assert.equal(withdrawnTombstone(definition).statement,null);
  const path=join(root,dependent.route.slice(1),'index.html'),attrs=Object.entries(searchAttributes(dependent)).map(([k,v])=>`${k}="${escapeHTML(v)}"`).join(' ');
  writeFileSync(path,`<html lang="en"><body><div data-canonical-body="${dependent.id}" ${attrs}>${renderEntrySync(corpus,dependent)}</div></body></html>`);
  writeFileSync(join(root,definition.route.slice(1),'index.html'),`<html><body><h1>${withdrawnTombstone(definition).title}</h1><p>Synthetic withdrawal history.</p></body></html>`);
  const fresh=await indexSearch(root,final,'/');assert.equal(fresh.inputs.length,1);assert.notEqual(fresh.inputsSha256,built.inputsSha256);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('M6 missing search body and misleading scope fail before indexing',()=>{
 const e=structuredClone(loadCanonicalCorpus().entries.get('DOC-CONCEPT-GEOMETRY')!);e.publicationState='published';
 assert.throws(()=>searchInputs('/fixture',[e],()=>'<html><body>Private sentinel</body></html>'),/SEARCH_BODY_MISMATCH/);
 assert.match(searchStatus({...e,kind:'conjecture',evidenceState:'proposed'}),/not established/);
});
test('M6 stale search identity and added source-map/private assets are refused in the actual artifact auditor',()=>{
 const source=process.env.UNITY_CONTRACT_OUTPUT??'dist/m6-search-contract/preview-subpath';
 if(!process.env.UNITY_CONTRACT_OUTPUT){const result=spawnSync(process.execPath,['--import',resolve('node_modules/tsx/dist/loader.mjs'),'scripts/build.ts','--mode','preview','--config','tests/fixtures/site-subpath.json','--output',source],{encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);}
 const root=mkdtempSync(join(tmpdir(),'unity-m6-output-'));
 try {
  cpSync(source,root,{recursive:true});
  const manifestPath=join(root,'search-manifest.json'),raw=readFileSync(manifestPath),manifest=JSON.parse(raw.toString());
  manifest.inputsSha256='0'.repeat(64);writeFileSync(manifestPath,JSON.stringify(manifest));assert.throws(()=>auditOutput(root),/STALE_SEARCH_INDEX/);
  writeFileSync(manifestPath,raw);writeFileSync(join(root,'_astro/private.js.map'),'DRAFT_SENTINEL');assert.throws(()=>auditOutput(root),/UNEXPECTED_OUTPUT/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
