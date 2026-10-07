# RRG v0.3.1 source revision and extra-page drafts

**Current recheck:** draft revision 2 and corrected bibliography display citations; see [recheck/receipt.md](recheck/receipt.md) for repairs, current word counts and fresh affected checks. The initial delivery record below is preserved for its earlier inputs.

**REVIEW_READY.** Implementation and requested checks complete. Independent source acceptance and author review of drafts are pending. No new website decision, test, commit, push or deployment.

## Source revision

Changed actual current sources: `01_world_explanation.md`, `02_scientific_framework.md`, `README.md`, `sources.json`, `CHANGELOG.md`, `CURRENT_MANIFEST.md`, `SOURCE_AUTHORITY.md`. 02 §17 compares seven related approaches, retaining existing component discussions through cross-references. 01 §16 question 18 and README add reading pointers. The proposed formation–spreading–background cycle and resonance-fit have no distinguishing evidence yet. No definitions, claim IDs/statuses or evidence cases change.

Authoritative §4.5 record: CHANGELOG `RRG-2026-10-07-V031-RELATED-WORK`. Transaction: `research/publication/source-revision-v0.3.1.json`. All 24 v0.3 predecessor members are byte-exact under `research/history/repository-current-v0.3-2026-10-07/`; `predecessor-root/` also preserves the loadable prior registration/website/decision inputs for the existing read-only validator.

- Edition: **RRG v0.3.1 — relation to existing work, 2026-10-07**.
- Predecessor seal: `dd38bd32095925941cf0c18199052767747e59c14d40ef298f900a52cab352b1`.
- Result seal: `7cdd54335fd91a7ab7df756d9dd28315de0d59da3a9b477d548cf21e083771d6`.
- Manifest SHA-256: `64e96c9cb520d44983f70f2bb565e10d64316c70c41cc144bb8cfa82ccbe903d`.
- Unchanged core SHA-256: `b6d3e7c75285889afe94cabf083ba5fb80f401c656613ba6a80d2f0149b655e1`.

Adapted the existing v0.3 registration helper as `register-edition.mjs`: same inventory hashing, exact excerpt rebinding, derivative revision/date updates and history registration. Updated config, source index, historical manifest, canonical documents, records, page frontmatter and source-label-map editions coherently. Added source-scoped aliases for the five new citation URLs. 52 direct derivative revisions advance. Existing authored website bodies are unchanged; all 80 current fidelity decisions are stale through the shared fingerprint mechanism. The decision registry and issued decisions remain exact. `currentSourceQualified=false`, `deployEligible=false`; the deployed v0.3 release selection is unchanged.

## Bibliography

| New ID | Related work |
|---|---|
| BIB-0094 | Prigogine, dissipative structures (1978) |
| BIB-0095 | Simon, stable intermediate forms (1962) |
| BIB-0096 | Szathmáry & Maynard Smith, major transitions (1995) |
| BIB-0097 | Laland, Matthews & Feldman, niche construction (2016) |
| BIB-0098 | Sharma et al., assembly theory (2023) |

All have exactly `supportScope: Related work; does not establish RRG.` and `verificationScope: Bibliographic record verified 7 October 2026 (Claude).` Source `further_reading` F04–F08 mirrors the supplied records. Existing BIB-0004/0009/0010 provide synergetics/autocatalytic context and remain unchanged. Verification attribution is supplied by the task; no full-paper audit, finding verification or evidence case is inferred. Only widely known core ideas enter the comparison; assembly theory is briefly marked as debated.

## Review drafts

All are complete draft pages under `docs/handoffs/extra-pages-drafts/`, with schema-valid proposed frontmatter, exact-section mappings and registered bibliography/dependency targets. Word counts include Markdown text, headings and link labels; they exclude frontmatter and destinations.

| Draft | Proposed route | Words |
|---|---|---|
| experiments.md | `/experiments/` | 589 |
| related-work.md | `/related-work/` | 603 |
| critics.md | `/questions/` | 559 |
| uses.md | `/uses/` | 577 |

`INTEGRATION_PLAN.md` proposes Part V before Appendices, Research dropdown/footer links, secondary home-door links and term-level glossary connections. The four routes are absent from the actual preview; no site consumer was changed. No pending-citation example, unsourced experiment or demonstrated RRG technology is introduced. Step-specific adverse outcomes are conditional tests of the stated connection, not automatic universal disproofs. Habitats remain a speculative application, not a source-reported result.

## Checks

- **PASS — Current sources:** `npm run check:sources -- --scope current`; [sources-current-complete.log](sources-current-complete.log).
- **PASS — History sources:** `npm run check:sources -- --scope history`; [sources-history.log](sources-history.log).
- **PASS — Source revision:** `npm run check:source-revision -- --prior-root docs/evidence/source-revision-v0.3.1/predecessor-root --change research/publication/source-revision-v0.3.1.json --evidence-dir docs/evidence/source-revision-v0.3.1`; [source-revision-complete.log](source-revision-complete.log).
- **PASS — Type check:** `npm run check`; [type-check-complete.log](type-check-complete.log).
- **PASS — Content tests:** `UNITY_EVIDENCE_DIR=docs/evidence/source-revision-v0.3.1 UNITY_CONTRACT_OUTPUT=dist/source-revision-v0.3.1-preview npm run test:content`; [content-tests-complete.log](content-tests-complete.log).
- **PASS — Preview build:** `UNITY_EVIDENCE_DIR=docs/evidence/source-revision-v0.3.1 npm run build -- --mode preview --config config/site.json --output dist/source-revision-v0.3.1-preview`; [preview-build.log](preview-build.log).
- **PASS — Output audit:** `UNITY_EVIDENCE_DIR=docs/evidence/source-revision-v0.3.1 npm run audit:output -- --dir dist/source-revision-v0.3.1-preview`; [output-audit.log](output-audit.log).
- **PASS — Draft/plan links and preservation:** `node --import tsx docs/evidence/source-revision-v0.3.1/check-drafts.mjs`; [draft-link-check-complete.log](draft-link-check-complete.log).

Type check: **0 errors / 0 warnings / 0 hints**, 82 files. Content: **21/21 PASS**, no skips. Output: **366 files**, private preview at `/rrg_theory/`; artifact SHA-256 `00c6389cf80d9c66054e091965f1ffe1c0a8fc61d990b2df8808a362fdcf091f`. The content suite reused that output through `UNITY_CONTRACT_OUTPUT`, avoiding another final build. Link check: **37 links** across drafts and integration plan; actual preview anchors checked, bibliography URLs and metadata targets resolved. External URLs are registered destinations; no fresh remote availability claim is made. Evidence and preserved roots are private, not public assets.

`preservation-final.json`: 156 protected files match, including all historical snapshots, core, production source/scripts/assets, dependency lock, prior decisions and release selection. All 23 existing website page bodies and sidecar prose are unchanged; existing source evidence cases, previous further reading and previous BIB records match. `git diff --check` passes. No browser campaign or broad monthly audit was run.

## Failed/intermediate attempts

- Initial current-source/revision/type checks refused `UNRESOLVED_CITATION_ALIAS` for a new reference. Registered five aliases; affected checks pass after repair. Initial logs remain `sources-current.log`, `source-revision.log`, `type-check.log`.
- Initial `test:content` implicitly built its usual candidate, then six output-test hooks failed on two missing source fragments; 15 other tests passed. Corrected Proposition 4/5 fragments against actual rendered IDs, regenerated the source seal and built the selected final preview. Final 21/21 passes reuse it. The initial test log remains `content-tests.log`; it is not passing evidence.
- Initial draft checker found omitted nullable/schema fields, then its reading-code scan incorrectly inspected hidden link destinations. Completed draft metadata and restricted that scan to rendered text. Actual link checks then repaired the catalogue and AI fragments. These attempts remain in `draft-link-check*.log`; only `draft-link-check-complete.log` is final PASS.
- Pre-fragment-repair candidate seal `d4c6e40b4970fbe0aa4c1635d90c629dfb735cd27759993063774f25d2698808` was unaccepted. Final registered source seal above supersedes it; the v0.3 snapshot is unchanged.

## Open issues / next work

1. Bounded independent source acceptance and author review of all four drafts; no acceptance is invented here.
2. All 80 current website fidelity decisions are stale as expected. Later integration/publication needs actual affected source/display review through the existing validator; the preserved v0.3 deployment remains its earlier accepted edition.
3. Existing BIB-0004 source-transcribed year 2025 differs from publisher metadata year 2026. The source reference is preserved as requested; the related-work draft discloses this. Its author is Juval Portugali, not Haken. This is an existing bibliographic discrepancy, not a new empirical claim.
4. The lack of discriminating evidence and unproved engineering/AI implications are scientific limits explicitly retained in the text, not implementation failures. No technical check remains failing.
