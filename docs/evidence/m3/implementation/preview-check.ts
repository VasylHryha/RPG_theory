import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { serveOutput } from '../../../../scripts/static-server.js';

// Bounded M3 preview: actual private artifacts, only the affected browser suite.
for(const output of ['dist/m3-root','dist/m3-subpath']) {
  const {server,origin,base}=await serveOutput(output);
  try {
    const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','tests/e2e/technical.spec.ts'],{
      stdio:'inherit',env:{...process.env,UNITY_TEST_ORIGIN:origin,UNITY_TEST_BASE:base,UNITY_TEST_OUTPUT:resolve(output),UNITY_EVIDENCE_DIR:process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m3/implementation',PLAYWRIGHT_BROWSERS_PATH:resolve('node_modules/.cache/ms-playwright')}
    });
    const status=await new Promise<number>(done=>child.on('exit',code=>done(code ?? 1)));
    if(status!==0){process.exitCode=status;break;}
  } finally {await new Promise<void>(done=>server.close(()=>done()));}
}
