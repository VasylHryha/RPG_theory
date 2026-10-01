import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.UNITY_TEST_BASE ?? '/';
const suffix = base === '/' ? 'root' : 'subpath';
const evidence = process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m1';

test('home and start read without JavaScript, navigate by keyboard and show source state', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(process.env.UNITY_TEST_ORIGIN + base);
  await expect(page.locator('h1')).toContainText('become a whole?');
  await expect(page.getByText('Current sources available', { exact: true })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.screenshot({ path: `${evidence}/${suffix}-home-desktop.png`, fullPage: false });
  await page.getByRole('link', { name: 'Start with the idea', exact: false }).click();
  await expect(page).toHaveURL(new RegExp(base + 'start/'));
  await expect(page.locator('h1')).toHaveText('Start with the idea');
  await page.getByRole('link', { name: 'Return to the research question' }).click();
  await expect(page.locator('#research-question')).toBeVisible();
  await context.close();
});

test('home, nested reading and math pass automated accessibility and 320px reflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const route of ['', 'start/', 'fixtures/math/']) {
    await page.goto(base + route);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(audit.violations, JSON.stringify(audit.violations, null, 2)).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (!route) await page.screenshot({ path: `${evidence}/${suffix}-home-mobile.png`, fullPage: true });
    if (route.includes('math')) {
      await expect(page.locator('.katex').first()).toBeVisible();
      expect(await page.locator('math').count()).toBeGreaterThan(0);
      await expect(page.locator('.katex-error')).toHaveCount(0);
      await expect(page.locator('.katex-display').last()).toHaveAttribute('tabindex', '0');
      expect(await page.locator('.katex-display').last().evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
      await page.locator('.katex-display').last().focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => page.locator('.katex-display').last().evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.fonts.check('16px KaTeX_Main'))).toBe(true);
      await page.screenshot({ path: `${evidence}/${suffix}-math-mobile.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  expect(errors).toEqual([]);
});

test('dark-mode reading remains accessible', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(base);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `${evidence}/${suffix}-home-dark.png`, fullPage: true });
});

test('unknown routes return real 404 and nested assets use the configured base', async ({ page, request }) => {
  const response = await page.goto(base + 'unknown-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('return to the question');
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.locator('h1')).toContainText('become a whole?');
  expect((await request.get(base + 'favicon.svg')).status()).toBe(200);
  if (base !== '/') expect((await request.get('/favicon.svg')).status()).toBe(404);
  const info = await (await request.get(base + 'build-info.json')).json();
  expect(info.deployEligible).toBe(false);
  expect(info.currentSourceQualified).toBe(false);
  expect(info.config.basePath).toBe(base);
});


test('M1 source-bound consumers retain status distinctions, source text, citations and pending review without JS', async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-D01/');
  await expect(page.locator('[data-canonical-body]')).toContainText('Geometry is not limited to visible Euclidean shape');
  await expect(page.locator('.record-status')).toContainText('Definition');
  await expect(page.locator('.record-status')).toContainText('Pending');
  await expect(page.locator('.record-status')).toContainText('Draft');
  expect(await page.locator('math').count()).toBeGreaterThan(0);
  await page.screenshot({path:`${evidence}/${suffix}-claim-definition.png`,fullPage:true});
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-E01/');
  await expect(page.locator('.record-status')).toContainText('Source-reported evidence');
  await expect(page.locator('[data-canonical-body]')).toContainText('Designed, pumped fibre-laser system');
  await page.locator('a[href*="references/#BIB-"]').first().click();
  await expect(page.locator('h1')).toHaveText('Literature and sources');
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/geometry-and-modes/');
  await expect(page.locator('[data-canonical-body]')).toContainText('Organization at a chosen scale');
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'research-status/');
  await expect(page.locator('[data-canonical-body]')).toContainText('Open extensions to prove');
  await expect(page.locator('[data-canonical-body]')).toContainText('does not close the claim');
  await page.screenshot({path:`${evidence}/${suffix}-research-status.png`,fullPage:true});
  await page.getByRole('link',{name:'Read the claim and evidence matrix'}).click();
  await expect(page.locator('table')).toHaveCount(1);
  await expect(page.locator('table')).toContainText('Lower-level organization can generate an effective higher-level interaction channel');
  await expect(page.locator('table').first()).toContainText('open extension');
  await context.close();
});

test('M1 claims, concepts, status, matrix and bibliography pass axe and 320px reflow',async({page})=>{
  for(const route of ['claims/UT-D01/','claims/UT-E01/','concepts/geometry-and-modes/','research-status/','research-status/proof-matrix/','references/']) {
    await page.setViewportSize({width:320,height:800});await page.goto(base+route);
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(audit.violations,JSON.stringify(audit.violations,null,2)).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    if(route.includes('proof-matrix')) {
      await page.locator('table').first().focus(); await page.keyboard.press('ArrowRight');
      await expect.poll(()=>page.locator('table').first().evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
      await page.screenshot({path:`${evidence}/${suffix}-proof-matrix-mobile.png`,fullPage:true});
    }
  }
});

test('literature has source-backed DOI identities and usable source extraction details without JS',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}}),page=await context.newPage();
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'references/');
  await expect(page.locator('[data-bibliography] > ol > li')).toHaveCount(15);
  await expect(page.locator('[data-bibliography] a[href^="https://doi.org/"]')).toHaveCount(13);
  const paper=page.locator('#BIB-0022');await expect(paper.getByRole('heading')).toHaveText('Formation of optical supramolecular structures in a fibre laser by tailoring long-range soliton interactions');
  await expect(paper.getByRole('link',{name:'DOI: 10.1038/s41467-019-13746-6'})).toHaveAttribute('href','https://doi.org/10.1038/s41467-019-13746-6');
  await expect(paper).toContainText('Scientific support review remains pending');
  await page.screenshot({path:`${evidence}/${suffix}-literature-mobile.png`,fullPage:true});
  await page.setViewportSize({width:1280,height:900});await page.screenshot({path:`${evidence}/${suffix}-literature-desktop.png`,fullPage:true});
  await paper.getByRole('link',{name:'UT-E01',exact:true}).click();
  await expect(page.locator('[data-record-details] h3',{hasText:'References reported by this source'})).toBeVisible();
  await expect(page.locator('[data-record-details] li a[href*="references/"]')).toHaveCount(1);
  await page.getByText('Source extraction details',{exact:true}).click();
  await expect(page.locator('.binding-receipt')).toContainText(['08_ADDITIONAL_PRIMARY_EVIDENCE.md','Raw excerpt SHA-256']);
  await page.screenshot({path:`${evidence}/${suffix}-evidence-source-details.png`,fullPage:true});
  await context.close();
});
