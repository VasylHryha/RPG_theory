# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reading.spec.ts >> home, nested reading and math pass automated accessibility and 320px reflow
- Location: tests/e2e/reading.spec.ts:26:1

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
    - region [ref=e15]:
      - generic [ref=e16]:
        - paragraph [ref=e17]: A question about organization
        - heading [level=1] [ref=e18]:
          - text: How does a collection become a
          - emphasis [ref=e19]: whole?
        - paragraph [ref=e20]: Parts. Relationships. Activity.And the possibilities they create together.
        - link "Start with the idea" [ref=e21] [cursor=pointer]:
          - /url: /start/
          - text: Start with the idea
          - generic [aria-hidden] [ref=e22]: →
        - paragraph [ref=e23]: A short introduction · No technical background needed
      - figure [ref=e24]:
        - img "Parts can participate in a larger organization Three different connected components form a whole. A surrounding broken circle represents the environment. Arrows indicate reciprocal influence between organization and activity. This is a conceptual illustration, not a measurement." [ref=e25]:
          - generic [ref=e34]: an organized whole
          - generic [ref=e35]: environment & conditions
          - generic [ref=e36]: parts stay active within the whole
        - generic [ref=e37]: Organization ↔ activityA conceptual illustration of the research question.
    - generic [ref=e38]:
      - generic [ref=e39]: 01 / The idea
      - generic [ref=e42]:
        - paragraph [ref=e43]: A wave is a pattern in moving water. A molecule has connected atoms. A living cell exchanges material while maintaining an organization.
        - paragraph [ref=e44]:
          - text: Unity Theory asks how
          - strong [ref=e45]: arrangement and activity work together
          - text: —and how an organized whole can become part of something further.
        - heading "Begin with a wave" [level=2] [ref=e46]
        - paragraph [ref=e47]: Look at a ripple crossing water. The pattern travels, while the water moves locally. The parts and the collective pattern give us two ways to describe what is happening.
        - paragraph [ref=e48]: This is a warm-up for the question, not evidence that every wave becomes a persistent building block.
        - heading "Arrangement shapes activity. Activity changes arrangement." [level=2] [ref=e49]
        - paragraph [ref=e50]:
          - text: The research framework calls these two aspects
          - strong [ref=e51]: geometry
          - text: and
          - strong [ref=e52]: mode structure
          - text: . Geometry includes relationships, connections, boundaries and constraints. Mode structure includes patterns of change, coupling, response and characteristic times—not just a single frequency.
        - paragraph [ref=e53]: An organized whole may then act as a component of another system, while activity continues inside its parts.
        - heading "Source-bound meanings" [level=2] [ref=e54]
        - paragraph [ref=e55]:
          - text: Read
          - link "UT-D01" [ref=e56] [cursor=pointer]:
            - /url: /claims/UT-D01/
          - text: ","
          - link "UT-D02" [ref=e57] [cursor=pointer]:
            - /url: /claims/UT-D02/
          - text: and
          - link "UT-D03" [ref=e58] [cursor=pointer]:
            - /url: /claims/UT-D03/
          - text: . Current open work is listed in the
          - link "research status" [ref=e59] [cursor=pointer]:
            - /url: /research-status/
          - text: .
    - region [ref=e60]:
      - generic [ref=e61]:
        - paragraph [ref=e62]: Choose your depth
        - heading "Follow the question." [level=2] [ref=e63]
      - generic [ref=e64]:
        - link "01 Start simply Move from parts and patterns to the idea of further organization. Read the introduction" [ref=e65] [cursor=pointer]:
          - /url: /start/
          - generic [ref=e66]: "01"
          - heading "Start simply" [level=3] [ref=e67]: Start simply ↗
          - paragraph [ref=e68]: Move from parts and patterns to the idea of further organization.
          - generic [ref=e69]: Read the introduction
        - generic [ref=e70]:
          - generic [ref=e71]: "02"
          - heading "Read the framework" [level=3] [ref=e72]
          - paragraph [ref=e73]: Precise definitions, assumptions, and the boundary between core and extension.
          - generic [ref=e74]: Source available · Website section in preparation
        - generic [ref=e75]:
          - generic [ref=e76]: "03"
          - heading "Explore the documents" [level=3] [ref=e77]
          - paragraph [ref=e78]: Mathematics, evidence, open questions, and the history of the research.
          - generic [ref=e79]: Source available · Website section in preparation
    - generic [ref=e80]:
      - paragraph [ref=e81]: The work ahead
      - heading "A framework to investigate." [level=2] [ref=e82]
      - generic [ref=e83]:
        - heading "Authoritative core" [level=2] [ref=e84]
        - paragraph [ref=e85]:
          - text: See
          - strong [ref=e86]: 00_LOCKED_CORE.md
          - text: . No research example or mathematical model may redefine those terms without passing
          - strong [ref=e87]: 05_CHANGE_CONTROL.md
          - text: .
        - heading "Conceptually locked" [level=2] [ref=e88]
        - list [ref=e89]:
          - listitem [ref=e90]:
            - generic [ref=e91]:
              - math [ref=e93]:
                - generic [ref=e95]:
                  - generic [ref=e96]: R
                  - generic [ref=e97]: =
                  - generic [ref=e98]: (
                  - generic [ref=e99]: G
                  - generic [ref=e100]: ","
                  - generic [ref=e101]: M
                  - generic [ref=e102]: )
              - generic [aria-hidden] [ref=e103]:
                - generic [ref=e104]: R =
                - generic [ref=e105]: (G, M)
            - text: ": resonant geometry is geometry + full temporal mode structure."
          - listitem [ref=e106]:
            - generic [ref=e107]:
              - math [ref=e109]:
                - generic [ref=e111]:
                  - generic [ref=e112]: G
                  - generic [ref=e113]: ↔
                  - generic [ref=e114]: M
              - generic [aria-hidden] [ref=e115]:
                - generic [ref=e116]: G ↔
                - generic [ref=e117]: M
            - text: ": geometry supports/constrains mode structure; mode structure supports/maintains/transforms geometry."
          - listitem [ref=e118]: Stability is that self-consistent closure for however long it exists; it is not permanence.
          - listitem [ref=e119]: Higher structures may contain identical or different lower structures.
          - listitem [ref=e120]: Lower-level dynamics remain active inside higher levels.
          - listitem [ref=e121]: Different arrangements/compositions can create different higher resonant geometries.
          - listitem [ref=e122]: Each scale may use different microscopic mechanisms and equations.
          - listitem [ref=e123]: Replication is one possible mechanism, not a universal mandatory step.
        - heading "Open extensions to prove — not definitions" [level=2] [ref=e124]
        - list [ref=e125]:
          - listitem [ref=e126]: Whether the four known fundamental interactions are manifestations of deeper scale-dependent resonant geometry.
          - listitem [ref=e127]: Whether gravity is an emergent higher-scale geometric/mode regime.
          - listitem [ref=e128]: Whether cosmological background evolution selects which resonant geometries are accessible.
          - listitem [ref=e129]: Whether one cross-domain mathematical invariant or promotion criterion exists.
          - listitem [ref=e130]: Whether RRG yields a novel prediction beyond existing frameworks.
          - listitem [ref=e131]: Whether an RRG-inspired AI architecture gives measurable efficiency/generalization advantages.
        - heading "Research discipline" [level=2] [ref=e132]
        - paragraph [ref=e133]: "New evidence must be used in this order:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=e134]:
          - generic [ref=e135]:
            - math [ref=e137]:
              - generic [ref=e144]:
                - generic [ref=e145]: test locked core
                - generic [ref=e146]: →
                - generic [ref=e147]: support / extension / contradiction candidate
            - generic [ref=e156]:
              - generic [ref=e157]: test locked core
              - text: →
              - generic [ref=e158]: support / extension / contradiction candidate
        - paragraph [ref=e163]: "Never:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=e164]:
          - generic [ref=e165]:
            - math [ref=e167]:
              - generic [ref=e174]:
                - generic [ref=e175]: new example
                - generic [ref=e176]: →
                - generic [ref=e177]: silent new definition
            - generic [ref=e186]:
              - generic [ref=e187]: new example
              - text: →
              - generic [ref=e188]: silent new definition
        - paragraph [ref=e193]:
          - text: A core change requires the complete proof gate in
          - strong [ref=e194]: 05_CHANGE_CONTROL.md
          - text: .
        - 'heading "Evidence update: emergent interaction channels" [level=2] [ref=e195]'
        - paragraph [ref=e196]: "Additional physics evidence supports the mechanism that a lower-level organized medium can generate a higher-level effective interaction:"
        - list [ref=e197]:
          - listitem [ref=e198]: phonons mediating effective electron attraction in superconductivity;
          - listitem [ref=e199]: spin-ice geometry producing emergent magnetic charges with Coulomb-like interactions;
          - listitem [ref=e200]: the Higgs-field background changing the observable electroweak interaction regime.
        - paragraph [ref=e201]: "This strengthens the downstream extension:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=e202]:
          - generic [ref=e203]:
            - math [ref=e205]:
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]: R
                  - generic [ref=e210]: "n"
                - generic [ref=e211]: →
                - generic [ref=e212]:
                  - generic [ref=e213]: I
                  - generic [ref=e214]:
                    - generic [ref=e215]: "n"
                    - generic [ref=e216]: +
                    - generic [ref=e217]: "1"
                  - generic [ref=e218]:
                    - generic [ref=e219]: e
                    - generic [ref=e220]: f
                    - generic [ref=e221]: f
                - generic [ref=e222]: →
                - generic [ref=e223]:
                  - generic [ref=e224]: R
                  - generic [ref=e225]:
                    - generic [ref=e226]: "n"
                    - generic [ref=e227]: +
                    - generic [ref=e228]: "1"
                - generic [ref=e229]: .
            - generic [aria-hidden] [ref=e230]:
              - generic [ref=e231]:
                - generic [ref=e232]:
                  - text: R
                  - generic [ref=e233]: "n"
                - text: →
              - generic [ref=e241]:
                - generic [ref=e242]:
                  - text: I
                  - generic [ref=e246]:
                    - generic [ref=e247]: n+1
                    - generic [ref=e249]: eff
                - text: →
              - generic [ref=e255]:
                - generic [ref=e256]:
                  - text: R
                  - generic [ref=e257]: n+1
                - text: .
        - paragraph [ref=e266]:
          - text: It does
          - strong [ref=e267]: not
          - text: close the claim that the four fundamental forces themselves are all deeper RRG manifestations.
        - heading "Evidence source links" [level=2] [ref=e268]
        - paragraph [ref=e269]:
          - text: The status addendum refers to the scoped evidence records
          - link "UT-E10" [ref=e270] [cursor=pointer]:
            - /url: /claims/UT-E10/
          - text: ","
          - link "UT-E11" [ref=e271] [cursor=pointer]:
            - /url: /claims/UT-E11/
          - text: and
          - link "UT-E12" [ref=e272] [cursor=pointer]:
            - /url: /claims/UT-E12/
          - text: ", each with literature links."
      - paragraph [ref=e273]:
        - link "Read current research status and review limits" [ref=e274] [cursor=pointer]:
          - /url: /research-status/
  - complementary "Source availability" [ref=e275]:
    - generic [ref=e277]:
      - strong [ref=e278]: Current sources available
      - paragraph [ref=e279]: 13 supplied files checked against the recorded edition. Website explanations are drafts; content review is pending.
  - contentinfo [ref=e280]:
    - paragraph [ref=e281]: Unity Theory / Recursive Resonant Geometry
    - paragraph [ref=e282]: A working research framework · Local preview
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
> 34  |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      |                                                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
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
  107 |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  108 |     if(route.includes('proof-matrix')) await page.screenshot({path:`${evidence}/${suffix}-proof-matrix-mobile.png`,fullPage:true});
  109 |   }
  110 | });
  111 | 
```