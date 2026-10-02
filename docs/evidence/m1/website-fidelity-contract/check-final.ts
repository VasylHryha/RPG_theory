import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadCanonicalCorpus, dependencyClosure, affectedEntries, reviewFingerprint } from '../../../../src/lib/content.js';
import { websiteReviewState } from '../../../../src/lib/website-review.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';
import { filesIn } from '../../../../src/lib/source-admission.js';
const folder='docs/evidence/m1/website-fidelity-contract';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const c=loadCanonicalCorpus();assert.equal(c.websiteReviews.length,0);assert.equal(c.reviews.length,19);assert.equal(c.admission.currentSourceQualified,false);
assert.equal(c.entries.size,34);assert.equal([...c.entries.values()].filter(e=>e.sourceBinding).length,31);
const controls=['qualification','release'].map(mode=>{
 const output=`dist/m1-website-fidelity/${mode}-refused`;
 assert.equal(existsSync(output),false);
 const result=spawnSync(process.execPath,['--import',resolve('node_modules/tsx/dist/loader.mjs'),'scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
 writeFileSync(`${folder}/${mode}-refusal.log`,result.stdout+result.stderr);
 assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
 return {mode,exitCode:result.status,reachedFailure:'CURRENT_SOURCE_NOT_QUALIFIED',outputCreated:false};
});
const verification=read(`${folder}/verification.json`);assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);assert.deepEqual(verification.notRun,[]);
const log=readFileSync(`${folder}/verification.log`,'utf8');for(const pattern of [/ℹ tests 69/,/ℹ pass 69/,/ℹ fail 0/,/- 0 errors/,/- 0 warnings/,/- 0 hints/])assert.match(log,pattern);
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-website-fidelity/preview-${base}`,audit=auditOutput(directory),prior=read(`${folder}/${base}-artifact.json`),browser=read(`${folder}/${base}-browser.json`);
 assert.equal(audit.artifactSha256,prior.artifactSha256);assert.deepEqual([browser.stats.expected,browser.stats.skipped,browser.stats.unexpected,browser.stats.flaky],[7,0,0,0]);
 const info=read(`${directory}/build-info.json`);assert.equal(info.currentSourceQualified,false);assert.equal(info.deployEligible,false);assert.equal(info.sourceIntake.qualificationBasis,'website-source-fidelity/1');
 assert.ok(info.publicationManifest.entries.every((e:any)=>e.reviewState==='pending'));
 return {base,directory,artifactSha256:audit.artifactSha256,files:audit.files.length,htmlFiles:audit.files.filter(f=>f.path.endsWith('.html')).length,chromium:7};
});
// A fresh five-consumer check of the new contract, not scientific review.
const consumers=['UT-E12','DOC-HOME','DOC-START','DOC-STATUS','DOC-PROOF'];
const before=Object.fromEntries(consumers.map(id=>[id,reviewFingerprint(c,id)])),unrelated=reviewFingerprint(c,'UT-E10');
c.entries.get('UT-C02')!.scope+=' Isolated final engineering control.';
const background=consumers.map(id=>{assert.ok(dependencyClosure(c,id).includes('UT-C02'));assert.ok(affectedEntries(c,'UT-C02').includes(id));assert.notEqual(reviewFingerprint(c,id),before[id]);assert.equal(websiteReviewState(c,id),'pending');return {id,before:before[id],after:reviewFingerprint(c,id),websiteReviewState:'pending'};});
assert.equal(reviewFingerprint(c,'UT-E10'),unrelated);
// Recompute the retained old trees without invoking historical runners or overwriting receipts.
const retained=['root','subpath'].map(base=>{
 const directory=`dist/m1-remaining-review-quality/preview-${base}`;
 const inventory=filesIn(directory).map(path=>{const raw=readFileSync(`${directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 const expected=read(`docs/evidence/m1/remaining-scientific-review/quality-recheck/${base}-artifact.json`).artifactSha256;
 assert.equal(sha256(stableJSON(inventory)),expected);return {directory,artifactSha256:expected,unchanged:true};
});
writeFileSync(`${folder}/final-checks.json`,JSON.stringify({status:'PASS',productionInputs:buildInputs(),contracts:69,chromium:14,commands:11,sourceBytes:c.admission,qualificationReleaseRefusals:controls,background,unrelatedE10:'unchanged',artifacts,retainedArtifacts:retained,websiteDecisions:0,historicalScientificDecisions:19,scientificAdjudication:'NOT_RUN',newBatch:'REVIEW_READY',m2:'NOT_STARTED',publicActions:'NOT_RUN'},null,2)+'\n');
console.log('PASS: production refusals, fresh artifact identity, historical artifact preservation and all-five invalidation.');
