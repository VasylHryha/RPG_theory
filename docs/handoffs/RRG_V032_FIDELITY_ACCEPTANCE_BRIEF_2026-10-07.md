# Brief: v0.3.2 website fidelity acceptance and release selection (7 Oct 2026)

Separate bounded High website fidelity acceptance of the v0.3.2 state already
accepted in `docs/evidence/source-revision-v0.3.2/acceptance.md`. Follow
AGENTS.md; reuse the v0.3.1 approach (`docs/evidence/fidelity-v031/`, its
`recheck/` decisions and `record-reviewed-repairs.ts`/`integrate.py` tooling).
Authorization: `docs/evidence/fidelity-v032/owner-authorization.md`.
Evidence under `docs/evidence/fidelity-v032/`.

- Accept the 84 pending current readings in `website-reviews.yaml` via the
  shared fidelity validator. Real content deltas exist only in DOC-WORLD (new
  §7.3 paragraph), DOC-FOUNDATION-ERRATA (Earlier editions list) and
  DOC-BACKGROUND (site note). Actually read those three against
  `research/RRG_CURRENT/`. For the other 81, confirm the delta is only
  edition/registry/renderer metadata and reuse the prior v0.3.1 comparisons.
  Repair material defects if found; never manufacture decisions. Preserve the
  21 archived stale decisions and prior decisions.
- Select release `site-2026.10.07-v032` (preserve the previous selection under
  `before/`), `currentSourceQualified=true`.
- Fast focused checks only, once: shared fidelity validator, `npm run check`,
  both qualification builds + output audits (`/` and `/rrg_theory/`), content
  tests reusing the built output via `UNITY_CONTRACT_OUTPUT`. No new tests, no
  broad campaigns. Browser smoke is run by Claude.
- List every ignored evidence path that must be force-added in
  `docs/evidence/fidelity-v032/required-force-add-paths.txt` (as v0.3/v0.3.1),
  including the v0.3.2 source-revision evidence the validator/CI loads.
- Short receipt `docs/evidence/fidelity-v032/receipt.md`. Stop at
  REVIEW_READY. No commit, push or deploy.
