import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {loadCanonicalCorpus,reviewFingerprint} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState} from '../../../../src/lib/website-review.js';
import {filesIn} from '../../../../src/lib/source-admission.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/qf1011-separate-review';
const prior='docs/evidence/m1/acceptance-quality-recheck';
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const before=json(`${folder}/independent-engineering.json`),c=loadCanonicalCorpus();
const snapshots=json('docs/evidence/m1/separate-requalification-review/independent-read-snapshots.json');
assert.equal(c.rendererSha256,before.renderer);assert.equal(c.entries.size,34);assert.equal(c.admission.currentSourceQualified,true);
const representations=[...c.entries.values()].map(e=>{
 assert.deepEqual(websiteReviewInputs(c,e.id),snapshots.representations.find((r:any)=>r.id===e.id).inputs);
 const r=c.websiteReviews.find(r=>r.entryId===e.id)!;
 assert.equal(websiteReviewState(c,e.id),'accepted');assert.equal(e.publicationState,'draft');
 assert.equal(r.fingerprint,reviewFingerprint(c,e.id));assert.equal(sha256(readFileSync(r.evidenceRef)),r.evidenceSha256);
 return {id:e.id,fingerprint:r.fingerprint,receiptSha256:r.evidenceSha256,detachedInputs:'unchanged',state:'accepted'};
});
const verification=json(`${folder}/verification.json`);assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);assert.ok(verification.receipts.every((r:any)=>r.exitCode===0));assert.deepEqual(verification.notRun,[]);
const log=readFileSync(`${folder}/verification.log`,'utf8').replace(/\x1b\[[0-9;]*m/g,'');
const cases=[...log.matchAll(/^✔ (.+?) \([\d.]+ms\)$/gm)].map(m=>m[1]);assert.equal(cases.length,80);assert.equal(new Set(cases).size,80);assert.match(log,/ℹ fail 0/);
const originalTests=readFileSync(`${folder}/prior/tests/content/contracts.test.ts`,'utf8');
assert.ok(readFileSync('tests/content/contracts.test.ts','utf8').startsWith(originalTests));
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-qf1011-separate-review/preview-${base}`,a=auditOutput(directory);
 assert.deepEqual(a,json(`${folder}/${base}-artifact.json`));
 const old=json(`${prior}/${base}-artifact.json`);
 assert.deepEqual(a.files.filter(f=>f.path!=='build-info.json'),old.files.filter((f:any)=>f.path!=='build-info.json'));
 const browser=json(`${folder}/${base}-browser.json`);assert.equal(browser.stats.expected,7);for(const key of ['unexpected','skipped','flaky'])assert.equal(browser.stats[key],0);
 const info=json(`${directory}/build-info.json`);assert.equal(info.deployEligible,false);assert.equal(info.currentSourceQualified,true);
 assert.equal(info.inputsSha256,buildInputs().inputsSha256);
 return {directory,artifactSha256:a.artifactSha256,files:a.files.length,html:a.files.filter(f=>f.path.endsWith('.html')).length,chromium:7,nonBuildInfoBytes:'all 100 unchanged from §§0.20–0.21'};
});
const retained=[...before.retained,...before.artifacts].map((a:any)=>{
 const inventory=filesIn(a.directory).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 assert.equal(sha256(stableJSON(inventory)),a.artifactSha256);return {directory:a.directory,artifactSha256:a.artifactSha256,unchanged:true};
});
// Each probe starts from a currently bound untouched artifact, so refusal is
// attributable to its intended control rather than a stale build-info identity.
const mutations:[string,string,(s:string)=>string,string][]=[
 ['false-social-description','index.html',s=>s.replace(/(<meta property="og:description" content=")[^"]*/, '$1False proof'),'CONTENT_METADATA_PARITY_FAILURE'],
 ['false-visible-description','claims/UT-E01/index.html',s=>s.replace(/(<p class="article-lede">)[\s\S]*?(<\/p>)/,'$1False proof$2'),'CONTENT_METADATA_PARITY_FAILURE'],
 ['remote-srcset','index.html',s=>s.replace('</body>','<img src="/favicon.svg" srcset="https://remote.invalid/tracker.png 2x" alt="Control"></body>'),'UNSAFE_OUTPUT_URL'],
 ['remote-media','index.html',s=>s.replace('</body>','<video src="https://remote.invalid/tracker.mp4"></video></body>'),'UNSAFE_OUTPUT_URL'],
 ['remote-style-import','_astro/control.css',()=> '@import "https://remote.invalid/tracker.css";','UNSAFE_OUTPUT_CSS'],
 ['remote-inline-style','index.html',s=>s.replace('</body>','<p style="background-image:url(https://remote.invalid/tracker.png)">Control</p></body>'),'UNSAFE_OUTPUT_URL'],
 ['unsafe-refresh','index.html',s=>s.replace('</head>','<meta http-equiv="refresh" content="0;url=https://remote.invalid/"></head>'),'ACTIVE_OUTPUT'],
 ...before.additionalProbes.map((p:any)=>[p.name,'index.html',(s:string)=>s.replace('</body>',p.markup+'</body>'),'UNSAFE_OUTPUT_URL'] as [string,string,(s:string)=>string,string]),
 ['standalone-svg-filter','favicon.svg',()=>'<svg xmlns="http://www.w3.org/2000/svg"><rect filter="url(https://remote.invalid/filter.svg#x)"/></svg>','UNSAFE_OUTPUT_URL']
];
const probes=artifacts.flatMap(a=>mutations.map(([name,file,mutate,expected])=>{
 const copy=mkdtempSync(join(tmpdir(),'unity-repaired-probe-'));cpSync(a.directory,copy,{recursive:true});
 try{
 assert.equal(auditOutput(copy).status,'PASS');const path=join(copy,file),raw=existsSync(path)?readFileSync(path,'utf8'):'';
 const changed=mutate(raw);assert.notEqual(changed,raw);writeFileSync(path,changed);
 let code='ADMITTED';try{auditOutput(copy);}catch(e){code=(e as any).code;}assert.equal(code,expected);
 return {base:a.directory.endsWith('root')?'/':'/unity-theory/',name,untouchedCopy:'PASS',result:'REFUSED',code};
 }finally{rmSync(copy,{recursive:true,force:true});}
}));
const refusals=['qualification','release'].map(mode=>{
 const output=`dist/m1-qf1011-separate-review/refused-${mode}`;assert.equal(existsSync(output),false);
 const r=spawnSync(process.execPath,['--import','tsx','scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
 writeFileSync(`${folder}/${mode}-refusal.log`,r.stdout+r.stderr);assert.equal(r.status,1);assert.match(r.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
 return {mode,exitCode:1,reason:'CURRENT_SOURCE_NOT_QUALIFIED',publishedSelection:'empty',outputCreated:false};
});
const result={status:'PASS',baselineHead:json(`${folder}/baseline.json`).head,productionInputs:buildInputs(),preReviewProductionInputs:before.productionInputs,renderer:c.rendererSha256,representationPolicy:'unchanged',representations,reviewStates:{accepted:34,pending:0,stale:0,rejected:0},currentSourceQualified:true,predecessorContracts:79,predecessorGroupedControls:{negative:37,positive:5,groups:3},contracts:80,newGroupedControls:{negative:28,positive:2,groups:1},chromium:14,commands:11,artifacts,retained,probes,refusals,acceptance:'QF-10 and enumerated unchanged QF-11 predecessor controls only',newRepair:'QF-12 SVG presentation URL and XML rebasing; REVIEW_READY, unaccepted',newFidelityDecisions:'NONE',m1:'REVIEW_READY for QF-12; predecessor acceptance preserved',m2:'NOT_STARTED',historicalScientificAccounting:{accepted:19,pending:15},scientificAdjudication:'DEFERRED',publicActions:'NOT_RUN',grade:'NOT_ASSIGNED'};
writeFileSync(`${folder}/final-checks.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,productionInputs:result.productionInputs,artifacts,retained:retained.length,probes:probes.length,contracts:80,chromium:14}));
