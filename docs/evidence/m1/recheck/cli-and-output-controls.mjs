import { spawnSync } from 'node:child_process';
import { readFileSync,writeFileSync,existsSync,mkdtempSync,cpSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { auditOutput } from '../../../../scripts/audit-output.ts';
const evidence='docs/evidence/m1/recheck';
const cli=[];
for(const mode of ['qualification','release']) {
 const output=`dist/m1-recheck/refused-${mode}`;
 assert.equal(existsSync(output),false);
 const args=['--import','tsx','scripts/build.ts','--mode',mode,'--output',output];
 const result=spawnSync(process.execPath,args,{encoding:'utf8'});
 writeFileSync(`${evidence}/${mode}-refusal.log`,result.stdout+result.stderr);
 assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
 cli.push({command:`node ${args.join(' ')}`,exitCode:result.status,reachedFailure:'CURRENT_SOURCE_NOT_QUALIFIED',outputCreated:false});
}
const fixture=mkdtempSync(join(tmpdir(),'unity-emitted-controls-'));
const controls=[];
try {
 cpSync('dist/m1-recheck/preview-root',fixture,{recursive:true});
 for(const [name,file,from,to,expected] of [
  ['wrong paper destination','references/index.html','https://doi.org/10.1038/s41467-019-13746-6','https://example.org/wrong-paper','BIBLIOGRAPHY_PARITY_FAILURE'],
  ['fabricated review acceptance','claims/UT-E01/index.html','<dd>Pending</dd>','<dd>Accepted</dd>','CONTENT_METADATA_PARITY_FAILURE'],
  ['unbound home status','index.html','Whether the four known fundamental interactions','All four fundamental interactions have been proved','CONTENT_PARITY_FAILURE'],
  ['incorrect navigation text','index.html','Research status</a>','All claims proved</a>','NAVIGATION_PARITY_FAILURE'],
 ]) {
  const path=join(fixture,file),original=readFileSync(path,'utf8');assert.ok(original.includes(from),name);
  writeFileSync(path,original.replace(from,to));let code=null;
  try {auditOutput(fixture);} catch(error) {code=error.code;}
  assert.equal(code,expected,name);controls.push({name,expected,reachedFailure:code,status:'PASS'});writeFileSync(path,original);
 }
 const infoPath=join(fixture,'build-info.json'),original=readFileSync(infoPath,'utf8'),info=JSON.parse(original);
 writeFileSync(infoPath,JSON.stringify({...info,mode:'qualification',corpusScope:'reviewed-current-qualification'}));
 let code=null;try{auditOutput(fixture);}catch(error){code=error.code;}
 assert.equal(code,'CURRENT_SOURCE_NOT_QUALIFIED');controls.push({name:'preview relabelled qualification',status:'PASS',reachedFailure:code});writeFileSync(infoPath,original);
} finally {rmSync(fixture,{recursive:true,force:true});}
writeFileSync(`${evidence}/cli-and-output-controls.json`,JSON.stringify({date:new Date().toISOString(),status:'PASS',scientificAcceptance:false,cli,emittedOutputControls:controls},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',cli,emittedOutputControls:controls}));
