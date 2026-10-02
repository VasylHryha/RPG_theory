import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { buildInputs } from '../../../../src/lib/build-identity.js';
const folder='docs/evidence/m1/website-fidelity-acceptance';
const first=JSON.parse(readFileSync(`${folder}/first-batch-verification.json`,'utf8'));
const commands=[
 [process.execPath,['--import','tsx','--test','tests/content/contracts.test.ts']],
 ...['root','subpath'].flatMap(base=>{
  const output=`dist/m1-website-fidelity-acceptance/preview-${base}`;
  return [['npm',['run','build','--','--mode','preview','--config',base==='root'?'config/site.json':'tests/fixtures/site-subpath.json','--output',output]],['npm',['run','audit:output','--','--dir',output]],['npm',['run','test:e2e','--','--output',output]]] as [string,string[]][];
 })
] as [string,string[]][];
const receipts:any[]=[];
for(const [command,args] of commands) {
 console.log(`Running ${command} ${args.join(' ')}`);
 const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',UNITY_EVIDENCE_DIR:folder}});
 receipts.push({command:`${command} ${args.join(' ')}`,exitCode:result.status});
 if(result.status!==0) break;
}
const pass=receipts.length===commands.length&&receipts.every(r=>r.exitCode===0);
writeFileSync(`${folder}/verification.json`,JSON.stringify({status:pass?'PASS':'FAIL',date:new Date().toISOString(),mode:'preview',productionInputs:buildInputs(),reusedCommands:first.receipts.slice(0,4),reuseReason:'Only tests/content/contracts.test.ts output-fixture identity changed after the first batch. Production, registry, other 66 passing tests and source/config inputs are unchanged; those fresh successes are retained.',firstBatchTests:{total:74,passed:66,failed:8},freshCommands:receipts,notRun:commands.slice(receipts.length),scientificCertification:false,m2:'NOT_STARTED',publicActions:'NOT_RUN'},null,2)+'\n');
process.exitCode=pass?0:1;
