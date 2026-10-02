import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {serveOutput} from '../../../../scripts/static-server.js';
const folder='docs/evidence/m1/audit-normalization-recheck';
const output=mkdtempSync(join(tmpdir(),'unity-css-semantics-'));cpSync('dist/m1-qf1011-separate-review/preview-root',output,{recursive:true});
const {server,origin}=await serveOutput(output);
try {
 const browser=await chromium.launch({headless:true,executablePath:'node_modules/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 try{
 const context=await browser.newContext(),remote:string[]=[];
 await context.route('https://remote.invalid/**',async route=>{remote.push(route.request().url());await route.fulfill({status:200,contentType:'text/css',body:'rect{fill:green}'});});
 const page=await context.newPage(),local:{path:string;status:number}[]=[],results=[];
 page.on('response',r=>{if(r.url().startsWith(origin))local.push({path:r.url().slice(origin.length),status:r.status()});});
 const original=readFileSync(join(output,'index.html'),'utf8');
 const cssCases=[['quoted-url-comments','p{background:url("../favicon.svg/*not-a-comment*/")}'],['escaped-quote-url',String.raw`p{background:url("../favicon.svg\")")}`],['inert-css-string','p:after{content:"url(https://remote.invalid/inert.png)"}']];
 for(const [name,css] of cssCases){
 remote.length=0;local.length=0;writeFileSync(join(output,'_astro/control.css'),css);writeFileSync(join(output,'index.html'),original.replace('</head>','<link rel="stylesheet" href="/_astro/control.css"></head>'));
 await page.goto(origin);await page.waitForTimeout(150);
 const content=await page.locator('p').first().evaluate(el=>getComputedStyle(el,'::after').content);
 results.push({name,remoteRequests:[...remote],localResponses:local.filter(r=>r.path.includes('favicon')),pseudoContent:content});
 }
 remote.length=0;writeFileSync(join(output,'favicon.svg'),'<?xml-stylesheet type="text/css" href="https://remote.invalid/theme.css"?><svg xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30"/></svg>');
 await page.goto(origin+'/favicon.svg');await page.waitForTimeout(150);results.push({name:'svg-stylesheet-pi',remoteRequests:[...remote]});
 writeFileSync(`${folder}/browser-semantics.json`,JSON.stringify({browser:browser.version(),externalNetwork:'remote.invalid intercepted and fulfilled locally; no external host contacted',results},null,2)+'\n');console.log(JSON.stringify(results));await context.close();
 }finally{await browser.close();}
}finally{server.close();rmSync(output,{recursive:true,force:true});}
