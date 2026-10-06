import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE ?? '/',suffix=base==='/'?'root':'target';
const evidence=process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m7/runtime/public-rework/browser';

test('public rework reader journey keeps six primary choices, scoped evidence and exact source access without JS',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}}),page=await context.newPage();
 await page.goto(base);
 await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link')).toHaveText(['Start','Concepts','Evidence','Research','Documents','Search']);
 await expect(page.locator('[data-canonical-body] p').first()).toContainText('Some bacteria change the acidity');
 await expect(page.locator('[data-source-projection]')).not.toBeVisible();
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
 await page.getByRole('link',{name:'Follow the explanation',exact:false}).click();
 await expect(page.locator('[data-canonical-body]')).toContainText('Recursive Resonant Geometry');
 await expect(page.locator('main')).not.toContainText('Unity Theory');
 await expect(page.locator('main')).not.toContainText('author approval pending');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Concepts',exact:true}).click();
 await expect(page.locator('[data-canonical-body] math')).toHaveCount(3);
 await expect(page.getByRole('link',{name:'minimal locked core',exact:true})).toHaveAttribute('href',base+'documents/locked-core/');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Evidence',exact:true}).click();
 const table=page.locator('[data-canonical-body] table');await expect(table.locator('tbody tr')).toHaveCount(22);
 await expect(table).not.toContainText('UT-E');
 await expect(table.getByRole('row').filter({hasText:'v0.2.1:E17'})).toContainText('constraint');
 await expect(table.getByRole('row').filter({hasText:'v0.2.1:E22'})).toContainText('constraint / comparator');
 await expect(page.locator('[data-canonical-body] a[href$="evidence/source-links/"]')).toHaveCount(2);
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Research',exact:true}).click();
 await expect(page.getByRole('complementary',{name:'Research overview'})).toBeVisible();
 await expect(page.locator('[data-canonical-body]')).toContainText('The full source-to-repeated-level causal sequence is not established');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Documents',exact:true}).click();
 await expect(page.locator('[data-document-library]')).toContainText('Governance and provenance');
 await expect(page.locator('[data-document-library] a').filter({hasText:'Original source (exact bytes)'}).first()).toBeVisible();
 await page.getByRole('navigation',{name:'More about RRG'}).getByRole('link',{name:'Cite',exact:true}).click();
 await expect(page.locator('[data-citation] summary').filter({hasText:'Reproducibility details'})).toBeVisible();
 await expect(page.locator('[data-citation] dd').first()).not.toBeVisible();
 await page.getByText('Reproducibility details',{exact:true}).click();await expect(page.locator('[data-citation] dd').first()).toBeVisible();
 await page.getByRole('navigation',{name:'More about RRG'}).getByRole('link',{name:'Sources',exact:true}).click();
 await expect(page.locator('[data-bibliography]')).toContainText('Why it is here:');
 const links=page.locator('[data-bibliography] a[href*="/claims/"]');expect(await links.count()).toBeGreaterThan(0);
 expect(await links.first().innerText()).not.toMatch(/^UT-/);
 await context.close();
});

test('public rework reading and support pages reflow at five widths with light and dark accessibility checks',async({page})=>{
 test.setTimeout(60000);
 const routes=['','start/','concepts/','evidence/','research-status/','documents/','references/','cite/','about/','search/','math/','not-a-real-rework-route/'];
 for(const route of routes){
  await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:1000});const response=await page.goto(base+route);
  expect(response?.status(),route).toBe(route.startsWith('not-a-real')?404:200);
  for(const width of [1440,1024,768,390,320]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route+' '+width).toBe(true);
  }
  const light=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(light.violations,route+JSON.stringify(light.violations)).toEqual([]);
  await page.emulateMedia({colorScheme:'dark'});
  const dark=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(dark.violations,route+JSON.stringify(dark.violations)).toEqual([]);
  if(['','concepts/','evidence/','research-status/','documents/','cite/'].includes(route)){
   await page.setViewportSize({width:390,height:900});await page.screenshot({path:`${evidence}/${suffix}-${route.replaceAll('/','')||'home'}-mobile-dark.png`,fullPage:true});
   await page.emulateMedia({colorScheme:'light'});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`${evidence}/${suffix}-${route.replaceAll('/','')||'home'}-desktop.png`,fullPage:true});
  }
  if(route==='math/'){expect(await page.locator('math').count()).toBeGreaterThan(0);await expect(page.locator('.katex-error')).toHaveCount(0);}
 }
});
