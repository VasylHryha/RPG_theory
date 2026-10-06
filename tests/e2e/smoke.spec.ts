import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

const base = process.env.UNITY_TEST_BASE ?? '/';
const output = process.env.UNITY_TEST_OUTPUT!;
const info = JSON.parse(readFileSync(join(output, 'build-info.json'), 'utf8'));
const authoredSteps = [...readFileSync('research/publication/pages/home.md', 'utf8').matchAll(/^#### (.+)$/gm)]
  .map(([, heading]) => heading.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim());

test('every built route and internal link resolves, with a real 404', { tag: '@routine' }, async ({ request }) => {
  test.setTimeout(60_000);
  const responses = new Map<string, string>();
  const anchors = new Map<string, Set<string>>();
  const anchorIds = ($: ReturnType<typeof load>) => new Set($('[id],a[name]').toArray().map(el => $(el).attr('id') ?? $(el).attr('name')!));
  const links = new Set<string>();
  // The selected build manifest owns route membership, including downloads.
  for (const route of new Set<string>(info.publicationManifest.routes)) {
    const path = base + route.slice(1), response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    if (response.headers()['content-type']?.includes('text/html')) {
      const html = await response.text(); responses.set(path, html);
      const $ = load(html);
      if (route.endsWith('/') && !route.startsWith('/fixtures/')) {
        expect($('nav[aria-label="Breadcrumb"]').length, route).toBe(1);
        if (route !== '/contents/') expect($('nav[aria-label="Page navigation"] a[href$="contents/"]').length, route).toBe(1);
        expect($('[data-book-related] a').length, route).toBeLessThanOrEqual(6);
      }
      anchors.set(path, anchorIds($));
      for (const element of $('a[href]').toArray()) {
        const url = new URL($(element).attr('href')!, response.url());
        if (url.origin === new URL(response.url()).origin || url.origin === info.config.origin) links.add(url.pathname + url.search + url.hash);
      }
    }
  }
  const contents = load(responses.get(base + 'contents/')!);
  const listed = new Set(contents('[data-contents-route]').toArray().map(el => contents(el).attr('data-contents-route')!));
  expect(contents('[data-contents-route]').length).toBe(listed.size);
  const readingRoutes = info.publicationManifest.routes.filter((route: string) => route.endsWith('/') && !route.startsWith('/fixtures/') && route !== '/contents/');
  expect([...listed].sort()).toEqual([...new Set(readingRoutes)].sort());
  const glossary = load(responses.get(base + 'glossary/')!);
  expect(glossary('[data-canonical-body] h3').length).toBeGreaterThan(0);
  expect(glossary('[data-canonical-body] a[href^="#"]').length).toBeGreaterThan(0);
  expect(load(responses.get(base)!)('[data-book-page-turn] a[rel="next"]').attr('href')).toBe(base+'start/');
  for(const route of ['examples/star/','examples/water/']) {
    const $=load(responses.get(base+route)!);
    expect($('[data-book-breadcrumb] a').toArray().map(a=>$(a).attr('href'))).toEqual([base+'examples/']);
  }
  const targets = new Map(responses);
  for (const link of links) {
    const url = new URL(link, 'http://local.invalid'), path = url.pathname + url.search;
    expect(url.pathname.startsWith(base), link).toBe(true);
    if (!targets.has(path)) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), link).toBe(200);
      targets.set(path, await response.text());
    }
    if (url.hash) {
      if (!anchors.has(path)) anchors.set(path, anchorIds(load(targets.get(path)!)));
      const id = decodeURIComponent(url.hash.slice(1));
      expect(anchors.get(path)!.has(id), link).toBe(true);
    }
  }
  const missing = await request.get(base + 'smoke-missing-route/', { maxRedirects: 0 });
  expect(missing.status()).toBe(404);
  expect(await missing.body()).toEqual(readFileSync(join(output, '404.html')));
});

test('menu, contact and search fallback work without JavaScript', { tag: '@routine' }, async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage(); await page.goto(base);
    const menu = page.locator('[data-publication-navigation]');
    await expect(menu.getByRole('link')).toHaveCount(5);
    expect(await menu.getByRole('link').evaluateAll(nodes => nodes.map(n => n.getAttribute('href'))))
      .toEqual(['start/', 'examples/', 'evidence/', 'research-status/', 'contents/'].map(route => base + route));
    await menu.locator(`a[href="${base}start/"]`).click();
    await expect(page.locator('[data-canonical-body]')).toBeVisible();
    await page.locator('[data-header-tools] a[href$="contact/"]').click();
    await expect(page.locator('[data-contact] a[href^="mailto:"]')).toHaveAttribute('href', 'mailto:vasylhryha.rrg@gmail.com');
    await page.locator('[data-header-tools] a[href$="search/"]').click();
    const fallback = page.locator('[data-search-fallback]');
    await expect(fallback.locator('li a')).toHaveCount(info.publicationManifest.searchIds.length);
    await fallback.locator('li a').first().click();
    await expect(page.locator('[data-canonical-body]')).toBeVisible();
    await page.locator('[data-publication-navigation] a[href$="contents/"]').click();
    const claims = page.locator('.contents-claims');
    await expect(claims).not.toHaveAttribute('open');
    await claims.locator('summary').focus(); await page.keyboard.press('Enter');
    await expect(claims).toHaveAttribute('open', '');
    await page.locator('[data-publication-footer] a[href$="glossary/"]').click();
    const jump = page.locator('[data-canonical-body] a[href^="#"]').first();
    const fragment = await jump.getAttribute('href');
    await jump.click(); await expect(page).toHaveURL(new RegExp(fragment! + '$'));
    await expect(page.locator(fragment!)).toBeInViewport();
  } finally { await context.close(); }
});

test('home accordions open by keyboard and the twelve-step ladder starts with quantum activity without JavaScript', { tag: '@routine' }, async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  try {
    const page = await context.newPage(); await page.goto(base);
    const steps = page.locator('.home-ladder .ladder-step h4');
    // Derive the intended order from authored material so wording can change
    // without updating a second copy in the test.
    await expect(steps).toHaveCount(12);
    expect(authoredSteps).toHaveLength(12);
    expect(authoredSteps[0]).toMatch(/quantum/i);
    expect(await steps.evaluateAll(nodes => nodes.map(n => n.textContent!.replace(/\s+/g, ' ').trim())))
      .toEqual(authoredSteps);
    const boxes = await steps.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().top));
    expect(boxes.every((top, i) => i === 0 || top > boxes[i - 1])).toBe(true);
    const accordions = page.locator('.home-accordions details');
    expect(await accordions.count()).toBeGreaterThan(0);
    for (const details of await accordions.all()) {
      await expect(details).not.toHaveAttribute('open');
      await details.locator('summary').focus(); await page.keyboard.press('Enter');
      await expect(details).toHaveAttribute('open', '');
      await page.keyboard.press('Enter'); await expect(details).not.toHaveAttribute('open');
    }
  } finally { await context.close(); }
});

const representatives = ['', 'start/', 'examples/cell/', 'concepts/geometry-and-modes/',
  'evidence/', 'math/', 'claims/UT-D01/', 'contact/', 'contents/', 'glossary/'];
for (const width of [320, 1280]) for (const colorScheme of ['light', 'dark'] as const) {
  test(`page families pass WCAG 2.2 AA and reflow at ${width}px in ${colorScheme}`, { tag: '@accessibility' }, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme });
    for (const route of representatives) {
      const response = await page.goto(base + route);
      expect(response?.status(), route).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(result.violations, `${route}: ${JSON.stringify(result.violations)}`).toEqual([]);
    }
  });
}
