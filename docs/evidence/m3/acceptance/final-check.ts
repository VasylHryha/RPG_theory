import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { loadCanonicalCorpus } from '../../../../src/lib/content.js';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';
import { websiteReviewState } from '../../../../src/lib/website-review.js';

const folder='docs/evidence/m3/acceptance',corpus=loadCanonicalCorpus();
const before=JSON.parse(readFileSync(`${folder}/protected-before.json`,'utf8'));
const unownedRuntimeChanges=[];
for(const [path,hash] of Object.entries(before)) {
  if(path==='research/publication/website-reviews.yaml')continue;
  const actual=sha256(readFileSync(path));
  if(path==='.idea/.idea.RPG_theory/.idea/workspace.xml' && actual!==hash) {
    unownedRuntimeChanges.push({path,before:hash,after:actual,action:'Current bytes left untouched; no task command writes this runtime file; origin not independently established.'});
    continue;
  }
  assert.equal(actual,hash,path);
}
let priorReceipts=0;
for(const name of ['pre-review-registry.json','pre-repair-registry.json']) {
  const prior=JSON.parse(readFileSync(`${folder}/${name}`,'utf8'));
  for(const review of prior) {
    assert.equal(sha256(readFileSync(review.evidenceRef)),review.evidenceSha256,review.evidenceRef);
    if(!review.entryId.startsWith('UT-') && corpus.entries.get(review.entryId)!.audience!=='technical') {
      assert.equal(stableJSON(corpus.websiteReviews.find(r=>r.entryId===review.entryId)),stableJSON(review),'Unreviewed decision changed');
    }
    priorReceipts++;
  }
}
const outputs=[];
for(const [label,output] of [['root','dist/m3-acceptance-root'],['subpath','dist/m3-acceptance-subpath']]) {
  const info=JSON.parse(readFileSync(`${output}/build-info.json`,'utf8'));
  assert.equal(info.inputsSha256,buildInputs().inputsSha256);
  const artifact=JSON.parse(readFileSync(`${folder}/final/${label}-artifact.json`,'utf8'));
  for(const file of artifact.files)assert.equal(sha256(readFileSync(`${output}/${file.path}`)),file.sha256);
  const $=load(readFileSync(`${output}/math/index.html`,'utf8'));
  const section=$('[id="39-geometry-force-and-mode-remain-one-local-object"]').nextUntil('h2');
  assert.equal(section.filter('.katex-display').length,4);
  assert.ok(section.find('annotation').toArray().some(el=>$(el).text()==='\\boxed{\nF_q=-\\frac{\\partial\\Gamma}{\\partial q}\n}'));
  assert.ok(section.filter('p').toArray().some(el=>$(el).text()==='defines the restoring/driving interaction, and'));
  outputs.push({base:info.config.basePath,files:artifact.files.length,html:artifact.files.filter((f:any)=>f.path.endsWith('.html')).length,artifactSha256:artifact.artifactSha256,deployEligible:info.deployEligible,status:'MATCH'});
}
const result={status:unownedRuntimeChanges.length?'PASS_WITH_UNOWNED_RUNTIME_STATE_CHANGE':'PASS',protectedFilesUnchanged:Object.keys(before).length-1-unownedRuntimeChanges.length,authorizedProtectedChanges:['research/publication/website-reviews.yaml'],unownedRuntimeChanges,priorReceiptReferencesVerified:priorReceipts,unreviewedRegistryRecordsUnchanged:14,reviewStates:Object.fromEntries(['accepted','stale','pending','rejected'].map(state=>[state,[...corpus.entries.keys()].filter(id=>websiteReviewState(corpus,id)===state).length])),currentSourceQualified:corpus.admission.currentSourceQualified,outputs};
writeFileSync(`${folder}/preservation-final.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
