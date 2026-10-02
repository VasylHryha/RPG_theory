import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {loadCanonicalCorpus,reviewFingerprint} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState} from '../../../../src/lib/website-review.js';
import {filesIn} from '../../../../src/lib/source-admission.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/audit-normalization-recheck',previous='docs/evidence/m1/qf1011-separate-review';
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const old=json(`${previous}/final-checks.json`),c=loadCanonicalCorpus(),reads=json('docs/evidence/m1/separate-requalification-review/independent-read-snapshots.json');
assert.equal(c.rendererSha256,old.renderer);assert.equal(c.admission.currentSourceQualified,true);assert.equal(c.entries.size,34);
const representations=[...c.entries.values()].map(e=>{
 assert.deepEqual(websiteReviewInputs(c,e.id),reads.representations.find((r:any)=>r.id===e.id).inputs);
 const r=c.websiteReviews.find(r=>r.entryId===e.id)!;assert.equal(r.fingerprint,reviewFingerprint(c,e.id));assert.equal(sha256(readFileSync(r.evidenceRef)),r.evidenceSha256);
 assert.equal(websiteReviewState(c,e.id),'accepted');assert.equal(e.publicationState,'draft');
 return {id:e.id,fingerprint:r.fingerprint,receiptSha256:r.evidenceSha256,detachedInputs:'unchanged',state:'accepted'};
});
const inputs=buildInputs();assert.notEqual(inputs.inputsSha256,old.productionInputs.inputsSha256);
assert.equal(inputs.contentSha256,old.productionInputs.contentSha256);assert.equal(inputs.lockfileSha256,old.productionInputs.lockfileSha256);
const verification=json(`${folder}/verification.json`);assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);assert.ok(verification.receipts.every((r:any)=>r.exitCode===0));assert.deepEqual(verification.notRun,[]);
const caseNames=(p:string)=>[...readFileSync(p,'utf8').replace(/\x1b\[[0-9;]*m/g,'').matchAll(/^✔ (.+?) \([\d.]+ms\)$/gm)].map(m=>m[1]);
const cases=caseNames(`${folder}/verification.log`),priorCases=caseNames(`${previous}/verification.log`);assert.equal(cases.length,82);assert.equal(new Set(cases).size,82);assert.equal(priorCases.length,80);assert.ok(priorCases.every(name=>cases.includes(name)));
assert.ok(readFileSync('tests/content/contracts.test.ts','utf8').startsWith(readFileSync(`${folder}/prior/tests/content/contracts.test.ts`,'utf8')));
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-audit-normalization-recheck/preview-${base}`,audit=auditOutput(directory);assert.deepEqual(audit,json(`${folder}/${base}-artifact.json`));
 assert.deepEqual(audit.files.filter(f=>f.path!=='build-info.json'),json(`${previous}/${base}-artifact.json`).files.filter((f:any)=>f.path!=='build-info.json'));
 const browser=json(`${folder}/${base}-browser.json`);assert.equal(browser.stats.expected,7);for(const key of ['unexpected','skipped','flaky'])assert.equal(browser.stats[key],0);
 const info=json(`${directory}/build-info.json`);assert.equal(info.inputsSha256,inputs.inputsSha256);assert.equal(info.deployEligible,false);assert.equal(info.currentSourceQualified,true);
 return {directory,artifactSha256:audit.artifactSha256,files:audit.files.length,html:audit.files.filter(f=>f.path.endsWith('.html')).length,chromium:7,nonBuildInfoBytes:'all 100 unchanged'};
});
const retained=[...old.artifacts,...old.retained].map((a:any)=>{
 const inventory=filesIn(a.directory).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});assert.equal(sha256(stableJSON(inventory)),a.artifactSha256);return {directory:a.directory,artifactSha256:a.artifactSha256,unchanged:true};
});
const font=readFileSync('node_modules/katex/dist/fonts/KaTeX_SansSerif-Regular.woff2').toString('base64'),forged=font.slice(0,20)+'/*forged*/'+font.slice(20);
const add=(markup:string)=>(s:string)=>s.replace('</body>',markup+'</body>');
const mutations:[string,string,(s:string)=>string,string][]=[
 ['false-social-description','index.html',s=>s.replace(/(<meta property="og:description" content=")[^"]*/, '$1False proof'),'CONTENT_METADATA_PARITY_FAILURE'],
 ['false-visible-description','claims/UT-E01/index.html',s=>s.replace(/(<p class="article-lede">)[\s\S]*?(<\/p>)/,'$1False proof$2'),'CONTENT_METADATA_PARITY_FAILURE'],
 ['remote-srcset','index.html',add('<img src="favicon.svg" srcset="https://remote.invalid/tracker.png 2x" alt="Control">'),'UNSAFE_OUTPUT_URL'],
 ['remote-media','index.html',add('<video src="https://remote.invalid/tracker.mp4"></video>'),'UNSAFE_OUTPUT_URL'],
 ['remote-style-import','_astro/control.css',()=> '@import "https://remote.invalid/tracker.css";','UNSAFE_OUTPUT_CSS'],
 ['remote-inline-style','index.html',add('<p style="background:url(https://remote.invalid/tracker.png)">Control</p>'),'UNSAFE_OUTPUT_URL'],
 ['unsafe-refresh','index.html',s=>s.replace('</head>','<meta http-equiv="refresh" content="0;url=https://remote.invalid/"></head>'),'ACTIVE_OUTPUT'],
 ...['filter','cursor','fill'].map(attribute=>[`inline-svg-${attribute}`,'index.html',add(`<svg><rect ${attribute}="url(https://remote.invalid/resource.svg#x)"/></svg>`),'UNSAFE_OUTPUT_URL'] as [string,string,(s:string)=>string,string]),
 ['standalone-svg-filter','favicon.svg',()=>'<svg xmlns="http://www.w3.org/2000/svg"><rect filter="url(https://remote.invalid/filter.svg#x)"/></svg>','UNSAFE_OUTPUT_URL'],
 ['svg-stylesheet-pi','favicon.svg',s=>'<?xml-stylesheet type="text/css" href="https://remote.invalid/theme.css"?>'+s,'UNSAFE_SVG'],
 ['forged-font-comments','_astro/control.css',()=>`@font-face{src:url("data:font/woff2;base64,${forged}")}`,'UNSAFE_OUTPUT_URL'],
 ['quoted-url-comments','_astro/control.css',()=> 'p{background:url("../favicon.svg/*literal*/")}','BROKEN_OUTPUT_LINK'],
 ['escaped-quote-url','_astro/control.css',()=>String.raw`p{background:url("../favicon.svg\")")}`,'BROKEN_OUTPUT_LINK']
];
const probes=artifacts.flatMap(a=>mutations.map(([name,file,mutate,expected])=>{
 const copy=mkdtempSync(join(tmpdir(),'unity-audit-recheck-'));cpSync(a.directory,copy,{recursive:true});
 try{assert.equal(auditOutput(copy).status,'PASS');const path=join(copy,file),raw=existsSync(path)?readFileSync(path,'utf8'):'';
 const changed=mutate(raw);assert.notEqual(changed,raw);writeFileSync(path,changed);let code='ADMITTED';try{auditOutput(copy);}catch(e){code=(e as any).code;}assert.equal(code,expected);
 return {base:a.directory.endsWith('root')?'/':'/unity-theory/',name,untouchedCopy:'PASS',outcome:'REFUSED',code};
 }finally{rmSync(copy,{recursive:true,force:true});}
}));
const refusals=['qualification','release'].map(mode=>{
 const output=`dist/m1-audit-normalization-recheck/refused-${mode}`;assert.equal(existsSync(output),false);
 const r=spawnSync(process.execPath,['--import','tsx','scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});writeFileSync(`${folder}/${mode}-refusal.log`,r.stdout+r.stderr);
 assert.equal(r.status,1);assert.match(r.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);return {mode,exitCode:1,reason:'CURRENT_SOURCE_NOT_QUALIFIED',publishedSelection:'empty',outputCreated:false};
});
const result={status:'PASS',baselineHead:json(`${folder}/baseline.json`).head,productionInputs:inputs,predecessorProductionInputs:old.productionInputs,renderer:c.rendererSha256,representationPolicy:'unchanged',representations,reviewStates:{accepted:34,pending:0,stale:0,rejected:0},currentSourceQualified:true,contracts:82,newGroupedControls:{groups:2,negative:17,positive:7},commands:11,chromium:14,artifacts,retained,probes,refusals,newFidelityDecisions:'NONE',repairs:'QF-13 CSS token semantics and QF-14 SVG processing instructions: REVIEW_READY, unaccepted',predecessorRepair:'QF-12 still unaccepted',m1:'REVIEW_READY',m2:'NOT_STARTED',historicalScientificAccounting:{accepted:19,pending:15},scientificAdjudication:'DEFERRED',publicActions:'NOT_RUN',grade:'NOT_ASSIGNED'};
writeFileSync(`${folder}/final-checks.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:'PASS',productionInputs:inputs,contracts:82,chromium:14,artifacts,retained:retained.length,probes:probes.length}));
