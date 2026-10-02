import { readFileSync,writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { loadCanonicalCorpus,reviewState,reviewFingerprint } from '../../../../src/lib/content.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256,stableJSON } from '../../../../src/lib/identity.js';
import { filesIn } from '../../../../src/lib/source-admission.js';
import { verifyReviewDecisions } from './seal-review-evidence.js';

const folder='docs/evidence/m1/scientific-review';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const baseline=read(`${folder}/baseline.json`);
const owned=['docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md','research/publication/canonical-documents.yaml','research/publication/records.yaml','research/publication/reviews.yaml','tests/content/m1.test.ts','tests/content/m1-review.test.ts','tests/content/revision-cli.test.ts','tests/content/revision-inventory-cli.test.ts','tests/e2e/reading.spec.ts'];
const changed:any[]=[];
for(const file of baseline.files) {
 const current=sha256(readFileSync(file.path));
 if(current!==file.sha256) {
  assert.ok(owned.includes(file.path),`Unexpected protected change: ${file.path}`);
  const snapshot=`${folder}/prior-code/${file.path}`;
  assert.equal(sha256(readFileSync(snapshot)),file.sha256);
  changed.push({path:file.path,priorSnapshot:snapshot,priorSha256:file.sha256,currentSha256:current});
 }
}
assert.equal(changed.length,owned.length);
for(const file of baseline.artifacts) assert.equal(sha256(readFileSync(file.path)),file.sha256,file.path);
const archiveParity=read(`${folder}/archive-parity.json`);
assert.equal(archiveParity.status,'PASS');
assert.equal(sha256(readFileSync(archiveParity.archive)),archiveParity.archiveSha256);
for(const file of archiveParity.files) assert.equal(sha256(readFileSync(file.path)),file.sha256,file.path);
const retainedReviewPreviews:any[]=[];
for(const [receiptPrefix,outputPrefix] of [['pre-recheck/','dist/m1-scientific-review/'],['','dist/m1-scientific-review-quality/']]) for(const base of ['root','subpath']) {
 const previous=read(`${folder}/${receiptPrefix}${base}-artifact.json`);
 for(const file of previous.files) assert.equal(sha256(readFileSync(`${outputPrefix}preview-${base}/${file.path}`)),file.sha256);
 retainedReviewPreviews.push({directory:`${outputPrefix}preview-${base}`,artifactSha256:previous.artifactSha256,unchangedFiles:previous.files.length});
}
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),baseline.head);
assert.equal(execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),'main');
assert.equal(execFileSync('git',['remote'],{encoding:'utf8'}).trim(),'');
assert.equal(execFileSync('git',['diff','--cached','--name-only'],{encoding:'utf8'}).trim(),'');
const corpus=loadCanonicalCorpus(),decisions=read(`${folder}/review-decisions.json`);
assert.equal(corpus.admission.currentSourceQualified,false);
assert.equal(corpus.evidence.size,0);
assert.equal(decisions.readoutSha256,sha256(readFileSync(`${folder}/source-readout.md`)));
assert.equal(decisions.accessLedgerSha256,sha256(readFileSync(`${folder}/access-ledger.json`)));
assert.equal(decisions.rendererSha256,corpus.rendererSha256);
const {accepted,pending}=verifyReviewDecisions(corpus,decisions);
assert.equal(accepted.length,18);assert.equal(pending.length,16);
assert.equal(corpus.reviews.length,18);
const verification=read(`${folder}/quality-final/verification.json`);
assert.equal(verification.status,'PASS');
assert.equal(stableJSON(buildInputs()),stableJSON(verification.productionInputs));
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-scientific-review-quality-final/preview-${base}`;
 const receipt=read(`${folder}/quality-final/${base}-artifact.json`);
 const inventory=filesIn(directory).map(path=>{const raw=readFileSync(`${directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 assert.equal(stableJSON(inventory),stableJSON(receipt.files));
 const info=read(`${directory}/build-info.json`);
 assert.equal(info.deployEligible,false);
 assert.equal(info.currentSourceQualified,false);
 assert.equal(info.config.repository,null);
 assert.equal(info.config.publicAuthorization,false);
 assert.equal(info.inputsSha256,verification.productionInputs.inputsSha256);
 return {directory,artifactSha256:sha256(stableJSON(inventory)),files:inventory.length,htmlFiles:inventory.filter(f=>f.path.endsWith('.html')).length,publicationManifestSha256:info.publicationManifestSha256,unchangedAfterBrowserControlsAndInspection:true};
});
const controls=read(`${folder}/quality-final/cli-and-output-controls.json`);
assert.equal(controls.status,'PASS');assert.equal(controls.emittedOutputControls.length,36);
for(const control of controls.emittedOutputControls) {assert.equal(control.status,'PASS');assert.equal(control.expected,control.reachedFailure);}
const states=read(`${folder}/quality-final/review-state-fingerprints.json`).entries;
assert.deepEqual(states.map((e:any)=>e.entryId).sort(),[...corpus.entries.keys()].sort());
for(const state of states) {assert.equal(state.requiredFingerprint,reviewFingerprint(corpus,state.entryId));assert.equal(state.outcome,reviewState(corpus,state.entryId));}
const recheck=read(`${folder}/recheck-2/verification.json`);
assert.equal(recheck.status,'PASS');
assert.equal(stableJSON(recheck.productionInputs),stableJSON(buildInputs()));
assert.equal(recheck.freshEvidenceNegativeControls.length,11);
assert.ok(recheck.freshEvidenceNegativeControls.every((c:any)=>c.status==='PASS' && c.reachedDiagnostic));
assert.equal(recheck.freshCurrentSourceCheck.exitCode,0);
assert.equal(recheck.freshCurrentSourceCheck.result.currentSourceQualified,false);
assert.equal(recheck.freshCurrentSourceCheck.logSha256,sha256(readFileSync(`${folder}/recheck-2/current-source.log`)));
for(const file of recheck.retainedWorkload.files) assert.equal(file.sha256,sha256(readFileSync(file.path)),`Retained workload changed: ${file.path}`);
assert.equal(recheck.retainedWorkload.sha256,sha256(stableJSON(recheck.retainedWorkload.files)));
assert.equal(recheck.retainedVerification.reportSha256,sha256(readFileSync(`${folder}/quality-final/verification.json`)));
assert.equal(recheck.retainedVerification.logSha256,sha256(readFileSync(`${folder}/verification-quality.log`)));
assert.equal(recheck.retainedVerification.outputControlsReportSha256,sha256(readFileSync(`${folder}/quality-final/cli-and-output-controls.json`)));
for(const report of recheck.retainedVerification.browser) assert.equal(report.reportSha256,sha256(readFileSync(`${folder}/quality-final/${report.base}-browser.json`)));
assert.equal(recheck.reviewRegistrySha256,sha256(readFileSync('research/publication/reviews.yaml')));
for(const file of read(`${folder}/recheck-2/prior-identities.json`).files) assert.equal(sha256(readFileSync(file.snapshot)),file.sha256);
const finalReceipt={
 date:new Date().toISOString(),status:'PASS',head:baseline.head,branch:'main',remotes:[],stagedPaths:[],
 protectedTrackedFiles:baseline.files.length,unchangedProtectedTrackedFiles:baseline.files.length-changed.length,
 preservedTaskOwnedChanges:changed,unchangedRetainedArtifactFiles:baseline.artifacts.length,
 retainedArchiveParity:{reportSha256:sha256(readFileSync(`${folder}/archive-parity.json`)),archiveSha256:archiveParity.archiveSha256,sourceFiles:archiveParity.files.length,identitiesUnchanged:true},
 retainedReviewPreviews,artifacts,productionInputs:buildInputs(),admission:corpus.admission,
 reviewDecisionIdentitiesVerified:decisions.decisions.length,acceptedRepresentationIds:accepted,pendingExactReviewIds:pending,
 secondRecheck:{verificationSha256:sha256(readFileSync(`${folder}/recheck-2/verification.json`)),freshEvidenceControls:11,freshCurrentSourceCheck:'PASS',retainedWorkloadSha256:recheck.retainedWorkload.sha256,workloadFiles:recheck.retainedWorkload.files.length,reviewDecisionsSha256:sha256(readFileSync(`${folder}/review-decisions.json`)),evidenceValidatorSha256:sha256(readFileSync(`${folder}/seal-review-evidence.ts`)),recheckRunnerSha256:sha256(readFileSync(`${folder}/recheck-2/check-review-evidence.ts`)),priorSnapshotsVerified:true},
 scientificSourcesChanged:false,scientificExecutions:0,engineeringRepair:'REVIEW_READY for separate review',
 authorial:'NOT_SUPPLIED',rights:'NOT_SUPPLIED; no license grant',privacy:'PENDING',identity:'PENDING',
 publicTarget:'NOT_SUPPLIED; no remote',m1:'REVIEW_READY',m2:'NOT_STARTED',publicAction:'NOT_RUN',
 buildCommitField:'Not present in this reached private build-info schema; HEAD and uncommitted production inputs are recorded separately.'
};
writeFileSync(`${folder}/final-integrity.json`,JSON.stringify(finalReceipt,null,2)+'\n');
writeFileSync(`${folder}/task.diff`,execFileSync('git',['diff','--',...owned]));
console.log(`PASS: ${baseline.files.length-changed.length}/${baseline.files.length} protected tracked files unchanged; ${changed.length} owned predecessors preserved; ${baseline.artifacts.length} retained artifact files unchanged; 18 accepted representation / 16 pending exact reviews; source qualification false.`);
