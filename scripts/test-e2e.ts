import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { args } from './args.js';
import { serveOutput } from './static-server.js';
const options = args(['output','grep']);
if (!options.output) throw new Error('--output required');
const { server, origin, base } = await serveOutput(options.output);
const localBrowserCache = resolve('node_modules/.cache/ms-playwright');
const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test',...(options.grep?['--grep',options.grep]:[])], {
  stdio: 'inherit', env: { ...process.env, ...(existsSync(localBrowserCache) && !process.env.PLAYWRIGHT_BROWSERS_PATH ? { PLAYWRIGHT_BROWSERS_PATH: localBrowserCache } : {}), UNITY_TEST_ORIGIN: origin, UNITY_TEST_BASE: base, UNITY_TEST_OUTPUT: resolve(options.output) }
});
const status = await new Promise<number>(done => child.on('exit', code => done(code ?? 1)));
server.close();
process.exitCode = status;
