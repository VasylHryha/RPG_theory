import { chromium } from '@playwright/test';
import { serveOutput } from '../../../scripts/static-server.ts';
import { writeFileSync } from 'node:fs';
const {server,origin,base}=await serveOutput('dist/m1/qualification-root');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:1000},javaScriptEnabled:false});
const results=[];
try {
  for(const [route,name,width] of [['references/','literature-desktop',1280],['references/','literature-mobile',320],['claims/UT-E01/','evidence-desktop',1280],['concepts/geometry-and-modes/','concept-desktop',1280]]) {
    await page.setViewportSize({width,height:1000});const response=await page.goto(origin+base+route);
    await page.screenshot({path:`docs/evidence/m1/root-${name}.png`,fullPage:true});
    results.push({route,status:response.status(),viewport:width,title:await page.locator('h1').innerText(),sourceBoundBodies:await page.locator('[data-canonical-body]').count(),literatureDOILinks:await page.locator('a[href^="https://doi.org/"]').count(),noWholePageOverflow:await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)});
  }
} finally {await browser.close();await new Promise(done=>server.close(done));}
writeFileSync('docs/evidence/m1/visual-capture.json',JSON.stringify({date:new Date().toISOString(),artifact:'dist/m1/qualification-root',javaScriptEnabled:false,results},null,2)+'\n');
