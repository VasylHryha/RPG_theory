import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {serveOutput} from '../../../../scripts/static-server.js';
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('node_modules/.cache/ms-playwright');
const {chromium}=await import('@playwright/test');
const evidence='docs/evidence/m1/review-recheck';
const browser=await chromium.launch();
const captures=[];
try {
 for(const base of ['root','subpath']) {
  const {server,origin,base:prefix,info}=await serveOutput(`dist/m1-review-recheck/preview-${base}`);
  try {
   for(const width of [320,1280]) {
    const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),page=await context.newPage();
    try {
     await page.goto(origin+prefix+'start/');await page.evaluate(()=>document.fonts.ready);
     const state=await page.locator('[data-editorial-state="DOC-START"]').textContent();
     assert.equal(state,'Publication: Draft · private preview. Content review: Pending.');
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
     const path=`${evidence}/${base}-start-${width}.png`;await page.screenshot({path,fullPage:true});
     captures.push({artifact:`dist/m1-review-recheck/preview-${base}`,basePath:prefix,width,path,publicationManifestSha256:info.publicationManifestSha256,inputsSha256:info.inputsSha256,state,javascript:false});
    } finally {await context.close();}
   }
  } finally {await new Promise<void>((done,error)=>server.close(e=>e?error(e):done()));}
 }
} finally {await browser.close();}
writeFileSync(`${evidence}/visual-capture.json`,JSON.stringify({date:new Date().toISOString(),captures,humanComprehension:'NOT_TESTED'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',captures:captures.length}));
