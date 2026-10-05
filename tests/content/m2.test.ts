import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCanonicalCorpus,dependencyClosure,reviewFingerprint,beginnerWordingCandidates,renderEntrySync} from '../../src/lib/content.js';
import {load} from 'cheerio';
import {installSyntheticReview} from './fidelity-fixture.js';
import {renderRecordDetails} from '../../src/lib/presentation.js';
import {selectPublication} from '../../src/lib/publication.js';
import {loadSiteConfig} from '../../src/lib/site-config.js';
import {websiteReviewState,qualifyWebsiteCorpus} from '../../src/lib/website-review.js';
const corpus=loadCanonicalCorpus();
test('M2 examples and concepts use the admitted source edition and explicit original-source mappings',()=>{
  const ids=['DOC-EXAMPLES','DOC-CONCEPTS',...['WATER','STRING','MOLECULE','STAR','LIFE','CELL'].map(s=>'DOC-EXAMPLE-'+s),...['GEOMETRY','STABILITY','RECURSION','INTERACTIONS'].map(s=>'DOC-CONCEPT-'+s)];
  assert.ok(corpus.entries.size>=45,'The accepted M2 slice remains present as later milestones add documents');
  for(const id of ids) {
    const entry=corpus.entries.get(id)!;assert.ok(entry,id);
    assert.equal(entry.researchEdition,corpus.admission.edition);assert.equal(entry.publicationState,'draft');
    assert.ok(entry.sourceMapping);assert.ok(entry.sourceRefs.includes('R-CURRENT-CORE'));
  }
  assert.ok(dependencyClosure(corpus,'DOC-CONCEPT-INTERACTIONS').includes('UT-E119'));
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
    const selected=[id,...dependencyClosure(c,id)];
    for(const key of selected){const item=c.entries.get(key)!;Object.assign(item,{publicationState:'published',publishedAt:'2026-10-03',updatedAt:'2026-10-03',rightsRef:'SYNTHETIC'});}
    for(const key of selected)installSyntheticReview(c,key);
    const release={releaseId:'synthetic-negative-only',releaseAt:'2026-10-03',historicalIds:[],rights:[{id:'SYNTHETIC',outcome:'approved' as const,entryIds:selected,evidenceRef:'test-only rights'}]};
    assert.equal(selectPublication(c,loadSiteConfig(),release,'qualification').admission.currentSourceQualified,true);
    assert.equal(websiteReviewState(c,id),'accepted');
    entry.body=body;
    assert.ok(beginnerWordingCandidates(entry).some(item=>item.rule===rule));
    assert.equal(websiteReviewState(c,id),'stale');
    assert.throws(()=>selectPublication(c,loadSiteConfig(),release,'qualification'),/REVIEW_REQUIRED/);
  }
  // Legitimate counterexamples are flagged for contextual reading, not silently removed.
  const legitimate=corpus.entries.get('DOC-CONCEPT-STABILITY')!;
  assert.ok(beginnerWordingCandidates(legitimate).every(item=>item.requiresContextReview));
});
test('the real interaction relation is a display equation with an accessible local scrolling region',()=>{
  const $=load(renderEntrySync(corpus,corpus.entries.get('DOC-CONCEPT-INTERACTIONS')!));
  assert.equal($('.katex-display').length,1);assert.equal($('.katex-display').attr('tabindex'),'0');
  assert.match($('.katex-display').attr('aria-label')!,/scroll horizontally/);
  assert.match($('annotation').text(),/R_n=\(G_n,M_n\)/);
});
test('optional beginner source details preserve visible proposal, correction, explanation and limits',()=>{
  for(const state of ['draft','superseded'] as const) {
    const entry={...corpus.entries.get('DOC-CONCEPT-STABILITY')!,publicationState:state,contentOrigin:'proposed' as const,proposalProvenance:'UNADOPTED_PROVENANCE',plainLanguage:'VISIBLE_EXPLANATION',limits:'VISIBLE_LIMIT',correctionRef:'SYNTHETIC_CORRECTION',supersededBy:'DOC-CONCEPT-RECURSION'};
    const $=load(renderRecordDetails(corpus,entry)),fold=$('details.source-details');
    assert.equal(fold.length,1);assert.equal(fold.attr('open'),undefined);
    for(const text of ['UNADOPTED_PROVENANCE','VISIBLE_EXPLANATION','VISIBLE_LIMIT',...(state==='superseded'?['Historical record','SYNTHETIC_CORRECTION']:[])]) {
      assert.ok($.text().includes(text),text);assert.ok(!fold.text().includes(text),text);
    }
  }
});
test('M2 rendering changes invalidate preserved predecessor decisions independently of later bounded reviews',()=>{
  // Historical decisions keep their original snapshot. A genuine later review
  // may accept a beginner page without refreshing the old receipt or qualifying
  // the technical records outside that review's scope.
  for(const id of ['UT-D01','DOC-HOME']) {
    const prior=JSON.parse(readFileSync(`docs/evidence/m1/separate-requalification-review/decisions/${id}.json`,'utf8'));
    assert.notEqual(prior.fingerprint,reviewFingerprint(corpus,id));
  }
  const c=loadCanonicalCorpus();
  c.websiteReviews=c.websiteReviews.filter(review=>!['DOC-EXAMPLE-WATER','DOC-CONCEPT-INTERACTIONS'].includes(review.entryId));
  for(const id of ['DOC-EXAMPLE-WATER','DOC-CONCEPT-INTERACTIONS'])assert.equal(websiteReviewState(c,id),'pending');
  assert.equal(qualifyWebsiteCorpus(c),false);
});
