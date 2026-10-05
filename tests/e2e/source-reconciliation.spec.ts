import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { sha256 } from '../../src/lib/identity.js';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE!;
const evidence=process.env.UNITY_EVIDENCE_DIR!;
const suffix=base==='/'?'root':'subpath';

test('source reconciliation reading and section journeys work without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:800}});
  const page=await context.newPage();
  await page.goto(base+'documents/reading-guide/');
  await page.getByRole('link',{name:'04 — Full conceptual companion',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Recursive background and organization');
  await expect(page.locator('[data-technical-guide]')).toContainText('minimal normative core');
  await page.screenshot({path:`${evidence}/${suffix}-conceptual-reading.png`});
  await page.goto(base+'math/illustrations/');
  const sectionLink=page.getByRole('link',{name:'06, E21',exact:true});
  const destination=await sectionLink.getAttribute('href');
  expect(destination).toMatch(new RegExp('^'+base+'evidence/catalogue/#e21'));
  await sectionLink.click();
  await expect(page).toHaveURL(new RegExp('evidence/catalogue/#e21'));
  await expect(page.locator('[id]').filter({hasText:'E21 — Pattern formation in a Swift-Hohenberg equation with spatially periodic coefficients'}).first()).toBeAttached();
  const fragment=destination!.split('#')[1];
  await expect(page.locator(`[id="${fragment}"]`)).toHaveText(/E21 — Pattern formation/);
  await page.goto(base+'research-status/');
  const check=page.getByRole('link',{name:'verification_results.json',exact:true});
  const href=await check.getAttribute('href');
  expect(href).toMatch(/\.json$/);
  await expect(page.locator('[data-canonical-body]')).toContainText('original source file');
  const response=await page.request.get(href!);expect(response.status()).toBe(200);
  expect(sha256(await response.body())).toBe(sha256(readFileSync('research/RRG_CURRENT/checks/verification_results.json')));
  await page.goto(base+'claims/UT-E08/');
  await expect(page.locator('[data-record-status]')).toContainText('preserved historical reading');
  await expect(page.locator('[data-record-status]')).toContainText('not the current source edition');
  await context.close();
});

test('source reconciliation current readings keep usable mobile layout and document destinations',async({page})=>{
  await page.setViewportSize({width:320,height:800});
  for(const route of ['documents/','documents/reading-guide/','framework/recursive-background/','math/illustrations/','evidence/catalogue/','research-status/','research-status/claims/']) {
    await page.goto(base+route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
    expect(await page.locator('[data-canonical-body] a').evaluateAll(links=>links.map(link=>link.getAttribute('href')).filter(href=>href && /^(?:\.\.?\/|[^/#:]+\.md(?:#|$)|research\/)/.test(href)))).toEqual([]);
  }
  await page.goto(base+'documents/');
  await page.screenshot({path:`${evidence}/${suffix}-library-mobile.png`});
});

test('reconciled source reading layouts pass M6 accessibility at all four widths',async({page})=>{
  test.setTimeout(90_000);
  for(const width of [320,375,768,1280]){
    await page.setViewportSize({width,height:900});
    for(const route of ['documents/world-explanation/','documents/reading-guide/','documents/source-authority/','framework/recursive-background/','math/illustrations/','evidence/catalogue/','research-status/']){
      await page.goto(base+route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}: ${route}`).toBe(true);
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(result.violations,`${width}: ${route}: ${JSON.stringify(result.violations)}`).toEqual([]);
    }
  }
});
