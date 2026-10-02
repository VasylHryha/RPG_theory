import { spawnSync } from 'node:child_process';
import { readFileSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { sha256,stableJSON } from '../../../../src/lib/identity.js';

const evidence='docs/evidence/m1/scientific-review/quality-final';
const prior=JSON.parse(readFileSync('docs/evidence/m1/scientific-review/pre-recheck/verification.json','utf8'));
assert.equal(prior.status,'PASS');
const reused=prior.reused.receipts.slice(0,2);
assert.ok(reused.every((r:any)=>r.exitCode===0));
// Quality batch changes derivative concept/reviews/tests only; raw source inputs unchanged.
const identities=buildInputs();
const commands=[
 ['run','check'],['run','check:content'],['run','test:content'],
 ...['root','subpath'].flatMap(base=>[
  ['run','build','--','--mode','preview','--config',base==='root'?'config/site.json':'tests/fixtures/site-subpath.json','--output',`dist/m1-scientific-review-quality-final/preview-${base}`],
  ['run','audit:output','--','--dir',`dist/m1-scientific-review-quality-final/preview-${base}`],
  ['run','test:e2e','--','--output',`dist/m1-scientific-review-quality-final/preview-${base}`]
 ])
];
const receipts:any[]=[];
for(const args of commands) {
 console.log(`\nRunning npm ${args.join(' ')}`);
 const result=spawnSync('npm',args,{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',UNITY_EVIDENCE_DIR:evidence}});
 receipts.push({command:'npm '+args.join(' '),exitCode:result.status});
 if(result.status!==0) break;
}
assert.equal(stableJSON(buildInputs()),stableJSON(identities));
const complete=receipts.length===commands.length && receipts.every(r=>r.exitCode===0);
writeFileSync(`${evidence}/verification.json`,JSON.stringify({date:new Date().toISOString(),mode:'preview',status:complete?'PASS':'FAIL',productionInputs:identities,receipts,notRun:commands.slice(receipts.length).map(c=>'npm '+c.join(' ')),reused:{receipts:reused,from:'docs/evidence/m1/scientific-review/pre-recheck/verification.json',sha256:sha256(readFileSync('docs/evidence/m1/scientific-review/pre-recheck/verification.json')),basis:'The quality batch changes concept metadata/review registry and affected tests; both raw source checks retain identical source/config/validator inputs. Fresh Astro/content/contracts and both artifact/browser groups run.'},scientificContentAccepted:false,boundedRepresentationAcceptances:18,currentSourceQualified:false,humanComprehension:'NOT_TESTED',publicDeployment:'NOT_RUN'},null,2)+'\n');
process.exitCode=complete?0:1;
