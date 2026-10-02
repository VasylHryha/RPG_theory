import { readFileSync,writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { loadCanonicalCorpus,reviewState,reviewFingerprint,dependencyClosure,semanticDigest,renderEntrySync } from '../../../../src/lib/content.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256,stableJSON } from '../../../../src/lib/identity.js';
import { filesIn } from '../../../../src/lib/source-admission.js';

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
for(const decision of decisions.decisions) {
 const entry=corpus.entries.get(decision.entryId)!;
 assert.equal(reviewState(corpus,entry.id),decision.outcome);
 assert.equal(reviewFingerprint(corpus,entry.id),decision.independentlyComputedFingerprint);
 assert.equal(semanticDigest(entry),decision.semanticDigest);
 assert.equal(sha256(renderEntrySync(corpus,entry)),decision.renderedBodySha256);
 assert.equal(stableJSON(decision.dependencies),stableJSON(dependencyClosure(corpus,entry.id).map(id=>({id,semanticDigest:semanticDigest(corpus.entries.get(id)!)}))));
 assert.equal(entry.publicationState,'draft');
}
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
const accepted=decisions.decisions.filter((d:any)=>d.outcome==='accepted').map((d:any)=>d.entryId);
const pending=decisions.decisions.filter((d:any)=>d.outcome==='pending').map((d:any)=>d.entryId);
writeFileSync(`${folder}/final-integrity.json`,JSON.stringify({date:new Date().toISOString(),status:'PASS',head:baseline.head,branch:'main',remotes:[],stagedPaths:[],protectedTrackedFiles:baseline.files.length,unchangedProtectedTrackedFiles:baseline.files.length-changed.length,preservedTaskOwnedChanges:changed,unchangedRetainedArtifactFiles:baseline.artifacts.length,retainedArchiveParity:{reportSha256:sha256(readFileSync(`${folder}/archive-parity.json`)),archiveSha256:archiveParity.archiveSha256,sourceFiles:archiveParity.files.length,identitiesUnchanged:true},retainedReviewPreviews,artifacts,productionInputs:buildInputs(),admission:corpus.admission,reviewDecisionIdentitiesVerified:decisions.decisions.length,acceptedRepresentationIds:accepted,pendingExactReviewIds:pending,scientificSourcesChanged:false,scientificExecutions:0,engineeringRepair:'REVIEW_READY for separate review',authorial:'NOT_SUPPLIED',rights:'NOT_SUPPLIED; no license grant',privacy:'PENDING',identity:'PENDING',publicTarget:'NOT_SUPPLIED; no remote',m1:'REVIEW_READY',m2:'NOT_STARTED',publicAction:'NOT_RUN',buildCommitField:'Not present in this reached private build-info schema; HEAD and uncommitted production inputs are recorded separately.'},null,2)+'\n');
writeFileSync(`${folder}/task.diff`,execFileSync('git',['diff','--',...owned]));
console.log(`PASS: ${baseline.files.length-changed.length}/${baseline.files.length} protected tracked files unchanged; ${changed.length} owned predecessors preserved; ${baseline.artifacts.length} retained artifact files unchanged; 18 accepted representation / 16 pending exact reviews; source qualification false.`);
