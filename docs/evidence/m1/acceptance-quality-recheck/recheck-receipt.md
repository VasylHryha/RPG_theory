# M1 acceptance quality recheck — 2 October 2026

New audit repairs are **REVIEW_READY, unaccepted**. The broad no-known-blocker
statement in §0.20 is superseded for output-audit coverage by this receipt.
Demonstrated predecessor acceptance, unchanged source fidelity and the issued
34 website decisions remain preserved. M2 is NOT_STARTED. No numerical quality
grade is assigned: the evidence establishes specific controls and their limits.

Inspected clean main at 34c66efb177d331b3093f167d869fd42819d6591 with no remote.
Read AGENTS.md, the sole Revision 4 execution receipt and the separate review,
contract, prior acceptance and quality-recheck evidence. Baseline inspection
verified 82 exact task/evidence identities from the preceding acceptance seal
and recorded all 1,454 tracked files before repairs.

## Findings and coherent repairs

Seven isolated mutations of copies of the reached accepted production artifact
were admitted by the original auditor. Their altered artifact hashes are saved
in pre-repair-probes.json; original artifacts and sources were never mutated.

| Finding | Demonstrated gap | Shared production repair |
|---|---|---|
| QF-10 | False og:description and false visible UT-E01 description passed despite correct canonical body | Exact unique social title/description/URL and record lede parity; exact unique document metadata, canonical and private noindex token controls |
| QF-11 | Remote srcset, video src/poster, CSS import, inline background URL and meta refresh passed | Inspect responsive/media/SVG/form URL attributes and inline/file CSS; reject redirect/rebase/active loading paths |

The repairs reside only in scripts/audit-output.ts and the existing shared
contracts.test.ts. No alternate validator, new dependency or lockfile was added.
Ordinary external HTTPS bibliographic links remain usable. Local responsive
resources, uppercase/escaped local CSS URLs and KaTeX inline dimensions pass.
Embedded font data is admitted only when it matches exact installed KaTeX WOFF2
bytes; arbitrary data URLs and forged font data are refused. The auditor rejects
unsupported CSS imports/image loading functions, malformed URL syntax, style
elements, refresh/base/noscript and active SVG animation rather than accepting
those forms without checking them.

Three new grouped regression cases contain **37 negative and 5 positive
subcontrols**; these are not 42 additional independently numbered contract tests.
The complete suite now contains 79 distinct tests: the prior 76 plus those three
groups. Post-repair probes first establish that an untouched current copied
artifact passes, then demonstrate all seven original mutations refusing with
the intended metadata, URL, CSS or active-output code. Refusal does not depend
on stale-build identity. Exact outcomes are in post-repair-probes.json.

## Identity and unchanged scope

The actual loader → hashed website validator → publication selection → build →
output-audit owners remain shared. All 34 detached source/read/dependency/render
inputs match the independently inspected §0.20 snapshots exactly. The renderer,
current fingerprints, issued receipt hashes and registry are unchanged. No
fingerprints were copied into new approvals, and no new fidelity decisions were
issued. All 100 non-build-info files in each new artifact are byte-identical to
the corresponding accepted predecessor output. Build-info changes correctly
bind the repaired script as a production input; old artifacts remain valid
historical evidence, not artifacts audited by the current build identity.

Website states: **34 accepted / 0 pending / 0 stale / 0 rejected**;
currentSourceQualified=true for complete reached M1 coverage. The repair is in
the output auditor, outside the website representation policy/renderer identity;
this changes production inputs without invalidating those unchanged decisions.
Complete M1 coverage remains distinct from selected-entry/dependency publication
qualification. All entries remain drafts. Actual qualification/release commands
still exit 1 with CURRENT_SOURCE_NOT_QUALIFIED and create no output because the
published selection is empty. Current-source fidelity is not public permission.

Original downloaded RRG_CURRENT scientific terminology, meaning, assumptions,
hypotheses, reported evidence and open questions are unchanged. Historical
scientific accounting remains **19 accepted / 15 pending**, isolated/deferred.
SF-01–06, paper readouts and access ledgers were not resumed. QF-09's corrected
HOME/START/concept attribution and all earlier scientific-review evidence remain
unchanged. No source corrections or independent scientific truth claims occur.

## Fresh verification and preservation

Final complete command:

    npm run verify -- --output-root dist/m1-acceptance-quality-recheck --evidence-dir docs/evidence/m1/acceptance-quality-recheck

All eleven commands passed, zero Astro diagnostics, **79 contract tests and 14
fresh Chromium checks**, seven per base with zero failures, skips or flakes.
verification-complete-final.log and verification.json record this final batch.
No earlier attempt is presented as a final pass. Preserved failures are:

1. verification.log: sandbox tsx IPC EPERM, before the wrapper ran commands.
2. verification-authorized.log / first-batch-verification.json: TypeScript
   AnyNode narrowing diagnostic; later commands not run.
3. verification-final.log / second-batch-verification.json: 78/79 tests; incorrect
   introduced expectation that social titles carry the browser-title suffix.
4. verification-complete.log / third-batch-verification.json: 78/79 tests; the
   initial data-URL blanket refusal rejected Astro's packaged embedded fonts.

Both issues introduced during repair were corrected as connected batches. The
final controls distinguish real plain social titles and exact packaged font
bytes. Failed logs/receipts are preserved verbatim, including Node failure-summary
duplication; only distinct successful test rows count toward 79.

| Identity | Exact final SHA-256 |
|---|---|
| Production inputs | 03780a9af6880746e0bf012d75e97b9feadb44b14b1115dcf8efc27ca3cafa0a |
| Root artifact | e4923b7306289c7069b0f2fdb3568fa36074d406aa7aca1c90fab2b1ef34ea7c |
| Subpath artifact | 95b2fafd155204837b72b12349f68f422609108e354c8943352b61f927e71703 |

Each artifact has 101 files / 37 HTML pages and deployEligible=false. Final
post-browser audits reproduce both inventories. Fourteen retained artifact
trees, including both §0.20 outputs, rehash unchanged. final-checks.json records
the detached comparisons, refusal checks, exact artifact identities and cases.
final-integrity.json seals this task, prior evidence and protected bytes,
excluding its own hash. The three prior task-file versions are preserved under
prior/. All other baseline tracked files, supplied ZIPs, history/handoff,
Rider files, historical registry and thirteen scientific documents remain exact;
raw original ZIP-to-source parity and sole lockfile preservation are checked.
Historical plan §§0.4–0.20 remain byte-identical; §0.21 corrects the current state.

## Limits and next separate review

The new engineering batch is not accepted by its implementer. Independently
review QF-10/11, the actual audit caller, preserved bypass evidence, negative and
positive controls, fresh production identities and seals. Accept only demonstrated
unchanged scope, and stop any new repairs REVIEW_READY. Do not start M2 here.

The CSS scanner intentionally supports the reached static syntax and rejects
unsupported loading forms; it is not a general CSS parser or browser sandbox.
Parity covers declared canonical bodies, projections, record metadata/status,
bibliography and navigation, not every possible arbitrary addition to a page.
Browser tests cover the reached reading slice, not a human comprehension study,
assistive-technology study or complete future public release. The 404, references
and synthetic math routes remain engineering surfaces rather than new scientific
representations. This receipt makes no whole-site security or scientific grade.
First-public wording, identity, rights/privacy, owner target and full release
pipeline remain future gates. No remote, push, public repository, publication,
license grant, deployment or DNS action is authorized or performed.

> Continue in /Users/new/RiderProjects/RPG_theory under AGENTS.md and the sole
> Revision 4 plan, especially §§0.15–0.21. Inspect HEAD/status and preserve changes.
> Independently review this QF-10/11 audit repair, recheck-receipt.md,
> pre/post-repair-probes.json, final-checks.json and final-integrity.json. M1 is
> REVIEW_READY for new engineering repairs; demonstrated predecessor acceptance
> remains preserved. All 34 exact website decisions remain accepted and
> currentSourceQualified=true; no fidelity refresh is needed unless actual inputs
> change. Keep science deferred, original sources unchanged and M2 NOT_STARTED.
> Stop new repairs REVIEW_READY and finish the separate M1 review receipt.
> No public target, remote, push, publishing, license, deployment or DNS authority.
