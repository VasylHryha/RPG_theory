import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {loadCanonicalCorpus,reviewFingerprint} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState} from '../../../../src/lib/website-review.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {filesIn} from '../../../../src/lib/source-admission.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';

const folder='docs/evidence/m1/qf1214-separate-review';
const prior='docs/evidence/m1/audit-normalization-recheck';
const json=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const before=json(`${prior}/final-checks.json`),inputs=buildInputs();
assert.deepEqual(inputs,before.productionInputs);
const corpus=loadCanonicalCorpus();
assert.equal(corpus.admission.currentSourceQualified,true);
assert.equal(corpus.rendererSha256,before.renderer);
const snapshots=json('docs/evidence/m1/separate-requalification-review/independent-read-snapshots.json');
const representations=[...corpus.entries.values()].map(entry=>{
  assert.deepEqual(websiteReviewInputs(corpus,entry.id),snapshots.representations.find((r:any)=>r.id===entry.id).inputs);
  const decision=corpus.websiteReviews.find(r=>r.entryId===entry.id)!;
  assert.equal(decision.fingerprint,reviewFingerprint(corpus,entry.id));
  assert.equal(sha256(readFileSync(decision.evidenceRef)),decision.evidenceSha256);
  assert.equal(websiteReviewState(corpus,entry.id),'accepted');
  assert.equal(entry.publicationState,'draft');
  return {id:entry.id,fingerprint:decision.fingerprint,receiptSha256:decision.evidenceSha256,state:'accepted',detachedInputs:'unchanged'};
});
assert.equal(representations.length,34);

const retained=[...before.artifacts,...before.retained].map((artifact:any)=>{
  const inventory=filesIn(artifact.directory).map(path=>{
    const raw=readFileSync(join(artifact.directory,path));return {path,bytes:raw.length,sha256:sha256(raw)};
  });
  assert.equal(sha256(stableJSON(inventory)),artifact.artifactSha256);
  return {directory:artifact.directory,artifactSha256:artifact.artifactSha256,unchanged:true};
});
const font=readFileSync('node_modules/katex/dist/fonts/KaTeX_SansSerif-Regular.woff2').toString('base64');
const forged=font.slice(0,24)+'/*not-font-bytes*/'+font.slice(24);
type Probe={name:string;file:string;value:(original:string,base:string)=>string;code:string};
const add=(markup:string)=>(original:string)=>original.replace('</body>',markup+'</body>');
const svg=(attribute:string,value:string)=>`<svg xmlns="http://www.w3.org/2000/svg"><rect id="paint" width="30" height="30" ${attribute}="${value}"/></svg>`;
const probes:Probe[]=[];
for(const attribute of ['fill','stroke','filter','clip-path','mask','cursor','marker','marker-start','marker-mid','marker-end']) {
  probes.push({name:`inline-${attribute}`,file:'index.html',value:add(svg(attribute,'url(https://remote.invalid/load.svg)')),code:'UNSAFE_OUTPUT_URL'});
  probes.push({name:`standalone-${attribute}`,file:'favicon.svg',value:()=>svg(attribute,'url(https://remote.invalid/load.svg)'),code:'UNSAFE_OUTPUT_URL'});
}
probes.push(
  {name:'inline-xml-base',file:'index.html',value:add('<svg xml:base="https://remote.invalid/"><rect fill="url(favicon.svg)"/></svg>'),code:'ACTIVE_OUTPUT'},
  {name:'standalone-xml-base',file:'favicon.svg',value:()=>'<svg xmlns="http://www.w3.org/2000/svg" xml:base="https://remote.invalid/"><rect fill="url(favicon.svg)"/></svg>',code:'UNSAFE_SVG'},
  ...['https://remote.invalid/theme.css','favicon.svg'].map(url=>({name:`stylesheet-pi-${url.startsWith('https')?'remote':'local'}`,file:'favicon.svg',value:(raw:string)=>`<?xml-stylesheet type="text/css" href="${url}"?>${raw}`,code:'UNSAFE_SVG'})),
  {name:'unknown-pi',file:'favicon.svg',value:raw=>'<?review href="https://remote.invalid/load"?>'+raw,code:'UNSAFE_SVG'},
  {name:'quoted-comment-font',file:'_astro/review.css',value:()=>`@font-face{src:url("data:font/woff2;base64,${forged}")}`,code:'UNSAFE_OUTPUT_URL'},
  {name:'unquoted-comment-font',file:'_astro/review.css',value:()=>`@font-face{src:url(data:font/woff2;base64,${forged})}`,code:'UNSAFE_OUTPUT_URL'},
  {name:'quoted-comment-path',file:'_astro/review.css',value:()=>'.probe{background:url("../favicon.svg/*literal*/")}',code:'BROKEN_OUTPUT_LINK'},
  {name:'unquoted-comment-path',file:'_astro/review.css',value:()=>'.probe{background:url(../favicon.svg/*literal*/)}',code:'BROKEN_OUTPUT_LINK'},
  {name:'escaped-quote-path',file:'_astro/review.css',value:()=>String.raw`.probe{background:url("../favicon.svg\")")}`,code:'BROKEN_OUTPUT_LINK'},
  {name:'escaped-protocol',file:'_astro/review.css',value:()=>String.raw`.probe{background:u\000072l(https\3a //remote.invalid/a.svg)}`,code:'UNSAFE_OUTPUT_URL'},
  {name:'escaped-inline-protocol',file:'index.html',value:add(String.raw`<p style="background:u\72l(https\3a //remote.invalid/a.svg)">Probe</p>`),code:'UNSAFE_OUTPUT_URL'},
  {name:'nested-fallback-load',file:'_astro/review.css',value:()=>'.probe{background:var(--image,url(https://remote.invalid/a.svg))}',code:'UNSAFE_OUTPUT_URL'},
  {name:'escaped-import',file:'_astro/review.css',value:()=>String.raw`@\000069mport "https://remote.invalid/a.css";`,code:'UNSAFE_OUTPUT_CSS'},
  {name:'string-image-set',file:'_astro/review.css',value:()=>'.probe{background:image-set("https://remote.invalid/a.png" 1x)}',code:'UNSAFE_OUTPUT_CSS'},
  {name:'font-src-function',file:'_astro/review.css',value:()=> '@font-face{src:src("https://remote.invalid/a.woff2")}',code:'UNSAFE_OUTPUT_CSS'},
  {name:'unknown-function',file:'_astro/review.css',value:()=>'.probe{background:unknown("https://remote.invalid/a.png")}',code:'UNSAFE_OUTPUT_CSS'},
  {name:'encoding-directive',file:'_astro/review.css',value:()=> '@charset "ISO-8859-1";',code:'UNSAFE_OUTPUT_CSS'},
  {name:'unterminated-comment',file:'_astro/review.css',value:()=>'.probe{/* unfinished',code:'UNSAFE_OUTPUT_CSS'},
  {name:'unclosed-delimiter',file:'_astro/review.css',value:()=>'.probe{background:url("../favicon.svg")',code:'UNSAFE_OUTPUT_CSS'},
);
const positives:Probe[]=[
  {name:'inert-string',file:'_astro/review.css',value:()=>'.probe:after{content:"url(https://remote.invalid/inert.png) /*literal*/ @import"}',code:'PASS'},
  {name:'escaped-local-function',file:'_astro/review.css',value:()=>String.raw`.probe{background:u\72 l("../favicon.svg")}`,code:'PASS'},
  {name:'local-url-comment-trivia',file:'_astro/review.css',value:()=>'.probe{background:url("../favicon.svg" /* real comment */)}',code:'PASS'},
  {name:'local-url-line-continuation',file:'_astro/review.css',value:()=>'.probe{background:url("../fav\\\nicon.svg")}',code:'PASS'},
  {name:'quoted-installed-font',file:'_astro/review.css',value:()=>`@font-face{src:url("data:font/woff2;base64,${font}")}`,code:'PASS'},
  {name:'escaped-installed-font',file:'_astro/review.css',value:()=>String.raw`@font-face{src:url("d\61 ta:font/woff2;base64,${font}")}`,code:'PASS'},
  {name:'static-gradient',file:'_astro/review.css',value:()=>'.probe{background:linear-gradient(rgb(0,128,0),white)}',code:'PASS'},
  {name:'inline-fragment-and-cursor',file:'index.html',value:(raw,base)=>add(`<svg><defs><linearGradient id="review-paint"><stop stop-color="green"/></linearGradient></defs><rect fill="url(#review-paint)" cursor="url(${base}favicon.svg),auto"/></svg>`)(raw),code:'PASS'},
  {name:'standalone-fragment',file:'favicon.svg',value:()=>svg('fill','url(#paint)'),code:'PASS'},
  {name:'xml-declaration',file:'favicon.svg',value:raw=>'<?xml version="1.0" encoding="UTF-8"?>'+raw,code:'PASS'},
];
const artifacts:any[]=[],outcomes:any[]=[];
for(const suffix of ['root','subpath']) {
  const directory=`dist/m1-audit-normalization-recheck/preview-${suffix}`;
  const actual=auditOutput(directory);
  assert.deepEqual(actual,json(`${prior}/${suffix}-artifact.json`));
  assert.deepEqual(actual.files.filter(f=>f.path!=='build-info.json'),json(`docs/evidence/m1/qf1011-separate-review/${suffix}-artifact.json`).files.filter((f:any)=>f.path!=='build-info.json'));
  artifacts.push({directory,artifactSha256:actual.artifactSha256,files:actual.files.length,html:actual.files.filter(f=>f.path.endsWith('.html')).length});
  const temporary=mkdtempSync(join(tmpdir(),'unity-qf1214-review-'));
  cpSync(directory,temporary,{recursive:true});
  try {
    for(const probe of [...probes,...positives]) {
      assert.equal(auditOutput(temporary).status,'PASS');
      const path=join(temporary,probe.file),present=existsSync(path),raw=present?readFileSync(path,'utf8'):'';
      const changed=probe.value(raw,actual.basePath);assert.notEqual(changed,raw);writeFileSync(path,changed);
      let outcome='PASS';
      try {auditOutput(temporary);} catch(error) {outcome=(error as any).code??String(error);}
      if(present)writeFileSync(path,raw);else rmSync(path);
      outcomes.push({base:actual.basePath,name:probe.name,untouchedCopy:'PASS',expected:probe.code,outcome});
      writeFileSync(`${folder}/probe-progress.json`,JSON.stringify(outcomes,null,2)+'\n');
      assert.equal(outcome,probe.code,`${actual.basePath}: ${probe.name}`);
    }
  } finally {rmSync(temporary,{recursive:true,force:true});}
}
const refusals=['qualification','release'].map(mode=>{
  const output=`dist/m1-qf1214-separate-review/refused-${mode}`;assert.equal(existsSync(output),false);
  const result=spawnSync(process.execPath,['--import','tsx','scripts/build.ts','--mode',mode,'--output',output],{encoding:'utf8'});
  writeFileSync(`${folder}/${mode}-refusal.log`,result.stdout+result.stderr);
  assert.equal(result.status,1);assert.match(result.stderr,/CURRENT_SOURCE_NOT_QUALIFIED/);assert.equal(existsSync(output),false);
  return {mode,exitCode:1,code:'CURRENT_SOURCE_NOT_QUALIFIED',publishedSelection:'empty',outputCreated:false};
});
const result={status:'PASS',reviewedHead:json(`${folder}/baseline.json`).head,productionInputs:inputs,renderer:corpus.rendererSha256,representations,artifacts,retained,outcomes,refusals,negativeControls:probes.length*2,positiveControls:positives.length*2,newProductionOrTestRepairs:'NONE',newFidelityDecisions:'NONE',reviewStates:{accepted:34,pending:0,stale:0,rejected:0},currentSourceQualified:true,scope:'QF-12–14 reached static CSS/SVG resource controls; not exhaustive browser security or CSS visibility',m2:'NOT_STARTED'};
writeFileSync(`${folder}/independent-engineering.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,negativeControls:result.negativeControls,positiveControls:result.positiveControls,retained:retained.length,artifacts}));
