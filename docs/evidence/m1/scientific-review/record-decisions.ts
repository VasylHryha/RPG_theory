// One-time recording of the explicit reviewer decisions in source-readout.md.
// This does not read any required-fingerprint request report or approve by type.
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadCanonicalCorpus, dependencyClosure, reviewFingerprint, reviewState, semanticDigest, renderEntrySync } from '../../../../src/lib/content.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';

const folder='docs/evidence/m1/scientific-review';
const accepted: Record<string,string>={
 'UT-D01':'Chosen-scale organization and its explanation preserve relations, boundaries and constraints beyond visible shape; terminology only.',
 'UT-D02':'Full mode structure and explanation preserve phase, amplitude, coupling, response and timescales; a single hertz value is not a unique geometry.',
 'UT-D03':'Pair and reciprocal relation preserve neither-side-universally-first; source structural interpretation, not a cross-domain theorem.',
 'UT-D04':'Chosen closure definition and explanation distinguish permanence and system-specific stability tests; no Lyapunov equivalence.',
 'UT-D05':'Effective-unit scale and explanation preserve differing mechanisms/equations; no universal size or timescale rule.',
 'UT-D06':'Conditional higher-level formation and explanation preserve heterogeneous compatible members and retained internal activity; no prior-duplication requirement.',
 'UT-D07':'Variation and explanation preserve differing organization and conditions without adding a physical selection law.',
 'UT-D08':'Structural recursion and explanation preserve changing mechanisms; not universal empirical validation.',
 'UT-D09':'Replication and explanation preserve an optional mechanism rather than a mandatory step at every level.',
 'UT-C01':'Force-identification extension is explicitly unproved; proposed state and no-unification limit are faithful, not approval of its truth.',
 'UT-C02':'Background accessibility is a compatible open extension outside minimal definitions; proposed status is faithful, not approval of its truth.',
 'UT-O01':'Four-force identification is faithfully an unresolved question; restricted mechanisms do not settle it.',
 'UT-O02':'Emergent gravity is faithfully an unresolved question; no derivation or experimental validation supplied.',
 'UT-O03':'Background selection is faithfully an unresolved RRG question; a known model does not yield a general criterion.',
 'UT-O04':'Common invariant/promotion criterion is faithfully unresolved; none silently supplied by the derivative.',
 'UT-O05':'Novel predictive power is faithfully unresolved; taxonomy/interpretation is not a discriminating prediction.',
 'UT-O06':'AI advantage is faithfully an untested question; no benchmark or superiority supplied.'
};
const pending: Record<string,string>={
 'DOC-HOME':'Aggregate derivative/status explanation remains pending full exact-content qualification; no authorial/publication approval.',
 'DOC-START':'Aggregate narrative crosses evidence and extension findings; restricted definition reviews do not qualify it.',
 'DOC-CONCEPT-GEOMETRY':'Complete concept consumer remains pending exact review; related definitions alone are insufficient.',
 'DOC-STATUS':'Open-question excerpts accepted separately; broad scientific-support summary still pending.',
 'DOC-PROOF':'Source matrix is classification/mapping, not automatic scientific certification; restricted support findings remain.',
 'UT-E01':'Partial 47-page paper/supplement read supports restricted mechanism, not the complete bound inspection/support assertions.',
 'UT-E02':'Selected manuscript/final-paper result supported; full bound inspection/supplement/version qualification incomplete.',
 'UT-E03':'Specified feedback supported; phenomenological motion and selected methods/supplement limits remain.',
 'UT-E04':'Separate liposome and supported-bilayer assays need exact scope; no complete supplemental/data audit.',
 'UT-E05':'Indexed primary extracts/captions only; complete paper/data support and supplied inspection declarations not qualified.',
 'UT-E06':'Author main manuscript read supports conditional coupling; supplements/data and all excerpt assertions not qualified.',
 'UT-E07':'Abstract only; main paper unavailable and temporal-spectrum inference unsupported by that read.',
 'UT-E08':'Selected v1/v3 model passages read; whole final-version/methods/supplement qualification incomplete.',
 'UT-E09':'Specified fixed-graph synchronization supported; not adaptive graph feedback or complete final-paper equivalence.',
 'UT-E10':'Cited paper abstract only; exact complete pairing/mechanism assertions not independently qualified.',
 'UT-E11':'Specified effective model supported; measurement interpretation disputed and experimental papers abstract-only.',
 'UT-E12':'Institutional explainers and primary model do not qualify complete electroweak cooling history or all recursion interpretation.'
};
const corpus=loadCanonicalCorpus();
assert.equal(corpus.reviews.length,0,'Refuse to overwrite an existing review registry');
assert.equal(Object.keys(accepted).length,17);
assert.equal(Object.keys(pending).length,17);
assert.deepEqual([...Object.keys(accepted),...Object.keys(pending)].sort(),[...corpus.entries.keys()].sort());
const decisions=[...corpus.entries.values()].map(entry=>{
 const outcome=Object.hasOwn(accepted,entry.id)?'accepted':'pending';
 const dependencies=dependencyClosure(corpus,entry.id);
 return {
  entryId:entry.id,outcome,reviewerKind:'agent',reviewedAt:'2026-10-01',
  rationale:accepted[entry.id] ?? pending[entry.id],
  acceptedScope:outcome==='accepted'?'Exact definition/open-status representation only; no universality, scientific truth of extensions, authorial or public rights approval.':null,
  ownRead:{sourceBinding:entry.sourceBinding ?? null,statement:entry.statement,plainLanguage:entry.plainLanguage,scope:entry.scope,limits:entry.limits,evidenceState:entry.evidenceState,publicationState:entry.publicationState,body:entry.body,assumptions:entry.assumptions,dependsOn:entry.dependsOn,bibRefs:entry.bibRefs},
  semanticDigest:semanticDigest(entry),dependencies:dependencies.map(id=>({id,semanticDigest:semanticDigest(corpus.entries.get(id)!)})),
  renderedBodySha256:sha256(renderEntrySync(corpus,entry)),
  independentlyComputedFingerprint:reviewFingerprint(corpus,entry.id),
  evidenceRef:`${folder}/source-readout.md`
 };
});
writeFileSync(`${folder}/review-decisions.json`,JSON.stringify({method:'Explicit independently read decisions and reasons precede fingerprint recording; no requests imported.',readoutSha256:sha256(readFileSync(`${folder}/source-readout.md`)),accessLedgerSha256:sha256(readFileSync(`${folder}/access-ledger.json`)),rendererSha256:corpus.rendererSha256,decisions},null,2)+'\n');
const reviews=decisions.filter(d=>d.outcome==='accepted').map(d=>({entryId:d.entryId,fingerprint:d.independentlyComputedFingerprint,reviewerKind:'agent',reviewedAt:d.reviewedAt,outcome:'accepted',evidenceRef:`${folder}/review-decisions.json#${d.entryId}`}));
writeFileSync('research/publication/reviews.yaml',JSON.stringify(reviews,null,2)+'\n');
const reloaded=loadCanonicalCorpus();
for(const decision of decisions) assert.equal(reviewState(reloaded,decision.entryId),decision.outcome);
assert.equal(reloaded.admission.currentSourceQualified,false);
assert.equal(stableJSON(corpus.entries.get('UT-E12')!.dependsOn),stableJSON(['UT-C01','UT-C02','UT-D03']));
console.log('Recorded 17 explicit representation acceptances; 17 exact reviews pending; source qualification false.');
