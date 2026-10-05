# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: introduction.spec.ts >> M2 complete reading journey works without JavaScript and makes question, uncertainty and sources findable
- Location: tests/e2e/introduction.spec.ts:36:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Concepts', exact: true })
Expected: "page"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Concepts', exact: true }) with timeout 5000ms
  - waiting for getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Concepts', exact: true })

```

```yaml
- link "Skip to content":
  - /url: "#main"
- text: Private preview · Draft website explanations
- banner:
  - link "Unity Theory home":
    - /url: /unity-theory/
    - text: Unity Theory
  - navigation "Main navigation":
    - link "Start":
      - /url: /unity-theory/start/
    - link "Framework":
      - /url: /unity-theory/framework/
    - link "Research":
      - /url: /unity-theory/research-status/
    - link "Documents":
      - /url: /unity-theory/documents/
    - link "Articles":
      - /url: /unity-theory/articles/
    - link "Cite":
      - /url: /unity-theory/cite/
    - link "Sources":
      - /url: /unity-theory/references/
    - link "Search":
      - /url: /unity-theory/search/
- main:
  - article:
    - paragraph: DOC-CONCEPTS · Revision 1
    - heading "The concepts, in ordinary words" [level=1]
    - paragraph: From organization and activity to the source definitions.
    - paragraph: "Concept explanation · Publication: Draft · private preview. Source fidelity: Stale — rereview required."
    - heading "Begin with arrangement and activity" [level=2]
    - paragraph:
      - link "Geometry and modes":
        - /url: /unity-theory/concepts/geometry-and-modes/
      - text: explains relationships, constraints and organized change before introducing the symbols.
    - heading "Ask what it means to persist" [level=2]
    - paragraph:
      - link "Stability":
        - /url: /unity-theory/concepts/stability/
      - text: separates the RRG closure definition from lifetime, recovery and attraction measurements.
    - heading "Follow a whole into further organization" [level=2]
    - paragraph:
      - link "Recursion and scale":
        - /url: /unity-theory/concepts/recursion/
      - text: explains internally active parts, different roles and why replication is optional.
    - heading "Connect organization to interactions" [level=2]
    - paragraph:
      - link "Effective interactions":
        - /url: /unity-theory/concepts/effective-interactions/
      - text: follows the supplied evidence cases and the stronger open research question.
    - paragraph:
      - text: The original
      - link "core definition records":
        - /url: /unity-theory/claims/UT-D01/
      - text: remain the authority for meanings. For a continuous reading path,
      - link "start with the idea":
        - /url: /unity-theory/start/
      - text: or
      - link "choose an example":
        - /url: /unity-theory/examples/
      - text: .
    - complementary:
      - heading "Take this reading with you" [level=2]
      - paragraph:
        - link "Explanatory Markdown":
          - /url: /unity-theory/downloads/explanatory/DOC-CONCEPTS.md
        - text: ·
        - link "Printable view (use browser Print)":
          - /url: /unity-theory/concepts/#main
      - paragraph: Private draft exports; publication approval pending. Original downloads preserve raw bytes; explanatory exports apply the disclosed display adapters.
      - group: Original sources and provenance
    - group: Sources and related definitions
- complementary "Source availability":
  - strong: Current sources available
  - paragraph: 13 supplied files checked against the recorded edition. Website explanations are drafts.
- contentinfo:
  - paragraph: Unity Theory / RRG · Public credit pending
  - paragraph: No additional license is granted by this preview; license selection is pending.
  - paragraph:
    - link "About and contact":
      - /url: /unity-theory/about/
    - text: ·
    - link "Rights and third-party notices":
      - /url: /unity-theory/legal/
    - text: ·
    - link "Cite":
      - /url: /unity-theory/cite/
```

# Test source

```ts
  1   | import {test,expect} from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import {writeFileSync} from 'node:fs';
  4   | import {gzipSync} from 'node:zlib';
  5   | const base=process.env.UNITY_TEST_BASE??'/';
  6   | const suffix=base==='/'?'root':'subpath';
  7   | const evidence=process.env.UNITY_EVIDENCE_DIR??'docs/evidence/m2/implementation';
  8   | const routes=['','start/','examples/','examples/water/','examples/string/','examples/molecule/','examples/star/','examples/life-environment/','examples/cell/','concepts/','concepts/geometry-and-modes/','concepts/stability/','concepts/recursion/','concepts/effective-interactions/'];
  9   | 
  10  | test('M2 beginner layouts reflow at 320, 375 and 1280 in light and dark with ordered headings and accessible schematics',async({page})=>{
  11  |   test.setTimeout(180_000);
  12  |   const responses:string[]=[];page.on('response',r=>{if(r.status()>=400)responses.push(r.url());});
  13  |   for(const scheme of ['light','dark'] as const) {
  14  |     await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});
  15  |     for(const width of [320,375,1280]) for(const route of routes) {
  16  |       await page.setViewportSize({width,height:900});await page.goto(base+route);
  17  |       expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${scheme} ${width} ${route}`).toBe(true);
  18  |       await expect(page.locator('h1')).toHaveCount(1);
  19  |       const levels=await page.locator('main h1,main h2,main h3,main h4').evaluateAll(nodes=>nodes.map(n=>Number(n.tagName.slice(1))));
  20  |       expect(levels.every((level,i)=>i===0 || level<=levels[i-1]+1),`${route}: ${levels}`).toBe(true);
  21  |       for(const svg of await page.locator('[data-beginner-diagram] svg').all()) {
  22  |         await expect(svg).toHaveAttribute('role','img');await expect(svg.locator('title')).not.toBeEmpty();await expect(svg.locator('desc')).not.toBeEmpty();
  23  |       }
  24  |       if(width===375 && ['','start/','examples/string/','examples/life-environment/','concepts/effective-interactions/'].includes(route))await page.screenshot({path:`${evidence}/${suffix}-m2-${route.replaceAll('/','-')||'home'}${scheme}.png`,fullPage:true});
  25  |     }
  26  |     // Axe on each complete layout/content variant; reflow above covers all widths.
  27  |     for(const route of routes) {
  28  |       await page.setViewportSize({width:320,height:900});await page.goto(base+route);
  29  |       const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  30  |       expect(result.violations,JSON.stringify(result.violations,null,2)).toEqual([]);
  31  |     }
  32  |   }
  33  |   expect(responses).toEqual([]);
  34  | });
  35  | 
  36  | test('M2 complete reading journey works without JavaScript and makes question, uncertainty and sources findable',async({browser})=>{
  37  |   const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}}),page=await context.newPage();
  38  |   try {
  39  |     await page.goto(process.env.UNITY_TEST_ORIGIN+base);
  40  |     await expect(page.getByRole('heading',{level:1})).toHaveText('How do parts become a whole?');
  41  |     await expect(page.locator('main')).toContainText('whether a useful, predictive organizing principle connects them');
  42  |     expect(await page.locator('[data-canonical-body] h2').first().evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(900);
  43  |     expect(await page.locator('[data-canonical-body]').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('[data-beginner-diagram]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  44  |     await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  45  |     expect(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  46  |     await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
  47  |     await page.getByRole('link',{name:'Start with the idea',exact:false}).click();
  48  |     await expect(page.locator('main')).toContainText('author approval pending');
  49  |     await page.getByRole('link',{name:'Life changing its environment',exact:true}).click();
  50  |     await expect(page.locator('[data-canonical-body]')).toContainText('no purpose-driven guarantee');
  51  |     const sourceDetails=page.locator('.source-details');
  52  |     await expect(sourceDetails).not.toHaveAttribute('open','');
  53  |     await sourceDetails.locator('summary').focus();await page.keyboard.press('Enter');
  54  |     await expect(sourceDetails).toHaveAttribute('open','');
  55  |     await expect(sourceDetails.getByRole('heading',{name:'Scope and sources'})).toBeVisible();
  56  |     await expect(page.locator('a[href*="references/#BIB-0062"]').first()).toBeVisible();
  57  |     await page.locator('a[href*="references/#BIB-0062"]').first().click();await expect(page.locator('#BIB-0062')).toContainText('background only');
  58  |     await page.goto(process.env.UNITY_TEST_ORIGIN+base+'examples/string/');
  59  |     await expect(page.locator('[data-beginner-diagram]')).toContainText('not measured amplitudes');
  60  |     expect(await page.locator('[data-beginner-diagram]').evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(900);
  61  |     expect(await page.locator('[data-beginner-diagram]').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('[data-canonical-body]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  62  |     await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/stability/');
  63  |     await expect(page.locator('[data-canonical-body]')).toContainText('not an independently established universal stability theorem');
  64  |     await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/effective-interactions/');
  65  |     await expect(page.locator('[data-canonical-body]')).toContainText('four successive RRG levels');
  66  |     await expect(page.locator('math')).not.toHaveCount(0);
  67  |     await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/');
> 68  |     await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Concepts',exact:true})).toHaveAttribute('aria-current','page');
      |                                                                                                                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  69  |   } finally {await context.close();}
  70  | });
  71  | 
  72  | test('beginner pages retain reflow with doubled text size',async({page})=>{
  73  |   await page.setViewportSize({width:320,height:900});
  74  |   for(const route of routes) {
  75  |     await page.goto(base+route);await page.evaluate(()=>document.documentElement.style.fontSize='36px');
  76  |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
  77  |     await expect(page.getByRole('link',{name:'Unity Theory home'})).toBeVisible();
  78  |   }
  79  | });
  80  | 
  81  | test('the real interaction equation scrolls locally by keyboard and retains loaded mathematical fonts',async({page})=>{
  82  |   await page.setViewportSize({width:320,height:900});await page.goto(base+'concepts/effective-interactions/');
  83  |   await page.evaluate(()=>document.fonts.ready);
  84  |   const equation=page.locator('.katex-display');await expect(equation).toHaveCount(1);
  85  |   await expect(equation).toHaveAttribute('role','region');await expect(equation).toHaveAttribute('tabindex','0');
  86  |   expect(await equation.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  87  |   await equation.focus();await page.keyboard.press('ArrowRight');
  88  |   await expect.poll(()=>equation.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  89  |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  90  |   const fonts=await page.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replaceAll('"','')));
  91  |   expect(fonts).toContain('KaTeX_Main');
  92  |   await page.screenshot({path:`${evidence}/${suffix}-real-equation-keyboard.png`,fullPage:true});
  93  | });
  94  | 
  95  | test('cold home and real math reading meet owned asset budgets without loading math on plain pages',async({browser})=>{
  96  |   const observations=[];
  97  |   for(const route of ['', 'start/', 'examples/string/', 'concepts/effective-interactions/']) {
  98  |     const context=await browser.newContext({viewport:{width:375,height:900},javaScriptEnabled:false});const page=await context.newPage();
  99  |     const origin=process.env.UNITY_TEST_ORIGIN!;
  100 |     const bodies:Promise<{url:string;bytes:number;gzipBytes:number}>[]=[];
  101 |     await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  102 |     page.on('response',response=>{if(response.url().startsWith(origin) && response.status()===200)bodies.push(response.body().then(body=>({url:response.url().replace(origin,''),bytes:body.length,gzipBytes:gzipSync(body,{level:9}).length})));});
  103 |     await page.goto(origin+base+route);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
  104 |     const resources=await Promise.all(bodies),math=route==='concepts/effective-interactions/';
  105 |     await expect(page.locator('link[data-math-stylesheet]')).toHaveCount(math?1:0);
  106 |     if(!math)expect(resources.some(r=>/katex|\.woff|\.ttf/.test(r.url))).toBe(false);
  107 |     else expect(resources.some(r=>/\.woff2?$/.test(r.url))).toBe(true);
  108 |     const total=resources.reduce((sum,r)=>sum+r.gzipBytes,0);expect(total).toBeLessThanOrEqual((math?750:250)*1024);
  109 |     expect(resources.some(r=>r.url.endsWith('.js'))).toBe(false);
  110 |     observations.push({route:base+route,emptyBrowserCache:true,viewport:375,resources,totalGzipBytes:total,javascriptBytes:0});
  111 |     await context.close();
  112 |   }
  113 |   writeFileSync(`${evidence}/${suffix}-cold-assets.json`,JSON.stringify({method:'Fresh browser context per route, local no-store HTTP server; observed successful owned response bodies compressed individually at gzip level 9; headers excluded. This is a lab inventory, not a Lighthouse or field CWV result.',observations},null,2)+'\n');
  114 | });
  115 | 
```