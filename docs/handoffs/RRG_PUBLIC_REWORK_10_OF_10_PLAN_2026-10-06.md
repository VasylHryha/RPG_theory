# RRG — 10/10 Public Project Rework Plan
## Codex implementation handoff · 6 October 2026
## Supersedes all earlier cleanup/recheck handoffs

**Repository:** `VasylHryha/rrg_theory`  
**Public GitHub Pages target:** `https://vasylhryha.github.io/rrg_theory/`  
**Current scientific edition:** RRG v0.2.1 repository current  
**Purpose:** improve the *whole public project*, not merely patch contradictions.

> **Owner direction:** it is acceptable to substantially rework, merge, simplify, restructure or replace public presentation code/content when that produces a materially better project. Preserve scientific meaning, source provenance and history; do not preserve mediocre presentation merely because it already exists.

---

# 0. Core principle for this task

This is **not** a “minimal fixes only” task.

The objective is:

> **Make RRG as clear, credible, coherent, inviting and scientifically honest as we can reasonably make this first public research edition.**

Codex may rework:

- homepage hierarchy and copy;
- public information architecture;
- primary/secondary navigation;
- explanatory pages;
- evidence presentation;
- research-status presentation;
- public source/reference presentation;
- documents/library hierarchy;
- metadata and social presentation;
- component/layout code;
- utility pages;
- route ownership where a better structure is justified;
- internal implementation if simplification improves maintainability.

Codex may merge or demote redundant public pages.

Codex may replace weak explanatory copy with better copy.

Codex may remove public UI that exposes internal workflow jargon without helping the reader.

Codex may introduce new authored **presentation** pages or summaries that are faithfully derived from current sources.

## But Codex must preserve

- `00_LOCKED_CORE.md` meanings unless a separate scientific source revision is genuinely required;
- the distinction between minimal core and extensions;
- original source bytes/history;
- the current 22-case audited evidence catalogue as an audited source document;
- exact source provenance;
- historical receipts as historical facts;
- evidence limitations and comparator cases;
- current rights decisions;
- publication history;
- old URLs/identities inside historical evidence where historically accurate.

**Break presentation when useful; do not silently break scientific meaning or provenance.**

---

# 1. Why the previous review was not good enough

The prior feedback over-optimized for:

```text
avoid regressions
avoid unnecessary edits
preserve current implementation
```

Those are important safeguards, but they are not enough for a 9.5–10/10 result.

A page can be:

- technically correct;
- source-faithful;
- passing tests;

and still be:

- hard to navigate;
- generic;
- repetitive;
- too internal;
- too technical too early;
- unclear about the distinctive idea;
- visually/informationally noisy.

This pass must judge **quality**, not only correctness.

---

# 2. Current direct findings from latest `VasylHryha/rrg_theory`

Direct reads of the latest repository still show concrete stale/public issues.

## `/start/`

`research/publication/pages/start.md` still says:

```text
Unity Theory asks a broader question...
Its working framework is called Recursive Resonant Geometry, or RRG.
```

The current public project is RRG. This old hierarchy should not remain in the canonical beginner introduction.

`src/pages/start.astro` still renders:

```text
Public introduction: author approval pending.
```

The public research-draft edition has already been owner-authorized and deployed.

## References

`src/pages/references.astro` still renders:

```text
Source registry · Private draft
```

on a public release.

Its description also implies all references come only from selected current source records, while the project now deliberately contains supplementary/recovered sources used by the source-reading map.

## Cite

`src/pages/cite.astro` / `src/lib/library.ts` still contain pre-release concepts such as:

```text
Citation preview
Preview address
remaining public credit and rights decisions
public release remains subject to its recorded gates
```

Those are inappropriate in the deployed release view.

## Contribution guide

`CONTRIBUTING.md` still says:

```text
Deployment is disabled...
UNITY_DEPLOY_ENABLED absent...
no authorized target...
public checkout still requires future selection...
```

The project has already deployed via owner-controlled GitHub Pages.

## Source authority

`research/RRG_CURRENT/SOURCE_AUTHORITY.md` still says public qualification is blocked until the website is rebound.

That event is historical; the rebind and release happened.

## Search indexing

Current repository directly shows:

```text
public/robots.txt -> Disallow: /
```

while `ReadingLayout.astro` emits:

```text
index, follow
```

for published release pages.

This is contradictory.

**Do not choose the winner from this handoff.** Search discoverability is an owner policy separate from DNS/custom-domain approval.

## Current top navigation

The current main navigation effectively exposes:

```text
Start
Framework
Research
Documents
Articles
Cite
Sources
Search
```

All as near-equal top-level destinations.

This is functional but not optimal for a first-time reader.

---

# 3. Rework the public information architecture

## Goal

A new reader should see a clear hierarchy:

```text
Understand the idea
        ↓
See examples
        ↓
Understand the concepts
        ↓
See the evidence
        ↓
See what remains open
        ↓
Go technical / inspect originals
```

The website should not make an unfamiliar reader choose among eight repository-like categories before understanding RRG.

## Recommended primary navigation

Use approximately:

```text
Start
Concepts
Evidence
Research
Documents
Search
```

Six items is a better maximum.

### Move to secondary/footer navigation

```text
Articles
Sources / References
Cite
About
Rights
Contribute
```

These remain important but are not the six most important first-reading decisions.

## Framework

Do not delete the technical framework.

But “Framework” is not as reader-friendly as “Concepts” for primary navigation.

Recommended:

- primary nav -> Concepts;
- Concepts leads naturally to deeper Framework;
- technical guide still links Framework/Math/Evidence/Status internally.

## Route stability

Avoid breaking existing external URLs unnecessarily.

If routes are replaced:

- preserve old routes with redirects or small compatibility pages where the static architecture permits;
- never silently make old cited URLs resolve to unrelated material.

---

# 4. Rework the homepage around the distinctive RRG question

## Current strength

The latest homepage is cleaner and should stay simple.

## Current weakness

The current H1:

```text
How do parts become a whole?
```

is understandable but generic.

Many fields ask that question. It does not communicate the most distinctive part of RRG:

> **a formed whole may become a unit and may change the conditions for further organization.**

## Recommended hero direction

### Eyebrow

```text
Recursive Resonant Geometry (RRG) · Research proposal
```

### Preferred H1

```text
How can organization make further organization possible?
```

Alternative, if usability testing prefers it:

```text
How can one level of organization make the next possible?
```

### Lede

Something close to:

```text
RRG explores how arrangement and activity can form persistent wholes, how those wholes can become useful parts of larger organization, and how existing organization can change the conditions for what can form next.
```

This is much closer to the distinctive proposal while remaining understandable.

## Homepage structure

Recommended:

### 1. Hero
One question + one-sentence explanation + “Start with the idea”.

### 2. The idea in 3 steps

Visually:

```text
active parts
    ↓
persistent organization
    ↓
new unit / changed conditions
    ↓
possible further organization
```

With an explicit note:

```text
Proposed organizing relation — not a guaranteed universal sequence.
```

### 3. Three examples

Keep:

- string;
- molecule;
- life/environment.

But make each example answer a different question:

```text
What can arrangement constrain?
When is a whole useful as a unit?
How can existing organization change conditions?
```

### 4. What evidence do we actually have?

Add a compact section before the current research-status area:

```text
RRG is not supported by one decisive experiment.
Current literature demonstrates several component mechanisms and partial bridges under specific conditions.
```

Link to Evidence.

Show perhaps 3–4 small examples:

- geometry/mode reciprocity — atom–cavity or swarmalator case;
- field-mediated interaction — optical binding/random-light;
- pattern propagation — granular/chemical replication;
- constraint/comparator — low-absorption selection or nonresonant transport.

Do not cherry-pick only confirming cases.

### 5. What remains open?

Three or four items:

- universal recursive law;
- repeated causal chain;
- distinctive quantitative prediction;
- fundamental/cosmological extensions.

### 6. Go deeper

```text
Concepts
Evidence
Research status
Technical documents
```

## Homepage must not include

- detailed SHA hashes;
- internal M-stage jargon;
- “bounded separate High acceptance”;
- workflow gates;
- long source extraction receipts;
- raw local IDs unless inside optional technical detail;
- multiple repeated warnings that obscure the positive idea.

Those belong elsewhere.

---

# 5. Rework `/start/` as the canonical beginner explanation

Keep its good conceptual sequence, but improve its identity and pacing.

## Required naming repair

Replace:

```text
Unity Theory asks...
Its working framework is called RRG...
```

with RRG directly.

Recommended:

```text
Recursive Resonant Geometry (RRG) asks a broader question: **how do arrangement and activity support an organized whole, and how can that whole make further organization possible?**
```

## Remove stale status

Remove:

```text
Public introduction: author approval pending.
```

## Improve pacing

The current page is good but can be made slightly stronger by explicitly introducing one compact recurring phrase after the reader understands the components:

```text
parts + relationships + activity
        ↓
persistent whole
        ↓
useful unit / changed conditions
        ↓
further organization
```

Do not introduce `B_n -> R_n -> B_{n+1}` before plain language is established.

Near the deeper half of the page, optionally say:

```text
The technical source later represents the background/organization part schematically as
B_n -> R_n -> B_{n+1}.
```

Only if it improves understanding.

---

# 6. Rework Concepts into a strong conceptual hub

Current Concepts is correct but mostly a list of four links.

Make it a genuine orientation page.

## Recommended cards / sections

### Geometry + mode structure
What is organized, and how does it change/respond?

### Stability
What does “persist” mean in RRG, and what does it *not* mean?

### Scale + recursion
When can a whole become a useful part of another description?

### Background + effective interactions
How can existing organization change conditions/interactions for later organization?

Each card should include:

- one-sentence explanation;
- one example;
- status label:
  - core definition;
  - current extension;
  - open question;
- deeper link.

## Important authority distinction

Make it obvious that:

```text
R=(G,M), G<->M
```

belongs to the minimal project-wide core,

while:

```text
B_n -> R_n -> B_{n+1}
```

is the principal current source-direction extension / branch commitment unless explicitly promoted through core change control.

Do this in presentation; do not rewrite audited source bytes unnecessarily.

---

# 7. Substantially rework the public Evidence page

This is one of the biggest opportunities.

## Current problem

A 22-row table is accurate but asks readers to understand the catalogue before understanding what evidence means for the theory.

## New structure

### Section 1 — What would evidence for RRG look like?

Explain in plain language:

```text
Component:
one operation exists.

Partial bridge:
two relevant operations are causally linked in one system.

Stronger bridge:
formed organization changes conditions so a distinct further organization becomes possible.

Recursive evidence:
the operation repeats across connected levels without manually adding a new rule.

Discriminating evidence:
a quantitative RRG implementation predicts something that alternatives do not.
```

This should align with current source 04/06 without inventing a new scoring system.

### Section 2 — Start with these cases

Choose a balanced small set.

Recommended categories:

#### Geometry ↔ activity
- E07 atom–cavity self-organization;
- E08 colloidal swarmalators.

#### Environment / field → effective interaction
- E18 optical binding;
- E19 random-light interactions.

#### Propagation / multiplication
- E20 granular bands;
- optionally E10/E11.

#### Constraint / alternative mechanisms
- E17 low-absorption selection;
- E22 nonresonant granular transport.

#### Effective description / next-level variables
- E14;
- E21, with strong scope caveat.

### Section 3 — Related cases not in the audited 22-case catalogue

Clearly label supplementary/recovered literature:

- He optical supramolecular structures;
- Fu mechanochemical liposome feedback;
- Godino Min/liposome work;
- Prindle/Liu biofilm coordination;
- staged DNA assembly;
- Ratzke/Gore environmental pH;
- BCS / spin ice as effective-interaction context.

State explicitly:

```text
These sources enrich the reading map. They do not silently increase the official v0.2.1 catalogue from 22 cases.
```

### Section 4 — What is not established

Put this close to positive evidence, not hidden at the bottom:

- no universal recursive chain;
- no Standard Model/gravity derivation;
- no RRG cosmological expansion calculation;
- no RRG-specific AI benchmark;
- no arbitrary-law engineering;
- no universal monotonic complexity rule.

### Section 5 — Full catalogue

Then show all 22 cases.

Give filters or grouped headings if simple to implement:

```text
Experiment
Simulation
Theory

Component
Partial bridge
Constraint/comparator
Analogy
```

Do not make users decode IDs before understanding the evidence.

---

# 8. Rework Research Status into a decision-oriented page

If `/research-status/` is currently primarily a rendered audit/source report, provide a clearer authored status overview before the technical source body.

Recommended top structure:

## What RRG currently claims

- minimal core;
- current source-direction extension;
- strongest open extensions.

## What existing evidence supports

- component mechanisms;
- partial bridges;
- methods/comparators.

## What remains unverified

- repeated recursive construction;
- same principle across multiple levels;
- quantitative distinctive prediction;
- fundamental unification;
- cosmology;
- engineered domains;
- AI.

## What would change confidence?

### Strengthen
- connected causal stages;
- repeated levels;
- quantitative predictions;
- independent tests.

### Weaken
- concrete model failures;
- counterexamples to precise universal statements;
- inability to specify meaningful exclusions;
- alternative models explaining all distinctive predictions equally well.

## What contributors can work on now

- evidence case;
- model;
- simulation;
- prediction;
- counterexample;
- mathematical derivation;
- source correction.

Then link the exact audit/claim source documents.

This makes Research useful rather than just archival.

---

# 9. Rework Documents into a technical library, not a primary concept path

The current Documents page is good technical material.

Keep it, but treat it as:

> **inspect the exact edition and source authority**

not as the main place a new reader must understand the project.

Recommended groupings:

## Current scientific edition
- Core
- World explanation
- Scientific framework
- Recursive background companion
- Math illustrations
- Evidence catalogue
- Audit
- Claim coverage

## Governance / provenance
- Source authority
- Manifest
- Change control
- Changelog
- Foundation errata

## Downloads
- original bytes;
- explanatory Markdown;
- publication ZIP;
- checksums.

## Historical editions
Clearly separate, collapsed by default.

---

# 10. Demote Articles from primary navigation

The two current articles are useful but overlap with the main reader journey.

Keep them as:

```text
Deeper explanations
```

from homepage/research/documents or a secondary Articles page.

Do not make Articles compete with Start/Concepts/Evidence/Research.

Long term, articles can become the place for new authored essays without changing the source edition.

---

# 11. Fix public References properly

Current page still says:

```text
Source registry · Private draft
```

Remove it.

Recommended page hierarchy:

## Literature and sources

Intro:

```text
This registry includes literature cited by the current RRG edition and supplementary reading-map sources. A listed paper may support a local mechanism, provide a method, act as a comparator or supply background context; inclusion does not mean it proves RRG.
```

## Improve each reference card

Display in this order:

1. title;
2. authors / publication / year;
3. DOI / primary source;
4. **Why it is here**;
5. **What was checked**;
6. **Used in RRG pages** by *human title*, not raw internal ID;
7. alternate manuscript/data/code links inside details.

Avoid leading with internal `BIB-xxxx`.

Keep IDs available in anchors/details for stable citation.

---

# 12. Fix Cite as an actual release page

For release mode it should not read like a preview.

## Public release view

Use:

```text
Cite this edition
```

Show:

- RRG title;
- Vasyl Hryha;
- research edition;
- website release;
- publication date;
- permanent public URL;
- repository;
- optional DOI state;
- CITATION.cff;
- article citations;
- exact build/release identity under an expandable “Reproducibility details”.

Move:

- dirty-workspace digest;
- manifest SHA;
- source commit;
- full release mechanics;

into a technical disclosure section.

Do not make normal readers parse build identity before seeing a usable citation.

---

# 13. Fix About / Contribution / Rights presentation

## About

Lead with:

```text
What RRG is
Who maintains it
How to contact/contribute
Current public status
```

Then links.

Do not lead with pending-state boilerplate.

## CONTRIBUTING.md

Rewrite the current stale deployment section.

The repo is already public and the release flow is active.

State the actual situation.

Also simplify for contributors:

```text
Website/text correction
Scientific source correction
New evidence/source suggestion
Theory extension/core-change proposal
```

Each gets a short “use this issue form” path.

Keep technical pipeline details later.

## Rights

Do not change current license terms without owner decision.

But make public presentation easy to understand:

```text
Research prose/original figures: CC BY-NC-SA 4.0 now; additional CC BY 4.0 from 2033.
Code: no additional reuse license currently.
Data/evidence: no additional reuse license currently.
Third-party works: their own terms.
```

---

# 14. Decide whether code should actually be open-source

This is a real requirements question, not a technical bug.

A public GitHub repository is **source-visible**.

It is not automatically legally **open-source software**.

Current code has no additional reuse license.

If the project requirement is:

```text
people can inspect the code
```

current state is sufficient.

If the project requirement is:

```text
people can legally copy, modify and redistribute the website code
```

the owner must choose a software license.

Codex must not choose one automatically.

If needed, present concise choices for owner decision later:

- MIT;
- Apache-2.0;
- GPL-3.0;
- other requested license.

Keep research-content and data rights separate.

---

# 15. Search discoverability is a separate owner decision

Current contradiction:

```text
robots.txt -> Disallow /
release meta -> index, follow
```

Fix only after determining intended policy.

## Choice A — indexable public research draft

```text
robots allow
meta index, follow
sitemap exposed
```

## Choice B — public by link, not indexed yet

```text
robots disallow
meta noindex, nofollow
```

Do not infer this from the custom-domain decision.

DNS remains deferred regardless.

Codex should record whichever explicit owner policy is selected.

---

# 16. Public visual / interaction quality

Substantial presentation rework is allowed.

Inspect actual rendered pages at:

- 1440px;
- 1024px;
- 768px;
- 390px;
- 320px;
- dark mode;
- no-JS where relevant.

Improve where materially useful:

- line length;
- heading hierarchy;
- card density;
- table overflow;
- mobile nav;
- focus styles;
- details/disclosure usability;
- evidence tables;
- math overflow;
- source notes;
- footer density;
- source-status badges.

Avoid decorative complexity that makes scientific reading harder.

## Visual identity

Keep a restrained research aesthetic.

Optional improvement:

- one consistent RRG diagram language;
- one social/share image;
- stronger typographic distinction between:
  - observed result;
  - RRG interpretation;
  - open conjecture;
  - constraint.

Do not use flashy pseudo-scientific graphics.

---

# 17. Replace raw internal IDs in normal reader UI

Internal IDs are useful for provenance but poor primary labels.

Examples:

```text
UT-D01
UT-E119
BIB-0082
DOC-BACKGROUND
```

In normal reader-facing UI, prefer:

```text
Geometry — definition
Random-light interactions — evidence case
Controlling dispersion forces... — source
Recursive background companion — document
```

Put stable IDs in:

- details;
- anchors;
- citation copy;
- technical metadata.

This improves readability without losing provenance.

---

# 18. Add one clear status vocabulary across the site

Avoid a mixture of:

```text
research draft
proposal
current
accepted
published
bounded High accepted
source-reported
external-supported
open
unproved
```

all appearing without hierarchy.

## Reader-facing vocabulary

Prefer:

### Scientific status
- Definition
- Evidence case
- Open hypothesis
- Constraint / comparator
- Mathematical illustration
- Open question

### Publication status
- Current research draft
- Historical
- Superseded
- Withdrawn

### Source fidelity
Keep technical:

- Reviewed against source
- Review required

Internal workflow terms such as:

```text
bounded separate High acceptance
M6
M7
fingerprint
```

should normally stay out of the reader-facing website.

---

# 19. Human comprehension review should drive the last editorial changes

After the rework, run a tiny real-reader check.

Use people who did not build RRG.

Ask after homepage + Start:

1. What is the main idea?
2. What is the role of geometry?
3. What is the role of activity/modes?
4. What makes the idea recursive?
5. Is replication required?
6. Are the four forces already derived?
7. What evidence exists?
8. What is still missing?

If multiple readers misunderstand the same thing, fix the public explanation.

Do not change scientific source meaning merely to satisfy preference.

---

# 20. Accessibility

Do one real screen-reader spot check after the IA/rework is stable.

Pages:

- homepage;
- Start;
- Evidence;
- one math-heavy technical page.

Check:

- heading structure;
- nav;
- link names;
- diagrams;
- equations/MathML;
- details controls;
- table navigation;
- focus.

Do not claim this passed until a real assistive-tech session occurs.

---

# 21. Original-package provenance

This remains a real long-term quality gap.

Choose a durable policy:

## Public exact release asset
If authorized, preserve exact audited v0.2.1 bundle as immutable release asset.

or

## Private durable archive
Preserve exact bundle in multiple owner-controlled locations and publish:

- SHA-256;
- filename;
- date;
- relationship to adapted CURRENT;
- statement that exact internal archive is not mirrored publicly.

Do not reconstruct or silently alter the original.

---

# 22. What not to change

Do not rework these merely for aesthetics:

- `00_LOCKED_CORE.md`;
- exact audited 04/05/06/07/08 bytes;
- archived predecessor source bytes;
- historical receipts;
- old URLs in old receipts;
- old repository names in historical evidence;
- standard license legal texts;
- current 22-case audited catalogue membership.

If a scientific source genuinely needs revision, use normal versioned source change control separately.

---

# 23. Implementation approach

## Phase 1 — IA + content design

Before coding, produce a concise proposed site map:

```text
Home
Start
Concepts
Evidence
Research
Documents
Search

Secondary:
Articles
Sources
Cite
About
Rights
Contribute
```

List:

- routes preserved;
- routes demoted;
- redirects/compatibility;
- pages substantially rewritten;
- pages unchanged.

Then implement.

## Phase 2 — core reader pages

Rework as one coherent batch:

- Home;
- Start;
- Concepts;
- Evidence;
- Research overview;
- navigation.

## Phase 3 — technical/support pages

- Documents;
- Sources/References;
- Cite;
- About;
- Contribute;
- Rights presentation.

## Phase 4 — status/provenance corrections

- SOURCE_AUTHORITY timeless website boundary;
- CONTRIBUTING current deployment reality;
- discoverability policy;
- metadata consistency;
- exact current repository/base URL.

## Phase 5 — review / accessibility / release

- source-fidelity affected reviews;
- focused tests;
- human comprehension;
- accessibility spot check;
- manual owner-controlled release.

---

# 24. Verification strategy

Rework is allowed, but do not replace quality with uncontrolled churn.

Run focused checks during implementation.

At the stable candidate:

```sh
npm ci
npm run check
npm run check:sources -- --scope current
npm run test:content
npm run verify:ci
```

Run affected content checks for all rewritten entries.

Then targeted browser tests for:

```text
/
start/
concepts/
evidence/
research-status/
documents/
references/
cite/
about/
search/
404
```

At minimum test:

- desktop;
- mobile;
- keyboard;
- no-JS core navigation;
- dark/light;
- long tables;
- math.

Do not blindly accept changed website-review fingerprints.

Compare each materially changed public representation to its source/declared derived scope.

---

# 25. Acceptance criteria for a 9.5–10/10 first public edition

## Within 30 seconds

A new reader can answer:

```text
What is RRG?
Why is it different from “things resonate”?
Is it proven?
Where can I start?
```

## Within 5 minutes

A reader can explain:

```text
geometry/organization
mode/activity
persistent whole
whole as effective unit
changed conditions/background
further organization
```

and knows that this is a proposal, not a universal established law.

## Evidence

A reader can distinguish:

```text
experiment
simulation
theory
component
partial bridge
constraint
analogy
open extension
```

without reading an internal schema.

## Research

A technical reader can identify:

- strongest existing local connections;
- missing causal chain;
- open quantitative questions;
- failure conditions;
- contribution opportunities.

## Provenance

A reviewer can trace:

```text
public explanation
-> claim/evidence record
-> source document
-> external source
-> verification/read-depth note
```

## UX

- primary nav is understandable;
- no stale pre-release wording;
- no unnecessary internal IDs dominating pages;
- no contradictory status;
- mobile and keyboard paths work;
- technical details remain available without overwhelming beginners.

---

# 26. Final instruction to Codex

Do not merely “apply fixes from a checklist.”

Use engineering/editorial judgment.

If a current public page is technically valid but confusing, **rework it**.

If two pages repeat the same job, **merge/demote them**.

If navigation exposes implementation structure instead of reader needs, **redesign it**.

If a technical detail belongs behind disclosure or on a technical page, **move it**.

If a source limitation is repeated five times and obscures the positive result, **state the precise limitation once in the right place**.

If an explanation is generic and misses what is distinctive about RRG, **rewrite it faithfully**.

But never improve apparent clarity by changing the underlying scientific meaning or turning an open hypothesis into established evidence.

---

# 27. Expected Codex report

Return:

```markdown
# RRG public rework result

## Before
Main reader/IA problems found.

## Reworked
- Home
- Navigation
- Start
- Concepts
- Evidence
- Research
- Documents
- Supporting pages

## Preserved
Scientific source/provenance/history that intentionally remained unchanged.

## Major design choices
Why each substantial rework is better for readers.

## Source-fidelity review
Affected records and actual review outcomes.

## Verification
Commands/tests run with pass/fail.

## Human review
Performed / not yet performed.

## Accessibility review
Performed / not yet performed.

## Remaining owner decisions
- search discoverability, if unresolved;
- code license, if open-source software reuse is desired;
- custom domain/DNS later.

## Deployment
Whether the accepted candidate was deployed and exact URL/commit.
```

Do not declare 10/10 because tests pass. Report remaining limits honestly.
