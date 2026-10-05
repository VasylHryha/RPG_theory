import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE ?? '/',evidence=process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m5/implementation',suffix=base==='/'?'root':'subpath';
test('M5 approved About/contact and scoped research rights journey works without JavaScript and dependency notice is downloadable',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
 await page.goto(base);await page.locator('[data-publication-footer]').getByRole('link',{name:'About and contact'}).click();
 await expect(page.locator('[data-about]')).toContainText('Approved public credit: Vasyl Hryha');
 await expect(page.locator('[data-about] a[href="mailto:vasylhryha.rpg@gmail.com"]')).toBeVisible();
 await page.locator('[data-about]').getByRole('link',{name:'Rights and reuse'}).click();
 for(const scope of ['Website code','Data and evidence'])await expect(page.locator('[data-legal]')).toContainText(scope+': no additional license granted');
 await expect(page.locator('[data-legal]')).toContainText('Research prose and figures: CC BY-NC-SA 4.0');
 await expect(page.locator('[data-legal]')).toContainText('1 January 2033 at 00:00 UTC');
 await expect(page.locator('[data-legal]')).toContainText('lawful exceptions');
 const notice=await page.request.get(base+'downloads/THIRD-PARTY-NOTICES.txt');expect(notice.status()).toBe(200);expect(await notice.text()).toContain('Copyright (c) 2013-2020 Khan Academy');
 await page.locator('[data-publication-footer]').getByRole('link',{name:'Cite',exact:true}).click();await expect(page.locator('[data-citation] a[href$="CITATION.cff"]')).toBeVisible();
 await context.close();
});
test('M5 policy pages and expanded footer reflow at 320px with no axe violations',async({page})=>{
 await page.setViewportSize({width:320,height:800});
 for(const route of ['about/','legal/','cite/']){
  await page.goto(base+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route).toBe(true);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(results.violations,route+JSON.stringify(results.violations)).toEqual([]);
  await page.screenshot({path:`${evidence}/${suffix}-${route.replace('/','')}-mobile.png`,fullPage:true});
 }
});
