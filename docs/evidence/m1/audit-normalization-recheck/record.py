import json
from pathlib import Path
f=Path('docs/evidence/m1/audit-normalization-recheck');d=json.loads((f/'final-checks.json').read_text());b=json.loads((f/'baseline.json').read_text());root,sub=d['artifacts']
receipt=f'''# M1 output-audit normalization quality recheck — 2 October 2026

**Material gaps found and repaired. New QF-13/14 repairs REVIEW_READY, unaccepted.**
QF-12 remains unaccepted. Demonstrated predecessor acceptance remains scoped to
its enumerated controls; this recheck performs no separate engineering acceptance
and no new fidelity decision. M1 REVIEW_READY; M2 NOT_STARTED. No numerical grade
or whole-site quality certification is assigned.

Started on clean main at {b['head']}, no remotes. Read AGENTS.md, sole Revision 4
§§0.15–0.23 (the new receipt is appended after work), predecessor audit/code/tests,
§0.22 evidence tools and issued receipt. Independently verified all 56 latest
predecessor task/evidence seal entries and raw parity of all thirteen original
ZIP/source members before changes. Prior scientific findings remain deferred.

## Demonstrated issues and corrections

| Finding | Pre-repair production behavior | Repair |
|---|---|---|
| QF-13: lossy CSS normalization | Stripped comment-like bytes inside quoted/unquoted URL data. A modified KaTeX base64 payload normalized into an installed font and passed. Quoted comment/path and escaped-quote URL mutations also passed while the browser requested different nonexistent paths. Inert URL-like CSS text was wrongly refused. | Shared token-aware resource scanner preserves string and URL bytes, decodes escapes without destroying boundaries, balances delimiters, rejects malformed strings/comments and refuses unsupported functions/at-rules. Only genuine URL tokens reach local-resource/installed-font checks. |
| QF-14: SVG processing instructions | Standalone xml-stylesheet instruction passed the SVG element/attribute checks and loaded a remote stylesheet. | Refuse processing instructions other than the XML declaration, retaining existing DOCTYPE/element/attribute safeguards. |

`pre-repair-probes.json` records four admitted artifact mutations and one
incorrectly refused inert-string control, each after its own untouched current
copy passed. `browser-semantics.json` independently demonstrates both actual
404 paths, inert text without a remote request, and the SVG stylesheet request.
All remote.invalid attempts were intercepted and fulfilled locally; no external
host was contacted. A modified font is proven by the production admission and
exact string mismatch, not represented as a successfully decoded browser font.

This corrects §0.22's implication that exact-font comparison protected every
original CSS spelling. The set comparison was exact only after a lossy transform;
the original comment-modified payload was not exact installed bytes. Earlier
enumerated positives/negatives retain their observed results and issued receipts;
they never tested this bypass. Blanket URL/font/SVG closure remains unaccepted.
No historical receipt or failure log is overwritten or retroactively promoted.

## Coherent rework and its boundary

The shared auditor now imports `scripts/css-resources.ts`, which scans strings,
comments, escapes, URL arguments and balanced delimiters in one place. File CSS,
inline styles and QF-12's SVG presentation attributes use that same path. A
closed set of supported static functions and at-rules makes new/unsupported
loading forms refuse explicitly. Imports, image/image-set, src(), expression,
unknown functions and encoding directives do not silently become unchecked loads.
Comment-split loading keywords are conservatively refused, preserving the older
contract; comments inside URL strings remain literal data. The scanner follows
escape/string boundaries but is not a complete stylesheet/selector/value parser.
Future syntax expansion requires its own adapter/controls.

The installed KaTeX WOFF2 exception still compares exact decoded URL base64 to
installed file bytes, after faithful string decoding. Arbitrary/forged font and
non-font data remain refused. Real local URLs, gradients, escaped URL identifiers,
inline KaTeX dimensions, local SVG fragments/cursors, bibliography links and
literal URL-looking text remain supported. SVG XML declarations remain supported;
stylesheet/unknown processing instructions refuse even when their destination
is local. No new package, dependency lock, alternative root project or validator.
Only auditor/helper/existing contract tests change in production/test scope.

Two added grouped cases supply **17 negative and 7 positive subcontrols**:
CSS 14 negatives/six positives and SVG three negatives/one positive, each after
an untouched fixture prerequisite. The previous 80 case names and test bytes
remain unchanged. The cases test the real auditor and browser-backed failures,
not a helper implementation mirror or scientific fixture approval.

## Fresh checks and precise preservation

    npm run verify -- --output-root dist/m1-audit-normalization-recheck --evidence-dir docs/evidence/m1/audit-normalization-recheck

**All eleven commands PASS, zero Astro diagnostics, 82 distinct contract cases,
14 Chromium checks**, seven per base with zero skips/flakes/failures. Verification
followed the complete production/test batch; no production/test edit followed
PASS. The sandbox verification attempt failed on tsx IPC before wrapper commands;
its log is preserved. The browser diagnostic's sandbox listener EPERM is also
preserved separately. The authorized attempts are the passing evidence. Earlier
sandbox, TypeScript, social-title, font and diagnostic failures retain their
previous seals and scope. Raw logs retain their original bytes, including trailing
spaces; source/plan diff checks are separate from preserved raw-log formatting.

`post-repair-probes.json` shows all four new mutations refusing at their intended
resource/SVG control and the inert-string control passing. `final-checks.json`
repeats the seven original mutations, four QF-12 SVG mutations and four new
mutations at both bases: **30 intended-control refusals**, each after a separate
untouched currently bound artifact copy passes. Refusal does not depend on stale
build identity. Eighteen retained artifact trees rehash unchanged, using direct
inventories rather than obsolete historical auditors.

All **34 detached ownRead/source/dependency/body/plain-language/HOME-projection
inputs, fingerprints, issued receipt hashes, registry and representation policy
remain unchanged**. Website states **34 accepted / 0 pending / 0 stale / 0 rejected**;
currentSourceQualified=true. No request fingerprint is copied into an approval,
and no replacement decision is issued. All entries remain private drafts.
Original science and QF-09 HOME/START/concept attribution remain exact. Historical
scientific accounting **19 accepted / 15 pending** stays isolated and deferred;
SF-01–06, papers/readouts/access ledgers were not resumed.

| Identity | SHA-256 |
|---|---|
| Production inputs | {d['productionInputs']['inputsSha256']} |
| Representation policy | {d['renderer']} |
| Root artifact | {root['artifactSha256']} |
| Subpath artifact | {sub['artifactSha256']} |

Each artifact contains 101 files / 37 HTML pages, deployEligible=false. All **100
non-build-info files per base are byte-identical** to the inspected predecessor.
Only the build-input identity changes; content/lockfile/representation identities
do not. Thus no new look or scientific reading is substituted for the preserved
accepted output. Actual qualification/release commands still refuse with exit 1,
CURRENT_SOURCE_NOT_QUALIFIED, no output, because the published selection is empty.
No source-fidelity result supplies rights or public authorization.

`final-integrity.json` preserves all task-owned predecessors, prior plan receipts
§§0.4–0.22, tracked unrelated bytes, ZIP/history/handoff/Rider, historical registry,
lockfile, issued website decisions/evidence and retained artifacts. The recheck
adds evidence only under this evidence directory; none enters public output.

## Remaining limits and handoff

This closes the reproduced gaps in the reached static loading contract; it is
not proof of every browser syntax, arbitrary CSS effect or future public release.
DOM-region parity does not certify arbitrary added text or CSS that hides/changes
otherwise matching content. The current outputs themselves remain byte-identical
to independently reviewed predecessor output. Human comprehension, assistive
technology and live hosting remain untested; later M2–M7 and first-public wording,
identity/rights/privacy/owner target/full release pipeline remain future gates.

> Continue under AGENTS.md and sole Revision 4 §§0.15–0.23. Inspect actual
> HEAD/status/remotes and preserve changes. Independently review unaccepted
> QF-12–14 shared auditor/token scanner/SVG processing-instruction repairs,
> pre/post probes, browser-semantics.json, actual current caller path, exact
> 82-case/14-Chromium/eleven-command evidence and seals. Verify original font
> bytes against actual decoded URL semantics, supported/unsupported syntax,
> local resources/fragments and inert strings; do not infer exhaustive CSS or
> whole-site security. Preserve the 34 exact accepted fidelity decisions unless
> actual inputs change; currentSourceQualified=true, all entries private drafts,
> historical science 19 accepted/15 pending deferred. Accept only unchanged
> demonstrated scope; new repairs stop REVIEW_READY. Stop at M1 receipt; no M2,
> scientific authoring, SF/paper adjudication, remote/push/public repository,
> publishing/license/deployment/DNS authority. Local task-owned commit authorized
> after checks.
'''
(f/'recheck-receipt.md').write_text(receipt)
plan=Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md');s=plan.read_text()
updates={
'| Current milestone / state |':'| Current milestone / state | **M1 / REVIEW_READY** for unaccepted QF-12–14 audit repairs (§§0.22–0.23); bounded predecessor acceptance preserved; website states 34 accepted / 0 pending / 0 stale / 0 rejected; currentSourceQualified=true; historical science 19 accepted / 15 pending; M0 ACCEPTED; M2 NOT_STARTED |',
'| Last engineering acceptance |':'| Last engineering acceptance | §0.22 accepts enumerated unchanged QF-10/QF-11 predecessor controls. §0.23 corrects broader URL/font/SVG closure implications; QF-12–14 remain REVIEW_READY/unaccepted. Demonstrated M0/M1/ENG-03 predecessor acceptance preserved |',
'| Changed here |':'| Changed here | §0.23 reproduces lossy CSS string/URL/font normalization and SVG processing-instruction gaps; replaces normalization with shared token-aware closed-syntax checks and refuses SVG instructions. No scientific/presentation/decision changes or M2 |',
'| Website/browser/a11y/live evidence |':'| Website/browser/a11y/live evidence | Fresh §0.23 eleven-command PASS: 82 distinct cases/14 Chromium, 30 intended-control refusals across both bases; browser semantics independently reproduced. docs/evidence/m1/audit-normalization-recheck/; earlier failures preserved; human/assistive-technology/live hosting NOT_RUN |',
'| Next action |':'| Next action | Separate acceptance review of unaccepted QF-12–14 auditor/token/SVG repairs and exact §0.23 evidence. Preserve all 34 exact current fidelity decisions and bounded predecessor acceptances; new repairs stop REVIEW_READY; M2 NOT_STARTED; no public authorization |',
'| M1 |':'| M1 | Current-source-bound records, document adapters, source registry and publication guards used by actual pages | M0 + byte-admitted RRG_CURRENT and exact website source-fidelity review | REVIEW_READY — QF-12–14 unaccepted; bounded predecessor acceptance preserved; all 34 exact fidelity decisions current; currentSourceQualified=true; private drafts; historical science deferred |',
}
lines=s.splitlines()
for prefix,replacement in updates.items():
 indices=[i for i,line in enumerate(lines) if line.startswith(prefix)];assert len(indices)==1,prefix;lines[indices[0]]=replacement
s='\n'.join(lines)+'\n'
section=f'''### 0.23 Owner-requested quality recheck: CSS token semantics and SVG instructions — 2 October 2026

**Outcome: material gaps demonstrated and repaired; QF-13/14 REVIEW_READY, unaccepted.** Started on clean main at `{b['head']}`, no remote. Rechecked actual auditor/helper inputs, tests, preceding evidence tools/receipts and the real loader → exact receipt validator → selection → build → output path. QF-12 remains unaccepted; no self-acceptance or new fidelity decision. Bounded predecessor acceptance is preserved within its demonstrated enumerated controls. M1 REVIEW_READY, M2 **NOT_STARTED**. The requested quality target drives concrete checks and repairs, not an invented numerical grade.

**QF-13 — CSS token/string/URL semantics.** Current artifact copies admitted a comment-modified installed-font payload and two quoted/escaped URLs whose actual browser paths differed from the auditor's normalized target; inert URL-like CSS text was wrongly refused. Browser probes independently reproduced both 404 paths and inert text without loading. The exact-font set comparison only protected the lossy normalized value, correcting §0.22's broader original-byte implication. Shared `scripts/css-resources.ts` now preserves comment-like URL/string bytes and escape boundaries, scans actual URL tokens, checks delimiters/string/comment closure and explicitly supports a closed set of static functions/at-rules; unsupported loading syntax refuses. CSS files, inline styles and QF-12 SVG attributes use the same owner. Exact installed KaTeX WOFF2 data survives faithful decoding; arbitrary/forged fonts and data refuse. Legitimate local URLs/gradients/fragments, inert strings and existing KaTeX/bibliography behavior pass. This is bounded resource scanning, not a complete CSS parser.

**QF-14 — standalone SVG processing instructions.** A stylesheet instruction bypassed the prior element/attribute checks and Chromium attempted its remote load. All remote attempts were intercepted/fulfilled locally, with no external host contacted. The auditor now refuses processing instructions other than the XML declaration; DOCTYPE and existing SVG checks remain. This rework changes only `scripts/audit-output.ts`, its shared new helper and existing `tests/content/contracts.test.ts`, with no package/lock/source/presentation change. Two grouped cases add **17 negative and 7 positive** subcontrols after untouched prerequisites. Previous 80 case names/test bytes remain exact. All new code remains **unaccepted**.

**Fresh verification:** final eleven-command PASS, zero Astro errors/warnings/hints, **82 distinct contract tests and 14 Chromium checks**, seven per base without skips/flakes/failures. Four admitted pre-repair mutations now refuse at their intended control; the formerly refused inert string passes. Final checks repeat seven original, four QF-12 and four new mutations at both bases: **30 intended-control refusals**, each after a separate untouched current copy passes. No stale-input shortcut. Eighteen retained artifact trees rehash unchanged. The latest predecessor's 56 task/evidence seal entries and all thirteen original ZIP/source members match. New sandbox verification/listener failures and earlier TypeScript/social/font/diagnostic failures remain preserved failed attempts; no production/test edit follows PASS. Evidence: `docs/evidence/m1/audit-normalization-recheck/recheck-receipt.md`, `pre-repair-probes.json`, `post-repair-probes.json`, `browser-semantics.json`, `verification.json`, `final-checks.json`, `final-integrity.json`, raw logs and exact prior snapshots.

**Unchanged content and qualification:** all **34** detached source/read/dependency/render inputs, fingerprints, issued receipt hashes, registry and representation policy remain exact; **34 accepted / 0 pending / 0 stale / 0 rejected**, `currentSourceQualified=true`. No request fingerprints or unnecessary replacement decisions. All 100 non-build-info files per new artifact are byte-identical to the inspected predecessor. Build inputs `{d['productionInputs']['inputsSha256']}`; root `{root['artifactSha256']}`; subpath `{sub['artifactSha256']}`, each 101 files/37 HTML, deployEligible=false. Only build identity changes; content/lockfile/policy identities do not. All entries remain private drafts; actual qualification/release refuse `CURRENT_SOURCE_NOT_QUALIFIED`, exit 1/no output, for empty published selection. Original scientific bytes/meanings and QF-09 attribution remain unchanged. Historical science **19 accepted / 15 pending**, SF-01–06/papers/readouts/access ledgers isolated/deferred. ZIP/history/handoff/Rider, unrelated bytes, prior receipts §§0.4–0.22 and evidence remain preserved.

**Limits and next handoff:** separately review unaccepted QF-12–14 shared wiring, CSS string/URL semantics, installed-font identity, closed syntax refusal, SVG instructions and exact fresh/reused identities. Existing enumerated acceptance does not establish blanket URL/font/SVG closure; DOM-region parity does not prove arbitrary additional text or CSS visibility/effects. Preserve current fidelity decisions unless actual reviewed inputs change. Accept only demonstrated unchanged scope; new repairs stop REVIEW_READY. Stop at the M1 receipt, no M2. Human/assistive-technology/live-hosting studies, later website milestones, first-public wording/identity/rights/privacy/owner target/full release pipeline remain future gates. No remote/push/public repository/publishing/license/deployment/DNS authority. Local task-owned commit authorized after checks.

'''
assert '### 0.23 ' not in s;s=s.replace('## 1. Review findings and chosen repairs',section+'## 1. Review findings and chosen repairs',1)
needle='§0.22 separately accepts QF-10 and enumerated predecessor QF-11 controls; its new QF-12 SVG repair stays REVIEW_READY/unaccepted, preserving those exact decisions and demonstrated predecessor acceptance.'
assert needle in s;s=s.replace(needle,'§0.23 preserves bounded QF-10/QF-11 predecessor acceptance while QF-12–14 audit repairs remain REVIEW_READY/unaccepted; exact fidelity decisions stay current and unchanged.',1)
i=s.index('**End of sole forward implementation plan.**');s=s[:i]+'**End of sole forward implementation plan.** Current execution and handoff are §§0.15–0.23. Bounded predecessor acceptance preserved; QF-12–14 output-audit repairs REVIEW_READY/unaccepted. All 34 exact website decisions remain preserved/current; currentSourceQualified=true. M2 NOT_STARTED; stop at the separate M1 review receipt. Scientific findings deferred, original sources unchanged, public authorization absent.\n'
old=(f/'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text();assert old[old.index('### 0.4 '):old.index('## 1. ')]==s[s.index('### 0.4 '):s.index('### 0.23 ')]
plan.write_text(s);print(json.dumps(dict(status='PASS',section='0.23',repairs='REVIEW_READY; unaccepted')))
