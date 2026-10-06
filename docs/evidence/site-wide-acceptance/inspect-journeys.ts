// Engineering observation of the six requested connected tasks; no participants.
import {chromium,expect} from '@playwright/test';
import {serveOutput} from '../../../scripts/static-server.js';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {sha256} from '../../../src/lib/identity.js';
for (const [output,dir] of [[process.argv[2],process.argv[3]],['dist/site-wide-acceptance-root','docs/evidence/site-wide-acceptance/browser-root']]) {
mkdirSync(dir,{recursive:true});
const {server,origin,base}=await serveOutput(output);
const info=JSON.parse(readFileSync(`${output}/build-info.json`,'utf8'));
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}}),page=await context.newPage();
const journeys:any[]=[];
async function go(route:string) {const response=await page.goto(origin+base+route);expect(response?.status()).toBe(200);}
async function follow(suffix:string,selector='main') {await page.locator(`${selector} a[href$="${suffix}"]`).first().click();}
async function record(name:string,paths:string[],finding:string) {journeys.push({name,paths,finding,status:'PASS',humanObservation:'NOT_PERFORMED',realAT:'NOT_PERFORMED'});}
try {
 await go('');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
 await follow('start/','[data-canonical-body]');await follow('examples/cell/','[data-canonical-body]');
 await expect(page.locator('[data-canonical-body]')).toContainText('Maintenance requires resources and energy flow');
 await record('Home → Start → example',['/','/start/','/examples/cell/'],'Connected internal maintenance explanation and supplied resources remain explicit.');

 await go('concepts/');await follow('concepts/geometry-and-modes/','[data-canonical-body]');await follow('claims/UT-D02/','[data-canonical-body]');
 await expect(page.locator('[data-canonical-body]')).toContainText('full temporal mode organization');
 await record('Concept → exact definition',['/concepts/','/concepts/geometry-and-modes/','/claims/UT-D02/'],'Exact full-mode core definition is reachable without JavaScript.');

 await go('evidence/');await follow('claims/UT-E119/','[data-canonical-body]');
 await expect(page.locator('[data-canonical-body]')).toContainText('quasi-monochromatic');
 await page.locator('.source-details > summary').first().click();await follow('references/#BIB-0082','[data-record-details]');
 await expect(page.locator('#BIB-0082')).toContainText('What was checked:');
 await expect(page.locator('#BIB-0082 a').first()).toHaveAttribute('href','https://doi.org/10.1038/ncomms8460');
 await record('Evidence → case → cited source',['/evidence/','/claims/UT-E119/','/references/#BIB-0082'],'Reported attraction, imposed field conditions, original DOI and recorded inspection depth remain connected; external paper not freshly fetched.');

 await go('research-status/');await follow('open-problems/','[data-technical-guide]');await follow('claims/UT-O101/','[data-canonical-body]');
 await follow('about/#contribute','[data-canonical-body]');await expect(page.locator('#contribute')).toBeVisible();
 await expect(page.locator('[data-about] a[href^="mailto:"]')).toHaveAttribute('href','mailto:vasylhryha.rrg@gmail.com');
 await record('Research → open question → contribution',['/research-status/','/open-problems/','/claims/UT-O101/','/about/#contribute'],'Open connected-stage question has a bounded contribution path and approved contact.');

 await go('framework/');await follow('math/','[data-technical-guide]');
 await expect(page.locator('[data-technical-guide]')).toContainText('A general action is not automatically a potential energy');
 await expect(page.locator('.katex-error')).toHaveCount(0);expect(await page.locator('math').count()).toBeGreaterThan(0);
 await follow('documents/foundation-errata/','[data-technical-guide]');await expect(page.locator('[data-canonical-body]')).toContainText('A general action cannot simply be treated as a static potential');
 await record('Technical reading → mathematics → limits',['/framework/','/math/','/documents/foundation-errata/'],'Assumption issue is visible before equations and traces to exact source errata; no scientific correction inferred.');

 await go('documents/');await follow('documents/locked-core/','[data-document-library]');
 const source=page.locator('[data-download-tools] a[href$="downloads/original/R-CURRENT-CORE.md"]').first();
 // Original downloads may be in the disclosure; inspect the actual generated href.
 const sourceHref=await source.getAttribute('href');expect(sourceHref).toBeTruthy();
 const response=await page.request.get(origin+sourceHref);expect(response.status()).toBe(200);
 const downloaded=await response.body();expect(downloaded.equals(readFileSync('research/RRG_CURRENT/00_LOCKED_CORE.md'))).toBe(true);
 await follow('cite/','footer');await expect(page.locator('[data-citation]')).toContainText('reviewed private qualification');
 await expect(page.locator('[data-citation]')).toContainText('site-2026.10.06-presentation');
 await go('changes/');await expect(page.locator('[data-website-history]')).toContainText('research edition and the website have separate histories');
 await record('Documents → download → citation/history',['/documents/','/documents/locked-core/',sourceHref!,'/cite/','/changes/'],'Original core download matches exact bytes; website selection identity and separate scientific history are findable.');

 for(const [route,id] of [['evidence/catalogue/','DOC-CATALOGUE'],['documents/foundation-errata/','DOC-FOUNDATION-ERRATA'],['evidence/source-links/','DOC-SOURCE-LINKS']]) {
  await go(route);await expect(page.locator('[data-canonical-body]')).not.toContainText('parity has not been verified');
  await expect(page.locator('[data-canonical-body]')).not.toContainText('parity remains unverified');
  await expect(page.locator('[data-canonical-body]')).toContainText('off-machine backup');
  const exp=await page.request.get(origin+base+`downloads/explanatory/${id}.md`);expect(exp.status()).toBe(200);
  expect(await exp.text()).toContain('off-machine backup');
 }
 await go('evidence/source-links/');await page.setViewportSize({width:320,height:900});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#package-and-source-role-limits').scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/repaired-disclosure-mobile.png`});
 const unknown=await page.goto(origin+base+'unknown-acceptance-route/');expect(unknown?.status()).toBe(404);
 await expect(page.getByRole('link',{name:'Return home',exact:true})).toHaveAttribute('href',base);
 writeFileSync(`${dir}/journeys.json`,JSON.stringify({status:'PASS',method:'Independent agent Chromium engineering observation; JavaScript disabled. Not a human study or real AT observation.',mode:info.mode,inputsSha256:info.inputsSha256,buildInfoSha256:sha256(readFileSync(`${output}/build-info.json`)),base,journeys,affectedDisclosuresAndExports:3,real404:'PASS'},null,2)+'\n');
 console.log(JSON.stringify({base,journeys:journeys.length,status:'PASS',affectedDisclosuresAndExports:3,real404:'PASS'}));
} finally {await context.close();await browser.close();server.close();}

}
