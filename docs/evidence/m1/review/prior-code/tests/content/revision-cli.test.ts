import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { sha256,stableJSON } from '../../src/lib/identity.js';

test('real revision CLI validates preserved editions and reports pending dependants; it cannot write approvals',()=>{
  const fixture=mkdtempSync(join(tmpdir(),'unity-authoring-control-'));
  const prior=join(fixture,'prior'),next=join(fixture,'next');
  const read=(root:string,path:string)=>JSON.parse(readFileSync(join(root,path),'utf8'));
  const write=(root:string,path:string,value:unknown)=>writeFileSync(join(root,path),JSON.stringify(value,null,2)+'\n');
  try {
    // Copies remain isolated synthetic engineering controls. Supplied source
    // bytes, real reviews and real admission pins are never edited by this test.
    for(const root of [prior,next]) {
      for(const folder of ['research','src','docs/evidence/m1/literature']) {mkdirSync(join(root,folder,'..'),{recursive:true});cpSync(folder,join(root,folder),{recursive:true});}
      mkdirSync(join(root,'config'));cpSync('config/research-source.json',join(root,'config/research-source.json'));
      const record=read(root,'config/research-source.json');record.corpusScope='synthetic';write(root,'config/research-source.json',record);
    }
    const predecessor=read(prior,'config/research-source.json'),record=read(next,'config/research-source.json');
    const changeId='SYNTHETIC-ENGINEERING-TRANSACTION';
    const changed=['04_status_and_blockers.md','CHANGELOG.md'];
    for(const name of changed) {
      const path=join(next,'research/RRG_CURRENT',name);
      writeFileSync(path,readFileSync(path,'utf8')+`\n\n${changeId}: isolated test annotation; not a scientific revision or approval.\n`);
    }
    record.edition='Synthetic authoring control, not a research edition';
    record.files=record.files.map((f:{path:string;bytes:number;sha256:string})=>{const raw=readFileSync(join(next,record.directory,f.path));return {...f,bytes:raw.length,sha256:sha256(raw)};});
    record.inventorySeal=sha256(stableJSON(record.files));
    record.bindings=record.bindings.map((b:{path:string;sourceSha256:string})=>({...b,sourceSha256:record.files.find((f:{path:string})=>f.path===b.path).sha256}));
    write(next,'config/research-source.json',record);
    const sources=read(next,'research/publication/source-index.yaml');
    const changedKeys=sources.filter((s:{path:string})=>changed.some(name=>s.path===`research/RRG_CURRENT/${name}`)).map((s:{key:string})=>s.key);
    for(const source of sources) if(source.declaredCurrent) {source.edition=record.edition;source.sha256=record.files.find((f:{path:string})=>`${record.directory}/${f.path}`===source.path).sha256;}
    write(next,'research/publication/source-index.yaml',sources);
    const revise=(e:any)=>{e.researchEdition=record.edition;if(e.sourceRefs.some((key:string)=>changedKeys.includes(key))) e.revision+=1;if(e.sourceBinding)e.sourceBinding.sourceSha256=sources.find((s:any)=>s.key===e.sourceBinding.sourceKey).sha256;return e;};
    for(const name of ['records','canonical-documents']) write(next,`research/publication/${name}.yaml`,read(next,`research/publication/${name}.yaml`).map(revise));
    for(const name of ['home','start']) {
      const path=join(next,`research/publication/pages/${name}.md`),raw=readFileSync(path,'utf8');
      const match=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)!;
      writeFileSync(path,`---\n${JSON.stringify(revise(JSON.parse(match[1])),null,2)}\n---\n${match[2]}`);
    }
    const change={changeId,category:'evidence-status',predecessorEdition:predecessor.edition,predecessorSeal:predecessor.inventorySeal,resultEdition:record.edition,resultSeal:record.inventorySeal,sourceChangeRef:'research/RRG_CURRENT/CHANGELOG.md',affectedFiles:changed.map(name=>`research/RRG_CURRENT/${name}`),affectedClaimIds:[],problem:'isolated engineering fixture',before:'preserved supplied bytes in temporary fixture',after:'test annotation in temporary fixture',rationale:'reach the real read-only transaction CLI',permissionBasis:'isolated unit-test scope; no scientific adoption',priorSnapshot:changed.map(name=>({path:`research/RRG_CURRENT/${name}`,sha256:predecessor.files.find((f:{path:string})=>f.path===name).sha256}))};
    const changePath=join(fixture,'change.json');writeFileSync(changePath,JSON.stringify(change));
    const command=[ '--import',resolve('node_modules/tsx/dist/loader.mjs'),resolve('scripts/check-source-revision.ts'),'--prior-root',prior,'--change',changePath,'--evidence-dir',join(fixture,'evidence') ];
    let result=spawnSync(process.execPath,command,{cwd:next,encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);
    const receipt=read(fixture,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`);assert.equal(receipt.reviewOutcome,'pending');assert.ok(receipt.affected.some((e:{entryId:string})=>e.entryId==='DOC-HOME'));
    assert.deepEqual(read(next,'research/publication/reviews.yaml'),[]);
    change.sourceChangeRef='research/RRG_CURRENT/README.md';writeFileSync(changePath,JSON.stringify(change));
    result=spawnSync(process.execPath,command,{cwd:next,encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/SOURCE_REVISION_FAILURE/);
    assert.notEqual(sha256(readFileSync(changePath)),receipt.changeSha256);
    assert.equal(existsSync(join(fixture,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`)),false);
  } finally {rmSync(fixture,{recursive:true,force:true});}
});
