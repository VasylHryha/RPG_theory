import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parse } from 'yaml';
import { parseMarkdown } from './markdown-tree.js';
import { sourceDisplay } from './source-display.js';
export { sourceDisplay } from './source-display.js';
import { entrySchema, sourceSchema, referenceSchema, aliasSchema, executionEvidenceSchema, type ExecutionEvidence, type Entry, type Source, type Reference } from './content-schema.js';
import { ContractError } from './errors.js';
import { readAdmission, qualifyCurrentSource, validateBinding, filesIn, type AdmissionRecord } from './source-admission.js';
import { sha256, stableJSON } from './identity.js';
import { assertUniqueRoutes } from './urls.js';
import { safeMarkdown, renderMarkdown, renderMarkdownSync } from './markdown.js';
import { expandDirectives } from './directives.js';
import { load } from 'cheerio';

import { websiteReviewSchema, validateWebsiteReviews, qualifyWebsiteCorpus, type WebsiteReview } from './website-review.js';

export const renderingPolicy = 'unity-safe-markdown/4;recursive-directives/2;rrg-tex-delimiters/1;scoped-literal-addendum/1;proof-table-row/1';
export interface Corpus { entries: Map<string, Entry>; sources: Map<string, Source>; references: Map<string, Reference>; aliases: Map<string, string>; root: string; websiteReviews: WebsiteReview[]; evidence: Map<string,ExecutionEvidence>; rendererSha256: string; admission: ReturnType<typeof qualifyCurrentSource> }
function fail(code: string, message: string): never { throw new ContractError(code, message); }
export function readYAML(path: string): unknown { return parse(readFileSync(path, 'utf8'), { uniqueKeys: true }); }
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value.slice(0,10)) fail('INVALID_DATE', value);
  return Date.parse(value);
}
function index<T>(values: T[], key: (value: T) => string, code = 'DUPLICATE_ID') { const result = new Map<string,T>(); for (const value of values) { const id = key(value); if (result.has(id)) fail(code, id); result.set(id,value); } return result; }
function referenceIdentity(url: string) {
  const parsed=new URL(url);
  // DOI identifiers have their own normalization policy. Other destinations
  // retain the complete URL path: a PDF and a path ending in .pdf/ differ.
  return parsed.hostname==='doi.org'?`https://doi.org/${decodeURIComponent(parsed.pathname.slice(1)).toLowerCase().replace(/\/$/,'')}`:parsed.href;
}
export function validateCorpus(input: { entries: unknown[]; sources: unknown[]; references: unknown[]; aliases: unknown[]; websiteReviews?: unknown[]; evidence?: unknown[]; record: AdmissionRecord; root?: string }): Corpus {
  const root = resolve(input.root ?? process.cwd()); const admission = qualifyCurrentSource(input.record, root);
  const entries = index(input.entries.map(e => entrySchema.parse(e)), e => e.id);
  const sources = index(input.sources.map(s => sourceSchema.parse(s)), s => s.key);
  const references = index(input.references.map(r => referenceSchema.parse(r)), r => r.id);
  index([...references.values()],r=>referenceIdentity(r.identity),'BIBLIOGRAPHIC_IDENTITY_COLLISION');
  const aliases = index(input.aliases.map(a => aliasSchema.parse(a)), a => `${a.sourceKey}:${a.localCitationKey}`, 'CITATION_ALIAS_COLLISION');
  const evidence=index((input.evidence ?? []).map(e=>executionEvidenceSchema.parse(e)),e=>e.id);
  for(const item of evidence.values()) {
    if(!item.path.startsWith('docs/evidence/') || item.path.split('/').some(p=>p==='..') || item.path.includes('\\')) fail('UNSAFE_SOURCE_PATH',item.path);
    const raw=readFileSync(resolve(root,item.path));if(sha256(raw)!==item.sha256) fail('EXECUTION_RECEIPT_REQUIRED',item.id);
    const receipt=JSON.parse(raw.toString());
    if(receipt.schema!=='unity-research-execution/1' || receipt.outcome!=='PASS' || !receipt.command || !receipt.environment || !receipt.inputs?.length || !receipt.outputs?.length || !receipt.tolerances || !receipt.reachedChecks?.length || !receipt.limitations) fail('EXECUTION_RECEIPT_REQUIRED',item.id);
    validDate(receipt.executedAt);
    for(const file of [...receipt.inputs,...receipt.outputs]) {
      if(typeof file.path!=='string' || file.path.startsWith('/') || file.path.split('/').some((p:string)=>p==='..') || file.path.includes('\\') || sha256(readFileSync(resolve(root,file.path)))!==file.sha256) fail('EXECUTION_RECEIPT_REQUIRED',item.id);
    }
  }
  for (const source of sources.values()) {
    if (resolve(root,source.path) !== join(root,source.path) || source.path.split('/').some(x=>x === '..') || /[\\\u0000]/.test(source.path)) fail('UNSAFE_SOURCE_PATH',source.path);
    const raw = readFileSync(resolve(root,source.path)); if (sha256(raw) !== source.sha256) fail('SOURCE_INTEGRITY_FAILURE',source.key);
    if (source.declaredCurrent) { const file = input.record.files.find(f => `${input.record.directory}/${f.path}` === source.path); if (!file || file.sha256 !== source.sha256 || source.authorityNoticeOnly || source.edition!==admission.edition) fail('SOURCE_REGISTRY_FAILURE',source.key); }
  }
  if(stableJSON([...sources.values()].filter(s=>s.declaredCurrent).map(s=>s.path).sort())!==stableJSON(input.record.files.map(f=>`${input.record.directory}/${f.path}`).sort())) fail('SOURCE_REGISTRY_FAILURE','Registry must cover exactly the admitted current package');
  for (const alias of aliases.values()) { if (!sources.has(alias.sourceKey) || !references.has(alias.bibliographyId)) fail('UNKNOWN_REFERENCE',alias.localCitationKey); }
  for (const reference of references.values()) {
    if (!reference.url.startsWith('https://') || new URL(reference.url).username || new URL(reference.url).password || !reference.identity || !reference.supportScope || !reference.verificationScope) fail('INVALID_REFERENCE',reference.id);
    if(referenceIdentity(reference.identity)!==referenceIdentity(reference.url)) fail('BIBLIOGRAPHIC_IDENTITY_COLLISION',reference.id);
    reference.sourceRefs.forEach(key => { if (!sources.has(key)) fail('UNKNOWN_SOURCE',key); });
    if(reference.primaryId && (!references.has(reference.primaryId) || references.get(reference.primaryId)?.primaryId)) fail('BIBLIOGRAPHIC_IDENTITY_COLLISION',reference.id);
    if(reference.checkedAt) validDate(reference.checkedAt);
    if(reference.metadataEvidence) {
      const evidence=reference.metadataEvidence;
      if(!evidence.path.startsWith('docs/evidence/') || evidence.path.split('/').some(p=>p==='..') || evidence.path.includes('\\')) fail('UNSAFE_SOURCE_PATH',evidence.path);
      const raw=readFileSync(resolve(root,evidence.path));
      if(sha256(raw)!==evidence.sha256 || JSON.parse(raw.toString()).message.DOI.toLowerCase()!==reference.doi?.toLowerCase()) fail('REFERENCE_METADATA_FAILURE',reference.id);
      const metadata=JSON.parse(raw.toString()).message;
      const title=load(metadata.title[0],null,false).text().replace(/\s+/g,'').toLowerCase();
      const statedTitle=reference.title.replace(/[\s_]+/g,'').toLowerCase();
      const authors=metadata.author.map((a:{given?:string;family?:string})=>[a.given,a.family].filter(Boolean).join(' '));
      const years=['published-print','published-online','issued'].flatMap(key=>metadata[key]?.['date-parts']?.map((date:number[])=>date[0]) ?? []);
      if(title!==statedTitle || stableJSON(authors)!==stableJSON(reference.authors) || !metadata['container-title'].includes(reference.publication) || !years.includes(reference.year) || !reference.checkedAt || new URL(reference.url).hostname!=='doi.org' || decodeURIComponent(new URL(reference.url).pathname.slice(1)).toLowerCase()!==reference.doi?.toLowerCase()) fail('REFERENCE_METADATA_FAILURE',reference.id);
    }
  }
  assertUniqueRoutes([...entries.values()].map(e=>e.route).concat(['/404.html','/fixtures/math/','/references/']));
  const kinds: Record<string,string> = { D:'definition', A:'assumption', R:'derivation', C:'conjecture', E:'evidence', P:'prediction', F:'falsification', O:'open-problem' };
  for (const entry of entries.values()) {
    if (entry.id.startsWith('UT-') && (!/^UT-[DARCEPFO][0-9]{2,}$/.test(entry.id) || kinds[entry.id[3]] !== entry.kind)) fail('INVALID_RECORD_ID',entry.id);
    if (!entry.id.startsWith('UT-') && !/^DOC-[A-Z0-9-]+$/.test(entry.id)) fail('INVALID_DOCUMENT_ID',entry.id);
    if (!entry.id.startsWith('UT-') && Object.values(kinds).includes(entry.kind)) fail('INVALID_RECORD_ID',entry.id);
    if (entry.id.startsWith('UT-') && entry.contentOrigin === 'authored') fail('PROPOSAL_PROVENANCE_REQUIRED',entry.id);
    if (entry.contentOrigin !== 'source-bound' && entry.sourceBinding) fail('SOURCE_BINDING_FAILURE',entry.id);
    if (entry.sourceRefs.some(key=>sources.get(key)?.authorityNoticeOnly) && entry.id.startsWith('UT-')) fail('SOURCE_NOTE_ONLY_MISUSE',entry.id);
    if (entry.id==='DOC-HOME' && entry.route!=='/' || entry.id==='DOC-START' && entry.route!=='/start/' || entry.route!=='/' && !entry.route.endsWith('/')) fail('INVALID_DOCUMENT_ROUTE',entry.id);
    if (!['superseded','withdrawn'].includes(entry.publicationState) && entry.researchEdition!==admission.edition) fail('SOURCE_EDITION_MISMATCH',entry.id);
    validDate(entry.updatedAt);
    if (entry.publishedAt && validDate(entry.updatedAt) < validDate(entry.publishedAt)) fail('INVALID_DATE',entry.id);
    if (entry.publicationState !== 'draft' && !entry.publishedAt) fail('INVALID_PUBLICATION_STATE',entry.id);
    if (entry.kind === 'article' && entry.publicationState === 'published' && (!entry.tags?.length || !entry.authorIdentity)) fail('ARTICLE_IDENTITY_REQUIRED',entry.id);
    for (const key of entry.sourceRefs) { if (!sources.has(key)) fail('UNKNOWN_SOURCE',key); }
    if (entry.contentOrigin === 'source-bound') {
      if (entry.statement !== null || !entry.sourceBinding) fail('SOURCE_BINDING_FAILURE',`Independent statement override: ${entry.id}`);
      const source = sources.get(entry.sourceBinding.sourceKey);
      const historical=['superseded','withdrawn'].includes(entry.publicationState) && source?.role==='history_only' && source.path.startsWith('research/history/');
      if ((!source?.declaredCurrent && !historical) || source?.authorityNoticeOnly || !source || !entry.sourceRefs.includes(source.key)) fail('SOURCE_NOTE_ONLY_MISUSE',entry.id);
      if(historical) {
        if(source.edition!==entry.researchEdition || source.sha256!==entry.sourceBinding.sourceSha256) fail('SOURCE_EDITION_MISMATCH',entry.id);
        const file=source.path.split('/').pop()!;
        validateBinding(resolve(root,source.path,'..'),{...entry.sourceBinding,path:file});
      }
      const path = source.path.slice(input.record.directory.length+1);
      if(!historical) {
        if (!input.record.files.some(f=>f.path === path) || source.sha256 !== entry.sourceBinding.sourceSha256) fail('SOURCE_BINDING_FAILURE',entry.id);
        validateBinding(resolve(root,input.record.directory),{ ...entry.sourceBinding, path });
      }
      const lines = readFileSync(resolve(root,source.path),'utf8').match(/[^\n]*\n|[^\n]+$/g) ?? [];
      entry.statement = lines.slice(entry.sourceBinding.startLine-1,entry.sourceBinding.endLine).join('');
      if(!entry.statement.trim()) fail('SOURCE_BINDING_FAILURE',`Empty excerpt: ${entry.id}`);
    } else if (entry.contentOrigin === 'proposed' && (!entry.proposalProvenance || entry.adopted !== false || !entry.statement)) fail('PROPOSAL_PROVENANCE_REQUIRED',entry.id);
    if(entry.contentOrigin==='proposed' && entry.supersedes && entries.has(entry.supersedes) && entries.get(entry.supersedes)!.contentOrigin!=='proposed') fail('PROPOSAL_ADOPTION_REQUIRED',entry.id);
    if (entry.evidenceState === 'external-supported' && (!entry.bibRefs.length || !entry.limits)) fail('EXTERNAL_EVIDENCE_REQUIRED',entry.id);
    for(const id of entry.evidenceRefs) if(!evidence.has(id)) fail('EXECUTION_RECEIPT_REQUIRED',id);
    for(const id of entry.testRefs) if(!entries.has(id) && !sources.has(id) && !references.has(id) && !evidence.has(id)) fail('UNKNOWN_REFERENCE',id);
    if (entry.evidenceState === 'project-reproduced' && !entry.evidenceRefs.length) fail('EXECUTION_RECEIPT_REQUIRED',entry.id);
    if (entry.kind === 'derivation' && (!entry.assumptions.length || !entry.testRefs.length || !entry.limits)) fail('DERIVATION_SCOPE_REQUIRED',entry.id);
    if (entry.kind === 'prediction' && (!entry.observables || !entry.conditions)) fail('PREDICTION_SCOPE_REQUIRED',entry.id);
    if (entry.kind === 'falsification' && (!entry.targetId || !entry.procedure || !entry.rejectionCriterion)) fail('FALSIFICATION_SCOPE_REQUIRED',entry.id);
    if (['superseded','withdrawn'].includes(entry.publicationState) && (!entry.correctionRef || (entry.publicationState === 'superseded' && !entry.supersededBy) || (entry.publicationState === 'withdrawn' && !entry.withdrawalReason))) fail('CORRECTION_REQUIRED',entry.id);
    if(entry.sourceBinding) {
      const urls=[...(entry.statement ?? '').matchAll(/https:\/\/[^\s<>\\]+/g)].map(m=>m[0].split(']')[0].replace(/[).,;`]+$/,''));
      for(const url of urls) {
        const alias=aliases.get(`${entry.sourceBinding.sourceKey}:${url}`);
        if(!alias) fail('UNRESOLVED_CITATION_ALIAS',`${entry.id}: ${url}`);
        const reference=references.get(alias.bibliographyId)!;
        if(referenceIdentity(reference.url)!==referenceIdentity(url)) fail('CITATION_ALIAS_IDENTITY_MISMATCH',url);
        entry.bibRefs.push(alias.bibliographyId);
      }
    }
  }
  for (const entry of entries.values()) {
    const tree = parseMarkdown(entry.body);
    const extracted = expandDirectives(tree, { entries, references }); safeMarkdown()(tree);
    entry.dependsOn = [...new Set([...entry.dependsOn,...extracted.dependencies,...entry.assumptions,...(entry.targetId ? [entry.targetId] : [])])].sort();
    entry.bibRefs = [...new Set([...entry.bibRefs,...extracted.bibliography])].sort();
    for (const key of entry.bibRefs) if (!references.has(key)) fail('UNKNOWN_REFERENCE',key);
    for (const id of [...entry.dependsOn,...entry.related,...(entry.supersededBy ? [entry.supersededBy] : []),...(entry.supersedes ? [entry.supersedes] : [])]) if (!entries.has(id)) fail('UNKNOWN_DEPENDENCY',id);
    for (const text of [entry.plainLanguage, sourceDisplay(entry.statement ?? '',entry.adapter)]) {
      const prose = parseMarkdown(text); const refs = expandDirectives(prose,{entries,references}); safeMarkdown()(prose);
      entry.dependsOn = [...new Set([...entry.dependsOn,...refs.dependencies])].sort();
      entry.bibRefs = [...new Set([...entry.bibRefs,...refs.bibliography])].sort();
    }
    entry.dependsOn = [...new Set([...entry.dependsOn,...entry.testRefs.filter(id=>entries.has(id))])].sort();
  }
  // Bind the transitive rendering/selection policy and its pinned dependencies,
  // not just the entry renderer. A URL, schema, CSS or KaTeX dependency change
  // can change the reviewed presentation without changing source prose.
  const rendererFiles=['content.ts','website-review.ts','content-schema.ts','markdown.ts','markdown-safety.ts','markdown-tree.ts','directives.ts','source-display.ts','presentation.ts','publication.ts','source-admission.ts','site-config.ts','urls.ts','identity.ts','errors.ts'].map(path=>'src/lib/'+path)
    .concat(filesIn(resolve(root,'src')).filter(path=>path.endsWith('.astro') || path.endsWith('.css')).map(path=>'src/'+path),['astro.config.mjs','package-lock.json']).sort();
  const rendererSha256=sha256(stableJSON(rendererFiles.map(path=>[path,sha256(readFileSync(resolve(root,path)))])));
  const corpus = { entries, sources, references, evidence, aliases: new Map([...aliases].map(([k,a])=>[k,a.bibliographyId])), root, websiteReviews:(input.websiteReviews ?? []).map(r=>websiteReviewSchema.parse(r)), admission, rendererSha256 };
  const bindings=[...entries.values()].filter(e=>e.contentOrigin==='source-bound' && sources.get(e.sourceBinding!.sourceKey)?.declaredCurrent).map(e=>{ const {sourceKey,...binding}=e.sourceBinding!;return {...binding,path:sources.get(sourceKey)!.path.slice(input.record.directory.length+1)}; });
  if(stableJSON(bindings.map(b=>stableJSON(b)).sort())!==stableJSON(input.record.bindings.map(b=>stableJSON(b)).sort())) fail('SOURCE_BINDING_FAILURE','Corpus extraction membership differs from admitted bindings');
  for (const entry of entries.values()) {
    dependencyClosure(corpus,entry.id);
    if (entry.supersededBy && (entry.supersededBy===entry.id || entries.get(entry.supersededBy)?.supersedes!==entry.id || entry.publicationState!=='superseded')) fail('CORRECTION_REQUIRED',entry.id);
    if (entry.supersedes && entries.get(entry.supersedes)?.supersededBy!==entry.id) fail('CORRECTION_REQUIRED',entry.id);
    const seen=new Set<string>(); let current: Entry | undefined=entry;
    while(current?.supersededBy) { if(seen.has(current.id)) fail('CORRECTION_CYCLE',entry.id);seen.add(current.id);current=entries.get(current.supersededBy); }
  }
  validateWebsiteReviews(corpus,root);
  corpus.admission.currentSourceQualified=qualifyWebsiteCorpus(corpus);
  return corpus;
}
export function dependencyClosure(corpus: Corpus, id: string): string[] {
  const result = new Set<string>(); const stack = new Set<string>(); const visited = new Set<string>();
  function visit(key: string) { const entry = corpus.entries.get(key); if (!entry) fail('UNKNOWN_DEPENDENCY',key); if (stack.has(key)) fail('DEPENDENCY_CYCLE',key); if(visited.has(key)) return; stack.add(key); for (const child of entry.dependsOn) { visit(child); result.add(child); } stack.delete(key); visited.add(key); }
  visit(id); return [...result].sort();
}
function normalized(value: unknown): unknown { if (typeof value==='string') return value.replace(/\r\n?/g,'\n'); if (Array.isArray(value)) return value.map(normalized); if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalized(v)])); return value; }
export function semanticDigest(entry: Entry) { return sha256(stableJSON(normalized(entry))); }
export function reviewFingerprint(corpus: Corpus, id: string) {
  const entry = corpus.entries.get(id) ?? fail('UNKNOWN_DEPENDENCY',id); const relevant = [entry,...dependencyClosure(corpus,id).map(key=>corpus.entries.get(key)!)];
  const directBib = relevant.flatMap(e=>e.bibRefs.concat(e.testRefs.filter(key=>corpus.references.has(key))));
  const bibKeys = [...new Set(directBib.concat(directBib.flatMap(key=>corpus.references.get(key)?.primaryId ?? [])))].sort();
  const sourceKeys = [...new Set(relevant.flatMap(e=>e.sourceRefs.concat(e.testRefs.filter(key=>corpus.sources.has(key)))).concat(bibKeys.flatMap(key=>corpus.references.get(key)!.sourceRefs)))].sort();
  return sha256(stableJSON({ own: semanticDigest(entry), dependencies: relevant.slice(1).map(e=>[e.id,semanticDigest(e)]), sources: sourceKeys.map(key=>corpus.sources.get(key)), references: bibKeys.map(key=>corpus.references.get(key)), evidence: [...new Set(relevant.flatMap(e=>e.evidenceRefs.concat(e.testRefs.filter(key=>corpus.evidence.has(key)))))].sort().map(key=>corpus.evidence.get(key)), aliases: [...corpus.aliases].filter(([key,value])=>sourceKeys.includes(key.slice(0,key.lastIndexOf(':'))) && bibKeys.includes(value)).sort(), renderingPolicy, rendererSha256:corpus.rendererSha256 }));
}
export function affectedEntries(corpus: Corpus,id: string) {
  if(!corpus.entries.has(id) && !corpus.sources.has(id) && !corpus.references.has(id) && !corpus.evidence.has(id)) fail('UNKNOWN_DEPENDENCY',id);
  return [...corpus.entries.keys()].filter(key=>{
    const ids=[key,...dependencyClosure(corpus,key)];if(ids.includes(id)) return true;
    const relevant=ids.map(key=>corpus.entries.get(key)!);
    const refs=relevant.flatMap(e=>e.bibRefs.concat(e.testRefs.filter(key=>corpus.references.has(key))));
    const bib=[...new Set(refs.concat(refs.flatMap(key=>corpus.references.get(key)?.primaryId ?? [])))];
    return bib.includes(id) || bib.some(key=>corpus.references.get(key)!.sourceRefs.includes(id)) || relevant.some(e=>[...e.sourceRefs,...e.testRefs,...e.evidenceRefs].includes(id));
  }).sort();
}
export function loadCanonicalCorpus(root = process.cwd()): Corpus {
  const folder = resolve(root,'research/publication'); const record = readAdmission(resolve(root,'config/research-source.json')) ?? fail('CURRENT_SOURCE_PACKAGE_MISSING','admission');
  const documents = readYAML(join(folder,'canonical-documents.yaml')) as unknown[];
  const records = readYAML(join(folder,'records.yaml')) as unknown[];
  const pages = filesIn(join(folder,'pages')).filter(p=>p.endsWith('.md')).map(path=> { const raw = readFileSync(join(folder,'pages',path),'utf8'); const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw); if (!match) fail('INVALID_FRONTMATTER',path); return { ...parse(match[1]), body: match[2] }; });
  return validateCorpus({ entries: [...documents,...records,...pages], sources: readYAML(join(folder,'source-index.yaml')) as unknown[], references: readYAML(join(folder,'references.yaml')) as unknown[], aliases: readYAML(join(folder,'citation-aliases.yaml')) as unknown[], websiteReviews: readYAML(join(folder,'website-reviews.yaml')) as unknown[], evidence: readYAML(join(folder,'execution-evidence.yaml')) as unknown[], record, root });
}
export async function renderEntry(corpus: Corpus,entry: Entry,base='/') { return renderMarkdown(sourceDisplay(entry.statement ?? '',entry.adapter) + '\n\n' + entry.body,base,corpus); }

export function renderEntrySync(corpus: Corpus,entry: Entry,base='/') { return renderMarkdownSync(sourceDisplay(entry.statement ?? '',entry.adapter) + '\n\n' + entry.body,base,corpus); }

// Context-sensitive editorial diagnostics: flag candidates, never manufacture
// semantic approval or reject a legitimate quotation/negation automatically.
export function beginnerWordingCandidates(entry: Entry) {
  if(entry.audience!=='general' || !['intro','concept','example'].includes(entry.kind))return [];
  const patterns:[string,RegExp][]=[
    ['stability-theorem',/universal.{0,50}stability.{0,30}theorem/gi],
    ['geometry-only-string',/geometry alone.{0,20}(?:fixes|determines).{0,35}(?:tension|mass|material)/gi],
    ['wave-as-proof',/wave.{0,25}(?:proves|proof).{0,35}(?:persistent|higher.level)/gi],
    ['oxygen-inevitability',/oxygen.{0,30}(?:guarantees|inevitably).{0,40}(?:complex|higher)/gi]
  ];
  const text=entry.body+'\n'+entry.plainLanguage;
  return patterns.flatMap(([rule,pattern])=>[...text.matchAll(pattern)].map(match=>({rule,excerpt:text.slice(Math.max(0,match.index!-70),match.index!+match[0].length+70),requiresContextReview:true})));
}
