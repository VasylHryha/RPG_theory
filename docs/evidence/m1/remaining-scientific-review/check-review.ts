// Read-only independent acceptance checks. Writes evidence here, never approvals.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCanonicalCorpus, affectedEntries, reviewFingerprint, reviewState, semanticDigest, renderEntrySync, dependencyClosure } from '../../../../src/lib/content.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';
import { filesIn } from '../../../../src/lib/source-admission.js';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { verifyReviewDecisions } from '../scientific-review/seal-review-evidence.js';

const folder='docs/evidence/m1/remaining-scientific-review', prior='docs/evidence/m1/scientific-review';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const baseline=read(`${folder}/baseline.json`), seal=read(`${prior}/final-integrity.json`);
const corpus=loadCanonicalCorpus(), report=read(`${prior}/review-decisions.json`);
const registry=readFileSync('research/publication/reviews.yaml');
const states=verifyReviewDecisions(corpus,report);
assert.equal(report.readoutSha256,sha256(readFileSync(`${prior}/source-readout.md`)));
assert.equal(report.accessLedgerSha256,sha256(readFileSync(`${prior}/access-ledger.json`)));
assert.deepEqual(states.accepted,seal.acceptedRepresentationIds);
assert.deepEqual(states.pending,seal.pendingExactReviewIds);
assert.equal(states.accepted.length,18); assert.equal(states.pending.length,16);
assert.equal(corpus.admission.currentSourceQualified,false); assert.equal(corpus.evidence.size,0);
assert.equal(stableJSON(buildInputs()),stableJSON(seal.productionInputs));
const recheck=read(`${prior}/recheck-2/verification.json`);
assert.equal(sha256(readFileSync(`${prior}/recheck-2/verification.json`)),seal.secondRecheck.verificationSha256);
assert.equal(sha256(readFileSync(`${prior}/seal-review-evidence.ts`)),seal.secondRecheck.evidenceValidatorSha256);
assert.equal(sha256(readFileSync(`${prior}/recheck-2/check-review-evidence.ts`)),seal.secondRecheck.recheckRunnerSha256);
for(const file of recheck.retainedWorkload.files) assert.equal(sha256(readFileSync(file.path)),file.sha256,file.path);
assert.equal(sha256(stableJSON(recheck.retainedWorkload.files)),recheck.retainedWorkload.sha256);
assert.equal(recheck.retainedWorkload.files.length,84);
assert.equal(stableJSON(recheck.productionInputs),stableJSON(buildInputs()));
const retained=recheck.retainedVerification;
assert.equal(sha256(readFileSync(`${prior}/quality-final/verification.json`)),retained.reportSha256);
assert.equal(sha256(readFileSync(`${prior}/verification-quality.log`)),retained.logSha256);
assert.equal(sha256(readFileSync(`${prior}/quality-final/cli-and-output-controls.json`)),retained.outputControlsReportSha256);
assert.equal(sha256(readFileSync(`${prior}/recheck-2/current-source.log`)),recheck.freshCurrentSourceCheck.logSha256);
const verification=read(`${prior}/quality-final/verification.json`);
assert.equal(verification.status,'PASS');assert.equal(verification.notRun.length,0);
assert.equal(verification.receipts.length,9);assert.ok(verification.receipts.every((r:any)=>r.exitCode===0));
assert.equal(sha256(readFileSync(verification.reused.from)),verification.reused.sha256);
const log=readFileSync(`${prior}/verification-quality.log`,'utf8');
for(const match of [/ℹ tests 65/,/ℹ pass 65/,/ℹ fail 0/,/- 0 errors/,/- 0 warnings/,/- 0 hints/]) assert.match(log,match);
for(const b of retained.browser) {
 const path=`${prior}/quality-final/${b.base}-browser.json`,r=read(path);
 assert.equal(sha256(readFileSync(path)),b.reportSha256);
 assert.deepEqual({expected:r.stats.expected,skipped:r.stats.skipped,unexpected:r.stats.unexpected,flaky:r.stats.flaky},{expected:7,skipped:0,unexpected:0,flaky:0});
 assert.equal(r.errors.length,0);
}
const controls=read(`${prior}/quality-final/cli-and-output-controls.json`);
assert.equal(controls.emittedOutputControls.length,36);
assert.equal(new Set(controls.emittedOutputControls.map((c:any)=>`${c.base}:${c.name}`)).size,36);
assert.ok(controls.emittedOutputControls.every((c:any)=>c.status==='PASS'&&c.expected===c.reachedFailure));
assert.equal(controls.cli.length,2);
assert.ok(controls.cli.every((c:any)=>c.exitCode===1&&c.reachedFailure==='CURRENT_SOURCE_NOT_QUALIFIED'&&!c.outputCreated));
assert.equal(recheck.freshEvidenceNegativeControls.length,11);
assert.ok(recheck.freshEvidenceNegativeControls.every((c:any)=>c.status==='PASS'&&c.reachedDiagnostic));
const pins=read('package.json');
const packages=Object.fromEntries(Object.keys(recheck.toolchain.packages).map(name=>{
 const version=read(`node_modules/${name}/package.json`).version;
 assert.equal(version,pins.dependencies?.[name]??pins.devDependencies?.[name]);
 assert.equal(version,recheck.toolchain.packages[name]);return [name,version];
}));
assert.equal(process.version,recheck.toolchain.node);

// ENG-01: a fresh mutation of the real background meaning reaches every consumer.
const affected=affectedEntries(corpus,'UT-C02');
for(const id of ['UT-E12','DOC-HOME','DOC-START','DOC-STATUS','DOC-PROOF']) assert.ok(affected.includes(id),id);
const isolated=structuredClone(corpus),before=reviewFingerprint(isolated,'UT-E12'), unrelated=reviewFingerprint(isolated,'UT-E10');
isolated.entries.get('UT-C02')!.scope+=' Independent background perturbation.';
assert.notEqual(reviewFingerprint(isolated,'UT-E12'),before);
assert.equal(reviewFingerprint(isolated,'UT-E10'),unrelated);
assert.equal(reviewState(isolated,'UT-C02'),'stale');
assert.equal(corpus.entries.get('UT-E12')!.revision,2);
assert.deepEqual(corpus.entries.get('UT-E12')!.dependsOn,['UT-C01','UT-C02','UT-D03']);
// ENG-02: inspect the complete neutral metadata and minimal rendered consumer.
const concept=corpus.entries.get('DOC-CONCEPT-GEOMETRY')!;
assert.equal(concept.revision,2);assert.equal(concept.updatedAt,'2026-10-02');
assert.doesNotMatch(concept.description+' '+concept.scope,/await|pending/i);
assert.deepEqual(concept.dependsOn,['UT-D01','UT-D02','UT-D03']);
assert.match(renderEntrySync(corpus,concept),/Organization at a chosen scale/);

const negative:any[]=[];
for(const [name,change,expected] of [
 ['missing evidence decision',(d:any)=>{d.decisions=d.decisions.filter((r:any)=>r.entryId!=='UT-E12');},/Incomplete review decision inventory/],
 ['duplicate accepted decision',(d:any)=>{d.decisions.push(d.decisions.find((r:any)=>r.entryId==='UT-D01'));},/Duplicate review decision/],
 ['stale actual own-read scope',(d:any)=>{d.decisions.find((r:any)=>r.entryId==='UT-E12').ownRead.scope='Universal forces proved';},/Stale own-read field/],
 ['wrong concept review date',(d:any)=>{d.decisions.find((r:any)=>r.entryId==='DOC-CONCEPT-GEOMETRY').reviewedAt='2026-10-01';},/review date mismatch/],
 ['fabricated pending approval',(d:any)=>{d.decisions.find((r:any)=>r.entryId==='UT-E11').outcome='accepted';},/state mismatch/],
 ['wrong actual registry link',(d:any)=>{d.decisions.find((r:any)=>r.entryId==='UT-D01').evidenceRef='invented';},/Wrong decision evidence reference/]
] as const) {
 let diagnostic='';const copy=structuredClone(report);change(copy);
 try {verifyReviewDecisions(corpus,copy);} catch(error) {assert.ok(error instanceof Error);diagnostic=error.message;}
 assert.match(diagnostic,expected);negative.push({name,status:'PASS',diagnostic:diagnostic.split('\n')[0]});
}
const artifacts:any[]=[], outputControls:any[]=[];
const temporary=mkdtempSync(join(tmpdir(),'unity-independent-m1-'));
try {
 for(const base of ['root','subpath']) {
  const directory=`dist/m1-scientific-review-quality-final/preview-${base}`;
  const artifact=read(`${prior}/quality-final/${base}-artifact.json`);
  const inventory=filesIn(directory).map(path=>{const raw=readFileSync(`${directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
  assert.equal(stableJSON(inventory),stableJSON(artifact.files));
  assert.equal(sha256(stableJSON(inventory)),artifact.artifactSha256);
  const audit=auditOutput(directory);assert.equal(audit.status,'PASS');
  artifacts.push({base,directory,artifactSha256:artifact.artifactSha256,files:inventory.length,audit:'PASS'});
  const copy=join(temporary,base);cpSync(directory,copy,{recursive:true});
  for(const [file,from,to] of [
   ['claims/UT-E12/index.html','UT-C02 — Background and possibility-space extension','Background dependency removed'],
   ['concepts/geometry-and-modes/index.html',concept.description,'Derivative explanations await independent review.']
  ]) {
   const path=join(copy,file),raw=readFileSync(path,'utf8');assert.ok(raw.includes(from),file);
   writeFileSync(path,raw.replace(from,to));assert.throws(()=>auditOutput(copy),/CONTENT_METADATA_PARITY_FAILURE/);
   outputControls.push({base,file,status:'PASS',diagnostic:'CONTENT_METADATA_PARITY_FAILURE'});writeFileSync(path,raw);
  }
 }
} finally {rmSync(temporary,{recursive:true,force:true});}
const commands:any[]=[];
for(const scope of ['current','history']) {
 const args=['--import','tsx','scripts/check-sources.ts','--scope',scope];
 const r=spawnSync(process.execPath,args,{encoding:'utf8'});
 writeFileSync(`${folder}/source-${scope}.log`,r.stdout+r.stderr);assert.equal(r.status,0,r.stdout+r.stderr);
 commands.push({command:`node ${args.join(' ')}`,exitCode:r.status,logSha256:sha256(readFileSync(`${folder}/source-${scope}.log`))});
}
// Fresh exact content/citation identities, for evidence only; no approval writes.
const entryReadout=[...corpus.entries.values()].map(e=>({entryId:e.id,reviewState:reviewState(corpus,e.id),ownRead:e,semanticDigest:semanticDigest(e),renderedBodySha256:sha256(renderEntrySync(corpus,e)),dependencies:dependencyClosure(corpus,e.id),independentlyRecomputedFingerprint:reviewFingerprint(corpus,e.id)}));
writeFileSync(`${folder}/entry-identities.json`,JSON.stringify({purpose:'Read-only verification of unchanged representations; no new approvals',entries:entryReadout,references:[...corpus.references.values()],aliases:[...corpus.aliases]},null,2)+'\n');
assert.deepEqual(readFileSync('research/publication/reviews.yaml'),registry);
const plan='docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md';
const changed=baseline.files.filter((f:any)=>sha256(readFileSync(f.path))!==f.sha256);
assert.ok(changed.every((f:any)=>f.path===plan),'Changed pre-existing work');
assert.equal(sha256(readFileSync(`${folder}/prior-plan.md`)),baseline.files.find((f:any)=>f.path===plan).sha256);
const git=(args:string[])=>{const r=spawnSync('git',args,{encoding:'utf8'});assert.equal(r.status,0);return r.stdout.trim();};
assert.equal(git(['rev-parse','HEAD']),baseline.head);assert.equal(git(['branch','--show-current']),'main');assert.equal(git(['remote']),'');assert.equal(git(['diff','--cached','--name-only']),'');
assert.equal(stableJSON(buildInputs()),stableJSON(seal.productionInputs));
writeFileSync(`${folder}/verification.json`,JSON.stringify({date:new Date().toISOString(),status:'PASS',engineeringDecision:'ACCEPTED: unchanged ENG-01/02, review-registry/test migration, RR-02 evidence seal and RR-03 workload correction only',newProductionRepairs:0,productionInputs:buildInputs(),toolchain:{node:process.version,packages},retainedWorkloadFiles:84,retainedResults:{contracts:65,chromium:14,outputControls:36,evidenceControls:11,basis:'Fresh complete workload/input and raw-log reconciliation; current-scope source reuse correction retained'},freshSourceCommands:commands,freshArtifactAudits:artifacts,freshEvidenceControls:negative,freshOutputControls:outputControls,backgroundMutation:'PASS; E12 and four consumers invalidate; E10 locality preserved',protectedBaselineFiles:baseline.files.length,unchangedBaselineFiles:baseline.files.length-changed.length,changedBaselineFiles:changed.map((f:any)=>f.path),acceptedRepresentationIds:states.accepted,pendingExactReviewIds:states.pending,scientificQualification:false,scientificExecutions:0,scientificSourceEdits:0,reviewRegistryUnchanged:true,m1:'REVIEW_READY',m2:'NOT_STARTED',publicAction:'NOT_RUN'},null,2)+'\n');
console.log(`PASS: ${baseline.files.length-changed.length} baseline files unchanged; 84 retained workload identities; both artifacts audited; 6 evidence and 4 output controls; 18 accepted / 16 pending unchanged; source qualification false.`);
