# Unity Theory / Recursive Resonant Geometry

Public repository for the Unity Theory / Recursive Resonant Geometry (RRG) research publication website and its versioned source documents.

## Current scientific source

**Repository CURRENT:** RRG v0.2.1 repository current  
**Audited companion:** 2 October 2026  
**Promoted to this repository:** 5 October 2026

The owner explicitly selected the audited v0.2.1 documents to replace the prior active publication/research companion.

- `research/RRG_CURRENT/00_LOCKED_CORE.md` remains the minimal normative core and is unchanged.
- Repository `01_world_explanation.md`, `02_scientific_framework.md`, `03_mathematical_core.md`, and `05_CHANGE_CONTROL.md` are carried forward unchanged.
- Audited v0.2.1 `04_recursive_background_generation.md`, `05_mathematical_source_model.md`, `06_evidence_catalog.md`, `07_audit_report.md`, `08_claim_coverage.md`, and `sources.json` are now current.
- The complete predecessor repository-current set is preserved under `research/history/repository-current-2026-10-01/`.
- `research/RRG_CURRENT/SOURCE_AUTHORITY.md` and `CURRENT_MANIFEST.md` define the current authority boundary.

The original owner-supplied `RRG_CURRENT.zip` remains preserved as provenance. It is no longer the complete description of the promoted current source tree.

## Website status

The repository is public, but **the website is not yet publicly qualified or deployed**.

The v0.2.1 website migration is implemented locally and **REVIEW_READY**. Current documents have readable HTML pages; source links open the corresponding readings and sections. Original files and explanatory exports are labelled separately. The current catalogue contains 22 evidence cases and eight open questions; predecessor records keep their identities and explicit historical status. Source/display fidelity decisions remain pending or stale.

Do not interpret an old successful preview/build receipt as qualification of the promoted source set. See the sole forward plan:

[docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md](docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md)

Next is bounded separate High acceptance of the package-authority and GitHub Pages target changes in §0.45, then public M6 qualification with an approved launch selection. Earlier migration/R2 acceptance remains preserved. Current implementation evidence is in [the Pages rebind receipt](docs/evidence/github-pages-rebind/implementation/receipt.md).

## Local development

Use Node **24.18.0** and npm **11.16.0**.

```sh
npm ci
npx playwright install chromium
npm run dev
```

The local site is normally served at `http://127.0.0.1:4321/RPG_theory/`.

```sh
npm run check
npm run check:sources -- --scope current
npm run check:content -- --changed <entry-id>
npm run verify
```

Source and content validation now load the selected edition. Pending/stale source-fidelity decisions continue to block public qualification; a successful preview does not refresh those decisions.

## Source and publication layout

- `research/RRG_CURRENT/` — selected current scientific/publication source set.
- `research/history/` — predecessor and historical source snapshots.
- `research/publication/` — website records, derivative explanations, references and fidelity decisions.
- `docs/evidence/` — implementation/review/source-transition receipts; never a public website asset.
- `config/research-source.json` — byte identity/intake record for the selected current edition.
- `RIGHTS.md` and `research/publication/metadata.json` — rights/identity state.

Current source admission verifies bytes only. It does not certify the theory or grant website publication approval.

## Publication boundary

Public repository visibility is not the same as a qualified research release.

Pages deployment remains blocked until the selected v0.2.1 content is reviewed and the remaining identity, attribution, scoped-rights, privacy/public-content and accessibility gates are closed. No project-wide licence is selected merely because the repository is public.
