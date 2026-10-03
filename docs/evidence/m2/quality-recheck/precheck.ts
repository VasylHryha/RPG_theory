import {resolve,join} from 'node:path';
import {writeFileSync} from 'node:fs';
import {serveOutput} from '../../../../scripts/static-server.js';
import {auditOutput} from '../../../../scripts/audit-output.js';
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('node_modules/.cache/ms-playwright');
const {chromium}=await import('@playwright/test');
const directory='dist/m2-introduction/preview-root';
const audit=auditOutput(directory);
const {server,origin}=await serveOutput(directory);
const browser=await chromium.launch();
const evidence='docs/evidence/m2/quality-recheck';
const page=await browser.newPage({viewport:{width:375,height:900}});
const results:any[]=[];
try {
  await page.goto(origin);
  results.push({route:'/',...await page.evaluate(()=>({
    firstDiagramBeforeWave:!!(document.querySelector('[data-beginner-diagram]')!.compareDocumentPosition(document.querySelector('[data-canonical-body]')!) & Node.DOCUMENT_POSITION_FOLLOWING),
    waveTop:document.querySelector('[data-canonical-body] h2')!.getBoundingClientRect().top,
    styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(el=>(el as HTMLLinkElement).href),
  }))});
  await page.screenshot({path:join(evidence,'before-home-mobile.png'),fullPage:true});
  await page.goto(origin+'/concepts/effective-interactions/');
  await page.evaluate(()=>document.fonts.ready);
  results.push({route:'/concepts/effective-interactions/',...await page.evaluate(()=>({
    equation:[...document.querySelectorAll('.katex-display')].map(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,
      segmentTops:[...el.querySelectorAll('.katex-html > .base')].map(base=>base.getBoundingClientRect().top)})),
    sourceDetailsHeight:document.querySelector('[data-record-details]')!.getBoundingClientRect().height,
  }))});
  await page.screenshot({path:join(evidence,'before-interactions-mobile.png'),fullPage:true});
  await page.goto(origin+'/examples/string/');
  results.push({route:'/examples/string/',...await page.evaluate(()=>({
    articleHeight:document.querySelector('article')!.getBoundingClientRect().height,
    diagramTop:document.querySelector('[data-beginner-diagram]')!.getBoundingClientRect().top,
    sourceDetailsHeight:document.querySelector('[data-record-details]')!.getBoundingClientRect().height,
    readingNoteFont:getComputedStyle(document.querySelector('.reading-note')!).fontSize,
  }))});
  writeFileSync(join(evidence,'precheck.json'),JSON.stringify({predecessorAudit:audit.artifactSha256,results},null,2)+'\n');
  console.log(JSON.stringify(results));
}finally{await browser.close();server.close();}
