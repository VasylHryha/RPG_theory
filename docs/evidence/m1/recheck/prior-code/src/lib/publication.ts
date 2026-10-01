import { ContractError } from './errors.js';
import type { BuildMode, SiteConfig } from './site-config.js';

export function assertBuildAllowed(mode: BuildMode, config: SiteConfig, source: { currentSourceQualified: boolean; corpusScope: string }) {
  if (mode !== 'release') return;
  if (new URL(config.origin).hostname.endsWith('.invalid') || !config.repository) throw new ContractError('PUBLIC_TARGET_REQUIRED', 'A real owner-designated repository and origin are required');
  if (!source.currentSourceQualified || source.corpusScope !== 'current') throw new ContractError('CURRENT_SOURCE_NOT_QUALIFIED', 'M1 content bindings and actual-current review are required');
  if (!config.publicAuthorization) throw new ContractError('PUBLIC_AUTHORIZATION_REQUIRED', 'Publication has not been authorized');
  // M0 intentionally has no release selector. M1–M6 must provide its real review,
  // identity/rights and exact-artifact contracts before any release can be built.
  throw new ContractError('RELEASE_PIPELINE_NOT_IMPLEMENTED', 'M0 artifacts are private and non-deployable');
}

import { readFileSync } from 'node:fs';
import { loadCanonicalCorpus, reviewState, reviewFingerprint, dependencyClosure, validDate, type Corpus } from './content.js';
import { sha256, stableJSON } from './identity.js';
import type { Entry } from './content-schema.js';
export interface ReleaseSelection { releaseId: string; releaseAt: string; historicalIds: string[]; rights?: { id: string; outcome: 'approved'; entryIds: string[]; evidenceRef: string }[] }
export function selectPublication(corpus: Corpus, config: SiteConfig, release: ReleaseSelection, mode: BuildMode = 'release') {
  validDate(release.releaseAt);
  if (!release.releaseId || new Set(release.historicalIds).size !== release.historicalIds.length) throw new ContractError('INVALID_RELEASE', 'Explicit release identity/history selection required');
  for (const id of release.historicalIds) if (!corpus.entries.has(id)) throw new ContractError('UNKNOWN_DEPENDENCY',id);
  const intended = [...corpus.entries.values()].filter(e => mode !== 'release' || e.publicationState === 'published' || (['superseded','withdrawn'].includes(e.publicationState) && release.historicalIds.includes(e.id)));
  if (mode === 'release') {
    if (!corpus.admission.currentSourceQualified || corpus.admission.corpusScope !== 'current') throw new ContractError('CURRENT_SOURCE_NOT_QUALIFIED','Actual current binding/content qualification required');
    if (!intended.length) throw new ContractError('EMPTY_PUBLICATION','No reviewed current release entries');
    for (const entry of intended) {
      if (!entry.publishedAt || validDate(entry.publishedAt) > validDate(release.releaseAt)) throw new ContractError('FUTURE_PUBLICATION',entry.id);
      if (reviewState(corpus,entry.id) !== 'accepted') throw new ContractError('REVIEW_REQUIRED',`${entry.id}: ${reviewState(corpus,entry.id)}; required ${reviewFingerprint(corpus,entry.id)}`);
      if (entry.publicationState !== 'withdrawn') for (const id of dependencyClosure(corpus,entry.id)) {
        if (corpus.entries.get(id)?.publicationState !== 'published' || !intended.some(e=>e.id===id)) throw new ContractError('UNPUBLISHABLE_DEPENDENCY',`${entry.id} → ${id}`);
      }
      if (!entry.rightsRef || !release.rights?.some(r=>r.id===entry.rightsRef && r.outcome==='approved' && r.entryIds.includes(entry.id) && r.evidenceRef)) throw new ContractError('RIGHTS_PROVENANCE_REQUIRED',entry.id);
    }
    if (new URL(config.origin).hostname.endsWith('.invalid') || !config.repository) throw new ContractError('PUBLIC_TARGET_REQUIRED','Real target required');
    if (!config.publicAuthorization) throw new ContractError('PUBLIC_AUTHORIZATION_REQUIRED','No publication authorization');
  }
  const entries = intended.map(e => e.publicationState === 'withdrawn' ? { ...e, statement: null, body: e.withdrawalReason ?? '', plainLanguage: '' } : e);
  const discovery = entries.filter(e=>mode !== 'release' || e.publicationState === 'published');
  const directReferences=entries.filter(e=>e.publicationState!=='withdrawn').flatMap(e=>e.bibRefs);
  const referenceIds = [...new Set(directReferences.concat(directReferences.flatMap(id=>corpus.references.get(id)?.primaryId ?? [])))].sort();
  const manifest = { schema:'unity-publication/1', mode, deployEligible:false, releaseId:release.releaseId, releaseAt:release.releaseAt, inventorySeal:corpus.admission.inventorySeal,
    entries:entries.map(e=>({ id:e.id,route:e.route,publicationState:e.publicationState,digest:sha256(stableJSON(e)),reviewState:reviewState(corpus,e.id),fingerprint:reviewFingerprint(corpus,e.id) })),
    routes:entries.map(e=>e.route).concat(['/references/','/404.html'],mode==='release'?[]:['/fixtures/math/']),
    navigationIds:discovery.map(e=>e.id), searchIds:discovery.map(e=>e.id), sitemapIds:discovery.map(e=>e.id), feedIds:discovery.filter(e=>e.kind==='article').map(e=>e.id), exportIds:[] as string[], referenceIds };
  return { entries, references:referenceIds.map(id=>corpus.references.get(id)!), manifest, manifestSha256:sha256(stableJSON(manifest)) };
}
export function publicationFor(mode: BuildMode, config: SiteConfig) {
  const corpus = loadCanonicalCorpus();
  const release = JSON.parse(readFileSync('research/publication/release.json','utf8')) as ReleaseSelection;
  return { corpus, ...selectPublication(corpus,config,release,mode) };
}
export function activePublication() {return publicationFor(buildModeForSelection(),loadSiteConfigForSelection());}
import { activeConfig as loadSiteConfigForSelection, activeMode as buildModeForSelection } from './site-config.js';
export function publicationEntry(id: string): { corpus: Corpus; entry: Entry } { const selected = activePublication(); const entry = selected.entries.find(e=>e.id===id); if (!entry) throw new ContractError('ENTRY_NOT_SELECTED',id); return { corpus:selected.corpus,entry }; }
