import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync,cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { sha256,stableJSON } from '../../src/lib/identity.js';

test('real revision CLI validates preserved editions and reports pending dependants; it cannot write approvals',()=>{
  const fixture=mkdtempSync(join(tmpdir(),'unity-authoring-control-'));
  const prior=join(fixture,'prior'),next=join(fixture,'next');
  const originalReviews=readFileSync('research/publication/reviews.yaml');
  const read=(root:string,path:string)=>JSON.parse(readFileSync(join(root,path),'utf8'));
  const write=(root:string,path:string,value:unknown)=>writeFileSync(join(root,path),JSON.stringify(value,null,2)+'\n');
  try {
    // Copies remain isolated synthetic engineering controls. Supplied source
    // bytes, real reviews and real admission pins are never edited by this test.
    for(const root of [prior,next]) {
      for(const folder of ['research','src','docs/evidence/m1/literature']) {mkdirSync(join(root,folder,'..'),{recursive:true});cpSync(folder,join(root,folder),{recursive:true});}
      mkdirSync(join(root,'config'));cpSync('config/research-source.json',join(root,'config/research-source.json'));
      for(const file of ['astro.config.mjs','package-lock.json']) cpSync(file,join(root,file));
      write(root,'research/publication/website-reviews.yaml',[]);
      const record=read(root,'config/research-source.json');record.corpusScope='synthetic';write(root,'config/research-source.json',record);
    }
    const predecessor=read(prior,'config/research-source.json'),record=read(next,'config/research-source.json');
    const changeId='SYNTHETIC-ENGINEERING-TRANSACTION';
    const changed=['07_audit_report.md','CHANGELOG.md'];
    for(const name of changed) {
      const path=join(next,'research/RRG_CURRENT',name);
      writeFileSync(path,readFileSync(path,'utf8')+`\n\n${changeId}: isolated test annotation; not a scientific revision or approval.\n`);
    }
    record.edition='Synthetic authoring control, not a research edition';
    record.files=record.files.map((f:{path:string;bytes:number;sha256:string})=>{const raw=readFileSync(join(next,record.directory,f.path));return {...f,bytes:raw.length,sha256:sha256(raw)};});
    record.inventorySeal=sha256(stableJSON(record.files));
    const refreshed=(b:any)=>{const lines=readFileSync(join(next,record.directory,b.path),'utf8').match(/[^\n]*\n|[^\n]+$/g) ?? [];return {...b,sourceSha256:record.files.find((f:any)=>f.path===b.path).sha256,excerptSha256:sha256(lines.slice(b.startLine-1,b.endLine).join(''))};};
    record.bindings=record.bindings.map(refreshed);
    write(next,'config/research-source.json',record);
    const sources=read(next,'research/publication/source-index.yaml');
    const changedKeys=sources.filter((s:{path:string})=>changed.some(name=>s.path===`research/RRG_CURRENT/${name}`)).map((s:{key:string})=>s.key);
    for(const source of sources) if(source.path.startsWith(record.directory+'/')) {source.edition=record.edition;source.sha256=record.files.find((f:{path:string})=>`${record.directory}/${f.path}`===source.path).sha256;}
    write(next,'research/publication/source-index.yaml',sources);
    const revise=(e:any)=>{if(e.publicationState==='archived') return e;e.researchEdition=record.edition;if(e.sourceRefs.some((key:string)=>changedKeys.includes(key))) e.revision+=1;if(e.sourceBinding){const source=sources.find((s:any)=>s.key===e.sourceBinding.sourceKey),path=source.path.replace(record.directory+'/', '');if(source.path.startsWith(record.directory+'/')){const refreshedBinding=refreshed({...e.sourceBinding,path});e.sourceBinding.sourceSha256=refreshedBinding.sourceSha256;e.sourceBinding.excerptSha256=refreshedBinding.excerptSha256;}}return e;};
    for(const name of ['records','canonical-documents']) write(next,`research/publication/${name}.yaml`,read(next,`research/publication/${name}.yaml`).map(revise));
    for(const name of readdirSync(join(next,'research/publication/pages')).filter(name=>name.endsWith('.md'))) {
      const path=join(next,`research/publication/pages/${name}`),raw=readFileSync(path,'utf8');
      const match=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)!;
      writeFileSync(path,`---\n${JSON.stringify(revise(JSON.parse(match[1])),null,2)}\n---\n${match[2]}`);
    }
    const change={changeId,category:'evidence-status',predecessorEdition:predecessor.edition,predecessorSeal:predecessor.inventorySeal,resultEdition:record.edition,resultSeal:record.inventorySeal,sourceChangeRef:'research/RRG_CURRENT/CHANGELOG.md',affectedFiles:changed.map(name=>`research/RRG_CURRENT/${name}`),affectedClaimIds:[],problem:'isolated engineering fixture',before:'preserved supplied bytes in temporary fixture',after:'test annotation in temporary fixture',rationale:'reach the real read-only transaction CLI',permissionBasis:'isolated unit-test scope; no scientific adoption',priorSnapshot:changed.map(name=>({path:`research/RRG_CURRENT/${name}`,sha256:predecessor.files.find((f:{path:string})=>f.path===name).sha256}))};
    const changePath=join(fixture,'change.json');writeFileSync(changePath,JSON.stringify(change));
    const command=[ '--import',resolve('node_modules/tsx/dist/loader.mjs'),resolve('scripts/check-source-revision.ts'),'--prior-root',prior,'--change',changePath,'--evidence-dir',join(fixture,'evidence') ];
    let result=spawnSync(process.execPath,command,{cwd:next,encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);
    const receipt=read(fixture,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`);assert.equal(receipt.reviewOutcome,'pending');assert.ok(receipt.affected.some((e:{entryId:string})=>e.entryId==='DOC-HOME'));
    assert.deepEqual(readFileSync(join(next,'research/publication/reviews.yaml')),originalReviews);
    change.sourceChangeRef='research/RRG_CURRENT/README.md';writeFileSync(changePath,JSON.stringify(change));
    result=spawnSync(process.execPath,command,{cwd:next,encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/SOURCE_REVISION_FAILURE/);
    assert.notEqual(sha256(readFileSync(changePath)),receipt.changeSha256);
    assert.equal(existsSync(join(fixture,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`)),false);
    // Reach the core gate through the actual CLI on byte-verified temporary
    // editions, including a category relabel and an invented prior quote.
    const corePath=join(next,'research/RRG_CURRENT/00_LOCKED_CORE.md');
    writeFileSync(corePath,readFileSync(corePath,'utf8')+'\nSynthetic core-change control; no actual source authoring.\n');
    record.coreSha256=sha256(readFileSync(corePath));
    const manifestPath=join(next,'research/RRG_CURRENT/CURRENT_MANIFEST.md');
    writeFileSync(manifestPath,readFileSync(manifestPath,'utf8').replace(predecessor.coreSha256,record.coreSha256)+`\nSynthetic revised core hash: ${record.coreSha256}\n`);
    record.manifestSha256=sha256(readFileSync(manifestPath));
    record.priorCoreSha256=predecessor.coreSha256;
    record.revision={category:'wording',predecessor:predecessor.edition,problem:'synthetic CLI gate control',before:'preserved fixture bytes',after:'isolated appended annotation',rationale:'exercise explicit revision validation',permissionBasis:'isolated engineering test only',dependentReviewHashes:[sha256('not a scientific approval')]};
    record.files=record.files.map((f:any)=>{const raw=readFileSync(join(next,record.directory,f.path));return {...f,bytes:raw.length,sha256:sha256(raw)};});
    record.inventorySeal=sha256(stableJSON(record.files));
    record.bindings=record.bindings.map(refreshed);
    write(next,'config/research-source.json',record);
    for(const source of sources) if(source.path.startsWith(record.directory+'/')) source.sha256=record.files.find((f:any)=>`${record.directory}/${f.path}`===source.path).sha256;
    write(next,'research/publication/source-index.yaml',sources);
    const reviseCore=(e:any)=>{if(e.sourceRefs.includes('R-CURRENT-CORE')) e.revision+=1;if(e.sourceBinding){const source=sources.find((s:any)=>s.key===e.sourceBinding.sourceKey),path=source.path.replace(record.directory+'/', '');if(source.path.startsWith(record.directory+'/')){const refreshedBinding=refreshed({...e.sourceBinding,path});e.sourceBinding.sourceSha256=refreshedBinding.sourceSha256;e.sourceBinding.excerptSha256=refreshedBinding.excerptSha256;}}return e;};
    for(const name of ['records','canonical-documents']) write(next,`research/publication/${name}.yaml`,read(next,`research/publication/${name}.yaml`).map(reviseCore));
    for(const name of readdirSync(join(next,'research/publication/pages')).filter(name=>name.endsWith('.md'))) {
      const path=join(next,`research/publication/pages/${name}`),match=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(readFileSync(path,'utf8'))!;
      writeFileSync(path,`---\n${JSON.stringify(reviseCore(JSON.parse(match[1])))}\n---\n${match[2]}`);
    }
    change.sourceChangeRef='research/RRG_CURRENT/CHANGELOG.md';change.category='wording';change.resultSeal=record.inventorySeal;
    change.affectedFiles=[...changed,'00_LOCKED_CORE.md','CURRENT_MANIFEST.md'].map(name=>`research/RRG_CURRENT/${name}`);
    change.priorSnapshot=change.affectedFiles.map(path=>({path,sha256:predecessor.files.find((f:any)=>`${record.directory}/${f.path}`===path).sha256}));
    const coreInvoke=(proofGate?:unknown)=>{writeFileSync(changePath,JSON.stringify({...change,...(proofGate?{proofGate}:{})}));return spawnSync(process.execPath,command,{cwd:next,encoding:'utf8'});};
    result=coreInvoke();assert.notEqual(result.status,0);assert.match(result.stderr,/CORE_PROOF_GATE_REQUIRED/);
    const proofGate={lockedStatement:'A fabricated statement absent from the prior core.',counterexample:'synthetic fixture',evidence:'synthetic fixture',extensionInsufficient:'synthetic fixture',minimalWording:'synthetic fixture',impactAnalysis:'synthetic fixture',versionDecision:'synthetic fixture; no scientific decision'};
    result=coreInvoke(proofGate);assert.notEqual(result.status,0);assert.match(result.stderr,/CORE_PROOF_GATE_REQUIRED/);
    result=coreInvoke({...proofGate,lockedStatement:'Geometry is not limited to visible Euclidean shape.'});assert.equal(result.status,0,result.stdout+result.stderr);
    assert.equal(read(fixture,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`).reviewOutcome,'pending');
    assert.deepEqual(readFileSync(join(next,'research/publication/reviews.yaml')),originalReviews);
  } finally {rmSync(fixture,{recursive:true,force:true});}
});
