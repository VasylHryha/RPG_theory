# RRG v0.3 mutual-coherence correction — 2026-10-06

**REVIEW_READY.** The author explicitly requested the correction identified in acceptance review. No review or acceptance decision is created here.

## Exact correction

01 §1 now states: “A physical thing is better imagined as a **shape and a pattern of activity that keep each other coherent**.” The prior one-way sentence could imply activity precedes shape, conflicting with core §3. Only that sentence changes in 01; all other text, including the rest of §1, is byte-identical. CHANGELOG records the correction under the existing change ID. No core or evidence case changes.

## Identity and mechanical updates

- Edition: RRG v0.3 — author-clarified edition, 2026-10-06.
- Same change ID: `RRG-2026-10-06-V03-AUTHOR-CLARIFIED`.
- Original v0.2.1 predecessor seal remains `caaa7691bde318f188dcecf45950b05b5c0cdcc2cff9770474522395b67c8139`.
- Pre-correction candidate: `66b2f5834f3c537f7f8e648dfac0d067f54006ca486ddc26e1fe81db57b0e31a`; exact source/registration/page bytes preserved in before/.
- **New inventory seal: `dd38bd32095925941cf0c18199052767747e59c14d40ef298f900a52cab352b1`.**
- Manifest SHA-256: `a4a4dfe0bba21bd32102e11f8391c59d80231c18214d78783639af330f5c310e` (unchanged).
- Locked-core SHA-256: `b6d3e7c75285889afe94cabf083ba5fb80f401c656613ba6a80d2f0149b655e1` (unchanged).

Changed-source SHA-256 values:
- 01_world_explanation.md: `dbbbaaed01bce72625289142b812ada54a8ac6c49d0e3a0ce750973dc0c6cc2a`.
- CHANGELOG.md: `9805e5fa91a28e4c91afe7a6cf9f341cc6d09ffd6ebcb56466f64a8802eef522`.

Existing identity tooling recomputed per-file bytes/hashes, the stable inventory seal, exact full-document/excerpt bindings and affected derivative revisions (16 entries). research-source.json, source-index.yaml, canonical-documents.yaml, necessary publication-page revision metadata and source-revision-v0.3.json update together. Records needing no change remain byte-identical. The current inspection evidence reference points to this receipt; earlier receipts retain their earlier identities. No website body or other frontmatter changes.

## Actual checks

| Check | Command | Result |
|---|---|---|
| Current sources | `node --import tsx scripts/check-sources.ts --scope current` | PASS, 24 admitted files; currentSourceQualified=false. |
| Source revision | `node --import tsx scripts/check-source-revision.ts --prior-root docs/evidence/source-revision-v0.3/predecessor-root --change research/publication/source-revision-v0.3.json --evidence-dir docs/evidence/source-revision-v0.3/mutual-coherence-fix` | PASS; reviewOutcome pending. |
| One preview build | `node --import tsx scripts/build.ts --mode preview --config config/site.json --output dist/source-revision-v0.3-mutual-coherence` | PASS, 105 pages at /rrg_theory/; deployEligible=false. |
| Output audit | `UNITY_EVIDENCE_DIR=docs/evidence/source-revision-v0.3/mutual-coherence-fix node --import tsx scripts/audit-output.ts --dir dist/source-revision-v0.3-mutual-coherence` | PASS, 350 files; artifact SHA-256 `de4ea23da197f93d42735d28f5b85f6cd1df0d78c3de68bec1eaf41e59c08cd2`. |
| Preservation | input-hashes.json / scope-preservation.json | PASS; 4,084 repository input identities checked; changed paths limited to the correction and required registration/revision records. |
| Whitespace | `git diff --check` | PASS. |

Logs are beside this receipt. No other test campaign was run. Existing unrelated website/test failures and pending/stale review decisions remain unchanged. No validator, plan, unrelated file, historical snapshot, licence, commit, push or deployment change.
