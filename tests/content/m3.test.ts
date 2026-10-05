import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { loadCanonicalCorpus, renderEntrySync } from '../../src/lib/content.js';
import { renderTechnicalGuide } from '../../src/lib/presentation.js';
import { publicationFor } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { websiteReviewState, qualifyWebsiteCorpus } from '../../src/lib/website-review.js';
import { sourceDisplay } from '../../src/lib/source-display.js';

const corpus=loadCanonicalCorpus();
const fullDocuments=['DOC-CORE','DOC-CONTROL','DOC-FRAMEWORK','DOC-MATH','DOC-WORLD','DOC-BACKGROUND','DOC-ILLUSTRATIONS','DOC-CATALOGUE','DOC-CLAIM-COVERAGE','DOC-READING-GUIDE','DOC-AUTHORITY','DOC-STATUS','DOC-SOURCE-CHANGES'];

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

test('selected catalogue retains all 22 case identities and source-reported two-axis classification',()=>{
  const catalogue=corpus.entries.get('DOC-CATALOGUE')!;
  const register=JSON.parse(readFileSync('research/RRG_CURRENT/sources.json','utf8'));
  for(const item of register.cases) {
    const id=`UT-E${100+Number(item.id.slice(1))}`,record=corpus.entries.get(id)!;
    assert.ok(catalogue.dependsOn.includes(id));
    assert.match(record.statement!,new RegExp(item.doi.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
    assert.equal(record.sourceBinding!.sourceKey,'R-CURRENT-CATALOGUE');
    assert.match(record.statement!,/Reported result/);assert.match(record.statement!,/Already supplied/);
    assert.match(record.statement!,/Limit of the RRG connection/);assert.match(record.statement!,/Verification coverage/);
    assert.equal(record.evidenceState,'project-reported');
    assert.ok(record.scope.includes(item.evidence_type));assert.ok(record.scope.includes(item.rrg_relation));
  }
  const old=corpus.entries.get('UT-E08')!,current=corpus.entries.get('UT-E107')!;
  assert.equal(old.publicationState,'archived');assert.equal(old.publishedAt,null);
  assert.match(old.statement!,/nature09009/);assert.match(current.statement!,/nature09009/);
  assert.notEqual(old.sourceBinding!.sourceKey,current.sourceBinding!.sourceKey);
  assert.match(renderEntrySync(corpus,corpus.entries.get('DOC-CATALOGUE')!),/no documented complete example/i);
});

test('current questions and audit preserve the promoted source scope while predecessor IDs remain historical',()=>{
  const open=corpus.entries.get('DOC-OPEN-PROBLEMS')!;
  assert.equal(open.sourceBinding!.sourceKey,'R-CURRENT-CLAIMS');
  for(let n=101;n<=108;n++)assert.ok(open.dependsOn.includes(`UT-O${n}`));
  assert.match(open.statement!,/Fundamental unification/);assert.match(open.statement!,/AI/);
  assert.match(open.statement!,/No such full universal chain is established/);
  const status=corpus.entries.get('DOC-STATUS')!;
  assert.equal(status.sourceBinding!.sourceKey,'R-CURRENT-AUDIT');
  assert.match(status.statement!,/not independent peer review/);
  assert.match(status.statement!,/Some findings are verified at original-abstract level/);
  for(const id of ['DOC-PROOF','DOC-INTERACTION-EVIDENCE','DOC-ADDITIONAL-EVIDENCE','UT-O01','UT-E01']) {
    const e=corpus.entries.get(id)!;assert.equal(e.publicationState,'archived');
    assert.ok(corpus.sources.get(e.sourceBinding!.sourceKey)!.path.startsWith('research/history/'));
  }
});

test('technical guides use actual heading anchors and selected routes at both bases',()=>{
  for(const base of ['/','/unity-theory/']) {
    const selection=publicationFor('preview',{...loadSiteConfig(),basePath:base});
    for(const id of [...fullDocuments,'DOC-EVIDENCE','DOC-OPEN-PROBLEMS','DOC-LIBRARY']) {
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
  assert.ok(['pending','accepted','stale','rejected'].includes(websiteReviewState(corpus,'DOC-HOME')));
  // Genuine later reviews may qualify the current corpus; a build alone cannot.
  assert.equal(qualifyWebsiteCorpus({...corpus,websiteReviews:[]}),false);
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
