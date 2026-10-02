# Requested M1 quality recheck — 2 October 2026

New repairs are REVIEW_READY, unaccepted. Baseline main HEAD:
`b023b173ee8d5587dfbc8c6df15db589fd9be1e3`; initially clean, no remote.
Revision 4 §§0.15–0.17 remain the only forward plan. This implementing recheck
does not accept either its own repairs or the preceding contract batch.
Earlier independently accepted ENG-03 scope remains as recorded in §0.16.

## Findings and resulting behavior

| ID | Demonstrated gap | Repair |
| --- | --- | --- |
| WF-01 | Full-current coverage blocked reviewed selections with unrelated pending drafts; selection trusted a mutable qualification report. | Derive selected qualification from exact selected IDs plus dependency closure and validated hashed receipts; keep full-current M1 coverage separately. Update build/audit/layout/release-verification callers together. |
| WF-02 | The active loader and production identity still depended on the deferred scientific registry. | Remove historical registry loading and identity coupling; preserve all bytes, decisions and evidence. |
| WF-03 | Loose JSON validation admitted incomplete stale snapshots and generic malformed-value failures; review dates could predate material. | Strict decision/snapshot/check schemas, duplicate-input and date checks, typed unsafe/symlink evidence failures, genuine old snapshots remain stale. |
| WF-04 | Receipts omitted rendered plain language/HOME status projection; requests aliased live entry objects. | Capture the real rendered surfaces at both bases and detach snapshots. Withdrawn surfaces use the shared tombstone. Review badges stay outside the snapshot to prevent circularity. |
| WF-05 | CLI counted an old accepted outcome as a current accepted review after inputs changed. | Report current accepted/pending/stale/rejected states; demonstrate through the real CLI before and after display change. |

## Verification and evidence

Final complete affected command:

```sh
npm run verify -- --output-root dist/m1-website-fidelity-recheck-final --evidence-dir docs/evidence/m1/website-fidelity-recheck
```

All eleven commands exit 0. Astro reports zero errors/warnings/hints.
74 contract tests pass. Chromium passes seven checks at `/` and seven at
`/unity-theory/`, with zero skips/flakes/unexpected results. Reached checks include
the real loader, hashed receipt validation, selection, build, emitted-output audit,
mobile/no-JS/keyboard/MathML/table scrolling/axe/dark-mode/404 behavior.

The isolated loader roundtrip creates actual synthetic hashed decisions; it
does not force qualification flags or create approvals for project science.
A reviewed source-bound fixture selection qualifies while 33 unrelated drafts
remain pending. Changing the preserved scientific registry to malformed data
does not change website loading, review fingerprint or production identity.
Synthetic intake, forced report flags and tampered decision bytes still refuse.
The real content CLI changes from 1 accepted/33 pending to
0 accepted/33 pending/1 stale after a fixture display change.

`check-final.ts` and `final-checks.json` independently recheck the final evidence,
both artifact hashes after browser tests, actual qualification/release build and
release-verification refusal (exit 1, CURRENT_SOURCE_NOT_QUALIFIED, no output),
five background consumers/E10 locality and six retained output trees.
These are fresh engineering diagnostics, not scientific review or acceptance.

| Base | Final artifact SHA-256 | Files / HTML |
| --- | --- | --- |
| `/` | `03e842021cb7a6d464f7786d530e6e279d91cd7f05e64cdc6d0ea36419f42a04` | 101 / 37 |
| `/unity-theory/` | `f411fc7021582a051f421cc395168e33e320af70ca97a433b9bacce121d159bc` | 101 / 37 |

Production inputs:
`9780e0502f92a900d1debff7ee6fc0d66a282cd7d3dc8dbdd62c70851e40095d`.
The fresh final mobile home screenshot was inspected for existing readability
and labels; no visual acceptance is inferred.

## Attempts and limits

`verification-sandbox-attempt.log` records the first attempt's tsx IPC EPERM
before the runner could execute checks. The subsequent approved execution passed
the complete 74/14 suite. Its reports/logs are retained with
`pre-report-repair-` prefixes and its output trees remain intact. WF-05 then
changed the CLI input identity; the final complete verification follows that
repair and is the qualifying engineering evidence for this implementation.
Browser captures/reports without that prefix describe the final batch.

Actual registry remains empty: 34 pending website fidelity decisions,
currentSourceQualified=false. Nineteen old scientific decisions are preserved;
their historical 19 accepted/15 pending representation accounting grants no
website acceptance. No scientific source authoring, certification, reproduction
or SF-01–06/paper adjudication occurred. Original documents, ZIPs, history,
handoff snapshot, Rider files, metadata, lockfile and prior evidence are preserved
by the baseline/seal checks. No public target, remote, push, publication,
deployment, DNS operation or license grant is authorized or performed.

Assistive-technology and human comprehension studies remain unperformed.
Later reader-journey, framework/math/download, identity/rights and publication
milestones remain subject to their existing plan gates; 74/14 checks do not
establish overall website completion or a numerical quality grade.

## Next handoff

Separately review §§0.16–0.17 against the actual loader → receipt validation →
selection → build/audit/output path. Independently read all 34 reached M1
representations and relevant original RRG_CURRENT passages before creating
website fidelity decisions. Preserve terminology, meaning, assumptions,
hypotheses, reported evidence/status, open questions and attribution.
Do not copy requested fingerprints into approvals or resume deferred scientific
review. Stop any new repairs REVIEW_READY for another separate acceptance.
M1 remains REVIEW_READY and M2 NOT_STARTED until required acceptance.
