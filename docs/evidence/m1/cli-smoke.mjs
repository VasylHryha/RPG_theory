import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
const command=['--import','tsx','scripts/build.ts','--mode','release','--output','dist/m1/release-refused'];
const result=spawnSync(process.execPath,command,{encoding:'utf8'});
const noOutput=!existsSync('dist/m1/release-refused');
const expected=result.status===1 && (result.stdout+result.stderr).includes('CURRENT_SOURCE_NOT_QUALIFIED') && noOutput;
writeFileSync('docs/evidence/m1/cli-smoke.log',result.stdout+result.stderr);
writeFileSync('docs/evidence/m1/cli-smoke.json',JSON.stringify({date:new Date().toISOString(),command:'node '+command.join(' '),expectedRefusal:'CURRENT_SOURCE_NOT_QUALIFIED',exitCode:result.status,noOutput,status:expected?'PASS':'FAIL'},null,2)+'\n');
if(!expected) throw new Error('Release CLI did not fail at the authorized target boundary');
