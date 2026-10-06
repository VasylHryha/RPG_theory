import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE??'/',suffix=base==='/'?'root':'subpath',evidence=process.env.UNITY_EVIDENCE_DIR??'docs/evidence/m6/implementation';
test('M6 launch search returns real readings with keyboard controls and no-JS browsing',{tag:'@routine'},async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
 await page.goto(base+'search/');await expect(page.locator('[data-search-fallback] li')).toHaveCount(68);
 await page.locator('[data-search-fallback]').getByRole('link',{name:'concepts',exact:true}).click();await expect(page.locator('h1')).toContainText('concepts');await context.close();
 const js=await browser.newPage(),requests:string[]=[];js.on('request',r=>requests.push(r.url()));
 await js.goto(base);expect(requests.some(r=>r.includes('pagefind') || r.includes('search-client'))).toBe(false);
 await js.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Search',exact:true}).click();
 await js.locator('#search-query').focus();await js.keyboard.press('Enter');await expect(js.getByRole('status')).toContainText('Enter a word');
 await js.locator('#search-query').fill('geometry');await js.keyboard.press('Enter');await expect(js.locator('#search-results li').first()).toBeVisible();
 const href=await js.locator('#search-results a').first().getAttribute('href');expect(href).toContain(base);
 await js.locator('#search-results a').first().click();await expect(js.locator('[data-canonical-body]')).toBeVisible();
 expect(requests.some(r=>r.includes('pagefind/'))).toBe(true);await js.close();
});
for(const width of [320,375,768,1280])test(`M6 representative layouts pass reflow and WCAG axe at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 for(const route of ['', 'start/','examples/string/','concepts/geometry-and-modes/','framework/','math/','research-status/claims/','articles/how-existing-structures-make-new-organization-possible/','documents/','legal/','search/']) {
  await page.goto(base+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(audit.violations,route+JSON.stringify(audit.violations)).toEqual([]);
 }
 if(width===320){await page.screenshot({path:`${evidence}/${suffix}-search-mobile.png`,fullPage:true});}
});
test('M6 search focus, doubled text, reduced motion and dark mode remain usable',async({page})=>{
 await page.setViewportSize({width:375,height:900});await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.goto(base+'search/');
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
 await page.locator('#search-query').focus();expect(await page.locator('#search-query').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth;})).toBe(true);
 await page.addStyleTag({content:':root{font-size:36px !important}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});
