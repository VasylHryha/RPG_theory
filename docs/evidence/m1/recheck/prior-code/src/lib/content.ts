import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parse } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { entrySchema, sourceSchema, referenceSchema, aliasSchema, reviewSchema, executionEvidenceSchema, type ExecutionEvidence, type Entry, type Source, type Reference, type Review } from './content-schema.js';
import { ContractError } from './errors.js';
import { readAdmission, qualifyCurrentSource, validateBinding, filesIn, type AdmissionRecord } from './source-admission.js';
import { sha256, stableJSON } from './identity.js';
import { assertUniqueRoutes } from './urls.js';
import { safeMarkdown, renderMarkdown, renderMarkdownSync } from './markdown.js';
import { expandDirectives } from './directives.js';

export const renderingPolicy = 'unity-safe-markdown/3;rrg-tex-delimiters/1;scoped-literal-addendum/1;proof-table-row/1';
export interface Corpus { entries: Map<string, Entry>; sources: Map<string, Source>; references: Map<string, Reference>; aliases: Map<string, string>; reviews: Review[]; evidence: Map<string,ExecutionEvidence>; admission: ReturnType<typeof qualifyCurrentSource> }
function fail(code: string, message: string): never { throw new ContractError(code, message); }
export function readYAML(path: string): unknown { return parse(readFileSync(path, 'utf8'), { uniqueKeys: true }); }
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value.slice(0,10)) fail('INVALID_DATE', value);
  return Date.parse(value);
}
function index<T>(values: T[], key: (value: T) => string, code = 'DUPLICATE_ID') { const result = new Map<string,T>(); for (const value of values) { const id = key(value); if (result.has(id)) fail(code, id); result.set(id,value); } return result; }
export function sourceDisplay(raw: string, adapter: Entry['adapter']) {
  // Only the explicitly selected literal-addendum adapter decodes the encoded suffix.
  let text = raw;
  if (adapter === 'rrg-escaped-addendum/1') {
    const offset = text.indexOf('\\n\\n');
    if (offset < 0) fail('SOURCE_ADAPTER_FAILURE', 'Expected inspected literal addendum');
    text = text.slice(0,offset) + text.slice(offset).replace(/\\n/g,'\n').replace(/\\\\/g,'\\');
  }
  if(adapter==='rrg-proof-table/1') text=text.replace(/(\|[^\n]+\|)\n(?:\s*\n)+(?=\|)/g,'$1\n');
  return text.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_match,tex) => '\n$$\n'+tex+'\n$$\n').replace(/\\\((.*?)\\\)/g, (_match,tex) => '$'+tex+'$');
}
export function validateCorpus(input: { entries: unknown[]; sources: unknown[]; references: unknown[]; aliases: unknown[]; reviews: unknown[]; evidence?: unknown[]; record: AdmissionRecord; root?: string }): Corpus {
  const root = input.root ?? process.cwd(); const admission = qualifyCurrentSource(input.record, root);
  const entries = index(input.entries.map(e => entrySchema.parse(e)), e => e.id);
  const sources = index(input.sources.map(s => sourceSchema.parse(s)), s => s.key);
  const references = index(input.references.map(r => referenceSchema.parse(r)), r => r.id);
  index([...references.values()],r=>r.identity,'BIBLIOGRAPHIC_IDENTITY_COLLISION');
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
  const reviews = input.reviews.map(r => reviewSchema.parse(r)); index(reviews,r=>r.entryId,'REVIEW_COLLISION');
  for (const source of sources.values()) {
    if (resolve(root,source.path) !== join(root,source.path) || source.path.split('/').some(x=>x === '..') || /[\\\u0000]/.test(source.path)) fail('UNSAFE_SOURCE_PATH',source.path);
    const raw = readFileSync(resolve(root,source.path)); if (sha256(raw) !== source.sha256) fail('SOURCE_INTEGRITY_FAILURE',source.key);
    if (source.declaredCurrent) { const file = input.record.files.find(f => `${input.record.directory}/${f.path}` === source.path); if (!file || file.sha256 !== source.sha256 || source.authorityNoticeOnly) fail('SOURCE_REGISTRY_FAILURE',source.key); }
  }
  for (const alias of aliases.values()) { if (!sources.has(alias.sourceKey) || !references.has(alias.bibliographyId)) fail('UNKNOWN_REFERENCE',alias.localCitationKey); }
  for (const reference of references.values()) {
    if (!reference.url.startsWith('https://') || !reference.identity || !reference.supportScope || !reference.verificationScope) fail('INVALID_REFERENCE',reference.id);
    reference.sourceRefs.forEach(key => { if (!sources.has(key)) fail('UNKNOWN_SOURCE',key); });
    if(reference.primaryId && (!references.has(reference.primaryId) || references.get(reference.primaryId)?.primaryId)) fail('BIBLIOGRAPHIC_IDENTITY_COLLISION',reference.id);
    if(reference.checkedAt) validDate(reference.checkedAt);
    if(reference.metadataEvidence) {
      const evidence=reference.metadataEvidence;
      if(!evidence.path.startsWith('docs/evidence/') || evidence.path.split('/').some(p=>p==='..') || evidence.path.includes('\\')) fail('UNSAFE_SOURCE_PATH',evidence.path);
      const raw=readFileSync(resolve(root,evidence.path));
      if(sha256(raw)!==evidence.sha256 || JSON.parse(raw.toString()).message.DOI.toLowerCase()!==reference.doi?.toLowerCase()) fail('REFERENCE_METADATA_FAILURE',reference.id);
    }
  }
  assertUniqueRoutes([...entries.values()].map(e=>e.route).concat(['/404.html','/fixtures/math/','/references/']));
  const kinds: Record<string,string> = { D:'definition', A:'assumption', R:'derivation', C:'conjecture', E:'evidence', P:'prediction', F:'falsification', O:'open-problem' };
  for (const entry of entries.values()) {
    if (entry.id.startsWith('UT-') && (!/^UT-[DARCEPFO][0-9]{2,}$/.test(entry.id) || kinds[entry.id[3]] !== entry.kind)) fail('INVALID_RECORD_ID',entry.id);
    if (!entry.id.startsWith('UT-') && !/^DOC-[A-Z0-9-]+$/.test(entry.id)) fail('INVALID_DOCUMENT_ID',entry.id);
    validDate(entry.updatedAt);
    if (entry.publishedAt && validDate(entry.updatedAt) < validDate(entry.publishedAt)) fail('INVALID_DATE',entry.id);
    if (entry.publicationState !== 'draft' && !entry.publishedAt) fail('INVALID_PUBLICATION_STATE',entry.id);
    if (entry.kind === 'article' && entry.publicationState === 'published' && (!entry.tags?.length || !entry.authorIdentity)) fail('ARTICLE_IDENTITY_REQUIRED',entry.id);
    for (const key of entry.sourceRefs) { if (!sources.has(key)) fail('UNKNOWN_SOURCE',key); }
    if (entry.contentOrigin === 'source-bound') {
      if (entry.statement !== null || !entry.sourceBinding) fail('SOURCE_BINDING_FAILURE',`Independent statement override: ${entry.id}`);
      const source = sources.get(entry.sourceBinding.sourceKey);
      if (!source?.declaredCurrent || source.authorityNoticeOnly || !entry.sourceRefs.includes(source.key)) fail('SOURCE_NOTE_ONLY_MISUSE',entry.id);
      const path = source.path.slice(input.record.directory.length+1);
      if (!input.record.files.some(f=>f.path === path) || source.sha256 !== entry.sourceBinding.sourceSha256) fail('SOURCE_BINDING_FAILURE',entry.id);
      validateBinding(resolve(root,input.record.directory),{ ...entry.sourceBinding, path });
      const lines = readFileSync(resolve(root,source.path),'utf8').match(/[^\n]*\n|[^\n]+$/g) ?? [];
      entry.statement = lines.slice(entry.sourceBinding.startLine-1,entry.sourceBinding.endLine).join('');
    } else if (entry.contentOrigin === 'proposed' && (!entry.proposalProvenance || entry.adopted !== false || !entry.statement)) fail('PROPOSAL_PROVENANCE_REQUIRED',entry.id);
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
        if(reference.url.replace(/\/$/,'').toLowerCase()!==url.replace(/\/$/,'').toLowerCase()) fail('CITATION_ALIAS_IDENTITY_MISMATCH',url);
        entry.bibRefs.push(alias.bibliographyId);
      }
    }
    const tree = unified().use(remarkParse).parse(entry.body);
    const extracted = expandDirectives(tree, { entries, references }); safeMarkdown()(tree);
    entry.dependsOn = [...new Set([...entry.dependsOn,...extracted.dependencies,...entry.assumptions,...(entry.targetId ? [entry.targetId] : [])])].sort();
    entry.bibRefs = [...new Set([...entry.bibRefs,...extracted.bibliography])].sort();
    for (const key of entry.bibRefs) if (!references.has(key)) fail('UNKNOWN_REFERENCE',key);
    for (const id of [...entry.dependsOn,...entry.related,...(entry.supersededBy ? [entry.supersededBy] : []),...(entry.supersedes ? [entry.supersedes] : [])]) if (!entries.has(id)) fail('UNKNOWN_DEPENDENCY',id);
    safeMarkdown()(unified().use(remarkParse).parse(entry.plainLanguage));
    safeMarkdown()(unified().use(remarkParse).parse(entry.statement ?? ''));
  }
  const corpus = { entries, sources, references, evidence, aliases: new Map([...aliases].map(([k,a])=>[k,a.bibliographyId])), reviews, admission };
  const bindings=[...entries.values()].filter(e=>e.contentOrigin==='source-bound').map(e=>{ const {sourceKey,...binding}=e.sourceBinding!;return {...binding,path:sources.get(sourceKey)!.path.slice(input.record.directory.length+1)}; });
  if(stableJSON(bindings.map(b=>stableJSON(b)).sort())!==stableJSON(input.record.bindings.map(b=>stableJSON(b)).sort())) fail('SOURCE_BINDING_FAILURE','Corpus extraction membership differs from admitted bindings');
  for (const id of entries.keys()) dependencyClosure(corpus,id);
  for (const review of reviews) { if (!entries.has(review.entryId) || !review.evidenceRef.trim()) fail('INVALID_REVIEW',review.entryId); validDate(review.reviewedAt); }
  return corpus;
}
export function dependencyClosure(corpus: Corpus, id: string): string[] {
  const result = new Set<string>(); const stack = new Set<string>();
  function visit(key: string) { const entry = corpus.entries.get(key); if (!entry) fail('UNKNOWN_DEPENDENCY',key); if (stack.has(key)) fail('DEPENDENCY_CYCLE',key); stack.add(key); for (const child of entry.dependsOn) { visit(child); result.add(child); } stack.delete(key); }
  visit(id); return [...result].sort();
}
function normalized(value: unknown): unknown { if (typeof value==='string') return value.replace(/\r\n?/g,'\n'); if (Array.isArray(value)) return value.map(normalized); if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalized(v)])); return value; }
export function semanticDigest(entry: Entry) { return sha256(stableJSON(normalized(entry))); }
export function reviewFingerprint(corpus: Corpus, id: string) {
  const entry = corpus.entries.get(id) ?? fail('UNKNOWN_DEPENDENCY',id); const relevant = [entry,...dependencyClosure(corpus,id).map(key=>corpus.entries.get(key)!)];
  const sourceKeys = [...new Set(relevant.flatMap(e=>e.sourceRefs).concat(relevant.flatMap(e=>e.bibRefs.flatMap(key=>corpus.references.get(key)!.sourceRefs))))].sort();
  const bibKeys = [...new Set(relevant.flatMap(e=>e.bibRefs))].sort();
  return sha256(stableJSON({ own: semanticDigest(entry), dependencies: relevant.slice(1).map(e=>[e.id,semanticDigest(e)]), sources: sourceKeys.map(key=>corpus.sources.get(key)), references: bibKeys.map(key=>corpus.references.get(key)), evidence: [...new Set(relevant.flatMap(e=>e.evidenceRefs))].sort().map(key=>corpus.evidence.get(key)), aliases: [...corpus.aliases].filter(([key,value])=>sourceKeys.includes(key.slice(0,key.lastIndexOf(':'))) && bibKeys.includes(value)).sort(), renderingPolicy }));
}
export function reviewState(corpus: Corpus, id: string) { const receipt = corpus.reviews.find(r=>r.entryId===id && r.outcome === 'accepted'); return !receipt ? 'pending' : receipt.fingerprint === reviewFingerprint(corpus,id) ? 'accepted' : 'stale'; }
export function affectedEntries(corpus: Corpus,id: string) { return [...corpus.entries.keys()].filter(key=>key===id || dependencyClosure(corpus,key).includes(id)).sort(); }
export function loadCanonicalCorpus(root = process.cwd()): Corpus {
  const folder = resolve(root,'research/publication'); const record = readAdmission(resolve(root,'config/research-source.json')) ?? fail('CURRENT_SOURCE_PACKAGE_MISSING','admission');
  const documents = readYAML(join(folder,'canonical-documents.yaml')) as unknown[];
  const records = readYAML(join(folder,'records.yaml')) as unknown[];
  const pages = filesIn(join(folder,'pages')).filter(p=>p.endsWith('.md')).map(path=> { const raw = readFileSync(join(folder,'pages',path),'utf8'); const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw); if (!match) fail('INVALID_FRONTMATTER',path); return { ...parse(match[1]), body: match[2] }; });
  return validateCorpus({ entries: [...documents,...records,...pages], sources: readYAML(join(folder,'source-index.yaml')) as unknown[], references: readYAML(join(folder,'references.yaml')) as unknown[], aliases: readYAML(join(folder,'citation-aliases.yaml')) as unknown[], reviews: readYAML(join(folder,'reviews.yaml')) as unknown[], evidence: readYAML(join(folder,'execution-evidence.yaml')) as unknown[], record, root });
}
export async function renderEntry(corpus: Corpus,entry: Entry,base='/') { return renderMarkdown(sourceDisplay(entry.statement ?? '',entry.adapter) + '\n\n' + entry.body,base,corpus); }

export function renderEntrySync(corpus: Corpus,entry: Entry,base='/') { return renderMarkdownSync(sourceDisplay(entry.statement ?? '',entry.adapter) + '\n\n' + entry.body,base,corpus); }
