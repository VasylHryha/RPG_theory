import { readFileSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'astro/zod';
import { ContractError } from './errors.js';
import { sha256, stableJSON } from './identity.js';
import { dependencyClosure, reviewFingerprint, semanticDigest, renderEntrySync, validDate, type Corpus } from './content.js';

export const websiteReviewSchema=z.object({
  purpose:z.literal('website-source-fidelity/1'), entryId:z.string(), fingerprint:z.string().regex(/^[a-f0-9]{64}$/),
  reviewerKind:z.enum(['agent','human']), reviewedAt:z.string(), outcome:z.enum(['accepted','pending','rejected']),
  evidenceRef:z.string(), evidenceSha256:z.string().regex(/^[a-f0-9]{64}$/)
}).strict();
export type WebsiteReview=z.infer<typeof websiteReviewSchema>;
export const fidelityChecks=['terminology','meaning','assumptions','hypotheses','evidenceDescriptions','openQuestions','attribution','sourceMappings'] as const;
// A review request describes inputs; it never supplies an approval.
export function websiteReviewInputs(corpus: Corpus,id: string) {
  const entry=corpus.entries.get(id);
  if(!entry) throw new ContractError('UNKNOWN_DEPENDENCY',id);
  const dependencies=dependencyClosure(corpus,id);
  const relevant=[entry,...dependencies.map(key=>corpus.entries.get(key)!)];
  const directBib=relevant.flatMap(e=>e.bibRefs.concat(e.testRefs.filter(key=>corpus.references.has(key))));
  const bibliography=[...new Set(directBib.concat(directBib.flatMap(key=>corpus.references.get(key)?.primaryId ?? [])))];
  const sources=[...new Set(relevant.flatMap(e=>e.sourceRefs.concat(e.testRefs.filter(key=>corpus.sources.has(key)))).concat(bibliography.flatMap(key=>corpus.references.get(key)!.sourceRefs)))].sort();
  return {
    fingerprint:reviewFingerprint(corpus,id), ownRead:entry,
    dependencies:dependencies.map(key=>({entryId:key,semanticDigest:semanticDigest(corpus.entries.get(key)!)})),
    sourceReads:sources.map(key=>({sourceKey:key,path:corpus.sources.get(key)!.path,sha256:corpus.sources.get(key)!.sha256})),
    renderedBodies:['/','/unity-theory/'].map(base=>({base,sha256:sha256(renderEntrySync(corpus,entry,base))}))
  };
}
export function validateWebsiteReviews(corpus: Corpus, root: string) {
  const ids=new Set<string>();
  for(const review of corpus.websiteReviews) {
    if(ids.has(review.entryId)) throw new ContractError('REVIEW_COLLISION',review.entryId);
    ids.add(review.entryId);validDate(review.reviewedAt);
    const path=review.evidenceRef;
    if(!path.startsWith('docs/evidence/') || path.includes('\\') || path.split('/').some(p=>!p || p==='.' || p==='..') || !path.endsWith('.json')) throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',path);
    const full=resolve(root,path);
    let decision: any;
    try {
      for(let index=1;index<=path.split('/').length;index++) if(lstatSync(resolve(root,...path.split('/').slice(0,index))).isSymbolicLink()) throw new Error('Symlink receipt path');
      if(!lstatSync(full).isFile() || lstatSync(full).isSymbolicLink()) throw new Error('Regular receipt required');
      const raw=readFileSync(full);if(sha256(raw)!==review.evidenceSha256) throw new Error('Receipt changed');
      decision=JSON.parse(raw.toString());
    } catch { throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',path); }
    if(decision.schema!=='unity-website-fidelity-decision/1' || decision.purpose!==review.purpose || decision.entryId!==review.entryId || decision.fingerprint!==review.fingerprint || decision.outcome!==review.outcome || decision.reviewerKind!==review.reviewerKind || decision.reviewedAt!==review.reviewedAt || decision.scientificCertification!==false || typeof decision.rationale!=='string' || !decision.rationale.trim()) throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',review.entryId);
    if(!corpus.entries.has(review.entryId)) throw new ContractError('INVALID_REVIEW',review.entryId);
    // Changed inputs leave a genuine old decision stale, rather than erasing it.
    if(review.fingerprint!==reviewFingerprint(corpus,review.entryId)) continue;
    if(stableJSON(decision.inputs)!==stableJSON(websiteReviewInputs(corpus,review.entryId)) || review.outcome==='accepted' && fidelityChecks.some(key=>typeof decision.checks?.[key]!=='string' || !decision.checks[key].trim())) throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',review.entryId);
  }
}
export function websiteReviewState(corpus: Corpus,id: string) {
  const review=corpus.websiteReviews.find(r=>r.entryId===id);
  return !review?'pending':review.fingerprint!==reviewFingerprint(corpus,id)?'stale':review.outcome;
}
export function qualifyWebsiteCorpus(corpus: Corpus) {
  const current=[...corpus.entries.values()].filter(e=>!['superseded','withdrawn'].includes(e.publicationState));
  return corpus.admission.corpusScope==='current' && corpus.admission.bytesVerified && current.length>0 && current.some(e=>e.contentOrigin==='source-bound') && current.every(e=>websiteReviewState(corpus,e.id)==='accepted');
}
