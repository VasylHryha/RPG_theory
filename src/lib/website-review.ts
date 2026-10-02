import { readFileSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'astro/zod';
import { entrySchema } from './content-schema.js';
import { ContractError } from './errors.js';
import { sha256, stableJSON } from './identity.js';
import { dependencyClosure, reviewFingerprint, semanticDigest, renderEntrySync, validDate, type Corpus } from './content.js';
import { renderMarkdownSync } from './markdown.js';
import { withdrawnTombstone } from './publication.js';
import { renderHomeStatus } from './presentation.js';

const digest=z.string().regex(/^[a-f0-9]{64}$/);
const prose=z.string().refine(value=>value.trim().length>0);
export const websiteReviewSchema=z.object({
  purpose:z.literal('website-source-fidelity/1'), entryId:prose, fingerprint:digest,
  reviewerKind:z.enum(['agent','human']), reviewedAt:z.string(), outcome:z.enum(['accepted','pending','rejected']),
  evidenceRef:prose, evidenceSha256:digest
}).strict();
export type WebsiteReview=z.infer<typeof websiteReviewSchema>;
export const fidelityChecks=['terminology','meaning','assumptions','hypotheses','evidenceDescriptions','openQuestions','attribution','sourceMappings'] as const;
const checksSchema=z.object(Object.fromEntries(fidelityChecks.map(key=>[key,prose])) as Record<typeof fidelityChecks[number],typeof prose>).strict();
const inputSchema=z.object({
  fingerprint:digest, ownRead:entrySchema, materialUpdatedAt:z.string(),
  dependencies:z.array(z.object({entryId:prose,semanticDigest:digest}).strict()),
  sourceReads:z.array(z.object({sourceKey:prose,path:prose,sha256:digest}).strict()),
  renderedBodies:z.array(z.object({base:z.enum(['/','/unity-theory/']),sha256:digest,plainLanguageSha256:digest,sourceProjectionSha256:digest.nullable()}).strict()).length(2)
}).strict();
const decisionSchema=z.object({
  schema:z.literal('unity-website-fidelity-decision/1'),purpose:z.literal('website-source-fidelity/1'),
  entryId:prose,fingerprint:digest,reviewerKind:z.enum(['agent','human']),reviewedAt:z.string(),outcome:z.enum(['accepted','pending','rejected']),
  scientificCertification:z.literal(false),rationale:prose,inputs:inputSchema,checks:checksSchema.partial()
}).strict().superRefine((decision,ctx)=>{
  if(decision.inputs.ownRead.id!==decision.entryId || decision.inputs.fingerprint!==decision.fingerprint) ctx.addIssue({code:'custom',message:'Receipt identities differ'});
  if(decision.outcome==='accepted' && !checksSchema.safeParse(decision.checks).success) ctx.addIssue({code:'custom',message:'Every fidelity comparison is required'});
  for(const values of [decision.inputs.dependencies.map(d=>d.entryId),decision.inputs.sourceReads.map(s=>s.sourceKey),decision.inputs.renderedBodies.map(r=>r.base)]) if(new Set(values).size!==values.length) ctx.addIssue({code:'custom',message:'Duplicate reviewed inputs'});
});

// Requests describe actual material and rendered prose, excluding review badges to avoid self-reference.
export function websiteReviewInputs(corpus: Corpus,id: string) {
  const entry=corpus.entries.get(id);
  if(!entry) throw new ContractError('UNKNOWN_DEPENDENCY',id);
  const dependencies=dependencyClosure(corpus,id),relevant=[entry,...dependencies.map(key=>corpus.entries.get(key)!)];
  const directBib=relevant.flatMap(e=>e.bibRefs.concat(e.testRefs.filter(key=>corpus.references.has(key))));
  const bibliography=[...new Set(directBib.concat(directBib.flatMap(key=>corpus.references.get(key)?.primaryId ?? [])))];
  const sources=[...new Set(relevant.flatMap(e=>e.sourceRefs.concat(e.testRefs.filter(key=>corpus.sources.has(key)))).concat(bibliography.flatMap(key=>corpus.references.get(key)!.sourceRefs)))].sort();
  const displayed=entry.publicationState==='withdrawn'?withdrawnTombstone(entry):entry;
  return {
    fingerprint:reviewFingerprint(corpus,id),ownRead:structuredClone(entry),
    materialUpdatedAt:relevant.map(e=>e.updatedAt).sort((a,b)=>validDate(b)-validDate(a))[0],
    dependencies:dependencies.map(key=>({entryId:key,semanticDigest:semanticDigest(corpus.entries.get(key)!)})),
    sourceReads:sources.map(key=>({sourceKey:key,path:corpus.sources.get(key)!.path,sha256:corpus.sources.get(key)!.sha256})),
    renderedBodies:(['/','/unity-theory/'] as const).map(base=>({base,sha256:sha256(renderEntrySync(corpus,displayed,base)),
      plainLanguageSha256:sha256(renderMarkdownSync(displayed.plainLanguage,base,corpus)),
      sourceProjectionSha256:entry.id==='DOC-HOME' && !['superseded','withdrawn'].includes(entry.publicationState)?sha256(renderHomeStatus(corpus,corpus.entries.get('DOC-STATUS')!,base)):null}))
  };
}
export function validateWebsiteReviews(corpus: Corpus, root=corpus.root, entryIds=corpus.websiteReviews.map(r=>r.entryId)) {
  const ids=new Set<string>();
  for(const review of corpus.websiteReviews) {
    if(ids.has(review.entryId)) throw new ContractError('REVIEW_COLLISION',review.entryId);
    ids.add(review.entryId);
    if(!corpus.entries.has(review.entryId)) throw new ContractError('INVALID_REVIEW',review.entryId);
    if(!entryIds.includes(review.entryId)) continue;
    validDate(review.reviewedAt);
    const path=review.evidenceRef;
    if(!path.startsWith('docs/evidence/') || path.includes('\\') || path.split('/').some(p=>!p || p==='.' || p==='..') || !path.endsWith('.json')) throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',path);
    let decision:z.infer<typeof decisionSchema>;
    try {
      for(let index=1;index<=path.split('/').length;index++) if(lstatSync(resolve(root,...path.split('/').slice(0,index))).isSymbolicLink()) throw new Error('Symlink receipt path');
      const full=resolve(root,path);if(!lstatSync(full).isFile()) throw new Error('Regular receipt required');
      const raw=readFileSync(full);if(sha256(raw)!==review.evidenceSha256) throw new Error('Receipt changed');
      decision=decisionSchema.parse(JSON.parse(raw.toString()));
    } catch { throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',path); }
    for(const key of ['purpose','entryId','fingerprint','outcome','reviewerKind','reviewedAt'] as const) if(decision[key]!==review[key]) throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',review.entryId);
    if(validDate(decision.inputs.materialUpdatedAt)>validDate(review.reviewedAt) || validDate(decision.inputs.ownRead.updatedAt)>validDate(review.reviewedAt)) throw new ContractError('REVIEW_PREDATES_MATERIAL',review.entryId);
    // Validate stale receipts structurally too; a changed genuine snapshot remains stale.
    if(review.fingerprint===reviewFingerprint(corpus,review.entryId) && stableJSON(decision.inputs)!==stableJSON(websiteReviewInputs(corpus,review.entryId))) throw new ContractError('WEBSITE_REVIEW_EVIDENCE_REQUIRED',review.entryId);
  }
}
export function websiteReviewState(corpus: Corpus,id: string) {
  if(!corpus.entries.has(id)) throw new ContractError('UNKNOWN_DEPENDENCY',id);
  const review=corpus.websiteReviews.find(r=>r.entryId===id);
  return !review?'pending':review.fingerprint!==reviewFingerprint(corpus,id)?'stale':review.outcome;
}
// Default: complete current M1 coverage. Selection passes its exact intended IDs plus dependency closure.
export function qualifyWebsiteCorpus(corpus: Corpus,entryIds=[...corpus.entries.values()].filter(e=>!['superseded','withdrawn'].includes(e.publicationState)).map(e=>e.id)) {
  const ids=[...new Set(entryIds.flatMap(id=>[id,...dependencyClosure(corpus,id)]))].sort();
  validateWebsiteReviews(corpus,corpus.root,ids);
  const entries=ids.map(id=>corpus.entries.get(id)!);
  return corpus.admission.corpusScope==='current' && corpus.admission.bytesVerified && entries.length>0 && entries.some(e=>e.contentOrigin==='source-bound') && ids.every(id=>websiteReviewState(corpus,id)==='accepted');
}
