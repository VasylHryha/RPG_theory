import { after } from 'node:test';
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Corpus } from '../../src/lib/content.js';
import { websiteReviewInputs, fidelityChecks, type WebsiteReview } from '../../src/lib/website-review.js';
import { sha256 } from '../../src/lib/identity.js';
const roots=new Set<string>();
after(()=>{for(const root of roots)rmSync(root,{recursive:true,force:true});});
// Isolated mechanics fixtures use real hashed receipts through production validators.
// No flag is forced and no receipt is written to the actual project or used as content approval.
export function installSyntheticReview(corpus:Corpus,id:string,outcome:WebsiteReview['outcome']='accepted',reviewedAt?:string) {
  if(!roots.has(corpus.root)) {corpus.root=mkdtempSync(join(tmpdir(),'unity-selector-fidelity-'));roots.add(corpus.root);mkdirSync(join(corpus.root,'research/publication'),{recursive:true});writeFileSync(join(corpus.root,'research/publication/metadata.json'),readFileSync('research/publication/metadata.json'));corpus.websiteReviews=[];}
  cpSync('licenses',join(corpus.root,'licenses'),{recursive:true});
  const inputs=websiteReviewInputs(corpus,id);
  reviewedAt ??= inputs.materialUpdatedAt;
  const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1' as const,entryId:id,fingerprint:inputs.fingerprint,reviewerKind:'agent' as const,reviewedAt,outcome,scientificCertification:false,rationale:'Isolated synthetic mechanics control; never content acceptance.',inputs,checks:Object.fromEntries(fidelityChecks.map(key=>[key,'Synthetic comparison only; no real approval.']))};
  const evidenceRef=`docs/evidence/${id}.json`,raw=JSON.stringify(decision);
  mkdirSync(join(corpus.root,'docs/evidence'),{recursive:true});writeFileSync(join(corpus.root,evidenceRef),raw);
  const review={purpose:decision.purpose,entryId:id,fingerprint:decision.fingerprint,reviewerKind:decision.reviewerKind,reviewedAt,outcome,evidenceRef,evidenceSha256:sha256(raw)};
  corpus.websiteReviews=corpus.websiteReviews.filter(r=>r.entryId!==id).concat(review);
  return review;
}
