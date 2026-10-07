# Recursive Resonant Geometry
## The name states the rules

- **Resonant → resonance:** motion falls into rhythm.
- **Geometry → shape:** rhythm and shape hold each other, so it lasts.
- **Recursive → resonator:** it spreads and joins into bigger shapes with a new resonance; the same rules repeat at each new scale.

Everything moves. Most motion is chaos. Sometimes a piece of motion falls into a rhythm that keeps its own shape, and that shape keeps the rhythm going. It lasts: that is a resonator. Its rhythm reaches out. It makes nearby things move with it, stick to it, or take a similar shape. So more resonators appear, they join into bigger shapes with a new rhythm of their own, and the same thing happens again at the next level.

**RRG v0.3.1 — relation to existing work, 2026-10-07**
**Author:** Vasyl Hryha. **Status:** a unifying framework, not yet proven.

The paragraph gives RRG's proposed common pattern. Spreading and joining need suitable conditions; neither happens at every level. “Recursive” means both the lasting resonator's role and the whole cycle repeating at a new scale. Rhythm and shape hold each other; neither comes first. The full plain-language explanation is [01 §§0–15](01_world_explanation.md#0-the-name-states-the-rules).

In compact technical form:

\[
B_n\rightarrow R_n\rightarrow B_{n+1},\qquad
R_n=(G_n,M_n),\qquad G_n\leftrightarrow M_n.
\]

**Resonant** concerns the mode structure \(M_n\). **Geometry** concerns the organization \(G_n\) and their mutual support \(G_n\leftrightarrow M_n\). **Recursive** concerns the lasting pair \(R_n\), its possible role in larger pairs, and its contribution to the next background \(B_{n+1}\). That background includes inherited material, constraints and unresolved activity; it need not be literal white noise.

In plain words, resonance is motion that has fallen into rhythm, rather than undifferentiated chaotic motion. Technically, a mode includes frequency, phase, amplitude, spatial pattern, coupling and timescale—not just a number in hertz. A visible periodic oscillation is not required by the [unchanged core §§2–4, 12](00_LOCKED_CORE.md).

**RRG's energy-and-time reading:**

> Everything moves, and energy is what keeps things moving: vibrating, rotating, resonating. Every resonator lasts for a time. Some hold on their own for billions of years; others last only while energy keeps flowing through them.

See [01 §3.1](01_world_explanation.md#31-energy-and-time) for motion, energy, supply and lifetime. The v0.3 explanations and open hypotheses are retained. This v0.3.1 edition adds a related-work comparison and bibliographic records verified 7 October 2026 (Claude). The normative core and evidence cases are unchanged; bibliographic verification is not verification of RRG.

The project explains and shares this proposed connection, collects well-described cases and invites independent development. A universal proof is not required before sharing a labelled hypothesis. Small derivations, observations and objections can improve particular claims.

## Reading paths

**First read the idea:** [01 — World explanation](01_world_explanation.md), including its [Common questions](01_world_explanation.md#16-common-questions). **Then follow the argument:** [04 — Full conceptual companion](04_recursive_background_generation.md). It preserves the whole session: source background, feedback, scale, persistence, propagation, coexistence, life, new effective rules, expansion and possible engineering implications.

**Compare with existing explanations:** [02 §17 — Relation to existing work](02_scientific_framework.md#17-relation-to-existing-work) sets out shared ideas and proposed differences. Formation, spreading and background change form RRG's proposed cycle; resonance-fit is its proposed compatibility rule. No evidence yet distinguishes this addition from those theories.

**Then inspect the examples:** [06 — Evidence catalogue](06_evidence_catalog.md). There are 22 primary case cards, with separate labels for result type and relevance. Every card identifies the reported result, what was supplied, what it does not demonstrate, its DOI and verification coverage.

**Check the boundaries without losing the ambition:** [08 — Claims and session coverage](08_claim_coverage.md). This distinguishes the author’s broad hypotheses from local evidence and avoids silently dropping life, cosmic expansion, AI or “magic” from the discussion.

**Optional mathematics:** [05 — Mathematical illustrations](05_mathematical_source_model.md). These are small calculations under explicit assumptions, not proof that a single equation generates the universe. There is no requirement that the author adopt this model.

**See what changed and what was previously audited:** [07 — Audit report](07_audit_report.md) and [CHANGELOG](CHANGELOG.md).

## A clear public evidence format

For each example, state **what was observed**, **how RRG interprets it**, **what was already provided**, and **what remains open**. Show result type separately: experiment, simulation or mathematical/theoretical derivation. Do not present an analogy as a measured mechanism, a review as an independent experiment, or a computation as an observation in nature.

Many standard theories already explain the reported effects. Showing compatibility with RRG is different from distinguishing RRG from those theories. A collection of separately supported connections is not automatically a demonstrated causal chain.

A useful entry point into the evidence is E19 for interactions induced by a random field, E07 for coupled matter–field organization, E20 for vibrationally maintained pattern multiplication, and E14 for unresolved dynamics in a collective description. Their limitations matter as much as the resemblance to the idea.

## What is maintained, and what remains conjectural

The central source-direction idea is unchanged. So is the ambition that new stable organizations could help explain successive effective “worlds.” The publication does not silently replace that ambition with a claim merely about sand on a plate.

The extensions to all physical scales, the origin of fundamental interactions, cosmic expansion and deliberately designed domains are retained as **open conjectures**. Engineering selected effective dynamics is a narrower claim than rewriting fundamental laws. Life and AI are possible applications or analogies, not confirmations of a shared microscopic mechanism.

One further distinction is essential: **structures physically changing their environment** is different from **our coarse-graining a system’s description**. RRG proposes a relationship between the two, but a mathematical reduction by itself does not demonstrate that a new level physically formed.

## History and file authority

The files in `foundations/` are byte-preserved snapshots of 01–03. They preserve the terminology and prior development; they have **not** received a complete fresh source audit. Some contain older proof-first priorities, stronger mathematical assertions and a known formatting issue. [Foundation errata](foundations/ERRATA.md) records the compatibility corrections. They are not the current public evidence catalogue.

The former 04–06 text companions, old README and earlier numerical bundles remain preserved in the owner’s audited GPT Library release; the predecessor GitHub current set is separately preserved under `research/history/repository-current-2026-10-01/`. They are not duplicated inside the active `RRG_CURRENT` tree and do not define current publication guidance. The current README, revised 01, and 04–08 state this edition’s explanatory scope. The exact v0.3 predecessor is preserved under `research/history/repository-current-v0.3-2026-10-07/`. The exact v0.2.1 repository current promoted on 5 October 2026 is preserved under `research/history/repository-current-v0.2.1-promoted-2026-10-05/`. Where an earlier mathematical implementation is more restrictive than the conceptual proposal, treat it as an optional stronger branch rather than silently redefining the theory.

The predecessor audited package originated as a conversation/Library artifact and was **explicitly promoted by the owner to replace the prior active repository companion on 5 October 2026**. The predecessor repository source set is preserved under `research/history/repository-current-2026-10-01/`. This source promotion does not by itself qualify the website, grant a licence, or authorize a Pages deployment.

## What was checked

The 2 October 2026 v0.2.1 audit checked those companions for conceptual consistency, verified targeted primary-source metadata and reported findings, corrected selected mathematics and ran nine groups of deterministic spot checks. See [check results](checks/verification_results.json), [source register](sources.json) and [package validation](checks/package_validation.json).

This is not independent peer review, a systematic review of all literature, formal verification, or an independent replication of the experiments. Some case cards are abstract-level checks. The earlier 32-cell simulation was not rerun. These limitations are recorded per source instead of hidden behind a numerical quality score.

## Contributions and release practice

Useful contributions include simpler explanations, missing cases, counterexamples, corrected citations and optional derivations. Each change should identify which claim it affects. The author need not perform every proof personally; neither should unavailable proof be replaced by a statement of certainty.

Reviews occur when undertaken by the project; no automatic monitoring is running. Keep source dates, revisions and old interpretations so later readers can reconstruct changes. Use original source pages for videos and figures, and check reuse rights before embedding them. A citation is not a licence.

Author attribution is Vasyl Hryha. Existing repository rights remain as recorded separately; this source revision makes no licence grant or publication/deployment decision. Third-party citations do not assign reuse rights or guarantee a venue’s acceptance.
