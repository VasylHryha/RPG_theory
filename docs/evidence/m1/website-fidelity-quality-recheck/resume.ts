import { spawnSync } from 'node:child_process';
import { readFileSync,writeFileSync } from 'node:fs';
import { buildInputs } from '../../../../src/lib/build-identity.js';
const folder='docs/evidence/m1/website-fidelity-quality-recheck';
const first=JSON.parse(readFileSync(`${folder}/first-batch-verification.json`,'utf8'));
const commands=[
 [process.execPath,['--import','tsx','--test','tests/content/m1.test.ts']],
 ...['root','subpath'].flatMap(base=>{
  const output=`dist/m1-website-fidelity-quality-recheck/preview-${base}`;
  return [['npm',['run','build','--','--mode','preview','--config',base==='root'?'config/site.json':'tests/fixtures/site-subpath.json','--output',output]],['npm',['run','audit:output','--','--dir',output]],['npm',['run','test:e2e','--','--output',output]]] as [string,string[]][];
 })
] as [string,string[]][];
const receipts:any[]=[];
for(const [command,args] of commands) {
 console.log(`Running ${command} ${args.join(' ')}`);
 const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',UNITY_EVIDENCE_DIR:folder}});
 receipts.push({command:`${command} ${args.join(' ')}`,exitCode:result.status});
 if(result.status!==0)break;
}
const pass=receipts.length===commands.length&&receipts.every(r=>r.exitCode===0);
writeFileSync(`${folder}/verification.json`,JSON.stringify({status:pass?'PASS':'FAIL',date:new Date().toISOString(),mode:'preview',productionInputs:buildInputs(),reusedCommands:first.receipts.slice(0,4),reuseReason:'Only tests/content/m1.test.ts withdrawal fixtures changed after the first batch; production, registry and every other test file stayed unchanged. Its whole file is rerun. Other fresh passing cases and four commands are retained.',firstBatchTests:{total:76,passed:74,failed:2},freshCommands:receipts,notRun:commands.slice(receipts.length),scientificCertification:false,newRepairs:'REVIEW_READY',m2:'NOT_STARTED',publicActions:'NOT_RUN'},null,2)+'\n');
process.exitCode=pass?0:1;
