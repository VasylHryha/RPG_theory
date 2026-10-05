import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { buildInputs } from '../../../../src/lib/build-identity.js';
import { loadCanonicalCorpus, renderEntrySync } from '../../../../src/lib/content.js';
import { websiteReviewState } from '../../../../src/lib/website-review.js';
import { renderTechnicalGuide, renderRecordDetails } from '../../../../src/lib/presentation.js';
import { publicationFor } from '../../../../src/lib/publication.js';
import { loadSiteConfig } from '../../../../src/lib/site-config.js';
import { sha256 } from '../../../../src/lib/identity.js';

const folder='docs/evidence/m3/acceptance';mkdirSync(folder,{recursive:true});
const corpus=loadCanonicalCorpus();
const ids=[...corpus.entries.values()].filter(e=>e.id.startsWith('UT-') || e.id.startsWith('DOC-') && e.audience==='technical').map(e=>e.id);
const counts=Object.fromEntries(['accepted','stale','pending','rejected'].map(state=>[state,[...corpus.entries.keys()].filter(id=>websiteReviewState(corpus,id)===state).length]));
const inputs=buildInputs();
const reuse=[];
for(const [base,output,label] of [['/','dist/m3-root','root'],['/unity-theory/','dist/m3-subpath','subpath']]) {
  const info=JSON.parse(readFileSync(`${output}/build-info.json`,'utf8'));
  assert.equal(inputs.inputsSha256,info.inputsSha256,'Current production inputs differ');
  const artifact=JSON.parse(readFileSync(`docs/evidence/m3/implementation/${label}-artifact.json`,'utf8'));
  for(const file of artifact.files)assert.equal(sha256(readFileSync(resolve(output,file.path))),file.sha256,file.path);
  const selection=publicationFor('preview',{...loadSiteConfig(),basePath:base});
  for(const id of ids) {
    const entry=corpus.entries.get(id)!;
    const html=renderEntrySync(corpus,entry,base),$=load(readFileSync(resolve(output,entry.route.slice(1),'index.html'),'utf8'));
    const normalize=(s:string)=>load(s,null,false).html();
    assert.equal(normalize($(`[data-canonical-body="${id}"]`).html()!),normalize(html),`${base}${id} body`);
    assert.equal(normalize($(`[data-record-details="${id}"]`).html()!),normalize(renderRecordDetails(corpus,entry,base)),`${base}${id} details`);
    if(id.startsWith('DOC-'))assert.equal(normalize($(`[data-technical-guide="${id}"]`).html()!),normalize(renderTechnicalGuide(selection,entry,html,base)),`${base}${id} guide`);
  }
  reuse.push({base,filesRehashed:artifact.files.length,inputsSha256:info.inputsSha256,bodiesCompared:ids.length,guidesCompared:ids.filter(id=>id.startsWith('DOC-')).length,status:'MATCH'});
}
const preserved=JSON.parse(readFileSync('docs/evidence/m3/implementation/preserved-inputs.json','utf8'));
writeFileSync(`${folder}/pre-review-registry.json`,readFileSync('research/publication/website-reviews.yaml'));
writeFileSync(`${folder}/evidence-reuse.json`,JSON.stringify({reviewStates:counts,inputs,reuse,preservationSnapshot:preserved},null,2)+'\n');
console.log(JSON.stringify({reviewStates:counts,reuse,ids},null,2));
for(const id of ids.filter(id=>id.startsWith('UT-'))) {
  const e=corpus.entries.get(id)!;
  console.log(JSON.stringify({id,title:e.title,binding:e.sourceBinding,statement:e.statement,plainLanguage:e.plainLanguage,evidenceState:e.evidenceState,limits:e.limits,assumptions:e.assumptions,bibRefs:e.bibRefs,sourceMapping:e.sourceMapping}));
}
