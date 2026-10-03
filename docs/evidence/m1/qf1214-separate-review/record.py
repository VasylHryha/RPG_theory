import json
from pathlib import Path

folder=Path('docs/evidence/m1/qf1214-separate-review')
d=json.loads((folder/'final-checks.json').read_text())
assert d['status']=='PASS' and d['m1']=='ACCEPTED'
root,sub=d['artifacts']
inputs=d['productionInputs']['inputsSha256']
renderer=d['renderer']
receipt=f'''# Separate M1 QF-12–14 acceptance review — 3 October 2026

**Decision: unchanged QF-12–14 ACCEPTED for the demonstrated static resource audit scope. M1 ACCEPTED; M2 NOT_STARTED.** This fresh review started at clean main `{d['reviewedHead']}`, no remotes. No production or test repair was needed. Acceptance concerns the previously implemented controls; it does not establish exhaustive CSS/browser safety, arbitrary additional text or CSS visibility parity, scientific truth, human comprehension, authorial/rights approval or release qualification.

Read AGENTS and sole Revision 4 §§0.15–0.23, preceding receipts, code and the two-commit production/test diff. Original RRG_CURRENT remains authoritative; SF-01–06 and supplementary-paper adjudication stay deferred.

## Actual owners and caller path

`src/lib/source-admission.ts` → `loadCanonicalCorpus`/`validateCorpus` → `validateWebsiteReviews`/`qualifyWebsiteCorpus` → `publicationFor` → `scripts/build.ts`/`scripts/audit-output.ts`. Byte admission and exact hashed detached website decisions remain separate. The auditor recomputes current production inputs, admission and selected manifest before inspecting resources. The preserved scientific registry is excluded from active loading.

QF-12's `auditSVGStyles` inspects all ten selected presentation attributes in inline and standalone SVG, using `auditCSS` → `cssResourceURLs` → `targetOf`. XML base rebasing refuses. Local fragments and cursors pass. Fresh browser probes demonstrate remote fill/cursor requests; no filter-fetch claim is added.

QF-13's shared `scripts/css-resources.ts` preserves string/comment/escape boundaries, including literal comment-like URL bytes. Actual URL tokens reach local-resource and exact installed-font validation. Closed supported functions/at-rules refuse unknown loading syntax, encoding directives and malformed closure. Faithfully decoded installed WOFF2 data passes; forged data cannot normalize into installed font bytes. File CSS, inline styles and SVG attributes share this owner. This is the supported static subset, not a general CSS parser.

QF-14's standalone SVG raw-input guard refuses remote/local stylesheet and unknown processing instructions while retaining the XML declaration. Fresh Chromium independently reproduces the stylesheet request, intercepted locally.

## Fresh evidence and preservation

Independently checked 55 latest seal entries and 53 unchanged preceding seal entries; preserved snapshots cover the previously changed task files. All thirteen current source files match the supplied ZIP. All 20 installed KaTeX WOFF2 files match predecessor raw hashes.

The production loader recomputed all 34 current fingerprints and issued receipt hashes. Complete `websiteReviewInputs` match separately accepted detached own-read snapshots, including source/dependency identities, body/plain-language hashes and HOME projection at both bases. **34 accepted / 0 pending / 0 stale / 0 rejected; currentSourceQualified=true.** Existing decisions are reused unchanged; no new fidelity decision or scientific approval was issued. All entries remain drafts.

Fresh `npm run verify -- --output-root dist/m1-qf1214-separate-review --evidence-dir docs/evidence/m1/qf1214-separate-review` passed **eleven commands, zero Astro errors/warnings/hints, 82 distinct contract cases and 14 Chromium checks**, seven per base with zero skips/flakes/failures. The case-name set matches the predecessor exactly. This is a fresh complete run.

Independent actual-artifact copies add **80 intended-control refusals and 20 positives** across `/` and `/unity-theory/`, each preceded by an untouched currently bound copy passing. Controls cover SVG attributes/rebasing/instructions, quoted/unquoted forged fonts and literal paths, escaped quotes/protocols, nested fallback loads, import/unknown/encoding/malformed syntax, inert strings, local URLs/comment trivia/string continuation, exact and faithfully escaped installed fonts, gradients, fragments and XML declarations.

Six fresh Chromium semantics checks reproduce two literal/escaped 404 paths, inert content text without a load, stylesheet-instruction loading and SVG fill/cursor requests. Remote.invalid requests are intercepted/fulfilled locally. Sandbox IPC/listener failures and a diagnostic hover timeout remain preserved. The pointer diagnostic was corrected to move within the parent SVG; its pre-fix code/log remain. An initial receipt-summary missing-key failure is recorded in `finalization-attempt.json`; only evidence schema was corrected. No production/test repair followed verification.

Post-browser audits match both fresh inventories: **101 files / 37 HTML, deployEligible=false** each. Every one of the 100 non-build-info files per base is identical to reviewed predecessor output. Twenty retained artifact trees rehash unchanged. Actual qualification/release CLI each refuses `CURRENT_SOURCE_NOT_QUALIFIED`, exit 1/no output, for the empty published selection. Public target, authorization, rights and full release pipeline remain separate guards.

| Identity | SHA-256 |
|---|---|
| Reviewed HEAD | `{d['reviewedHead']}` |
| Production inputs | `{inputs}` |
| Representation policy | `{renderer}` |
| Root artifact | `{root['artifactSha256']}` |
| Subpath artifact | `{sub['artifactSha256']}` |

Machine evidence: `baseline.json`, `installed-font-integrity.json`, `independent-engineering.json`, `browser-semantics.json`, `verification.json`, `final-checks.json`, `final-integrity.json`. Exact prior plan, raw logs and failed attempts are preserved here; evidence never enters public output. The final seal verifies all preexisting tracked bytes except the deliberately updated plan and preserves §§0.4–0.23 byte-for-byte. Sources, ZIPs, history/handoff/Rider, lockfile, renderer, metadata, dependencies, historical scientific registry and issued fidelity receipts remain unchanged.

## Next already-defined milestone

No demonstrated M1 gate remains open. Stop this separate review at its M1 receipt. A subsequent authorized implementation session may start **M2 — Complete understandable introduction and example journey**, following Revision 4 §8 and source-first §§0.15–0.17. Complete home/start, source-faithful examples/concepts, responsive styles and two beginner diagrams as one coherent batch; then affected verification and REVIEW_READY for separate acceptance.

M2–M7, public introduction authorial approval, human/assistive-technology/live studies, identity/rights/privacy, authorized public target and complete release qualification remain future gates. Historical science 19 accepted/15 pending stays deferred. No remote, push, public repository, publishing, license grant, deployment or DNS action occurred. Local task-owned commit remains authorized.
'''
(folder/'review-receipt.md').write_text(receipt)

plan=Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md')
text=plan.read_text()
for old,new in [('updated: 2026-10-02','updated: 2026-10-03'),('status: M1_REVIEW_READY','status: M1_ACCEPTED')]:
    assert text.count(old)==1
    text=text.replace(old,new)
rows={
'Current milestone / state':'**M1 / ACCEPTED** for demonstrated private engineering and exact website fidelity; §0.24 separately accepts unchanged QF-12–14 controls; 34 accepted / 0 pending / 0 stale / 0 rejected; currentSourceQualified=true; historical science 19 accepted / 15 pending; M0 ACCEPTED; M2 NOT_STARTED',
'Last engineering acceptance':'§0.24 independently accepts unchanged QF-12–14 static resource controls; bounded QF-10/QF-11 and M0/M1/ENG-03 predecessor acceptance preserved. No blanket browser/CSS or release closure',
'Changed here':'§0.24 adds separate review evidence and acceptance receipt only; no production/test/scientific/presentation/fidelity-decision changes. M2 NOT_STARTED',
'Website/browser/a11y/live evidence':'Fresh §0.24 eleven-command PASS: 82 distinct cases/14 Chromium, 80 intended refusals/20 positives across both bases, six browser semantics checks. docs/evidence/m1/qf1214-separate-review/; failed attempts preserved; human/assistive-technology/live hosting NOT_RUN',
'Next action':'Stop this separate M1 review at §0.24. Subsequent authorized implementation session starts already-defined M2 under §8; preserve original sources, current fidelity decisions and bounded acceptances. New implementation stops REVIEW_READY; no public authorization',
}
lines=text.splitlines(keepends=True)
for field,value in rows.items():
    matches=[i for i,line in enumerate(lines) if line.startswith(f'| {field} |')]
    assert len(matches)==1
    lines[matches[0]]=f'| {field} | {value} |\n'
matches=[i for i,line in enumerate(lines) if line.startswith('| M1 |')]
assert len(matches)==1
lines[matches[0]]='| M1 | Current-source-bound records, document adapters, source registry and publication guards used by actual pages | M0 + byte-admitted RRG_CURRENT and exact website source-fidelity review | ACCEPTED — separate §0.24 acceptance completes demonstrated private scope; 34 exact fidelity decisions current; currentSourceQualified=true; private drafts; historical science deferred |\n'
text=''.join(lines)
old='§0.23 preserves bounded QF-10/QF-11 predecessor acceptance while QF-12–14 audit repairs remain REVIEW_READY/unaccepted; exact fidelity decisions stay current and unchanged.'
assert text.count(old)==1
text=text.replace(old,'§0.24 separately accepts demonstrated unchanged QF-12–14 controls, preserving bounded predecessor acceptance; M1 ACCEPTED, exact fidelity decisions current and unchanged.')
section=f'''### 0.24 Separate M1 QF-12–14 acceptance review — 3 October 2026

**Decision: unchanged QF-12–14 ACCEPTED for the demonstrated static resource audit scope; M1 ACCEPTED.** This separately launched review inspected clean main `{d['reviewedHead']}`, no remote, AGENTS, §§0.15–0.23, the actual two-commit production/test changes and source admission → exact receipt validator → selection → build → output audit. No production or test repair was needed. SVG attributes/rebasing use shared resource checks; token/string/comment/escape boundaries preserve actual URL/font data; unsupported loading syntax refuses; standalone SVG instructions refuse except XML declaration. Acceptance covers demonstrated controls, not exhaustive browser/CSS safety, arbitrary added text or CSS visibility, scientific certification, human comprehension or public release. Bounded QF-10/QF-11 and demonstrated M0/M1/ENG-03 predecessor acceptances remain preserved. M2 **NOT_STARTED**.

**Preservation and fidelity:** 55 latest seal entries and 53 unchanged preceding entries independently rehashed; all thirteen original ZIP/source members and 20 installed KaTeX WOFF2 files match. Production inputs `{inputs}` and representation policy `{renderer}` remain exact. All 34 complete detached source/read/dependency/body/plain-language/HOME snapshots, fingerprints, issued receipt hashes and registry match accepted predecessor inputs. Website states **34 accepted / 0 pending / 0 stale / 0 rejected**, currentSourceQualified=true, private drafts. No new fidelity decision or scientific authoring. Historical science **19 accepted / 15 pending**, SF-01–06/papers/readouts/access ledgers unchanged and deferred. Final seal verifies all preexisting tracked bytes except this plan; §§0.4–0.23 remain byte-identical. ZIP/history/handoff/Rider/lockfile/unrelated work preserved.

**Fresh complete verification:** all eleven commands PASS, zero Astro errors/warnings/hints, **82 distinct contract cases and 14 Chromium checks**, seven per base without skips/flakes/failures. Independent real-artifact copies add **80 intended-control refusals and 20 positives** across both bases, each after an untouched currently bound copy passes. Six fresh browser semantics checks reproduce literal/escaped 404 paths, inert string content, stylesheet-instruction loading and SVG fill/cursor requests; remote attempts intercepted/fulfilled locally. Sandbox IPC/listener refusals, corrected evidence-tool pointer-placement timeout and initial receipt-summary missing-key failure are preserved; no production/test repair. Post-browser audits match fresh inventories; all **100 non-build-info files per base are byte-identical** to reviewed predecessor output. Twenty retained artifact trees rehash unchanged. Root `{root['artifactSha256']}`; subpath `{sub['artifactSha256']}`, each 101 files/37 HTML, deployEligible=false. Actual qualification/release CLI each refuses `CURRENT_SOURCE_NOT_QUALIFIED`, exit 1/no output, for empty published selection. Evidence: `docs/evidence/m1/qf1214-separate-review/review-receipt.md`, `independent-engineering.json`, `browser-semantics.json`, `verification.json`, `final-checks.json`, `final-integrity.json`, exact prior plan and raw logs.

**Next handoff:** no demonstrated M1 gate remains open. Stop this separate review at its receipt; do not start M2 here. A subsequent authorized implementation session may start **M2 — Complete understandable introduction and example journey** under §8, using original current documents and accepted exact M1 inputs. Finish its coherent home/start/example/concept/style/diagram batch, then affected verification; new implementation stops REVIEW_READY for separate acceptance. Later M2–M7, introduction authorial approval, human/assistive-technology/live studies, identity/rights/privacy, authorized public target and complete release qualification remain future gates. No remote, push, public repository, publishing, license grant, deployment or DNS authority. Local task-owned commit authorized after checks.

'''
assert '### 0.24 ' not in text
text=text.replace('## 1. Review findings and chosen repairs',section+'## 1. Review findings and chosen repairs',1)
old=[line for line in text.splitlines() if line.startswith('**End of sole forward implementation plan.**')]
assert len(old)==1
text=text.replace(old[0],'**End of sole forward implementation plan.** Current execution and handoff are §§0.15–0.24. M1 ACCEPTED for demonstrated private engineering and exact original-source fidelity; unchanged QF-12–14 separately accepted, bounded predecessor acceptance preserved. All 34 exact website decisions remain preserved/current; currentSourceQualified=true. M2 NOT_STARTED; stop this review at §0.24, then begin already-defined M2 in a subsequent authorized implementation session. Scientific findings deferred, original sources unchanged, public authorization absent.')
plan.write_text(text)
print(json.dumps(dict(plan='M1_ACCEPTED',receipt='0.24',m2='NOT_STARTED')))
