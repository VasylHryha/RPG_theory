import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {load} from 'cheerio';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {loadCanonicalCorpus,beginnerWordingCandidates} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState} from '../../../../src/lib/website-review.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
const evidence='docs/evidence/m2/implementation';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const save=(name:string,value:unknown)=>writeFileSync(join(evidence,name),JSON.stringify(value,null,2)+'\n');
const verification=read(join(evidence,'verification.json'));
assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);
const corpus=loadCanonicalCorpus();
const states={accepted:0,pending:0,stale:0,rejected:0};
for(const entry of corpus.entries.values())states[websiteReviewState(corpus,entry.id)]++;
assert.deepEqual(states,{accepted:0,pending:11,stale:34,rejected:0});
assert.equal(corpus.admission.currentSourceQualified,false);
const documents=[...corpus.entries.values()].filter(e=>e.audience==='general' && ['intro','concept','example'].includes(e.kind));
save('editorial-inputs.json',{
  status:'EDITORIAL_CHECKED',purpose:'Website authoring and original-document fidelity; no scientific adjudication or acceptance',
  humanComprehension:'NOT_TESTED',authorApproval:'PENDING',independentFidelityApproval:'PENDING',
  documents:documents.map(entry=>({entryId:entry.id,words:entry.body.split(/\s+/).filter(Boolean).length,wordingCandidates:beginnerWordingCandidates(entry),inputs:websiteReviewInputs(corpus,entry.id)}))
});
const artifacts=[];
for(const suffix of ['root','subpath']) {
  const directory=`dist/m2-introduction/preview-${suffix}`;
  const prior=read(join(evidence,`${suffix}-artifact.json`));
  const audit=auditOutput(directory);assert.equal(audit.artifactSha256,prior.artifactSha256);
  const browser=read(join(evidence,`${suffix}-browser.json`));assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);
  const info=read(join(directory,'build-info.json'));assert.equal(info.currentSourceQualified,false);assert.equal(info.deployEligible,false);
  artifacts.push({directory,artifactSha256:audit.artifactSha256,files:audit.files.length,html:audit.files.filter(f=>f.path.endsWith('.html')).length,postBrowserAudit:'PASS',browser:browser.stats,buildInputs:info.inputsSha256,sourceQualified:false,deployEligible:false});
}
const directory='dist/m2-introduction/preview-root';
const $=load(readFileSync(join(directory,'start/index.html'),'utf8'));
const intro=$('[data-canonical-body="DOC-START"]');
writeFileSync(join(evidence,'start-rendered.txt'),$('h1').text()+'\n\n'+intro.children().toArray().map(el=>$(el).text()).join('\n\n')+'\n\n'+$('figcaption').text()+'\n');
// File-by-file gzip upper bound for owned HTML/CSS/SVG/JS and all fonts reachable
// from local CSS. This includes every CSS font alternative, even unused ones;
// it is not an HTTP transfer, Lighthouse profile or field CWV measurement.
function gzipBudget(path:string,includeAllFontAlternatives=false) {
  const resources=new Set([path]);const html=load(readFileSync(join(directory,path),'utf8'));
  for(const el of html('link[rel="stylesheet"],link[rel="icon"],script[src],img[src]').toArray()) {
    const url=html(el).attr('href')??html(el).attr('src')!;resources.add(decodeURIComponent(url.slice(1)));
  }
  for(const resource of resources)if(includeAllFontAlternatives && resource.endsWith('.css')) {
    const css=readFileSync(join(directory,resource),'utf8');
    for(const match of css.matchAll(/url\((?:["']?)([^)"']+)["']?\)/g)) {
      if(!match[1].startsWith('data:'))resources.add(match[1].startsWith('/')?match[1].slice(1):join(dirname(resource),match[1]));
    }
  }
  const files=[...resources].map(path=>({path,bytes:readFileSync(join(directory,path)).length,gzipBytes:gzipSync(readFileSync(join(directory,path)),{level:9}).length}));
  return {files,totalGzipBytes:files.reduce((n,f)=>n+f.gzipBytes,0),javascriptGzipBytes:files.filter(f=>f.path.endsWith('.js')).reduce((n,f)=>n+f.gzipBytes,0)};
}
const home=gzipBudget('index.html'),math=gzipBudget('concepts/effective-interactions/index.html',true);
assert.ok(home.totalGzipBytes<=250*1024);assert.ok(home.javascriptGzipBytes<=15*1024);
save('static-budgets.json',{method:'Per-file gzip level 9; no HTTP headers. Home HTML/CSS/scripts/images: no math elements or font preloads, system typography; CSS font definitions alone do not load unused fonts. Math includes every local font alternative as a conservative upper bound, not measured browser transfer.',home,math,mathBudgetMetByUpperBound:math.totalGzipBytes<=750*1024,lighthouse:'NOT_RUN',fieldCWV:'NOT_MEASURED'});
const retained=[];
for(const [suffix,path] of [['root','dist/m1-qf1214-separate-review/preview-root'],['subpath','dist/m1-qf1214-separate-review/preview-subpath']]) {
  const inventory=read(`docs/evidence/m1/qf1214-separate-review/${suffix}-artifact.json`);
  for(const file of inventory.files)assert.equal(sha256(readFileSync(join(path,file.path))),file.sha256);
  retained.push({path,artifactSha256:sha256(stableJSON(inventory.files)),files:inventory.files.length,unchanged:true});
}
const guard=[];
for(const mode of ['qualification','release']) {
  const output=`dist/m2-introduction/${mode}-refusal`;assert.equal(existsSync(output),false);
  const result=spawnSync(process.execPath,['--import',resolve('node_modules/tsx/dist/loader.mjs'),'scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
  writeFileSync(join(evidence,`${mode}-refusal.log`),result.stdout+result.stderr);
  assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
  guard.push({mode,exit:result.status,code:'CURRENT_SOURCE_NOT_QUALIFIED',outputCreated:false});
}
save('final-checks.json',{status:'PASS',baselineHead:read(join(evidence,'baseline.json')).head,productionInputs:buildInputs(),commands:verification.receipts.length,contracts:Number(/ℹ tests (\d+)/.exec(readFileSync(join(evidence,'verification.log'),'utf8'))?.[1]),artifacts,retained,websiteReviewStates:states,sourceQualified:false,publicationGuards:guard,m2:'REVIEW_READY',m3:'NOT_STARTED',scientificAdjudication:'OUT_OF_SCOPE',humanComprehension:'NOT_TESTED',publicActions:'NOT_RUN'});
console.log('M2 final website checks PASS; independent acceptance pending.');
