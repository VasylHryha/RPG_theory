# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reading.spec.ts >> M1 claims, concepts, status, matrix and bibliography pass axe and 320px reflow
- Location: tests/e2e/reading.spec.ts:102:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e3]:
    - text: Private engineering preview
    - generic [ref=e4]: · Draft wording, awaiting source-bound review
  - banner [ref=e5]:
    - link "Unity Theory home" [ref=e6] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=e7]: ↔
      - text: Unity Theory
    - navigation "Main navigation" [ref=e8]:
      - link "Research status" [ref=e9] [cursor=pointer]:
        - /url: /research-status/
      - link "Definitions" [ref=e10] [cursor=pointer]:
        - /url: /concepts/geometry-and-modes/
      - link "Literature" [ref=e11] [cursor=pointer]:
        - /url: /references/
      - link "The question" [ref=e12] [cursor=pointer]:
        - /url: /
      - link "Start simply" [ref=e13] [cursor=pointer]:
        - /url: /start/
        - text: Start simply ↗
  - main [ref=e14]:
    - article [ref=e15]:
      - generic [ref=e16]:
        - paragraph [ref=e17]: UT-D01 · Revision 1
        - heading "Geometry" [level=1] [ref=e18]
        - paragraph [ref=e19]: A locked RRG meaning; a definition is not an experimental finding.
      - generic [ref=e20]:
        - generic [ref=e21]:
          - term [ref=e22]: Scientific role
          - definition [ref=e23]: Definition
        - generic [ref=e24]:
          - term [ref=e25]: Evidence
          - definition [ref=e26]: No empirical status assigned
        - generic [ref=e27]:
          - term [ref=e28]: Content review
          - definition [ref=e29]: Pending
        - generic [ref=e30]:
          - term [ref=e31]: Publication
          - definition [ref=e32]: Draft · private preview
      - generic [ref=e33]:
        - heading [level=2] [ref=e34]:
          - text: 1. Geometry
          - generic [ref=e35]:
            - math [ref=e37]:
              - generic [ref=e38]: G
            - generic [ref=e42]: G
        - paragraph [ref=e43]:
          - text: In RRG,
          - strong [ref=e44]: geometry
          - text: "means the organization of a system at a chosen scale:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=e45]:
          - generic [ref=e46]:
            - math [ref=e48]:
              - generic [ref=e50]:
                - generic [ref=e51]: G
                - generic [ref=e52]: =
                - generic [ref=e53]: "{"
                - generic [ref=e54]: components, arrangement, relations, connectivity, order, orientation, boundaries, constraints
                - generic [ref=e55]: "}"
                - generic [ref=e56]: .
            - generic [aria-hidden] [ref=e57]:
              - generic [ref=e58]: G =
              - generic [ref=e59]:
                - text: "{"
                - generic [ref=e60]: components, arrangement, relations, connectivity, order, orientation, boundaries, constraints
                - text: "}."
        - paragraph [ref=e61]: Geometry is not limited to visible Euclidean shape.
      - generic [ref=e62]:
        - heading "In plain language · review pending" [level=2] [ref=e63]
        - paragraph [ref=e64]: Organization at a chosen scale includes components, relationships, boundaries and constraints.
      - generic [ref=e65]:
        - heading "Scope and source" [level=2] [ref=e66]
        - paragraph [ref=e67]: A locked RRG meaning; a definition is not an experimental finding.
        - paragraph [ref=e68]:
          - text: "Extracted from 00_LOCKED_CORE.md, lines 6–14. Raw excerpt SHA-256:"
          - code [ref=e69]: 680c99c03b1ea11424b27fef2214ae09b72646cd103d2f025b5dc5c7a38c7e34
        - paragraph [ref=e70]: 00_LOCKED_CORE.md §1; new navigation ID, source has no UT ID.
  - complementary "Source availability" [ref=e71]:
    - generic [ref=e73]:
      - strong [ref=e74]: Current sources available
      - paragraph [ref=e75]: 13 supplied files checked against the recorded edition. Website explanations are drafts; content review is pending.
  - contentinfo [ref=e76]:
    - paragraph [ref=e77]: Unity Theory / Recursive Resonant Geometry
    - paragraph [ref=e78]: A working research framework · Local preview
```

# Test source

```ts
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
  87  |   await expect(page.locator('.prose')).toContainText('Designed, pumped fibre-laser system');
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
> 107 |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
      |                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  108 |     if(route.includes('proof-matrix')) await page.screenshot({path:`${evidence}/${suffix}-proof-matrix-mobile.png`,fullPage:true});
  109 |   }
  110 | });
  111 | 
```