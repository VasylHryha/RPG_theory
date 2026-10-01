# M0 independent review — 1 October 2026

Decision: **ACCEPTED — demonstrated M0 engineering scope only**. M1 remains
NOT_STARTED. Scientific content, author approval, human comprehension and public
publication are not accepted by this decision.

## Evidence and scope

Read AGENTS.md, Revision 4's execution record, source policy, M0, §9 and §10.2;
inspected the production collection/renderer/layout, CLI, source admission,
URL owner, output auditor, static server, build identity and CI workflow. No Git
repository, HEAD or remote exists. `baseline.json` confirms all 47 pre-review
implementation identities matched the implementer's receipt and both earlier
artifacts matched their inventories. Original receipts and artifacts are retained;
`prior-code/` preserves the repaired files before review. `task-files.json` records
the reviewed task-owned files because there is no Git diff.

The actual owner-supplied RRG_CURRENT ZIP contains thirteen files. All thirteen
installed files match its raw bytes. The actual manifest has eleven active
members; the manifest itself and earlier `07_UPDATE_MANIFEST.json` are classified
additional files. Core raw SHA-256 remains
`b6d3e7c75285889afe94cabf083ba5fb80f401c656613ba6a80d2f0149b655e1`;
manifest raw SHA-256 remains
`c96a7387d0c24911ff671babb61c4b34255e8f50de17e3ce5f26516e554682b7`;
inventory seal remains
`25d4e1e9476da06972bd30245ea4d6abe6be0a0e9bc56aaa0ae9e09179a6386a`.
`config/research-source.json` now names the inspected manifest-format adapter.
It retains empty bindings and pending content review; actual intake is available,
`currentSourceQualified` is false. The old missing-source observation is historical.

Inspected core/change control, manifest, status/proof matrix, both evidence
registers, package guide/changelog/update receipt and the framework/math/world
framing and relevant addenda. This checks M0 edition roles and admission limits;
it is not full scientific-content review or a fresh audit of cited papers.
The source-intake notes about literal backslash-n passages, the absent earlier
`core_integrity.json` receipt and narrower candidate-model addenda remain valid.
No source text or scientific dependency was revised. All fourteen historical
files and two note transcriptions also match the supplied handoff, including
original Project file identities. The final preservation check covers sixty
pre-existing source/archive/handoff/Rider/editor/lock files; all are unchanged.
The complete handoff ZIP has twenty-five extracted files including its manifest;
the implementer's twenty-four-file figure concerned its non-self manifest entries.

The original fourteen contract tests reached useful source/URL/math/archive
controls, but did not cover reference-style destinations, actual manifest-text
reconciliation, nested encoded collisions, cross-document macros, missing output
routes, false artifact source identity or active SVG assets. Their counts alone
were insufficient. The original eight Chromium tests validly covered the two
static base modes, private home/start/math, skip-link/no-JS navigation, 320px
reflow, axe checks, dark home and real 404 recovery. They never demonstrated
source-bound scientific meaning, search, exports, other engines, assistive
technology, human comprehension, author approval or public hosting.

## Findings and repairs

| Finding | Production repair and reached control |
|---|---|
| Reference destinations bypassed inline Markdown checks/base prefixing | Validate definitions plus link/image references through the shared transform; safe references gain the base; unsafe protocols/credentials/traversal and remote images fail |
| Membership sidecar could omit actual manifest entries and still pass | Reconcile the inspected active-file-list format against actual manifest text; omissions, duplicates and unknown formats fail; no ten-file assumption |
| Multi-encoded aliases escaped route collision detection | Compare recursively decoded NFC routes; nested alias collision fails |
| Home cards asserted availability despite failed source intake | Both cards derive their state from the production admission owner, matching the layout banner |
| Output audit skipped absolute links to configured origin and allowed incomplete/tampered output | Audit same-origin links/fragments locally, require every M0 route, check implementation/config/dependency/content/source identities, reject extra private output, unsafe destinations/remote resources/active HTML and SVG |
| CI action tags were mutable and checkout retained credentials | Pin inspected action commits, disable credential persistence; keep contents:read and verification only |
| Review runs overwrote prior evidence/artifacts | Add separate evidence/output destinations; exclude stored code snapshots from Astro compilation |

`build-info.json` now binds production scripts, source/config, layout/rendering,
public assets, content, tool configuration, workflow and dependency lock to an
input fingerprint, excluding generated Python bytecode caches. Preview and qualification remain private, draft-bearing and
non-deployable. The actual release CLI fails with `PUBLIC_TARGET_REQUIRED` before
creating output; unit controls separately reach unqualified current/synthetic
corpus, missing authorization and the intentionally absent release pipeline.
No license, deployment, remote configuration or public content is introduced.

The installed mdast handler and KaTeX implementations were inspected. Primary
references used for these repairs: [mdast reference nodes](https://github.com/syntax-tree/mdast),
[KaTeX options](https://katex.org/docs/options),
[GitHub secure Actions guidance](https://docs.github.com/en/actions/reference/security/secure-use),
[checkout commit](https://github.com/actions/checkout/commit/11bd71901bbe5b1630ceea73d27597364c9af683),
[setup-node commit](https://github.com/actions/setup-node/commit/49933ea5288caeca8642d1e84afbd3f7d6820020).

## Actual verification

Final command:

```sh
npm run verify -- --output-root dist/m0-review --evidence-dir docs/evidence/m0/review
```

All ten commands exit 0, with zero Astro errors/warnings/hints, **20 contract tests**
and **8 Chromium browser tests**. See `verification.json` and
`verification-approved.log` for every command/test and its result. The archive
contract invokes four Python unittest methods with path subcases; this is not
additional real-science evidence. Browser receipts are `root-browser.json` and
`subpath-browser.json`. Enhanced math checks confirm MathML, font availability,
local overflow and keyboard horizontal scrolling. Automated axe covers light
home/start/math and dark home; no blanket exemption was added.
Screenshots were visually inspected for actual desktop/mobile/dark home and
mobile math, alongside navigation and status text in the emitted HTML.

The final suite freshly reruns every reached check after the last production
repair. Earlier passing checks were reused only during the intermediate
assertion-only correction with unchanged production/config/source/dependency
inputs; the final receipt no longer depends on that reuse.

Failure history is retained: `verification.log` is the sandbox tsx IPC EPERM
(INFRASTRUCTURE_FAILURE); approved execution resolves IPC/local-server access.
`first-check-*` and `svg-check-*` record TypeScript narrowing failures corrected
in the auditor. `first-contract-*` records one new test's over-specific HTML
escape expectation, corrected to check escaped code/no script element.
`first-output-*` retains the passing intermediate artifact checks; these are
superseded by fresh final evidence after the SVG/source-identity repair.
`before-cache-exclusion-*` retains the prior passing batch; the final production
fingerprint excludes generated bytecode and all ten checks were refreshed after
that correction, together with preview/release CLI evidence.
No failed or unexecuted check is counted as passing.

`cli-smoke.json`/`.log` additionally record actual preview build/audit exit 0 and
expected release refusal exit 1 with the named gate, no release directory.
Preview and qualification share the same production inputs but different mode
and artifact identity. No preview browser rerun is claimed.

Toolchain remains Node 24.18.0, npm 11.16.0, Astro 7.3.5, TypeScript 6.0.3,
KaTeX 0.18.10, Playwright 1.63.0, Chromium 153.0.8010.12/revision 1243;
installed top-level versions match the unchanged dependency lock. Both site
configs use `https://unity-theory.invalid`, repository null and authorization
false. Base paths are `/` and `/unity-theory/`. There is no M1 publication
manifest yet; the M0 slice's route and synthetic-route identities are explicit.

| Exact private artifact | Inventory SHA-256 | Files |
|---|---|---|
| `dist/m0-review/qualification-root` | `5d5c94630c75198cbb4dab0bbd069c4cab49cc61d33b936f01e0d549198b2b09` | 68 |
| `dist/m0-review/qualification-subpath` | `d1b4dca27d0efe79aa2615248e6095f2e7860b67766abb78053306d8867fe46b` | 68 |

`root-artifact.json`, `subpath-artifact.json` and `final-integrity.json` record
inventories and byte equality after browser checks. Both original implementer
artifacts remain unchanged. No scientific corpus, original ZIP, history,
administrative plan, evidence folder, script or source map is emitted. The
server serves emitted files and returns HTTP 404 plus the actual 404 document,
with base-aware recovery links; it has no SPA fallback.

## Remaining gates and next session

M0's demonstrated engineering scope is accepted. Source binding/extraction,
semantic dependency and review lifecycle, actual-current-content qualification
and wider publication surfaces belong to M1 and later milestones. Scientific
literature/numerical verification, first-introduction author approval, identity,
rights/privacy/public target authorization, actual GitHub CI/platform protection,
performance qualification, other browser engines, assistive technology and human
comprehension remain unperformed or pending in their owning milestones.
Automated accessibility checks are bounded evidence, not WCAG certification.

Exact next-session handoff:

```text
Work in /Users/new/RiderProjects/RPG_theory. Read AGENTS.md and
UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md Revision 4, especially §0.5,
M1 in §8 and §9. M0 engineering is ACCEPTED; M1 is NOT_STARTED.
Implement M1 only against actual research/RRG_CURRENT, config/research-source.json
and the admitted manifest/core/inventory identities. Read the M0 review receipt
at docs/evidence/m0/review/review-receipt.md and retain its source-format/addendum
limits. Build real source-bound records, dependency/review selection and shared
publication guards/consumers under M1. Preserve raw sources during intake/builds,
history, ZIPs, Rider files, prior artifacts and unrelated work; source authoring
revisions follow §0.3/§4.5. Finish a coherent batch, run affected checks and update
the same plan. Stop M1 at REVIEW_READY for a separate review. No publication,
push, remote configuration, license grant or M2 work is authorized by this handoff.
```
