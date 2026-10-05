import { readFileSync,writeFileSync,mkdirSync,existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { args } from './args.js';
import { loadSiteConfig } from '../src/lib/site-config.js';
import { verifyLiveArtifact } from '../src/lib/live-release.js';
import { verifyLiveBrowser } from './live-browser.js';

const options=args(['release','seal','config','evidence-dir']);
if(!options.release || !options.seal)throw new Error('--release <audit receipt> and --seal <deployment manifest> required');
const evidence=resolve(options['evidence-dir']??'docs/evidence/m7/runtime/live');
if(!evidence.startsWith(resolve('docs/evidence')+'/'))throw new Error('Live evidence belongs under docs/evidence/');
const receipt:any={schema:'unity-live-verification/1',date:new Date().toISOString(),status:'FAIL',scope:'served artifact identity and Chromium/no-JS smoke; no publication authorization',screenReader:'NOT_TESTED',humanComprehension:'NOT_TESTED'};
try {
  const config=loadSiteConfig(options.config);
  const result=await verifyLiveArtifact(JSON.parse(readFileSync(options.release,'utf8')),JSON.parse(readFileSync(options.seal,'utf8')),config);
  const {buildInfo,...identity}=result;Object.assign(receipt,identity);receipt.status='FAIL';
  mkdirSync(evidence,{recursive:true});
  const localBrowserCache=resolve('node_modules/.cache/ms-playwright');
  if(existsSync(localBrowserCache) && !process.env.PLAYWRIGHT_BROWSERS_PATH)process.env.PLAYWRIGHT_BROWSERS_PATH=localBrowserCache;
  const browser=await chromium.launch();
  try {
    Object.assign(receipt,await verifyLiveBrowser(browser,config,buildInfo,JSON.parse(readFileSync(options.release,'utf8')).files,resolve(evidence,'search.png')));
  } finally {await browser.close();}
  receipt.status='PASS';
} catch(error) {receipt.error=String(error);process.exitCode=1;}
finally {mkdirSync(evidence,{recursive:true});writeFileSync(resolve(evidence,'live-verification.json'),JSON.stringify(receipt,null,2)+'\n');}
console.log(JSON.stringify(receipt));
