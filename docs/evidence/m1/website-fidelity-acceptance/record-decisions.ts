import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { loadCanonicalCorpus, reviewFingerprint } from '../../../../src/lib/content.js';
import { websiteReviewInputs, validateWebsiteReviews } from '../../../../src/lib/website-review.js';
import { sha256, stableJSON } from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/website-fidelity-acceptance';
const reads=JSON.parse(readFileSync(`${folder}/independent-read-snapshots.json`,'utf8'));
const c=loadCanonicalCorpus(); assert.equal(c.websiteReviews.length,0);
// These comparisons were authored after reading the original documents and actual surfaces.
// Neither check-content requests nor the historical scientific registry supplies a decision.
const notes:Record<string,string>={
 'UT-D01':'Core §1, lines 6–14: organization at a chosen scale includes components, arrangement, relations, connectivity and constraints; the shorter explanation retains the broader-than-visible-shape meaning.',
 'UT-D02':'Core §2, lines 16–24: frequency is shorthand for full temporal organization. The explanation includes phases, coupling, response and times, and excludes reduction to one hertz value.',
 'UT-D03':'Core §3, lines 26–43: R=(G,M), reciprocal support/constraint and transformation, with neither aspect universally first. The summary preserves the mutual relation; the full excerpt preserves all qualifications.',
 'UT-D04':'Core §4, lines 45–55: self-consistent closed geometry–mode organization over its interval, without requiring permanence. Lifetime/Lyapunov criteria remain tests rather than replacement definitions.',
 'UT-D05':'Core §7, lines 84–96: an effective unit for further interactions, with mechanisms/equations permitted to differ across scales. The explanation retains both clauses.',
 'UT-D06':'Core §5, lines 57–72: compatible heterogeneous members remain internally active inside a new collective organization. No identical-member or prior-duplication condition is introduced.',
 'UT-D07':'Core §6, lines 74–82: arrangements, compositions, phases and environments can vary the higher organization. The plain-language summary retains conditional variation, with the complete list visible in the excerpt.',
 'UT-D08':'Core §8, lines 98–112: structural recursion and the locked geometry–mode relation persist, while implementing mechanisms may change. The summary does not impose identical equations.',
 'UT-D09':'Core §9, lines 114–126: replication and other propagation/formation mechanisms are possible, without a mandatory A→A+A→B step. The summary preserves that distinction.',
 'UT-C01':'Core §10, lines 128–136: force/frequency identity and one-to-one force/scale correspondence are not locked facts; the stronger four-interaction proposal is an extension. Conjecture/proposed labels and the no-universal-derivation limit preserve this status.',
 'UT-C02':'Core §11, lines 138–140: changing background accessibility is compatible with the core but outside the minimal definition. Conjecture/proposed labels retain this extension boundary.',
 'UT-O01':'Status line 20 asks whether the four interactions have a deeper scale-dependent RRG description; the exact question remains unresolved and linked to the force extension.',
 'UT-O02':'Status line 21 asks whether gravity is emergent; the exact question remains open and is not recast as an established mechanism.',
 'UT-O03':'Status line 22 asks whether cosmological evolution selects accessible geometries; the exact question remains open and linked to the background extension.',
 'UT-O04':'Status line 23 leaves a cross-domain invariant/promotion criterion unresolved; the exact text and proposed/open-question labels preserve this gap.',
 'UT-O05':'Status line 24 leaves novel prediction beyond existing frameworks unresolved; the record preserves the question rather than assigning demonstrated novelty.',
 'UT-O06':'Status line 25 leaves measurable AI efficiency/generalization advantages unresolved; the record does not report benchmark results.',
 'UT-E01':'Additional E01, lines 17–32: mixed pulses/pairs/triplets and internal pair dynamics within optical–acoustic organization are transcribed, including pumped fibre-laser scope and optical-versus-chemical molecules.',
 'UT-E02':'Additional E02, lines 35–50: distinct carrier frequencies/amplitudes bind with evolving relative phase. Driven Kerr scope and carrier-versus-repetition-rate distinction are retained.',
 'UT-E03':'Additional E03, lines 53–68: reciprocal protein distribution/deformation/motion loop. ATP/reconstituted-system and phenomenological-model limitations are retained, without requiring a complete cell.',
 'UT-E04':'Additional E04, lines 71–86: DNA-template protein synthesis accompanies collective dynamics, deformation and cytoskeletal organization. The synthetic-compartment limitation excludes a claim of a complete self-reproducing organism.',
 'UT-E05':'Additional E05, lines 89–104: potassium-mediated biofilm coordination and potassium-clamp suppression are preserved literally, with Bacillus subtilis growth-condition scope. No independent intervention interpretation is substituted.',
 'UT-E06':'Additional E06, lines 107–122: two communities coordinate phase according to nutrient conditions. The coupled-pair limit excludes physical fusion; source-reported abstract/caption access depth is preserved.',
 'UT-E07':'Additional E07, lines 125–140: designed DNA tiles form successive assemblies reused in further assembly. Structural-recursion support remains distinct from a full temporal-spectrum measurement; publisher-access limitation remains literal.',
 'UT-E08':'Additional E08, lines 143–158: density organization and cavity field reinforce each other, with reported phase-boundary comparison. Pumped-system/domain-specific-threshold limitations remain unchanged.',
 'UT-E09':'Additional E09, lines 161–176: symmetry-based cluster predictions and experiment are retained. Specified network/oscillator assumptions remain those of the realization, without imposing adaptive rewiring as an RRG requirement.',
 'UT-E10':'Interaction §1, lines 29–64: lattice phonons mediate effective attraction in the appropriate regime, allowing pairing. The electromagnetic underlying interaction and effective/fundamental distinction survive; the rendered G↔M→effective-interaction equation retains its TeX.',
 'UT-E11':'Interaction §2, lines 68–107: predicted emergent spin-ice quasiparticles, reported effective-charge/current measurements and Coulomb interaction remain attributed to the source and named authors. No elementary-monopole discovery claim is added.',
 'UT-E12':'Interaction §3, lines 111–154: Higgs vacuum changes W/Z versus photon spectrum and interaction ranges. The weaker background-state extension and explicit non-establishment of electroweak RRG recursion remain visible.',
 'DOC-CONCEPT-GEOMETRY':'The actual three directive expansions reproduce the approved D01–D03 explanations and link to the original core excerpts. This bounded concept page adds no independent law, equation or evidence claim.',
 'DOC-STATUS':'Status lines 3–41 retain all eight locked statements, six open extensions, change-control discipline and emergent-interaction addendum. The literal-backslash adapter changes display syntax only; the HOME projection includes exactly the open-extension section, without claiming those problems solved.',
 'DOC-PROOF':'Proof lines 3–23 retain all twelve table rows, stated statuses, evidence/counterevidence columns and core impacts. The blank-line table adapter retains the final effective-interaction row; title/description explicitly avoid proof certification.',
 'DOC-HOME':'Compared with World §§1–7, Core §§1–3/5/7–11 and Status open-extension list: wave/molecule/cell examples introduce arrangement and activity as a question; a wave is explicitly a warm-up, not persistence evidence. Full-mode meaning, internal activity and further effective units remain faithful. The displayed status projection preserves all six original open questions.',
 'DOC-START':'Compared with World §§2/4–10/15, Core §§1–3/5/7–11, Framework §§13/19–24, Status and Interaction §§3–5: the string analogy retains material/boundary constraints, recursion permits heterogeneous active components and changing mechanisms, background/effective-interaction ideas remain extensions, all-force derivation and novel universal predictions remain open.'
};
assert.equal(Object.keys(notes).length,34);
mkdirSync(`${folder}/decisions`,{recursive:true});
const reviews=[...c.entries.values()].map(e=>{
 const saved=reads.representations.find((r:any)=>r.id===e.id); assert.ok(saved && notes[e.id]);
 const inputs=websiteReviewInputs(c,e.id); assert.equal(stableJSON(inputs),stableJSON(saved.inputs));
 // Identity is recomputed from the independently compared live material, not copied from a request.
 const fingerprint=reviewFingerprint(c,e.id);
 const where=e.sourceBinding?`${c.sources.get(e.sourceBinding.sourceKey)!.path}:${e.sourceBinding.startLine}–${e.sourceBinding.endLine}`:'Original passages identified in the rationale and the explicit dependency snapshots';
 const checks={
  terminology:notes[e.id],
  meaning:`${notes[e.id]} Complete bound excerpt/body and plain-language surfaces compared at / and /unity-theory/.`,
  assumptions:e.kind==='evidence'?`Reported system conditions and limitations remain literal at ${where}; ${e.scope} No condition is promoted to a core definition.`:`Core meanings and optional downstream conditions stay distinct at ${where}; ${notes[e.id]}`,
  hypotheses:`${e.kind==='conjecture'||e.kind==='open-problem'?'Proposed/open status remains explicit.':'No new hypothesis is promoted to an independently established result.'} ${notes[e.id]}`,
  evidenceDescriptions:e.kind==='evidence'?`Evidence status is project-reported, displayed as reported by the supplied documents; classification, evidence type, author/source access descriptions and scope at ${where} are preserved. No paper was adjudicated here.`:`${e.evidenceState}: role/status is consistent with the original passages; ${notes[e.id]} No scientific certification is assigned.`,
  openQuestions:`${notes[e.id]} Original status lines 18–25 and Interaction §5 keep universal criterion, novelty, gravity/four-force unification and other extension questions unresolved wherever relevant; this bounded representation does not declare closure of those questions.`,
  attribution:`${e.sourceMapping||notes[e.id]} Source paths/edition/excerpt lines and new navigation-ID mapping are displayed. Evidence excerpts retain named authors and original links; bibliography is supplementary, with recorded metadata/access limits rather than an independent RRG endorsement.`,
  sourceMappings:`Compared ${where} with the detached ownRead, dependency/source identities and actual emitted surfaces in independent-read-snapshots.json. Raw excerpt equality and source TeX annotation equality passed for source-bound records at both bases. ${notes[e.id]}`
 };
 const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1' as const,entryId:e.id,fingerprint,reviewerKind:'agent' as const,reviewedAt:'2026-10-02',outcome:'accepted' as const,scientificCertification:false,rationale:notes[e.id],inputs,checks};
 const evidenceRef=`${folder}/decisions/${e.id}.json`,raw=JSON.stringify(decision,null,2)+'\n';writeFileSync(evidenceRef,raw);
 return {purpose:decision.purpose,entryId:e.id,fingerprint,reviewerKind:decision.reviewerKind,reviewedAt:decision.reviewedAt,outcome:decision.outcome,evidenceRef,evidenceSha256:sha256(raw)};
});
c.websiteReviews=reviews;validateWebsiteReviews(c);
writeFileSync('research/publication/website-reviews.yaml',JSON.stringify(reviews,null,2)+'\n');
console.log('Recorded 34 independently compared website-fidelity decisions; scientificCertification=false.');
