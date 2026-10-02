// Evidence integrity only: compare recorded decisions with the production corpus.
// This function never selects acceptances, writes reviews or qualifies sources.
import assert from 'node:assert/strict';
import { type Corpus, reviewState, reviewFingerprint, semanticDigest, dependencyClosure, renderEntrySync, validDate } from '../../../../src/lib/content.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';

export function verifyReviewDecisions(corpus: Corpus, report: any) {
  const ids = report.decisions.map((d: any) => d.entryId);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate review decision');
  assert.deepEqual([...ids].sort(), [...corpus.entries.keys()].sort(), 'Incomplete review decision inventory');
  assert.equal(report.rendererSha256, corpus.rendererSha256, 'Stale decision renderer');
  const accepted: string[] = [], pending: string[] = [];
  const requiredRead = ['sourceBinding','statement','plainLanguage','scope','limits','evidenceState','publicationState','body','assumptions','dependsOn','bibRefs'];
  for (const decision of report.decisions) {
    const entry = corpus.entries.get(decision.entryId)!;
    assert.ok(['accepted','pending'].includes(decision.outcome), 'Unexpected decision outcome');
    assert.equal(decision.reviewerKind, 'agent');
    validDate(decision.reviewedAt);
    assert.ok(typeof decision.rationale === 'string' && decision.rationale.trim(), 'Missing decision rationale');
    assert.equal(decision.evidenceRef, 'docs/evidence/m1/scientific-review/source-readout.md', 'Wrong decision evidence reference');
    assert.equal(reviewState(corpus, entry.id), decision.outcome, 'Decision/registry state mismatch');
    assert.equal(reviewFingerprint(corpus, entry.id), decision.independentlyComputedFingerprint, 'Stale decision fingerprint');
    assert.equal(semanticDigest(entry), decision.semanticDigest, 'Stale decision semantics');
    assert.equal(sha256(renderEntrySync(corpus, entry)), decision.renderedBodySha256, 'Stale reviewed body');
    assert.equal(stableJSON(decision.dependencies), stableJSON(dependencyClosure(corpus, entry.id).map(id => ({id, semanticDigest: semanticDigest(corpus.entries.get(id)!)}))), 'Stale decision dependencies');
    for (const field of requiredRead) assert.ok(Object.hasOwn(decision.ownRead, field), `Missing own-read field: ${field}`);
    for (const [field,value] of Object.entries(decision.ownRead)) {
      assert.ok(Object.hasOwn(entry, field), `Unknown own-read field: ${field}`);
      assert.equal(stableJSON(value), stableJSON((entry as any)[field]), `Stale own-read field: ${entry.id}.${field}`);
    }
    assert.equal(entry.publicationState, 'draft');
    if (decision.outcome === 'accepted') {
      assert.ok(typeof decision.acceptedScope === 'string' && decision.acceptedScope.trim(), 'Missing accepted scope');
      const review = corpus.reviews.find(r => r.entryId === entry.id)!;
      assert.equal(review.reviewedAt, decision.reviewedAt, 'Decision/registry review date mismatch');
      assert.equal(review.reviewerKind, decision.reviewerKind);
      assert.equal(review.evidenceRef, `docs/evidence/m1/scientific-review/review-decisions.json#${entry.id}`, 'Decision/registry evidence reference mismatch');
      accepted.push(entry.id);
    } else {
      assert.equal(decision.acceptedScope, null, 'Pending decision has accepted scope');
      pending.push(entry.id);
    }
  }
  assert.deepEqual([...accepted].sort(), corpus.reviews.map(r => r.entryId).sort(), 'Acceptance inventory mismatch');
  return {accepted, pending};
}
