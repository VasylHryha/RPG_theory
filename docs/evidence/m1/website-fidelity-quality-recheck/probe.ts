import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCanonicalCorpus,reviewFingerprint } from '../../../../src/lib/content.js';
import { websiteReviewInputs,validateWebsiteReviews,fidelityChecks } from '../../../../src/lib/website-review.js';
import { sha256 } from '../../../../src/lib/identity.js';
const root=mkdtempSync(join(tmpdir(),'unity-receipt-probe-'));
const results:any[]=[];
try {
 for(const [name,id,mutate] of [
  ['invalid snapshot publication date','UT-D01',(d:any)=>d.inputs.ownRead.publishedAt='not-a-date'],
  ['material date before own update','DOC-HOME',(d:any)=>d.inputs.materialUpdatedAt='2026-10-01'],
  ['missing own sources','UT-D01',(d:any)=>d.inputs.sourceReads=[]],
  ['missing own dependencies','DOC-HOME',(d:any)=>d.inputs.dependencies=[]],
  ['invented bound excerpt','UT-D01',(d:any)=>d.inputs.ownRead.statement='An invented excerpt.'],
  ['missing HOME projection','DOC-HOME',(d:any)=>d.inputs.renderedBodies.forEach((s:any)=>s.sourceProjectionSha256=null)]
 ] as [string,string,(d:any)=>void][]) {
  const c=loadCanonicalCorpus();c.root=root;
  const inputs=websiteReviewInputs(c,id),decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1',entryId:id,fingerprint:reviewFingerprint(c,id),reviewerKind:'agent',reviewedAt:'2026-10-02',outcome:'accepted',scientificCertification:false,rationale:'Isolated adversarial mechanics probe; never a content approval.',inputs,checks:Object.fromEntries(fidelityChecks.map(k=>[k,'Synthetic diagnostic only']))};
  c.entries.get(id)!.scope+=' Changed live input to make snapshot stale.';
  mutate(decision);
  const evidenceRef='docs/evidence/control.json',raw=JSON.stringify(decision);mkdirSync(join(root,'docs/evidence'),{recursive:true});writeFileSync(join(root,evidenceRef),raw);
  c.websiteReviews=[{purpose:'website-source-fidelity/1',entryId:id,fingerprint:decision.fingerprint,reviewerKind:'agent',reviewedAt:decision.reviewedAt,outcome:'accepted',evidenceRef,evidenceSha256:sha256(raw)}];
  let result='ACCEPTED_AS_STALE';try {validateWebsiteReviews(c);}catch(e:any){result=e.code??e.message;}
  results.push({name,result});
 }
 writeFileSync('docs/evidence/m1/website-fidelity-quality-recheck/pre-repair-probes.json',JSON.stringify({scope:'Isolated production-validator diagnostics; no project approval or source mutation',results},null,2)+'\n');
 assert.ok(results.every(r=>r.result==='ACCEPTED_AS_STALE'));
 console.log(JSON.stringify(results));
}finally{rmSync(root,{recursive:true,force:true});}
