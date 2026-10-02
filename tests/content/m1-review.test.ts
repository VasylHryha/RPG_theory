import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadCanonicalCorpus, dependencyClosure, affectedEntries, reviewFingerprint } from '../../src/lib/content.js';

import { websiteReviewState } from '../../src/lib/website-review.js';

test('each additional-evidence mapping declares every core clause named by its actual excerpt', () => {
  const corpus = loadCanonicalCorpus();
  const clauses: Record<string, string> = { '3':'UT-D03', '4':'UT-D04', '5':'UT-D06', '6':'UT-D07', '7':'UT-D05', '8':'UT-D08', '9':'UT-D09' };
  for (let number = 1; number <= 9; number++) {
    const entry = corpus.entries.get(`UT-E${String(number).padStart(2,'0')}`)!;
    const source = /\*\*Existing clauses:\*\* ([^\n]+)/.exec(entry.statement!)![1];
    for (const match of source.matchAll(/§(\d+)/g)) {
      const dependency = clauses[match[1]];
      assert.ok(dependency && entry.dependsOn.includes(dependency), `${entry.id}: core §${match[1]}`);
      assert.ok(affectedEntries(corpus,dependency).includes(entry.id));
      const before = reviewFingerprint(corpus,entry.id);
      const definition = corpus.entries.get(dependency)!;
      const scope = definition.scope;
      definition.scope += ' Isolated changed support scope.';
      assert.notEqual(reviewFingerprint(corpus,entry.id),before);
      definition.scope = scope;
    }
  }
});

test('the actual start explanation tracks emergent evidence, its support metadata and current status', () => {
  const corpus = loadCanonicalCorpus();
  for (const dependency of ['UT-E10','UT-E11','UT-E12','DOC-STATUS']) assert.ok(dependencyClosure(corpus,'DOC-START').includes(dependency));
  assert.ok(affectedEntries(corpus,'R-CURRENT-INTERACTIONS').includes('DOC-START'));
  assert.ok(affectedEntries(corpus,'BIB-0016').includes('DOC-START'));
  const before = reviewFingerprint(corpus,'DOC-START');
  corpus.references.get('BIB-0016')!.supportScope += ' Isolated changed citation support.';
  assert.notEqual(reviewFingerprint(corpus,'DOC-START'),before);
  assert.equal(websiteReviewState(corpus,'DOC-START'),'pending');
});

test('background-extension changes invalidate the actual E12 interpretation and its consumers', () => {
  const corpus=loadCanonicalCorpus();
  assert.ok(corpus.entries.get('UT-E12')!.dependsOn.includes('UT-C02'));
  const consumers=['UT-E12','DOC-HOME','DOC-START','DOC-STATUS','DOC-PROOF'];
  for(const id of consumers) assert.ok(affectedEntries(corpus,'UT-C02').includes(id),id);
  const before=new Map(consumers.map(id=>[id,reviewFingerprint(corpus,id)])),unrelated=reviewFingerprint(corpus,'UT-E10');
  corpus.entries.get('UT-C02')!.scope+=' Isolated changed background-extension meaning.';
  for(const id of consumers) assert.notEqual(reviewFingerprint(corpus,id),before.get(id),id);
  assert.equal(reviewFingerprint(corpus,'UT-E10'),unrelated);
  assert.equal(websiteReviewState(corpus,'UT-C02'),'pending');
  assert.equal(websiteReviewState(corpus,'UT-E12'),'pending');
  // Pending consumers change identity; they do not acquire stale approvals.
  for(const id of consumers) assert.equal(websiteReviewState(corpus,id),'pending',id);
});

test('review fingerprints track real URL, selection, style and pinned rendering dependency inputs', () => {
  const root = mkdtempSync(join(tmpdir(),'unity-render-review-'));
  try {
    for (const folder of ['src','research','config','docs/evidence/m1/literature']) {
      mkdirSync(join(root,folder,'..'),{recursive:true});
      cpSync(folder,join(root,folder),{recursive:true});
    }
    for (const file of ['astro.config.mjs','package-lock.json']) cpSync(file,join(root,file));
    const original = reviewFingerprint(loadCanonicalCorpus(root),'UT-D01');
    for (const path of ['src/lib/urls.ts','src/lib/publication.ts','src/styles/global.css','package-lock.json']) {
      const file = join(root,path), raw = readFileSync(file);
      writeFileSync(file,Buffer.concat([raw,Buffer.from('\n')]));
      assert.notEqual(reviewFingerprint(loadCanonicalCorpus(root),'UT-D01'),original,path);
      writeFileSync(file,raw);
    }
    assert.equal(reviewFingerprint(loadCanonicalCorpus(root),'UT-D01'),original);
  } finally { rmSync(root,{recursive:true,force:true}); }
});
