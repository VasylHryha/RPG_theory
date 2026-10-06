import { after } from 'node:test';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadCanonicalCorpus } from '../../src/lib/content.js';
import { websiteReviewInputs, fidelityChecks } from '../../src/lib/website-review.js';
import { sha256 } from '../../src/lib/identity.js';

const roots: string[] = [];
after(() => roots.forEach(root => rmSync(root, { recursive: true, force: true })));
let baseline: ReturnType<typeof loadCanonicalCorpus>;
// Isolated mechanics only: these receipts cannot approve project content.
export function reviewedFixture() {
  const corpus = structuredClone(baseline ??= loadCanonicalCorpus());
  mkdirSync('docs/evidence/test-suite-proportionate/fixtures', { recursive: true });
  corpus.root = mkdtempSync(resolve('docs/evidence/test-suite-proportionate/fixtures/fidelity-'));
  roots.push(corpus.root);
  mkdirSync(join(corpus.root, 'research/publication'), { recursive: true });
  cpSync('research/publication/metadata.json', join(corpus.root, 'research/publication/metadata.json'));
  cpSync('licenses', join(corpus.root, 'licenses'), { recursive: true });
  const entry = corpus.entries.get('UT-D01')!;
  corpus.entries = new Map([[entry.id, entry]]);
  corpus.websiteReviews = [];
  const inputs = websiteReviewInputs(corpus, entry.id);
  const decision = {
    schema: 'unity-website-fidelity-decision/1', purpose: 'website-source-fidelity/1' as const,
    entryId: entry.id, fingerprint: inputs.fingerprint, reviewerKind: 'agent' as const,
    reviewedAt: inputs.materialUpdatedAt, outcome: 'accepted' as const,
    scientificCertification: false, rationale: 'Synthetic mechanics only; no content approval.', inputs,
    checks: Object.fromEntries(fidelityChecks.map(key => [key, 'Synthetic comparison only.']))
  };
  const raw = JSON.stringify(decision), evidenceRef = 'docs/evidence/control.json';
  mkdirSync(join(corpus.root, 'docs/evidence'), { recursive: true });
  writeFileSync(join(corpus.root, evidenceRef), raw);
  corpus.websiteReviews = [{ purpose: decision.purpose, entryId: entry.id, fingerprint: inputs.fingerprint,
    reviewerKind: decision.reviewerKind, reviewedAt: decision.reviewedAt, outcome: decision.outcome,
    evidenceRef, evidenceSha256: sha256(raw) }];
  const release = { releaseId: 'synthetic-control', releaseAt: inputs.materialUpdatedAt, historicalIds: [],
    rights: [{ id: entry.rightsRef!, outcome: 'approved' as const, entryIds: [entry.id], evidenceRef: 'Synthetic only' }] };
  return { corpus, entry, release };
}
