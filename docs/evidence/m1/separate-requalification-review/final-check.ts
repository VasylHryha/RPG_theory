import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {load} from 'cheerio';
import {loadCanonicalCorpus,reviewFingerprint} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState,validateWebsiteReviews} from '../../../../src/lib/website-review.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {assertBuildAllowed} from '../../../../src/lib/publication.js';
import {loadSiteConfig} from '../../../../src/lib/site-config.js';
import {filesIn} from '../../../../src/lib/source-admission.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/separate-requalification-review';
const json=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const c=loadCanonicalCorpus();validateWebsiteReviews(c);
assert.equal(c.entries.size,34);assert.equal(c.websiteReviews.length,34);assert.equal(c.admission.currentSourceQualified,true);
const report=json(`${folder}/content-bindings.json`);assert.deepEqual(report.reviewStates,{accepted:34,pending:0,stale:0,rejected:0});
const reads=json(`${folder}/independent-read-snapshots.json`);
const decisions=[...c.entries.values()].map(e=>{
 const saved=reads.representations.find((r:any)=>r.id===e.id);
 assert.equal(stableJSON(websiteReviewInputs(c,e.id)),stableJSON(saved.inputs));
 assert.equal(websiteReviewState(c,e.id),'accepted');
 const review=c.websiteReviews.find(r=>r.entryId===e.id)!;
 assert.equal(review.fingerprint,reviewFingerprint(c,e.id));assert.equal(sha256(readFileSync(review.evidenceRef)),review.evidenceSha256);
 assert.equal(sha256(readFileSync(saved.previousEvidenceRef)),saved.previousEvidenceSha256);
 return {entryId:e.id,fingerprint:review.fingerprint,evidenceRef:review.evidenceRef,evidenceSha256:review.evidenceSha256,previousEvidenceRef:saved.previousEvidenceRef,previousReceiptPreserved:true};
});
const verification=json(`${folder}/verification.json`);assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);assert.ok(verification.receipts.every((r:any)=>r.exitCode===0));assert.deepEqual(verification.notRun,[]);
const log=readFileSync(`${folder}/verification-tests-builds.log`,'utf8');
const cases=[...log.matchAll(/^✔ (.+?) \([\d.]+ms\)$/gm)].map(m=>m[1]);assert.equal(cases.length,76);assert.equal(new Set(cases).size,76);assert.match(log,/ℹ fail 0/);
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-separate-requalification-review/preview-${base}`,audit=auditOutput(directory),saved=json(`${folder}/${base}-artifact.json`);
 assert.equal(stableJSON(audit),stableJSON(saved));
 const browser=json(`${folder}/${base}-browser.json`);assert.equal(browser.stats.expected,7);
 for(const key of ['unexpected','skipped','flaky'])assert.equal(browser.stats[key],0);
 const info=json(`${directory}/build-info.json`);assert.equal(info.currentSourceQualified,true);assert.equal(info.deployEligible,false);
 for(const e of c.entries.values()) {
  const $=load(readFileSync(`${directory}${e.route==='/'?'/index.html':e.route+'index.html'}`,'utf8'));
  const previous=reads.representations.find((r:any)=>r.id===e.id).surfaces.find((s:any)=>s.base===info.config.basePath);
  assert.equal($(`[data-canonical-body="${e.id}"]`).text(),previous.bodyText);
  if(e.id==='DOC-HOME')assert.equal($('[data-source-projection="DOC-STATUS"]').text(),previous.projectionText);
  assert.ok($(['DOC-HOME','DOC-START'].includes(e.id)?'[data-editorial-state]':'[data-record-status]').text().includes('Faithful to the supplied documents'));
 }
 return {base:info.config.basePath,directory,artifactSha256:audit.artifactSha256,files:audit.files.length,html:audit.files.filter(f=>f.path.endsWith('.html')).length,chromium:7,bodyAndHomeProjection:'unchanged'};
});
const independent=json(`${folder}/independent-engineering.json`);
const retained=[...independent.artifacts,...independent.retained].map((a:any)=>{
 const inventory=filesIn(a.directory).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 assert.equal(sha256(stableJSON(inventory)),a.artifactSha256);return {...a,unchanged:true};
});
const refusals=['qualification','release'].map(mode=>{
 const output=`dist/m1-separate-requalification-review/refused-${mode}`;assert.equal(existsSync(output),false);
 const result=spawnSync(process.execPath,['--import','tsx','scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
 writeFileSync(`${folder}/${mode}-refusal.log`,result.stdout+result.stderr);
 assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
 return {mode,exitCode:1,reason:'CURRENT_SOURCE_NOT_QUALIFIED',detail:'Actual intended production selection is empty: all 34 entries remain drafts.',outputCreated:false};
});
const config=loadSiteConfig(),guards=[
 {reason:'PUBLIC_TARGET_REQUIRED',config},
 {reason:'PUBLIC_AUTHORIZATION_REQUIRED',config:{...config,origin:'https://example.org',repository:{owner:'fixture',name:'fixture'},publicAuthorization:false}},
 {reason:'RELEASE_PIPELINE_NOT_IMPLEMENTED',config:{...config,origin:'https://example.org',repository:{owner:'fixture',name:'fixture'},publicAuthorization:true}}
].map(g=>{assert.throws(()=>assertBuildAllowed('release',g.config,c.admission),new RegExp(g.reason));return {reason:g.reason,reached:true,kind:'direct isolated guard, no external action'};});
const final={status:'PASS',baselineHead:'bbb6b19130501452447b02fcda1278e42b27c668',productionInputs:buildInputs(),renderer:c.rendererSha256,sourceInventory:c.admission.inventorySeal,
 contracts:{freshDistinctCases:76,allPassing:true},chromium:14,commands:11,verification:'Fresh complete npm run verify after the new independently reviewed registry; prior mixed evidence remains precisely recorded separately.',
 reviewStates:report.reviewStates,currentSourceQualified:true,decisions,artifacts,retained,refusals,guards,
 engineeringAcceptance:{WF06:'ACCEPTED for unchanged reviewed test batch',QF07:'ACCEPTED for unchanged reviewed snapshot/path validator and controls',QF08:'ACCEPTED for unchanged reviewed invalidation/withdrawal controls',QF09:'ACCEPTED evidence correction; new decisions use accurate attribution'},
 newProductionOrTestRepairs:'NONE',m1:'ACCEPTED for reached private engineering and website fidelity scope',m2:'NOT_STARTED',scientificAdjudication:'DEFERRED',historicalScientificAccounting:{accepted:19,pending:15},publicActions:'NOT_RUN'};
writeFileSync(`${folder}/final-checks.json`,JSON.stringify(final,null,2)+'\n');
console.log(JSON.stringify({status:final.status,productionInputs:final.productionInputs,artifacts,reviewStates:report.reviewStates,currentSourceQualified:true,retained:retained.length}));
