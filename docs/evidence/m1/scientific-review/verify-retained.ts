import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { loadCanonicalCorpus, reviewFingerprint, reviewState } from '../../../../src/lib/content.js';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { stableJSON } from '../../../../src/lib/identity.js';

const folder='docs/evidence/m1/scientific-review';
const prior=JSON.parse(readFileSync('docs/evidence/m1/independent-review/final-integrity.json','utf8'));
assert.equal(stableJSON(buildInputs()),stableJSON(prior.productionInputs));
const artifacts=prior.artifacts.filter((a:any)=>a.directory.startsWith('dist/m1-independent-review/'));
const inspected=artifacts.map((a:any)=>{
  const actual=auditOutput(a.directory);
  assert.equal(actual.artifactSha256,a.artifactSha256);
  return {directory:a.directory,artifactSha256:actual.artifactSha256,files:actual.files.length,status:actual.status};
});
const corpus=loadCanonicalCorpus();
const requests=JSON.parse(readFileSync('docs/evidence/m1/independent-review/review-request-fingerprints.json','utf8')).entries;
assert.equal(requests.length,34);
for(const request of requests) {
  assert.equal(reviewFingerprint(corpus,request.entryId),request.requiredFingerprint);
  assert.equal(reviewState(corpus,request.entryId),'pending');
}
writeFileSync(`${folder}/retained-identity-check.json`,JSON.stringify({status:'PASS',productionInputs:buildInputs(),artifacts:inspected,pendingRequestIdentitiesVerified:requests.length,approvalsCreated:0,reuseScope:'Unchanged predecessor engineering/display evidence only; no scientific support inferred.'},null,2)+'\n');
console.log('PASS: retained engineering artifacts and 34 pending request identities verified; no approvals.');
