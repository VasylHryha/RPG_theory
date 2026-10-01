import { defineConfig } from '@playwright/test';
const suffix = process.env.UNITY_TEST_BASE === '/' ? 'root' : 'subpath';
const evidence = process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m1';
export default defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0,
  reporter: [['list'], ['json', { outputFile: `${evidence}/${suffix}-browser.json` }]],
  outputDir: `${evidence}/browser-traces/${suffix}`,
  use: { browserName: 'chromium', headless: true, baseURL: process.env.UNITY_TEST_ORIGIN, trace: 'retain-on-failure', launchOptions: process.env.UNITY_CHROMIUM_PATH ? { executablePath: process.env.UNITY_CHROMIUM_PATH } : {} }
});
