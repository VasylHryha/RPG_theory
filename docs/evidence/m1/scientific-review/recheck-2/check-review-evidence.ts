import { readFileSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { loadCanonicalCorpus } from '../../../../../src/lib/content.js';
import { buildInputs } from '../../../../../src/lib/build-identity.js';
import { sha256,stableJSON } from '../../../../../src/lib/identity.js';
import { filesIn } from '../../../../../src/lib/source-admission.js';
import { verifyReviewDecisions } from '../seal-review-evidence.js';

const folder='docs/evidence/m1/scientific-review';
const read=(file:string)=>JSON.parse(readFileSync(file,'utf8'));
const report=read(`${folder}/review-decisions.json`),corpus=loadCanonicalCorpus();
const registryBefore=readFileSync('research/publication/reviews.yaml');
const positive=verifyReviewDecisions(corpus,report);
const controls:Array<{name:string;reachedDiagnostic:string;status:string}>=[];
for(const [name,change,diagnostic] of [
 ['missing pending decision',(d:any)=>{d.decisions=d.decisions.filter((e:any)=>e.entryId!=='UT-E01');},/Incomplete review decision inventory/],
 ['duplicate decision',(d:any)=>{d.decisions.push(d.decisions[0]);},/Duplicate review decision/],
 ['stale own-read statement',(d:any)=>{d.decisions.find((e:any)=>e.entryId==='UT-D01').ownRead.statement+=' Invented wording.';},/Stale own-read field/],
 ['missing own-read field',(d:any)=>{delete d.decisions[0].ownRead.assumptions;},/Missing own-read field/],
 ['wrong recorded review date',(d:any)=>{d.decisions.find((e:any)=>e.entryId==='UT-D01').reviewedAt='2026-10-02';},/Decision\/registry review date mismatch/],
 ['invented pending acceptance',(d:any)=>{d.decisions.find((e:any)=>e.entryId==='UT-E01').outcome='accepted';},/Decision\/registry state mismatch/],
 ['missing accepted scope',(d:any)=>{d.decisions.find((e:any)=>e.entryId==='UT-D01').acceptedScope='';},/Missing accepted scope/],
 ['wrong decision evidence link',(d:any)=>{d.decisions[0].evidenceRef='docs/evidence/fabricated.md';},/Wrong decision evidence reference/],
 ['stale decision fingerprint',(d:any)=>{d.decisions[0].independentlyComputedFingerprint='0'.repeat(64);},/Stale decision fingerprint/],
 ['stale rendering identity',(d:any)=>{d.rendererSha256='0'.repeat(64);},/Stale decision renderer/],
 ['pending decision has accepted scope',(d:any)=>{d.decisions.find((e:any)=>e.entryId==='UT-E01').acceptedScope='Approved';},/Pending decision has accepted scope/]
] as const) {
 const isolated=structuredClone(report);change(isolated);
 let message='';
 try {verifyReviewDecisions(corpus,isolated);} catch(error) {if(error instanceof Error) message=error.message;else throw error;}
 assert.match(message,diagnostic,name);
 controls.push({name,reachedDiagnostic:message.split('\n')[0],status:'PASS'});
}

const priorSeal=read(`${folder}/recheck-2/prior/${folder}/final-integrity.json`);
assert.equal(stableJSON(report.decisions),stableJSON(read(`${folder}/recheck-2/prior/${folder}/review-decisions.json`).decisions),'Recheck changed individual scientific decisions');
assert.equal(stableJSON(buildInputs()),stableJSON(priorSeal.productionInputs),'Production inputs changed since prior tests');
const initial=read(`${folder}/baseline.json`);
const known=new Map<string,string>(initial.files.map((f:any)=>[f.path,f.sha256]));
for(const f of priorSeal.preservedTaskOwnedChanges) known.set(f.path,f.currentSha256);
// Production identity excludes test files. Reconcile them against the prior seal
// and initial protected snapshot before retaining any suite result.
const workloadPaths=[...['tests','scripts','src/lib','research/RRG_CURRENT','research/history','research/project-notes','research/publication','config'].flatMap(p=>filesIn(p).filter(f=>!f.split('/').includes('__pycache__')).map(f=>`${p}/${f}`)),
 'research/source-manifest.json','playwright.config.ts','package.json','package-lock.json','tsconfig.json','.node-version','.npmrc'];
const workload=[...new Set(workloadPaths)].sort().map(path=>{
 const current=sha256(readFileSync(path));assert.equal(current,known.get(path),`Unverified retained workload: ${path}`);
 return {path,sha256:current};
});
const verification=read(`${folder}/quality-final/verification.json`);
assert.equal(verification.status,'PASS');assert.equal(verification.notRun.length,0);
assert.equal(verification.receipts.length,9);assert.ok(verification.receipts.every((r:any)=>r.exitCode===0));
assert.equal(sha256(readFileSync(verification.reused.from)),verification.reused.sha256);
const log=readFileSync(`${folder}/verification-quality.log`,'utf8');
assert.match(log,/ℹ tests 65/);assert.match(log,/ℹ pass 65/);assert.match(log,/ℹ fail 0/);
assert.match(log,/- 0 errors/);assert.match(log,/- 0 warnings/);assert.match(log,/- 0 hints/);
const browser= ['root','subpath'].map(base=>{
 const r=read(`${folder}/quality-final/${base}-browser.json`);
 assert.equal(r.errors.length,0);assert.deepEqual({expected:r.stats.expected,skipped:r.stats.skipped,unexpected:r.stats.unexpected,flaky:r.stats.flaky},{expected:7,skipped:0,unexpected:0,flaky:0});
 return {base,passed:7,reportSha256:sha256(readFileSync(`${folder}/quality-final/${base}-browser.json`))};
});
const output=read(`${folder}/quality-final/cli-and-output-controls.json`);
assert.equal(output.status,'PASS');assert.equal(output.emittedOutputControls.length,36);
assert.equal(new Set(output.emittedOutputControls.map((c:any)=>`${c.base}:${c.name}`)).size,36);
assert.ok(output.emittedOutputControls.every((c:any)=>c.status==='PASS' && c.expected===c.reachedFailure));
assert.equal(output.cli.length,2);
for(const c of output.cli) {assert.equal(c.exitCode,1);assert.equal(c.reachedFailure,'CURRENT_SOURCE_NOT_QUALIFIED');assert.equal(c.outputCreated,false);}
assert.equal(corpus.admission.currentSourceQualified,false);assert.equal(corpus.evidence.size,0);
const packagePins=read('package.json');
const toolchain={node:process.version,packages:Object.fromEntries(['astro','tsx','typescript','@playwright/test','@axe-core/playwright'].map(name=>{
 const version=read(`node_modules/${name}/package.json`).version;
 assert.equal(version,packagePins.dependencies?.[name]??packagePins.devDependencies?.[name]);
 return [name,version];
}))};
assert.equal(process.version.slice(1),readFileSync('.node-version','utf8').trim());
const sourceArgv=['--import','tsx','scripts/check-sources.ts','--scope','current'];
const source=spawnSync(process.execPath,sourceArgv,{encoding:'utf8'});
writeFileSync(`${folder}/recheck-2/current-source.log`,source.stdout+source.stderr);
assert.equal(source.status,0,source.stdout+source.stderr);
const sourceResult=JSON.parse(source.stdout);
assert.equal(sourceResult.currentSourceQualified,false);assert.equal(sourceResult.bytesVerified,true);
assert.equal(sourceResult.sourceBoundEntries,31);assert.equal(sourceResult.contentReview,'pending');
assert.equal(stableJSON(buildInputs()),stableJSON(priorSeal.productionInputs),'Checks changed production inputs');
assert.deepEqual(readFileSync('research/publication/reviews.yaml'),registryBefore,'Evidence checks changed approvals');
writeFileSync(`${folder}/recheck-2/verification.json`,JSON.stringify({date:new Date().toISOString(),status:'PASS',scope:'Evidence integrity and exact retained workload; no scientific approval writer',positive:{decisions:report.decisions.length,accepted:positive.accepted.length,pending:positive.pending.length},freshEvidenceNegativeControls:controls,productionInputs:buildInputs(),toolchain,freshCurrentSourceCheck:{command:`node ${sourceArgv.join(' ')}`,exitCode:source.status,result:sourceResult,logSha256:sha256(readFileSync(`${folder}/recheck-2/current-source.log`))},retainedWorkload:{files:workload,sha256:sha256(stableJSON(workload)),basis:'Each workload identity reconciled against pre-recheck-2 final seal or initial tracked snapshot; original tests/build/browser/output evidence retained unchanged.'},retainedVerification:{reportSha256:sha256(readFileSync(`${folder}/quality-final/verification.json`)),logSha256:sha256(readFileSync(`${folder}/verification-quality.log`)),contracts:65,browser,outputControls:36,outputControlsReportSha256:sha256(readFileSync(`${folder}/quality-final/cli-and-output-controls.json`))},sourceCommandLimit:'check:sources --scope current calls the corpus loader, so its complete command inputs changed in the first quality repair. The earlier byte-integrity subresult is retained; this second recheck runs the actual current-scope command freshly. History-only source checks remain identity-valid.',reviewRegistrySha256:sha256(registryBefore),scientificSourceQualified:false,scientificSourceMutation:false,publicAction:'NOT_RUN'},null,2)+'\n');
console.log(`PASS: ${controls.length} reached evidence controls; ${workload.length} workload identities; retained 65 contracts / 14 browser / 36 output controls; 18 accepted / 16 pending unchanged.`);
