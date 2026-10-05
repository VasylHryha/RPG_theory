import {cssResourceURLs} from '../../scripts/css-resources.js';
import {test} from 'node:test';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,mkdirSync,renameSync,rmSync} from 'node:fs';
import {posix,join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {parse} from 'yaml';
import {load} from 'cheerio';
import {loadCanonicalCorpus,validateCorpus,renderEntrySync} from '../../src/lib/content.js';
import {selectPublication,publicationFor} from '../../src/lib/publication.js';
import {loadSiteConfig} from '../../src/lib/site-config.js';
import {publicationAssets,verifyArchive,explanatoryMarkdown,rssXML,citationCFF,citationGates,publicationCredit} from '../../src/lib/publication-assets.js';
import {rawPath} from '../../src/lib/source-paths.js';
import {documentMarkdown} from '../../src/lib/source-links.js';
import {sourceDisplay} from '../../src/lib/source-display.js';
import {parseMarkdown} from '../../src/lib/markdown-tree.js';
import {makeZip} from '../../src/lib/zip.js';
import {readAdmission} from '../../src/lib/source-admission.js';
import {installSyntheticReview} from './fidelity-fixture.js';
const config=loadSiteConfig(),corpus=loadCanonicalCorpus(),release=JSON.parse(readFileSync('research/publication/release.json','utf8'));
function input(){return {entries:[...corpus.entries.values()].map(e=>({...structuredClone(e),statement:e.contentOrigin==='source-bound'?null:e.statement})),sources:[...corpus.sources.values()],references:[...corpus.references.values()],aliases:JSON.parse(readFileSync('research/publication/citation-aliases.yaml','utf8')),record:readAdmission()!};}
function approvedMechanics(){
  const c=loadCanonicalCorpus(),definition=structuredClone(c.entries.get('UT-D01')!),article=structuredClone(c.entries.get('DOC-ARTICLE-UNIT')!);
  definition.updatedAt='2026-10-01';definition.publicationState='published';definition.publishedAt='2026-10-01';definition.rightsRef='FIXTURE-RIGHTS';
  article.updatedAt='2026-10-04';article.publicationState='published';article.publishedAt='2026-10-04';article.authorIdentity='Synthetic organization';article.rightsRef='FIXTURE-RIGHTS';article.dependsOn=[];article.body='Synthetic article control.';
  c.entries=new Map([[definition.id,definition],[article.id,article]]);
  installSyntheticReview(c,definition.id);installSyntheticReview(c,article.id);
  writeFileSync(join(c.root,'research/publication/metadata.json'),JSON.stringify({...publicationCredit(),approvedCredit:{name:'Synthetic organization',evidenceRef:'Synthetic mechanics only'},permanentUrl:'https://example.org/research/',rights:{statement:'Synthetic rights only',evidenceRef:'Synthetic fixture'}}));
  const r={...release,releaseAt:'2026-10-04T18:00:00.000Z',rights:[{id:'FIXTURE-RIGHTS',outcome:'approved' as const,entryIds:[definition.id,article.id],evidenceRef:'Synthetic fixture'}]};
  return {c,r,article,definition};
}
test('M4 explanatory exports mirror canonical parsed statements, retain adapters and have usable destinations at both bases',()=>{
 for(const basePath of ['/','/unity-theory/']) {
  const s=publicationFor('preview',{...config,basePath}),assets=publicationAssets(s,{...config,basePath});
  for(const e of s.entries.filter(e=>s.manifest.exportIds.includes(e.id))){const text=assets.files.get(`/downloads/explanatory/${e.id}.md`)!.toString();assert.equal(text,explanatoryMarkdown(corpus,e,{...config,basePath}));assert.doesNotMatch(text,/(?<!\w):{1,2}(?:claim|cite)(?:\[|\{)/);
    // HTML generated from exported source/body preserves actual canonical rendering,
    // apart from the expected absolute URL spelling and export framing.
    const body=documentMarkdown(sourceDisplay(e.statement ?? '',e.adapter),corpus,e);if(e.sourceBinding){const values=(value:string)=>{const result:string[]=[];function collect(n:any){if(n.value)result.push(n.value);n.children?.forEach(collect);}collect(parseMarkdown(value));return result.join('|');};assert.ok(values(text).includes(values(body)),e.id);}
    function visit(n:any){if(n.url)assert.match(n.url,/^(?:https:\/\/|#|\.\.?\/)/);n.children?.forEach(visit);}visit(parseMarkdown(text));
  }
  const math=assets.files.get('/downloads/explanatory/DOC-MATH.md')!.toString();assert.match(math,/F_q=-\\frac/);assert.match(math,/defines the restoring\/driving interaction/);assert.doesNotMatch(renderEntrySync(corpus,corpus.entries.get('DOC-MATH')!),/katex-error/);
 }
});
test('M4 ZIP manifests preserve original bytes and exclude administrative evidence/history; tampered members fail',()=>{
 const s=publicationFor('preview',config),a=publicationAssets(s,config),members=verifyArchive(a.files.get(a.zipPath)!);
 assert.deepEqual([...members.keys()].sort(),[...a.members.keys()].sort());
 for(const key of s.manifest.sourceDownloadKeys){const src=corpus.sources.get(key)!;assert.ok(src.path.startsWith('research/RRG_CURRENT/'));assert.ok(members.get(rawPath(key,src.path).slice('/downloads/'.length))!.equals(readFileSync(src.path)));}
 for(const path of members.keys())assert.doesNotMatch(path,/^(?:docs|research|history|\.git|\.env|public)\//);
 assert.match(members.get('README.md')!.toString(),/PRIVATE PREVIEW/);assert.equal(a.identity.workspaceDirty,true);assert.equal(a.identity.commitDescribesInputs,false);
 const corrupted=new Map(members);corrupted.set('explanatory/UT-D01.md',Buffer.from('wrong statement'));assert.throws(()=>verifyArchive(makeZip(corrupted)),/ARCHIVE_HASH_FAILURE/);
 assert.throws(()=>makeZip(new Map([['../history.md',Buffer.from('unapproved')]])),/UNSAFE_ROUTE/);
 assert.equal(members.has('CITATION.cff'),true);
 // Resolve real companion destinations and fragments after conversion.
 const ids=new Map<string,Set<string>>();
 for(const [path,raw] of members)if(path.endsWith('.md')) {
  const html=String(unified().use(remarkParse).use(remarkMath).use(remarkGfm).use(remarkRehype).use(rehypeSlug).use(rehypeStringify).processSync(raw.toString()));
  const $=load(html);ids.set(path,new Set($('[id]').toArray().map(el=>$(el).attr('id')!)));
 }
 for(const [path,raw] of members)if(path.endsWith('.md') && !path.startsWith('original/')){
  function walk(n:any){
   if(n.url && !n.url.startsWith('https://')){const [dest,fragment]=n.url.split('#');const target=dest?posix.normalize(posix.join(posix.dirname(path),dest)):path;assert.ok(members.has(target),`${path}: ${n.url}`);if(fragment)assert.ok(ids.get(target)?.has(decodeURIComponent(fragment)),`${path}: ${n.url}`);}
   n.children?.forEach(walk);
  }walk(parseMarkdown(raw.toString()));
 }
});
test('M4 approved selection filters draft/history/withdrawn downloads and emits dated article RSS at both bases',()=>{
 const {c,r,article,definition}=approvedMechanics();
 const draft=structuredClone(corpus.entries.get('DOC-ARTICLE-STRUCTURES')!);draft.publicationState='draft';draft.publishedAt=null;c.entries.set(draft.id,draft);
 for(const basePath of ['/','/unity-theory/']) {
  const cfg={...config,basePath},s=selectPublication(c,cfg,r,'qualification');
  for(const ids of [s.manifest.navigationIds,s.manifest.searchIds,s.manifest.sitemapIds,s.manifest.exportIds,s.manifest.feedIds])assert.ok(!ids.includes(draft.id));
  assert.equal(s.manifest.sourceDownloadKeys.some(k=>k.startsWith('R-HISTORY')),false);
  const $=load(rssXML({...s,corpus:c},cfg),{xmlMode:true});assert.equal($('item').length,1);assert.equal($('item title').text(),article.title);assert.equal($('item link').text(),cfg.origin+(basePath==='/'?article.route:basePath+article.route.slice(1)));assert.equal(new Date($('pubDate').text()).toISOString().slice(0,10),'2026-10-04');
 }
 article.publishedAt='2026-10-05';assert.throws(()=>selectPublication(c,config,r,'qualification'),/FUTURE_PUBLICATION/);article.publishedAt='2026-10-04';
 definition.publicationState='withdrawn';definition.correctionRef='Synthetic correction';definition.withdrawalReason='Synthetic removal';definition.body='WITHDRAWN_BODY';installSyntheticReview(c,definition.id);
 const selected=selectPublication(c,config,{...r,historicalIds:[definition.id]},'qualification');assert.ok(!selected.manifest.exportIds.includes(definition.id));assert.deepEqual(selected.entries.find(e=>e.id===definition.id)!.sourceRefs,[]);
});
test('M4 duplicate article routes and stale source numbers refuse; document source rename does not rename its route',()=>{
 const i=input(),a=i.entries.find(e=>e.id==='DOC-ARTICLE-UNIT')!,b=i.entries.find(e=>e.id==='DOC-ARTICLE-STRUCTURES')!;b.route=a.route;assert.throws(()=>validateCorpus(i),/ROUTE_COLLISION/);
 const changed=input();changed.entries.find(e=>e.id==='UT-D01')!.sourceBinding!.startLine+=1;assert.throws(()=>validateCorpus(changed),/SOURCE_BINDING_FAILURE/);
 const root=mkdtempSync(join(tmpdir(),'unity-m4-rename-'));
 try {
  for(const path of ['research','src','config','astro.config.mjs','package-lock.json'])cpSync(path,join(root,path),{recursive:true});
  for(const ref of corpus.references.values())if(ref.metadataEvidence){const dest=join(root,ref.metadataEvidence.path);mkdirSync(dirname(dest),{recursive:true});cpSync(ref.metadataEvidence.path,dest);}
  writeFileSync(join(root,'research/publication/website-reviews.yaml'),'[]\n');
  const before=loadCanonicalCorpus(root).entries.get('DOC-ARTICLE-UNIT')!;
  renameSync(join(root,'research/publication/pages/article-when-can-a-whole-be-treated-as-one-useful-unit.md'),join(root,'research/publication/pages/renamed-canonical-article.md'));
  const after=loadCanonicalCorpus(root).entries.get(before.id)!;assert.equal(after.route,before.route);assert.equal(renderEntrySync(corpus,after),renderEntrySync(corpus,before));
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('M4 citation uses owner-approved metadata; missing URL still refuses a synthetic CFF',()=>{
 const a=publicationAssets(publicationFor('preview',config),config);assert.equal(parse(citationCFF(a.identity)!).authors[0].name,'Vasyl Hryha');assert.deepEqual(citationGates(),[]);assert.equal(citationCFF(a.identity,{...publicationCredit(),permanentUrl:null}),null);
 const credit={...publicationCredit(),approvedCredit:{name:'Synthetic organization',evidenceRef:'Synthetic fixture only'},permanentUrl:'https://example.org/research/',rights:{statement:'Synthetic rights only',evidenceRef:'Synthetic fixture'}};
 const cff=parse(citationCFF(a.identity,credit)!);assert.equal(cff.authors[0].name,credit.approvedCredit.name);assert.equal(cff.version,a.identity.websiteRelease);assert.equal(cff.doi,undefined);
});

test('M4 print CSS admits page layout and literal citation targets while refusing resource-bearing attr forms',()=>{
 assert.deepEqual(cssResourceURLs('@page {size:A4;margin:15mm} a::after{content:attr(href)}','print'),[]);
 for(const css of ['a{content:attr(href url)}','a{background:attr(data-src type(<url>))}'])assert.throws(()=>cssResourceURLs(css,'print'),/UNSAFE_OUTPUT_CSS/);
});
