# Separate M1 acceptance and requalification review — 2 October 2026

**M1 ACCEPTED for the demonstrated private engineering and website-fidelity
scope.** The separately reviewed unchanged WF-06 and QF-07–08 repair batches
are accepted. QF-09's attribution correction is verified and applied in the new
decisions. No new production, test, scientific-source or presentation repair
was necessary. M0 and demonstrated predecessor M1/ENG-03 acceptances remain
intact. M2 is NOT_STARTED; this session stops at this M1 receipt.

Baseline was the expected clean `main` at
`bbb6b19130501452447b02fcda1278e42b27c668`, with no remote. The original plan
and registry are preserved under `prior/`. The sole Revision 4 plan §0.20
records this decision. It does not certify scientific truth, accept the deferred
SF findings, grant authorial/rights approval, or authorize public publication.

## Independent engineering review

The actual production path was traced through these owners and callers:

1. `loadCanonicalCorpus()` → `validateCorpus()` in `src/lib/content.ts` reads
   the source admission, source index, sidecars, authored pages, bibliography,
   citation aliases, execution evidence and `website-reviews.yaml`. It extracts
   exact source lines after raw source/excerpt validation, expands directives,
   builds dependencies, rejects cycles and computes the bound policy identity.
   `reviews.yaml` is excluded from the active loader and production-input hash.
2. `validateWebsiteReviews()` in `src/lib/website-review.ts` verifies actual
   JSON bytes against registry SHA-256, typed receipt/entry/input/check schemas,
   identity/date agreement, duplicate IDs and inputs, safe relative evidence
   paths, regular files and symlink-free ancestors. Every current receipt must
   equal the freshly derived complete inputs. Stale receipts still require their
   own coherent direct dependency/source coverage, extraction line count/hash,
   source binding, projection presence and dates; old reads are not compared to
   changed live sources. A stale decision cannot qualify content.
3. `websiteReviewInputs()` detaches the entry snapshot, includes dependency
   digests and raw source identities, and hashes canonical body, plain-language
   display and applicable HOME projection at both bases. Review badges are
   excluded to avoid self-reference. `reviewFingerprint()` also binds source
   metadata, bibliography/primary aliases, execution identities and the complete
   pinned rendering/selection policy. Changing the validator invalidated all
   previous decisions deliberately.
4. `qualifyWebsiteCorpus()` defaults to complete current M1 coverage.
   `selectPublication()` recomputes qualification for its intended selection and
   dependency closure instead of trusting a mutable flag. For production,
   publication/update/review dates, published dependency closure, correction
   selection and scoped rights remain required. Unrelated pending drafts do not
   block an otherwise reviewed selection. Synthetic admission cannot qualify it.
5. `scripts/build.ts` derives the selection before creating output. Astro's
   `activePublication()` supplies the same immutable build selection to HOME,
   START, `CanonicalPage`, the route generator, literature and layout.
   Build-info records selected admission/manifest, exact inputs and lockfile.
6. `auditOutput()` reloads actual admission/selection, compares the manifest and
   identities, then checks every selected body, metadata, status, record details,
   HOME projection, navigation and bibliography. It enforces required/allowed
   files, both-base links/fragments/canonicals, private robots, no active content,
   safe SVG and local resources. The final inventories are SHA-256 sealed.

Acceptance is scoped to these reached private owners and controls. A historical
snapshot's old dependency/render hashes are preserved read identities, not
independently reconstructible scientific evidence merely because they have the
right shape. For these actual 34 receipts, the complete detached reads, original
bytes, preserved policy edition and actual emitted surfaces were independently
matched. This is the concrete basis for requalification.

**WF-06 accepted:** inspected all eight changed test files against the predecessor.
Historical-only, lifecycle and revision fixtures explicitly isolate empty website
registries; actual admission drives output fixtures; browser expectations use
the artifact's exact review states; label-tamper controls alter a real displayed
label. The production auditor independently checks those states against the
hashed actual decisions. These fixture changes create no content approval.

**QF-07 accepted:** inspected the validator diff, six preserved pre-repair probes,
fifteen malformed stale-snapshot controls, three unsafe existing-file controls
and the coherent-old-source positive control. Current-input equality, safe-path
and receipt-byte protections remain reached. Dates are checked against the
snapshot's own update/material/review dates, rather than the current edition.

**QF-08 accepted:** dependency controls install isolated hashed accepted receipts
and assert accepted before changing the actual citation or background dependency;
all five background consumers become stale and E10 stays unchanged. Temporary
roots discard borrowed actual decisions. Both withdrawal controls preserve the
source-bound excerpt and extraction pin, add sentinels only to authored fields,
and prove the shared tombstone removes source and authored surfaces. The real
HOME/START lifecycle build/output-audit test also passes.

**QF-09 accepted as evidence correction:** actual HOME/START link definitions and
status; HOME projects source open questions. The concept expands/links D01–03
and shows scope/dependencies. None has its own extraction-details panel or
displayed source edition. New individual attribution checks say exactly this.
Other source-bound pages show source filenames, edition, line ranges and excerpt
hashes. Original overbroad receipts remain byte-identical historical records.

## Original-source fidelity decisions

All 34 representations were independently inspected: nine definitions, two
conjectures, six open questions, twelve source-reported evidence records and five
document/intro/concept consumers. Relevant original passages were read in the
core, world explanation, status, proof matrix, interaction and additional-evidence
register, with Framework §13/§§19–24 for START. Original scientific meanings and
source-reported statuses own this comparison; primary papers were not adjudicated.

`independent-read-snapshots.json` precedes decision writing. It captures actual
source passages, detached input snapshots, both emitted bodies, plain-language
and record-detail text, links, TeX and HOME projection. All 34 complete input
records match the separately saved §0.18 reads except for the fingerprint.
Recomputing each fingerprint with the preserved predecessor renderer identity
reproduces its old value. Current identity matches the inspected current policy.
Raw excerpt bytes/extraction hashes and source TeX annotations match at both
bases. These exact comparisons justify reuse of unchanged predecessor reads;
they do not themselves approve a new fingerprint.

Fresh entry-specific rationales and all eight required comparison dimensions
were authored after inspecting that material. New fingerprints were derived
from the reviewed live corpus, never imported from request reports or historical
scientific approvals. Decisions under `decisions/` were validated through the
shared owner before writing the new registry. Each preserves its previous
receipt reference, whose SHA-256 is checked again in `final-checks.json`.
The prior registry is saved exactly; the old 34 decision files remain untouched.

Definitions retain broad relational geometry, full modes, mutual organization,
non-permanent closure, heterogeneous active parts, optional replication and
changing mechanisms. Extensions remain proposed. All six status questions and
all twelve proof-table rows survive. Evidence preserves original conditions,
limitations, authors, links and source-reported access depth. No historical
reviewer correction or support decision has been substituted for source prose.
The HOME wave remains explicitly illustrative. START does not promise universal
equations, complexity growth, novel predictions or force unification.

**Current website states: 34 accepted / 0 pending / 0 stale / 0 rejected.**
`currentSourceQualified=true` for complete reached M1 fidelity coverage. All 34
entries remain private drafts. Historical scientific accounting stays
19 accepted / 15 pending, unchanged and deferred under §0.15.

## Exact evidence, fresh checks and preservation

Before recording new decisions, `inspect.ts` independently rehashed/audited the
retained recheck outputs and reconciled actual log case names. The earlier
quality-recheck evidence proves exactly **76 distinct cases**: the affected
33-case M1 file was rerun; the other 43 retain first-batch passes. The first batch
had 74/76 passes and two withdrawal failures; Node repeats those failures in its
summary, which are not counted as new cases. All 14 fresh recheck Chromium checks
passed, seven per base, with no skips/flakes/failures. Four already-passing commands
were reused only after unchanged production/review identity comparison. There
was **no final monolithic verify pass in that earlier recheck**. Failures and mixed
receipts remain intact.

After this session's new registry, a **fresh complete**
`npm run verify -- --output-root dist/m1-separate-requalification-review --evidence-dir docs/evidence/m1/separate-requalification-review`
passed all eleven commands: zero Astro diagnostics, current/history source and
content checks, **76 contract tests and 14 Chromium checks**, seven at each base.
`verification.json` is the complete command/exit receipt. Raw test/build/browser
console output is in `verification-tests-builds.log` and `verification-subpath.log`;
the earlier Astro/source/content console was inspected interactively, while its
command exits and content report are preserved. No fabricated full raw transcript
is claimed. Post-browser audits match both inventories, and all 34 bodies/HOME
projection remain equal to the pre-decision independent reads.

The staged whitespace check excludes those two raw console logs and the literal
generated read transcript, which retain original trailing spaces/blank output
lines. All other staged files pass the normal check. The full staged check also
passes with only end-of-line/EOF whitespace checks disabled; evidence bytes were
not normalized to make a code-style check pass.

| Identity | SHA-256 |
| --- | --- |
| Prior reviewed production inputs | `298d22913fdd10e8cef84d985c218a575e1b71dffcc5333b766278d1f33a1f60` |
| New reviewed-registry production inputs | `15883c51b918dcf6c7ec3fe97a59e3d0ca8703e6b05383694f5473f371074592` |
| Root preview | `39eb4a392a31fb410cb48756fe251e2f2cb0bfa754fa5d27748c4bf4d155d65d` |
| Subpath preview | `7714a70108d4cdb7e7027d419c5a2968d6e7d263f595e1ff0e63137414cb91ee` |
| Sole lockfile, unchanged | `d0a844ecc45d3859929f27e610cd57487cb224365150a88f7ce52138160e44bd` |
| Source inventory, unchanged | `25d4e1e9476da06972bd30245ea4d6abe6be0a0e9bc56aaa0ae9e09179a6386a` |

Each new preview has 101 files / 37 HTML, `deployEligible=false` and no public
authorization. All twelve retained artifact trees rehash unchanged. Four prior
engineering/evidence seals match 293 exact edition/evidence identities; the
quality-recheck protected baseline's 1,316 files and all thirteen original ZIP
members match. The final session seal checks every baseline file except the
explicit plan/registry updates and preserves their exact prior bytes. It includes
scientific files, supplied ZIPs, histories/handoff, Rider files, original evidence,
issued decisions, production/test files and lockfile.

Fresh actual qualification and release build commands both refuse
`CURRENT_SOURCE_NOT_QUALIFIED` with exit 1 and no output because their intended
published selection is empty. Complete-corpus qualification does not publish
drafts. Separate isolated direct guards reach `PUBLIC_TARGET_REQUIRED`,
`PUBLIC_AUTHORIZATION_REQUIRED` and `RELEASE_PIPELINE_NOT_IMPLEMENTED` using the
qualified corpus. Scoped rights refusal is also reached by fresh contract tests.
Placeholder fixture targets/rights are mechanics controls only. No remote was
configured; no push, public repository, publishing, license, deployment or DNS
action occurred.

Retained mobile HOME and evidence-details images were inspected for actual
attribution/status/readability; fresh accepted-state captures remain in this
folder. No new visual approval, assistive-technology test, human comprehension
study, other-browser qualification, scientific reproduction or live-hosting
acceptance is claimed. One independent diagnostic initially rejected Node's
repeated failure-summary rows as duplicate cases; its parser was corrected to
require repeated rows to agree. This changed review evidence tooling only.

## Remaining scope and next handoff

No known blocker remains within the demonstrated M1 engineering/fidelity scope.
M2–M7 deliverables and their separate acceptance, owner first-public wording,
identity, rights/privacy, authorized public target and the full release artifact
pipeline remain future work. Complete M1 coverage is distinct from later selected
publication qualification and whole-site release readiness. SF-01–06, paper
readouts/access ledgers and historical scientific decisions stay deferred.

> Work in /Users/new/RiderProjects/RPG_theory under AGENTS.md and the sole Revision
> 4 plan, especially §§0.15–0.20. Inspect actual HEAD/status and preserve unrelated
> work. M1 engineering and all 34 current website-fidelity representations are
> accepted by this separate review; currentSourceQualified=true. Read this receipt,
> final-checks.json and final-integrity.json before relying on that acceptance.
> Preserve original source bytes, old decisions/evidence and the single production
> owners. M2 remains NOT_STARTED here. A subsequent explicitly authorized M2
> implementation session may proceed under the existing plan, using original
> downloaded documents as scientific authority; do not resume SF adjudication or
> import reviewer corrections. New repairs stop REVIEW_READY for separate
> acceptance. No remote, push, public repository, publishing, license, deployment
> or DNS authorization has been supplied.
