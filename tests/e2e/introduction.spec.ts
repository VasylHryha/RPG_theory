import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
const base=process.env.UNITY_TEST_BASE??'/';
const suffix=base==='/'?'root':'subpath';
const evidence=process.env.UNITY_EVIDENCE_DIR??'docs/evidence/m2/implementation';
const routes=['','start/','examples/','examples/water/','examples/string/','examples/molecule/','examples/star/','examples/life-environment/','examples/cell/','concepts/','concepts/geometry-and-modes/','concepts/stability/','concepts/recursion/','concepts/effective-interactions/'];

test('M2 beginner layouts reflow at 320, 375 and 1280 in light and dark with ordered headings and accessible schematics',async({page})=>{
  test.setTimeout(180_000);
  const responses:string[]=[];page.on('response',r=>{if(r.status()>=400)responses.push(r.url());});
  for(const scheme of ['light','dark'] as const) {
    await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});
    for(const width of [320,375,1280]) for(const route of routes) {
      await page.setViewportSize({width,height:900});await page.goto(base+route);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${scheme} ${width} ${route}`).toBe(true);
      await expect(page.locator('h1')).toHaveCount(1);
      const levels=await page.locator('main h1,main h2,main h3,main h4').evaluateAll(nodes=>nodes.map(n=>Number(n.tagName.slice(1))));
      expect(levels.every((level,i)=>i===0 || level<=levels[i-1]+1),`${route}: ${levels}`).toBe(true);
      for(const svg of await page.locator('[data-beginner-diagram] svg').all()) {
        await expect(svg).toHaveAttribute('role','img');await expect(svg.locator('title')).not.toBeEmpty();await expect(svg.locator('desc')).not.toBeEmpty();
      }
      if(width===375 && ['','start/','examples/string/','examples/life-environment/','concepts/effective-interactions/'].includes(route))await page.screenshot({path:`${evidence}/${suffix}-m2-${route.replaceAll('/','-')||'home'}${scheme}.png`,fullPage:true});
    }
    // Axe on each complete layout/content variant; reflow above covers all widths.
    for(const route of routes) {
      await page.setViewportSize({width:320,height:900});await page.goto(base+route);
      const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(result.violations,JSON.stringify(result.violations,null,2)).toEqual([]);
    }
  }
  expect(responses).toEqual([]);
});

test('M2 complete reading journey works without JavaScript and makes question, uncertainty and sources findable',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}}),page=await context.newPage();
  try {
    await page.goto(process.env.UNITY_TEST_ORIGIN+base);
    await expect(page.getByRole('heading',{level:1})).toHaveText('How do parts become a whole?');
    await expect(page.locator('main')).toContainText('whether a useful, predictive organizing principle connects them');
    expect(await page.locator('[data-canonical-body] h2').first().evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(900);
    expect(await page.locator('[data-canonical-body]').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('[data-beginner-diagram]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
    expect(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
    await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
    await page.getByRole('link',{name:'Start with the idea',exact:false}).click();
    await expect(page.locator('main')).toContainText('author approval pending');
    await page.getByRole('link',{name:'Life changing its environment',exact:true}).click();
    await expect(page.locator('[data-canonical-body]')).toContainText('no purpose-driven guarantee');
    const sourceDetails=page.locator('.source-details');
    await expect(sourceDetails).not.toHaveAttribute('open','');
    await sourceDetails.locator('summary').focus();await page.keyboard.press('Enter');
    await expect(sourceDetails).toHaveAttribute('open','');
    await expect(sourceDetails.getByRole('heading',{name:'Scope and sources'})).toBeVisible();
    await expect(page.locator('a[href*="references/#BIB-0062"]').first()).toBeVisible();
    await page.locator('a[href*="references/#BIB-0062"]').first().click();await expect(page.locator('#BIB-0062')).toContainText('background only');
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'examples/string/');
    await expect(page.locator('[data-beginner-diagram]')).toContainText('not measured amplitudes');
    expect(await page.locator('[data-beginner-diagram]').evaluate(el=>el.getBoundingClientRect().top)).toBeLessThan(900);
    expect(await page.locator('[data-beginner-diagram]').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('[data-canonical-body]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/stability/');
    await expect(page.locator('[data-canonical-body]')).toContainText('not an independently established universal stability theorem');
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'concepts/effective-interactions/');
    await expect(page.locator('[data-canonical-body]')).toContainText('four successive RRG levels');
    await expect(page.locator('math')).not.toHaveCount(0);
    await page.goto(process.env.UNITY_TEST_ORIGIN+base+'framework/');
    await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Framework',exact:true})).toHaveAttribute('aria-current','page');
  } finally {await context.close();}
});

test('beginner pages retain reflow with doubled text size',async({page})=>{
  await page.setViewportSize({width:320,height:900});
  for(const route of routes) {
    await page.goto(base+route);await page.evaluate(()=>document.documentElement.style.fontSize='36px');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route).toBe(true);
    await expect(page.getByRole('link',{name:'Unity Theory home'})).toBeVisible();
  }
});

test('the real interaction equation scrolls locally by keyboard and retains loaded mathematical fonts',async({page})=>{
  await page.setViewportSize({width:320,height:900});await page.goto(base+'concepts/effective-interactions/');
  await page.evaluate(()=>document.fonts.ready);
  const equation=page.locator('.katex-display');await expect(equation).toHaveCount(1);
  await expect(equation).toHaveAttribute('role','region');await expect(equation).toHaveAttribute('tabindex','0');
  expect(await equation.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  await equation.focus();await page.keyboard.press('ArrowRight');
  await expect.poll(()=>equation.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const fonts=await page.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replaceAll('"','')));
  expect(fonts).toContain('KaTeX_Main');
  await page.screenshot({path:`${evidence}/${suffix}-real-equation-keyboard.png`,fullPage:true});
});

test('cold home and real math reading meet owned asset budgets without loading math on plain pages',async({browser})=>{
  const observations=[];
  for(const route of ['', 'start/', 'examples/string/', 'concepts/effective-interactions/']) {
    const context=await browser.newContext({viewport:{width:375,height:900},javaScriptEnabled:false});const page=await context.newPage();
    const origin=process.env.UNITY_TEST_ORIGIN!;
    const bodies:Promise<{url:string;bytes:number;gzipBytes:number}>[]=[];
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    page.on('response',response=>{if(response.url().startsWith(origin) && response.status()===200)bodies.push(response.body().then(body=>({url:response.url().replace(origin,''),bytes:body.length,gzipBytes:gzipSync(body,{level:9}).length})));});
    await page.goto(origin+base+route);await page.waitForLoadState('networkidle');await page.evaluate(()=>document.fonts.ready);
    const resources=await Promise.all(bodies),math=route==='concepts/effective-interactions/';
    await expect(page.locator('link[data-math-stylesheet]')).toHaveCount(math?1:0);
    if(!math)expect(resources.some(r=>/katex|\.woff|\.ttf/.test(r.url))).toBe(false);
    else expect(resources.some(r=>/\.woff2?$/.test(r.url))).toBe(true);
    const total=resources.reduce((sum,r)=>sum+r.gzipBytes,0);expect(total).toBeLessThanOrEqual((math?750:250)*1024);
    expect(resources.some(r=>r.url.endsWith('.js'))).toBe(false);
    observations.push({route:base+route,emptyBrowserCache:true,viewport:375,resources,totalGzipBytes:total,javascriptBytes:0});
    await context.close();
  }
  writeFileSync(`${evidence}/${suffix}-cold-assets.json`,JSON.stringify({method:'Fresh browser context per route, local no-store HTTP server; observed successful owned response bodies compressed individually at gzip level 9; headers excluded. This is a lab inventory, not a Lighthouse or field CWV result.',observations},null,2)+'\n');
});
