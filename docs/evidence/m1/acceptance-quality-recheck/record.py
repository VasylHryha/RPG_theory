import json
from pathlib import Path

folder = Path('docs/evidence/m1/acceptance-quality-recheck')
checks = json.loads((folder / 'final-checks.json').read_text())
assert checks['status'] == 'PASS'
inputs = checks['productionInputs']['inputsSha256']
root, subpath = checks['artifacts']
receipt = f'''# M1 acceptance quality recheck — 2 October 2026

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
| Production inputs | {inputs} |
| Root artifact | {root['artifactSha256']} |
| Subpath artifact | {subpath['artifactSha256']} |

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
'''
(folder / 'recheck-receipt.md').write_text(receipt)

plan = Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md')
s = plan.read_text()
s = s.replace('status: M1_ACCEPTED', 'status: M1_REVIEW_READY', 1)
updates = {
'| Current milestone / state |': '| Current milestone / state | **M1 / REVIEW_READY** for new QF-10/11 output-audit repairs (§0.21), unaccepted; demonstrated predecessor acceptance preserved; website states 34 accepted / 0 pending / 0 stale / 0 rejected; currentSourceQualified=true; historical scientific registry 19 accepted / 15 pending; M0 ACCEPTED; M2 NOT_STARTED |',
'| Last engineering acceptance |': '| Last engineering acceptance | §0.20 accepts demonstrated WF-06/QF-07–08 scope and verifies QF-09; M0 and predecessor M1/ENG-03 acceptances remain intact. §0.21 identifies additional output-audit gaps and leaves their new repair unaccepted |',
'| Changed here |': '| Changed here | §0.21 repairs social/visible metadata parity and resource/CSS/redirect audit gaps. Prior receipts, all 34 exact fidelity decisions and scientific bytes remain unchanged; no scientific adjudication or M2 |',
'| Website/browser/a11y/live evidence |': '| Website/browser/a11y/live evidence | Fresh §0.21 eleven-command PASS: docs/evidence/m1/acceptance-quality-recheck/ and dist/m1-acceptance-quality-recheck/; 79 distinct contract cases, 14 Chromium checks, seven per base. Prior failures and accepted/mixed evidence preserved; assistive technology/human study/live hosting NOT_RUN |',
'| Next action |': '| Next action | Separate acceptance review of §0.21 QF-10/11 shared auditor/test repair and exact fresh evidence. Preserve unchanged §0.20 fidelity decisions; new repairs stop REVIEW_READY. M2 NOT_STARTED; no public authorization |',
'| M1 |': '| M1 | Current-source-bound records, document adapters, source registry and publication guards used by actual pages | M0 + byte-admitted RRG_CURRENT and exact website source-fidelity review | REVIEW_READY — new §0.21 audit repairs unaccepted; demonstrated §0.20 predecessor scope and all 34 current exact fidelity decisions preserved; currentSourceQualified=true; private drafts; historical science deferred |',
}
lines = s.splitlines()
for prefix, replacement in updates.items():
    indices = [i for i, line in enumerate(lines) if line.startswith(prefix)]
    assert len(indices) == 1, prefix
    lines[indices[0]] = replacement
s = '\n'.join(lines)+'\n'
section = f'''### 0.21 Owner-requested acceptance quality recheck: output-audit coverage — 2 October 2026

**Decision: new QF-10/11 engineering repairs REVIEW_READY, unaccepted.** Inspected clean main at `34c66efb177d331b3093f167d869fd42819d6591`, no remote, and the actual preceding acceptance, original contract/recheck evidence and shared production path. Seven isolated alterations to copies of accepted production output passed the old auditor: false social/visible descriptions, remote responsive/media/CSS/inline resources and refresh. QF-10 fixes unique social/record description, canonical and private-indexing parity; QF-11 extends resource/CSS inspection and blocks rebasing, redirects and active loading. Changes are confined to `scripts/audit-output.ts` and the existing `tests/content/contracts.test.ts`; no alternate validator/dependency/lockfile. Unsupported CSS loading syntax is refused; embedded data is allowed only for exact installed KaTeX WOFF2 bytes. Prior §0.20's broad no-known-blocker statement is superseded for these newly demonstrated audit gaps. No new repair is self-accepted; M0 and demonstrated predecessor acceptance remain preserved. No numerical quality grade is manufactured.

**Unchanged fidelity:** all 34 detached source/read/dependency/render comparisons, renderer identity, current fingerprints, issued receipt hashes and registry remain exact. All 100 non-build-info files per new artifact are byte-identical to §0.20 output. The auditor changes build-input identity, not representation policy identity. Website states remain **34 accepted / 0 pending / 0 stale / 0 rejected**, `currentSourceQualified=true`. No new website decision or scientific approval is issued. Original science and QF-09 attribution remain unchanged; historical science **19 accepted / 15 pending**, SF-01–06/papers/access ledgers deferred. Selected publication remains empty/draft; actual qualification/release commands refuse with exit 1/no output. No public authorization follows from source fidelity.

**Fresh evidence: PASS.** Final full verification has eleven passing commands, zero Astro diagnostics, **79 distinct tests** (prior 76 plus three groups containing 37 negative and 5 positive subcontrols) and **14 fresh Chromium checks**, seven per base, no skips/flakes/failures. All seven original bypass probes now refuse for their intended control, after first auditing an untouched current copy. Prior sandbox, TypeScript, social-title expectation and embedded-font failures are preserved and are not final passes. Production inputs `{inputs}`; root `{root['artifactSha256']}`; subpath `{subpath['artifactSha256']}`, 101 files/37 HTML each, deployEligible=false. Fourteen older artifact trees rehash unchanged; protected prior evidence and thirteen original ZIP/source members match. Plan §§0.4–0.20 remain immutable historical receipts. See `docs/evidence/m1/acceptance-quality-recheck/` for `recheck-receipt.md`, raw logs, pre/post probes, `verification.json`, `final-checks.json` and `final-integrity.json`.

**Limits/next handoff:** independently review and accept only demonstrated QF-10/11 unchanged repair scope and exact resulting inputs. New repairs again stop REVIEW_READY. The bounded CSS scanner is not a general CSS parser/browser sandbox; declared-region parity is not an exhaustive guarantee against arbitrary page additions. Human/assistive-technology comprehension, complete future release, first-public wording/identity/rights/privacy/authorized target remain untested/future gates. Stop at the separate M1 review receipt; **M2 NOT_STARTED**. Preserve all sources, decisions, artifacts and evidence; no remote/push/publication/license/deployment/DNS authority. Local task-owned commit authorized after checks.

'''
assert '### 0.21 ' not in s
s = s.replace('## 1. Review findings and chosen repairs', section+'## 1. Review findings and chosen repairs', 1)
needle = 'currentSourceQualified=true and M1 ACCEPTED for reached private scope.'
assert needle in s
s = s.replace(needle, 'currentSourceQualified=true for reached private fidelity. §0.21 leaves new output-audit repairs REVIEW_READY/unaccepted while preserving those exact decisions and demonstrated predecessor acceptance.', 1)
footer = '**End of sole forward implementation plan.**'
i = s.index(footer)
s = s[:i]+footer+' Current execution and next handoff are §§0.15–0.21. New §0.21 audit repairs are REVIEW_READY/unaccepted; demonstrated predecessor acceptance and all 34 exact website decisions remain preserved/current; currentSourceQualified=true. M2 NOT_STARTED; stop at the separate M1 review receipt. Scientific findings deferred, original sources unchanged, public authorization absent.\n'
plan.write_text(s)
print(json.dumps(dict(status='PASS',receipt=str(folder/'recheck-receipt.md'),section='0.21',newRepairs='REVIEW_READY; unaccepted')))
