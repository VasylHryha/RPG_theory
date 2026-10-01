# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reading.spec.ts >> M1 source-bound consumers retain status distinctions, source text, citations and pending review without JS
- Location: tests/e2e/reading.spec.ts:75:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('table')
Expected: 2
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('table') with timeout 5000ms
  - waiting for locator('table')
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=f5e1]:
  - link "Skip to content" [ref=f5e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=f5e3]: Private engineering preview · Draft wording, awaiting source-bound review
  - banner [ref=f5e4]:
    - link "Unity Theory home" [ref=f5e5] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=f5e6]: ↔
      - text: Unity Theory
    - navigation "Main navigation" [ref=f5e7]:
      - link "Research status" [ref=f5e8] [cursor=pointer]:
        - /url: /research-status/
      - link "Definitions" [ref=f5e9] [cursor=pointer]:
        - /url: /concepts/geometry-and-modes/
      - link "Literature" [ref=f5e10] [cursor=pointer]:
        - /url: /references/
      - link "The question" [ref=f5e11] [cursor=pointer]:
        - /url: /
      - link "Start simply" [ref=f5e12] [cursor=pointer]:
        - /url: /start/
        - text: Start simply ↗
  - main [ref=f5e13]:
    - article [ref=f5e14]:
      - generic [ref=f5e15]:
        - paragraph [ref=f5e16]: DOC-PROOF · Revision 1
        - heading "Claim and evidence matrix" [level=1] [ref=f5e17]
        - paragraph [ref=f5e18]: Reported status and failure meanings; the document title does not certify proof.
      - generic [ref=f5e19]:
        - generic [ref=f5e20]:
          - term [ref=f5e21]: Scientific role
          - definition [ref=f5e22]: Research document
        - generic [ref=f5e23]:
          - term [ref=f5e24]: Evidence
          - definition [ref=f5e25]: No empirical status assigned
        - generic [ref=f5e26]:
          - term [ref=f5e27]: Content review
          - definition [ref=f5e28]: Pending
        - generic [ref=f5e29]:
          - term [ref=f5e30]: Publication
          - definition [ref=f5e31]: Draft · private preview
      - generic [ref=f5e32]:
        - paragraph [ref=f5e33]:
          - text: This file tells us what must be proved
          - strong [ref=f5e34]: without changing the locked core
          - text: .
        - table "Claim and evidence table; scroll horizontally if needed" [ref=f5e35]:
          - rowgroup [ref=f5e36]:
            - row [ref=f5e37]:
              - columnheader "Claim" [ref=f5e38]
              - columnheader "Status" [ref=f5e39]
              - columnheader "What would count as evidence" [ref=f5e40]
              - columnheader "What would count against it" [ref=f5e41]
              - columnheader "Core impact" [ref=f5e42]
          - rowgroup [ref=f5e43]:
            - row [ref=f5e44]:
              - cell "Geometry constrains supported modes" [ref=f5e45]
              - cell "supported in many known systems" [ref=f5e46]
              - cell "spectral/normal-mode calculations and experiments" [ref=f5e47]
              - cell "a claimed application where geometry has no definable mode relation" [ref=f5e48]
              - cell "none unless it contradicts locked definition" [ref=f5e49]
            - row [ref=f5e50]:
              - cell "Modes can maintain/transform geometry" [ref=f5e51]
              - cell "supported in many systems" [ref=f5e52]
              - cell "backreaction, coupled-mode, optomechanical, self-organization examples" [ref=f5e53]
              - cell "failure in a specific implementation" [ref=f5e54]
              - cell "none" [ref=f5e55]
            - row [ref=f5e56]:
              - cell "Heterogeneous lower structures can form a higher resonant geometry" [ref=f5e57]
              - cell "core claim / common in known systems" [ref=f5e58]
              - cell "molecules, cells, composite systems, network modes" [ref=f5e59]
              - cell "genuine contradiction must pass change-control proof gate" [ref=f5e60]
              - cell "possible core impact only after proof gate" [ref=f5e61]
            - row [ref=f5e62]:
              - cell "Lower-level modes remain active inside higher structures" [ref=f5e63]
              - cell "core claim" [ref=f5e64]
              - cell "multiscale measurements/reductions" [ref=f5e65]
              - cell "evidence that higher formation literally eliminates lower state variables in a claimed case" [ref=f5e66]
              - cell "proof gate required" [ref=f5e67]
            - row [ref=f5e68]:
              - cell "Different scales may use different mechanisms" [ref=f5e69]
              - cell "locked" [ref=f5e70]
              - cell "established effective theories already allow this" [ref=f5e71]
              - cell "no issue" [ref=f5e72]
              - cell "none" [ref=f5e73]
            - row [ref=f5e74]:
              - cell "Same equation family reappears at each scale" [ref=f5e75]
              - cell "optional strong extension" [ref=f5e76]
              - cell "RG fixed points/universality/form-invariant reductions" [ref=f5e77]
              - cell "different effective equations across scales" [ref=f5e78]
              - cell "rejects extension only" [ref=f5e79]
            - row [ref=f5e80]:
              - cell "Four forces are deeper resonant-geometry manifestations" [ref=f5e81]
              - cell "open extension" [ref=f5e82]
              - cell "derivation of known interactions/charges/ranges/symmetries from a deeper model" [ref=f5e83]
              - cell "incompatibility with observed force structure" [ref=f5e84]
              - cell "extension rejected; core unchanged" [ref=f5e85]
            - row [ref=f5e86]:
              - cell "Gravity is emergent resonant geometry" [ref=f5e87]
              - cell "open extension" [ref=f5e88]
              - cell "recover equivalence principle, Lorentz/diffeomorphism structure, GR limits" [ref=f5e89]
              - cell "experimental/theoretical no-go under model assumptions" [ref=f5e90]
              - cell "extension rejected; core unchanged" [ref=f5e91]
            - row [ref=f5e92]:
              - cell "Cosmic background selects accessible geometries" [ref=f5e93]
              - cell "open extension" [ref=f5e94]
              - cell "derive/fit known phase transitions and structure windows" [ref=f5e95]
              - cell "model fails while standard physics succeeds" [ref=f5e96]
              - cell "extension rejected/refined" [ref=f5e97]
            - row [ref=f5e98]:
              - cell "Cross-domain RRG invariant exists" [ref=f5e99]
              - cell "open extension" [ref=f5e100]
              - cell "same measurable criterion predicts organization in ≥2 unrelated domains" [ref=f5e101]
              - cell "criterion becomes domain-specific or post-hoc" [ref=f5e102]
              - cell "extension weakened" [ref=f5e103]
            - row [ref=f5e104]:
              - cell "RRG improves AI" [ref=f5e105]
              - cell "open application" [ref=f5e106]
              - cell "controlled benchmark gains at equal resources" [ref=f5e107]
              - cell "no gain / worse scaling" [ref=f5e108]
              - cell "application rejected; core unchanged" [ref=f5e109]
        - paragraph [ref=f5e110]: "| Lower-level organization can generate an effective higher-level interaction channel | supported in known physical systems | phonon-mediated attraction, emergent spin-ice charges/interactions, collective mediated interactions | a claimed system where the proposed emergent interaction cannot be derived or measured | supports extension; core unchanged |"
        - heading "Rule" [level=2] [ref=f5e111]
        - paragraph [ref=f5e112]:
          - text: A failed extension is
          - strong [ref=f5e113]: not
          - text: permission to redefine the core. It is simply a failed extension unless a complete core contradiction passes
          - code [ref=f5e114]: 05_CHANGE_CONTROL.md
          - text: .
      - generic [ref=f5e115]:
        - heading "Scope and source" [level=2] [ref=f5e116]
        - paragraph [ref=f5e117]: Reported status and failure meanings; the document title does not certify proof.
        - paragraph [ref=f5e118]:
          - text: "Extracted from 06_PROOF_MATRIX.md, lines 3–23. Raw excerpt SHA-256:"
          - code [ref=f5e119]: 66997726c6ea67eb4743320e7842e72fb6d2dcf2562550597bf1f81389f637c5
        - paragraph [ref=f5e120]: 06_PROOF_MATRIX.md body; faithful table display.
        - heading "Depends on" [level=3] [ref=f5e121]
        - list [ref=f5e122]:
          - listitem [ref=f5e123]:
            - link "UT-C01 — Fundamental interaction extension" [ref=f5e124] [cursor=pointer]:
              - /url: /claims/UT-C01/
          - listitem [ref=f5e125]:
            - link "UT-C02 — Background and possibility-space extension" [ref=f5e126] [cursor=pointer]:
              - /url: /claims/UT-C02/
          - listitem [ref=f5e127]:
            - link "UT-D03 — Resonant geometry" [ref=f5e128] [cursor=pointer]:
              - /url: /claims/UT-D03/
  - complementary "Source availability" [ref=f5e129]:
    - generic [ref=f5e131]:
      - strong [ref=f5e132]: Current sources available
      - paragraph [ref=f5e133]: 13 supplied files checked against the recorded edition. Website explanations are drafts; content review is pending.
  - contentinfo [ref=f5e134]:
    - paragraph [ref=f5e135]: Unity Theory / Recursive Resonant Geometry
    - paragraph [ref=f5e136]: A working research framework · Local preview
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
  87  |   await expect(page.locator('[data-canonical-body]')).toContainText('Designed, pumped fibre-laser system');
  88  |   await page.locator('a[href*="references/#BIB-"]').first().click();
  89  |   await expect(page.locator('h1')).toHaveText('Literature and sources');
  90  |   await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/geometry-and-modes/');
  91  |   await expect(page.locator('[data-canonical-body]')).toContainText('Organization at a chosen scale');
  92  |   await page.goto(process.env.UNITY_TEST_ORIGIN+base+'research-status/');
  93  |   await expect(page.locator('[data-canonical-body]')).toContainText('Open extensions to prove');
  94  |   await expect(page.locator('[data-canonical-body]')).toContainText('does not close the claim');
  95  |   await page.screenshot({path:`${evidence}/${suffix}-research-status.png`,fullPage:true});
  96  |   await page.getByRole('link',{name:'Read the claim and evidence matrix'}).click();
> 97  |   await expect(page.locator('table')).toHaveCount(2);
      |                                       ^ Error: expect(locator).toHaveCount(expected) failed
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
  108 |     if(route.includes('proof-matrix')) {
  109 |       await page.locator('table').first().focus(); await page.keyboard.press('ArrowRight');
  110 |       await expect.poll(()=>page.locator('table').first().evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  111 |       await page.screenshot({path:`${evidence}/${suffix}-proof-matrix-mobile.png`,fullPage:true});
  112 |     }
  113 |   }
  114 | });
  115 | 
```