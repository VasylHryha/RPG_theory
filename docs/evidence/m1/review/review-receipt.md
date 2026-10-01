# Independent M1 review — 1 October 2026

**ACCEPTED: demonstrated M1 private engineering and bounded source extraction/
display fidelity. Full M1 actual-content qualification remains open; M1 stays
REVIEW_READY for the remaining scientific scope. M0 engineering remains ACCEPTED;
M2 remains NOT_STARTED.** This is the separately launched review authorized by
the user, under AGENTS.md, sole Revision 4 §§0.7, 8/M1 and 9. It does not accept
scientific support, authorial/publication approval or public release.

Read both M1 implementation/recheck receipts and the M0 review receipt; inspected
all thirteen actual current sources, record/document/source/citation sidecars,
declared dependencies, digest/review/revision/selection owners and actual collection,
Astro page/layout/shared renderer/output-audit consumers. Source observations and
the precise representation acceptance limits are in `source-readout.md`.
No Git repository, HEAD or remote exists. `baseline.json`, exact predecessor files
in `prior-code/`, `task-diff.patch` and `task-files.json` identify local task ownership.

Before repairs, independently ran the production output auditor on both retained
`dist/m1-recheck/preview-{root,subpath}` artifacts. Their actual 101-file inventories
and current production/source/publication identities matched the recheck receipt:
root `efc4d78da388e580f876c1729e60162edc9978a3f7202bae6b429d73d3ea15bb`,
subpath `986a6738963e88718dd97c612956aa66e36b07c6bf79b8edfdb41d29978ae252`.
See `baseline-audit/`. After repairs those artifacts are retained evidence of their
original identities; the current input fingerprint is intentionally different.

## Material findings and connected repairs

- **Declared semantic dependencies were incomplete.** E01–09 extracted the right
  text, but their dependency lists omitted core clauses explicitly stated in the
  actual 08 excerpts. For example E01 named variation/scale/recursion without
  tracking D07/D05/D08; E03 omitted stability. All nine records now declare every
  source-named clause, mapped through the actual core section order, and advance
  their derivative revisions. `pre-repair-findings.json` preserves the findings.
- **The real start page missed its interaction-evidence dependency.** Its prose
  discusses lower-level organization enabling effective interaction and the
  source evidence, but changes to 07 or its bibliography did not reach DOC-START.
  Revision 2 tracks E10–12, current status and the interaction source. Actual
  affected reporting and support-metadata mutation now reach its fingerprint.
- **Rendering fingerprint coverage omitted transitive inputs.** Changes to URL
  policy, selection/tombstone policy, styles or pinned rendering dependencies could
  retain old review fingerprints. The fingerprint now binds the shared transitive
  implementation, Astro configuration, CSS and sole lockfile as well as the
  actual Astro consumers. A temporary copied-root control mutates real URL,
  selection, CSS and lock files and proves invalidation. Unrelated bibliography
  locality remains passing. Conservative presentation invalidation is deliberate;
  no review is written automatically.
- **The core proof gate accepted an invented “exact statement.”** It checked only
  a nonempty field. It now requires the quoted text to occur in the hash-verified
  preserved predecessor core; whitespace-only required transaction fields fail.
  The actual CLI is exercised on isolated coherent temporary editions: category
  relabelling cannot skip the proof gate, an absent quote fails, and a valid quote
  with complete synthetic fields reports pending dependants. The helper checks
  engineering structure and provenance, not the scientific truth of a
  counterexample or author approval. The valid synthetic case is not science.

The complete batch preceded verification. Current scientific source bytes,
excerpts, short explanations, citation identities and evidence states are unchanged.
Necessary derivative sidecar changes preserve exact prior bytes. No scientific
authoring transaction, numerical execution, baseline reset or approval occurred.

## Reached checks and final artifacts

```sh
npm run verify -- --output-root dist/m1-review --evidence-dir docs/evidence/m1/review
node --import tsx docs/evidence/m1/review/review-controls.ts
node --import tsx docs/evidence/m1/review/final-seal.ts
```

All eleven verification commands exit 0, zero Astro errors/warnings/hints,
**59 contract tests and 14 Chromium tests PASS**, at both `/` and `/unity-theory/`.
`verification.json` and `verification-approved.log` name actual reached commands
and tests. The three new focused tests verify source-named clauses, real start
support dependencies and real rendering-input invalidation; the existing core
transaction and actual revision CLI controls were extended. Full 02/03 rendering,
M2 writing and later search/feed/export/release consumers are not claimed.

Production negative controls reach raw core/package membership/binding integrity,
legacy and authority-note misuse, independent statement overrides, IDs/types,
source-scoped citation identity/collisions, cycles, relevant and unrelated review
invalidation, rejected/stale/missing reviews, dates, draft dependencies, scoped
rights, proposals/non-adoption, historical corrections/withdrawal, unsafe
Markdown/directives/math/URLs, exact source revision snapshots/proof gate, route
ownership and artifact/source/content/status/bibliography/navigation identity.
The isolated actual home/start withdrawal build and output audit remain reached.
These are engineering controls; no synthetic fixture enters the actual scientific
registries or authorizes release.

`cli-and-output-controls.json` additionally records both actual qualification and
release CLI refusals: **CURRENT_SOURCE_NOT_QUALIFIED, exit 1, no output directory**.
Their logs are `qualification-refusal.log` and `release-refusal.log`. Twelve
controls mutate copies of the actual fresh root/subpath output: false paper
destination, fabricated accepted review, false home completion, incorrect
navigation, omitted evidence dependency and preview relabelled qualification.
Every mutation reaches its intended production diagnostic. Controls touch no
retained artifact or live source. Actual affected reports are in the same receipt.

Browser evidence covers private source text/status/citations without JavaScript,
keyboard/skip-link/navigation, MathML and fonts, focusable local formula/table
scrolling, applicable axe checks, 320px reflow, dark home, real 404 recovery,
bibliography and source disclosure. Representative actual screenshots inspected:
root definition, expanded E01 source details/dependencies, mobile home, full
literature/status, and subpath mobile proof matrix. Screenshot and automated
coverage are bounded; no human comprehension or assistive-technology certification
is implied. Node 24.18.0, npm 11.16.0, Astro 7.3.5, TypeScript 6.0.3, KaTeX 0.18.10
and Playwright 1.63.0 match the installed local package inventory and unchanged
lock. `installed-packages.json` records actual top-level versions.

| Exact current private preview | Inventory SHA-256 | Files / HTML routes |
|---|---|---|
| dist/m1-review/preview-root | 9317f01611d5b3373faf8b3b0daea24d70435b44cd3200996e56d0c507df03ac | 101 / 37 |
| dist/m1-review/preview-subpath | c1933ebad61ee2c7f721323ee5f42912ee0043af7855e2f87c58f13f03f346ba | 101 / 37 |

Logical publication manifest:
`3a253439f7038686f4e49bcb2c139cc6967463084623376a958286e1021b5e8b`.
Production inputs:
`cfcdfebe0a3ac06726bfd0f39b5c141f3b9ddb3c1360a095ed69b2f70222bcee`.
Sole lock:
`d0a844ecc45d3859929f27e610cd57487cb224365150a88f7ce52138160e44bd`.
Configs retain reserved `https://unity-theory.invalid`, both bases, repository
null and public authorization false. Every artifact is non-deployable.
No artifact has been scientifically qualified or prepared for deployment.

One initial pre-repair root audit failed because sandbox tsx could not create its
IPC pipe (`listen EPERM` at the local temporary socket); approved execution passed
at both bases. This is an infrastructure failure, not scientific or technical
test evidence. No assertion failure occurred in the consolidated repair batch.
Earlier implementation/recheck failures remain untouched in their original folders.

## Preservation and separate gates

`final-integrity.json` checks **2604 pre-review paths: 2597 unchanged, seven
task-owned changes with byte-exact predecessor snapshots**. It also checks all
four retained/fresh artifacts against the audits and confirms current inputs
still match the fresh builds after browser/control/visual inspection. The new
focused test is recorded separately. Supplied ZIPs, current/history/notice/handoff
bytes, Rider/editor files, old receipts/screenshots/artifacts and unrelated work
are preserved. `archive-parity.json` freshly compares all thirteen current files
with their raw supplied ZIP members.

Core remains `b6d3e7c75285889afe94cabf083ba5fb80f401c656613ba6a80d2f0149b655e1`;
manifest remains `c96a7387d0c24911ff671babb61c4b34255e8f50de17e3ce5f26516e554682b7`;
current seal remains `25d4e1e9476da06972bd30245ea4d6abe6be0a0e9bc56aaa0ae9e09179a6386a`.

| Gate | Exact decision / next requirement |
|---|---|
| M1 engineering | ACCEPTED for the real private source-bound producer/consumer/artifact slice demonstrated here; no known remaining blocker within that scope |
| Bounded extraction/display fidelity | ACCEPTED only as described in source-readout.md; this is not corpus scientific qualification or an accepted record-review registry |
| Scientific/support/exact-content qualification | PENDING: claim-level paper support and alternate-version assessment remain unperformed here; current admission and all exact scientific entry reviews remain pending |
| Source science outside the M1 rendered slice | Full world/framework/math publication and source-format/candidate-model issues remain unaccepted, in their owning scopes |
| Authorial approval | NOT_SUPPLIED: first-public introduction/core meaning, credit and identity remain owner gates |
| Rights/privacy | NOT_SUPPLIED: no scoped license grant or public-source privacy approval |
| Public target/authorization | NOT_SUPPLIED: no authorized real repository/origin/hosting target |
| Product/accessibility | Bounded rendered/no-JS/keyboard/reflow/axe evidence only; human comprehension NOT_TESTED, other engines and assistive technology NOT_RUN |
| Whole-site/hosting/release | Later milestones NOT_STARTED; live CI/protection/hosting/deployment NOT_RUN |

`reviews.yaml` and `execution-evidence.yaml` remain empty;
`config/research-source.json` retains `contentReview: pending`;
`currentSourceQualified: false`. `review-request-fingerprints.json` is a pending
identity report, with no accepted outcomes. No fingerprints were copied into
approvals. Bibliographic raw metadata evidence was checked for unchanged identities
and production reconciliation, without a fresh live or full-paper support audit.
No publication, push, remote configuration, license, deployment or DNS action.

## Exact next handoff

```text
Work in /Users/new/RiderProjects/RPG_theory. Use AGENTS.md and the sole Revision 4
plan docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md, especially §0.8,
§3.1a, M1 in §8 and §9. Read docs/evidence/m1/review/review-receipt.md and
source-readout.md plus the retained implementation/recheck receipts.

M0 engineering is ACCEPTED. M1 engineering and the bounded extraction/display
fidelity in §0.8 are ACCEPTED; full M1 actual-content qualification is still open.
M1 remains REVIEW_READY for that scope. M2 is NOT_STARTED; do not start it yet.
Current sources and excerpts are byte-verified; currentSourceQualified is false;
scientific review/execution registries are empty; qualification/release refuse.

Complete remaining M1 scientific/support/exact-content review only. Read actual
affected statements, explanations, status, assumptions, citation support and
alternate versions. Distinguish supplied source-reported inspections, hashed
metadata and your own primary-source reads. Scope any acceptance to actual support
and preserve abstract-only/access limits. Do not copy fingerprint reports into
approvals or mark admission qualified merely because engineering passed.
Record authorial, rights/privacy, identity/public-target gates separately.
If a source scientific issue is found during review, report/withhold the affected
scope; any authorized authoring revision must follow plan §0.3/§4.5 with exact
prior bytes and coordinated source/dependent updates. LOCKED naming creates no
extra permission flow. Preserve sources/ZIPs/history/handoff/Rider/prior evidence,
artifacts and unrelated work. Update the same plan with demonstrated scope and
remaining blockers. No M2, publish, push, remote, license, deployment or DNS work.
```
