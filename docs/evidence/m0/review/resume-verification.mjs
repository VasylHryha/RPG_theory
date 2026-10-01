import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
const evidence = 'docs/evidence/m0/review';
const previous = JSON.parse(readFileSync(`${evidence}/first-contract-verification.json`));
const commands = [ ['run','test:content'], ...[['config/site.json','root'],['tests/fixtures/site-subpath.json','subpath']].flatMap(([config,suffix]) => {
  const output = `dist/m0-review/qualification-${suffix}`;
  return [['run','build','--','--mode','qualification','--config',config,'--output',output],['run','audit:output','--','--dir',output],['run','test:e2e','--','--output',output]];
})];
const receipts = previous.receipts.slice(0,3).map(r => ({...r,reused: true, reason: 'Only a contract-test HTML-escaping assertion changed after these passing checks; production/config/source/dependency inputs unchanged'}));
let completed=0;
for (const command of commands) {
  console.log(`Running npm ${command.join(' ')}`);
  const result = spawnSync('npm',command,{stdio:'inherit',env:{...process.env,UNITY_EVIDENCE_DIR:evidence,ASTRO_TELEMETRY_DISABLED:'1'}});
  receipts.push({command:`npm ${command.join(' ')}`,exitCode:result.status});completed++;
  if (result.status !== 0) break;
}
const complete = completed === commands.length && receipts.every(r=>r.exitCode===0);
writeFileSync(`${evidence}/verification.json`, JSON.stringify({date:new Date().toISOString(),status:complete?'PASS':'FAIL',receipts,notRun:commands.slice(completed),scientificContentAccepted:false,humanComprehension:'NOT_TESTED',publicDeployment:'NOT_RUN'},null,2)+'\n');
process.exitCode=complete?0:1;
