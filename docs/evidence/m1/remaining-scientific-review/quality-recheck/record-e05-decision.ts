// Record one explicit scientific review decision made in source-readout.md.
// Not a review-request importer, automatic reviewer, or qualification writer.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { loadCanonicalCorpus, semanticDigest, reviewFingerprint, renderEntrySync, dependencyClosure } from '../../../../../src/lib/content.js';
import { sha256, stableJSON } from '../../../../../src/lib/identity.js';

const folder='docs/evidence/m1/remaining-scientific-review/quality-recheck';
const path='research/publication/reviews.yaml', raw=readFileSync(path,'utf8');
const corpus=loadCanonicalCorpus(), entry=corpus.entries.get('UT-E05')!;
assert.equal(corpus.admission.currentSourceQualified,false);
assert.equal(corpus.evidence.size,0);
assert.equal(corpus.reviews.length,18);
assert.ok(!corpus.reviews.some(r=>r.entryId===entry.id));
const prior=JSON.parse(readFileSync(`${folder}/prior/${path}`,'utf8'));
assert.equal(stableJSON(corpus.reviews),stableJSON(prior));
const prepass=JSON.parse(readFileSync('docs/evidence/m1/remaining-scientific-review/entry-identities.json','utf8'));
assert.equal(stableJSON(entry),stableJSON(prepass.entries.find((e:any)=>e.entryId===entry.id).ownRead));
// Fingerprint calculated from the independently assessed actual representation.
const fingerprint=reviewFingerprint(corpus,entry.id);
const receipt={
  entryId:entry.id, outcome:'accepted', reviewerKind:'agent', reviewedAt:'2026-10-02',
  rationale:'Selected primary manuscript passages corroborate the exact statement and restricted relationships; complete study qualification remains pending.',
  acceptedScope:'Exact source-reported biofilm statement and domain-specific core relationship mapping only; no universal core proof or independent replication.',
  ownRead:entry,
  sourceInspectionProvenance:'Source Checked remains supplied-source reported; own selected author-manuscript reading is access-ledger.json.',
  semanticDigest:semanticDigest(entry), renderedBodySha256:sha256(renderEntrySync(corpus,entry)),
  dependencies:dependencyClosure(corpus,entry.id).map(id=>({id,semanticDigest:semanticDigest(corpus.entries.get(id)!)})),
  independentlyComputedFingerprint:fingerprint,
  evidenceRef:`${folder}/source-readout.md`,
  readoutSha256:sha256(readFileSync(`${folder}/source-readout.md`)),
  accessLedgerSha256:sha256(readFileSync(`${folder}/access-ledger.json`)),
  fullScientificQualification:false,
};
writeFileSync(`${folder}/e05-decision.json`,JSON.stringify(receipt,null,2)+'\n');
const row={entryId:entry.id,fingerprint,reviewerKind:'agent',reviewedAt:'2026-10-02',outcome:'accepted',evidenceRef:`${folder}/e05-decision.json#${entry.id}`};
const closing=raw.lastIndexOf(']'); assert.ok(closing>=0 && !raw.slice(closing+1).trim());
// Keep every prior review object's raw text; append this one explicit decision.
const addition=JSON.stringify(row,null,2).split('\n').map(line=>'  '+line).join('\n');
writeFileSync(path,raw.slice(0,closing).trimEnd()+',\n'+addition+'\n'+raw.slice(closing));
console.log('Recorded one explicit bounded UT-E05 decision; eighteen prior reviews and source qualification preserved.');
