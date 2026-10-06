# RRG — Whole-site review and rework brief

**Date:** 6 October 2026  
**Project identity:** Recursive Resonant Geometry (RRG)  
**Repository named in the supplied handoffs:** `VasylHryha/rrg_theory`  
**Status of this document:** corrected implementation scope, not a completed page-by-page review or publication acceptance.

> **Codex: review the whole public project. Home and Start are only two parts of the task. Assess every current reading and supporting public surface for clarity, substance, source support, usefulness and consistency. Rewrite, reorganize or merge presentation where that materially improves the reader’s experience. Do not limit the work to fixing broken links or old labels.**

## 1. Scope correction and relationship to previous work

The broader public-rework brief requested improvements across the whole project. The later intro brief explicitly restricted implementation to Home and Start. That restriction was too narrow for the owner’s overall request.

This document governs **scope, coverage and completion criteria** for the next quality pass. The repository’s existing R4 plan remains the execution tracker. Fold the work into that plan; do not create a competing milestone system.

The replacement Home/Start copy in `RRG_INTRO_REVIEW_AND_REWRITE_2026-10-06.md` remains an editorial candidate, not approved or reader-validated text. Its explanation principles are useful across the site, but its “only Home and Start” restriction no longer limits this task.

Do not replay stale findings from older handoffs. Resolve the actual repository and inspect the current checkout first. Mark completed work as retained rather than manufacturing changes.

**What this document does not claim:** no new repository inspection, full-site copyedit, external-paper audit, human reader study, build, acceptance or deployment was performed when consolidating this scope. Previous reports must be read at their recorded commits, not presented as current observations.

## 2. Final goal

RRG is being introduced as a proposed scientific framework. The project should let different readers do different things:

- A newcomer can picture the idea, understand its proposed connection and find a reason to continue.
- A technically literate reader can distinguish definitions, familiar phenomena, evidence, interpretation and open claims.
- A scientific reader can trace a statement to a specific source, inspect assumptions and limitations, and identify what remains to be established.
- A contributor can offer a correction, example, model or objection without being required to accept the whole proposal.

Agreement with RRG is not the test of good writing. Understanding, accurate attribution, useful navigation and an informed choice about further reading are the tests.

## 3. Review everything; do not rewrite everything automatically

Create a page inventory from the **actual current publication selection and generated routes**, not an old remembered page count. Include individual concept, example, claim, evidence, open-question and source-document readings—not just the navigation hubs.

Also inventory utility pages and reader-facing outputs: search, citation, reference links, downloads, explanatory exports, diagrams, metadata, error pages and repository entry documents.

For each item, record a disposition:

| Disposition | Use it when |
|---|---|
| Keep | The page already explains its subject and serves a clear reader need. Record why. |
| Edit | The structure works but wording, an example, attribution or a transition needs repair. |
| Rework | A reader cannot understand the central point without a different explanation or reading order. |
| Merge / reposition | Pages duplicate a job, or useful material is in the wrong part of the reading journey. Preserve cited destinations and source identities. |
| Source issue | A substantive conflict or unsupported statement requires a versioned scientific-source decision rather than a silent website correction. |

A failed fetch means **not inspected**, not “fixed.” A passing build means the checked engineering conditions passed, not that the prose is clear. Keep these conclusions separate.

## 4. Page-family requirements

Every actual page receives its own editorial disposition. Shared checks may be reused where the underlying behavior is identical.

| Page family | What the reader should get | What to inspect or improve |
|---|---|---|
| Home | A concrete doorway into RRG and an intelligible reason to continue. | Show a situation before abstract terminology; state the proposed connection; retain one visible status boundary and a clear next step. Do not reproduce the entire site on the homepage. |
| Start | A connected explanation of the actual proposal. | Develop an example rather than listing unrelated examples. Explain inward arrangement/activity feedback, outward roles, recursion and the proposed origin of units. Name technical concepts after making them understandable. |
| Every example | An observable process and the exact RRG connection it illustrates. | Explain what exists initially, what acts on what, what changes and which link is illustrative or demonstrated. A familiar object named in one sentence is not a developed example. |
| Concepts hub and every concept page | A usable meaning, an example and a bridge to the source definition. | Explain geometry, full mode structure, stability, scale and recursion at suitable depth. Distinguish ordinary usage from RRG’s defined usage. A concept hub should orient readers, not just list links. |
| Evidence overview | An understandable account of what current studies support. | Present meaningful findings and relevant limits before catalogue mechanics. Preserve the existing independent result-type and RRG-relation classifications. Do not introduce another numeric evidence ladder. |
| Every evidence / claim record | A precise statement, its support, supplied conditions and remaining gap. | Check the paper-to-statement connection, not only link validity. Keep experiment, simulation, derivation, interpretation and project reproduction distinct. A source-local label must resolve unambiguously. |
| Research status and every open-question page | What is proposed, what is known locally, what remains open and what a useful contribution could address. | Lead with the scientific question, not review receipts. State model-specific tests where the sources supply them; do not invent universal failure criteria or require complete proof before publication. |
| Framework, mathematics and original source readings | Access to the full technical substance without losing scope or provenance. | Review explanatory context, notation introductions, assumptions, derivation steps, boundary conditions and readable rendering. Preserve exact original text when presented as original; document substantive source issues separately. |
| Articles | A distinct question developed more deeply than the introduction. | Remove boilerplate that crowds out the explanation. Give the article its own argument, examples and conclusion. Merge or reposition genuine duplication without losing useful content. |
| References and source-link maps | Why each source is included, what it supports and where it is used. | Check source identity, inspected version, relevant passage, support scope and actual verification depth. Keep supplementary literature useful without presenting it as a new member of an unchanged audited catalogue. |
| Documents, downloads, citation and history | The exact edition, a practical way to cite it and a clear distinction between original and explanatory material. | Put reader tasks before hashes and internal jargon. Keep technical identities available. Ensure exports include the explanation readers actually saw, with scope labels intact. |
| About, rights and contribution pages | Who maintains the project, how to contact/contribute and the recorded reuse terms. | Use current approved information. Do not invent credentials, scientific endorsements, permissions or licensing decisions. Separate reader-facing guidance from maintainer procedures. |
| Navigation, search, diagrams and shared layout | A coherent path that works beyond the first screen. | Check useful link names, meaningful search results, visible claim status, text alternatives, keyboard access, mobile layout and onward routes. Do not make hidden technical details the only explanation of a material limit. |
| Repository README, START_HERE and operator guidance | A clear entrance for readers and a separate useful entrance for contributors. | Explain RRG before internal milestones. Distinguish current instructions from historical receipts. Describe the real relationship between candidate, accepted release and deployed version. |

## 5. Rewrite explanations, not merely headings

For a page that needs rework, deliver replacement prose—not only advice that someone should “make it clearer.” Use the reader’s question to choose the structure.

### Example-page pattern

**Situation:** what can the reader picture?  
**Mechanism:** what changes, through which interactions, under what conditions?  
**Connection:** which precise part of RRG is being illustrated or investigated?  
**Boundary:** what does this example not establish?  
**Next question:** what would make the reader continue?

### Concept-page pattern

**Question → concrete example → RRG term → exact meaning → useful contrast → deeper source.**

Do not define “organization” using only “organized structure,” or “effective unit” using only “effective description.” Supply a usable example and explain what the distinction changes.

### Evidence-record pattern

**Reported finding → study and version → supplied conditions → precise RRG relevance → limitation / alternative explanation → what was actually checked.**

State the positive result with enough detail to matter. Do not substitute repeated “not proof of all RRG” sentences for a specific limit. Do not hide limits merely to make the project sound stronger.

### Research-question pattern

**Proposed claim → current support → missing link → a concrete contribution or test, where supported → source and status.**

A lack of a specified test is itself an open issue. Do not fill it with an invented prediction.

### Technical-page pattern

**Reading context → terms and assumptions → source text / argument → result and scope → related questions.**

Technical depth is not a defect. Improve access to it rather than flattening every page into beginner language.

## 6. Preserve the scientific meaning while improving the public account

Use the selected core, conceptual companion and claim map as the basis. The following requirements are carried forward from the supplied review; confirm the exact wording against the current sources before editing:

- Geometry includes relationships, constraints and components, not merely visible outline.
- Mode structure is broader than one frequency or visible vibration.
- Geometry and activity act on one another; neither is defined as universally first.
- Stability is not permanence or a new editorially invented lifetime threshold.
- Higher-level parts may differ and remain internally active. Replication and an identical microscopic mechanism at every scale are not compulsory.
- A whole functioning as a unit and a whole physically changing its surroundings are distinct possibilities; neither automatically proves the other.
- The current source-direction proposal includes the emergence of units from fluctuating activity. Do not simplify it into a story that starts only with completed building blocks.
- Preserve wider force, cosmology and application ambitions with their actual open status. Do not quietly remove them or promote them to achieved results.

**A source-fidelity check and a scientific correctness judgment are different.** If an original passage has a real contradiction or unsupported assertion, identify the exact statement, evidence and impact. Propose a versioned correction through existing change control. Do not silently repair an “exact original” in the renderer, and do not excuse a demonstrated source problem merely because the source was previously accepted.

A scientific edition may evolve through an explicit revision. Preserving the audited catalogue means preserving that edition and its history—not forbidding later evidence additions forever.

## 7. Source quality is part of the whole-site review

For every material source-backed statement, check whether its cited support matches the words actually used. A paper related to the topic does not necessarily support that exact claim.

Review the registry and its uses for primary versus background roles, published article versus manuscript versions, shared datasets or duplicate representations, mathematical versus experimental claims, and narrow findings versus broad project interpretations. Link to relevant passages or sections where available.

Record verification depth honestly. An abstract read is not a full-method audit. A preserved source-audit report is reported evidence, not an independent reproduction by the website or the reviewer.

Do not automatically repeat a full literature audit for unchanged sources. Reuse traceable prior checks within their demonstrated scope. Where changed wording exceeds that scope, either verify the needed primary material, narrow the statement or record the unresolved gap. Keep external research findings distinct from RRG’s own source text.

## 8. Reader feedback must cover journeys across the site

The author’s reported difficulty with the introduction is genuine feedback, but it is not a substitute for unfamiliar readers using the rest of the project. External communication guidance and simulated personas are not participant observations.

Use a small formative mix of curious newcomers, science-literate readers and technical readers. No claim of statistical representativeness or scientific peer review is implied. Record consent, the exact candidate version and device, and keep identifying information private.

| Journey | Neutral task |
|---|---|
| Home → Start → example | “Describe the proposed idea in your own words. Show what happened in the example and how you think it connects.” |
| Concept → exact definition | “Find what this term means here. Explain it, then show where the formal meaning is recorded.” |
| Evidence → case → cited source | “Choose a finding. What did the study report? Which part is the project’s interpretation? Find the original source.” |
| Research → open question → contribution | “Find something the project has not established. What could someone contribute, and where would they send it?” |
| Technical reading → mathematics → limits | “Find the assumptions and the result. What does the argument depend on, and where does its scope stop?” |
| Documents → download → citation/history | “Obtain the intended document and identify the edition you would cite. Explain whether you downloaded an original source or an explanatory export.” |

Observe before prompting. Ask where readers hesitated, which passage they could not picture, why they would continue or stop, and what question they expected the next link to answer.

Classify outcomes separately: misunderstanding, attribution error, navigation problem, accessibility obstacle, lack of interest, and substantive scientific disagreement. A reader accurately describing RRG but questioning its novelty is not an automatic usability failure. A reader enjoying the page but unable to explain it is not a comprehension success.

Apply repeated findings across the affected page family, not only to Home. Give all pages an editorial review; use representative reader tasks and shared-template checks where that is proportionate. Report precisely which pages received real participant or assistive-technology observation.

Do not fabricate interviews, quote simulated readers as real people, send outreach without an authorized audience/channel, or make the rest of the useful work wait for unavailable participants. Report `NOT_PERFORMED` where appropriate.

## 9. Shared consistency and implementation

Keep one coherent interpretation across page copy, status labels, diagrams, metadata, search excerpts, explanatory exports and original-source links. A diagram must not imply an inevitable upward ladder when the text describes conditional outcomes.

Retain useful stable routes, IDs and cited anchors. If pages merge, provide an explicit destination and preserve access to their prior meaning where citations require it. Do not globally rename historical sources or receipts.

Update changed prose and its actual dependencies together: source and bibliography references, sidecar summaries, revision dates, exports and affected review inputs. Reuse existing records and validators rather than creating another source or approval system.

Inspect the actual generated output and build mode before reporting a template or static file as a live defect. Read current owner decisions for repository identity, discoverability, rights and deployment. Do not infer search policy from the deferred custom-domain decision, or treat a repository update as proof of deployment.

## 10. Bounded execution order

1. **Establish the baseline and inventory.** Preserve unrelated local work, record the actual current commit and distinguish the candidate from the deployed edition.
2. **Review all pages and assign dispositions.** Identify the largest explanation failures and unnecessary duplication, not only broken functionality. Produce full replacement text for pages assigned Rework.
3. **Implement connected improvements.** Work by reader journey and shared template so one change does not leave adjacent pages telling a different story. Retain completed improvements that still satisfy the requirements.
4. **Check source support and derived outputs.** Review the actual changed statements and dependency effects. Keep failed/unavailable checks visible. Reuse valid unchanged checks; reserve broad campaigns for actual shared risk and the existing project cadence.
5. **Review reader experience and fidelity.** Inspect individual content, representative rendered page families and the connected journeys. Collect genuine reader observations when available. Complete the existing affected source/display review once the candidate is stable.
6. **Report before release.** State what changed, what was retained, what remains unverified and whether publication is authorized under the existing workflow. This scope brief does not itself approve or deploy an artifact.

Do not create another theory rewrite, evidence taxonomy or CI pipeline merely to make the task look substantial. Equally, do not preserve a confusing page because changing it would invalidate a review fingerprint. Make a justified change and review its actual effects.

## 11. Page coverage record and completion

Use a compact table in the existing review record:

```text
Route/output | Record ID | Audience and reader question | Disposition |
Specific reason / proposed improvement | Source-support check |
Editorial review | Render/link/export checks | Human/AT observation |
Unresolved issue | Candidate commit
```

Rows without an actual read remain `NOT_REVIEWED`. Template sampling must be labelled sampled; it does not establish that every individual page’s wording was read. Do not use one aggregate score to hide missing coverage.

The scope is complete only when every current public page/output has a disposition and any omitted or unresolved part is explicit. Editorial completeness, automated checks, scientific fidelity, human observations and release status should be reported separately.

**Expected Codex deliverable:** a completed coverage table, implemented replacements or justified Keep decisions, a short before/after rationale for significant changes, updated source mappings, actual check/review outcomes, genuine reader findings or their absence, and the exact candidate/deployed identity.

The desired result is a whole project whose pages work together: **understand the proposal → explore a concrete example → learn its terms → examine evidence → inspect the technical argument → challenge or contribute.** Improving the introduction alone does not satisfy that goal.

## Basis of this scope correction

This brief consolidates the user’s whole-project request and two supplied handoffs: `RRG_PUBLIC_REWORK_10_OF_10_PLAN_2026-10-06.md` (whole-project remit) and `RRG_INTRO_REVIEW_AND_REWRITE_2026-10-06.md` (intro candidates, source-fidelity boundaries, verification corrections and neutral reader protocol). It contains proposed task requirements rather than a new inspection of the current repository or new audience-research findings.
