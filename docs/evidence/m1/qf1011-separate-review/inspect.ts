import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {loadCanonicalCorpus,reviewFingerprint} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState} from '../../../../src/lib/website-review.js';
import {filesIn} from '../../../../src/lib/source-admission.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/qf1011-separate-review';
const previous='docs/evidence/m1/acceptance-quality-recheck';
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const checks=json(`${previous}/final-checks.json`),c=loadCanonicalCorpus();
assert.deepEqual(buildInputs(),checks.productionInputs);
const snapshots=json('docs/evidence/m1/separate-requalification-review/independent-read-snapshots.json');
const representations=[...c.entries.values()].map(e=>{
 assert.deepEqual(websiteReviewInputs(c,e.id),snapshots.representations.find((r:any)=>r.id===e.id).inputs);
 assert.equal(websiteReviewState(c,e.id),'accepted'); assert.equal(e.publicationState,'draft');
 const review=c.websiteReviews.find(r=>r.entryId===e.id)!;
 assert.equal(review.fingerprint,reviewFingerprint(c,e.id));assert.equal(sha256(readFileSync(review.evidenceRef)),review.evidenceSha256);
 return {id:e.id,fingerprint:review.fingerprint,receiptSha256:review.evidenceSha256,detachedInputs:'unchanged',state:'accepted'};
});
assert.equal(representations.length,34);assert.equal(c.rendererSha256,checks.renderer);assert.equal(c.admission.currentSourceQualified,true);
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-acceptance-quality-recheck/preview-${base}`,a=auditOutput(directory);
 assert.deepEqual(a,json(`${previous}/${base}-artifact.json`));
 const old=json(`docs/evidence/m1/separate-requalification-review/${base}-artifact.json`);
 assert.deepEqual(a.files.filter(f=>f.path!=='build-info.json'),old.files.filter((f:any)=>f.path!=='build-info.json'));
 return {directory,artifactSha256:a.artifactSha256,files:a.files.length,html:a.files.filter(f=>f.path.endsWith('.html')).length};
});
const retained=checks.retained.map((a:any)=>{
 const inventory=filesIn(a.directory).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 assert.equal(sha256(stableJSON(inventory)),a.artifactSha256);return a;
});
const output=mkdtempSync(join(tmpdir(),'unity-independent-audit-'));cpSync(artifacts[0].directory,output,{recursive:true});
try {
 assert.equal(auditOutput(output).status,'PASS');
 const probes=json(`${previous}/post-repair-probes.json`).results;
 const mutations:[string,string,(s:string)=>string][]=[
 ['false-social-description','index.html',s=>s.replace(/(<meta property="og:description" content=")[^"]*/, '$1All four forces independently proved')],
 ['false-visible-description','claims/UT-E01/index.html',s=>s.replace(/(<p class="article-lede">)[\s\S]*?(<\/p>)/,'$1False description$2')],
 ['remote-srcset','index.html',s=>s.replace('</body>','<img src="/favicon.svg" srcset="https://remote.invalid/tracker.png 2x" alt="Control"></body>')],
 ['remote-media','index.html',s=>s.replace('</body>','<video src="https://remote.invalid/tracker.mp4" poster="https://remote.invalid/tracker.png"></video></body>')],
 ['remote-style-import','_astro/control.css',()=> '@import "https://remote.invalid/tracker.css";'],
 ['remote-inline-style','index.html',s=>s.replace('</body>','<p style="background-image:url(https://remote.invalid/tracker.png)">Control</p></body>')],
 ['unsafe-refresh','index.html',s=>s.replace('</head>','<meta http-equiv="refresh" content="0;url=https://remote.invalid/"></head>')]
 ];
 const repeated=mutations.map(([name,file,mutate],i)=>{
 const path=join(output,file),raw=file==='_astro/control.css'?'':readFileSync(path,'utf8'),changed=mutate(raw);assert.notEqual(changed,raw);writeFileSync(path,changed);
 let code='ADMITTED';try{auditOutput(output);}catch(e){code=(e as any).code;}finally{if(file==='_astro/control.css')rmSync(path);else writeFileSync(path,raw);}
 assert.equal(code,probes[i].code);return {name,code};
 });
 const original=readFileSync(join(output,'index.html'),'utf8');
 const extra=[
 ['inline-svg-filter','<svg width="30" height="30"><rect width="30" height="30" filter="url(https://remote.invalid/filter.svg#x)"/></svg>'],
 ['inline-svg-cursor','<svg width="30" height="30"><rect width="30" height="30" cursor="url(https://remote.invalid/cursor.png), auto"/></svg>'],
 ['inline-svg-fill','<svg width="30" height="30"><rect width="30" height="30" fill="url(https://remote.invalid/paint.svg#x)"/></svg>']
 ].map(([name,markup])=>{
 writeFileSync(join(output,'index.html'),original.replace('</body>',markup+'</body>'));
 let code='ADMITTED';try{auditOutput(output);}catch(e){code=(e as any).code;}
 writeFileSync(join(output,'index.html'),original);return {name,markup,code};
 });
 const svgPath=join(output,'favicon.svg'),svg=readFileSync(svgPath,'utf8');
 writeFileSync(svgPath,'<svg xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30" filter="url(https://remote.invalid/filter.svg#x)"/></svg>');
 let svgCode='ADMITTED';try{auditOutput(output);}catch(e){svgCode=(e as any).code;}writeFileSync(svgPath,svg);
 const result={status:'PASS for predecessor identities and seven repaired probes',productionInputs:buildInputs(),renderer:c.rendererSha256,representations,artifacts,retained,repeatedOriginalProbes:repeated,additionalProbes:extra,standaloneSvgProbe:svgCode,untouchedCopyPassed:true};
 writeFileSync(`${folder}/independent-engineering.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({productionInputs:result.productionInputs,representations:representations.length,retained:retained.length,repeated,extra,svgCode}));
}finally{rmSync(output,{recursive:true,force:true});}
