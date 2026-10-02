import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { loadCanonicalCorpus,reviewFingerprint,semanticDigest } from '../../../../src/lib/content.js';
import { websiteReviewInputs,websiteReviewState } from '../../../../src/lib/website-review.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { filesIn } from '../../../../src/lib/source-admission.js';
import { sha256,stableJSON } from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/website-fidelity-quality-recheck';
const c=loadCanonicalCorpus(),previous='docs/evidence/m1/website-fidelity-acceptance';
const reads=JSON.parse(readFileSync(`${previous}/independent-read-snapshots.json`,'utf8'));
assert.equal(c.entries.size,34);assert.equal(c.websiteReviews.length,34);assert.equal(c.admission.currentSourceQualified,false);
const report=JSON.parse(readFileSync(`${folder}/first-batch-content-bindings.json`,'utf8'));
assert.deepEqual(report.reviewStates,{accepted:0,pending:0,stale:34,rejected:0});
const identityComparisons=[...c.entries.values()].map(e=>{
 const old=reads.representations.find((r:any)=>r.id===e.id),inputs=websiteReviewInputs(c,e.id);
 const {fingerprint:now,...currentReads}=inputs,{fingerprint:then,...oldReads}=old.inputs;
 assert.notEqual(now,then);assert.equal(stableJSON(currentReads),stableJSON(oldReads));
 assert.equal(semanticDigest(e),semanticDigest(old.inputs.ownRead));
 assert.equal(reviewFingerprint(c,e.id),report.entries.find((r:any)=>r.entryId===e.id).fingerprint);
 assert.equal(websiteReviewState(c,e.id),'stale');
 return {entryId:e.id,oldFingerprint:then,currentFingerprint:now,ownReadSourcesDependenciesRenderedSurfaces:'unchanged',currentState:'stale'};
});
const clean=(raw:string)=>raw.replace(/\x1b\[[0-9;]*m/g,'');
function cases(path:string) {
 const records=new Map<string,boolean>();
 for(const match of clean(readFileSync(path,'utf8')).matchAll(/^[✔✖] (.+?) \([\d.]+ms\)$/gm))records.set(match[1],match[0].startsWith('✔'));
 return records;
}
const first=cases(`${folder}/first-batch-verification.log`),focused=cases(`${folder}/verification-final.log`);
assert.equal(first.size,76);assert.equal([...first.values()].filter(Boolean).length,74);
assert.equal(focused.size,33);assert.ok([...focused.values()].every(Boolean));
const final=new Map(first);for(const [name,pass] of focused){assert.ok(first.has(name));final.set(name,pass);}
assert.equal(final.size,76);assert.ok([...final.values()].every(Boolean));
const verification=JSON.parse(readFileSync(`${folder}/verification.json`,'utf8'));assert.equal(verification.status,'PASS');assert.deepEqual(verification.productionInputs,buildInputs());
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-website-fidelity-quality-recheck/preview-${base}`,audit=auditOutput(directory);
 assert.equal(audit.artifactSha256,JSON.parse(readFileSync(`${folder}/${base}-artifact.json`,'utf8')).artifactSha256);
 const browser=JSON.parse(readFileSync(`${folder}/${base}-browser.json`,'utf8'));
 assert.equal(browser.stats.expected,7);for(const key of ['unexpected','skipped','flaky'])assert.equal(browser.stats[key],0);
 const info=JSON.parse(readFileSync(`${directory}/build-info.json`,'utf8'));assert.equal(info.currentSourceQualified,false);assert.equal(info.deployEligible,false);
 for(const e of c.entries.values()) {
  const $=load(readFileSync(`${directory}${e.route==='/'?'/index.html':e.route+'index.html'}`,'utf8'));
  const old=reads.representations.find((r:any)=>r.id===e.id).surfaces.find((s:any)=>s.base===info.config.basePath);
  assert.equal($('[data-canonical-body]').text(),old.bodyText);
  if(e.id==='DOC-HOME')assert.equal($('[data-source-projection="DOC-STATUS"]').text(),old.projectionText);
  assert.ok($(['DOC-HOME','DOC-START'].includes(e.id)?'[data-editorial-state]':'[data-record-status]').text().includes('Stale'));
 }
 return {base:info.config.basePath,directory,artifactSha256:audit.artifactSha256,files:audit.files.length,html:audit.files.filter(f=>f.path.endsWith('.html')).length,chromium:7};
});
const earlier=JSON.parse(readFileSync(`${previous}/final-checks.json`,'utf8'));
const retained=[...earlier.artifacts,...earlier.retained].map((a:any)=>{
 const files=filesIn(resolve(a.directory)).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 const digest=sha256(stableJSON(files));assert.equal(digest,a.artifactSha256);return {directory:a.directory,artifactSha256:digest,unchanged:true};
});
const refusals=['qualification','release'].map(mode=>{
 const output=`dist/m1-website-fidelity-quality-recheck/refused-${mode}`;assert.equal(existsSync(output),false);
 const result=spawnSync(process.execPath,['--import','tsx','scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
 writeFileSync(`${folder}/${mode}-refusal.log`,result.stdout+result.stderr);assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
 return {mode,exitCode:1,reason:'CURRENT_SOURCE_NOT_QUALIFIED',outputCreated:false};
});
writeFileSync(`${folder}/final-checks.json`,JSON.stringify({status:'PASS',productionInputs:buildInputs(),contracts:{distinctCases:76,freshAffectedFile:33,reusedUnchangedCases:43,allPassing:true},chromium:14,reviewStates:{accepted:0,pending:0,stale:34,rejected:0},currentSourceQualified:false,identityComparisons,artifacts,retained,refusals,newRepairs:'REVIEW_READY',contentDecisionRefresh:'NOT_PERFORMED',scientificSources:'unchanged',scientificAdjudication:'DEFERRED',m2:'NOT_STARTED',publicActions:'NOT_RUN'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',contracts:76,chromium:14,artifacts,reviewStates:{accepted:0,pending:0,stale:34,rejected:0}}));
