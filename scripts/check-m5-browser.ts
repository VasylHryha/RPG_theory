import {spawn} from 'node:child_process';
import {mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {serveOutput} from './static-server.js';
const output=process.argv[2],evidence=process.argv[3] ?? 'docs/evidence/m5/implementation';
if(!output)throw new Error('Output directory required');mkdirSync(evidence,{recursive:true});
const {server,origin,base}=await serveOutput(output),cache=resolve('node_modules/.cache/ms-playwright');
const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','tests/e2e/publication-policy.spec.ts'],{stdio:'inherit',env:{...process.env,...(existsSync(cache) && !process.env.PLAYWRIGHT_BROWSERS_PATH?{PLAYWRIGHT_BROWSERS_PATH:cache}:{}),UNITY_EVIDENCE_DIR:evidence,UNITY_TEST_ORIGIN:origin,UNITY_TEST_BASE:base,UNITY_TEST_OUTPUT:resolve(output)}});
process.exitCode=await new Promise<number>(done=>child.on('exit',code=>done(code ?? 1)));server.close();
