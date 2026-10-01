# Unity Theory

Private static Astro website for the Recursive Resonant Geometry research project.
The authoritative implementation status and next action live in
[the R4 plan](docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md).

Use Node **24.18.0** and npm **11.16.0**. Dependencies are locked at the project root.

```sh
npm ci
npx playwright install chromium
npm run dev
```

The local development site is at `http://127.0.0.1:4321/`. Home and `/start/`
are draft reading pages. `/fixtures/math/` is a synthetic, non-public rendering
fixture; it makes no scientific claim.

```sh
npm run verify
```

This runs source identities, intake/URL/Markdown negative controls, root and
`/unity-theory/` static builds, output audits and production-output browser tests.
Detailed M1 receipts and screenshots go to `docs/evidence/m1/`; prior M0 evidence is preserved.

```sh
npm run build -- --mode preview
npm run serve -- --output dist/preview-root --port 4321
```

Build modes are `preview`, `qualification`, and `release`. Preview may expose drafts
privately. Qualification requires the same reviewed scientific selection as release,
but may use a reserved fixture origin and remains **non-deployable**. The actual
current corpus has pending reviews and refuses qualification/release. The full
public release pipeline is still unavailable. `npm run verify` runs private preview
engineering checks at both base paths; it grants no scientific acceptance.

The owner-supplied `RRG_CURRENT.zip` is preserved at the root. Its sole operative
extracted copy is `research/RRG_CURRENT/`. The intake record includes raw file
hashes and the inspected manifest; historical documents are separate under
`research/history/`. Website prose is authored in `research/publication/`.
Source bytes are never rewritten by extraction, rendering or builds.

For a new ZIP, inspect and stage without replacing the current edition:

```sh
python3 scripts/intake_archive.py /path/to/RRG_CURRENT.zip /tmp/rrg-new-edition
```

Then inspect the actual manifest and change control, record the chosen edition,
classify every file, preserve the previous edition, and update the intake seal
with affected bindings/reviews. Extraction alone never approves an edition.

The supplied handoff remains under `unity_theory_website_handoff_r4/` as an
unchanged provenance snapshot. Execute only the installed plan in `docs/plans/`.
Existing Rider solution and editor files are preserved. No remote repository,
public publication or license grant has been configured.

M1 record pages live at `/claims/UT-…/`, with minimal concept and source-bound
status/matrix consumers. `/references/` lists the selected literature with DOI
and alternate-source links, support scopes and bibliographic verification limits.
All remain private drafts. The single corpus loader serves collection adapters,
CLI validators and page/route selection; no review is automatically accepted.

```sh
npm run check:content -- --changed UT-D01 --evidence-dir docs/evidence/m1
```

This prints/stores affected entries and required fingerprints without writing
reviews. Source/document/citation sidecars are valid YAML (JSON subset); authored
page frontmatter uses the same shared schema. Source governance stays in the
actual current source, with proposed revision transactions linking its change
record and preserving prior bytes rather than silently resetting pins.

M1 mode correction: `npm run verify` exercises the private **preview** slice at both
base paths. `qualification` now requires a qualified actual current corpus, exact
accepted reviews, published dependency closure, dates and scoped rights; it cannot
expose drafts through a renamed preview. The current pending corpus refuses that
mode. All local artifacts remain non-deployable. Read the latest execution record
in the sole Revision 4 plan before continuing.

For an authorized scientific authoring transaction, preserve the complete predecessor
edition outside the active source tree, update sources/admission/sidecars together,
then run `npm run check:source-revision -- --prior-root <preserved-edition-root>
--change <transaction.json> --evidence-dir <evidence-directory>`. Its JSON describes
the change-control fields and priorSnapshot path/hash pairs; the checker reads those
raw predecessor bytes and verifies the change ID in the current source-owned change
record. It reports affected fingerprints with review pending and grants no approval.
