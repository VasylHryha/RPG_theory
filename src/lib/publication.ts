import { ContractError } from './errors.js';
import type { BuildMode, SiteConfig } from './site-config.js';
import { searchable } from './search.js';
import { currentPackageMember } from './source-paths.js';
import { publicationPolicy, assertDeploymentAllowed } from './publication-policy.js';

export function assertBuildAllowed(mode: BuildMode, config: SiteConfig, source: { currentSourceQualified: boolean; corpusScope: string }) {
  if (mode !== 'release') return;
  if (new URL(config.origin).hostname.endsWith('.invalid') || !config.repository) throw new ContractError('PUBLIC_TARGET_REQUIRED', 'A real owner-designated repository and origin are required');
  if (!source.currentSourceQualified || source.corpusScope !== 'current') throw new ContractError('CURRENT_SOURCE_NOT_QUALIFIED', 'M1 bindings and exact website source-fidelity reviews are required');
  if (!config.publicAuthorization) throw new ContractError('PUBLIC_AUTHORIZATION_REQUIRED', 'Publication has not been authorized');
  assertDeploymentAllowed(publicationPolicy(),publicationCredit(),config,{event:process.env.GITHUB_EVENT_NAME??'',ref:process.env.GITHUB_REF??'',repository:process.env.GITHUB_REPOSITORY??'',sha:process.env.GITHUB_SHA??''},source.currentSourceQualified);
}

import { readFileSync } from 'node:fs';
import { websiteReviewState as reviewState, qualifyWebsiteCorpus } from './website-review.js';
import { bibliographyClosure, loadCanonicalCorpus, reviewFingerprint, dependencyClosure, validDate, type Corpus } from './content.js';
import { sha256, stableJSON } from './identity.js';
import type { Entry } from './content-schema.js';
import { z } from 'astro/zod';
import { artifactPaths, publicationCredit, citationGates } from './publication-assets.js';
export interface ReleaseSelection { releaseId: string; releaseAt: string; historicalIds: string[]; rights?: { id: string; outcome: 'approved'; entryIds: string[]; evidenceRef: string }[] }
export function isHistorical(entry: Pick<Entry,'publicationState'>) { return ['superseded','withdrawn','archived'].includes(entry.publicationState); }
const releaseSchema=z.object({releaseId:z.string().min(1),releaseAt:z.string(),historicalIds:z.array(z.string()),rights:z.array(z.object({id:z.string().min(1),outcome:z.literal('approved'),entryIds:z.array(z.string()).min(1),evidenceRef:z.string().min(1)}).strict()).optional()}).strict();
export function withdrawnTombstone(entry: Entry): Entry {
  return { id:entry.id,route:entry.route,title:`${entry.id} — withdrawn record`,description:'This record has been withdrawn. The correction history is retained.',revision:entry.revision,kind:entry.kind,lang:entry.lang,audience:entry.audience,researchEdition:entry.researchEdition,publicationState:'withdrawn',publishedAt:entry.publishedAt,updatedAt:entry.updatedAt,sourceRefs:[],dependsOn:[],related:[],bibRefs:[],contentOrigin:'authored',sourceBinding:null,statement:null,plainLanguage:'',scope:'',evidenceState:'not-applicable',body:'',sourceMapping:'',adapter:'markdown/1',assumptions:[],testRefs:[],evidenceRefs:[],limits:'',rightsRef:entry.rightsRef,correctionRef:entry.correctionRef,withdrawalReason:entry.withdrawalReason };
}
export function selectPublication(corpus: Corpus, config: SiteConfig, release: ReleaseSelection, mode: BuildMode = 'release') {
  release=releaseSchema.parse(release);
  validDate(release.releaseAt);
  if (!release.releaseId || new Set(release.historicalIds).size !== release.historicalIds.length) throw new ContractError('INVALID_RELEASE', 'Explicit release identity/history selection required');
  for (const id of release.historicalIds) {
    if (!corpus.entries.has(id)) throw new ContractError('UNKNOWN_DEPENDENCY',id);
    if(!['superseded','withdrawn','archived'].includes(corpus.entries.get(id)!.publicationState)) throw new ContractError('INVALID_RELEASE',`${id} is not historical`);
  }
  const intended = [...corpus.entries.values()].filter(e => mode === 'preview' || e.publicationState === 'published' || (['superseded','withdrawn','archived'].includes(e.publicationState) && release.historicalIds.includes(e.id)));
  const admission={...corpus.admission,currentSourceQualified:qualifyWebsiteCorpus(corpus,mode==='preview'?undefined:intended.map(e=>e.id))};
  if (mode !== 'preview') {
    if (!admission.bytesVerified || admission.corpusScope !== 'current' || !intended.length) throw new ContractError('CURRENT_SOURCE_NOT_QUALIFIED','Actual current byte integrity and website source-fidelity review required');
    if (!intended.length) throw new ContractError('EMPTY_PUBLICATION','No reviewed current release entries');
    for (const entry of intended) {
      if (!entry.publishedAt || validDate(entry.publishedAt) > validDate(release.releaseAt) || validDate(entry.updatedAt)>validDate(release.releaseAt)) throw new ContractError('FUTURE_PUBLICATION',entry.id);
      if(corpus.websiteReviews.some(r=>r.entryId===entry.id && validDate(r.reviewedAt)>validDate(release.releaseAt))) throw new ContractError('FUTURE_REVIEW',entry.id);
      if (reviewState(corpus,entry.id) !== 'accepted') throw new ContractError('REVIEW_REQUIRED',`${entry.id}: ${reviewState(corpus,entry.id)}; required ${reviewFingerprint(corpus,entry.id)}`);
      if (entry.publicationState !== 'withdrawn') for (const id of dependencyClosure(corpus,entry.id)) {
        if (corpus.entries.get(id)?.publicationState !== 'published' || !intended.some(e=>e.id===id)) throw new ContractError('UNPUBLISHABLE_DEPENDENCY',`${entry.id} → ${id}`);
      }
      if (!entry.rightsRef || !release.rights?.some(r=>r.id===entry.rightsRef && r.outcome==='approved' && r.entryIds.includes(entry.id) && r.evidenceRef)) throw new ContractError('RIGHTS_PROVENANCE_REQUIRED',entry.id);
      if(entry.supersededBy && !intended.some(e=>e.id===entry.supersededBy)) throw new ContractError('UNPUBLISHABLE_CORRECTION',entry.id);
    }
    if(!admission.currentSourceQualified) throw new ContractError('CURRENT_SOURCE_NOT_QUALIFIED','Reviewed selection must include actual source-bound research');
    if(mode==='release') {
      if (new URL(config.origin).hostname.endsWith('.invalid') || !config.repository) throw new ContractError('PUBLIC_TARGET_REQUIRED','Real target required');
      if (!config.publicAuthorization) throw new ContractError('PUBLIC_AUTHORIZATION_REQUIRED','No publication authorization');
    }
  }
  const credit=publicationCredit(corpus.root);
  for(const e of intended.filter(e=>e.kind==='article' && e.publicationState==='published')) {
    if(!e.publishedAt || validDate(e.publishedAt)>validDate(release.releaseAt))throw new ContractError('FUTURE_PUBLICATION',e.id);
    if(!credit.approvedCredit || e.authorIdentity!==credit.approvedCredit.name)throw new ContractError('ARTICLE_IDENTITY_REQUIRED',e.id);
  }
  const entries = intended.map(e => e.publicationState === 'withdrawn' ? withdrawnTombstone(e) : e);
  const discovery = entries.filter(e=>e.publicationState === 'published' || mode === 'preview' && e.publicationState === 'draft');
  const directReferences=entries.filter(e=>e.publicationState!=='withdrawn').flatMap(e=>e.bibRefs);
  const referenceIds = bibliographyClosure(corpus,directReferences);
  const exportIds=entries.filter(e=>!['withdrawn','archived'].includes(e.publicationState) && (mode==='preview' || e.publicationState==='published' || release.historicalIds.includes(e.id))).map(e=>e.id);
  const sourceDownloadKeys=[...new Set(entries.filter(e=>exportIds.includes(e.id)).flatMap(e=>e.sourceRefs))].filter(key=>currentPackageMember(corpus.sources.get(key)!)).sort();
  const downloads=artifactPaths(exportIds,sourceDownloadKeys,release.releaseId,mode==='preview',corpus.sources);
  if(!citationGates(credit).length)downloads.push('/downloads/CITATION.cff');
  const manifest = { schema:'unity-publication/1', mode, deployEligible:false, releaseId:release.releaseId, releaseAt:release.releaseAt, inventorySeal:corpus.admission.inventorySeal,
    entries:entries.map(e=>({ id:e.id,route:e.route,publicationState:e.publicationState,digest:sha256(stableJSON(e)),reviewState:reviewState(corpus,e.id),fingerprint:reviewFingerprint(corpus,e.id) })),
    routes:entries.map(e=>e.route).concat(['/articles/','/cite/','/about/','/legal/','/search/','/rss.xml','/sitemap.xml','/search-manifest.json','/search-client.js','/references/','/404.html',...downloads],mode==='release'?[]:['/fixtures/math/']),
    navigationIds:discovery.map(e=>e.id), searchIds:entries.filter(searchable).map(e=>e.id), sitemapIds:entries.filter(searchable).map(e=>e.id), feedIds:discovery.filter(e=>e.kind==='article' && e.publicationState==='published').map(e=>e.id), exportIds, sourceDownloadKeys, downloads, referenceIds };
  return { admission, entries, references:referenceIds.map(id=>corpus.references.get(id)!), manifest, manifestSha256:sha256(stableJSON(manifest)) };
}
export function publicationFor(mode: BuildMode, config: SiteConfig) {
  const corpus = loadCanonicalCorpus();
  const release = JSON.parse(readFileSync('research/publication/release.json','utf8')) as ReleaseSelection;
  return { corpus, ...selectPublication(corpus,config,release,mode) };
}
let buildSelection: ReturnType<typeof publicationFor> | undefined;
// Astro's isolated static build uses one immutable selection. Dev and CLI validation
// deliberately reload to observe edits; build/audit identities detect subsequent drift.
export function activePublication() {
  if(!process.env.UNITY_OUTPUT_DIR) return publicationFor(buildModeForSelection(),loadSiteConfigForSelection());
  return buildSelection ??= publicationFor(buildModeForSelection(),loadSiteConfigForSelection());
}
import { activeConfig as loadSiteConfigForSelection, activeMode as buildModeForSelection } from './site-config.js';
export function publicationEntry(id: string): { corpus: Corpus; entry: Entry } { const selected = activePublication(); const entry = selected.entries.find(e=>e.id===id); if (!entry) throw new ContractError('ENTRY_NOT_SELECTED',id); return { corpus:selected.corpus,entry }; }
