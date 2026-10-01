# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reading.spec.ts >> M1 source-bound consumers retain status distinctions, source text, citations and pending review without JS
- Location: tests/e2e/reading.spec.ts:75:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.prose')
Expected substring: "Designed, pumped fibre-laser system"
Error: strict mode violation: locator('.prose') resolved to 2 elements:
    1) <div class="prose" data-canonical-body="UT-E01">…</div> aka getByText('E01 — He et al. (2019) Formation of optical supramolecular structures in a')
    2) <section class="prose">…</section> aka getByText('Scope and sourceDesigned,')

Call log:
  - Expect "toContainText" locator('.prose') with timeout 5000ms
  - waiting for locator('.prose')

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - link "Skip to content" [ref=f1e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=f1e3]: Private engineering preview · Draft wording, awaiting source-bound review
  - banner [ref=f1e4]:
    - link "Unity Theory home" [ref=f1e5] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=f1e6]: ↔
      - text: Unity Theory
    - navigation "Main navigation" [ref=f1e7]:
      - link "Research status" [ref=f1e8] [cursor=pointer]:
        - /url: /research-status/
      - link "Definitions" [ref=f1e9] [cursor=pointer]:
        - /url: /concepts/geometry-and-modes/
      - link "Literature" [ref=f1e10] [cursor=pointer]:
        - /url: /references/
      - link "The question" [ref=f1e11] [cursor=pointer]:
        - /url: /
      - link "Start simply" [ref=f1e12] [cursor=pointer]:
        - /url: /start/
        - text: Start simply ↗
  - main [ref=f1e13]:
    - article [ref=f1e14]:
      - generic [ref=f1e15]:
        - paragraph [ref=f1e16]: UT-E01 · Revision 1
        - heading "Formation of optical supramolecular structures in a fibre laser by tailoring long-range soliton interactions" [level=1] [ref=f1e17]
        - paragraph [ref=f1e18]: Source-reported external experiment or restricted result; primary-paper qualification remains pending.
      - generic [ref=f1e19]:
        - generic [ref=f1e20]:
          - term [ref=f1e21]: Scientific role
          - definition [ref=f1e22]: Evidence
        - generic [ref=f1e23]:
          - term [ref=f1e24]: Evidence
          - definition [ref=f1e25]: Source-reported evidence; independent qualification pending
        - generic [ref=f1e26]:
          - term [ref=f1e27]: Content review
          - definition [ref=f1e28]: Pending
        - generic [ref=f1e29]:
          - term [ref=f1e30]: Publication
          - definition [ref=f1e31]: Draft · private preview
      - generic [ref=f1e32]:
        - heading "E01 — He et al. (2019)" [level=3] [ref=f1e33]
        - paragraph [ref=f1e34]:
          - strong [ref=f1e35]: Formation of optical supramolecular structures in a fibre laser by tailoring long-range soliton interactions
          - text: "Nature Communications 10, 5756. DOI:"
          - link "10.1038/s41467-019-13746-6" [ref=f1e36] [cursor=pointer]:
            - /url: https://doi.org/10.1038/s41467-019-13746-6
        - paragraph [ref=f1e37]:
          - strong [ref=f1e38]: "Classification:"
          - text: supports core / domain-specific realization.
          - strong [ref=f1e39]: "Evidence:"
          - text: Experiment with theoretical modelling.
          - strong [ref=f1e40]: "Existing clauses:"
          - text: §3, §5, §6, §7, §8.
        - paragraph [ref=f1e41]: Mixed assemblies contain single pulses, pairs and triplets; internal pair dynamics coexist with larger-scale optical–acoustic organization.
        - paragraph [ref=f1e42]:
          - strong [ref=f1e43]: "Scope:"
          - text: Designed, pumped fibre-laser system; optical molecules are bound pulses, not chemical molecules.
        - paragraph [ref=f1e44]:
          - strong [ref=f1e45]: "Checked:"
          - text: Full primary paper and supplementary text; Figure 3 inspected as a rendered page.
          - strong [ref=f1e46]: "Location:"
          - text: "Main paper: Results, Elementary diversity; Figures 1 and 3; Supplementary Note 8."
          - strong [ref=f1e47]: "Inspected source:"
          - link "https://photonics.umbc.edu/wp-content/uploads/sites/688/2022/02/PAJ296.pdf" [ref=f1e48] [cursor=pointer]:
            - /url: https://photonics.umbc.edu/wp-content/uploads/sites/688/2022/02/PAJ296.pdf
      - generic [ref=f1e49]:
        - heading "Scope and source" [level=2] [ref=f1e50]
        - paragraph [ref=f1e51]: Designed, pumped fibre-laser system; optical molecules are bound pulses, not chemical molecules.
        - paragraph [ref=f1e52]: Designed, pumped fibre-laser system; optical molecules are bound pulses, not chemical molecules.
        - paragraph [ref=f1e53]:
          - text: "Extracted from 08_ADDITIONAL_PRIMARY_EVIDENCE.md, lines 17–32. Raw excerpt SHA-256:"
          - code [ref=f1e54]: 86b4deadb9e57bf6aa3e865f82648f213a0c63605c59b5a3e16fa24c18973b45
        - paragraph [ref=f1e55]: 08_ADDITIONAL_PRIMARY_EVIDENCE.md E01 → UT-E01; original identifier preserved.
        - heading "Depends on" [level=3] [ref=f1e56]
        - list [ref=f1e57]:
          - listitem [ref=f1e58]:
            - link "UT-D03 — Resonant geometry" [ref=f1e59] [cursor=pointer]:
              - /url: /claims/UT-D03/
          - listitem [ref=f1e60]:
            - link "UT-D06 — Higher-level formation" [ref=f1e61] [cursor=pointer]:
              - /url: /claims/UT-D06/
        - heading "References reported by this source" [level=3] [ref=f1e62]
        - list [ref=f1e63]:
          - listitem [ref=f1e64]:
            - link "Formation of optical supramolecular structures in a fibre laser by tailoring long-range soliton interactions" [ref=f1e65] [cursor=pointer]:
              - /url: /references/#BIB-0022
          - listitem [ref=f1e66]:
            - link "Formation of optical supramolecular structures in a fibre laser by tailoring long-range soliton interactions" [ref=f1e67] [cursor=pointer]:
              - /url: /references/#BIB-0023
  - complementary "Source availability" [ref=f1e68]:
    - generic [ref=f1e70]:
      - strong [ref=f1e71]: Current sources available
      - paragraph [ref=f1e72]: 13 supplied files checked against the recorded edition. Website explanations are drafts; content review is pending.
  - contentinfo [ref=f1e73]:
    - paragraph [ref=f1e74]: Unity Theory / Recursive Resonant Geometry
    - paragraph [ref=f1e75]: A working research framework · Local preview
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | const base = process.env.UNITY_TEST_BASE ?? '/';
  4   | const suffix = base === '/' ? 'root' : 'subpath';
  5   | const evidence = process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m0';
  6   | 
  7   | test('home and start read without JavaScript, navigate by keyboard and show source state', async ({ browser }) => {
  8   |   const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  9   |   const page = await context.newPage();
  10  |   await page.goto(process.env.UNITY_TEST_ORIGIN + base);
  11  |   await expect(page.locator('h1')).toContainText('become a whole?');
  12  |   await expect(page.getByText('Current sources available', { exact: true })).toBeVisible();
  13  |   await page.keyboard.press('Tab');
  14  |   await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  15  |   await page.keyboard.press('Enter');
  16  |   await expect(page.locator('main')).toBeFocused();
  17  |   await page.screenshot({ path: `${evidence}/${suffix}-home-desktop.png`, fullPage: true });
  18  |   await page.getByRole('link', { name: 'Start with the idea', exact: false }).click();
  19  |   await expect(page).toHaveURL(new RegExp(base + 'start/'));
  20  |   await expect(page.locator('h1')).toHaveText('Start with the idea');
  21  |   await page.getByRole('link', { name: 'Return to the research question' }).click();
  22  |   await expect(page.locator('#research-question')).toBeVisible();
  23  |   await context.close();
  24  | });
  25  | 
  26  | test('home, nested reading and math pass automated accessibility and 320px reflow', async ({ page }) => {
  27  |   const errors: string[] = [];
  28  |   page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  29  |   for (const route of ['', 'start/', 'fixtures/math/']) {
  30  |     await page.goto(base + route);
  31  |     const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  32  |     expect(audit.violations, JSON.stringify(audit.violations, null, 2)).toEqual([]);
  33  |     await page.setViewportSize({ width: 320, height: 800 });
  34  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  35  |     if (!route) await page.screenshot({ path: `${evidence}/${suffix}-home-mobile.png`, fullPage: true });
  36  |     if (route.includes('math')) {
  37  |       await expect(page.locator('.katex').first()).toBeVisible();
  38  |       expect(await page.locator('math').count()).toBeGreaterThan(0);
  39  |       await expect(page.locator('.katex-error')).toHaveCount(0);
  40  |       await expect(page.locator('.katex-display').last()).toHaveAttribute('tabindex', '0');
  41  |       expect(await page.locator('.katex-display').last().evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true);
  42  |       await page.locator('.katex-display').last().focus();
  43  |       await page.keyboard.press('ArrowRight');
  44  |       await expect.poll(() => page.locator('.katex-display').last().evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
  45  |       expect(await page.evaluate(() => document.fonts.check('16px KaTeX_Main'))).toBe(true);
  46  |       await page.screenshot({ path: `${evidence}/${suffix}-math-mobile.png`, fullPage: true });
  47  |     }
  48  |     await page.setViewportSize({ width: 1280, height: 900 });
  49  |   }
  50  |   expect(errors).toEqual([]);
  51  | });
  52  | 
  53  | test('dark-mode reading remains accessible', async ({ page }) => {
  54  |   await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  55  |   await page.goto(base);
  56  |   expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  57  |   await page.screenshot({ path: `${evidence}/${suffix}-home-dark.png`, fullPage: true });
  58  | });
  59  | 
  60  | test('unknown routes return real 404 and nested assets use the configured base', async ({ page, request }) => {
  61  |   const response = await page.goto(base + 'unknown-page/');
  62  |   expect(response?.status()).toBe(404);
  63  |   await expect(page.locator('h1')).toContainText('return to the question');
  64  |   await page.getByRole('link', { name: 'Return home', exact: true }).click();
  65  |   await expect(page.locator('h1')).toContainText('become a whole?');
  66  |   expect((await request.get(base + 'favicon.svg')).status()).toBe(200);
  67  |   if (base !== '/') expect((await request.get('/favicon.svg')).status()).toBe(404);
  68  |   const info = await (await request.get(base + 'build-info.json')).json();
  69  |   expect(info.deployEligible).toBe(false);
  70  |   expect(info.currentSourceQualified).toBe(false);
  71  |   expect(info.config.basePath).toBe(base);
  72  | });
  73  | 
  74  | 
  75  | test('M1 source-bound consumers retain status distinctions, source text, citations and pending review without JS', async ({ browser }) => {
  76  |   const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}});
  77  |   const page=await context.newPage();
  78  |   await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-D01/');
  79  |   await expect(page.locator('[data-canonical-body]')).toContainText('Geometry is not limited to visible Euclidean shape');
  80  |   await expect(page.locator('.record-status')).toContainText('Definition');
  81  |   await expect(page.locator('.record-status')).toContainText('Pending');
  82  |   await expect(page.locator('.record-status')).toContainText('Draft');
  83  |   expect(await page.locator('math').count()).toBeGreaterThan(0);
  84  |   await page.screenshot({path:`${evidence}/${suffix}-claim-definition.png`,fullPage:true});
  85  |   await page.goto(process.env.UNITY_TEST_ORIGIN+base+'claims/UT-E01/');
  86  |   await expect(page.locator('.record-status')).toContainText('Source-reported evidence');
> 87  |   await expect(page.locator('.prose')).toContainText('Designed, pumped fibre-laser system');
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  88  |   await page.locator('a[href*="references/#BIB-"]').first().click();
  89  |   await expect(page.locator('h1')).toHaveText('Literature and sources');
  90  |   await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/geometry-and-modes/');
  91  |   await expect(page.locator('[data-canonical-body]')).toContainText('Organization at a chosen scale');
  92  |   await page.goto(process.env.UNITY_TEST_ORIGIN+base+'research-status/');
  93  |   await expect(page.locator('[data-canonical-body]')).toContainText('Open extensions to prove');
  94  |   await expect(page.locator('[data-canonical-body]')).toContainText('does not close the claim');
  95  |   await page.screenshot({path:`${evidence}/${suffix}-research-status.png`,fullPage:true});
  96  |   await page.getByRole('link',{name:'Read the claim and evidence matrix'}).click();
  97  |   await expect(page.locator('table')).toHaveCount(2);
  98  |   await expect(page.locator('table').first()).toContainText('open extension');
  99  |   await context.close();
  100 | });
  101 | 
  102 | test('M1 claims, concepts, status, matrix and bibliography pass axe and 320px reflow',async({page})=>{
  103 |   for(const route of ['claims/UT-D01/','claims/UT-E01/','concepts/geometry-and-modes/','research-status/','research-status/proof-matrix/','references/']) {
  104 |     await page.setViewportSize({width:320,height:800});await page.goto(base+route);
  105 |     const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  106 |     expect(audit.violations,JSON.stringify(audit.violations,null,2)).toEqual([]);
  107 |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  108 |     if(route.includes('proof-matrix')) await page.screenshot({path:`${evidence}/${suffix}-proof-matrix-mobile.png`,fullPage:true});
  109 |   }
  110 | });
  111 | 
```