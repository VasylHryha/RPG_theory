# Recursive Resonant Geometry (RRG)

Public repository for the Recursive Resonant Geometry (RRG) research publication website and its versioned source documents.

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

**The first public research-draft edition is live:**
[vasylhryha.github.io/rrg_theory](https://vasylhryha.github.io/rrg_theory/).

The v0.2.1 migration and repaired first-test candidate have **bounded separate High acceptance** (R4 §§0.47/0.51). Current documents have readable HTML pages; source links open the corresponding readings and sections. Original files and explanatory exports are labelled separately. The current catalogue contains 22 evidence cases and eight open questions; predecessor records keep their identities and explicit historical status. All 75 current source/display fidelity decisions are accepted and selected for publication; 21 archived decisions remain stale and excluded. The current owner-authorized manual Pages run deployed the corrected RRG homepage/name/contact from main commit `534350e`; seven release browser checks and live availability/identity/404 checks passed. The earlier first-release artifact and evidence remain preserved.

Do not interpret an old successful preview/build receipt as qualification of the promoted source set. See the sole forward plan:

[docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md](docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md)

Current evidence is in [the RRG homepage and publication receipt](docs/evidence/rrg-theory-address/receipt.md); the [first public release receipt](docs/evidence/first-public-release/receipt.md) remains preserved. The corrected RRG homepage/name/contact and lowercase address were deployed from main commit `534350e` with seven release browser checks and a passing live smoke. Human comprehension/listening, screen-reader observations, original-package provenance and a fully passing broad regression campaign remain incomplete; they are not reported as passed. Earlier migration/R2 acceptance remains preserved. Custom domain/DNS is deferred until project approval.

## Local development

Use Node **24.18.0** and npm **11.16.0**.

```sh
npm ci
npx playwright install chromium
npm run dev
```

The local site is normally served at `http://127.0.0.1:4321/rrg_theory/`.

```sh
npm run check
npm run check:sources -- --scope current
npm run check:content -- --changed <entry-id>
npm run verify:ci
```

Source and content validation now load the selected edition. Pending/stale source-fidelity decisions continue to block public qualification; a successful preview does not refresh those decisions.

Heavy source/history/full-regression and exhaustive live checks run monthly.
Use `npm run verify` or manual workflow operation `qualify` for that explicit
campaign; reuse passing results for 30 days on unchanged relevant inputs and
check changed features narrowly. The monthly reminder does not block deployment.

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

The selected 75-page first test edition has recorded fidelity, identity, rights,
scoped privacy and explicit owner publication authorization. The existing
main-only manual workflow builds, audits and seals the selected output, then
deploys that uploaded artifact. Further releases retain those shared controls;
there is no full audit on every push. Research prose/original figures have the
declared CC BY-NC-SA 4.0 grant and additional CC BY 4.0 from 1 January 2033 UTC;
website code and separately distributed data remain all rights reserved.
