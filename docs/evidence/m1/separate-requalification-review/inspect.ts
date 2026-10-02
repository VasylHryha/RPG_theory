import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {load} from 'cheerio';
import {loadCanonicalCorpus,reviewFingerprint,renderEntrySync,sourceDisplay} from '../../../../src/lib/content.js';
import {websiteReviewInputs,websiteReviewState} from '../../../../src/lib/website-review.js';
import {renderMarkdownSync} from '../../../../src/lib/markdown.js';
import {parseMarkdown} from '../../../../src/lib/markdown-tree.js';
import {auditOutput} from '../../../../scripts/audit-output.js';
import {buildInputs} from '../../../../src/lib/build-identity.js';
import {filesIn} from '../../../../src/lib/source-admission.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/separate-requalification-review';
const oldFolder='docs/evidence/m1/website-fidelity-acceptance';
const recheck='docs/evidence/m1/website-fidelity-quality-recheck';
const json=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const c=loadCanonicalCorpus();
assert.equal(c.entries.size,34);assert.equal(c.admission.currentSourceQualified,false);
assert.deepEqual(buildInputs(),json(`${recheck}/verification.json`).productionInputs);
const previous=json(`${oldFolder}/independent-read-snapshots.json`);
const oldRenderer=json(`${oldFolder}/independent-engineering.json`).renderer;
const artifacts=['root','subpath'].map(base=>{
 const directory=`dist/m1-website-fidelity-quality-recheck/preview-${base}`;
 const audit=auditOutput(directory),saved=json(`${recheck}/${base}-artifact.json`);
 assert.equal(stableJSON(audit),stableJSON(saved));
 const browser=json(`${recheck}/${base}-browser.json`);
 assert.equal(browser.stats.expected,7);
 for(const key of ['unexpected','skipped','flaky'])assert.equal(browser.stats[key],0);
 assert.equal(browser.suites.flatMap((s:any)=>s.specs).length,7);
 return {directory,artifactSha256:audit.artifactSha256,files:audit.files.length,html:audit.files.filter(f=>f.path.endsWith('.html')).length,chromium:7};
});
const representations=[...c.entries.values()].map(e=>{
 const inputs=websiteReviewInputs(c,e.id),old=previous.representations.find((r:any)=>r.id===e.id);
 assert.ok(old);const {fingerprint:now,...actual}=inputs,{fingerprint:then,...prior}=old.inputs;
 assert.equal(stableJSON(actual),stableJSON(prior));assert.notEqual(now,then);
 assert.equal(reviewFingerprint({...c,rendererSha256:oldRenderer},e.id),then);
 assert.equal(websiteReviewState(c,e.id),'stale');
 const decision=c.websiteReviews.find(r=>r.entryId===e.id)!;
 assert.equal(sha256(readFileSync(decision.evidenceRef)),decision.evidenceSha256);
 const passage=e.sourceBinding?readFileSync(c.sources.get(e.sourceBinding.sourceKey)!.path,'utf8').match(/[^\n]*\n|[^\n]+$/g)!.slice(e.sourceBinding.startLine-1,e.sourceBinding.endLine).join(''):null;
 if(passage!==null) {assert.equal(passage,e.statement);assert.equal(sha256(passage),e.sourceBinding!.excerptSha256);}
 const surfaces=inputs.renderedBodies.map(s=>{
  const directory=artifacts[s.base==='/'?0:1].directory;
  const file=directory+(e.route==='/'?'/index.html':e.route+'index.html');
  const $=load(readFileSync(file,'utf8')),body=$(`[data-canonical-body="${e.id}"]`);
  const rendered=renderEntrySync(c,e,s.base),plain=renderMarkdownSync(e.plainLanguage,s.base,c);
  assert.equal(sha256(rendered),s.sha256);assert.equal(sha256(plain),s.plainLanguageSha256);
  assert.equal(body.text(),old.surfaces.find((x:any)=>x.base===s.base).bodyText);
  assert.equal(body.text().replace(/\s+/g,' ').trim(),load(rendered,null,false).text().replace(/\s+/g,' ').trim());
  const detail=$(`[data-record-details="${e.id}"]`),plainText=load(plain,null,false).text();
  if(plainText)assert.ok(detail.text().includes(plainText));
  const tex:string[]=[];const walk=(n:any)=>{if(['math','inlineMath'].includes(n.type))tex.push(n.value.trim());n.children?.forEach(walk);};
  walk(parseMarkdown(sourceDisplay(passage??'',e.adapter)));
  if(passage!==null)assert.deepEqual(body.find('annotation[encoding="application/x-tex"]').toArray().map(n=>$(n).text().trim()),tex);
  const authored=['DOC-HOME','DOC-START','DOC-CONCEPT-GEOMETRY'].includes(e.id);
  assert.equal(detail.find('.binding-receipt').length,authored?0:2);
  const projectionText=e.id==='DOC-HOME'?$('[data-source-projection="DOC-STATUS"]').text():null;
  if(e.id==='DOC-HOME')assert.equal(projectionText,old.surfaces.find((x:any)=>x.base===s.base).projectionText);
  return {base:s.base,file,bodyText:body.text(),plainText,detailsText:detail.text(),links:body.find('a').toArray().map(n=>({text:$(n).text(),href:$(n).attr('href')})),equations:tex,projectionText};
 });
 return {id:e.id,sourcePassage:passage,inputs,surfaces,previousEvidenceRef:decision.evidenceRef,previousEvidenceSha256:decision.evidenceSha256,comparison:'Every read field and rendered hash unchanged; old fingerprint reproduced with predecessor renderer identity.'};
});
writeFileSync(`${folder}/independent-read-snapshots.json`,JSON.stringify({schema:'unity-independent-website-reads/1',representations},null,2)+'\n');
writeFileSync(`${folder}/representations-read.txt`,representations.map(r=>`${r.id}\n${JSON.stringify(r.inputs.ownRead,null,2)}\nDISPLAY: ${r.surfaces[0].bodyText}\nPLAIN: ${r.surfaces[0].plainText}\nDETAILS: ${r.surfaces[0].detailsText}\n`).join('\n'));
function cases(path:string) {
 const rows=[...readFileSync(path,'utf8').replace(/\x1b\[[0-9;]*m/g,'').matchAll(/^[✔✖] (.+?) \([\d.]+ms\)$/gm)];
 const map=new Map<string,boolean>();
 for(const m of rows) {const pass=m[0].startsWith('✔');if(map.has(m[1]))assert.equal(map.get(m[1]),pass);map.set(m[1],pass);}
 // Node repeats the two failing rows in its final failure-detail section.
 return map;
}
const first=cases(`${recheck}/first-batch-verification.log`),focused=cases(`${recheck}/verification-final.log`);
assert.equal(first.size,76);assert.equal([...first.values()].filter(Boolean).length,74);
assert.equal(focused.size,33);assert.ok([...focused.values()].every(Boolean));
const distinct=new Map(first);for(const [name,pass] of focused){assert.ok(first.has(name));distinct.set(name,pass);}
assert.equal(distinct.size,76);assert.ok([...distinct.values()].every(Boolean));
const retained=json(`${recheck}/final-checks.json`).retained.map((a:any)=>{
 const inventory=filesIn(a.directory).map(path=>{const raw=readFileSync(`${a.directory}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 assert.equal(sha256(stableJSON(inventory)),a.artifactSha256);return {...a,independentlyRehashed:true};
});
const report={status:'PASS',productionInputs:buildInputs(),renderer:c.rendererSha256,oldRenderer,sourceInventory:c.admission.inventorySeal,representations:34,artifacts,retained,
 contracts:{distinctCases:76,rerunAffected:[...focused.keys()],reusedUnchanged:[...first.keys()].filter(k=>!focused.has(k)),allPassing:true,finalMonolithicVerifyClaimed:false},chromium:14,
 inputComparison:'Exact prior ownRead, source reads, dependencies and both-base rendered hashes. Policy-only change independently reproduced.',
 currentStates:{accepted:0,pending:0,stale:34,rejected:0},currentSourceQualified:false,
 snapshotsSha256:sha256(readFileSync(`${folder}/independent-read-snapshots.json`))};
writeFileSync(`${folder}/independent-engineering.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',representations:34,artifacts,contracts:76,chromium:14,retained:retained.length}));
