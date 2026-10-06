import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE ?? '/',evidence=process.env.UNITY_EVIDENCE_DIR!,suffix=base==='/'?'root':'target';

test('whole-site connected contribution, definition and source journeys work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
 await page.goto(base+'examples/cell/');
 await page.locator('[data-canonical-body] a[href$="examples/life-environment/"]').first().click();
 await expect(page.locator('[data-canonical-body]')).toContainText('acidity');
 await page.locator('[data-canonical-body] a[href$="#BIB-0089"]').first().click();
 await expect(page.locator('#BIB-0089')).toContainText('What was checked:');
 await page.goto(base+'concepts/geometry-and-modes/');
 await page.locator('[data-canonical-body] a[href$="claims/UT-D02/"]').first().click();
 await expect(page.locator('[data-canonical-body]')).toContainText(/mode structure/i);
 await page.goto(base+'claims/UT-O101/');
 await expect(page.getByRole('heading',{name:'Investigate one part'})).toBeVisible();
 await page.locator('[data-canonical-body] a[href$="about/#contribute"]').click();
 await expect(page.locator('#contribute')).toBeVisible();
 await expect(page.locator('[data-about] a[href^="mailto:"]')).toHaveAttribute('href','mailto:vasylhryha.rrg@gmail.com');
 await page.goto(base+'math/');
 await page.locator('[data-technical-guide] a[href$="documents/foundation-errata/"]').click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Errata for older foundation snapshots');
 await page.goto(base+'evidence/source-links/');
 await page.getByRole('link',{name:'Resolve a source-local label',exact:true}).click();
 await expect(page.locator('#document-and-edition-qualified-labels')).toBeInViewport();
 const exported=await page.request.get(base+'downloads/explanatory/UT-O101.md');
 expect(exported.status()).toBe(200);expect(await exported.text()).toContain('Investigate one part');
 expect(await exported.text()).toContain(base+'about/#contribute');
 await context.close();
});

test('whole-site revised page families and two-role diagram keep mobile and dark accessibility',async({page})=>{
 test.setTimeout(60_000);
 for(const route of ['examples/cell/','concepts/geometry-and-modes/','concepts/recursion/','claims/UT-O101/','articles/how-existing-structures-make-new-organization-possible/','articles/when-can-a-whole-be-treated-as-one-useful-unit/']){
  await page.setViewportSize({width:320,height:900});await page.emulateMedia({colorScheme:'dark'});await page.goto(base+route);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations,route+JSON.stringify(result.violations)).toEqual([]);
  if(route==='concepts/recursion/'){
   const diagram=page.locator('[data-beginner-diagram]');await expect(diagram).toContainText('distinct outward roles');
   await diagram.scrollIntoViewIfNeeded();await page.screenshot({path:`${evidence}/${suffix}-two-roles-mobile.png`});
  }
  await page.screenshot({path:`${evidence}/${suffix}-${route.replaceAll('/','-')}-mobile.png`,fullPage:true});
 }
});
