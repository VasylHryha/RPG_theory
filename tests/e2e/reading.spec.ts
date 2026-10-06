import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const artifact=JSON.parse(readFileSync(join(process.env.UNITY_TEST_OUTPUT!, 'build-info.json'),'utf8'));
function fidelity(id:string) {
  const state=artifact.publicationManifest.entries.find((e:{id:string})=>e.id===id)?.reviewState;
  if(!['accepted','pending','stale','rejected'].includes(state)) throw new Error(`Missing artifact review state: ${id}`);
  return {accepted:'Faithful to the supplied documents',pending:'Pending',stale:'Stale — rereview required',rejected:'Rejected — revision required'}[state as 'accepted'|'pending'|'stale'|'rejected'];
}
const referenceRecords=JSON.parse(readFileSync('research/publication/references.yaml','utf8'));
const base = process.env.UNITY_TEST_BASE ?? '/';
const suffix = base === '/' ? 'root' : 'subpath';
const evidence = process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m1';

test('home and start read without JavaScript, navigate by keyboard and keep source notes optional', {tag:'@routine'}, async ({ browser, page: accessiblePage }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(process.env.UNITY_TEST_ORIGIN + base);
  await expect(page.locator('h1')).toHaveText('How can organization make further organization possible?');
  await expect(page.locator('.pathway-grid > a')).toHaveCount(3);
  await expect(page.locator('.hero [data-editorial-state]')).toHaveCount(0);
  await expect(page.locator('[data-source-projection]')).not.toBeVisible();
  await expect(page.getByText('Public introduction: author approval pending.', {exact:true})).toHaveCount(0);
  const introductionWords=(await page.locator('[data-canonical-body="DOC-HOME"]').innerText()).split(/\s+/).filter(Boolean).length;
  expect(introductionWords).toBeLessThan(200);
  await page.screenshot({ path: `${evidence}/${suffix}-home-desktop.png`, fullPage: true });
  await page.getByText('About the source documents',{exact:true}).click();
  await expect(page.getByText('Current sources available', { exact: true })).toBeVisible();
  await page.getByText('Source notes',{exact:true}).click();
  await expect(page.locator('[data-editorial-state="DOC-HOME"]')).toContainText(`Source fidelity: ${fidelity('DOC-HOME')}.`);
  const homeState=artifact.publicationManifest.entries.find((e:{id:string})=>e.id==='DOC-HOME').publicationState;
  await expect(page.locator('[data-editorial-state="DOC-HOME"]')).toContainText(`Publication: ${homeState==='draft'?'Draft · private preview':homeState}.`);
  await page.getByText('Source notes',{exact:true}).click();
  await page.getByText('About the source documents',{exact:true}).click();
  await page.reload();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('link', { name: 'Start with the idea', exact: false }).click();
  await expect(page).toHaveURL(new RegExp(base + 'start/'));
  await expect(page.locator('h1')).toHaveText('Start with the idea');
  await expect(page.locator('[data-editorial-state="DOC-START"]')).toContainText(`Source fidelity: ${fidelity('DOC-START')}.`);
  const startState=artifact.publicationManifest.entries.find((e:{id:string})=>e.id==='DOC-START').publicationState;
  await expect(page.locator('[data-editorial-state="DOC-START"]')).toContainText(`Publication: ${startState==='draft'?'Draft · private preview':startState}.`);
  await page.getByRole('link', { name: 'Return to the research question' }).click();
  await expect(page.locator('#research-question')).toBeVisible();
  await page.setViewportSize({width:320,height:800});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await context.close();
  // axe's frame scanner needs scripting; the reading journey above runs without it.
  await accessiblePage.setViewportSize({width:320,height:800});
  await accessiblePage.goto(base);
  expect(await accessiblePage.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const accessibility=await new AxeBuilder({page:accessiblePage}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(accessibility.violations,JSON.stringify(accessibility.violations,null,2)).toEqual([]);
  await accessiblePage.screenshot({path:`${evidence}/${suffix}-home-mobile.png`,fullPage:true});
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

test('unknown routes return real 404 and nested assets use the configured base', {tag:'@routine'}, async ({ page, request }) => {
  const response = await page.goto(base + 'unknown-page/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('return to the question');
  await page.getByRole('link', { name: 'Return home', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('How can organization make further organization possible?');
  expect((await request.get(base + 'favicon.svg')).status()).toBe(200);
  if (base !== '/') expect((await request.get('/favicon.svg')).status()).toBe(404);
  const info = await (await request.get(base + 'build-info.json')).json();
  expect(info.deployEligible).toBe(artifact.mode === 'release');
  expect(info.currentSourceQualified).toBe(artifact.currentSourceQualified);
  expect(info.config.basePath).toBe(base);
});


test('M1 consumers retain source roles and reported evidence independently of website fidelity', async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-D01/');
  await expect(page.locator('[data-canonical-body]')).toContainText('Geometry is not limited to visible Euclidean shape');
  await expect(page.locator('.record-status')).toContainText('Definition');
  await expect(page.locator('.record-status')).toContainText(fidelity('UT-D01'));
  await expect(page.locator('.record-status')).toContainText('Draft');
  expect(await page.locator('math').count()).toBeGreaterThan(0);
  await page.screenshot({path:`${evidence}/${suffix}-claim-definition.png`,fullPage:true});
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-E01/');
  await expect(page.locator('.record-status')).toContainText('Evidence reported by the supplied documents');
  await expect(page.locator('.record-status')).toContainText(fidelity('UT-E01'));
  await expect(page.locator('[data-canonical-body]')).toContainText('Designed, pumped fibre-laser system');
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-E05/');
  await expect(page.locator('.record-status')).toContainText('Evidence reported by the supplied documents');
  await expect(page.locator('.record-status')).toContainText(fidelity('UT-E05'));
  await expect(page.locator('.record-status')).toContainText('Historical source');
  await expect(page.locator('[data-canonical-body]')).toContainText('potassium clamping suppresses');
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-E01/');
  await page.locator('a[href*="references/#BIB-"]').first().click();
  await expect(page.locator('h1')).toHaveText('Literature and sources');
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/geometry-and-modes/');
  await expect(page.locator('[data-canonical-body]')).toContainText('Organization at a chosen scale');
  await expect(page.locator('.record-status')).toContainText(fidelity('DOC-CONCEPT-GEOMETRY'));
  await expect(page.locator('.record-status')).toContainText('Draft');
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'research-status/');
  await expect(page.locator('[data-canonical-body]')).toContainText('Remaining gaps and publication boundary');
  await expect(page.locator('[data-canonical-body]')).toContainText('full source-to-repeated-level causal sequence is not established');
  await page.screenshot({path:`${evidence}/${suffix}-research-status.png`,fullPage:true});
  await page.getByRole('link',{name:'Read claims, evidence limits and open questions'}).click();
  await expect(page.locator('table')).toHaveCount(1);
  await expect(page.locator('table')).toContainText('Persistent combinations become new effective units');
  await expect(page.locator('table').first()).toContainText('Proposed hierarchy');
  await context.close();
});

test('M1 claims, concepts, status, matrix and bibliography pass axe and 320px reflow',async({page})=>{
  for(const route of ['claims/UT-D01/','claims/UT-E01/','concepts/geometry-and-modes/','research-status/','research-status/claims/','references/']) {
    await page.setViewportSize({width:320,height:800});await page.goto(base+route);
    const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(audit.violations,JSON.stringify(audit.violations,null,2)).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    if(route.includes('research-status/claims')) {
      await page.locator('table').first().focus(); await page.keyboard.press('ArrowRight');
      await expect.poll(()=>page.locator('table').first().evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
      await page.screenshot({path:`${evidence}/${suffix}-proof-matrix-mobile.png`,fullPage:true});
    }
  }
});

test('literature has source-backed DOI identities and usable source extraction details without JS',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}}),page=await context.newPage();
  await page.goto(process.env.UNITY_TEST_ORIGIN+base+'references/');
  await expect(page.locator('[data-bibliography] > ol > li')).toHaveCount(referenceRecords.filter((r:{id:string;primaryId?:string})=>artifact.publicationManifest.referenceIds.includes(r.id) && !r.primaryId).length);
  await expect(page.locator('[data-bibliography] a[href^="https://doi.org/"]')).toHaveCount(referenceRecords.filter((r:{id:string;primaryId?:string;url:string})=>artifact.publicationManifest.referenceIds.includes(r.id) && !r.primaryId && r.url.startsWith('https://doi.org/')).length);
  const paper=page.locator('#BIB-0022');await expect(paper.getByRole('heading')).toHaveText('Formation of optical supramolecular structures in a fibre laser by tailoring long-range soliton interactions');
  await expect(paper.getByRole('link',{name:'DOI: 10.1038/s41467-019-13746-6'})).toHaveAttribute('href','https://doi.org/10.1038/s41467-019-13746-6');
  await expect(paper).toContainText('Supplementary reference reported by the supplied documents');
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
