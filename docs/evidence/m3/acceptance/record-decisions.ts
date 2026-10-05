import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { loadCanonicalCorpus } from '../../../../src/lib/content.js';
import { websiteReviewInputs, validateWebsiteReviews, websiteReviewState } from '../../../../src/lib/website-review.js';
import { sha256 } from '../../../../src/lib/identity.js';

// These notes record the separate review's actual original/sidecar/output
// comparisons. This script serializes decisions; it does not perform a review.
const notes:Record<string,string>={
  'DOC-CORE':'Full 00 body preserves relational geometry, full temporal modes, interval closure, heterogeneous internally active constituents, optional replication and scale-dependent mechanisms. §§10–11 retain force/background extensions; §13 points to change control.',
  'DOC-CONTROL':'Full 05 protocol retains six research classifications, the complete contradiction proof gate and subordinate candidate mathematics. The added changelog link identifies supplied adopted positions rather than importing historical proposals.',
  'DOC-FRAMEWORK':'Full 02 body retains all propositions, attributed Established/Compatible/RRG hypothesis/Open labels, physical conditions, thermodynamic constraints and failure criteria. Both retained addenda and the literal-backslash interaction addition remain in order; four-force unification and a universal derivation remain open.',
  'DOC-MATH':'Full 03 body retains toy-model assumptions, diagnostic thresholds, scale-dependent effective dynamics, optional same-family experiments and §§25–40 addenda. Original §39 force formula and all surrounding prose survive the disclosed missing-display-close repair; four distinct displays render. §40 is a proposed calculation, not a result.',
  'DOC-STATUS':'Full 04 body retains locked definitions and all six open extensions. The literal-backslash evidence update renders as prose and math, with effective channels separate from fundamental-force derivation. Added links lead to actual 06/07/08 and proposed §40 work.',
  'DOC-PROOF':'All twelve 06 rows retain their status, evidence target, contrary result and core impact. Joining the blank-separated final row changes table layout only. Optional same-family and four-force/gravity/background/AI extensions remain distinct from definitions and website certification.',
  'DOC-INTERACTION-EVIDENCE':'Full 07 body retains phonon attraction, emergent spin-ice excitations and background-dependent electroweak regimes with different conditions and cited authors. Its final section explicitly leaves fundamental-force unification and scalar-frequency reduction unproved.',
  'DOC-ADDITIONAL-EVIDENCE':'Full 08 body retains E01–E09, classifications, clauses, Scope/Checked/Location/Inspected source, mapping table and cited-author ownership. E06 manuscript unavailability and E07 subscription restriction remain visible. No new paper inspections or numerical reproduction are claimed.',
  'DOC-OPEN-PROBLEMS':'04 lines 18–26 supply the six questions, mapped to UT-O01–06. Added links accurately distinguish 02 extension failures, 03 model failures/metrics and proposed §40 work. The 07 effective-channel question is narrower than universal force unification.',
  'DOC-SOURCE-CHANGES':'Full supplied CHANGELOG body preserves adopted drift repairs and literal-backslash evidence-only update. No locked-core change or website-imported historical correction is implied.',
  'DOC-EVIDENCE':'Authored index compared with all 06/07/08 entries: E01–09 map to UT-E01–09, three 07 cases map to UT-E10–12, all scopes and mechanisms agree. Reported Checked is attributed to register authors; successful website rendering supplies no experiment or universal derivation.',
  'DOC-LIBRARY':'Authored index correctly identifies 00 as definition authority, 05 as change-control authority, current 02/03 implementations and supplied changelog. Current retained addenda remain accessible; separate historical cavity/response work is not selected and no numerical result is claimed.',
  'UT-D01':'00 §1 relational organization includes components, connectivity, boundaries and constraints, beyond visible shape.',
  'UT-D02':'00 §2 full temporal organization includes phases, amplitudes, coupling, response and timescales; no unique scalar-frequency geometry rule.',
  'UT-D03':'00 §3 R=(G,M) and reciprocal constraint/activity remain together; neither is universally first.',
  'UT-D04':'00 §4 self-consistent closure during an interval remains the definition; lifetime and perturbation tests do not redefine it.',
  'UT-D05':'00 §7 effective units allow different characteristic scales, interactions and equations.',
  'UT-D06':'00 §5 compatible heterogeneous constituents remain internally active; identical components or prior duplication are not required.',
  'UT-D07':'00 §6 counts, arrangements, compositions, phases and environments allow different higher organizations.',
  'UT-D08':'00 §8 recursion is structural; implementing mechanisms may change with scale.',
  'UT-D09':'00 §9 replication and recurrence are possible formation/propagation mechanisms rather than mandatory recursive steps.',
  'UT-C01':'00 §10 explicitly leaves one-to-one forces/scales and universal fundamental-interaction derivation unproved.',
  'UT-C02':'00 §11 background/possibility-space selection remains compatible downstream extension rather than minimal definition.',
  'UT-O01':'04 item 1 leaves fundamental-interaction derivation open, consistent with 06 force-extension row.',
  'UT-O02':'04 item 2 leaves emergent gravity open, consistent with 06 gravity row.',
  'UT-O03':'04 item 3 leaves background selection open, consistent with 06 background row.',
  'UT-O04':'04 item 4 leaves a cross-domain invariant/promotion criterion open, consistent with 06 invariant row.',
  'UT-O05':'04 item 5 asks for a novel prediction beyond existing frameworks; no website result supplies one.',
  'UT-O06':'04 item 6 leaves AI efficiency/generalization advantage open, consistent with 06 equal-resource benchmark target.',
  'UT-E01':'08 E01 preserves pumped fibre-laser optical pulses, mixed assemblies/internal dynamics, clauses 3/5/6/7/8 and reported paper/supplement/Figure 3 inspection. Optical molecules are not chemical molecules.',
  'UT-E02':'08 E02 preserves driven Kerr microresonator, distinct carriers/amplitudes and evolving relative phase, clauses 3/5/6; carrier frequency remains distinct from repetition rate.',
  'UT-E03':'08 E03 preserves ATP-driven reconstituted lipid/protein feedback, clauses 3/4/5 and phenomenological movement-model limitation.',
  'UT-E04':'08 E04 preserves synthetic-compartment Min/FtsA–FtsZ dynamics/deformation, clauses 3/5/6; no complete self-reproducing organism is claimed.',
  'UT-E05':'08 E05 preserves reported Bacillus subtilis conditions, potassium-clamp intervention and clauses 3/5/7.',
  'UT-E06':'08 E06 preserves coupled biofilm nutrient-dependent phase relationships and clauses 5/7/8. It is not physical fusion; abstract/captions were reported inspected and full manuscript inaccessible.',
  'UT-E07':'08 E07 preserves designed staged DNA-origami assembly and clauses 5/6/7/8/9. Structural recursion is distinct from full temporal-spectrum measurement; subscription full text was not inspected.',
  'UT-E08':'08 E08 preserves pumped atom–cavity experiment, specified mean-field threshold comparison and clauses 3/4/5/6; no universal threshold is inferred.',
  'UT-E09':'08 E09 preserves symmetry-based specified oscillator/network derivation and experiment, clauses 3/5/7 and reported manuscript-title difference; assumptions do not become core requirements.',
  'UT-E10':'07 §1 preserves phonon-mediated effective attraction in the appropriate conventional-superconductivity regime; electromagnetism is not replaced. Zheng/Walmsley DOI maps to BIB-0016.',
  'UT-E11':'07 §2 preserves emergent spin-ice quasiparticles and Coulomb-like interactions, distinct from elementary monopoles. Castelnovo/Bramwell/Mengotti identities map to BIB-0017–19.',
  'UT-E12':'07 §3 preserves Higgs-background spectrum and interaction-range changes; electroweak physics is not derived from RRG. Two supplied CERN URLs map to BIB-0020–21.'
};
const folder='docs/evidence/m3/acceptance',final=process.argv.includes('--final');
const decisionFolder=final?'decisions-final':'decisions';
mkdirSync(`${folder}/${decisionFolder}`,{recursive:true});
const corpus=loadCanonicalCorpus();
assert.equal(Object.keys(notes).length,41);
const snapshot=final?'pre-repair-registry.json':'pre-review-registry.json';
const old=JSON.parse(readFileSync(`${folder}/${snapshot}`,'utf8'));
assert.equal(sha256(readFileSync('research/publication/website-reviews.yaml')),sha256(readFileSync(`${folder}/${snapshot}`)),'Registry changed during review');
const issued=[];
for(const [id,note] of Object.entries(notes)) {
  const inputs=websiteReviewInputs(corpus,id),entry=inputs.ownRead;
  const mappings=entry.sourceBinding?`${entry.sourceBinding.sourceKey} lines ${entry.sourceBinding.startLine}–${entry.sourceBinding.endLine}; full original and excerpt hashes checked by shared loader.`:'Authored navigation/context compared with its original source documents and selected dependency routes.';
  const checks={
    terminology:`Compared original source wording, sidecar and both rendered bodies: ${note}`,
    meaning:`${note} Both saved canonical bodies and record details match the live renderer; technical guides match actual source context and heading anchors (evidence-reuse.json).`,
    assumptions:`Original conditions and model-specific limitations remain in the source body and applicable context. ${entry.limits || 'No additional website assumption is imposed.'} Definitions and optional stronger implementations remain distinct.`,
    hypotheses:`${note} Proposed/open extensions retain their source-reported classification; no experiment, universal law or scientific truth is certified.`,
    evidenceDescriptions:`Displayed evidence state is ${entry.evidenceState}. Reported source assertions remain attributed, not website-reproduced. 08 E06/E07 access restrictions remain in original excerpts and context where applicable. Historical cavity/response work NOT_SELECTED / NOT_RUN.`,
    openQuestions:`${note} The original 04 six-question register, 06 failure/core-impact columns, 07 open boundary and 02/03 test programme remain separate from locked definitions.`,
    attribution:`Compared source authors/URLs and bibliography links in original extracts and rendered details. ${entry.bibRefs.length?`Resolved bibliography identities: ${entry.bibRefs.join(', ')}.`:'No independent paper result is assigned to this website.'} Supplied Checked/Location/Inspected source statements describe source authors' reported access.`,
    sourceMappings:`${mappings} ${entry.sourceMapping} Dependencies and source-local citation aliases validated by shared loader; original S01 identities are source-namespaced. Both base-path bodies compared with actual saved output.`
  };
  const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1',entryId:id,fingerprint:inputs.fingerprint,reviewerKind:'agent',reviewedAt:'2026-10-04',outcome:'accepted',scientificCertification:false,rationale:`Separate bounded High M3 original/sidecar/renderer/output comparison: ${note} ${final?'Same-session matching-renderer CSS repair: canonical source/body/callouts unchanged; force-box width repaired from 2px to 122.64px and actual §39 desktop/mobile output compared. Prior issued decisions remain preserved. ':''}Website fidelity only; private draft and scientific/release gates remain distinct.`,inputs,checks};
  const evidenceRef=`${folder}/${decisionFolder}/${id}.json`,raw=JSON.stringify(decision,null,2)+'\n';
  writeFileSync(evidenceRef,raw,{flag:'wx'});
  issued.push({purpose:decision.purpose,entryId:id,fingerprint:decision.fingerprint,reviewerKind:decision.reviewerKind,reviewedAt:decision.reviewedAt,outcome:decision.outcome,evidenceRef,evidenceSha256:sha256(raw)});
}
corpus.websiteReviews=[...old.filter((r:any)=>!notes[r.entryId]),...issued];
validateWebsiteReviews(corpus);
writeFileSync('research/publication/website-reviews.yaml',JSON.stringify(corpus.websiteReviews,null,2)+'\n');
const validated=loadCanonicalCorpus();
const result={issued:issued.length,unreviewedPreserved:old.filter((r:any)=>!notes[r.entryId]).map((r:any)=>r.entryId),reviewStates:Object.fromEntries(['accepted','stale','pending','rejected'].map(state=>[state,[...validated.entries.keys()].filter(id=>websiteReviewState(validated,id)===state).length])),currentSourceQualified:validated.admission.currentSourceQualified};
writeFileSync(`${folder}/${final?'decision-summary-final':'decision-summary'}.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
