import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const receipts=[];
for (const command of [['run','build','--','--mode','preview','--output','dist/m0-review/preview-root'],['run','audit:output','--','--dir','dist/m0-review/preview-root'],['run','build','--','--mode','release','--output','dist/m0-review/release-root']]) {
 const result=spawnSync('npm',command,{encoding:'utf8',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',UNITY_EVIDENCE_DIR:'docs/evidence/m0/review/preview'}});
 console.log(result.stdout+result.stderr);
 receipts.push({command:'npm '+command.join(' '),exitCode:result.status,output:result.stdout+result.stderr});
}
const preview=JSON.parse(readFileSync('dist/m0-review/preview-root/build-info.json'));
const qualified=JSON.parse(readFileSync('dist/m0-review/qualification-root/build-info.json'));
const complete=receipts[0].exitCode===0 && receipts[1].exitCode===0 && receipts[2].exitCode===1 && receipts[2].output.includes('PUBLIC_TARGET_REQUIRED') && !existsSync('dist/m0-review/release-root') && preview.mode==='preview' && qualified.mode==='qualification' && preview.deployEligible===false && qualified.deployEligible===false && preview.inputsSha256===qualified.inputsSha256;
writeFileSync('docs/evidence/m0/review/cli-smoke.json',JSON.stringify({status:complete?'PASS':'FAIL',receipts,previewMode:preview.mode,qualificationMode:qualified.mode,sameInputs:preview.inputsSha256===qualified.inputsSha256,releaseOutputCreated:existsSync('dist/m0-review/release-root')},null,2)+'\n');
process.exitCode=complete?0:1;
