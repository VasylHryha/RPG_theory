import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { readYAML, validateCorpus, loadCanonicalCorpus, reviewFingerprint } from '../../../../src/lib/content.js';
import { readAdmission, filesIn } from '../../../../src/lib/source-admission.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';

const evidence='docs/evidence/m1/independent-review';
const artifacts=[];
for(const base of ['root','subpath']) {
 const directory=`dist/m1-review-recheck/preview-${base}`;
 const actual=auditOutput(directory);
 const receipt=JSON.parse(readFileSync(`docs/evidence/m1/review-recheck/${base}-artifact.json`,'utf8'));
 assert.equal(stableJSON(actual.files),stableJSON(receipt.files));
 assert.equal(actual.artifactSha256,receipt.artifactSha256);
 artifacts.push({directory,...actual});
}
const corpus=loadCanonicalCorpus();
const fingerprints=JSON.parse(readFileSync('docs/evidence/m1/review-recheck/review-request-fingerprints.json','utf8'));
for(const item of fingerprints.entries) assert.equal(reviewFingerprint(corpus,item.entryId),item.requiredFingerprint);
const input={entries:[...readYAML('research/publication/records.yaml') as unknown[],...readYAML('research/publication/canonical-documents.yaml') as unknown[]],sources:readYAML('research/publication/source-index.yaml') as unknown[],references:readYAML('research/publication/references.yaml') as any[],aliases:readYAML('research/publication/citation-aliases.yaml') as unknown[],reviews:[],record:readAdmission()!};
// No scientific source or live URL is modified. The actual institutional PDF
// citation ends in .pdf; .pdf/ is a different URL path.
const ref=input.references.find(r=>r.id==='BIB-0023');
assert.ok(ref.url.endsWith('PAJ296.pdf'));
ref.url+='/';ref.identity=ref.url;
let failure:string|null=null;
try {validateCorpus(input);} catch(error) {failure=String(error);}
const report={date:new Date().toISOString(),artifacts,productionInputs:buildInputs(),pendingFingerprintsChecked:fingerprints.entries.length,probe:{name:'Institutional PDF citation gains a trailing slash',unexpectedlyAccepted:failure===null,failure,scientificSourceChanged:false}};
writeFileSync(`${evidence}/pre-repair-probes.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({artifacts:artifacts.map(a=>({directory:a.directory,artifactSha256:a.artifactSha256})),pendingFingerprintsChecked:fingerprints.entries.length,probe:report.probe}));
