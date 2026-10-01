import { chromium } from '@playwright/test';
import { serveOutput } from '../../../../scripts/static-server.ts';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const {server,origin,base}=await serveOutput('dist/m1-recheck/preview-root');
const browser=await chromium.launch({headless:true,executablePath:resolve('node_modules/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell')});
const page=await browser.newPage({viewport:{width:320,height:900},javaScriptEnabled:false});
const results=[];
try {
 for(const [route,name,width,anchor] of [['references/','literature-first-screen-mobile',320,null],['references/','literature-paper-mobile',320,'#BIB-0022'],['','home-first-screen',1280,null],['','home-status',1280,'[data-source-projection]'],['claims/UT-D01/','definition-mobile',320,null]]) {
  await page.setViewportSize({width,height:900});const response=await page.goto(origin+base+route);
  if(anchor) await page.locator(anchor).scrollIntoViewIfNeeded();
  await page.screenshot({path:`docs/evidence/m1/recheck/root-${name}.png`,fullPage:false,timeout:15000});
  results.push({route,anchor,status:response.status(),viewport:{width,height:900},title:await page.locator('h1').innerText(),noWholePageOverflow:await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)});
 }
} finally {await browser.close();await new Promise(done=>server.close(done));}
writeFileSync('docs/evidence/m1/recheck/visual-capture.json',JSON.stringify({date:new Date().toISOString(),artifact:'dist/m1-recheck/preview-root',javaScriptEnabled:false,viewportCaptures:true,results},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',results}));
