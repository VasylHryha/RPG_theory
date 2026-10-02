# Owner-requested quality recheck — 2 October 2026

**Material gaps found and repaired. New work is REVIEW_READY, unaccepted.**
M1 remains REVIEW_READY; M2 NOT_STARTED. This recheck does not assign a numerical
quality score or self-accept repairs. Revision 4 §0.19 records the current state.

Baseline: clean main at `2c85e17588da5352ee22c2b97f2a4b10c4f34216`, no remote.
The previous seal was verified before editing. Scientific sources, real review
registry/issued decisions, earlier evidence and supplied packages remain intact.

## Demonstrated gaps and repairs

| Finding | Before | After |
| --- | --- | --- |
| QF-07: malformed stale snapshots | Six real-validator probes admitted invalid publication dates, material dates before own updates, missing own sources/dependencies, invented bound excerpts and missing HOME projections. Such receipts remained stale and could not qualify publication, but earlier strict-validation claims were too broad. | Validate snapshot self-consistency for current and stale decisions: own dependency/source coverage; safe relative source paths; binding origin/source/excerpt hash/line span; projection presence; coherent publication/update/material/review dates. Preserve genuine old source identities as stale rather than comparing them with current bytes. |
| QF-07: unsafe path characters | Receipt path validation allowed control characters in an existing regular filename. | Reject controls, absolute/drive paths, backslashes and empty/dot/traversal components through the shared receipt owner. Existing symlink/hash checks remain. |
| QF-08: accepted→stale tests | Tests asserted only the final stale state; already-stale approvals could satisfy them. The temporary-root helper also retained real registry entries without relocating their evidence. | Start from isolated hashed accepted controls, assert accepted, mutate the real dependency and assert stale. Keep unchanged E10 locality. Drop real registry entries when creating the temporary fixture root. |
| QF-08: withdrawal fixtures | Two fixtures forged a bound source excerpt while keeping its original extraction hash. | Preserve the actual bound excerpt, use authored metadata/body sentinels, and require the shared tombstone to remove both original source text and authored surfaces. |
| QF-09: overbroad attribution receipt | Generic approval prose said source paths/edition/excerpt lines are displayed on authored HOME/START/concept pages. | Append a precise correction in `attribution-correction.json`. Those authored pages provide definition/status/dependency links; they lack their own source-bound excerpt-details panel. Issued receipts are preserved; future exact decisions must use accurate wording. |

`pre-repair-probes.json` and `probe.ts` record the six isolated production-owner
diagnostics. The original validator and affected test files are preserved under
`prior/`. Fifteen malformed-snapshot controls and three unsafe existing-file
controls are covered by two added tests; a changed-live-source positive control
proves a coherent prior source read remains stale without being rejected.
These are engineering fixtures and grant no content or scientific approval.

The implementation changes only `src/lib/website-review.ts` and four test files:
`fidelity-fixture.ts`, `m1-review.test.ts`, `website-fidelity.test.ts` and
`m1.test.ts`. The plan/evidence provide the correction and handoff. No scientific
document, sidecar content, actual registry or issued approval fingerprint changed.

## Current decisions and unchanged content

The validator is deliberately part of the bound policy/renderer identity.
Changing it makes all 34 prior accepted-outcome receipts **stale**. Current
states are **0 accepted / 0 pending / 34 stale / 0 rejected**;
`currentSourceQualified=false`. The previous decisions remain historical evidence,
with their original hashes and comparisons. No decision was refreshed or replaced.

`final-checks.json` compares each current read with the detached §0.18 snapshot.
Every ownRead, raw source/dependency identity, rendered body, rendered plain
language and HOME projection matches. Every scientific representation and
original-document byte is unchanged; the review-policy fingerprint differs.
New emitted bodies match the independently saved texts at both bases. All 34
pages visibly report stale fidelity; source-reported scientific roles/evidence
and open questions remain intact.

QF-09 corrects a claim about review coverage, without rejecting the source theory
or rewriting its explanation. The earlier broad stale-validation acceptance is
limited by QF-07's demonstrated failure. Earlier acceptances retain only their
actually demonstrated, unchanged scope. The new engineering batch and earlier
§0.18 test repairs remain subject to separate acceptance.

Historical scientific accounting remains 19 accepted / 15 pending. SF-01–06,
papers, readouts and access ledgers remain deferred. No independent science
adjudication, numerical reproduction, author approval or human comprehension
study occurred.

## Verification and exact identities

The first full affected suite passed Astro with zero diagnostics, both raw-source
checks, content validation and 74/76 test cases. Two withdrawal controls failed
because of their mismatched extraction hashes. Exact failed logs and command/
content receipts are preserved as `first-batch-*`.

After the coherent fixture correction, the whole affected 33-case M1 file passes.
The other 43 unchanged cases retain their fresh first-batch successes. The final
check reconciles actual case names from both logs and proves that **all 76 distinct
cases have current passing evidence**. Four already-passing commands are reused
with unchanged production/source/review fingerprints. No monolithic final
`npm run verify` pass is claimed.

Both new private builds/output audits and all 14 Chromium checks pass, seven
per base, with zero skips/flakes/failures. Post-browser audits match exact hashes.
Ten prior artifact trees rehash unchanged. Fresh actual qualification/release
commands each exit 1 with CURRENT_SOURCE_NOT_QUALIFIED and no created output.
All artifacts remain private and non-deployable.

| Base | Artifact SHA-256 | Files / HTML |
| --- | --- | --- |
| `/` | `dddf250be6a24eb43825726a98750b3260ee7b994f5cf622cee9f73a61ad32bd` | 101 / 37 |
| `/unity-theory/` | `7bde8aa7ea8e8bb36756ab874c4968bc4d8f96bf4ceecf0ec4fc4f6219aef0e5` | 101 / 37 |

Production inputs:
`298d22913fdd10e8cef84d985c218a575e1b71dffcc5333b766278d1f33a1f60`.
Content SHA-256 remains
`67198f50cb3ea4c93e56b36222b04d23654fa922d7f00db82c03acf4ce442268`;
the lock, core and inventory pins are unchanged.

The fresh definition screenshot was inspected for the actual stale label,
unchanged definition/equation and separated source/evidence roles. Browser
mechanics cover no-JS reading, keyboard navigation, horizontal math/table
scrolling, bounded axe/reflow, dark mode, source details, bibliography and 404s.
They do not establish human understanding, assistive-technology usability, every
page's visual quality, later milestones or public release. A score above 9/10
would need its own agreed rubric and sufficient evidence; none is manufactured.

## Preservation and next handoff

`final-integrity.json` seals the new task/evidence scope and verifies every other
tracked baseline byte, original ZIP parity, preserved prior plan receipts and
predecessor copies. Issued §0.18 decisions/seals/artifacts are preserved. One root
Astro project, one lock and one operative scientific source directory remain.
No remote, push, public repository, publishing, license grant, deployment or DNS
operation occurred. A scoped local commit is authorized after checks.

> Read AGENTS.md and the sole Revision 4 plan §§0.15–0.19. Inspect HEAD/status
> and preserve unrelated work. Separately review §§0.18–0.19 unaccepted repairs,
> the shared receipt owner, QF-07 probes/controls, accepted→stale transitions and
> source-preserving withdrawal fixtures. Verify exact fresh/reused workload and
> protected/issued bytes. Requalify the 34 unchanged representations under the
> new policy only after independent review; preserve previous receipts and use
> QF-09's precise authored-page attribution descriptions. The exact unchanged
> read/body/source comparisons can justify reuse of original fidelity reads,
> without automatically approving new fingerprints or new engineering. If no
> new repair is needed, record evidenced exact decisions and required M1
> acceptance, then stop at that review receipt. Keep M2 NOT_STARTED in that
> review; begin its implementation only in a subsequent authorized session.
> New repairs stop REVIEW_READY. Keep science adjudication deferred and
> authorial/rights/privacy/identity/target/publication gates separate.
