import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,mkdtempSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium,type Browser } from '@playwright/test';
import { verifyLiveBrowser } from '../../scripts/live-browser.js';

// Intercepted synthetic transport with the actual search client, not a hosted
// release, approved corpus, or human/assistive-technology qualification.
for(const basePath of ['/','/unity-theory/'])test(`M7 browser selects all five query destinations at ${basePath} and refuses a redirect`,async()=>{
  const browser=await chromium.launch(),evidence=mkdtempSync(join(tmpdir(),'unity-m7-browser-'));
  try {
    const config={origin:'https://synthetic.invalid',basePath,repository:null,publicAuthorization:false};
    const reading=basePath+'articles/synthetic/';
    for(const redirect of [false,true]) {
      const queries:string[]=[],selected:string[]=[];
      const routed={version:()=>browser.version(),newContext:async(options:any)=>{
        const context=await browser.newContext(options);
        await context.route('https://synthetic.invalid/**',async route=>{
          const path=new URL(route.request().url()).pathname;
          if(path===basePath+'search-client.js')return route.fulfill({contentType:'text/javascript',body:readFileSync('public/search-client.js','utf8')});
          if(path===basePath+'pagefind/pagefind.js')return route.fulfill({contentType:'text/javascript',body:`export function options(){};export async function search(query){await fetch('${basePath}query?q='+encodeURIComponent(query));return {results:[{data:async()=>({url:'${reading}',meta:{title:'Synthetic reading',status:'Hypothesis',scope:'Synthetic mechanics only'},excerpt:'Synthetic result'})}]}}`});
          if(path===basePath+'query'){queries.push(new URL(route.request().url()).searchParams.get('q')!);return route.fulfill({body:'ok'});}
          if(path===reading){selected.push(path);if(redirect)return route.fulfill({status:302,headers:{location:basePath+'wrong/'}});}
          const body=path===basePath+'search/'?`<main><h1>Search</h1><form data-search-form data-count="1" data-base="${basePath}" data-bundle="${basePath}pagefind/pagefind.js"><input id="search-query"><button type="submit">Search</button></form><p id="search-status" role="status"></p><ul id="search-results"></ul><script type="module" src="${basePath}search-client.js"></script></main>`:`<main><article data-canonical-body="synthetic"><h1>Synthetic reading</h1>${path===basePath+'math/'?'<math><mi>x</mi></math>':''}</article></main>`;
          await route.fulfill({contentType:'text/html',body});
        });
        return context;
      }} as Browser;
      const operation=()=>verifyLiveBrowser(routed,config,{publicationManifest:{routes:['/articles/synthetic/']}},[{path:'articles/synthetic/index.html'}],join(evidence,'search.png'));
      if(redirect){await assert.rejects(operation,/LIVE_SEARCH_FAILURE/);assert.equal(selected.length,1);}
      else {
        const result=await operation();
        assert.deepEqual(queries,['geometry','mode','environmental conditions','stability','effective interactions']);
        assert.equal(selected.length,5);assert.equal(result.search.length,5);assert.ok(result.search.every(r=>r.destination===config.origin+reading && r.selection==='PASS'));
        assert.equal(result.browser.noJSHomeMath,'PASS');
      }
    }
  } finally {await browser.close();rmSync(evidence,{recursive:true,force:true});}
});
