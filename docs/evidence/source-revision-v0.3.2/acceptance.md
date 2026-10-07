# RRG v0.3.2 — bounded High acceptance (Claude, 7 Oct 2026)

**ACCEPTED** — source revision and website foundation-snapshot access, as
delivered in [receipt.md](receipt.md) and [recheck/receipt.md](recheck/receipt.md).

- **Source:** `01_world_explanation.md` diff is the edition line plus the exact
  owner-approved §7.3 paragraph (feedback §22, "main interactions" wording);
  no other scientific text changed. CHANGELOG `RRG-2026-10-07-V032-FORCES-RATIONALE`
  is accurate. All 24 v0.3.1 members under
  `research/history/repository-current-v0.3.1-2026-10-07/` match `HEAD` bytes (24/24).
- **Website:** Foundation errata ends with "Earlier editions" — three raw
  downloads labelled "v0.1 — superseded, kept unchanged for the record", each
  beside its current page; download bytes equal the snapshots. Recursive
  background keeps its source header unchanged and adds a site note linking
  there. The World explanation shows the new paragraph. Code change is small
  (`src/lib/content.ts`, `src/lib/library.ts`).
- **Browser smoke (run here, Codex sandbox could not):** `npm run test:e2e`
  7/7 PASS at `/rrg_theory/` and `/` on the recheck outputs —
  [acceptance/e2e-target.log](acceptance/e2e-target.log),
  [acceptance/e2e-root.log](acceptance/e2e-root.log).
- **Reused:** Codex's recheck PASS for fidelity validator, diagnostics, both
  builds/output audits and artifact checks; not repeated.

**Next (not done):** website fidelity acceptance of the 84 pending readings —
real content deltas only in World explanation, Foundation errata and Recursive
background; the rest are edition/registry metadata — then release selection,
commit, push and deploy, each with owner approval.
