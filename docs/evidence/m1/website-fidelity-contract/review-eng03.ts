import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadCanonicalCorpus, reviewFingerprint, reviewState, renderEntrySync } from '../../../../src/lib/content.js';
import { renderHomeStatus } from '../../../../src/lib/presentation.js';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { sha256 } from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/website-fidelity-contract';
const old='docs/evidence/m1/remaining-scientific-review/quality-recheck';
const c=loadCanonicalCorpus();
const parsePage=(path:string)=>{const raw=readFileSync(path,'utf8'),m=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)!;return {meta:JSON.parse(m[1]),body:m[2]};};
for(const name of ['home','start']) {
 const path=`research/publication/pages/${name}.md`,prior=parsePage(`${old}/prior/${path}`),next=parsePage(path);
 assert.equal(next.body,prior.body);
 assert.deepEqual(next.meta,{...prior.meta,revision:prior.meta.revision+1,updatedAt:'2026-10-02',scope:'Preliminary introduction bound to current source records; examples introduce the research question.'});
 assert.equal(reviewState(c,next.meta.id),'pending');assert.equal(next.meta.publicationState,'draft');
}
const reviews=JSON.parse(readFileSync(`${old}/prior/research/publication/reviews.yaml`,'utf8'));
assert.deepEqual(c.reviews.filter(r=>r.entryId!=='UT-E05'),reviews);
assert.equal(c.reviews.length,19);for(const r of c.reviews)assert.equal(reviewState(c,r.entryId),'accepted');
const decision=JSON.parse(readFileSync(`${old}/e05-decision.json`,'utf8'));
assert.deepEqual(decision.ownRead,c.entries.get('UT-E05'));assert.equal(decision.independentlyComputedFingerprint,reviewFingerprint(c,'UT-E05'));
assert.equal(decision.renderedBodySha256,sha256(renderEntrySync(c,c.entries.get('UT-E05')!)));
assert.equal(decision.readoutSha256,sha256(readFileSync(decision.evidenceRef)));
assert.equal(c.entries.get('UT-E05')!.evidenceState,'project-reported');assert.equal(c.admission.currentSourceQualified,false);
assert.doesNotMatch(renderHomeStatus(c,c.entries.get('DOC-STATUS')!),/Evidence update|phonons|spin-ice/);
const consumers=['UT-E12','DOC-HOME','DOC-START','DOC-STATUS','DOC-PROOF'];
const before=Object.fromEntries(consumers.map(id=>[id,reviewFingerprint(c,id)])),unrelated=reviewFingerprint(c,'UT-E10');
c.entries.get('UT-C02')!.scope+=' Independent engineering perturbation.';
for(const id of consumers){assert.notEqual(reviewFingerprint(c,id),before[id]);assert.equal(reviewState(c,id),'pending');}
assert.equal(reviewFingerprint(c,'UT-E10'),unrelated);assert.equal(reviewState(c,'UT-C02'),'stale');
const artifacts=['root','subpath'].map(base=>{const result=auditOutput(`dist/m1-remaining-review-quality/preview-${base}`);const prior=JSON.parse(readFileSync(`${old}/${base}-artifact.json`,'utf8'));assert.equal(result.artifactSha256,prior.artifactSha256);return {base,artifactSha256:result.artifactSha256,files:result.files.length};});
writeFileSync(`${folder}/eng03-independent-review.json`,JSON.stringify({status:'PASS',baselineHEAD:'8377cd396592dfbe030790e0634b87e385cba067',acceptedScope:'Unchanged ENG-03 neutral metadata, all-five dependency regression, emitted review/status parity, and registry/evidence integrity only',scientificDecision:'NOT_REVIEWED; prior E05 decision preserved without support adjudication',consumers,unrelatedE10:'unchanged',artifacts,newRepairsAccepted:false},null,2)+'\n');
console.log('PASS: independently verified unchanged ENG-03 engineering scope; no new scientific decision.');
