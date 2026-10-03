import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,rmSync,symlinkSync } from 'node:fs';
import { join,resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { load } from 'cheerio';

test('real home/start emit withdrawal tombstones through the shared consumer and output auditor',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-page-lifecycle-'));
 try {
  for(const folder of ['src','scripts','research','public','config','.github','docs/evidence/m1/literature']) {
   mkdirSync(join(root,folder,'..'),{recursive:true});cpSync(folder,join(root,folder),{recursive:true});
  }
  writeFileSync(join(root,'research/publication/website-reviews.yaml'),'[]');
  for(const file of ['package.json','package-lock.json','astro.config.mjs','tsconfig.json','.node-version','.npmrc']) cpSync(file,join(root,file));
  symlinkSync(resolve('node_modules'),join(root,'node_modules'),'dir');
  const intakePath=join(root,'config/research-source.json'),intake=JSON.parse(readFileSync(intakePath,'utf8'));intake.corpusScope='synthetic';writeFileSync(intakePath,JSON.stringify(intake));
  // First exercise the live nonhistorical branch using a published preview
  // fixture. Preview labels reflect metadata without claiming qualification.
  for(const id of ['home','start']) {
   const path=join(root,`research/publication/pages/${id}.md`),match=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(readFileSync(path,'utf8'))!;
   const entry=JSON.parse(match[1]);Object.assign(entry,{publicationState:'published',publishedAt:'2026-10-01',title:`Synthetic ${id} heading & exact <metadata>`});
   writeFileSync(path,`---\n${JSON.stringify(entry)}\n---\n${match[2]}`);
  }
  const invoke=(script:string,args:string[])=>spawnSync(process.execPath,['--import',resolve('node_modules/tsx/dist/loader.mjs'),resolve(script),...args],{cwd:root,encoding:'utf8',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1',UNITY_EVIDENCE_DIR:join(root,'evidence')}});
  let result=invoke('scripts/build.ts',['--mode','preview','--output','dist/published-control']);assert.equal(result.status,0,result.stdout+result.stderr);
  result=invoke('scripts/audit-output.ts',['--dir','dist/published-control']);assert.equal(result.status,0,result.stdout+result.stderr);
  for(const [file,id,name] of [['index.html','DOC-HOME','home'],['start/index.html','DOC-START','start']]) {
   const $=load(readFileSync(join(root,'dist/published-control',file),'utf8'));
   assert.equal($('h1').text().replace(/\s+/g,' ').trim(),`Synthetic ${name} heading & exact <metadata>`);
   assert.equal($(`[data-editorial-state="${id}"]`).text(),'Publication: published. Source fidelity: Pending.');
  }
  const publishedInfo=JSON.parse(readFileSync(join(root,'dist/published-control/build-info.json'),'utf8'));assert.equal(publishedInfo.currentSourceQualified,false);assert.equal(publishedInfo.deployEligible,false);
  for(const id of ['home','start']) {
   const path=join(root,`research/publication/pages/${id}.md`),raw=readFileSync(path,'utf8'),match=/^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)!;
   const entry=JSON.parse(match[1]);Object.assign(entry,{publicationState:'withdrawn',publishedAt:'2026-10-01',correctionRef:'SYNTHETIC-LIFECYCLE-CONTROL',withdrawalReason:'Synthetic engineering control; no actual scientific withdrawal occurred.',title:'OLD_TITLE_SENTINEL',description:'OLD_DESCRIPTION_SENTINEL'});
   writeFileSync(path,`---\n${JSON.stringify(entry)}\n---\nOLD_BODY_SENTINEL\n`);
  }
  result=invoke('scripts/build.ts',['--mode','preview','--output','dist/control']);assert.equal(result.status,0,result.stdout+result.stderr);
  result=invoke('scripts/audit-output.ts',['--dir','dist/control']);assert.equal(result.status,0,result.stdout+result.stderr);
  const info=JSON.parse(readFileSync(join(root,'dist/control/build-info.json'),'utf8'));assert.equal(info.sourceIntake.corpusScope,'synthetic');assert.equal(info.currentSourceQualified,false);assert.equal(info.deployEligible,false);
  for(const [file,id] of [['index.html','DOC-HOME'],['start/index.html','DOC-START']]) {
   const raw=readFileSync(join(root,'dist/control',file),'utf8'),$=load(raw);
   assert.equal($('h1').text(),`${id} — withdrawn record`);assert.equal($(`[data-record-details="${id}"]`).length,1);
   assert.doesNotMatch(raw,/OLD_(?:TITLE|DESCRIPTION|BODY)_SENTINEL/);
   assert.doesNotMatch(raw,/How does a collection|Start with the idea/);
  }
 } finally {rmSync(root,{recursive:true,force:true});}
});
