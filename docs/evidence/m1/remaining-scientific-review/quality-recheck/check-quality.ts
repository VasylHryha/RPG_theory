// Independent evidence checks; never writes reviews or source qualification.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadCanonicalCorpus, reviewFingerprint, reviewState, semanticDigest, dependencyClosure, renderEntrySync, validDate } from '../../../../../src/lib/content.js';
import { renderHomeStatus } from '../../../../../src/lib/presentation.js';
import { buildInputs } from '../../../../../src/lib/build-identity.js';
import { sha256, stableJSON } from '../../../../../src/lib/identity.js';
import { filesIn } from '../../../../../src/lib/source-admission.js';
import { auditOutput } from '../../../../../scripts/audit-output.js';

const folder='docs/evidence/m1/remaining-scientific-review/quality-recheck';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const corpus=loadCanonicalCorpus(), decision=read(`${folder}/e05-decision.json`);
const oldReviews=read(`${folder}/prior/research/publication/reviews.yaml`);
const oldEntries=read('docs/evidence/m1/remaining-scientific-review/entry-identities.json').entries;
assert.equal(corpus.reviews.length,19);
assert.equal(new Set(corpus.reviews.map(r=>r.entryId)).size,19);
assert.deepEqual(corpus.reviews.filter(r=>r.entryId!=='UT-E05'),oldReviews);
for(const r of oldReviews) assert.equal(reviewFingerprint(corpus,r.entryId),r.fingerprint,r.entryId);
assert.equal(corpus.admission.currentSourceQualified,false);
assert.equal(read('config/research-source.json').contentReview,'pending');
assert.equal(corpus.evidence.size,0);

function verifyE05(d:any) {
 assert.equal(d.entryId,'UT-E05'); assert.equal(d.outcome,'accepted'); assert.equal(d.reviewerKind,'agent');
 validDate(d.reviewedAt); assert.equal(d.reviewedAt,'2026-10-02');
 assert.ok(d.rationale?.trim() && d.acceptedScope?.trim());
 assert.equal(d.evidenceRef,`${folder}/source-readout.md`);
 assert.equal(d.readoutSha256,sha256(readFileSync(d.evidenceRef)));
 assert.equal(d.accessLedgerSha256,sha256(readFileSync(`${folder}/access-ledger.json`)));
 assert.equal(d.fullScientificQualification,false);
 const e=corpus.entries.get('UT-E05')!, r=corpus.reviews.find(r=>r.entryId===e.id)!;
 assert.equal(stableJSON(d.ownRead),stableJSON(e),'Stale or incomplete own-read');
 assert.equal(d.semanticDigest,semanticDigest(e),'Stale semantics');
 assert.equal(d.renderedBodySha256,sha256(renderEntrySync(corpus,e)),'Stale rendering');
 assert.equal(stableJSON(d.dependencies),stableJSON(dependencyClosure(corpus,e.id).map(id=>({id,semanticDigest:semanticDigest(corpus.entries.get(id)!)}))),'Stale dependencies');
 assert.equal(d.independentlyComputedFingerprint,reviewFingerprint(corpus,e.id),'Stale fingerprint');
 assert.equal(r.fingerprint,d.independentlyComputedFingerprint);
 assert.equal(r.reviewedAt,d.reviewedAt);assert.equal(r.reviewerKind,d.reviewerKind);
 assert.equal(r.evidenceRef,`${folder}/e05-decision.json#UT-E05`,'Wrong registry link');
 assert.equal(reviewState(corpus,e.id),'accepted');
 assert.equal(e.evidenceState,'project-reported'); assert.equal(e.publicationState,'draft');
}
verifyE05(decision);
const evidenceControls=[];
for(const [name,mutate,expected] of [
 ['missing actual own-read scope',(d:any)=>{delete d.ownRead.scope;},/Stale or incomplete own-read/],
 ['altered actual statement',(d:any)=>{d.ownRead.statement+=' Universal proof.';},/Stale or incomplete own-read/],
 ['wrong readout link',(d:any)=>{d.evidenceRef='invented';},/AssertionError/],
 ['stale body digest',(d:any)=>{d.renderedBodySha256='0'.repeat(64);},/Stale rendering/],
 ['omitted actual dependency',(d:any)=>{d.dependencies.pop();},/Stale dependencies/],
 ['copied wrong identity',(d:any)=>{d.independentlyComputedFingerprint=corpus.reviews[0].fingerprint;},/Stale fingerprint/],
] as const) {
 const d=structuredClone(decision);mutate(d);let message='';
 try {verifyE05(d);} catch(e) {assert.ok(e instanceof Error);message=e.message;assert.match(e.toString(),expected);}
 assert.ok(message,name); evidenceControls.push({name,status:'PASS',diagnostic:message.split('\n')[0]});
}
const changedEntries=[];
for(const before of oldEntries) {
 const current=corpus.entries.get(before.entryId)!;
 if(stableJSON(current)!==stableJSON(before.ownRead)) {
  assert.ok(['DOC-HOME','DOC-START'].includes(current.id));
  const expected={...before.ownRead,revision:before.ownRead.revision+1,updatedAt:'2026-10-02',scope:'Preliminary introduction bound to current source records; examples introduce the research question.'};
  assert.equal(stableJSON(current),stableJSON(expected));
  assert.equal(renderEntrySync(corpus,current),renderEntrySync(corpus,before.ownRead),'Scientific body/rendering changed');
  assert.notEqual(reviewFingerprint(corpus,current.id),before.independentlyRecomputedFingerprint);
  assert.equal(reviewState(corpus,current.id),'pending');changedEntries.push(current.id);
 }
}
assert.deepEqual(changedEntries.sort(),['DOC-HOME','DOC-START']);
const projection=renderHomeStatus(corpus,corpus.entries.get('DOC-STATUS')!);
assert.match(projection,/Whether/);assert.doesNotMatch(projection,/Evidence update|phonons|spin-ice/);
const mutation=structuredClone(corpus),consumers=['UT-E12','DOC-HOME','DOC-START','DOC-STATUS','DOC-PROOF'];
const before=Object.fromEntries(consumers.map(id=>[id,reviewFingerprint(mutation,id)]));
const unrelated=reviewFingerprint(mutation,'UT-E10');
mutation.entries.get('UT-C02')!.scope+=' Isolated actual background mutation.';
const background=consumers.map(id=>{
 const after=reviewFingerprint(mutation,id);assert.notEqual(after,before[id],id);assert.equal(reviewState(mutation,id),'pending');
 return {id,before:before[id],after,state:'pending',result:'changed identity, no accepted approval to stale'};
});
assert.equal(reviewFingerprint(mutation,'UT-E10'),unrelated);assert.equal(reviewState(mutation,'UT-C02'),'stale');
// Negative control for the review's earlier inherited-assertion assumption.
// Entirely in memory; no synthetic approval is written or used as science.
const isolated=structuredClone(corpus);
isolated.reviews.push({entryId:'DOC-HOME',fingerprint:reviewFingerprint(isolated,'DOC-HOME'),reviewerKind:'agent',reviewedAt:'2026-10-02',outcome:'accepted',evidenceRef:'in-memory mechanics control only'});
assert.equal(reviewState(isolated,'DOC-STATUS'),'pending');assert.equal(reviewState(isolated,'DOC-HOME'),'accepted');
assert.equal(corpus.reviews.length,19);assert.equal(reviewState(corpus,'DOC-HOME'),'pending');

const verification=read(`${folder}/verification.json`);
assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);assert.equal(verification.notRun.length,0);
assert.ok(verification.receipts.every((r:any)=>r.exitCode===0));
const log=readFileSync(`${folder}/verification.log`,'utf8');
for(const pattern of [/ℹ tests 65/,/ℹ pass 65/,/ℹ fail 0/,/- 0 errors/,/- 0 warnings/,/- 0 hints/]) assert.match(log,pattern);
const artifactRows=[];
for(const base of ['root','subpath']) {
 const directory=`dist/m1-remaining-review-quality/preview-${base}`;
 assert.equal(auditOutput(directory).status,'PASS');
 const files=filesIn(directory).map(path=>{const b=readFileSync(`${directory}/${path}`);return {path,bytes:b.length,sha256:sha256(b)};});
 const artifactSha256=sha256(stableJSON(files));
 writeFileSync(`${folder}/${base}-artifact.json`,JSON.stringify({directory,files,artifactSha256},null,2)+'\n');
 const browser=read(`${folder}/${base}-browser.json`);
 assert.deepEqual([browser.stats.expected,browser.stats.skipped,browser.stats.unexpected,browser.stats.flaky],[7,0,0,0]);
 assert.equal(browser.errors.length,0);
 artifactRows.push({base,directory,artifactSha256,files:files.length,htmlFiles:files.filter(f=>f.path.endsWith('.html')).length,browser:7,browserReportSha256:sha256(readFileSync(`${folder}/${base}-browser.json`))});
}
const controls=read(`${folder}/cli-and-output-controls.json`);
assert.equal(controls.status,'PASS');assert.equal(controls.emittedOutputControls.length,38);
assert.ok(controls.emittedOutputControls.every((c:any)=>c.status==='PASS'&&c.expected===c.reachedFailure));
assert.equal(controls.cli.length,2);assert.ok(controls.cli.every((c:any)=>c.exitCode===1&&!c.outputCreated&&c.reachedFailure==='CURRENT_SOURCE_NOT_QUALIFIED'));
const entries=[...corpus.entries.values()].map(e=>({entryId:e.id,state:reviewState(corpus,e.id),ownRead:e,semanticDigest:semanticDigest(e),renderedBodySha256:sha256(renderEntrySync(corpus,e)),dependencies:dependencyClosure(corpus,e.id),independentlyRecomputedFingerprint:reviewFingerprint(corpus,e.id)}));
assert.equal(entries.filter(e=>e.state==='accepted').length,19);assert.equal(entries.filter(e=>e.state==='pending').length,15);
writeFileSync(`${folder}/entry-identities.json`,JSON.stringify({purpose:'Read-only current canonical identities, not automatic paper reads or approvals',entries},null,2)+'\n');
writeFileSync(`${folder}/quality-verification.json`,JSON.stringify({date:new Date().toISOString(),status:'PASS',productionInputs:buildInputs(),freshCommands:11,contracts:65,chromium:14,outputControls:38,qualificationReleaseRefusals:2,freshEvidenceControls:evidenceControls,backgroundMutation:background,unrelatedE10:'unchanged',prior18Approvals:'unchanged objects and current identities',newBoundedAcceptance:'UT-E05',newRepairs:'ENG-03 neutral intro metadata and changed tests/evidence: REVIEW_READY for separate acceptance',changedEntryMetadata:changedEntries,scientificBodiesAndRawSources:'unchanged',scientificQualification:false,scientificExecutions:0,acceptedRepresentationIds:entries.filter(e=>e.state==='accepted').map(e=>e.entryId),pendingExactReviewIds:entries.filter(e=>e.state==='pending').map(e=>e.entryId),artifacts:artifactRows,m1:'REVIEW_READY',m2:'NOT_STARTED',publicAction:'NOT_RUN'},null,2)+'\n');
console.log('PASS: explicit bounded E05 decision; 18 prior approvals unchanged; all five actual background consumers change identity; 65 contracts / 14 Chromium / 38 output / 6 evidence controls; source qualification false.');
