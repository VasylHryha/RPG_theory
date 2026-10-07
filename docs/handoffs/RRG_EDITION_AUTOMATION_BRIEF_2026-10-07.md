# Brief: permanent `npm run edition` automation (7 Oct 2026)

Owner (feedback §27): "make it automatic - provide some script ... keep it and
do not do it manually". Today a one-paragraph source edit took ~45 min: an
agent re-copied per-release helpers (register-edition.mjs, preserve.py,
record-pending.mjs, record-decisions.ts, select-release.ts,
list-force-add-paths.py from docs/evidence/source-revision-v0.3.3/ and
docs/evidence/fidelity-v033/) and ran ~40 commands by hand; a missed header
bump forced a full redo.

## Deliver

One permanent, maintained command in `scripts/` (TypeScript, existing style),
e.g. `npm run edition -- --version 0.3.4 --label "short label" --approval "owner feedback §N"`,
run AFTER the author edits text in `research/RRG_CURRENT/`. It must:

1. Preserve the current committed edition (from git HEAD) byte-exact under
   `research/history/repository-current-v<prev>-<date>/` + predecessor root.
2. Bump edition everywhere automatically: edited documents' title/edition
   lines, CHANGELOG entry skeleton (from args; changed files listed from the
   diff), CURRENT_MANIFEST, SOURCE_AUTHORITY, README, sources.json, config
   hashes, transaction JSON, page frontmatter edition/revision, registries.
3. Run the existing source-revision validator.
4. Fidelity: auto-record decisions for readings whose delta is metadata-only
   (edition/hash/revision), reusing prior comparisons, clearly labelled as
   such. Print the readings with real content deltas and STOP for those to be
   read — never fabricate content acceptance. A second mode
   (`--accept-reviewed <ids> --reviewer ... --note ...`) records reviewed ones.
5. `--select <releaseId>`: select release, preserve previous selection.
6. Fast checks once: source-revision + fidelity validators, `npm run check`,
   ONE target build + output audit. (CI covers the rest.)
7. Print the exact `git add -f` list of evidence the validator needs (as done
   manually for v0.3.2/v0.3.3) and write evidence under a dated folder.
8. `--dry-run` that changes nothing and reports what it would do.

Keep existing validators and rules unchanged. No prose-pinning tests; at most
one small structural test of the command on a temp copy if needed. Document
usage in 10 lines in `docs/handoffs/` or README. Verify by dry-running against
the current state and by a throwaway trial on a scratch copy/branch reproducing
a tiny edit end-to-end (do not commit that trial). Stop at REVIEW_READY.
No commit/push/deploy.
