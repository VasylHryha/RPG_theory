# M1 output-audit normalization quality recheck — 2 October 2026

**Material gaps found and repaired. New QF-13/14 repairs REVIEW_READY, unaccepted.**
QF-12 remains unaccepted. Demonstrated predecessor acceptance remains scoped to
its enumerated controls; this recheck performs no separate engineering acceptance
and no new fidelity decision. M1 REVIEW_READY; M2 NOT_STARTED. No numerical grade
or whole-site quality certification is assigned.

Started on clean main at 2d668a5b6c589b6a0bff16d128d4d1068b4b731a, no remotes. Read AGENTS.md, sole Revision 4
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
| Production inputs | 305a3f4403b68ab02f37f50cc2b90f3478b5d780c429170accee3881d7e18550 |
| Representation policy | 1b1886e3c8ab5105bf9c0667c02105cf5c47721aba15b095cb5ef914d2019805 |
| Root artifact | 8260bd3f812c6e74bd67d6b176af6da667b39a5b976a2af6d8269b78b6cdfd15 |
| Subpath artifact | a9dd28ce1b0636ddb7ed955b6a117f882e2add0d3c9ac07cf7962399bb6667bd |

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
