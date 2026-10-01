import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.UNITY_TEST_BASE ?? '/';
const suffix = base === '/' ? 'root' : 'subpath';

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
  await page.screenshot({ path: `docs/evidence/m0/${suffix}-home-desktop.png`, fullPage: true });
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
    if (!route) await page.screenshot({ path: `docs/evidence/m0/${suffix}-home-mobile.png`, fullPage: true });
    if (route.includes('math')) {
      await expect(page.locator('.katex').first()).toBeVisible();
      expect(await page.locator('math').count()).toBeGreaterThan(0);
      await expect(page.locator('.katex-error')).toHaveCount(0);
      await page.screenshot({ path: `docs/evidence/m0/${suffix}-math-mobile.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  expect(errors).toEqual([]);
});

test('dark-mode reading remains accessible', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(base);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `docs/evidence/m0/${suffix}-home-dark.png`, fullPage: true });
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
