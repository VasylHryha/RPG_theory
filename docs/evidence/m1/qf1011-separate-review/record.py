import json
from pathlib import Path
folder=Path('docs/evidence/m1/qf1011-separate-review')
d=json.loads((folder/'final-checks.json').read_text()); baseline=json.loads((folder/'baseline.json').read_text()); a,b=d['artifacts']
receipt=f'''# Separate M1 QF-10/11 review and SVG repair — 2 October 2026

**Bounded acceptance:** unchanged QF-10 and the specifically demonstrated
QF-11 predecessor controls are ACCEPTED. Broad QF-11 SVG loading closure is
not accepted. New QF-12 repair is **REVIEW_READY, unaccepted**; current M1 stays
REVIEW_READY. Demonstrated M0/M1/ENG-03 predecessor acceptance and all 34 exact
website decisions remain intact. M2 NOT_STARTED. No numerical grade is assigned.

Inspected expected clean main at {baseline['head']}, no remote, before any work.
Read AGENTS.md, sole Revision 4 §§0.15–0.21, original website-fidelity contract,
its recheck and acceptance receipts, quality-recheck and separate requalification
receipts, and the six requested §0.21 evidence files. No subagent was launched.

## Independent review and acceptance boundary

The real owner path is loadCanonicalCorpus → validateCorpus/source admission →
validateWebsiteReviews/qualifyWebsiteCorpus → selectPublication/publicationFor →
activePublication/Astro pages → scripts/build.ts → auditOutput. Original raw
source pins and extraction membership are checked before detached decisions.
Strict hashed, regular, symlink-free receipt evidence must match the complete
current detached inputs; stale self-consistency is independent of current bytes.
Historical reviews.yaml is neither loaded nor included in production identity.
Full-current M1 coverage and selected publication/dependency coverage remain
separate. Release date, published dependency, rights and public-target gates
remain shared; a mutable qualification flag cannot publish drafts. Build identity
binds the auditor, while representation identity binds rendering/receipt policy.

QF-10's exact unique social title/description/URL, record lede, canonical and
actual noindex-token checks are independently accepted for the unchanged reached
representations. The nine original negative controls compare actual declared
surfaces and duplicates. Social titles correctly use the plain title; browser
titles carry the Unity Theory suffix. HOME/START remain authored surfaces with
the corrected QF-09 definition/status links and HOME projection; the concept
links/expands definitions and shows scope/dependencies. They acquire no invented
extraction-details panel or source-edition attribution.

QF-11's original enumerated responsive/media/href/xlink/form, CSS, redirect,
rebase and active-output controls are accepted within their demonstrated scope.
The CSS scanner normalizes comments, continuations and escapes, checks url()
loads, and refuses unsupported import/image/image-set/expression or malformed
loading syntax. Both file and inline paths are reached. The data exception is
exact base64 of installed KaTeX WOFF2 bytes, verified by the original positive
control and forged-font/data negatives, not a MIME or header-only exemption.
All installed direct package versions match the sole lockfile manifest.
Legitimate local responsive resources, escaped/uppercase CSS URLs, inline KaTeX
dimensions and external HTTPS bibliographic hyperlinks retain their accepted
behavior. Bibliography destinations remain bound to the production selection.
This accepts the pre-review implementation at production identity
{d['preReviewProductionInputs']['inputsSha256']}, not this session's new code.

## QF-12: additional SVG presentation loading gap

Current bound copies passed an untouched audit, then inline SVG filter, cursor
and fill URLs and a standalone SVG filter URL were admitted. Unlike href and
style, SVG presentation attributes were not inspected. In fresh Chromium
153.0.8010.12, cursor and fill attempted remote requests. All remote.invalid
requests were intercepted and fulfilled locally; no external host was contacted.
The filter probe produced no remote request in that browser: its admitted audit
result is not claimed as a demonstrated browser fetch. Pre-repair evidence is
independent-engineering.json and browser-loading-probes.json.

One coherent batch changes only scripts/audit-output.ts and the existing
contracts.test.ts. The shared normalized CSS checker now covers fill, stroke,
filter, clip-path, mask, cursor and marker/marker-start/marker-mid/marker-end
attributes in inline and standalone SVG. XML base rebasing is refused. No
alternate validator, new dependency, lockfile, source or presentation change.
The new grouped test has 28 negatives and two legitimate local-resource positives
(local gradient fragments, cursor resource and escaped local spelling), following
an untouched fixture prerequisite. Existing three groups remain byte-identical.
This new QF-12 repair has **no acceptance in this session**.

## Exact evidence reconciliation

Before repairs, independently rehashed six prior evidence seals: {sum(s['checked'] for s in baseline['verifiedSeals'])}
checked seal entries (overlapping editions are not unique files), including all
55 latest §0.21 task/evidence identities. Its protected pre-repair baseline's
1,451 unchanged files and thirteen original ZIP members match. Historical task
versions remain in their preserved snapshots; older code editions are not
misrepresented as current files.

Raw successful rows establish exactly **79 distinct predecessor cases**:
76 named cases from the separate §0.20 batch plus the exact three new groups.
The groups contain 9 + 14 + 14 = **37 negative** subcontrols and 1 + 4 = **5
positive** subcontrols; they are three test cases, not 42. Fourteen Chromium
checks passed, seven per base, with no skips/flakes/failures. The final §0.21
verification receipt and actual log reconcile all eleven commands and zero
Astro diagnostics. Its earlier sandbox, TypeScript AnyNode, social-title
expectation and blanket embedded-font failures remain exact failed attempts.
No later success relabels them as passing. Earlier §0.19 retains its mixed-case
reconciliation and does not become a monolithic verify pass.

Before any new repair, independent-engineering.json verifies all seven original
mutations at the intended production control after a current untouched copy
passes. Fresh final-checks.json repeats those seven plus the four new SVG probes
at both bases: 22 isolated refusals, each with its own untouched current-copy
PASS first. None depends on STALE_BUILD_INPUTS. Sixteen retained artifact trees
rehash unchanged; obsolete historical auditors are not invoked against them.

All **34** detached ownRead, source/dependency, body/plain-language/HOME projection
inputs match the independently saved §0.20 read snapshots exactly. Current
fingerprints, individual issued receipt hashes, renderer identity and registry
are unchanged. No request fingerprint was copied into an approval; no new or
replacement fidelity decision exists. Website states remain **34 accepted /
0 pending / 0 stale / 0 rejected**, currentSourceQualified=true. All entries are
private drafts. Original scientific bytes and QF-09 attribution stay unchanged;
historical scientific accounting **19 accepted / 15 pending** is isolated and
deferred. SF-01–06, papers, readouts and access ledgers were not resumed.

## Fresh verification and exact resulting identities

    npm run verify -- --output-root dist/m1-qf1011-separate-review --evidence-dir docs/evidence/m1/qf1011-separate-review

All eleven commands passed, zero Astro diagnostics, **80 distinct contract
cases** and **14 Chromium checks**, seven at each base, no skips/flakes/failures.
The prior 79 cases retain their exact names, and the new grouped case supplies
the SVG regression controls. No production/test edit followed this passing run.
New mobile HOME and evidence-source-details captures were inspected for source
fidelity labels, actual attribution and retained private-draft status. This is
not a new design, human comprehension or assistive-technology acceptance.

| Identity | SHA-256 |
|---|---|
| Production inputs | {d['productionInputs']['inputsSha256']} |
| Root artifact | {a['artifactSha256']} |
| Subpath artifact | {b['artifactSha256']} |

Each artifact contains 101 files / 37 HTML pages, deployEligible=false. All 100
non-build-info files per base are byte-identical to §§0.20–0.21 output. The
build-input identity changes because the auditor changed; representation policy,
content and lockfile identities do not. Post-browser inventories reproduce the
new seals. Actual qualification/release commands still exit 1 with
CURRENT_SOURCE_NOT_QUALIFIED and create no output: intended published selection
is empty. Current website fidelity cannot confer public authority.

New diagnostic failures also remain preserved. loading-probe.log records a
sandbox local-listener EPERM; loading-probe-missing-browser.log records the first
authorized attempt's nonexistent browser path. The corrected probe uses the
installed local Chromium cache. verification-sandbox.log records tsx IPC EPERM
before wrapper commands. The authorized verification.log is the actual full
PASS. final-check-first-attempt.log and its exact script snapshot preserve an
evidence-tool error: a root-only positive img src tripped BASE_PATH_FAILURE in
the subpath probe before the intended remote-srcset control. Only that diagnostic
fixture was corrected to a relative local src; final-check.log passes all 22
probes. This was not a production or test-suite repair and required no replacement
build. None of those failed attempts is reported as passing.

## Limits and next handoff

This review accepts only unchanged predecessor controls demonstrated above;
QF-12 prevents broader SVG-loading closure. The CSS scanner remains a bounded
static scanner, not a general parser/browser sandbox. Declared-region parity
does not prove every possible arbitrary page addition. The current output itself
is unchanged; this finding concerns the mutation refusal boundary. Whole-site
M2–M7, human/assistive-technology studies, first-public wording, identity,
rights/privacy, named owner target and full release pipeline remain future work.
No public repository, remote, push, publishing, license grant, deployment or DNS
action is authorized or performed. All ZIPs/history/handoff/Rider/prior decisions,
evidence and artifacts remain preserved, with evidence outside public output.

> Continue in /Users/new/RiderProjects/RPG_theory under AGENTS.md and sole
> Revision 4 §§0.15–0.22. Inspect actual HEAD/branch/status/remotes and preserve
> changes. Separately review QF-12 SVG presentation URL/XML-base repair and exact
> evidence in docs/evidence/m1/qf1011-separate-review/. QF-10 and enumerated
> predecessor QF-11 controls are independently accepted; the new repair is
> REVIEW_READY, unaccepted. Verify all current identities, seals, real caller
> paths and local-fragment/resource positives. Preserve 34 accepted exact fidelity
> decisions and QF-09 attribution; currentSourceQualified=true, historical science
> 19 accepted/15 pending deferred, all entries private drafts. Issue no replacement
> decisions unless their actual inputs change. Accept only unchanged demonstrated
> scope; new repairs stop REVIEW_READY again. Stop at the M1 review receipt and
> do not implement M2. Keep original RRG_CURRENT authoritative and unchanged,
> SF-01–06/papers/access ledgers deferred. No remote/push/publication/license/
> deployment/DNS authority.
'''
(folder/'review-receipt.md').write_text(receipt)
plan=Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md');s=plan.read_text()
updates={
'| Current milestone / state |':'| Current milestone / state | **M1 / REVIEW_READY** for new QF-12 SVG output-audit repair (§0.22), unaccepted; unchanged QF-10 and enumerated predecessor QF-11 controls separately accepted; website states 34 accepted / 0 pending / 0 stale / 0 rejected; currentSourceQualified=true; historical science 19 accepted / 15 pending; M0 ACCEPTED; M2 NOT_STARTED |',
'| Last engineering acceptance |':'| Last engineering acceptance | §0.22 separately accepts unchanged QF-10 and specifically demonstrated predecessor QF-11 controls; broad SVG-loading closure withheld. New QF-12 repair REVIEW_READY/unaccepted. M0 and demonstrated M1/ENG-03 predecessor acceptances remain intact |',
'| Changed here |':'| Changed here | §0.22 reviews §0.21 precisely, demonstrates SVG presentation-attribute loading bypasses, and repairs their shared audit/XML rebasing path. Prior receipts, all 34 exact fidelity decisions and scientific/rendered bytes unchanged; no scientific adjudication or M2 |',
'| Website/browser/a11y/live evidence |':'| Website/browser/a11y/live evidence | §0.21 exact 79-case/14-Chromium/eleven-command evidence independently reconciled; fresh §0.22 eleven-command PASS: 80 cases/14 Chromium, 22 intended-control probes at both bases. docs/evidence/m1/qf1011-separate-review/; prior failures preserved; human/assistive-technology/live hosting NOT_RUN |',
'| Next action |':'| Next action | Separate acceptance review of §0.22 QF-12 SVG presentation URL/XML-base repair and exact fresh evidence. Preserve accepted predecessor controls and unchanged §0.20 fidelity decisions. New repairs stop REVIEW_READY; M2 NOT_STARTED; no public authorization |',
'| M1 |':'| M1 | Current-source-bound records, document adapters, source registry and publication guards used by actual pages | M0 + byte-admitted RRG_CURRENT and exact website source-fidelity review | REVIEW_READY — new §0.22 QF-12 repair unaccepted; QF-10 and enumerated predecessor QF-11 controls separately accepted; all 34 exact fidelity decisions current; currentSourceQualified=true; private drafts; historical science deferred |',
}
lines=s.splitlines()
for prefix,replacement in updates.items():
 indices=[i for i,line in enumerate(lines) if line.startswith(prefix)];assert len(indices)==1,prefix;lines[indices[0]]=replacement
s='\n'.join(lines)+'\n'
section=f'''### 0.22 Separate M1 QF-10/11 acceptance review and SVG repair — 2 October 2026

**Bounded decision:** unchanged QF-10 and the specifically demonstrated QF-11 predecessor controls are separately **ACCEPTED**. Broad QF-11 SVG-loading closure is **not accepted**. New QF-12 repair is **REVIEW_READY, unaccepted**, leaving current M1 REVIEW_READY. Inspected expected clean main at `{baseline['head']}`, no remote, read §§0.15–0.21 and original contract/recheck/preceding separate acceptance evidence, and traced actual loader → hashed receipt validator → selection → build → output audit. M0 and demonstrated predecessor M1/ENG-03 acceptances remain intact. No self-acceptance of new code; M2 **NOT_STARTED**. No numerical grade assigned.

**QF-10 and bounded QF-11 acceptance:** exact unique social/visible-record metadata, canonical URLs and actual private noindex tokens are verified against real selected inputs. Original responsive/media/SVG href/xlink/form URL checks, normalized inline/file CSS checks, redirect/rebase/active-output refusal and exact installed KaTeX WOFF2 byte exception are demonstrated. Arbitrary data and forged fonts remain refused; legitimate local resources, bibliography HTTPS links and current rendered output pass. This acceptance concerns the pre-review production identity `{d['preReviewProductionInputs']['inputsSha256']}` and enumerated controls; it does not certify uninspected loading syntax or arbitrary additions.

**QF-12 — newly demonstrated gap and coherent repair:** current bound copies admitted inline SVG filter/cursor/fill URLs and a standalone SVG filter URL. Chromium independently attempted remote cursor and fill loads, intercepted/fulfilled locally; filter admission did not produce a fetch in that probe. Presentation attributes bypassed href/style inspection. The shared auditor now applies its normalized CSS resource checker to fill/stroke/filter/clip-path/mask/cursor/marker attributes for inline and standalone SVG, and refuses XML base rebasing. Only `scripts/audit-output.ts` and existing `tests/content/contracts.test.ts` change. One new grouped case supplies 28 negative/two local-resource positive subcontrols after an untouched prerequisite. No new dependency, alternate validator, lockfile, source or presentation changes. **This new repair remains unaccepted.**

**Exact predecessor evidence:** six prior seals reconcile {sum(x['checked'] for x in baseline['verifiedSeals'])} checked entries across overlapping editions, including all 55 §0.21 task/evidence identities; its 1,451 protected baseline files and thirteen original ZIP members match. Raw logs establish 79 distinct cases: prior 76 plus exactly three unchanged groups with **37 negative and 5 positive** subcontrols, not 42 additional cases. Fourteen fresh Chromium checks, seven per base, and the final eleven-command §0.21 batch pass with zero Astro diagnostics. Earlier sandbox, TypeScript, social-title and embedded-font failures remain failed, preserved attempts. All seven original mutations independently refuse at the intended pre-review control after an untouched current copy passes; no stale identity masks the refusal. Earlier mixed evidence retains its original limits.

**Fidelity and preservation:** all 34 detached source/read/dependency/render inputs, fingerprints, issued hashes, registry and representation policy remain exact; **34 accepted / 0 pending / 0 stale / 0 rejected**, `currentSourceQualified=true`. No replacement decisions or scientific approvals. All 100 non-build-info files per new artifact are byte-identical to §§0.20–0.21; only build identity changes. Sixteen retained artifact trees rehash unchanged. Original downloaded sources, ZIP/history/handoff/Rider files, historical registry and QF-09's accurate HOME/START/concept attribution are preserved. Historical science **19 accepted / 15 pending**, SF-01–06/papers/access ledgers deferred. All entries remain private drafts; actual qualification/release commands refuse `CURRENT_SOURCE_NOT_QUALIFIED`, exit 1/no output, for the empty published selection. Public authority remains absent.

**Fresh new-batch verification:** all eleven commands PASS, zero Astro diagnostics, **80 distinct contract cases and 14 Chromium checks**, seven per base without skips/flakes/failures. Post-browser seals reproduce 101 files/37 HTML per artifact, deployEligible=false. At each base, seven original and four new SVG mutations refuse at the intended control after each untouched current copy passes (**22 controls**). Production inputs `{d['productionInputs']['inputsSha256']}`; root `{a['artifactSha256']}`; subpath `{b['artifactSha256']}`. New sandbox/browser-path/evidence-probe failures remain preserved; the probe's root-only img src was corrected in evidence tooling only, with no production/test edit or replacement build after PASS. Actual mobile HOME/source-detail captures were inspected; no new human/design approval claimed. Details: `docs/evidence/m1/qf1011-separate-review/review-receipt.md`, `independent-engineering.json`, `browser-loading-probes.json`, `verification.json`, `final-checks.json`, `final-integrity.json` and raw logs/prior snapshots.

**Next handoff:** independently review QF-12's unchanged repair, shared real caller and exact evidence, including presentation URL normalization, XML rebasing, installed-font boundary and legitimate local fragments/resources. Preserve all 34 current exact website decisions unless actual reviewed inputs change. Accept only demonstrated unchanged scope; any new repairs stop REVIEW_READY. Stop at the separate M1 review receipt; do not implement M2. Later whole-site/release work, human/assistive-technology studies, first-public wording/identity/rights/privacy/authorized target remain future gates. CSS scanning is bounded, not a general parser or browser sandbox. No remote/push/public repository/publishing/license/deployment/DNS authority. Local task-owned commit authorized after checks.

'''
assert '### 0.22 ' not in s;s=s.replace('## 1. Review findings and chosen repairs',section+'## 1. Review findings and chosen repairs',1)
needle='§0.21 leaves new output-audit repairs REVIEW_READY/unaccepted while preserving those exact decisions and demonstrated predecessor acceptance.'
assert needle in s;s=s.replace(needle,'§0.22 separately accepts QF-10 and enumerated predecessor QF-11 controls; its new QF-12 SVG repair stays REVIEW_READY/unaccepted, preserving those exact decisions and demonstrated predecessor acceptance.',1)
i=s.index('**End of sole forward implementation plan.**');s=s[:i]+'**End of sole forward implementation plan.** Current execution and next handoff are §§0.15–0.22. Unchanged QF-10 and enumerated predecessor QF-11 controls are separately accepted; new QF-12 SVG audit repair is REVIEW_READY/unaccepted. All 34 exact website decisions remain preserved/current; currentSourceQualified=true. M2 NOT_STARTED; stop at the separate M1 review receipt. Scientific findings deferred, original sources unchanged, public authorization absent.\n'
old=(folder/'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')]==s[s.index('### 0.4 '):s.index('### 0.22 ')]
plan.write_text(s)
print(json.dumps(dict(status='PASS',planSection='0.22',newRepair='QF-12 REVIEW_READY; unaccepted')))
