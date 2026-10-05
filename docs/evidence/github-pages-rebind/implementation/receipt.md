# GitHub Pages rebind implementation receipt

**REVIEW_READY. Public M6/M7 incomplete; no deployment.** R4 §0.45 is the sole tracker. Branch `main`; HEAD `2615299bfeef5beb3665337b7f3c5623a82cf4d0`; no new commit/push, index empty. Existing owner migration/acceptance edits preserved.

Copied `/Users/new/Downloads/RRG_GITHUB_PAGES_REBIND_DEPLOY_HANDOFF_2026-10-05.md` byte-for-byte into `docs/handoffs/`. SHA-256 `bc1ddf4e3ca88097151405dac6b4475ff55e4a6ace27d0bd60c40a4f4bddebbf`. That handoff supplies the default Pages target and conditional deploy authority, while publication gates remain explicit.

## Delivered scope and changed files

- `.github/workflows/site.yml`: read-only verification on main pushes; existing manual verify → prepare → deploy pipeline retained.
- `config/site.json`: real bare origin `https://vasylhryha.github.io`, base `/RPG_theory/`, repository `VasylHryha/RPG_theory`; `publicAuthorization=false`.
- `config/publication-policy.json` and `research/publication/metadata.json`: supplied repository/target recorded with handoff evidence. Deployment, author credit, rights/privacy/qualification stay pending.
- `src/lib/content.ts`, `source-paths.ts`, `source-links.ts`, `publication.ts`, `library.ts`, `source-revision.ts`, `publication-screen.ts`: package membership is separately checked from scientific authority. Supporting files keep exact downloads and faithful document readings; scientific support bindings are refused. Backlinks disclose support, and revision tracking accounts for all admitted package files.
- `research/publication/source-index.yaml`: nine supporting members changed to `declaredCurrent=false`; keys, paths, editions and hashes retained.
- `scripts/verify.ts`, `tests/fixtures/site-root.json`: root, legacy `/unity-theory/` and actual target isolated in both output and evidence. Legacy mutation contracts keep their regression base.
- Affected content tests: `m1`, `m4`, `m5`, `contracts`, `source-reconciliation`, `revision-cli`, `revision-inventory-cli`. New support/authority and support-rename regressions; fixtures now update admitted package members independently of authority.
- R4 plan current state/§0.45 and this short implementation evidence. No scientific authoring or bibliography changes.

## Source-key migration table

Prior accepted migration already replaced deleted predecessor authorities. This task keeps its semantic keys; recommended names in the handoff are suggestions, so no needless aliases or renumbering were introduced.

| Key | Current package path | Final role |
|---|---|---|
| `R-CURRENT-CORE` | `00_LOCKED_CORE.md` | Current authority; retained |
| `R-CURRENT-WORLD` | `01_world_explanation.md` | Current authority; retained |
| `R-CURRENT-SCIENCE` | `02_scientific_framework.md` | Current authority; retained |
| `R-CURRENT-MATH` | `03_mathematical_core.md` | Current authority; retained |
| `R-CURRENT-BACKGROUND` | `04_recursive_background_generation.md` | Current authority; retained |
| `R-CURRENT-CONTROL` | `05_CHANGE_CONTROL.md` | Current authority; retained |
| `R-CURRENT-ILLUSTRATIONS` | `05_mathematical_source_model.md` | Current authority; retained |
| `R-CURRENT-CATALOGUE` | `06_evidence_catalog.md` | Current authority; retained |
| `R-CURRENT-AUDIT` | `07_audit_report.md` | Current authority; retained |
| `R-CURRENT-CLAIMS` | `08_claim_coverage.md` | Current authority; retained |
| `R-CURRENT-CHANGELOG` | `CHANGELOG.md` | Current authority; retained |
| `R-CURRENT-MANIFEST` | `CURRENT_MANIFEST.md` | Current authority; retained |
| `R-CURRENT-GUIDE` | `README.md` | Current authority; retained |
| `R-CURRENT-AUTHORITY` | `SOURCE_AUTHORITY.md` | Current authority; retained |
| `R-CURRENT-REGISTER` | `sources.json` | Current authority; retained |
| `R-CURRENT-FOUNDATIONS-01-WORLD-EXPLANATION-MD` | `foundations/01_world_explanation.md` | Supporting member; authority removed |
| `R-CURRENT-FOUNDATIONS-02-SCIENTIFIC-FRAMEWORK-MD` | `foundations/02_scientific_framework.md` | Supporting member; authority removed |
| `R-CURRENT-FOUNDATIONS-03-MATHEMATICAL-CORE-MD` | `foundations/03_mathematical_core.md` | Supporting member; authority removed |
| `R-CURRENT-FOUNDATIONS-ERRATA-MD` | `foundations/ERRATA.md` | Supporting member; authority removed |
| `R-CURRENT-CHECKS-BASELINE-HASHES-JSON` | `checks/baseline_hashes.json` | Supporting member; authority removed |
| `R-CURRENT-CHECKS-PACKAGE-VALIDATION-JSON` | `checks/package_validation.json` | Supporting member; authority removed |
| `R-CURRENT-CHECKS-VALIDATE-PACKAGE-PY` | `checks/validate_package.py` | Supporting member; authority removed |
| `R-CURRENT-CHECKS-VERIFICATION-RESULTS-JSON` | `checks/verification_results.json` | Supporting member; authority removed |
| `R-CURRENT-CHECKS-VERIFY-SMALL-RESULTS-PY` | `checks/verify_small_results.py` | Supporting member; authority removed |

Predecessor 04/06/07/08 mappings remain explicitly historical under `research/history/repository-current-2026-10-01/`; no predecessor file was restored as CURRENT. All 24 admitted paths/hashes/editions are checked; exact package coverage does not require support files to be scientific authorities. `DOC-FOUNDATION-ERRATA` remains a source-bound document reading, separately from scientific UT claim authority.

Claim/evidence identities remain the existing **source key + exact edition + local label** tuple. Current `R-CURRENT-BACKGROUND:C1` and `R-CURRENT-CATALOGUE:C1` are distinct; archived E labels never resolve as current E labels. Living catalogue: 22 cases, three further readings, 79 document-qualified labels, 31 case connections. Membership is dynamic rather than a forever-fixed 22-case requirement. Original bundled validators remain preserved/disclosed; no scientific reproduction.

All BIB IDs, primary/alternate links, predecessor recovery and support scopes remain unchanged from prior accepted R2 inputs. Baumann remains one study. No references were renumbered or rewritten in this task.

## Actual verification and limitations

- Pinned clean `npm ci`: PASS, 522 installed packages, zero reported vulnerabilities; lockfile unchanged. Chromium/Firefox/WebKit installed; only targeted Chromium tests executed in this batch.
- Astro: zero errors/warnings/hints. Current/history/source/content/living-catalogue/publication checks PASS within the recorded verify attempt.
- Final builds/shared output audits PASS at `/`, `/unity-theory/`, `/RPG_theory/`: **269 files / 104 HTML each**, all inventories rehashed. See `final-builds.log`, `final/*/*-artifact.json`, `artifact-reuse.json`.
- **12 focused content passes**: seven source-role/workflow/link/download cases (`affected-contracts.log`), one ZIP case (`zip-repair.log`), three existing authoring/rename cases (`revision-final.log`) and one supporting-erratum rename with both missing-path refusals (`support-revision-affected.log`). These are separate commands, not one monolithic suite. Failed fixture attempts are retained.
- **11 distinct targeted Chromium checks PASS** at actual base: eight source/label/download/no-JS/404 journeys and three search/font/mobile/axe/print checks. Captures inspected. After final source-revision code changed artifact identity, all reading/browser files were byte-identical except citation/build/download metadata; the final citation/download case was rerun separately against regenerated output. See `target-browser.log`, `source-target-browser.log`, `final-download-browser.log` and their JSON/captures.
- Actual qualification CLI: expected `CURRENT_SOURCE_NOT_QUALIFIED`, no output created (`qualification-refusal.log`). Empty launch set and stale decisions remain gates.
- **Full `npm run verify` NOT_COMPLETED**, recorded nonzero. Output-mutation file consumed about nine minutes before proportionate stop. The partial suite reports 91 passes/four failing package/edition assumptions plus interrupted file behavior; all four affected assertion cases were repaired and rerun. Later full browser/M6 integration commands NOT_RUN. No new full-site/three-engine/stress/Lighthouse/CI pass claimed. Sandbox socket/cache attempts, audit-argument mismatch and all intermediate failures remain separately recorded.
- `git diff --check` PASS; source/history/lock/review preservation manifest has 55 unchanged identities, HEAD/index unchanged. No source meanings/bytes, raw packages, history, Rider solution, existing evidence or unrelated changes intentionally altered.

## Pages configuration and remaining blockers

Expected future URL: **https://vasylhryha.github.io/RPG_theory/** — configured locally, **not deployed**. Read-only GitHub API confirms public repository, main branch, admin access, Actions enabled, `has_pages=false`; Pages and `github-pages` environment endpoints returned 404, deployment variables empty. No remote settings were written. When gates pass, configure Pages for GitHub Actions and default domain, set `UNITY_DEPLOY_ENABLED=true`, qualify/commit the selected artifact, verify exact-commit CI, manually dispatch `operation=publish` and verify sealed live bytes with existing tooling.

Current state: **0 accepted / 96 stale / 0 pending / 0 rejected**, 75 current drafts plus 21 archived entries. Decisions were retained unchanged; shared source/download/backlink changes invalidate their old fingerprints. `currentSourceQualified=false`, `deployEligible=false`, published launch selection empty.

Required next inputs/gates: separate bounded High acceptance; exact author-approved public launch set/wording; public credit/permanent URL and any chosen contact; scoped code/research/data rights, privacy/content/legal/release decisions; remaining M6 screen-reader/MathML/listening/human/provenance checks; exact release commit and CI. Optional personal contact/ORCID is not inferred. The target is now supplied; other approvals are not inferred from it. No self-acceptance, universal-proof requirement, SF-01–06 adjudication or scientific-source rewrite.

**Custom domain / DNS: DEFERRED UNTIL PROJECT APPROVAL.** No CNAME or domain/DNS changes. No deployment seal/live release exists for this batch, so live verification was NOT_RUN.

## Bounded next-session prompt

```text
Work in /Users/new/RiderProjects/RPG_theory. Read AGENTS.md, R4 §0.27 then §0.45 and §8 M6/M7, the copied owner handoff, and docs/evidence/github-pages-rebind/implementation/receipt.md.

Give the package-authority/Pages-target implementation one separate bounded High acceptance. Preserve dirty migration/acceptance work, current scientific bytes, history, original packages/Rider files and prior decisions. Compare the supporting errata reading/backlink/download path, role refusals and repository metadata; reuse unchanged body/source comparisons from §0.44 by actual equality. Do not blindly refresh 96 fingerprints or repeat the entire expensive mutation campaign. Focused affected checks and final three audits are recorded; full verify is incomplete, not passing.

Local target is https://vasylhryha.github.io/RPG_theory/; root and /unity-theory/ are regressions. Current source fidelity decisions are stale and the launch selection is empty. Owner-authorized Pages publication is conditional on actual release gates. Record supplied author/launch/credit/rights/privacy inputs honestly; do not fabricate approvals or source meaning changes. Configure/publish through the existing manual pipeline only after qualification and exact-commit CI. Never deploy a private preview or another artifact. Keep domain/DNS deferred until explicit project approval. Update the same R4 tracker; name any unavailable gate.
```
