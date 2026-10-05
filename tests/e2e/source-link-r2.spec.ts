import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { sha256 } from '../../src/lib/identity.js';
const base=process.env.UNITY_TEST_BASE!;
const evidence=process.env.UNITY_EVIDENCE_DIR!;
const suffix=base==='/'?'root':'subpath';

test('R2 source connections keep distinct document labels, alternate targets and downloads without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(base+'evidence/');
  await page.getByRole('link',{name:'source and label reading map',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Sources, local labels and limited connections');
  await page.screenshot({path:`${evidence}/${suffix}-source-links-desktop.png`});
  const possibility=page.getByRole('link',{name:'Possibility-space growth',exact:true});
  expect(await possibility.getAttribute('href')).toMatch(new RegExp('^'+base+'framework/recursive-background/#c1'));
  await possibility.click();
  await expect(page.locator(':target')).toContainText('C1 — Possibility-space growth');
  await page.goto(base+'evidence/source-links/');
  await page.getByRole('link',{name:'Geometry and mode structure constrain or affect one another.',exact:true}).click();
  await expect(page.locator(':target')).toHaveText('Claim map');
  await page.goto(base+'references/');
  const selected=JSON.parse(readFileSync(join(process.env.UNITY_TEST_OUTPUT!,'build-info.json'),'utf8')).publicationManifest.referenceIds;
  for(const id of ['BIB-0040','BIB-0045','BIB-0047','BIB-0050','BIB-0052']){
    if(selected.includes(id))await expect(page.locator('#'+id)).toBeAttached();
    else await expect(page.locator('#'+id)).toHaveCount(0);
  }
  await expect(page.locator('#BIB-0026')).toContainText('simulated interruption of feedback');
  const exported=await page.request.get(base+'downloads/explanatory/DOC-SOURCE-LINKS.md');
  expect(exported.status()).toBe(200);expect(await exported.text()).toContain('not endorsements');expect(await exported.text()).not.toContain('./DOC-ADDITIONAL-EVIDENCE.md');
  const original=await page.request.get(base+'downloads/original/R-CURRENT-CATALOGUE.md');
  expect(original.status()).toBe(200);expect(sha256(await original.body())).toBe(sha256(readFileSync('research/RRG_CURRENT/06_evidence_catalog.md')));
  await context.close();
});

for(const width of [320,375,768,1280])test(`R2 affected readings preserve reflow and accessibility at ${width}px`,async({page})=>{
  test.setTimeout(90_000);
    await page.setViewportSize({width,height:900});
    for(const route of ['evidence/source-links/','framework/','math/','examples/cell/','examples/molecule/']){
      await page.goto(base+route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${route}`).toBe(true);
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(result.violations,`${width} ${route}: ${JSON.stringify(result.violations)}`).toEqual([]);
    }
  if(width===320){await page.goto(base+'evidence/source-links/');await page.screenshot({path:`${evidence}/${suffix}-source-links-mobile.png`});}
});
