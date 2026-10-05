import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { loadCanonicalCorpus, renderEntrySync } from '../../src/lib/content.js';
import { renderTechnicalGuide } from '../../src/lib/presentation.js';
import { publicationFor } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { websiteReviewState } from '../../src/lib/website-review.js';
import { sourceDisplay } from '../../src/lib/source-display.js';

const corpus=loadCanonicalCorpus();
const fullDocuments=['DOC-CORE','DOC-CONTROL','DOC-FRAMEWORK','DOC-MATH','DOC-INTERACTION-EVIDENCE','DOC-ADDITIONAL-EVIDENCE','DOC-SOURCE-CHANGES'];

test('M3 technical readings extract each complete original body with retained addenda and source provenance',()=>{
  for(const id of fullDocuments) {
    const entry=corpus.entries.get(id)!,binding=entry.sourceBinding!;
    const raw=readFileSync(corpus.sources.get(binding.sourceKey)!.path,'utf8');
    assert.equal(entry.contentOrigin,'source-bound');
    assert.equal(entry.statement,raw.split(/(?<=\n)/).slice(2).join(''),id);
    assert.equal(binding.startLine,3);assert.equal(entry.researchEdition,corpus.admission.edition);
    assert.notEqual(entry.evidenceState,'project-reproduced');
    const $=load(renderEntrySync(corpus,entry));
    assert.equal($('h1').length,0,id);assert.equal($('.katex-error').length,0,id);
  }
  const math=load(renderEntrySync(corpus,corpus.entries.get('DOC-MATH')!));
  assert.ok(math('math').length>50);
  assert.match(math.text(),/v0\.1a Addendum/);assert.match(math.text(),/v0\.1b Addendum/);
  assert.ok(math('#40-next-concrete-calculation').length);
  const framework=load(renderEntrySync(corpus,corpus.entries.get('DOC-FRAMEWORK')!));
  assert.ok(framework('#194-rrg-interpretation').length,'The literal-backslash addendum is rendered as real headings');
  assert.doesNotMatch(framework.text(),/\\n/);
});

test('M3 evidence retains all source-local entries, bibliography identities and reported access limitations',()=>{
  const additional=corpus.entries.get('DOC-ADDITIONAL-EVIDENCE')!;
  const $=load(renderEntrySync(corpus,additional));
  assert.equal($('h3').length,9);
  for(let n=1;n<=9;n++) {
    const label=`E${String(n).padStart(2,'0')}`,id=`UT-${label}`;
    assert.match(additional.statement!,new RegExp(`### ${label} —`));
    assert.ok(additional.dependsOn.includes(id));
    const record=corpus.entries.get(id)!;
    assert.equal(record.sourceBinding!.sourceKey,'R-CURRENT-ADDITIONAL');
    for(const ref of record.bibRefs)assert.ok(additional.bibRefs.includes(ref));
  }
  assert.match(additional.statement!,/full manuscript was not accessible/);
  assert.match(additional.statement!,/subscription full text not inspected/);
  assert.match(additional.plainLanguage,/not new paper inspections/);
  const interactions=corpus.entries.get('DOC-INTERACTION-EVIDENCE')!;
  for(const id of ['UT-E10','UT-E11','UT-E12'])assert.ok(interactions.dependsOn.includes(id));
  assert.match(interactions.statement!,/do \*\*not\*\* prove/);
  assert.ok(interactions.bibRefs.includes('BIB-0016'));
  assert.ok(additional.bibRefs.includes('BIB-0022'));
  assert.notEqual(corpus.aliases.get('R-CURRENT-SCIENCE:https://doi.org/10.1038/s41467-017-01190-3'),corpus.aliases.get('R-AUDIT-SOURCES:S01'));
});

test('open questions and status preserve actual 04/06 mapping and separate model failure tests from definitions',()=>{
  const open=corpus.entries.get('DOC-OPEN-PROBLEMS')!;
  assert.equal(open.sourceBinding!.sourceKey,'R-CURRENT-STATUS');
  for(let n=1;n<=6;n++)assert.ok(open.dependsOn.includes(`UT-O0${n}`));
  assert.match(open.statement!,/Open extensions to prove — not definitions/);
  const $=load(renderEntrySync(corpus,open));
  for(const fragment of ['19-strong-failure-conditions','40-next-concrete-calculation'])assert.ok($(`a[href$="#${fragment}"]`).length);
  const matrix=load(renderEntrySync(corpus,corpus.entries.get('DOC-PROOF')!));
  assert.equal(matrix('tbody tr').length,12);
  assert.match(matrix('table').text(),/Four forces[^]*open extension/);
  assert.match(matrix('table').text(),/Same equation family[^]*optional strong extension/);
  assert.ok(corpus.entries.get('DOC-STATUS')!.dependsOn.includes('DOC-ADDITIONAL-EVIDENCE'));
});

test('technical guides use actual heading anchors and selected routes at both bases',()=>{
  for(const base of ['/','/unity-theory/']) {
    const selection=publicationFor('preview',{...loadSiteConfig(),basePath:base});
    for(const id of [...fullDocuments,'DOC-STATUS','DOC-PROOF','DOC-EVIDENCE','DOC-OPEN-PROBLEMS','DOC-LIBRARY']) {
      const entry=selection.corpus.entries.get(id)!,html=renderEntrySync(selection.corpus,entry,base),body=load(html);
      const guide=load(renderTechnicalGuide(selection,entry,html,base));
      for(const a of guide('a[href^="#"]').toArray())assert.ok(body('[id]').toArray().some(el=>body(el).attr('id')===guide(a).attr('href')!.slice(1)),id);
      for(const a of guide('nav a').toArray())assert.ok(guide(a).attr('href')!.startsWith(base));
      if(entry.plainLanguage)assert.ok(guide('aside').length,id);
    }
    const entry=selection.corpus.entries.get('DOC-MATH')!;
    const filtered={...selection,entries:selection.entries.filter(e=>e.id!=='DOC-FRAMEWORK')};
    const guide=load(renderTechnicalGuide(filtered,entry,renderEntrySync(selection.corpus,entry),base));
    assert.equal(guide('nav a[href$="framework/"]').length,0);
  }
});

test('M3 preserves issued decisions without turning new readings or builds into approvals',()=>{
  // An independent review may issue genuine decisions after implementation.
  // Builds cannot supply them: accepted states require shared-validator receipts.
  for(const id of fullDocuments) {
    const state=websiteReviewState(corpus,id);
    assert.ok(['pending','accepted','stale','rejected'].includes(state));
    if(state==='accepted')assert.ok(corpus.websiteReviews.some(r=>r.entryId===id && r.outcome==='accepted' && r.evidenceRef.startsWith('docs/evidence/')));
    assert.notEqual(corpus.entries.get(id)!.evidenceState,'project-reproduced');
  }
  assert.equal(websiteReviewState(corpus,'DOC-HOME'),'stale');
  assert.equal(corpus.admission.currentSourceQualified,false);
  assert.ok(corpus.websiteReviews.some(r=>r.entryId==='DOC-HOME' && r.outcome==='accepted'));
});

test('the disclosed section 39 display repair preserves three separate formulas and refuses a changed boundary',()=>{
  const entry=corpus.entries.get('DOC-MATH')!,display=sourceDisplay(entry.statement!,entry.adapter);
  const section=display.slice(display.indexOf('## 39.'),display.indexOf('## 40.'));
  const $=load(renderEntrySync(corpus,{...entry,statement:section,adapter:'markdown/1'}));
  assert.equal($('.katex-display').length,4);
  assert.ok($('p').toArray().some(el=>$(el).text()==='defines the restoring/driving interaction, and'));
  assert.match(entry.plainLanguage,/original omits the closing display delimiter/);
  assert.throws(()=>sourceDisplay(entry.statement!.replace('defines the restoring/driving interaction, and','changed boundary'),entry.adapter),/SOURCE_ADAPTER_FAILURE/);
});
