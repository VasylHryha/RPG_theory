import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,renameSync,rmSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {sha256,stableJSON} from '../../src/lib/identity.js';

for(const member of ['07_audit_report.md','00_LOCKED_CORE.md','foundations/ERRATA.md']) test(`real revision CLI accounts for both rename paths without inventing a core-byte change: ${member}`,()=>{
 const temp=mkdtempSync(join(tmpdir(),'unity-revision-rename-'));
 const prior=join(temp,'prior'),next=join(temp,'next');
 const originalReviews=readFileSync('research/publication/reviews.yaml');
 const read=(root:string,path:string)=>JSON.parse(readFileSync(join(root,path),'utf8'));
 const write=(root:string,path:string,value:unknown)=>writeFileSync(join(root,path),JSON.stringify(value,null,2)+'\n');
 try {
  for(const root of [prior,next]) {
   for(const folder of ['research','src','config','docs/evidence/m1/literature']) {mkdirSync(join(root,folder,'..'),{recursive:true});cpSync(folder,join(root,folder),{recursive:true});}
   for(const file of ['astro.config.mjs','package-lock.json']) cpSync(file,join(root,file));
   write(root,'research/publication/website-reviews.yaml',[]);
   const record=read(root,'config/research-source.json');record.corpusScope='synthetic';write(root,'config/research-source.json',record);
  }
  const old=read(prior,'config/research-source.json'),record=read(next,'config/research-source.json');
  const destination=member.replace(/([^/]+)$/,'renamed-$1'),changeId='SYNTHETIC-RENAME-CONTROL';
  renameSync(join(next,record.directory,member),join(next,record.directory,destination));
  const manifest=join(next,record.directory,record.manifestPath);
  writeFileSync(manifest,readFileSync(manifest,'utf8').replaceAll(member,destination));
  const changelog=join(next,record.directory,'CHANGELOG.md');writeFileSync(changelog,readFileSync(changelog,'utf8')+`\n${changeId}: synthetic path-rename test only.\n`);
  record.edition='Synthetic rename control';
  if(record.corePath===member) record.corePath=destination;
  record.manifestMembers=record.manifestMembers.map((p:string)=>p===member?destination:p);
  record.inspection.inspectedFiles=record.inspection.inspectedFiles.map((p:string)=>p===member?destination:p);
  record.files=record.files.map((f:any)=>{const path=f.path===member?destination:f.path,raw=readFileSync(join(next,record.directory,path));return {...f,path,bytes:raw.length,sha256:sha256(raw)};}).sort((a:any,b:any)=>a.path.localeCompare(b.path));
  record.manifestSha256=sha256(readFileSync(manifest));record.inventorySeal=sha256(stableJSON(record.files));
  record.bindings=record.bindings.map((b:any)=>{
   const path=b.path===member?destination:b.path,raw=readFileSync(join(next,record.directory,path));
   const lines=raw.toString('utf8').match(/[^\n]*\n|[^\n]+$/g)??[];
   return {...b,path,sourceSha256:sha256(raw),excerptSha256:sha256(lines.slice(b.startLine-1,b.endLine).join(''))};
  });
  write(next,'config/research-source.json',record);
  const sources=read(next,'research/publication/source-index.yaml');
  const changedKeys:string[]=[];
  for(const source of sources) if(source.path.startsWith(record.directory+'/')) {
   const name=source.path.slice(record.directory.length+1),path=name===member?destination:name;
   const file=record.files.find((f:any)=>f.path===path)!;
   if(path!==name || source.sha256!==file.sha256) changedKeys.push(source.key);
   source.path=`${record.directory}/${path}`;source.sha256=file.sha256;source.edition=record.edition;
  }
  write(next,'research/publication/source-index.yaml',sources);
  const revise=(e:any)=>{
   if(e.publicationState==='archived') return e;e.researchEdition=record.edition;if(e.sourceRefs.some((k:string)=>changedKeys.includes(k))) e.revision++;
   if(e.sourceBinding){const source=sources.find((s:any)=>s.key===e.sourceBinding.sourceKey),raw=readFileSync(join(next,source.path)),lines=raw.toString('utf8').match(/[^\n]*\n|[^\n]+$/g)??[];e.sourceBinding.sourceSha256=sha256(raw);e.sourceBinding.excerptSha256=sha256(lines.slice(e.sourceBinding.startLine-1,e.sourceBinding.endLine).join(''));}
   return e;
  };
  for(const name of ['records','canonical-documents']) write(next,`research/publication/${name}.yaml`,read(next,`research/publication/${name}.yaml`).map(revise));
  for(const name of readdirSync(join(next,'research/publication/pages')).filter(name=>name.endsWith('.md'))) {
   const path=join(next,`research/publication/pages/${name}`),match=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(readFileSync(path,'utf8'))!;
   writeFileSync(path,`---\n${JSON.stringify(revise(JSON.parse(match[1])))}\n---\n${match[2]}`);
  }
  // Supporting directories are listed as directories, so renaming an erratum
  // does not change the manifest bytes. Account only for the actual transition.
  const predecessorFiles=member.startsWith('foundations/')?[member,'CHANGELOG.md']:[member,'CURRENT_MANIFEST.md','CHANGELOG.md'];
  const change={changeId,category:'format',predecessorEdition:old.edition,predecessorSeal:old.inventorySeal,resultEdition:record.edition,resultSeal:record.inventorySeal,sourceChangeRef:`${record.directory}/CHANGELOG.md`,affectedFiles:[...predecessorFiles,destination].map(p=>`${record.directory}/${p}`),affectedClaimIds:[],problem:'isolated rename accounting',before:member,after:destination,rationale:'exercise current source inventory transitions',permissionBasis:'synthetic engineering test only',priorSnapshot:predecessorFiles.map(path=>({path:`${record.directory}/${path}`,sha256:old.files.find((f:any)=>f.path===path)!.sha256}))};
  const changePath=join(temp,'change.json');
  const invoke=(value:unknown)=>{writeFileSync(changePath,JSON.stringify(value));return spawnSync(process.execPath,['--import',resolve('node_modules/tsx/dist/loader.mjs'),resolve('scripts/check-source-revision.ts'),'--prior-root',prior,'--change',changePath,'--evidence-dir',join(temp,'evidence')],{cwd:next,encoding:'utf8'});};
  let result=invoke(change);assert.equal(result.status,0,result.stdout+result.stderr);
  const receipt=read(temp,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`);assert.equal(receipt.reviewOutcome,'pending');assert.ok(receipt.affected.some((e:any)=>e.entryId===(member.startsWith('foundations/')?'DOC-FOUNDATION-ERRATA':'DOC-HOME')));assert.deepEqual(readFileSync(join(next,'research/publication/reviews.yaml')),originalReviews);
  // Neither old-only nor new-only accounting can hide a path transition.
  for(const omit of [member,destination]) {
   result=invoke({...change,affectedFiles:change.affectedFiles.filter(p=>p!==`${record.directory}/${omit}`)});
   assert.notEqual(result.status,0);assert.match(result.stderr,/SOURCE_REVISION_FAILURE/);
   assert.equal(existsSync(join(temp,`evidence/source-revision-${sha256(readFileSync(changePath))}.json`)),false);
  }
 } finally {rmSync(temp,{recursive:true,force:true});}
});
