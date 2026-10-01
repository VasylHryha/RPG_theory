import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { filesIn, sourceState } from '../../../../src/lib/source-admission.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';

const evidence='docs/evidence/m1/review-recheck';
const owned=['src/lib/content.ts','src/lib/presentation.ts','src/lib/source-revision.ts','src/pages/index.astro','src/pages/start.astro','scripts/audit-output.ts','tests/content/contracts.test.ts','tests/content/m1.test.ts','tests/content/page-lifecycle.test.ts','docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md'];
const baseline=JSON.parse(readFileSync(`${evidence}/baseline.json`,'utf8'));
const changes=[];
for(const file of baseline.files) {
  assert.ok(existsSync(file.path),file.path);
  const currentSha256=sha256(readFileSync(file.path));
  if(currentSha256===file.sha256) continue;
  assert.ok(owned.includes(file.path),`Unrelated protected mutation: ${file.path}`);
  const snapshot=`${evidence}/prior-code/${file.path}`;
  assert.equal(sha256(readFileSync(snapshot)),file.sha256,`Exact predecessor: ${file.path}`);
  changes.push({path:file.path,priorSnapshot:snapshot,priorSha256:file.sha256,currentSha256});
}
const artifacts=[];
for(const [folder,receiptFolder] of [['dist/m1-recheck','docs/evidence/m1/review/baseline-audit'],['dist/m1-review','docs/evidence/m1/review'],['dist/m1-review-recheck',evidence]]) {
  for(const base of ['root','subpath']) {
    const directory=`${folder}/preview-${base}`;
    const files=filesIn(directory).map(path=>{const raw=readFileSync(`${directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
    const receipt=JSON.parse(readFileSync(`${receiptFolder}/${base}-artifact.json`,'utf8'));
    assert.equal(stableJSON(files),stableJSON(receipt.files),directory);
    const artifactSha256=sha256(stableJSON(files));assert.equal(artifactSha256,receipt.artifactSha256);
    const info=JSON.parse(readFileSync(`${directory}/build-info.json`,'utf8'));
    if(folder==='dist/m1-review-recheck') for(const [key,value] of Object.entries(buildInputs())) assert.equal(info[key],value,key);
    artifacts.push({directory,artifactSha256,files:files.length,htmlPaths:files.filter(f=>f.path.endsWith('.html')).length,publicationManifestSha256:info.publicationManifestSha256,inputsSha256:info.inputsSha256,lockfileSha256:info.lockfileSha256,unchangedAfterBrowserAndControls:true});
  }
}
const admission=sourceState();assert.equal(admission.currentSourceQualified,false);
assert.deepEqual(JSON.parse(readFileSync('research/publication/reviews.yaml','utf8')),[]);
assert.deepEqual(JSON.parse(readFileSync('research/publication/execution-evidence.yaml','utf8')),[]);
const report={date:new Date().toISOString(),status:'PASS',protectedBaselineFiles:baseline.files.length,unchangedProtectedFiles:baseline.files.length-changes.length,preservedTaskOwnedChanges:changes,artifacts,productionInputs:buildInputs(),admission,engineeringState:'REVIEW_READY',scientificAcceptance:false,publicAction:'NOT_RUN'};
writeFileSync(`${evidence}/final-integrity.json`,JSON.stringify(report,null,2)+'\n');
const paths=owned.concat(['tests/content/revision-inventory-cli.test.ts']);
writeFileSync(`${evidence}/task-files.json`,JSON.stringify({gitHead:null,gitRemote:null,files:paths.map(path=>({path,sha256:sha256(readFileSync(path))}))},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',protected:baseline.files.length,unchanged:report.unchangedProtectedFiles,changedWithPriorSnapshots:changes.length,artifacts:artifacts.length}));
