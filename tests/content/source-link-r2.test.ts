import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCanonicalCorpus, renderEntrySync, reviewFingerprint, affectedEntries, bibliographyClosure } from '../../src/lib/content.js';
import { renderReferences } from '../../src/lib/presentation.js';
import { publicationAssets, explanatoryMarkdown, verifyArchive } from '../../src/lib/publication-assets.js';
import { publicationFor } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { validateCurrentCatalogue, type LinkMap } from '../../scripts/current-catalogue-check.js';

const corpus=loadCanonicalCorpus();
const register=JSON.parse(readFileSync('research/RRG_CURRENT/sources.json','utf8'));
const catalogue=readFileSync('research/RRG_CURRENT/06_evidence_catalog.md','utf8');
const map=JSON.parse(readFileSync('research/publication/source-link-map.json','utf8')) as LinkMap;
const check=(r=register,m=map,c=corpus,text=catalogue)=>validateCurrentCatalogue(c,r,text,m);

test('selected current cases use their actual inventory; document-scoped C1 and E labels retain distinct meanings',()=>{
  assert.equal(check().primaryCases,register.cases.length);
  const c1=map.labels.filter(l=>l.label==='C1');assert.equal(c1.length,2);
  assert.notEqual(c1[0].sourceKey,c1[1].sourceKey);assert.equal(c1[0].edition,c1[1].edition);assert.notEqual(c1[0].meaning,c1[1].meaning);
  assert.equal(map.labels.find(l=>l.sourceKey==='R-HISTORY-REPO-ADDITIONAL' && l.label==='E01')?.bibliographyId,'BIB-0022');
  assert.equal(map.labels.find(l=>l.sourceKey==='R-CURRENT-CATALOGUE' && l.label==='E07')?.bibliographyId,'BIB-0036');
  assert.equal(map.labels.find(l=>l.sourceKey==='R-HISTORY-REPO-ADDITIONAL' && l.label==='E08')?.bibliographyId,'BIB-0036');
});

test('adapted check exposes duplicate cases/DOIs, unknown claims and incomplete selected inventory',()=>{
  const duplicate=structuredClone(register);duplicate.cases.push(duplicate.cases[0]);assert.throws(()=>check(duplicate),/Duplicate registered/);
  const wrong=structuredClone(register);wrong.cases[0].arrows=['C999'];assert.throws(()=>check(wrong),/Unknown 06 claim/);
  const missing=structuredClone(register);missing.cases.pop();assert.throws(()=>check(missing),/Catalogue headings differ/);
  const newCase=structuredClone(register);newCase.cases.push({...newCase.cases[0],id:'E99',doi:'10.1234/new',url:'https://doi.org/10.1234/new'});
  // E99 is not rejected by a permanent E01–E22 assertion: it reaches mapping.
  assert.throws(()=>check(newCase,map,corpus,catalogue+'\n## E99 — Added selected fixture\n'),/Missing\/duplicate selected case edge: E99/);
});

test('adapted check rejects label collisions, wrong editions and case-to-paper substitutions',()=>{
  const duplicate=structuredClone(map);duplicate.labels.push(duplicate.labels[0]);assert.throws(()=>check(register,duplicate),/Duplicate document-and-edition/);
  const edition=structuredClone(map);edition.labels[0].edition='Wrong edition';assert.throws(()=>check(register,edition),/Wrong document or edition/);
  const meaning=structuredClone(map);meaning.labels.find(l=>l.sourceKey==='R-CURRENT-BACKGROUND' && l.label==='C1')!.meaning='Geometry and mode structure constrain or affect one another.';assert.throws(()=>check(register,meaning),/Claim labels differ from source document/);
  const paper=structuredClone(map);paper.caseEdges[0].bibliographyId='BIB-0022';assert.throws(()=>check(register,paper),/Case → binding → bibliography mismatch/);
});

test('version/access links retain every BIB target without displaying independent duplicate publications',()=>{
  const selection=publicationFor('preview',loadSiteConfig());
  const html=renderReferences(selection.references,selection.entries);
  for(const [alt,primary] of [[40,3],[45,44],[47,46],[50,49],[52,51]]){
    const id=(n:number)=>`BIB-${String(n).padStart(4,'0')}`;
    assert.equal(corpus.references.get(id(alt))?.primaryId,id(primary));
    assert.ok(bibliographyClosure(corpus,[id(primary)]).includes(id(alt)));
    if(selection.manifest.referenceIds.includes(id(primary)))assert.ok(html.includes(`id="${id(alt)}"`));
    else assert.ok(!html.includes(`id="${id(alt)}"`));
    assert.ok(!html.includes(`<li id="${id(alt)}"`));
  }
  assert.match(corpus.references.get('BIB-0044')!.supportScope,/equivalence is not established/);
});

test('a displayed alternate is bound to its parent user review and remains local to that publication',()=>{
  const id='UT-E108',original=reviewFingerprint(corpus,id);
  assert.ok(bibliographyClosure(corpus,['BIB-0003']).includes('BIB-0040'));
  const user=[...corpus.entries.values()].find(e=>e.bibRefs.includes('BIB-0049') && !e.bibRefs.includes('BIB-0050'))!;
  assert.ok(user);const before=reviewFingerprint(corpus,user.id);
  const changed={...corpus,references:new Map(corpus.references)};
  changed.references.set('BIB-0050',{...corpus.references.get('BIB-0050')!,linkRole:'Changed author-version locator'});
  assert.notEqual(reviewFingerprint(changed,user.id),before);
  assert.ok(affectedEntries(corpus,'BIB-0050').includes(user.id));
  assert.equal(reviewFingerprint(changed,id),original);
});

test('HTML, explanatory downloads and ZIP preserve scoped findings and original bytes at both bases',()=>{
  for(const base of ['/','/unity-theory/']){
    const config={...loadSiteConfig(),basePath:base},entry=corpus.entries.get('DOC-SOURCE-LINKS')!;
    const html=renderEntrySync(corpus,entry,base),md=explanatoryMarkdown(corpus,entry,config);
    assert.ok(html.includes(base+'claims/UT-E107/'));assert.ok(md.includes('./UT-E107.md'));
    assert.match(md,/simulated interruption of feedback/);assert.match(md,/not endorsements/);assert.match(md,/universal-proof prerequisite/);
    assert.ok(!md.includes('./DOC-ADDITIONAL-EVIDENCE.md'));assert.ok(md.includes(config.origin+base+'evidence/additional/'));
    const selection=publicationFor('preview',config),assets=publicationAssets(selection,config);verifyArchive(assets.files.get(assets.zipPath)!);
    assert.equal(assets.members.get('explanatory/DOC-SOURCE-LINKS.md')?.toString(),md);
    assert.deepEqual(assets.members.get('original/R-CURRENT-CATALOGUE.md'),readFileSync('research/RRG_CURRENT/06_evidence_catalog.md'));
    assert.equal(selection.manifest.deployEligible,false);assert.deepEqual(selection.manifest.searchIds,[]);
  }
});
