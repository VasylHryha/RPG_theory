import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCanonicalCorpus, reviewFingerprint } from '../../src/lib/content.js';
import { qualifyCurrentSource, readAdmission } from '../../src/lib/source-admission.js';
import { websiteReviewInputs, websiteReviewState, validateWebsiteReviews, qualifyWebsiteCorpus, fidelityChecks } from '../../src/lib/website-review.js';
import { sha256 } from '../../src/lib/identity.js';

function control(c:ReturnType<typeof loadCanonicalCorpus>,root:string,id='UT-D01') {
 const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1' as const,entryId:id,fingerprint:reviewFingerprint(c,id),reviewerKind:'agent' as const,reviewedAt:'2026-10-02',outcome:'accepted' as const,scientificCertification:false,rationale:'Synthetic mechanics control only; no real acceptance.',inputs:structuredClone(websiteReviewInputs(c,id)),checks:Object.fromEntries(fidelityChecks.map(key=>[key,'Synthetic comparison only']))};
 const evidenceRef='docs/evidence/control.json';mkdirSync(join(root,'docs/evidence'),{recursive:true});
 const save=()=>{const raw=JSON.stringify(decision);writeFileSync(join(root,evidenceRef),raw);return {purpose:decision.purpose,entryId:id,fingerprint:decision.fingerprint,reviewerKind:decision.reviewerKind,reviewedAt:decision.reviewedAt,outcome:decision.outcome,evidenceRef,evidenceSha256:sha256(raw)};};
 return {decision,save};
}
test('intake contentReview accepted cannot qualify actual or synthetic bytes; historical approvals stay separate',()=>{
 const record=readAdmission()!;record.contentReview='accepted';
 assert.equal(qualifyCurrentSource(record).currentSourceQualified,false);
 record.corpusScope='synthetic';assert.equal(qualifyCurrentSource(record).currentSourceQualified,false);
 const c=loadCanonicalCorpus();assert.equal(c.reviews.length,19);assert.equal(c.websiteReviews.length,0);assert.equal(qualifyWebsiteCorpus(c),false);
 for(const id of c.entries.keys())assert.equal(websiteReviewState(c,id),'pending');
});
test('hashed exact fidelity evidence is required; scientific approval or request-only data cannot substitute',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-'));
 try {
  const c=loadCanonicalCorpus(),fixture=control(c,root);c.websiteReviews=[fixture.save()];
  validateWebsiteReviews(c,root);assert.equal(websiteReviewState(c,'UT-D01'),'accepted');assert.equal(qualifyWebsiteCorpus(c),false);
  for(const mutate of [
   (d:any)=>{d.scientificCertification=true;},
   (d:any)=>{delete d.checks.attribution;},
   (d:any)=>{d.inputs.sourceReads=[];},
   (d:any)=>{d.inputs.ownRead.plainLanguage='Universal established law';},
   (d:any)=>{d.inputs.renderedBodies.pop();},
   (d:any)=>{d.inputs.dependencies.push({entryId:'UT-D9999',semanticDigest:'0'.repeat(64)});},
   (d:any)=>{d.rationale='';}
  ]) {
   const before=structuredClone(fixture.decision);mutate(fixture.decision);c.websiteReviews=[fixture.save()];assert.throws(()=>validateWebsiteReviews(c,root),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);Object.assign(fixture.decision,before);
  }
  c.websiteReviews=[fixture.save()];writeFileSync(join(root,c.websiteReviews[0].evidenceRef),'{}');assert.throws(()=>validateWebsiteReviews(c,root),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
  c.websiteReviews=[fixture.save(),fixture.save()];assert.throws(()=>validateWebsiteReviews(c,root),/REVIEW_COLLISION/);
  c.websiteReviews=[fixture.save()];c.entries.get('UT-D01')!.plainLanguage+=' Synthetic change.';
  validateWebsiteReviews(c,root);assert.equal(websiteReviewState(c,'UT-D01'),'stale');
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('bounded fidelity decisions need no linked scientific acceptance; dependency changes still stale the decision',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-'));
 try {
  const c=loadCanonicalCorpus(),fixture=control(c,root,'DOC-HOME');c.websiteReviews=[fixture.save()];validateWebsiteReviews(c,root);
  assert.equal(websiteReviewState(c,'DOC-HOME'),'accepted');assert.equal(websiteReviewState(c,'DOC-STATUS'),'pending');
  c.entries.get('UT-C02')!.scope+=' Synthetic changed extension.';assert.equal(websiteReviewState(c,'DOC-HOME'),'stale');
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('complete isolated fidelity inventory derives qualification, while synthetic scope and missing reviews refuse it',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-'));
 try {
  const c=loadCanonicalCorpus();c.entries=new Map([['UT-D01',c.entries.get('UT-D01')!]]);
  const fixture=control(c,root);c.websiteReviews=[fixture.save()];validateWebsiteReviews(c,root);assert.equal(qualifyWebsiteCorpus(c),true);
  c.admission.corpusScope='synthetic';assert.equal(qualifyWebsiteCorpus(c),false);
  c.admission.corpusScope='current';c.websiteReviews=[];assert.equal(qualifyWebsiteCorpus(c),false);
 } finally {rmSync(root,{recursive:true,force:true});}
});
