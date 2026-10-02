import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { loadCanonicalCorpus, reviewFingerprint } from '../../../../src/lib/content.js';
import { websiteReviewState, qualifyWebsiteCorpus } from '../../../../src/lib/website-review.js';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { filesIn } from '../../../../src/lib/source-admission.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';
import { assertBuildAllowed } from '../../../../src/lib/publication.js';
import { loadSiteConfig } from '../../../../src/lib/site-config.js';
const folder='docs/evidence/m1/website-fidelity-acceptance';
const c=loadCanonicalCorpus(),reads=JSON.parse(readFileSync(`${folder}/independent-read-snapshots.json`,'utf8'));
assert.equal(c.websiteReviews.length,34);assert.equal(qualifyWebsiteCorpus(c),true);
assert.equal(c.admission.currentSourceQualified,true);
for(const e of c.entries.values()) {
 assert.equal(websiteReviewState(c,e.id),'accepted');assert.equal(e.publicationState,'draft');
 assert.equal(reviewFingerprint(c,e.id),reads.representations.find((r:any)=>r.id===e.id).inputs.fingerprint);
}
const verification=JSON.parse(readFileSync(`${folder}/verification.json`,'utf8'));assert.equal(verification.status,'PASS');
assert.deepEqual(verification.productionInputs,buildInputs());
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-website-fidelity-acceptance/preview-${base}`,audit=auditOutput(directory);
 const prior=JSON.parse(readFileSync(`${folder}/${base}-artifact.json`,'utf8'));assert.equal(prior.artifactSha256,audit.artifactSha256);
 const browser=JSON.parse(readFileSync(`${folder}/${base}-browser.json`,'utf8'));
 assert.equal(browser.stats.expected,7);assert.equal(browser.stats.unexpected,0);assert.equal(browser.stats.skipped,0);assert.equal(browser.stats.flaky,0);
 const info=JSON.parse(readFileSync(`${directory}/build-info.json`,'utf8'));assert.equal(info.currentSourceQualified,true);assert.equal(info.deployEligible,false);
 for(const e of c.entries.values()) {
  const file=`${directory}${e.route==='/'?'/index.html':e.route+'index.html'}`,$=load(readFileSync(file,'utf8'));
  const region=$(['DOC-HOME','DOC-START'].includes(e.id)?'[data-editorial-state]':'[data-record-status]');
  assert.ok(region.text().includes('Faithful to the supplied documents'),e.id);assert.ok(region.text().includes('Draft'),e.id);
  const original=reads.representations.find((r:any)=>r.id===e.id).surfaces.find((s:any)=>s.base===info.config.basePath);
  assert.equal($('[data-canonical-body]').text(),original.bodyText);
  if(e.id==='DOC-HOME')assert.equal($('[data-source-projection="DOC-STATUS"]').text(),original.projectionText);
 }
 return {base:info.config.basePath,directory,artifactSha256:audit.artifactSha256,files:audit.files.length,html:audit.files.filter(f=>f.path.endsWith('.html')).length,chromium:7};
});
const earlier=JSON.parse(readFileSync('docs/evidence/m1/website-fidelity-recheck/final-checks.json','utf8'));
const retained=[...earlier.artifacts,...earlier.retainedArtifacts].map((a:any)=>{
 const inventory=filesIn(resolve(a.directory)).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 const digest=sha256(stableJSON(inventory));assert.equal(digest,a.artifactSha256);return {directory:a.directory,artifactSha256:digest,unchanged:true};
});
const refusals=['qualification','release'].map(mode=>{
 const output=`dist/m1-website-fidelity-acceptance/refused-${mode}`;
 assert.equal(existsSync(output),false);
 const result=spawnSync(process.execPath,['--import','tsx','scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
 writeFileSync(`${folder}/${mode}-refusal.log`,result.stdout+result.stderr);
 assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
 return {mode,exitCode:1,reason:'CURRENT_SOURCE_NOT_QUALIFIED: no published selection; the 34 reviewed entries remain drafts',outputCreated:false};
});
const config=loadSiteConfig();assert.throws(()=>assertBuildAllowed('release',config,c.admission),/PUBLIC_TARGET_REQUIRED/);
const target={...config,origin:'https://example.org',repository:{owner:'synthetic',name:'test'}};
assert.throws(()=>assertBuildAllowed('release',target,c.admission),/PUBLIC_AUTHORIZATION_REQUIRED/);
assert.throws(()=>assertBuildAllowed('release',{...target,publicAuthorization:true},c.admission),/RELEASE_PIPELINE_NOT_IMPLEMENTED/);
writeFileSync(`${folder}/final-checks.json`,JSON.stringify({status:'PASS',productionInputs:buildInputs(),reviewStates:{accepted:34,pending:0,stale:0,rejected:0},currentSourceQualified:true,reviewedFingerprints:'unchanged from independent read snapshots',scientificCertification:false,artifacts,retained,refusals,publicGuards:['PUBLIC_TARGET_REQUIRED','PUBLIC_AUTHORIZATION_REQUIRED','RELEASE_PIPELINE_NOT_IMPLEMENTED'],historicalScientificAccounting:'19 accepted / 15 pending, unchanged and deferred',productionEngineeringAcceptance:'ACCEPTED: unchanged §§0.16–0.17 scope',newTestRepair:'REVIEW_READY',m1:'REVIEW_READY: separate test-repair acceptance remains',m2:'NOT_STARTED'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',accepted:34,artifacts,refusals}));
