# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integration.spec.ts >> M6 published-only search has an honest empty state, keyboard controls and no-JS browsing
- Location: tests/e2e/integration.spec.ts:4:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Concepts"
Received string:    "The concepts, in ordinary words"
Timeout: 5000ms

Call log:
  - Expect "toContainText" locator('h1') with timeout 5000ms
  - waiting for locator('h1')
    14 × locator resolved to <h1>The concepts, in ordinary words</h1>
       - unexpected value "The concepts, in ordinary words"

```

```yaml
- heading "The concepts, in ordinary words" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | const base=process.env.UNITY_TEST_BASE??'/',suffix=base==='/'?'root':'subpath',evidence=process.env.UNITY_EVIDENCE_DIR??'docs/evidence/m6/implementation';
  4  | test('M6 published-only search has an honest empty state, keyboard controls and no-JS browsing',async({browser})=>{
  5  |  const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage();
  6  |  await page.goto(base+'search/');await expect(page.getByText('No readings have been selected for publication yet.',{exact:false})).toBeVisible();
> 7  |  await page.locator('[data-search-fallback]').getByRole('link',{name:'concepts',exact:true}).click();await expect(page.locator('h1')).toContainText('Concepts');await context.close();
     |                                                                                                                                       ^ Error: expect(locator).toContainText(expected) failed
  8  |  const js=await browser.newPage(),requests:string[]=[];js.on('request',r=>requests.push(r.url()));
  9  |  await js.goto(base);expect(requests.some(r=>r.includes('pagefind') || r.includes('search-client'))).toBe(false);
  10 |  await js.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Search',exact:true}).click();
  11 |  await js.locator('#search-query').focus();await js.keyboard.press('Enter');await expect(js.getByRole('status')).toContainText('Enter a word');
  12 |  await js.locator('#search-query').fill('geometry');await js.keyboard.press('Enter');await expect(js.getByRole('status')).toContainText('No published readings');
  13 |  expect(requests.some(r=>r.includes('pagefind/'))).toBe(false);await js.close();
  14 | });
  15 | for(const width of [320,375,768,1280])test(`M6 representative layouts pass reflow and WCAG axe at ${width}px`,async({page})=>{
  16 |  await page.setViewportSize({width,height:900});
  17 |  for(const route of ['', 'start/','examples/string/','concepts/geometry-and-modes/','framework/','math/','research-status/proof-matrix/','articles/how-existing-structures-make-new-organization-possible/','documents/','legal/','search/']) {
  18 |   await page.goto(base+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
  19 |   const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(audit.violations,route+JSON.stringify(audit.violations)).toEqual([]);
  20 |  }
  21 |  if(width===320){await page.screenshot({path:`${evidence}/${suffix}-search-mobile.png`,fullPage:true});}
  22 | });
  23 | test('M6 search focus, doubled text, reduced motion and dark mode remain usable',async({page})=>{
  24 |  await page.setViewportSize({width:375,height:900});await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.goto(base+'search/');
  25 |  await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
  26 |  await page.locator('#search-query').focus();expect(await page.locator('#search-query').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth;})).toBe(true);
  27 |  await page.addStyleTag({content:':root{font-size:36px !important}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  28 |  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  29 | });
  30 | 
```