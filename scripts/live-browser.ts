import type { Browser } from '@playwright/test';
import type { SiteConfig } from '../src/lib/site-config.js';
import { canonicalURL } from '../src/lib/urls.js';
import { ContractError } from '../src/lib/errors.js';

export async function verifyLiveBrowser(browser:Browser,config:SiteConfig,buildInfo:{publicationManifest:{routes:string[]}},files:{path:string}[],screenshot:string) {
  const context=await browser.newContext();
  const noJS=await browser.newContext({javaScriptEnabled:false});
  try {
    const reading=await noJS.newPage();
    await reading.goto(canonicalURL('/',config));
    if(await reading.locator('h1').count()!==1)throw new ContractError('LIVE_READING_FAILURE','Home heading unavailable without JavaScript');
    await reading.goto(canonicalURL('/math/',config));
    if(!await reading.locator('math').count())throw new ContractError('LIVE_READING_FAILURE','Actual math reading must retain MathML');
    const page=await context.newPage(),errors:string[]=[],search=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(config.origin+config.basePath) && r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    for(const query of ['geometry','mode','environmental conditions','stability','effective interactions']) {
      await page.goto(canonicalURL('/search/',config));
      await page.locator('#search-query').fill(query);await page.locator('button[type="submit"]').click();
      await page.getByRole('status').filter({hasText:/\d+ results?/}).waitFor();
      const items=page.locator('#search-results li'),shownResults=await items.count();
      if(!shownResults)throw new ContractError('LIVE_SEARCH_FAILURE',query);
      for(const item of await items.all()) {
        const href=await item.locator('a').getAttribute('href');
        if(!href?.startsWith(config.origin+config.basePath) || !(await item.locator('.reading-note').textContent())?.trim())throw new ContractError('LIVE_SEARCH_FAILURE','Missing result scope or incorrect destination');
        const route=new URL(href).pathname.slice(config.basePath.length),path=route?route+'index.html':'index.html';
        if(!buildInfo.publicationManifest.routes.includes('/'+route) || !files.some(f=>f.path===path))throw new ContractError('LIVE_SEARCH_FAILURE','Result outside qualified output');
      }
      await page.screenshot({path:screenshot,fullPage:false});
      const destination=await items.first().locator('a').getAttribute('href');
      await items.first().locator('a').click();
      if(page.url()!==destination || await page.locator('main h1').count()!==1 || !await page.locator('[data-canonical-body]').count())throw new ContractError('LIVE_SEARCH_FAILURE',`${query}: selected result did not open its qualified reading at ${destination}`);
      search.push({query,shownResults,destination,selection:'PASS',status:'PASS'});
    }
    if(errors.length)throw new ContractError('LIVE_BROWSER_FAILURE',errors.join('; '));
    return {search,browser:{engine:'chromium',version:browser.version(),noJSHomeMath:'PASS',search:'PASS',destinationSelection:'PASS'}};
  } finally {await context.close();await noJS.close();}
}
