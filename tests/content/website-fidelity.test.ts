import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, readFileSync, cpSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCanonicalCorpus, reviewFingerprint } from '../../src/lib/content.js';
import { qualifyCurrentSource, readAdmission } from '../../src/lib/source-admission.js';
import { websiteReviewInputs, websiteReviewState, validateWebsiteReviews, qualifyWebsiteCorpus, fidelityChecks } from '../../src/lib/website-review.js';
import { sha256 } from '../../src/lib/identity.js';

function control(c:ReturnType<typeof loadCanonicalCorpus>,root:string,id='UT-D01') {
 const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1' as const,entryId:id,fingerprint:reviewFingerprint(c,id),reviewerKind:'agent' as const,reviewedAt:websiteReviewInputs(c,id).materialUpdatedAt,outcome:'accepted' as const,scientificCertification:false,rationale:'Synthetic mechanics control only; no real acceptance.',inputs:structuredClone(websiteReviewInputs(c,id)),checks:Object.fromEntries(fidelityChecks.map(key=>[key,'Synthetic comparison only']))};
 const evidenceRef='docs/evidence/control.json';mkdirSync(join(root,'docs/evidence'),{recursive:true});
 const save=()=>{const raw=JSON.stringify(decision);writeFileSync(join(root,evidenceRef),raw);return {purpose:decision.purpose,entryId:id,fingerprint:decision.fingerprint,reviewerKind:decision.reviewerKind,reviewedAt:decision.reviewedAt,outcome:decision.outcome,evidenceRef,evidenceSha256:sha256(raw)};};
 return {decision,save};
}
test('intake contentReview accepted cannot qualify actual or synthetic bytes; historical approvals stay separate',()=>{
 const record=readAdmission()!;record.contentReview='accepted';
 assert.equal(qualifyCurrentSource(record).currentSourceQualified,false);
 record.corpusScope='synthetic';assert.equal(qualifyCurrentSource(record).currentSourceQualified,false);
 const c=loadCanonicalCorpus();c.websiteReviews=[];assert.equal(JSON.parse(readFileSync('research/publication/reviews.yaml','utf8')).length,19);assert.equal(c.websiteReviews.length,0);assert.equal(qualifyWebsiteCorpus(c),false);
 for(const id of c.entries.keys())assert.equal(websiteReviewState(c,id),'pending');
});
test('hashed exact fidelity evidence is required; scientific approval or request-only data cannot substitute',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-'));
 try {
  const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root);c.websiteReviews=[fixture.save()];
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
  const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root,'DOC-HOME');c.websiteReviews=[fixture.save()];validateWebsiteReviews(c,root);
  assert.equal(websiteReviewState(c,'DOC-HOME'),'accepted');assert.equal(websiteReviewState(c,'DOC-STATUS'),'pending');
  c.entries.get('UT-C02')!.scope+=' Synthetic changed extension.';assert.equal(websiteReviewState(c,'DOC-HOME'),'stale');
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('complete isolated fidelity inventory derives qualification, while synthetic scope and missing reviews refuse it',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-'));
 try {
  const c=loadCanonicalCorpus();c.root=root;c.entries=new Map([['UT-D01',c.entries.get('UT-D01')!]]);
  const fixture=control(c,root);c.websiteReviews=[fixture.save()];validateWebsiteReviews(c,root);assert.equal(qualifyWebsiteCorpus(c),true);
  c.admission.corpusScope='synthetic';assert.equal(qualifyWebsiteCorpus(c),false);
  c.admission.corpusScope='current';c.websiteReviews=[];assert.equal(qualifyWebsiteCorpus(c),false);
 } finally {rmSync(root,{recursive:true,force:true});}
});

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { selectPublication } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { buildInputs } from '../../src/lib/build-identity.js';
import { renderMarkdownSync } from '../../src/lib/markdown.js';
import { renderHomeStatus } from '../../src/lib/presentation.js';

test('null, primitive and incomplete stale evidence fail with the intended typed diagnostic',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-shape-'));
 try {
  const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root);
  for(const raw of ['null','[]','42','"accepted"','{']) {
   const review=fixture.save();writeFileSync(join(root,review.evidenceRef),raw);review.evidenceSha256=sha256(raw);c.websiteReviews=[review];
   assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
  }
  delete (fixture.decision as any).inputs;c.websiteReviews=[fixture.save()];c.entries.get('UT-D01')!.scope+=' Changed fixture.';
  assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('review dates cannot predate the reviewed material, including dependency updates',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-date-'));
 try {
  const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root,'DOC-HOME');fixture.decision.reviewedAt='2026-10-01';c.websiteReviews=[fixture.save()];
  assert.throws(()=>validateWebsiteReviews(c),/REVIEW_PREDATES_MATERIAL/);
  fixture.decision.reviewedAt=fixture.decision.inputs.materialUpdatedAt;c.websiteReviews=[fixture.save()];assert.doesNotThrow(()=>validateWebsiteReviews(c));
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('receipt paths reject traversal, symlink files and symlink ancestors',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-path-'));
 try {
  const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root),review=fixture.save();
  for(const evidenceRef of ['/tmp/fake.json','docs/evidence/../control.json','docs/evidence//control.json','docs/evidence/control.json#fragment']) {
   c.websiteReviews=[{...review,evidenceRef}];assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
  }
  symlinkSync(join(root,review.evidenceRef),join(root,'docs/evidence/linked.json'));c.websiteReviews=[{...review,evidenceRef:'docs/evidence/linked.json'}];assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
  symlinkSync(join(root,'docs/evidence'),join(root,'docs/linked'));c.websiteReviews=[{...review,evidenceRef:'docs/linked/control.json'}];assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
  symlinkSync(join(root,'docs/evidence'),join(root,'docs/evidence/nested'));c.websiteReviews=[{...review,evidenceRef:'docs/evidence/nested/control.json'}];assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('review inputs independently capture rendered plain language and the actual home projection without aliasing',()=>{
 const c=loadCanonicalCorpus(),inputs=websiteReviewInputs(c,'DOC-HOME');
 for(const surface of inputs.renderedBodies)assert.equal(surface.sourceProjectionSha256,sha256(renderHomeStatus(c,c.entries.get('DOC-STATUS')!,surface.base)));
 const definition=websiteReviewInputs(c,'UT-D01');
 for(const surface of definition.renderedBodies)assert.equal(surface.plainLanguageSha256,sha256(renderMarkdownSync(c.entries.get('UT-D01')!.plainLanguage,surface.base,c)));
 const original=c.entries.get('DOC-HOME')!.body;inputs.ownRead.body+=' Changed snapshot.';assert.equal(c.entries.get('DOC-HOME')!.body,original);
 assert.throws(()=>websiteReviewState(c,'DOC-UNKNOWN'),/UNKNOWN_DEPENDENCY/);
});
test('stale decisions retain internally coherent dates, source excerpts, dependencies and projection reads',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-stale-coherence-'));
 try {
  for(const [id,mutate] of [
   ['UT-D01',(d:any)=>{d.inputs.ownRead.publishedAt='not-a-date';}],
   ['UT-D01',(d:any)=>{d.inputs.ownRead.publishedAt='2026-10-03';}],
   ['UT-D01',(d:any)=>{d.inputs.ownRead.publicationState='published';}],
   ['DOC-HOME',(d:any)=>{d.inputs.materialUpdatedAt='2026-10-01';}],
   ['UT-D01',(d:any)=>{d.inputs.sourceReads=[];}],
   ['DOC-HOME',(d:any)=>{d.inputs.dependencies=[];}],
   ['UT-D01',(d:any)=>{d.inputs.dependencies.push({entryId:'UT-D01',semanticDigest:'0'.repeat(64)});}],
   ['UT-D01',(d:any)=>{d.inputs.ownRead.statement='Invented prior excerpt.';}],
   ['UT-D01',(d:any)=>{d.inputs.ownRead.sourceBinding.endLine=1;}],
   ['UT-D01',(d:any)=>{d.inputs.ownRead.sourceBinding.endLine+=1;}],
   ['UT-D01',(d:any)=>{d.inputs.ownRead.contentOrigin='authored';}],
   ['UT-D01',(d:any)=>{d.inputs.sourceReads[0].sha256='0'.repeat(64);}],
   ['UT-D01',(d:any)=>{d.inputs.sourceReads[0].path='../external.md';}],
   ['DOC-HOME',(d:any)=>{d.inputs.renderedBodies.forEach((s:any)=>s.sourceProjectionSha256=null);}],
   ['UT-D01',(d:any)=>{d.inputs.renderedBodies[0].sourceProjectionSha256='0'.repeat(64);}]
  ] as [string,(d:any)=>void][]) {
   const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root,id);
   c.entries.get(id)!.scope+=' Changed live material.';
   c.websiteReviews=[fixture.save()];assert.doesNotThrow(()=>validateWebsiteReviews(c));
   assert.equal(websiteReviewState(c,id),'stale');
   mutate(fixture.decision);c.websiteReviews=[fixture.save()];
   assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED|INVALID_DATE/);
  }
  const changedSource=loadCanonicalCorpus();changedSource.root=root;
  const oldRead=control(changedSource,root);changedSource.websiteReviews=[oldRead.save()];
  changedSource.sources.get('R-CURRENT-CORE')!.sha256='1'.repeat(64);
  assert.doesNotThrow(()=>validateWebsiteReviews(changedSource));
  assert.equal(websiteReviewState(changedSource,'UT-D01'),'stale');
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('receipt paths reject control characters even when a matching regular file exists',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-path-controls-'));
 try {
  const c=loadCanonicalCorpus();c.root=root;const fixture=control(c,root),review=fixture.save();
  for(const character of ['\n','\t','\u007f']) {
   const evidenceRef=`docs/evidence/${character}control.json`;
   writeFileSync(join(root,evidenceRef),readFileSync(join(root,review.evidenceRef)));
   c.websiteReviews=[{...review,evidenceRef}];assert.throws(()=>validateWebsiteReviews(c),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
  }
 } finally {rmSync(root,{recursive:true,force:true});}
});
test('a real loader roundtrip validates hashed decisions and qualifies only the reviewed selection, ignoring unrelated drafts and historical scientific registry bytes',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-fidelity-loader-'));
 try {
  for(const folder of ['src','research','config','scripts','public','.github','docs/evidence/m1/literature']) {mkdirSync(join(root,folder,'..'),{recursive:true});cpSync(folder,join(root,folder),{recursive:true});}
  for(const file of ['astro.config.mjs','package-lock.json','package.json','tsconfig.json','.node-version','.npmrc'])cpSync(file,join(root,file));
  writeFileSync(join(root,'research/publication/website-reviews.yaml'),'[]');
  const file=join(root,'research/publication/records.yaml'),records=JSON.parse(readFileSync(file,'utf8')),entry=records.find((e:any)=>e.id==='UT-D01');
  Object.assign(entry,{publicationState:'published',publishedAt:'2026-10-02',updatedAt:'2026-10-02',rightsRef:'SYNTHETIC-RIGHTS'});writeFileSync(file,JSON.stringify(records));
  const c=loadCanonicalCorpus(root),fixture=control(c,root),review=fixture.save();writeFileSync(join(root,'research/publication/website-reviews.yaml'),JSON.stringify([review]));
  const loaded=loadCanonicalCorpus(root);assert.equal(websiteReviewState(loaded,'UT-D01'),'accepted');assert.equal(loaded.admission.currentSourceQualified,false);
  const release={releaseId:'synthetic-mechanics-only',releaseAt:'2026-10-02',historicalIds:[],rights:[{id:'SYNTHETIC-RIGHTS',outcome:'approved' as const,entryIds:['UT-D01'],evidenceRef:'synthetic mechanics fixture only'}]};
  const selected=selectPublication(loaded,loadSiteConfig(),release,'qualification');assert.equal(selected.admission.currentSourceQualified,true);assert.equal(selected.manifest.deployEligible,false);assert.deepEqual(selected.manifest.navigationIds,['UT-D01']);
  const originalInputs=buildInputs(root),originalFingerprint=reviewFingerprint(loaded,'UT-D01');
  writeFileSync(join(root,'research/publication/reviews.yaml'),'Malformed historical scientific registry; intentionally ignored.');
  const reread=loadCanonicalCorpus(root);assert.equal(reviewFingerprint(reread,'UT-D01'),originalFingerprint);assert.deepEqual(buildInputs(root),originalInputs);
  assert.equal(selectPublication(reread,loadSiteConfig(),release,'qualification').admission.currentSourceQualified,true);
  const invoke=()=>spawnSync(process.execPath,['--import',resolve('node_modules/tsx/dist/loader.mjs'),resolve('scripts/check-content.ts'),'--evidence-dir','docs/evidence/cli-control'],{cwd:root,encoding:'utf8'});
  let cli=invoke();assert.equal(cli.status,0,cli.stdout+cli.stderr);
  let report=JSON.parse(readFileSync(join(root,'docs/evidence/cli-control/content-bindings.json'),'utf8'));
  assert.equal(report.acceptedReviews,1);assert.deepEqual(report.reviewStates,{accepted:1,pending:loaded.entries.size-1,stale:0,rejected:0});
  entry.description+=' Synthetic changed display metadata.';writeFileSync(file,JSON.stringify(records));
  cli=invoke();assert.equal(cli.status,0,cli.stdout+cli.stderr);
  report=JSON.parse(readFileSync(join(root,'docs/evidence/cli-control/content-bindings.json'),'utf8'));
  assert.equal(report.acceptedReviews,0);assert.deepEqual(report.reviewStates,{accepted:0,pending:loaded.entries.size-1,stale:1,rejected:0});

  const intake=JSON.parse(readFileSync(join(root,'config/research-source.json'),'utf8'));intake.corpusScope='synthetic';writeFileSync(join(root,'config/research-source.json'),JSON.stringify(intake));
  assert.throws(()=>selectPublication(loadCanonicalCorpus(root),loadSiteConfig(),release,'qualification'),/CURRENT_SOURCE_NOT_QUALIFIED/);
  // No flag can replace decisions, even after a caller mutates a previously loaded object.
  const unreviewed=loadCanonicalCorpus();unreviewed.websiteReviews=[];unreviewed.admission.currentSourceQualified=true;
  assert.throws(()=>selectPublication(unreviewed,loadSiteConfig(),release,'qualification'),/CURRENT_SOURCE_NOT_QUALIFIED/);
  loaded.websiteReviews[0].evidenceSha256='0'.repeat(64);assert.throws(()=>selectPublication(loaded,loadSiteConfig(),release,'qualification'),/WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
 } finally {rmSync(root,{recursive:true,force:true});}
});
