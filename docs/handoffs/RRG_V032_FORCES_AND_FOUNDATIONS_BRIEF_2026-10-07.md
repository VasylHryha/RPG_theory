# Brief: RRG v0.3.2 forces rationale + reachable foundation snapshots (7 Oct 2026)

Owner-approved in `RRG_OWNER_FEEDBACK_2026-10-06.md` §22. Follow AGENTS.md and
plan R4 (§0.3/§4.5 for the source change). Proportionate work: focused affected
checks once, no broad audits, no new prose-pinning tests. Stop at REVIEW_READY.
No commit, push or deploy.

## A. Source revision v0.3.2 (scientific authoring, owner-approved wording)

In `research/RRG_CURRENT/01_world_explanation.md` §7.3 "New levels bring new
ways to interact", insert a new paragraph directly after the paragraph that
starts `**Speculative RRG hypothesis:**` (before "The effective-law discussion…"):

```
**Why RRG considers this:** the main interactions each dominate a different level of organization, and each level arose from conditions earlier levels created. If forces too were enabled by an environment that earlier levels transformed, they would follow the same RRG cycle — lasting shapes change their surroundings, and a new scale of geometry and interaction becomes possible. This fit motivates the hypothesis; it is not evidence for it.
```

Use this exact text. Do not change any other scientific wording, definitions,
claim IDs/statuses or evidence. Then do the same coherent edition procedure as
v0.3.1 (see `docs/evidence/source-revision-v0.3.1/receipt.md`, reuse its
`register-edition.mjs`/`preserve.py` approach):

- preserve all v0.3.1 members byte-exact under
  `research/history/repository-current-v0.3.1-2026-10-07/`;
- edition label "RRG v0.3.2 — forces rationale, 2026-10-07"; update the
  01 edition line, CHANGELOG (§4.5 record), CURRENT_MANIFEST, SOURCE_AUTHORITY,
  README/sources.json only where edition metadata requires it;
- if 08_claim_coverage H26/O4 notes reference §7.3 wording, keep them accurate
  (a pointer only; no status change);
- transaction `research/publication/source-revision-v0.3.2.json`, registration
  and derivative rebinding via existing tools; `npm run check:source-revision`
  against a v0.3.1 predecessor root.

## B. Website only: make the foundation snapshots reachable

Doc 04's header names `foundations/01_world_explanation.md`, `02_…`, `03_…`,
but the site neither shows nor offers them. Common practice (W3C "previous
version", RFC "obsoleted by"): superseded editions stay frozen, reachable and
clearly labelled, pointing to the current edition.

- Offer the three snapshot files as original downloads (raw bytes, like the
  existing `R-CURRENT-FOUNDATIONS-ERRATA-MD` download), labelled
  "v0.1 — superseded, kept unchanged for the record".
- On the Foundation errata page (`/documents/foundation-errata/`), add a short
  "Earlier editions" list: each snapshot download next to a link to its
  current page (World explanation, Scientific framework, Mathematical core).
- On the Recursive background page (`/framework/recursive-background/`), add a
  one-line site note under the source header linking to that list. Do not alter
  the source header text itself (fidelity).
- Do not render the v0.1 text as site pages.

## C. Fidelity and checks

- Run the shared website fidelity validator. Rebind/re-accept only the
  readings actually affected (World explanation, Foundation errata, Recursive
  background, and any whose fingerprint legitimately goes stale); record
  decisions in `website-reviews.yaml` per existing practice. Never manufacture
  decisions — if a decision truly needs the owner, list it.
- Focused checks: sources current/history, source revision, `npm run check`,
  preview build + output audit at both base paths, content tests, short smoke
  e2e. Evidence under `docs/evidence/source-revision-v0.3.2/` with a short
  receipt (delivered, checks, blockers, next).
- Verify the new download links resolve in the built output and the World
  explanation page shows the new paragraph.
