import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { serveOutput } from '../../../../scripts/static-server.js';

if(process.argv.includes('--repair-only')) {
  const measurements=[];
  for(const [label,output] of [['before','dist/m3-acceptance-root'],['after','dist/m3-display-repair-root']]) {
    const {server,origin,base}=await serveOutput(output);
    try {
      const browser=await chromium.launch();
      try {
        const page=await browser.newPage({viewport:{width:1280,height:1000},javaScriptEnabled:false});
        await page.goto(origin+base+'math/#39-geometry-force-and-mode-remain-one-local-object');
        await page.evaluate(()=>document.fonts.ready);
        const force=page.locator('.katex-display').filter({has:page.locator('annotation',{hasText:'F_q=-'})}).first();
        const width=await force.locator('.fbox').evaluate(el=>el.getBoundingClientRect().width);
        measurements.push({label,boxWidth:width});
        if(label==='after') {
          if(width<=40)throw new Error('Force equation box still collapsed');
          await page.screenshot({path:'docs/evidence/m3/acceptance/repaired-section39-desktop.png'});
          await page.setViewportSize({width:320,height:1000});await page.emulateMedia({colorScheme:'dark'});
          await page.locator('[id="39-geometry-force-and-mode-remain-one-local-object"]').evaluate(el=>el.scrollIntoView({block:'start'}));
          await page.screenshot({path:'docs/evidence/m3/acceptance/repaired-section39-mobile.png'});
        }
      } finally {await browser.close();}
    } finally {await new Promise<void>(done=>server.close(()=>done()));}
  }
  writeFileSync('docs/evidence/m3/acceptance/display-repair-measurements.json',JSON.stringify(measurements,null,2)+'\n');
  console.log(JSON.stringify(measurements));process.exit(0);
}

for(const [label,output] of [['root','dist/m3-acceptance-root'],['subpath','dist/m3-acceptance-subpath']]) {
  const {server,origin,base}=await serveOutput(output);
  try {
    const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test','tests/e2e/technical.spec.ts'],{
      stdio:'inherit',env:{...process.env,UNITY_TEST_ORIGIN:origin,UNITY_TEST_BASE:base,UNITY_TEST_OUTPUT:resolve(output),UNITY_EVIDENCE_DIR:'docs/evidence/m3/acceptance/final',PLAYWRIGHT_BROWSERS_PATH:resolve('node_modules/.cache/ms-playwright')}
    });
    const status=await new Promise<number>(done=>child.on('exit',code=>done(code ?? 1)));
    if(status!==0){process.exitCode=status;break;}
    const browser=await chromium.launch(process.env.UNITY_CHROMIUM_PATH?{executablePath:process.env.UNITY_CHROMIUM_PATH}:{});
    try {
      const page=await browser.newPage({viewport:{width:1280,height:1000},javaScriptEnabled:false});
      await page.goto(origin+base+'math/#39-geometry-force-and-mode-remain-one-local-object');
      await page.evaluate(()=>document.fonts.ready);
      await page.screenshot({path:`docs/evidence/m3/acceptance/final/${label}-math-section39-desktop.png`});
      await page.setViewportSize({width:320,height:900});await page.emulateMedia({colorScheme:'dark'});
      await page.locator('[id="39-geometry-force-and-mode-remain-one-local-object"]').scrollIntoViewIfNeeded();
      await page.screenshot({path:`docs/evidence/m3/acceptance/final/${label}-math-section39-mobile.png`});
    } finally {await browser.close();}
  } finally {await new Promise<void>(done=>server.close(()=>done()));}
}
