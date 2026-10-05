import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
import { args } from './args.js';
import { serveOutput } from './static-server.js';
import { indexSearch } from './index-search.js';
import { loadCanonicalCorpus, validateCorpus, renderEntrySync } from '../src/lib/content.js';
import { readAdmission } from '../src/lib/source-admission.js';
import { searchAttributes } from '../src/lib/search.js';
import { escapeHTML } from '../src/lib/presentation.js';
import { sha256 } from '../src/lib/identity.js';
import { publicationFor } from '../src/lib/publication.js';
import { websiteReviewState } from '../src/lib/website-review.js';
import type { Entry } from '../src/lib/content-schema.js';

const options=args(['dir','evidence-dir','lighthouse']);
if(!options.dir)throw new Error('--dir required');
const dir=resolve(options.dir),evidence=resolve(options['evidence-dir']??'docs/evidence/m6/implementation');mkdirSync(evidence,{recursive:true});
process.env.PLAYWRIGHT_BROWSERS_PATH??=resolve('node_modules/.cache/ms-playwright');
const {chromium,firefox,webkit}=await import('playwright');
const actual=await serveOutput(dir),suffix=actual.base==='/'?'root':'subpath';
const summary:any={schema:'unity-m6-integration/1',base:actual.base,scope:'private engineering; no approvals',browserSmoke:[],performance:[],assistiveTechnology:'NOT_TESTED: no actual screen-reader session',humanComprehension:'NOT_TESTED',fieldCoreWebVitals:'NOT_MEASURED'};
try {
  const start=performance.now(),corpus=loadCanonicalCorpus(),prototype=corpus.entries.get('DOC-CONCEPT-GEOMETRY')!;
  const entries:Entry[]=Array.from({length:200},(_,i)=>({...structuredClone(prototype),id:`DOC-STRESS-${i}`,route:`/synthetic/${i}/`,title:`Synthetic reading ${i}`,contentOrigin:'authored',sourceBinding:null,statement:null,body:`Synthetic mechanics only. Geometry and mode; environmental conditions and stability; effective interactions remain an unproved extension. SYNTHETIC_SEARCH_CONTROL_${i}`,sourceRefs:[],dependsOn:[],related:[],bibRefs:[],assumptions:[],testRefs:[],evidenceRefs:[],scope:'Synthetic engineering fixture, never approved science.',limits:'Unproved extension. Synthetic content only.',sourceMapping:'Synthetic mechanics only.',publicationState:'draft'}));
  const syntheticReferences=Array.from({length:100},(_,i)=>({id:`BIB-${9000+i}`,identity:`https://synthetic.invalid/reference/${i}`,url:`https://synthetic.invalid/reference/${i}`,title:`Synthetic reference ${i}`,sourceRefs:[],supportScope:'Synthetic structural stress control only.',verificationScope:'No scientific verification or source access claimed.'}));
  for(let i=100;i<200;i++)Object.assign(entries[i],{id:`UT-C${1000+i}`,kind:'conjecture',contentOrigin:'proposed',proposalProvenance:'Isolated stress mechanics only; not an adopted project proposal.',adopted:false,statement:'Synthetic geometry and mode conjecture. Not established.'});
  for(let i=0;i<200;i++)entries[i].bibRefs=[syntheticReferences[i%100].id];
  entries[0].title='Synthetic long title: '+('bounded engineering stress '.repeat(12));
  entries[0].body+='\n\n'+('Synthetic bounded technical explanation. '.repeat(2500))+'\n\n'+Array.from({length:20},(_,i)=>`$$\nE_${i}=mc^2\n$$`).join('\n\n')+'\n\n|'+Array.from({length:20},(_,i)=>`column ${i}`).join('|')+'|\n|'+Array(20).fill('---').join('|')+'|\n|'+Array(20).fill('synthetic').join('|')+'|';
  const stress=validateCorpus({entries:[...[...corpus.entries.values()].map(e=>({...structuredClone(e),...(e.contentOrigin==='source-bound'?{statement:null}:{})})),...entries],evidence:[...corpus.evidence.values()],sources:[...corpus.sources.values()],references:[...corpus.references.values(),...syntheticReferences],aliases:JSON.parse(readFileSync('research/publication/citation-aliases.yaml','utf8')),record:readAdmission()!});
  const fixtureDir=join(dirname(dir),`synthetic-search-${suffix}`);cpSync(dir,fixtureDir,{recursive:true});
  const indexedEntries=entries.map(e=>stress.entries.get(e.id)!).map(e=>({...e,publicationState:'published' as const,publishedAt:'2026-10-05'}));
  for(const e of indexedEntries) {
    const path=join(fixtureDir,e.route.slice(1),'index.html');mkdirSync(join(path,'..'),{recursive:true});
    const attrs=Object.entries(searchAttributes(e)).map(([k,v])=>`${k}="${escapeHTML(v)}"`).join(' ');
    writeFileSync(path,`<html lang="en"><head><title>${escapeHTML(e.title)}</title></head><body><h1>${escapeHTML(e.title)}</h1><div data-canonical-body="${e.id}" ${attrs}>${renderEntrySync(stress,e,actual.base)}</div><nav>EXCLUDED_NAV_SENTINEL</nav></body></html>`);
  }
  const search=await indexSearch(fixtureDir,{entries:indexedEntries,manifestSha256:sha256('isolated synthetic selection')},actual.base);
  assert.equal(search.inputs.length,200);
  writeFileSync(join(fixtureDir,'search/index.html'),readFileSync(join(dir,'search/index.html'),'utf8').replace('data-count="0"','data-count="200"').replace('<h1>Search and browse</h1>','<h1>Search and browse</h1><p>SYNTHETIC SEARCH MECHANICS ONLY — no approval or research result.</p>'));
  const fixtureInfo={...actual.info,corpusScope:'synthetic',deployEligible:false,currentSourceQualified:false};writeFileSync(join(fixtureDir,'build-info.json'),JSON.stringify(fixtureInfo));
  summary.stress={status:'PASS',documents:100,records:100,syntheticReferences:100,indexedReadings:200,elapsedMs:Math.round(performance.now()-start),maxRSSKiB:process.resourceUsage().maxRSS,runner:'local; CI NOT_RUN',checks:'shared corpus validation → render 200 bodies incl 10000-word/20-equation/wide-table/long-title controls → native Pagefind build',fixtureOnly:true};
  const synthetic=await serveOutput(fixtureDir);
  try {
    for(const [name,engine] of Object.entries({chromium,firefox,webkit})) {
      const browser=await engine.launch();
      try {
        const page=await browser.newPage({viewport:{width:375,height:900}}),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
        await page.goto(actual.origin+actual.base);await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Framework',exact:true}).click();
        assert(await page.locator('math').count()>0);await page.goto(actual.origin+actual.base+'math/');assert(await page.locator('math').count()>50);
        assert(await page.locator('.fbox').first().evaluate(el=>el.getBoundingClientRect().width)>20);
        await page.goto(actual.origin+actual.base+'search/');await page.locator('#search-query').fill('geometry');await page.locator('button[type="submit"]').click();await page.getByRole('status').filter({hasText:'No published readings'}).waitFor();
        await page.goto(synthetic.origin+synthetic.base+'search/');
        for(const query of ['geometry','mode','environmental conditions','stability','effective interactions']) {
          await page.locator('#search-query').fill(query);await page.locator('button[type="submit"]').click();await page.locator('#search-results li').first().waitFor();
          const href=await page.locator('#search-results a').first().getAttribute('href');assert(href?.startsWith(synthetic.origin+synthetic.base+'synthetic/'));
          assert((await page.locator('#search-results').textContent())?.includes('Unproved extension'));
        }
        await page.locator('#search-query').fill('EXCLUDED_NAV_SENTINEL');await page.locator('button[type="submit"]').click();await page.getByRole('status').filter({hasText:'No results'}).waitFor();
        await page.locator('#search-query').fill('qzxwvnoresults');await page.locator('button[type="submit"]').click();await page.getByRole('status').filter({hasText:'No results'}).waitFor();
        await page.locator('#search-query').fill('');await page.locator('button[type="submit"]').click();await page.getByRole('status').filter({hasText:'Enter a word'}).waitFor();
        await page.locator('#search-query').fill('geometry');await page.locator('button[type="submit"]').click();await page.locator('#search-results li').first().waitFor();
        await page.screenshot({path:join(evidence,`${suffix}-${name}-synthetic-search.png`),fullPage:false});assert.deepEqual(errors,[]);
        const broken=await browser.newPage();await broken.route('**/pagefind/**',route=>route.abort());await broken.goto(synthetic.origin+synthetic.base+'search/');await broken.locator('#search-query').fill('geometry');await broken.locator('button[type="submit"]').click();await broken.getByRole('status').filter({hasText:'Search is unavailable'}).waitFor();assert(await broken.locator('[data-search-fallback]').isVisible());await broken.close();
        summary.browserSmoke.push({engine:name,version:browser.version(),status:'PASS',actual:'navigation/math/pending search',synthetic:'five topic queries, base URLs, scoped snippets, empty/nonsense/navigation-exclusion/missing-bundle controls'});
      }finally{await browser.close();}
    }
  }finally{synthetic.server.close();}
  const browser=await chromium.launch();
  try {
    for(const route of ['','math/']) {
      const context=await browser.newContext(),page=await context.newPage(),responses:Promise<any>[]=[];
      page.on('response',response=>{if(response.url().startsWith(actual.origin))responses.push((async()=>({url:response.url(),gzipBytes:gzipSync(await response.body()).length,resource:response.request().resourceType()}))());});
      await page.goto(actual.origin+actual.base+route);await page.evaluate(()=>document.fonts.ready);await page.waitForLoadState('networkidle');
      const assets=await Promise.all(responses),total=assets.reduce((n,a)=>n+a.gzipBytes,0),js=assets.filter(a=>a.resource==='script').reduce((n,a)=>n+a.gzipBytes,0);
      assert(total<=(route?750:250)*1024);assert(js<=15*1024);
      summary.performance.push({route:actual.base+route,status:'PASS',ownedColdGzipEquivalentBytes:total,initialJSGzipBytes:js,assets,accounting:'fresh browser context, local no-store production-output server; gzip each received owned response body (including CSS embedded fonts); no third-party assets; equivalent gzip budget, not on-wire compression'});
      await context.close();
    }
  }finally{await browser.close();}
  if(options.lighthouse==='true') {
    const {default:lighthouse}=await import('lighthouse'),launcher=await import('chrome-launcher');
    const chrome=await launcher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless=new','--no-sandbox'],port:0});
    try {
      summary.lighthouse=[];
      for(const route of ['','math/']) {
        const result=await lighthouse(actual.origin+actual.base+route,{port:chrome.port,onlyCategories:['performance','accessibility'],output:'json',logLevel:'error',formFactor:'mobile',screenEmulation:{mobile:true,width:375,height:812,deviceScaleFactor:1,disabled:false},throttlingMethod:'simulate'});
        if(!result || result.lhr.runtimeError)throw new Error('Lighthouse diagnostic failed');
        writeFileSync(join(evidence,`${suffix}-${route?'math':'home'}-lighthouse.json`),JSON.stringify(result.lhr,null,2)+'\n');
        summary.lighthouse.push({route:actual.base+route,version:result.lhr.lighthouseVersion,LCPms:result.lhr.audits['largest-contentful-paint'].numericValue,CLS:result.lhr.audits['cumulative-layout-shift'].numericValue,performance:result.lhr.categories.performance.score,accessibility:result.lhr.categories.accessibility.score,profile:'mobile 375×812; simulated throttling; local Chromium; diagnostic only'});
      }
    }finally{chrome.kill();}
  } else summary.lighthouse='Root home/math diagnostic only; no duplicate subpath run';
  const actualSelection=publicationFor('preview',actual.info.config);assert.deepEqual(actualSelection.manifest.searchIds,[]);
  const reviewStates=Object.fromEntries(['accepted','pending','stale','rejected'].map(state=>[state,[...actualSelection.corpus.entries.values()].filter(e=>websiteReviewState(actualSelection.corpus,e.id)===state).length]));
  summary.actualIndex={publishedReadings:actualSelection.manifest.searchIds.length,reviewStates,qualified:actualSelection.admission.currentSourceQualified,deployEligible:actual.info.deployEligible};
  summary.status='PASS';
} catch(error) {summary.status='FAIL';summary.error=String(error);throw error;}
finally {actual.server.close();writeFileSync(join(evidence,`${suffix}-integration.json`),JSON.stringify(summary,null,2)+'\n');}
console.log(JSON.stringify({...summary,performance:summary.performance.map((p:any)=>({...p,assets:p.assets.length}))}));
