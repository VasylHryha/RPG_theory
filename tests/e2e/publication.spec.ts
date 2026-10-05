import {test,expect} from '@playwright/test';
import {writeFileSync,readFileSync} from 'node:fs';
import {publicationFor} from '../../src/lib/publication';
import {publicationAssets,verifyArchive,rssXML} from '../../src/lib/publication-assets';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.UNITY_TEST_BASE ?? '/',suffix=base==='/'?'root':'subpath',evidence=process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m4/implementation';

test('M4 library, article and citation journeys work without JavaScript, with real ZIP download and RSS parsing',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,acceptDownloads:true}),page=await context.newPage();
 const info=JSON.parse(readFileSync(`${process.env.UNITY_TEST_OUTPUT}/build-info.json`,'utf8')),s=publicationFor('preview',info.config),a=publicationAssets(s,info.config);
 await page.goto(base+'articles/');await expect(page.locator('[data-article-index] h2')).toHaveCount(2);
 await page.locator('[data-article-index]').getByRole('link',{name:'When can a whole be treated as one useful unit?',exact:true}).click();
 await expect(page.locator('[data-canonical-body]')).toContainText('No new result is derived or reproduced here.');
 await page.goto(base+'documents/');for(const name of ['Start','Framework','Mathematics / Results','Research Questions','Historical Sources'])await expect(page.locator('[data-document-library]').getByRole('heading',{name,exact:true})).toBeVisible();
 await page.goto(base+'cite/');await expect(page.locator('[data-citation]')).toContainText('Dirty; the commit alone does not describe this build.');await expect(page.locator('[data-citation]')).toContainText('CITATION.cff: inactive');
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('link',{name:'Private preview publication ZIP',exact:true}).click()]);
 const dest=`${evidence}/${suffix}-download.zip`;await download.saveAs(dest);const raw=readFileSync(dest);expect(raw.equals(a.files.get(a.zipPath)!)).toBe(true);const members=verifyArchive(raw);expect(members.size).toBe(a.members.size);
 const rss=await page.request.get(base+'rss.xml');expect(rss.status()).toBe(200);expect(await rss.text()).toBe(rssXML(s,info.config));
 const parsed=await page.evaluate(xml=>{const doc=new DOMParser().parseFromString(xml,'application/xml');return {errors:doc.querySelectorAll('parsererror').length,items:doc.querySelectorAll('item').length,title:doc.querySelector('channel > title')?.textContent};},await rss.text());expect(parsed).toEqual({errors:0,items:0,title:'Unity Theory / RRG'});
 writeFileSync(`${evidence}/${suffix}-download-check.json`,JSON.stringify({status:'PASS',members:members.size,zipBytes:raw.length,rss:parsed,sourceCommit:a.identity.sourceCommit,workspaceDirty:a.identity.workspaceDirty},null,2));
 await context.close();
});

test('M4 new pages reflow at 320px and technical print retains equations, status, revision and citation targets',async({page})=>{
 await page.setViewportSize({width:320,height:800});
 for(const route of ['articles/','articles/how-existing-structures-make-new-organization-possible/','articles/when-can-a-whole-be-treated-as-one-useful-unit/','documents/','cite/','references/']){
  await page.goto(base+route);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route).toBe(true);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(result.violations,route+JSON.stringify(result.violations)).toEqual([]);
 }
 await page.setViewportSize({width:794,height:1123});await page.goto(base+'math/');await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.site-header')).toBeHidden();await expect(page.locator('.technical-navigation')).toBeHidden();await expect(page.locator('[data-record-status]')).toBeVisible();await expect(page.locator('.eyebrow')).toContainText('Revision');
 const force=page.locator('.katex-display').filter({has:page.locator('annotation',{hasText:'F_q=-'})}).first();expect(await force.locator('.fbox').evaluate(el=>el.getBoundingClientRect().width)).toBeGreaterThan(40);
 const overflows=await page.locator('.katex-display').evaluateAll(els=>els.map(el=>({width:el.clientWidth,content:el.scrollWidth,formula:el.querySelector('annotation')?.textContent})).filter(e=>e.content>e.width+2));
 writeFileSync(`${evidence}/${suffix}-print-equations.json`,JSON.stringify({overflows},null,2));expect(overflows).toEqual([]);
 await page.pdf({path:`${evidence}/${suffix}-math-print.pdf`,preferCSSPageSize:true,printBackground:true});await force.scrollIntoViewIfNeeded();await page.screenshot({path:`${evidence}/${suffix}-math-print.png`});
});
