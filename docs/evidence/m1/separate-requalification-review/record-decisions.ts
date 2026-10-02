import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {loadCanonicalCorpus,reviewFingerprint} from '../../../../src/lib/content.js';
import {websiteReviewInputs,validateWebsiteReviews,qualifyWebsiteCorpus} from '../../../../src/lib/website-review.js';
import {sha256,stableJSON} from '../../../../src/lib/identity.js';
const folder='docs/evidence/m1/separate-requalification-review';
const c=loadCanonicalCorpus();
const reads=JSON.parse(readFileSync(`${folder}/independent-read-snapshots.json`,'utf8'));
assert.equal(c.entries.size,34);assert.equal(c.websiteReviews.length,34);assert.equal(c.admission.currentSourceQualified,false);
// Authored after independent inspection of original downloaded passages, loaded
// representations, both emitted surfaces, prior policy changes and evidence seals.
// The prior request report and historical scientific approvals do not supply decisions.
const notes:Record<string,string>={
 'UT-D01':'Core §1 (6–14): geometry includes components, arrangement, relations, connectivity, order, orientation, boundaries and constraints at a chosen scale. The plain-language subset is faithful beside the full excerpt; it does not reduce geometry to visible shape.',
 'UT-D02':'Core §2 (16–24): full temporal organization includes frequency, phase, amplitude, propagation, coupling, times and response. The displayed summary preserves breadth beyond one hertz value, and the full list and scalar-frequency limitation remain visible.',
 'UT-D03':'Core §3 (26–43): R=(G,M) and G↔M retain mutual support/constraint, maintenance, transformation and destruction. Neither aspect becomes universally first in the excerpt or explanation.',
 'UT-D04':'Core §4 (45–55): self-consistent closure defines stability during its interval. The explanation preserves non-permanence; lifetime, perturbation recovery, Lyapunov stability, decay and metastability remain system tests rather than new definitions.',
 'UT-D05':'Core §7 (84–96): a collective organization can act as an effective unit in further interactions. The summary and full excerpt preserve different sizes, times, interactions and mechanisms across scales without requiring identical equations.',
 'UT-D06':'Core §5 (57–72): compatible lower systems may form a collective organization. Their heterogeneous roles/internal modes persist, and prior duplication is optional. The summary introduces no identical-component requirement.',
 'UT-D07':'Core §6 (74–82): different organization and conditions can produce different higher geometries from related building blocks. The complete counts/arrangements/compositions/orientations/connections/phases/environment list remains beside the shorter explanation.',
 'UT-D08':'Core §8 (98–112): recursion is structural formation of successive effective organizations. The summary preserves changing mechanisms and the full excerpt retains the geometry–mode relation at every level.',
 'UT-D09':'Core §9 (114–126): replication, recurrence and other propagation/formation mechanisms are possible rather than mandatory. The summary and explicit A→A+A→B non-requirement preserve the distinction from biological replication.',
 'UT-C01':'Core §10 (128–136): one-to-one force/frequency/scale identity is not locked as fact. Four-interaction unification remains an extension to prove. Conjecture/proposed labels and the missing-universal-derivation limit accurately separate this from definitions.',
 'UT-C02':'Core §11 (138–140): background/possibility-space selection is compatible with the core but outside its minimal definition. Conjecture/proposed labels preserve its extension status; no cosmological mechanism is established by this page.',
 'UT-O01':'Status line 20: the four-interaction/deeper-geometry question remains literal and unresolved. The displayed open-question/proposed status and force-extension dependency do not imply unification.',
 'UT-O02':'Status line 21: emergent gravity remains a literal question with proposed/open labels. No mechanism or derivation is invented.',
 'UT-O03':'Status line 22: cosmological selection of accessible geometries remains an open question, linked to the background extension rather than promoted to the locked core.',
 'UT-O04':'Status line 23: existence of a cross-domain invariant or promotion criterion is unresolved. The full question and open/proposed labels retain both alternatives.',
 'UT-O05':'Status line 24: novelty beyond existing frameworks is unresolved. The record does not invent a prediction or a successful novelty test.',
 'UT-O06':'Status line 25: AI efficiency/generalization improvement remains an open research question, with no benchmark result attributed to the website.',
 'UT-E01':'Additional E01 (17–32): mixed pulse/pair/triplet assemblies and internal pair dynamics within optical–acoustic organization are exact. Experiment/modelling, pumped fibre-laser scope and the optical-versus-chemical distinction survive; §3/5/6/7/8 dependencies match the source.',
 'UT-E02':'Additional E02 (35–50): distinct carrier frequencies/amplitudes and evolving relative phase are exact. Driven Kerr conditions and carrier-versus-repetition distinction survive; §3/5/6 dependencies match the source.',
 'UT-E03':'Additional E03 (53–68): reciprocal vesicle/protein deformation and movement loop is exact. ATP/reconstituted conditions and phenomenological simulation coupling remain limitations of the realization; §3/4/5 mappings add no core requirement.',
 'UT-E04':'Additional E04 (71–86): DNA-templated Min synthesis, collective dynamics, liposome deformation and FtsA–FtsZ organization remain source-reported. The synthetic-compartment limit explicitly excludes a complete self-reproducing organism; §3/5/6 mappings are faithful.',
 'UT-E05':'Additional E05 (89–104): potassium-mediated coordination and potassium-clamp suppression of measured membrane-potential oscillations are preserved literally. Bacillus subtilis growth conditions, interventions and source-reported access/location statements remain attributed, without importing the historical scientific review.',
 'UT-E06':'Additional E06 (107–122): nutrient-dependent in-phase/antiphase coordination in a community pair remains exact, including the no-physical-fusion limit. Abstract/caption-only source access is retained; §5/7/8 mappings do not claim a new organism.',
 'UT-E07':'Additional E07 (125–140): designed DNA tiles undergo successive assembly, with prior arrays reused. Structural recursion remains distinct from full temporal-spectrum measurement. Publisher-description/subscription-access limits and §5/6/7/8/9 mappings survive.',
 'UT-E08':'Additional E08 (143–158): density organization/cavity field reciprocity and mean-field phase-boundary comparison are source-reported. Pumped atom–cavity conditions and domain-specific threshold remain bounded; §3/4/5/6 mappings do not establish a universal equation.',
 'UT-E09':'Additional E09 (161–176): symmetry-based cluster/dynamical predictions and experiment are exact. Specified network/oscillator assumptions and manuscript-title distinction remain visible; adaptive rewiring is not introduced as a core requirement.',
 'UT-E10':'Interaction §1 (29–64): phonon-mediated effective attraction enabling pairing remains in its appropriate regime. Underlying electromagnetism and the effective/fundamental distinction survive. Zheng/Walmsley attribution and all source TeX annotations match.',
 'UT-E11':'Interaction §2 (68–107): emergent spin-ice quasiparticles, reported effective-charge/current measurements and Coulomb-like interactions remain attributed to the named sources. The page does not claim discovery of elementary magnetic charges; all source TeX annotations match.',
 'UT-E12':'Interaction §3 (111–154): Higgs-background changes to W/Z versus photon spectrum and ranges preserve the weaker background-state extension. Explicit non-establishment of electroweak RRG recursion and CERN references remain; the UT-C02 dependency matches the interpretation.',
 'DOC-STATUS':'Status body (3–41): all eight locked statements, six open extensions, change discipline and emergent-interaction addendum survive. The narrow literal-backslash adapter changes syntax without rewriting meaning. Extra E10–12 links identify scoped source records; HOME projects precisely the six open questions.',
 'DOC-PROOF':'Proof body (3–23): all twelve rows retain claim/status/evidence/counterevidence/core-impact cells, including the separated final effective-interaction row. The table adapter joins display syntax only. Website title and scope attribute reported status without certifying proof.',
 'DOC-CONCEPT-GEOMETRY':'Core §§1–3: the three actual directive expansions reproduce D01–03 plain language and link those source-bound definitions. The bounded concept adds no law or empirical result. Its own scope/dependency links are visible; it has no own source-extraction panel or displayed source edition.',
 'DOC-HOME':'World §§1–10/15, Core §§1–3/5/7–11 and Status open extensions: arrangement/activity, internally active parts and effective units are faithful. The wave is explicitly a warm-up, not persistence evidence. All six actual status questions are projected. Definition/status links provide attribution; no own extraction panel or displayed source edition is present.',
 'DOC-START':'World §§2/4–10/15, Core §§1–3/5/7–11, Framework §13/§§19–24 and Interaction §§3–5: string conditions, broad modes, mutual organization, heterogeneous active components and changing mechanisms remain faithful. Background/effective-interaction ideas stay extensions; complexity increase, universal equations and force derivation are not promised. Definition/status links provide attribution; no own extraction panel or displayed source edition is present.'
};
assert.equal(Object.keys(notes).length,34);
const authored=new Set(['DOC-HOME','DOC-START','DOC-CONCEPT-GEOMETRY']);
mkdirSync(`${folder}/decisions`,{recursive:true});
const reviews=[...c.entries.values()].map(e=>{
 const saved=reads.representations.find((r:any)=>r.id===e.id);assert.ok(saved && notes[e.id]);
 const inputs=websiteReviewInputs(c,e.id);assert.equal(stableJSON(inputs),stableJSON(saved.inputs));
 const fingerprint=reviewFingerprint(c,e.id);assert.equal(fingerprint,inputs.fingerprint);
 const where=e.sourceBinding?`${c.sources.get(e.sourceBinding.sourceKey)!.path}:${e.sourceBinding.startLine}–${e.sourceBinding.endLine}`:'the original sections specified in this rationale';
 const attribution=authored.has(e.id)?
  e.id==='DOC-CONCEPT-GEOMETRY'?'The actual authored concept expands and links D01–03, with scope and dependency links. It has no own extraction-details panel or displayed source edition.':
  `The actual authored ${e.id==='DOC-HOME'?'HOME':'START'} body links D01–03 and research status. ${e.id==='DOC-HOME'?'HOME also projects the six source open questions. ':''}It has no own extraction-details panel or displayed source edition.`:
  `The emitted source-bound page displays the source filename, edition, excerpt line range and excerpt SHA-256 in extraction details, plus its mapping and dependency links. ${e.kind==='evidence'?'Named authors, source links and source-reported checked/location/access descriptions remain literal. The literature page labels these supplementary references rather than independent RRG approval.':''}`;
 const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1' as const,entryId:e.id,fingerprint,reviewerKind:'agent' as const,reviewedAt:'2026-10-02',outcome:'accepted' as const,scientificCertification:false,
  rationale:`${notes[e.id]} This separate review read the original passages and actual representations, verified exact unchanged inputs against the preserved predecessor and reviewed the changed policy. Both bases are captured in ${folder}/independent-read-snapshots.json. Previous receipt ${saved.previousEvidenceRef} is preserved; its former fingerprint is not used as approval of this policy.`,
  inputs,checks:{
   terminology:`${notes[e.id]} Original terminology and new navigation IDs remain distinct.`,
   meaning:`${notes[e.id]} The exact excerpt, derivative body, plain-language display and applicable HOME projection were compared at / and /unity-theory/.`,
   assumptions:`${e.kind==='evidence'?'Conditions of the cited realization remain scoped to that system, not imposed on the core.':'Core definitions, optional extensions and illustrative conditions remain separate.'} ${notes[e.id]}`,
   hypotheses:`${['conjecture','open-problem'].includes(e.kind)?'Proposed/open labels remain explicit.':'The page introduces no newly established universal result.'} ${notes[e.id]}`,
   evidenceDescriptions:`Actual evidenceState=${e.evidenceState}. ${e.kind==='evidence'?'The displayed label is Evidence reported by the supplied documents; the original reports and limitations remain attributed. No primary paper was adjudicated.':'The role/status is faithful to the original source and does not certify scientific truth.'} ${notes[e.id]}`,
   openQuestions:`${notes[e.id]} The relevant open extensions remain unresolved, including the six status questions and Interaction §5 limits wherever reached. This decision accepts website fidelity only.`,
   attribution,
   sourceMappings:`Compared ${where} with the detached ownRead, all source/dependency identities and actual emitted surfaces. Every bound excerpt matches raw source bytes and its extraction hash; source TeX annotations and both rendered surfaces match. ${notes[e.id]}`
  }};
 const evidenceRef=`${folder}/decisions/${e.id}.json`,raw=JSON.stringify(decision,null,2)+'\n';writeFileSync(evidenceRef,raw);
 return {purpose:decision.purpose,entryId:e.id,fingerprint,reviewerKind:decision.reviewerKind,reviewedAt:decision.reviewedAt,outcome:decision.outcome,evidenceRef,evidenceSha256:sha256(raw)};
});
c.websiteReviews=reviews;validateWebsiteReviews(c);assert.equal(qualifyWebsiteCorpus(c),true);
writeFileSync('research/publication/website-reviews.yaml',JSON.stringify(reviews,null,2)+'\n');
console.log('34 new independently evidenced fidelity decisions validated. Prior receipts and exact prior registry preserved.');
