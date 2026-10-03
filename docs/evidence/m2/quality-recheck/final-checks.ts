import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {serveOutput} from '../../../../scripts/static-server.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {loadCanonicalCorpus} from '../../../../src/lib/content.js';
import {websiteReviewState} from '../../../../src/lib/website-review.js';
import {sha256} from '../../../../src/lib/identity.js';
const evidence='docs/evidence/m2/quality-recheck';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const save=(name:string,value:unknown)=>writeFileSync(join(evidence,name),JSON.stringify(value,null,2)+'\n');
const verification=read(join(evidence,'verification.json'));assert.equal(verification.status,'PASS');assert.equal(verification.receipts.length,11);
const corpus=loadCanonicalCorpus(),states={accepted:0,pending:0,stale:0,rejected:0};
for(const entry of corpus.entries.values())states[websiteReviewState(corpus,entry.id)]++;
assert.deepEqual(states,{accepted:0,pending:11,stale:34,rejected:0});assert.equal(corpus.admission.currentSourceQualified,false);
const artifacts=[],controls=[];
for(const suffix of ['root','subpath']) {
  const directory=`dist/m2-quality-recheck/preview-${suffix}`;
  const saved=read(join(evidence,`${suffix}-artifact.json`)),current=auditOutput(directory);
  assert.equal(saved.artifactSha256,current.artifactSha256);
  const browser=read(join(evidence,`${suffix}-browser.json`));assert.equal(browser.stats.expected,12);assert.equal(browser.stats.unexpected+browser.stats.flaky+browser.stats.skipped,0);
  const cold=read(join(evidence,`${suffix}-cold-assets.json`));
  artifacts.push({directory,artifactSha256:current.artifactSha256,files:current.files.length,html:current.files.filter(f=>f.path.endsWith('.html')).length,postBrowserAudit:'PASS',browser:browser.stats,coldAssets:cold.observations.map((item:any)=>({route:item.route,gzipBytes:item.totalGzipBytes,requests:item.resources.length}))});
  const temp=mkdtempSync('/private/tmp/unity-m2-final-style-');
  try {
    cpSync(directory,temp,{recursive:true});assert.equal(auditOutput(temp).status,'PASS');
    const path=join(temp,'concepts/effective-interactions/index.html'),original=readFileSync(path,'utf8');
    const style=original.match(/<link[^>]*data-math-stylesheet[^>]*>/)![0];
    const home=join(temp,'index.html'),homeOriginal=readFileSync(home,'utf8');
    for(const [name,changed] of [['missing',original.replace(style,'')],['unmarked',original.replace('data-math-stylesheet','')],['duplicate',original.replace(style,style+style)]]) {
      writeFileSync(path,changed);assert.throws(()=>auditOutput(temp),/MATH_STYLESHEET_PARITY_FAILURE/);controls.push({base:suffix,control:name,outcome:'INTENDED_REFUSAL'});
    }
    writeFileSync(path,original);
    writeFileSync(home,homeOriginal.replace('</head>',style.replace('data-math-stylesheet','')+'</head>'));
    assert.throws(()=>auditOutput(temp),/MATH_STYLESHEET_PARITY_FAILURE/);controls.push({base:suffix,control:'unmarked math CSS on nonmath home',outcome:'INTENDED_REFUSAL'});
  }finally{rmSync(temp,{recursive:true,force:true});}
  const predecessor=read(`docs/evidence/m2/implementation/${suffix}-artifact.json`);
  for(const file of predecessor.files)assert.equal(sha256(readFileSync(join(`dist/m2-introduction/preview-${suffix}`,file.path))),file.sha256);
}
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('node_modules/.cache/ms-playwright');
const {chromium}=await import('@playwright/test');
const {server,origin}=await serveOutput('dist/m2-quality-recheck/preview-root');
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:375,height:900},javaScriptEnabled:false});
const observations=[];
try {
  await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  await page.goto(origin);
  const home=await page.evaluate(()=>({waveTop:document.querySelector('[data-canonical-body] h2')!.getBoundingClientRect().top,diagramTop:document.querySelector('[data-beginner-diagram]')!.getBoundingClientRect().top,mathStyles:document.querySelectorAll('link[data-math-stylesheet]').length,readingNoteFont:getComputedStyle(document.querySelector('.reading-note')!).fontSize}));
  assert.ok(home.waveTop<900);assert.equal(home.mathStyles,0);observations.push({route:'/',...home});
  await page.screenshot({path:join(evidence,'after-home-mobile.png'),fullPage:true});
  await page.goto(origin+'/examples/string/');
  const string=await page.evaluate(()=>({diagramTop:document.querySelector('[data-beginner-diagram]')!.getBoundingClientRect().top,articleHeight:document.querySelector('article')!.getBoundingClientRect().height,sourceDetailsHeight:document.querySelector('[data-record-details]')!.getBoundingClientRect().height}));
  assert.ok(string.diagramTop<900);observations.push({route:'/examples/string/',...string});
  const source=page.locator('.source-details');await source.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await source.evaluate((el:HTMLDetailsElement)=>el.open),true);
  await page.screenshot({path:join(evidence,'after-string-sources-open.png'),fullPage:true});
  await page.goto(origin+'/concepts/effective-interactions/');
  assert.equal(await page.locator('.katex-display').count(),1);
  const equation=await page.locator('.katex-display').evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,role:el.getAttribute('role'),label:el.getAttribute('aria-label')}));
  observations.push({route:'/concepts/effective-interactions/',equation});
  await page.screenshot({path:join(evidence,'after-interactions-mobile.png'),fullPage:true});
}finally{await browser.close();server.close();}
save('final-checks.json',{status:'PASS',baselineHead:read(join(evidence,'baseline.json')).head,productionInputs:buildInputs(),contracts:Number(/ℹ tests (\d+)/.exec(readFileSync(join(evidence,'verification.log'),'utf8'))?.[1]),commands:11,chromium:24,artifacts,controls,observations,websiteReviewStates:states,predecessorArtifacts:'Both exact inventories unchanged',m2:'REVIEW_READY',m3:'NOT_STARTED',scientificAdjudication:'OUT_OF_SCOPE',humanComprehension:'NOT_TESTED',independentAcceptance:'PENDING',publicActions:'NOT_RUN'});
console.log('Final M2 checks PASS; eight intended actual-artifact refusals; separate acceptance pending.');
