import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE ?? '/';
const suffix=base==='/'?'root':'subpath';
const evidence=process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m3/implementation';

test('M3 technical reading and source discovery work without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}}),page=await context.newPage();
  const failures:string[]=[];page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  await page.goto(process.env.UNITY_TEST_ORIGIN+base);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Framework',exact:true}).click();
  await expect(page.locator('[data-technical-guide]')).toContainText('02_scientific_framework.md');
  await page.screenshot({path:`${evidence}/${suffix}-framework-desktop.png`});
  await page.getByText('On this page (',{exact:false}).click();
  await page.locator('.technical-toc').getByRole('link',{name:'11. The four interactions: current RRG position',exact:true}).click();
  await expect(page.locator('[id="11-the-four-interactions-current-rrg-position"]')).toBeInViewport();
  for(const route of ['math/','evidence/','framework/recursive-background/','math/illustrations/','evidence/catalogue/','research-status/','research-status/claims/','open-problems/','documents/','documents/locked-core/','changes/','changes/source-history/']) {
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('navigation',{name:'Technical reading'})).toBeVisible();
    await expect(page.locator('[data-record-status]')).toContainText('Draft · private preview');
  }
  expect(failures).toEqual([]);await context.close();
});

test('M3 equations and technical readings remain accessible at 320px in dark mode',async({page})=>{
  await page.setViewportSize({width:320,height:800});await page.emulateMedia({colorScheme:'dark'});
  for(const route of ['framework/','math/','evidence/','framework/recursive-background/','math/illustrations/','evidence/catalogue/','open-problems/','documents/locked-core/','changes/']) {
    await page.goto(base+route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route).toBe(true);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(audit.violations,JSON.stringify(audit.violations)).toEqual([]);
    if(route==='math/') {
      expect(await page.locator('math').count()).toBeGreaterThan(50);
      // Mismatched KaTeX CSS collapsed source \boxed{} borders to vertical
      // strokes through the equations, despite valid MathML and no parse error.
      const force=page.locator('.katex-display').filter({has:page.locator('annotation',{hasText:'F_q=-'})}).first();
      const box=force.locator('.fbox');
      expect(await box.evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(40);
      expect(await box.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(20);
      const equation=page.locator('.katex-display').filter({has:page.locator('annotation', {hasText:'\\Gamma_k[D,\\Psi]'})}).first();
      await equation.scrollIntoViewIfNeeded();await equation.focus();
      expect(await equation.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
      await page.keyboard.press('ArrowRight');await expect.poll(()=>equation.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
      await page.screenshot({path:`${evidence}/${suffix}-math-mobile-equation.png`});
      await page.goto(base+'math/#40-next-concrete-calculation');
      await page.screenshot({path:`${evidence}/${suffix}-math-next-calculation.png`});
    }
    if(route==='evidence/catalogue/')await page.screenshot({path:`${evidence}/${suffix}-evidence-catalogue-mobile.png`});
  }
});

test('M3 evidence attribution, scope and open tests remain visible beside the actual sources',async({page})=>{
  await page.goto(base+'evidence/catalogue/');
  await expect(page.locator('[data-technical-guide]')).toContainText('source-reported');
  await expect(page.locator('[data-canonical-body] h2').filter({hasText:/^E\d\d —/})).toHaveCount(22);
  await expect(page.locator('[data-canonical-body]')).toContainText('Already supplied');
  await page.goto(base+'research-status/');
  await expect(page.locator('[data-canonical-body]')).toContainText('full source-to-repeated-level causal sequence is not established');
  await page.goto(base+'open-problems/');
  await page.getByRole('link',{name:'UT-O104',exact:true}).click();
  await expect(page).toHaveURL(new RegExp('claims/UT-O104/$'));
  await expect(page.locator('[data-canonical-body]')).toContainText('do not derive that claim');
});
