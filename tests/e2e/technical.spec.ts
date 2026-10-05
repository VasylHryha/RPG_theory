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
  for(const route of ['math/','evidence/','evidence/interactions/','evidence/additional/','research-status/','research-status/proof-matrix/','open-problems/','documents/','documents/locked-core/','changes/','changes/source-history/']) {
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('navigation',{name:'Technical reading'})).toBeVisible();
    await expect(page.locator('[data-record-status]')).toContainText('Draft · private preview');
  }
  expect(failures).toEqual([]);await context.close();
});

test('M3 equations and technical readings remain accessible at 320px in dark mode',async({page})=>{
  await page.setViewportSize({width:320,height:800});await page.emulateMedia({colorScheme:'dark'});
  for(const route of ['framework/','math/','evidence/','evidence/interactions/','evidence/additional/','open-problems/','documents/locked-core/','changes/']) {
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
    if(route==='evidence/additional/')await page.screenshot({path:`${evidence}/${suffix}-additional-evidence-mobile.png`});
  }
});

test('M3 evidence attribution, scope and open tests remain visible beside the actual sources',async({page})=>{
  await page.goto(base+'evidence/additional/');
  await expect(page.locator('[data-technical-guide]')).toContainText('not new paper inspections');
  await expect(page.locator('[data-canonical-body]')).toContainText('full manuscript was not accessible');
  await expect(page.locator('[data-canonical-body]')).toContainText('subscription full text not inspected');
  await page.goto(base+'evidence/interactions/#5-what-remains-open');
  await expect(page.locator('[data-canonical-body]')).toContainText('They also do not prove that all forces are literally scalar frequencies');
  await page.goto(base+'open-problems/');
  await page.getByRole('link',{name:'mathematical model’s strong failure conditions'}).click();
  await expect(page).toHaveURL(new RegExp('math/#19-strong-failure-conditions$'));
  await expect(page.locator('[id="19-strong-failure-conditions"]')).toBeInViewport();
});
