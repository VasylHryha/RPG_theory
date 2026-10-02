import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {serveOutput} from '../../../../scripts/static-server.js';
const folder='docs/evidence/m1/qf1011-separate-review';
const findings=JSON.parse(readFileSync(`${folder}/independent-engineering.json`,'utf8'));
const output=mkdtempSync(join(tmpdir(),'unity-svg-loading-'));
cpSync('dist/m1-acceptance-quality-recheck/preview-root',output,{recursive:true});
const {server,origin}=await serveOutput(output);
try {
 const browser=await chromium.launch({headless:true,executablePath:process.env.UNITY_CHROMIUM_PATH??'node_modules/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 try{
 const context=await browser.newContext();
 const requests:string[]=[];
 await context.route('https://remote.invalid/**',async route=>{
 requests.push(route.request().url());await route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"><filter id="x"/></svg>'});
 });
 const page=await context.newPage(),results=[];
 const original=readFileSync(join(output,'index.html'),'utf8');
 for(const probe of findings.additionalProbes){
 requests.length=0;writeFileSync(join(output,'index.html'),original.replace('</body>',probe.markup+'</body>'));
 await page.goto(origin);await page.locator('svg').last().hover();await page.waitForTimeout(200);
 results.push({name:probe.name,admittedByAuditor:probe.code,interceptedAttemptedRequests:[...requests]});
 }
 writeFileSync(`${folder}/browser-loading-probes.json`,JSON.stringify({browser:browser.version(),externalNetwork:'all remote.invalid requests intercepted and fulfilled locally; no external host contacted',results},null,2)+'\n');
 console.log(JSON.stringify(results));await context.close();
 }finally{await browser.close();}
}finally{server.close();rmSync(output,{recursive:true,force:true});}
