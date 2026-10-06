import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { websiteReviewState, qualifyWebsiteCorpus, validateWebsiteReviews } from '../../src/lib/website-review.js';
import { sha256 } from '../../src/lib/identity.js';
import { selectPublication } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { reviewedFixture } from '../helpers/fidelity.js';

test('page changes stale its exact fidelity review', () => {
  const { corpus, entry } = reviewedFixture();
  assert.equal(qualifyWebsiteCorpus(corpus), true);
  entry.plainLanguage += ' Synthetic edit.';
  assert.equal(websiteReviewState(corpus, entry.id), 'stale');
});

test('source changes stale the reviews bound to it', () => {
  const { corpus, entry } = reviewedFixture();
  assert.equal(websiteReviewState(corpus, entry.id), 'accepted');
  corpus.sources.get(entry.sourceRefs[0])!.sha256 = '0'.repeat(64);
  assert.equal(websiteReviewState(corpus, entry.id), 'stale');
});

test('pending and stale reviews refuse qualification and release without writing decisions', () => {
  const registry = 'research/publication/website-reviews.yaml', before = readFileSync(registry);
  for (const state of ['pending', 'stale']) {
    const { corpus, entry, release } = reviewedFixture();
    if (state === 'pending') corpus.websiteReviews = [];
    else entry.scope += ' Synthetic change.';
    const reviews = structuredClone(corpus.websiteReviews);
    assert.equal(qualifyWebsiteCorpus(corpus), false);
    for (const mode of ['qualification', 'release'] as const) {
      assert.throws(() => selectPublication(corpus, loadSiteConfig(), release, mode), /REVIEW_REQUIRED/);
    }
    assert.deepEqual(corpus.websiteReviews, reviews);
  }
  assert.deepEqual(readFileSync(registry), before);
});
test('a hash-matching malformed decision still gets the fidelity evidence diagnostic', () => {
  const { corpus } = reviewedFixture(), review = corpus.websiteReviews[0];
  writeFileSync(join(corpus.root, review.evidenceRef), 'null');
  review.evidenceSha256 = sha256('null');
  assert.throws(() => validateWebsiteReviews(corpus), /WEBSITE_REVIEW_EVIDENCE_REQUIRED/);
});
