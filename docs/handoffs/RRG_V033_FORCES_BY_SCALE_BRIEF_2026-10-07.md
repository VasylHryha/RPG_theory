# Brief: RRG v0.3.3 forces-by-scale box — one combined pass (7 Oct 2026)

Owner-approved ("yes overall good", feedback §23; "do it", 7 Oct). Owner wants
this FAST: one run, no separate recheck. Follow AGENTS.md proportionate rules.

## 1. Source (exact text)

In `research/RRG_CURRENT/01_world_explanation.md` §6.1, insert this paragraph
directly after the paragraph starting "Gravity supplies astronomical gathering"
and before "Existing E01, E07, E18 and E19":

```
**The four forces, by scale.** Physics already knows that each fundamental force dominates a different range of sizes: the weak interaction transforms the smallest building blocks, for example turning a neutron into a proton; the strong interaction holds nuclei; electromagnetism holds atoms, chemistry and life; gravity gathers stars and galaxies. These are dominance bands, not exclusive territories: electromagnetism and gravity reach indefinitely, and the strong interaction also acts inside protons and neutrons. RRG reads this as the same pattern it describes everywhere: each level of organization supplies the building blocks for the next. In that reading the weak interaction is a transformer rather than a holder: larger-scale conditions, such as the interior of a star, make its changes happen more or less often. The author did not design RRG around the four forces; the correspondence was noticed afterwards. That makes it an encouraging fit, but not a test: this is established physics that RRG fits, not evidence for RRG. An open question is whether RRG can predict something new from this hierarchy that could turn out wrong.
```

No other scientific wording changes. Edition "RRG v0.3.3 — forces by scale,
2026-10-07"; preserve v0.3.2 under
`research/history/repository-current-v0.3.2-2026-10-07/`; same edition
procedure/tools as v0.3.2 (`docs/evidence/source-revision-v0.3.2/`).

## 2. Website fidelity + selection in the same run

Accept the pending readings as in `docs/evidence/fidelity-v032/` (reuse its
`record-decisions.ts`/`select-release.ts`): only DOC-WORLD has a real content
delta — read it against the source; the rest are edition metadata, reuse prior
comparisons. Select `site-2026.10.07-v033` (authorization:
`docs/evidence/fidelity-v033/owner-authorization.md`). Evidence under
`docs/evidence/source-revision-v0.3.3/` and `docs/evidence/fidelity-v033/`.

## 3. Checks — once, fast

Source revision validator, fidelity validator, `npm run check`, both
qualification builds + output audits (`dist/fidelity-v033-root`,
`dist/fidelity-v033-target`), content tests reusing output via
`UNITY_CONTRACT_OUTPUT`. No new tests, no broad campaigns. Browser smoke is
Claude's. Update the plan tracker. One short receipt. Stop at REVIEW_READY;
no commit/push/deploy.
