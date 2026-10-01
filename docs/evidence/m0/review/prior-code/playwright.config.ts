import { defineConfig } from '@playwright/test';
const suffix = process.env.UNITY_TEST_BASE === '/' ? 'root' : 'subpath';
export default defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0,
  reporter: [['list'], ['json', { outputFile: `docs/evidence/m0/${suffix}-browser.json` }]],
  outputDir: `test-results/${suffix}`,
  use: { browserName: 'chromium', headless: true, baseURL: process.env.UNITY_TEST_ORIGIN, trace: 'retain-on-failure', launchOptions: process.env.UNITY_CHROMIUM_PATH ? { executablePath: process.env.UNITY_CHROMIUM_PATH } : {} }
});
