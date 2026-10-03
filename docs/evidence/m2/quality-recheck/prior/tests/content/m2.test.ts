import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCanonicalCorpus,dependencyClosure,reviewFingerprint,beginnerWordingCandidates} from '../../src/lib/content.js';
import {selectPublication} from '../../src/lib/publication.js';
import {loadSiteConfig} from '../../src/lib/site-config.js';
import {websiteReviewState} from '../../src/lib/website-review.js';
const corpus=loadCanonicalCorpus();
test('M2 examples and concepts use the admitted source edition and explicit original-source mappings',()=>{
  const ids=['DOC-EXAMPLES','DOC-CONCEPTS',...['WATER','STRING','MOLECULE','STAR','LIFE','CELL'].map(s=>'DOC-EXAMPLE-'+s),...['GEOMETRY','STABILITY','RECURSION','INTERACTIONS'].map(s=>'DOC-CONCEPT-'+s)];
  assert.equal(corpus.entries.size,45);
  for(const id of ids) {
    const entry=corpus.entries.get(id)!;assert.ok(entry,id);
    assert.equal(entry.researchEdition,corpus.admission.edition);assert.equal(entry.publicationState,'draft');
    assert.ok(entry.sourceMapping);assert.ok(entry.sourceRefs.includes('R-CURRENT-CORE'));
  }
  assert.ok(dependencyClosure(corpus,'DOC-CONCEPT-INTERACTIONS').includes('UT-E12'));
  assert.ok(dependencyClosure(corpus,'DOC-START').includes('UT-C02'));
  const start=corpus.entries.get('DOC-START')!.body;
  const words=start.split(/\s+/).filter(Boolean).length;assert.ok(words>=650 && words<=950,`Introduction word diagnostic: ${words}`);
});
test('M2 misleading editorial candidates are surfaced and cannot become a qualified selection without independent review',()=>{
  for(const [id,body,rule] of [
    ['DOC-CONCEPT-STABILITY','RRG supplies an independently established universal stability theorem.','stability-theorem'],
    ['DOC-EXAMPLE-STRING','Geometry alone determines tension and material constants.','geometry-only-string'],
    ['DOC-EXAMPLE-WATER','A wave proves a persistent higher-level unit.','wave-as-proof'],
    ['DOC-EXAMPLE-LIFE','Oxygen guarantees greater complexity through a purpose-driven ladder.','oxygen-inevitability'],
  ]) {
    const c=loadCanonicalCorpus(),entry=c.entries.get(id)!;
    entry.body=body;entry.publicationState='published';entry.publishedAt='2026-10-03';entry.rightsRef='SYNTHETIC';
    assert.ok(beginnerWordingCandidates(entry).some(item=>item.rule===rule));
    assert.equal(websiteReviewState(c,id),'pending');
    assert.throws(()=>selectPublication(c,loadSiteConfig(),{releaseId:'synthetic-negative-only',releaseAt:'2026-10-03',historicalIds:[],rights:[{id:'SYNTHETIC',outcome:'approved',entryIds:[id],evidenceRef:'test-only rights'}]},'qualification'),/REVIEW_REQUIRED/);
  }
  // Legitimate counterexamples are flagged for contextual reading, not silently removed.
  const legitimate=corpus.entries.get('DOC-CONCEPT-STABILITY')!;
  assert.ok(beginnerWordingCandidates(legitimate).every(item=>item.requiresContextReview));
});
test('M2 preserves predecessor approvals as stale rather than refreshing changed rendering policy',()=>{
  const registry=JSON.parse(readFileSync('research/publication/website-reviews.yaml','utf8'));
  assert.equal(registry.length,34);assert.equal(corpus.admission.currentSourceQualified,false);
  for(const review of registry) {assert.notEqual(review.fingerprint,reviewFingerprint(corpus,review.entryId));assert.equal(websiteReviewState(corpus,review.entryId),'stale');}
  for(const id of ['DOC-EXAMPLE-WATER','DOC-CONCEPT-INTERACTIONS'])assert.equal(websiteReviewState(corpus,id),'pending');
});
