# RRG — Intro review, replacement copy, and reader test

**Date:** 6 October 2026  
**Repository verified:** `VasylHryha/rrg_theory` (repository ID `1405464880`)  
**Reviewed main commit:** `1f10c562234ba50d159567f1eebf4987c8249198`  
**Task status:** proposed editorial replacement; not applied, reader-tested, accepted for publication, or deployed.

**Use this file for the homepage, Start-page, and reader-feedback work.** It replaces the conflicting introductory recommendations in the earlier “10/10” rework plan, R3 quality review, and reader-first brief. It does not replace R4 as the repository's implementation tracker or undo unrelated work already completed.

## 1. Decision: rewrite the explanation, not just the headline

The present introductory copy is technically careful but still requires readers to decode “organization,” “persistent wholes,” “effective units,” and “further organization” before they can picture the proposal. Repeating those terms in a headline does not explain them.

The author’s actual feedback is that the intro is unclear, needs an explanation and examples, and should make people want to continue. Treat that as a concrete design problem. A passing build or source-fidelity check does not resolve it.

**The recommended change is an example-led narrative:** follow one concrete situation, explain the two relationships RRG emphasizes, then show why repeating those relationships across levels is a scientific proposal worth examining.

The copy below is a candidate to test, not a claim that a reader study has already selected the best wording.

## 2. Corrections to the previous advice

| Previous problem | Correction for this task |
|---|---|
| “I gathered reader feedback” conflated communication guidance and discussions about other projects with evaluation of RRG. | No independent RRG reader sessions were performed in this review. The repository receipt also records human comprehension testing as not performed. Distinguish author feedback, external guidance, editorial judgment, and actual participant observations. |
| Failed reads or empty search results were treated as signs that old defects had disappeared. | A failed read means unknown. Confirm a fix in a successfully read file or rendered output at a named commit. |
| Precise scores such as 9.4 or 9.5 implied a measured quality level. | Replace scores with observable criteria: can readers explain the idea, distinguish evidence from interpretation, find sources, and decide what to read next? |
| The brief prohibited jargon but proposed an abstract “level of organization” hero and ten homepage sections. | Put a tangible example on the first screen. Keep the homepage short; let Start carry the explanation and the other pages carry technical detail. |
| A long list of everything RRG has not achieved dominated the introduction. | Keep a visible research-proposal label and a specific limitation beside the relevant result. Put the full open-claim inventory on Research, not ahead of the idea. |
| The explanation emphasized changed environments but risked losing geometry–mode reciprocity and the origin of the units themselves. | Preserve both the local arrangement/activity relation and the proposed source-direction account beginning with fluctuating activity. |
| A reader saying “this resembles emergence” was treated as an automatic intro failure. | That may be an informed, valid criticism. Separate inability to understand the proposal from disagreement about novelty, usefulness, or scientific support. |
| Crawl policy was inferred from DNS plans and a static robots file. | Do not change it here. The current receipt records the owner’s indexable-public-draft choice and the release builder’s generated robots output. DNS remains deferred. |

The last brief’s star-first recommendation was an editorial guess, not a reader-tested result. A star remains a useful example. The life-first candidate below is proposed because it connects the author’s environment-changing intuition to a concrete measured mechanism and to the activity that maintains a cell.

## 3. Preserve the actual theory, including its ambition

These are source-derived requirements, not newly invented definitions. Read the linked repository sources in §10 before editing.

**Minimal core:** geometry includes relationships, components, boundaries and constraints, not only visible shape. Mode structure includes the full organized activity and response, not one frequency. The central relation is `R=(G,M)` and `G↔M`; neither side is universally first. Stability means their self-consistent organization during an interval, not permanence or an arbitrary minimum lifetime. Higher-level parts can differ and remain internally active. Recursion does not require reproduction or an identical microscopic mechanism at every scale. [P1]

**Current source-direction proposal:** temporary arrangements can arise in a fluctuating background; some may persist through geometry–mode feedback; their presence changes the effective conditions available to subsequent structures. This is the current companion’s central extension. Do not reduce it to “already-built objects combine.” Do not turn its session-level “core/locked” language into a silent amendment of the separately locked project-wide core. [P2, P3]

**Two distinct roles of a whole:** it may participate as a unit in another organization, and it may physically alter its surroundings. These can occur together, but neither implies the other. A change in description is not automatically a physical creation event. Nor does changing a culture’s acidity establish a new organizational scale. [P1, P3]

**Ambition remains:** fundamental interactions, cosmology and other proposed applications stay available in the deeper material, with their actual open status. Better writing must not quietly shrink RRG into a generic collection of analogies. At the same time, the introduction must not claim that its ambition has been achieved. Publishing the proposal does not require proving all of it first. [P2, P3]

## 4. Recommended reader journey

Use the existing routes and navigation. No second site architecture is needed for this task.

**Homepage:** one concrete situation → RRG’s proposed connection → an invitation to follow the explanation. Aim for roughly 200–350 words before optional details; this is an editorial budget, not a mechanical acceptance gate.

**Start:** follow the same situation inward and outward → name geometry and modes after explaining them → separate the two roles of a whole → introduce recursion and the proposed origin account → state what remains to be established.

**Evidence / Research:** retain the existing result-type and RRG-relation classifications, precise conditions, constraints and wider hypotheses. Do not add a numeric “evidence level” system or a new score registry.

The homepage should not reproduce the Start page, evidence catalogue and research-status page in miniature. One primary next action is enough. Technical readers should still have a direct Evidence/Research route.

## 5. Replacement homepage copy — candidate A

**Implementation:** use the following as authored reading copy, not as replacement frontmatter. Keep the existing stable ID and route. Native bibliography/route links are used; recheck them against the actual checkout. The pH study is supplementary literature (`BIB-0089`), not a newly added case in the audited 22-case catalogue.

```markdown
Recursive Resonant Geometry (RRG) · A proposed scientific framework

# What exists can change what becomes possible.

Some bacteria change the acidity of the liquid around them. That change can let another population grow—or prevent it. Living things do not only respond to their surroundings. They change them. [See the experiment](/references/#BIB-0089).

**RRG asks whether nature repeatedly builds through a related process: active parts form an organized whole, and that whole can become a building block or change the conditions for other structures to form.**

## Look inside, then look around

Inside a cell, its membrane and internal organization shape what its chemical processes can do. Those processes, in turn, help maintain the cell. Its structure and activity work together. [Explore the cell example](/examples/cell/).

Now look outward. The cell can participate in a larger system and alter its surroundings. RRG connects these questions: **what keeps a whole organized, and what does that whole make possible next?**

The broader proposal is that this relationship may recur across different levels of physical organization. It does not require those levels to use the same mechanism.

## Follow the idea

Start with the cell, then follow the proposed connection to other physical systems and to the question of how new structures arise.

[Follow the explanation →](/start/)

RRG is a research proposal. The examples illustrate specific relationships; they do not establish a universal law. [Examine the evidence](/evidence/) and decide how far the connection goes.
```

**Why this is a substantive rework:** the reader sees an actual change before the unfamiliar terminology; the environment is an active part of the story; the internal feedback relation is not lost; and the next page promises an explanation rather than merely another list of links.

Do not claim the pH result created a new species, originated a cell, or demonstrated a new RRG level. Do not add a hero slogan saying this is “proved.”

## 6. Replacement Start copy — candidate A

This is the companion explanation, not a second homepage. A short introductory read should still contain the actual conceptual substance.

```markdown
# How can one structure make another possible?

## Start with a change you can follow

Picture two bacterial populations in a liquid. The acidity that suits one may not suit the other. As the first population grows, it can change that acidity and make survival possible for the second under conditions it previously could not tolerate. This relationship has been observed in controlled cultures. [Read the source](/references/#BIB-0089).

The important change is not that new ingredients suddenly appeared. The conditions changed because something living was already there.

That is one doorway into Recursive Resonant Geometry—RRG. The proposal asks how organized systems arise, how their activity helps them persist, and how their presence can change what forms next.

## Now look inside the cell

A cell is not just a bag of ingredients. Its membrane regulates exchange, and its internal organization constrains where and how processes occur. Chemical reactions and transport, in turn, help maintain conditions within the cell. This activity requires resources and energy; the organization does not supply those for free. [Explore the cell example](/examples/cell/).

RRG looks at both sides together: **the arrangement shapes the activity, and the activity acts back on the arrangement.**

It calls the arrangement and relationships **geometry**. This includes connections, boundaries and constraints—not only an object's outline.

It calls the organized patterns of activity **mode structure**. Vibrations are one example. Relative timing, coupling and responses also matter. One frequency number is not enough to describe the system.

The “resonant geometry” at the centre of RRG is the organization and its mode structure considered together. For a persistent state, the question is whether they support a self-consistent organization. That does not mean it must last forever. [Read the concepts](/concepts/).

## This is a physical question, not only a biological one

In a laboratory study of tiny artificial membrane sacs, protein patterns changed the membrane's shape, while the changed geometry affected the protein patterns. Their coupling supported persistent motion under the experiment's supplied conditions. [See the liposome study](/references/#BIB-0026).

This is a concrete example of geometry and activity acting back on one another. It is not a complete living cell or a demonstration of RRG's entire proposed hierarchy.

## A whole can have two different roles

**It can become a part.** A molecule contains interacting atoms, yet it can participate as a unit in another process. The atoms and their internal activity have not disappeared. A larger description uses properties of the whole. [Explore the molecule example](/examples/molecule/).

**It can change the conditions.** Return to the bacteria and their chemical surroundings. Here the important effect is not simply that we choose a different description. The organisms physically change the environment.

RRG asks when these roles connect: can an organized system both persist as a useful unit and help establish conditions for further organization?

The examples show different pieces of that question. Joining their descriptions is not the same as observing the entire chain in one system.

## Why “recursive”?

RRG proposes that the relationship may repeat: internally active parts form a whole; that whole can participate in a further organization; the resulting system has its own collective relationships and activity.

Its current background proposal adds that existing systems can also reshape the conditions inherited by what follows.

This is not a fixed ladder on which everything becomes larger, better or more complex. A change can close possibilities as well as open them. A process can branch, stop or lose stability. Reproduction is one possible mechanism—not a requirement at every level. [Follow recursion and scale](/concepts/recursion/).

## Where would the first units come from?

The broader source-direction idea does not simply assume an inventory of finished building blocks.

It starts from a changing background in which temporary arrangements arise. RRG proposes that some arrangements may persist when the activity they support acts back to maintain, restore or recreate them. Those structures then contribute to the conditions in which other structures may form.

That is a hypothesis to work through in specific physical systems, not a demonstrated account of the primordial universe. The full [recursive-background companion](/framework/recursive-background/) develops it.

## What is RRG trying to add?

The individual examples already have scientific explanations. RRG is not claiming to have discovered membrane transport or organisms changing their environments.

Its proposed contribution is to study the formation of units and the transformation of their backgrounds together, working forward from conditions and activity rather than only describing completed structures.

Whether this becomes a useful general framework depends on specifying mechanisms, limits and testable consequences. Similarity between examples is a reason to investigate; it is not a substitute for that work. The more ambitious connections to fundamental interactions and cosmology remain open hypotheses.

## The question to take with you

Instead of asking only “What is this made of?”, RRG asks:

**What arrangement and activity keep it organized—and what does its existence change for what can happen next?**

[See the evidence and where it stops →](/evidence/)

You can examine a case, question a connection, or contribute a model. The proposal is being published so those questions can be explored—not because every answer is already known.
```

### Editorial alternatives without another whole-site rewrite

The star example can be used as a second opening candidate if readers find the microbial story too specialized. Use the existing `/examples/star/` science and source mapping, not a newly invented astrophysics story. Change only the opening example and its immediate transition; otherwise keep the candidates comparable.

Do not choose a winner from intuition and label it “reader feedback.” Choose the initial candidate editorially, then collect responses. Neither a positive reaction nor a familiar metaphor establishes the science.

## 7. What reader feedback means here

### Evidence actually available now

- **Author feedback:** the introduction is unclear, insufficiently explanatory, and does not create enough interest. This is real feedback from this conversation, paraphrased rather than represented as a formal study.
- **Project records:** the current rework receipt says independent human-comprehension and real screen-reader sessions were not performed. It reports implementation checks, not audience validation. [P6]
- **External guidance checked in this review:** the Nature Physics editorial recommends concrete, descriptive explanation without losing the detail that makes an idea meaningful. The Nature evidence-communication article cautions against excessive certainty and persuasive framing. These are guidance, not RRG reader outcomes. [C1, C2]
- **Not available:** independent reader transcripts showing this intro works. General Reddit discussions about other theories cannot fill that gap.

### Small formative test, not a popularity vote

Recruit a small mix of unfamiliar readers: for example, two curious non-specialists, two science-literate readers, and one physics researcher or graduate student. Include an assistive-technology user when feasible. This is a practical starting sample, not a statistically representative study or mandatory certification requirement.

Record the exact candidate commit/artifact and the page version each person saw. Do not send the old live page when the intended subject is the new candidate.

Before showing the page, ask only enough background to interpret their response. Do not explain RRG verbally first. Say: “We are testing the explanation, not you, and agreement is not expected.” Obtain consent before recording. Store identifying details and recordings privately; publish only consented, anonymized findings.

Use these initial tasks:

1. Read the opening, then describe in your own words what the author is proposing.
2. Point to the example and explain what changed and why it matters to the proposal.
3. Explain what you think the page presents as observed, proposed or still uncertain.
4. Choose where you would go next—or say why you would stop.
5. Point to any sentence you had to reread or could not picture.

Only after the unprompted account should the moderator probe terminology or specific misconceptions. Do not lead with yes/no questions such as “Has RRG derived the four forces?” Those reveal the expected distinction before checking whether the page communicated it. Neutral tasks and open questions follow the GOV.UK usability guidance. [C3]

### Interpret responses correctly

| Observation | Classification | Response |
|---|---|---|
| Reader cannot explain the connection between the example and RRG. | Explanation problem. | Rework the transition or example. |
| Reader thinks one experiment establishes the universal framework. | Scope/attribution problem. | Clarify the specific demonstrated link. |
| Reader explains RRG accurately but considers it similar to emergence or existing theory. | Potential scientific/novelty criticism. | Preserve the objection; answer with a specific distinction or acknowledge that it is not established. Do not “repair” the reader into agreement. |
| Reader understands but does not wish to continue. | Relevance/interest feedback. | Ask what question would make further reading worthwhile; do not infer incompetence or scientific falsity. |
| Reader likes the page but cannot explain it. | Engagement without understanding. | Do not call the intro successful. |
| Reader needs a screen reader or zoom and cannot follow the sequence. | Accessibility problem. | Fix the actual interaction or presentation defect. |

Two independent readers stumbling at the same transition is a useful editorial trigger, not a statistical rule. Report counts with their denominator and preserve substantive disagreements. Do not claim a 9.5/10 comprehension score from five people.

### Blank observation record

```text
Participant code:
Relevant reading/science experience:
Consent and privacy arrangement:
Candidate commit/artifact; page and device:
Exact unprompted explanation:
Example-to-proposal connection they described:
Observed/proposed distinction they described:
Sentence or interaction that caused difficulty:
Next action chosen and why:
Criticism or question to preserve:
Moderator prompts actually used:
Editorial change proposed:
Result after retest, if performed:
```

A model-generated persona walkthrough may help prepare the test but must be labelled simulated editorial inspection, never participant feedback.

## 8. Codex implementation instructions

**First compare, then edit.** Re-resolve the repository identity and current HEAD; preserve unrelated local work. At the reviewed commit the public rework is `REVIEW_READY`, routine CI is recorded as passing, and the reworked candidate has not been deployed. The receipt records stale source-fidelity decisions awaiting the existing independent review. Do not confuse those facts with a broken or updated live site. [P6]

### Scope of this change

Replace the explanation in `research/publication/pages/home.md` and `start.md`, adapting existing frontmatter rather than overwriting it. Adjust `src/pages/index.astro` and `start.astro` only as needed to support the new reading order. Do not restart the navigation, Evidence, Sources, rights, deployment, or provenance work already completed.

Keep `DOC-HOME`, `DOC-START`, `/`, and `/start/` stable. Preserve the homepage `research-question` anchor while existing links depend on it. Keep source-bound original readings unchanged; these are authored derivative pages. The proposed copy does not change the minimal core.

### Source mapping must move with the words

The pH example is already registered as **BIB-0089**, DOI `10.1371/journal.pbio.2004248`. Verify and reuse that record rather than creating a duplicate. It remains supplementary reading, not case E23. The liposome example uses existing **BIB-0026**, DOI `10.1038/s41567-023-02058-8`; verify the current record before use. Do not carry over the old homepage's water-only bibliography as though it supported the new opening.

Update the actual `bibRefs`, `sourceRefs`, `dependsOn`, source-mapping prose, revision, and update date for each changed record. Existing relevant source keys include `R-CURRENT-CORE`, `R-CURRENT-BACKGROUND` and `R-CURRENT-CLAIMS`; confirm their meaning in the current source index. Link to the current cell/concept/recursion/source-connection pages where their material is used. Do not attach every scientific claim to every example.

The native explanation, search excerpt, rendered HTML and generated explanatory Markdown must tell the same story. The last rework already addressed export of authored reading context; retain that behavior. Avoid putting essential science only in template literals or a diagram that the export omits.

### Presentation

Show the short concrete example and proposed connection before a glossary, table or evidence taxonomy. Use one prominent onward link. Keep citations immediately reachable. Full reference cards, exact hashes and governance details can remain in disclosures; the proposal label and substantive limitation must remain visible.

If adapting the existing schematic, distinguish **inside-system feedback** from the **two possible outward roles**. Do not draw a single inevitable upward staircase or label all arrows “proved.” Text must explain the relationship without animation or JavaScript. A diagram is optional, not a substitute for the copy.

### Checks proportional to the change

Use the actual repository scripts and the R4/AGENTS workflow. Run the changed-content reports for `DOC-HOME` and `DOC-START`, inspect their reported dependency effects, and run targeted template/export/link checks. Reuse passing unchanged evidence. A copy change does not automatically justify a full monthly history, browser or literature campaign.

Once wording is stable, perform one bounded source/display review across the actual affected scope. Existing stale decisions cannot be refreshed by changing fingerprints alone. If a shared renderer changes and widens the scope, document that effect rather than pretending only two decisions changed. Do not requalify the same text repeatedly between tiny editorial adjustments.

For the candidate, check the exact current base path `/rrg_theory/`, keyboard/no-JS reading, mobile wrapping, citation destinations and exported copy. Run the existing routine CI/release checks at the appropriate final stage. Treat unavailable human or assistive-technology observations as unavailable, not passed. Preserve the established manual publication process and defer DNS. Do not alter discoverability: the recorded choice is to keep the public draft indexable. [P6]

### Concrete completion conditions

- The first screen contains a pictureable example and a positive statement of the proposal, not only a slogan.
- The introduction explains both geometry–mode reciprocity and the broader source-direction question.
- It distinguishes a whole-as-unit from physical environment change, and retains the fluctuating-background origin hypothesis.
- No ordinary example is presented as proof of all RRG; no new species, force or scale is invented to improve the narrative.
- The reader can reach a source and a deeper explanation without decoding internal IDs.
- Current output and exports match; source mappings and revision metadata match the text.
- Any human findings are tied to the exact tested version, with misunderstanding separated from disagreement.
- Existing publication controls are respected. This feedback document itself issues no review acceptance or deployment action.

## 9. Report back without a self-awarded score

Return the candidate commit, the two reader-facing pages changed, a short before/after explanation, source mappings added/removed, checks actually run, actual review state, reader observations collected (or `NOT_PERFORMED`), and whether the candidate is deployed.

The goal is not to make every reader accept RRG. It is to make the proposal understandable and worth evaluating, while allowing a reader to locate the evidence, recognize the limits and disagree intelligently.

## 10. Source and verification notes

Repository links below are pinned to the inspected commit. They support the description of RRG and the project state, not independent validation of its universal scientific claims.

**[P1] Minimal core:** [00_LOCKED_CORE.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/research/RRG_CURRENT/00_LOCKED_CORE.md). Read in full in this review. Definitions, stability, structural recursion and change boundary.

**[P2] Current source-direction companion:** [04_recursive_background_generation.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/research/RRG_CURRENT/04_recursive_background_generation.md). Opening through §4 inspected here; source direction, fluctuating starting background, publication-first scope, and the document’s own definition/extension wording.

**[P3] Current claim map:** [08_claim_coverage.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/research/RRG_CURRENT/08_claim_coverage.md). Read in full. H01–H23, open claims O1–O8, and success/failure scope.

**[P4] Current introductory copy:** [home.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/research/publication/pages/home.md) and [start.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/research/publication/pages/start.md). Read in full. These are the baseline for the editorial criticism and replacement.

**[P5] Existing cell explanation:** [example-cell.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/research/publication/pages/example-cell.md). Read in full; maps the illustration to current sources and the existing OpenStax background references.

**[P6] Current rework receipt:** [receipt.md](https://github.com/VasylHryha/rrg_theory/blob/1f10c562234ba50d159567f1eebf4987c8249198/docs/evidence/public-rework/receipt.md). Read in full. Reports routine checks, not deployment of this candidate; records outstanding source/display acceptance, no performed human test, and explicit indexability decision. These checks were not independently rerun in this editorial review.

**[E1] Ratzke & Gore (2018):** [Modifying and reacting to the environmental pH can drive bacterial interactions](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.2004248). Primary HTML abstract, author summary and relevant Results inspected, including successive growth and buffering discussion. Supports local environment-mediated effects in supplied cultures; not origin of life, a new species, a new physical scale, or universal RRG. No experiment reproduced.

**[E2] Fu et al. (2023):** [Mechanochemical feedback loop drives persistent motion of liposomes](https://www.nature.com/articles/s41567-023-02058-8). Primary abstract and relevant experiment/theory passages inspected. Supports the bounded geometry–protein-pattern/motion description. The feedback-interruption result belongs to the model; do not relabel it experimental ablation. No full methods/data audit or reproduction claimed.

**[C1] Nature Physics (2021):** [How to talk to a non-specialist](https://www.nature.com/articles/s41567-021-01473-z). Editorial guidance on descriptive language, essential context and avoiding specialist shorthand. It does not test RRG or select a best opening example.

**[C2] Blastland et al. (2020):** [Five rules for evidence communication](https://www.nature.com/articles/d41586-020-03189-1). Public article summary and bibliographic record verified. Used only for its explicit guidance on certainty, narratives and informing rather than persuading; no inaccessible full-text analysis claimed.

**[C3] GOV.UK Service Manual:** [Using moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing). Official practical guidance on relevant participants, neutral tasks, observation and follow-up. The proposed RRG questionnaire and sample are editorial adaptations, not requirements imposed by that source.

**Scope of this review:** source and copy inspection, selected external verification, and new editorial drafting. No repository edits, human recruitment or interviews, scientific experiments, fresh build/browser suite, publication decisions, or deployment were performed.
