# Recursive Resonant Geometry (RRG)

RRG asks how arrangement and activity support persistent wholes, how those
wholes become useful units, and how existing organization changes the conditions
for what can form next. A maintained cell boundary and bacterial changes to a
culture's acidity give concrete starting points. The wider recursive, force and
cosmology proposals remain open.

Read [the public introduction](https://vasylhryha.github.io/rrg_theory/start/),
[explore evidence](https://vasylhryha.github.io/rrg_theory/evidence/), or
[inspect the original documents](https://vasylhryha.github.io/rrg_theory/documents/).
Vasyl Hryha maintains the project; contact **vasylhryha.rrg@gmail.com**.
This repository contains the website and versioned research sources.

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

The live first research-draft edition was deployed from main commit `534350e`
at the lowercase target above. Its 75 current readings received scoped website
fidelity acceptance; 21 archived entries remain excluded. The catalogue has
22 evidence cases and eight open questions. Original files and explanatory
exports are labelled separately. Prior acceptance is evidence for that edition.

The expanded presentation in this checkout changes explanations, technical context
and reading journeys. It received one independent bounded High website-fidelity
and editorial acceptance at R4 §0.63, including same-session disclosure repairs
and 75 current decisions. It is **not deployed**. See
[the acceptance receipt](docs/evidence/site-wide-acceptance/receipt.md) for actual
qualification, remaining limits and the sole
[R4 tracker](docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md), §§0.60–0.63.
The [live release receipt](docs/evidence/rrg-theory-address/receipt.md) remains
preserved alongside the earlier first-release evidence.

Human comprehension and screen-reader observations are not performed. The
original supplied bundle has been captured and compared privately; an outer
checksum self-hash discrepancy is recorded, and off-machine backup is unverified.
Earlier broad regression failures are not reported as passed. Custom domain/DNS
is deferred until project approval.

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

The live 75-page first test edition has recorded fidelity, identity, rights,
scoped privacy and explicit owner publication authorization. The existing
main-only manual workflow builds, audits and seals the selected output, then
deploys that uploaded artifact. Further releases retain those shared controls;
there is no full audit on every push. Research prose/original figures have the
declared CC BY-NC-SA 4.0 grant and additional CC BY 4.0 from 1 January 2033 UTC;
website code and separately distributed data remain all rights reserved.
