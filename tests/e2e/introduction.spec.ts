import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE??'/';
const suffix=base==='/'?'root':'subpath';
const evidence=process.env.UNITY_EVIDENCE_DIR??'docs/evidence/m2/implementation';
const routes=['','start/','examples/','examples/water/','examples/string/','examples/molecule/','examples/star/','examples/life-environment/','examples/cell/','concepts/','concepts/geometry-and-modes/','concepts/stability/','concepts/recursion/','concepts/effective-interactions/'];

test('M2 beginner layouts reflow at 320, 375 and 1280 in light and dark with ordered headings and accessible schematics',async({page})=>{
  test.setTimeout(180_000);
  const responses:string[]=[];page.on('response',r=>{if(r.status()>=400)responses.push(r.url());});
  for(const scheme of ['light','dark'] as const) {
    await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});
    for(const width of [320,375,1280]) for(const route of routes) {
      await page.setViewportSize({width,height:900});await page.goto(base+route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${scheme} ${width} ${route}`).toBe(true);
      await expect(page.locator('h1')).toHaveCount(1);
      const levels=await page.locator('main h1,main h2,main h3,main h4').evaluateAll(nodes=>nodes.map(n=>Number(n.tagName.slice(1))));
      expect(levels.every((level,i)=>i===0 || level<=levels[i-1]+1),`${route}: ${levels}`).toBe(true);
      for(const svg of await page.locator('[data-beginner-diagram] svg').all()) {
        await expect(svg).toHaveAttribute('role','img');await expect(svg.locator('title')).not.toBeEmpty();await expect(svg.locator('desc')).not.toBeEmpty();
      }
      if(width===375 && ['','start/','examples/string/','examples/life-environment/','concepts/effective-interactions/'].includes(route))await page.screenshot({path:`${evidence}/${suffix}-m2-${route.replaceAll('/','-')||'home'}${scheme}.png`,fullPage:true});
    }
    // Axe on each complete layout/content variant; reflow above covers all widths.
    for(const route of routes) {
      await page.setViewportSize({width:320,height:900});await page.goto(base+route);
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(result.violations,JSON.stringify(result.violations,null,2)).toEqual([]);
    }
  }
  expect(responses).toEqual([]);
});

test('M2 complete reading journey works without JavaScript and makes question, uncertainty and sources findable',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}}),page=await context.newPage();
  try {
    await page.goto(process.env.UNITY_TEST_ORIGIN+base);
    await expect(page.getByRole('heading',{level:1})).toHaveText('How do parts become a whole?');
    await expect(page.locator('main')).toContainText('whether a useful, predictive organizing principle connects them');
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
    expect(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
    await page.getByRole('link',{name:'Start with the idea',exact:false}).click();
    await expect(page.locator('main')).toContainText('author approval pending');
    await page.getByRole('link',{name:'Life changing its environment',exact:true}).click();
    await expect(page.locator('[data-canonical-body]')).toContainText('no purpose-driven guarantee');
    await expect(page.locator('a[href*="references/#BIB-0062"]').first()).toBeVisible();
    await page.locator('a[href*="references/#BIB-0062"]').first().click();await expect(page.locator('#BIB-0062')).toContainText('background only');
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'examples/string/');
    await expect(page.locator('[data-beginner-diagram]')).toContainText('not measured amplitudes');
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/stability/');
    await expect(page.locator('[data-canonical-body]')).toContainText('not an independently established universal stability theorem');
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/effective-interactions/');
    await expect(page.locator('[data-canonical-body]')).toContainText('four successive RRG levels');
    await expect(page.locator('math')).not.toHaveCount(0);
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/');
    await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Concepts',exact:true})).toHaveAttribute('aria-current','page');
  } finally {await context.close();}
});
