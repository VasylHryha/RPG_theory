import {cpSync,mkdtempSync,readFileSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadCanonicalCorpus} from '../../../../src/lib/content.js';
import {validateSourceRevision} from '../../../../src/lib/source-revision.js';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {sha256} from '../../../../src/lib/identity.js';
const results:unknown[]=[];
const temp=mkdtempSync(join(tmpdir(),'unity-recheck-probes-'));
try {
 for(const folder of ['research','src','config','docs/evidence/m1/literature']) {mkdirSync(join(temp,folder,'..'),{recursive:true});cpSync(folder,join(temp,folder),{recursive:true});}
 for(const file of ['astro.config.mjs','package-lock.json']) cpSync(file,join(temp,file));
 const path=join(temp,'research/publication/references.yaml');
 writeFileSync(path,readFileSync(path,'utf8').replaceAll('PAJ296.pdf','paj296.pdf'));
 const aliased=loadCanonicalCorpus(temp);
 results.push({probe:'case-sensitive citation destination changed',unexpectedlyAccepted:aliased.references.get('BIB-0023')!.url.endsWith('paj296.pdf'),scope:'isolated actual-registry copy; no URL retrieval or scientific support qualification'});
 for(const base of ['root','subpath']) {
 const out=join(temp,'artifact-'+base);cpSync('dist/m1-review/preview-'+base,out,{recursive:true});
 const home=join(out,'index.html');writeFileSync(home,readFileSync(home,'utf8').replace(/<h1 id="research-question">[\s\S]*?<\/h1>/,'<h1 id="research-question">All fundamental interactions are proved.</h1>'));
 results.push({probe:'false home heading in actual '+base+' artifact',unexpectedlyAccepted:auditOutput(out).status==='PASS'});
 }
 const prior=loadCanonicalCorpus(),next=loadCanonicalCorpus();
 const old=prior.sources.get('R-CURRENT-STATUS')!,replacement=next.sources.get(old.key)!;
 const oldPath=old.path;replacement.path=old.path.replace('04_status_and_blockers.md','renamed-status.md');
 next.admission.edition='isolated rename control';next.admission.inventorySeal=sha256('isolated rename seal');
 for(const e of next.entries.values()) if(e.sourceRefs.includes(old.key)) e.revision++;
 const change={changeId:'isolated-rename',category:'format',predecessorEdition:prior.admission.edition,predecessorSeal:prior.admission.inventorySeal,resultEdition:next.admission.edition,resultSeal:next.admission.inventorySeal,sourceChangeRef:'isolated test',affectedFiles:[oldPath],affectedClaimIds:[],problem:'rename accounting',before:oldPath,after:replacement.path,rationale:'isolated control',permissionBasis:'engineering only',priorSnapshot:[{path:oldPath,raw:readFileSync(oldPath),sha256:old.sha256}]};
 results.push({probe:'renamed source destination omitted',unexpectedlyAccepted:validateSourceRevision(change,prior,next).reviewOutcome==='pending',scope:'temporary corpus maps; actual byte-verified CLI regression added with repair'});
 try {validateSourceRevision({...change,affectedFiles:[oldPath,replacement.path]},prior,next);results.push({probe:'complete rename transaction',accepted:true});} catch(error) {results.push({probe:'complete rename transaction',unexpectedlyRefused:String(error)});}
 writeFileSync('docs/evidence/m1/review-recheck/pre-repair-probes.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
} finally {rmSync(temp,{recursive:true,force:true});}
