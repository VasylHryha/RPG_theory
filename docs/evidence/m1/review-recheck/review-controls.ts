import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { auditOutput } from '../../../../scripts/audit-output.js';
import { loadCanonicalCorpus, affectedEntries, reviewFingerprint } from '../../../../src/lib/content.js';
import { ContractError } from '../../../../src/lib/errors.js';

const evidence='docs/evidence/m1/review-recheck';
const corpus=loadCanonicalCorpus();
assert.equal(corpus.admission.currentSourceQualified,false);
assert.equal(corpus.reviews.length,0);
assert.equal(corpus.evidence.size,0);
const cli=[];
for(const mode of ['qualification','release']) {
  const output=`dist/m1-review-recheck/refused-${mode}`;
  assert.equal(existsSync(output),false);
  const argv=['--import','tsx','scripts/build.ts','--mode',mode,'--output',output];
  const result=spawnSync(process.execPath,argv,{encoding:'utf8'});
  writeFileSync(`${evidence}/${mode}-refusal.log`,result.stdout+result.stderr);
  assert.equal(result.status,1);
  assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);
  assert.equal(existsSync(output),false);
  cli.push({command:`node ${argv.join(' ')}`,exitCode:result.status,reachedFailure:'CURRENT_SOURCE_NOT_QUALIFIED',outputCreated:false});
}
const controls=[];
const temp=mkdtempSync(join(tmpdir(),'unity-m1-review-output-'));
try {
  for(const base of ['root','subpath']) {
    const directory=join(temp,base);
    cpSync(`dist/m1-review-recheck/preview-${base}`,directory,{recursive:true});
    assert.equal(auditOutput(directory).status,'PASS');
    for(const [name,file,from,to,expected] of [
      ['wrong paper destination','references/index.html','https://doi.org/10.1038/s41467-019-13746-6','https://example.org/fabricated-paper','BIBLIOGRAPHY_PARITY_FAILURE'],
      ['fabricated accepted review','claims/UT-E01/index.html','<dd>Pending</dd>','<dd>Accepted</dd>','CONTENT_METADATA_PARITY_FAILURE'],
      ['false home completion','index.html','Whether the four known fundamental interactions','The four fundamental interactions are all proved','CONTENT_PARITY_FAILURE'],
      ['incorrect navigation','index.html','Research status</a>','All claims accepted</a>','NAVIGATION_PARITY_FAILURE'],
      ['omitted evidence dependency','claims/UT-E01/index.html','UT-D07 — Variation','No dependency on variation','CONTENT_METADATA_PARITY_FAILURE']
    ]) {
      const path=join(directory,file),original=readFileSync(path,'utf8');
      assert.ok(original.includes(from),name);
      writeFileSync(path,original.replace(from,to));
      let reachedFailure='';
      try { auditOutput(directory); } catch(error) { if(error instanceof ContractError) reachedFailure=error.code; else throw error; }
      assert.equal(reachedFailure,expected,name);
      controls.push({base,name,expected,reachedFailure,status:'PASS'});
      writeFileSync(path,original);
    }
    for(const file of ['index.html','start/index.html']) {
      const path=join(directory,file),original=readFileSync(path,'utf8');
      for(const [name,modified] of [
        ['false heading',original.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,'<h1>All fundamental interactions are proved.</h1>')],
        ['false publication state',original.replace('Publication: Draft · private preview.','Publication: published.')],
        ['false exact-content approval',original.replace('Content review: Pending.','Content review: Accepted.')],
        ['omitted editorial state',original.replace(/<p\b[^>]*data-editorial-state[^>]*>[\s\S]*?<\/p>/,'')],
      ]) {
        assert.notEqual(modified,original,name);writeFileSync(path,modified);
        assert.throws(()=>auditOutput(directory),/CONTENT_METADATA_PARITY_FAILURE/);
        controls.push({base,name:`${file}: ${name}`,expected:'CONTENT_METADATA_PARITY_FAILURE',reachedFailure:'CONTENT_METADATA_PARITY_FAILURE',status:'PASS'});
        writeFileSync(path,original);
      }
    }
    const path=join(directory,'build-info.json'),original=readFileSync(path,'utf8');
    const info=JSON.parse(original);info.mode='qualification';info.corpusScope='reviewed-current-qualification';
    writeFileSync(path,JSON.stringify(info));
    assert.throws(()=>auditOutput(directory),/CURRENT_SOURCE_NOT_QUALIFIED/);
    controls.push({base,name:'preview relabelled qualification',expected:'CURRENT_SOURCE_NOT_QUALIFIED',reachedFailure:'CURRENT_SOURCE_NOT_QUALIFIED',status:'PASS'});
    writeFileSync(path,original);
  }
} finally {rmSync(temp,{recursive:true,force:true});}
const affected=['R-CURRENT-INTERACTIONS','BIB-0016','BIB-0022','UT-D04','UT-D07','UT-D08','UT-D09'].map(id=>({changedIdentity:id,entries:affectedEntries(corpus,id)}));
assert.ok(affected.find(report=>report.changedIdentity==='R-CURRENT-INTERACTIONS')!.entries.includes('DOC-START'));
writeFileSync(`${evidence}/cli-and-output-controls.json`,JSON.stringify({date:new Date().toISOString(),status:'PASS',scientificAcceptance:false,cli,emittedOutputControls:controls,affected},null,2)+'\n');
writeFileSync(`${evidence}/review-request-fingerprints.json`,JSON.stringify({purpose:'Required review identities only; no approvals',entries:[...corpus.entries.keys()].map(id=>({entryId:id,requiredFingerprint:reviewFingerprint(corpus,id),outcome:'pending'}))},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',cli:cli.length,outputControls:controls.length,currentSourceQualified:false,acceptedReviews:corpus.reviews.length}));
