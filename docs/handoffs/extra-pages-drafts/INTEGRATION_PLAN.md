# Proposed integration after draft review

**INTEGRATED — 7 October 2026.** The owner approved the drafts; the independent reviewer integrated all four routes as Part V under the existing rights decision. Fresh source/fidelity acceptance, repairs and qualification are recorded in `docs/evidence/fidelity-v031/receipt.md`. Initial integration used draft revision 3; the requested quality recheck advances Related work, Questions and Uses to revision 4 and leaves Experiments at revision 3. Recheck: `docs/evidence/fidelity-v031/recheck/README.md`. Earlier drafts remain preserved in the review snapshots. The remaining sections preserve the original proposal.

**Original draft-stage status:** These files are not publication entries. No route,
menu, footer, home, glossary, release selection or review decision is changed.
The owner reviews the four drafts before any website integration. The source
revision has its own identity and review boundary; approval of a draft does not
accept the source edition or authorize publication.

## Contents and reading order

Propose a new **Part V — Explore further**, immediately after Research and
sources and before Appendices. Keep the existing Parts I–IV intact. The order is
related work → critics' questions → experiments → possible uses: first compare
explanations, then understand the gaps, then consider contributions.

| Draft | Proposed ID / route | Contents placement | Reading connections |
|---|---|---|---|
| [Related scientific work](related-work.md) | DOC-RELATED-WORK · `/related-work/` | Part V, first chapter | From Start's “what RRG adds”, framework §17, References; next Questions |
| [Questions critics ask](critics.md) | DOC-CRITICS · `/questions/` | Part V, second chapter | From Start's limits, Research status and Open problems; next Experiments |
| [Try it yourself: experiments](experiments.md) | DOC-EXPERIMENTS · `/experiments/` | Part V, third chapter | From Evidence and catalogue; next Uses; closing Contact link retained |
| [What could RRG be useful for?](uses.md) | DOC-USES · `/uses/` | Part V, fourth chapter | From Research and background concept; related Experiments, life/environment and Contact |

Alternative if a new Part is declined: four explicit chapters at the end of
Part IV, under “Explore further”. Use the same order and source links. Do not
let proposed routes fall into the generated “Other” group after integration.

## Menu, footer and home doors

Keep the existing top-level menu. Add the four pages to the **Research**
dropdown as a small “Explore further” group, with ordinary page names and
descriptions. Add **Questions** and **Experiments** to the footer; Contents
provides access to all four. Do not add an empty group for unapproved drafts.

For home doors, retain Start, Examples, Evidence and Research. Propose small
secondary links alongside those doors: “Compare explanations” → Related work
under Research; “Ask a hard question” → Questions under Research; “Try a test”
→ Experiments under Evidence; “Explore possible uses” → Uses under Research.
These should add choices without enlarging the opening explanation or ladder.

## Glossary and related links

| Glossary term | Proposed added reading links |
|---|---|
| Resonance; Geometry (shape); Mode | Experiments and Related work |
| Resonator; Stability | Experiments and Questions |
| Recursion / recursive; Background; Changed surroundings | Related work, Experiments and Uses |
| Outer resonance; Inner resonance | Related work and Questions, preserving O9's limits |
| Spreading; Building block; Scale | Experiments and Uses, without promising growth |

Retain each term's authoritative source link. Add reciprocal explanatory
connections through `related`, capped at six per page. Do not create circular
`dependsOn` chains. Each page should depend on its source readings, not on the
other three drafts, so partial approval is possible. Confirm the real canonical
IDs in the metadata during draft link checking and use base-aware route handling
when integrated.

## Later integration batch

After explicit approval of the relevant drafts, copy only approved pages into
the existing publication page directory, resolve their normal publication and
rights metadata, and update the generated Contents rules and shared navigation
consumers. New BIB-0094–0098 already exist as related-work references. Keep
BIB-0004/0009/0010 and the catalogue references with their existing limits;
BIB-0004 has a preserved source-year/publisher-year discrepancy.

The v0.3.1 revision makes affected existing fidelity decisions stale. Genuine
bounded acceptance must compare changed source/display material and any new
integrated readings through the existing validator. Do not manufacture or
automatically refresh decisions. Keep the preserved v0.3 release, sources and
earlier evidence intact. Run only affected checks for that later batch; this
proposal authorizes no commit, push or deployment.

## Draft-stage checks

Exact word counts, metadata references, source-section pointers and all Markdown
link/fragment checks are recorded in
[`docs/evidence/source-revision-v0.3.1/recheck/draft-links.json`](../../evidence/source-revision-v0.3.1/recheck/draft-links.json).
The four proposed routes intentionally remain absent from the preview build.

Bounded recheck: all four drafts now have revision 2. It clarifies calibration
versus a specific RRG prediction, the stronger same-equation test and the need
to observe spreading separately; explains technical terms; records the RNA
study's supplied ingredients; and makes the effective-dynamics citation direct.
The scientific source edition and its seal are unchanged. Five new bibliography
display citations use the exact supplied name order and punctuation. Earlier
drafts and evidence are preserved under the recheck's `before/` directory.
