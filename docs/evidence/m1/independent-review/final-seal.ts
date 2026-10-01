import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { filesIn, sourceState } from '../../../../src/lib/source-admission.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';
import { loadCanonicalCorpus, reviewFingerprint } from '../../../../src/lib/content.js';

const evidence='docs/evidence/m1/independent-review';
const owned=['src/lib/content.ts','tests/content/m1.test.ts','research/publication/references.yaml','docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md'];
const baseline=JSON.parse(readFileSync(`${evidence}/baseline.json`,'utf8'));
const changes=[];
for(const file of baseline.files) {
 assert.ok(existsSync(file.path),file.path);
 const currentSha256=sha256(readFileSync(file.path));
 if(currentSha256===file.sha256) continue;
 assert.ok(owned.includes(file.path),`Unrelated protected mutation: ${file.path}`);
 const priorSnapshot=`${evidence}/prior-code/${file.path}`;
 assert.equal(sha256(readFileSync(priorSnapshot)),file.sha256,file.path);
 changes.push({path:file.path,priorSnapshot,priorSha256:file.sha256,currentSha256});
}
const artifacts=[];
for(const [folder,receiptFolder] of [['dist/m1-review-recheck','docs/evidence/m1/review-recheck'],['dist/m1-independent-review',evidence]]) {
 for(const base of ['root','subpath']) {
  const directory=`${folder}/preview-${base}`;
  const files=filesIn(directory).map(path=>{const raw=readFileSync(`${directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
  const receipt=JSON.parse(readFileSync(`${receiptFolder}/${base}-artifact.json`,'utf8'));
  assert.equal(stableJSON(files),stableJSON(receipt.files),directory);
  const artifactSha256=sha256(stableJSON(files));assert.equal(artifactSha256,receipt.artifactSha256);
  const info=JSON.parse(readFileSync(`${directory}/build-info.json`,'utf8'));
  if(folder==='dist/m1-independent-review') for(const [key,value] of Object.entries(buildInputs())) assert.equal(info[key],value,key);
  artifacts.push({directory,artifactSha256,files:files.length,htmlPaths:files.filter(f=>f.path.endsWith('.html')).length,publicationManifestSha256:info.publicationManifestSha256,inputsSha256:info.inputsSha256,lockfileSha256:info.lockfileSha256,unchangedAfterBrowserAndControls:true});
 }
}
const admission=sourceState();assert.equal(admission.currentSourceQualified,false);
assert.deepEqual(JSON.parse(readFileSync('research/publication/reviews.yaml','utf8')),[]);
assert.deepEqual(JSON.parse(readFileSync('research/publication/execution-evidence.yaml','utf8')),[]);
const corpus=loadCanonicalCorpus();
for(const item of JSON.parse(readFileSync(`${evidence}/review-request-fingerprints.json`,'utf8')).entries) {
 assert.equal(item.outcome,'pending');assert.equal(item.requiredFingerprint,reviewFingerprint(corpus,item.entryId));
}
const verification=JSON.parse(readFileSync(`${evidence}/verification.json`,'utf8'));
assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);
for(const base of ['root','subpath']) {
 const report=JSON.parse(readFileSync(`${evidence}/${base}-browser.json`,'utf8'));
 assert.equal(report.stats.expected,7);assert.equal(report.stats.unexpected,0);assert.equal(report.stats.flaky,0);assert.equal(report.stats.skipped,0);
}
const controls=JSON.parse(readFileSync(`${evidence}/cli-and-output-controls.json`,'utf8'));
assert.equal(controls.status,'PASS');assert.equal(controls.emittedOutputControls.length,28);assert.equal(controls.cli.length,2);
const report={date:new Date().toISOString(),status:'PASS',protectedBaselineFiles:baseline.files.length,unchangedProtectedFiles:baseline.files.length-changes.length,preservedTaskOwnedChanges:changes,artifacts,productionInputs:buildInputs(),admission,engineeringDecision:'ACCEPTED — demonstrated private M1 slice only',scientificAcceptance:false,publicAction:'NOT_RUN'};
writeFileSync(`${evidence}/final-integrity.json`,JSON.stringify(report,null,2)+'\n');
writeFileSync(`${evidence}/task-files.json`,JSON.stringify({gitHead:null,gitRemote:null,files:owned.map(path=>({path,sha256:sha256(readFileSync(path))}))},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',protected:baseline.files.length,unchanged:report.unchangedProtectedFiles,changedWithPriorSnapshots:changes.length,artifacts:artifacts.length,currentSourceQualified:false}));
