# Contribute to RRG

RRG is a public research draft at https://vasylhryha.github.io/rrg_theory/,
maintained by Vasyl Hryha. Questions and commercial enquiries:
vasylhryha.rrg@gmail.com.

## Choose the kind of contribution

- **Website or text correction:** use the [website bug form](https://github.com/VasylHryha/rrg_theory/issues/new?template=website-bug.yml). Include the page, exact passage, expected behavior and reproduction steps.
- **Scientific source correction:** use the [scientific correction form](https://github.com/VasylHryha/rrg_theory/issues/new?template=scientific-correction.yml). Identify the source edition, passage, evidence and proposed correction.
- **New evidence or source:** use the [source suggestion form](https://github.com/VasylHryha/rrg_theory/issues/new?template=source-suggestion.yml). Explain the finding, supplied conditions, relevance and limits; include the primary source.
- **Theory extension or core-change proposal:** use the [theory change form](https://github.com/VasylHryha/rrg_theory/issues/new?template=theory-change.yml). Distinguish a compatible extension from a change to a locked definition.

Do not paste private correspondence, credentials or restricted papers into an
issue. A public suggestion does not become an adopted definition or a verified
result merely by being submitted.

## Write one explanation

Start with one reader question. Read the relevant original documents in
`research/RRG_CURRENT/`; they own the theory's meaning. Choose existing record IDs
and dependencies. Keep explanation, proposal and actual result separate, with
citations beside claims and scope beside reported results.

Add a draft under `research/publication/pages/` using the shared entry schema:
stable ID/route, edition, audience, actual date, dependencies, source mapping and
limits. Source readings use `canonical-documents.yaml` sidecars; do not put website
frontmatter into the original scientific files. Reuse registered directives such
as `:claim[UT-D01]` and `:cite[BIB-0001]` only with real existing IDs.

Make original-byte downloads and explanatory exports easy to distinguish.
Markdown and ZIP exports are generated mirrors; do not maintain separate edited
copies. Articles need tags, an actual publication date and the approved author
metadata. Website revisions do not automatically change the research edition.

## Check and review the change

Run focused checks for affected content and behavior. Use the sole Revision 4
plan, `docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md`, for current status.
Keep evidence under `docs/evidence/`, never `public/`.

Implementation stops at REVIEW_READY. One independent bounded High review
compares affected source/display representations and records genuine decisions
through `website-reviews.yaml`. Pending/stale decisions are not approvals. A
reviewer may fix and accept material defects in that same session; do not create
an automatic second review cycle.

A scientific revision has its own versioned change-control process: preserve the
previous edition, explain the problem and update sources and dependencies together.
Website review checks source fidelity rather than independently adjudicating the
theory or requiring a new paper audit.

In a pull request, describe reader-visible behavior, affected sources/dependencies,
actual checks and remaining limits. Add tests for meaningful behavior, not trivial
prose or a mirror of the implementation.

## Rights

About, Cite, CFF, Rights and the footer use the same approved metadata record.
Research prose/original figures have the declared CC BY-NC-SA 4.0 grant and the
additional CC BY 4.0 grant from 1 January 2033 UTC. Existing permissions continue.
Website code and separately distributed data/evidence remain all rights reserved.
A public repository makes them inspectable; it does not create a software reuse
license. See `RIGHTS.md` and the scoped legal texts. Third-party works retain their
own terms, and dependency licenses do not license the project.

## Current publication workflow

The existing repository is `VasylHryha/rrg_theory`. GitHub Pages uses Actions,
HTTPS and the `github-pages` environment with a main-branch policy. The first
owner-authorized public test edition was released on 6 October 2026. The selected
75 current readings had scoped fidelity acceptance for that edition; 21 archived
entries remain stale and excluded. The combined presentation at R4 §§0.60–0.62 received its one independent bounded
High website-fidelity/editorial acceptance in §0.63 and is not deployed. See
`docs/evidence/site-wide-acceptance/receipt.md` for actual qualification and limits.
Later changes can invalidate affected decisions.

One workflow, `.github/workflows/site.yml`, has read-only PR checks and a manual
main-only verify → prepare → deploy publication operation. Only the deploy job
receives Pages/OIDC write permission. Preparation validates the actual target,
identity, rights, privacy and selected source-fidelity qualification, builds and
seals the release, and checks that exact artifact before upload. Deployment uses
that artifact without rebuilding it. A private preview cannot be uploaded as a
release. Enabling a variable does not replace the recorded owner authority.

The owner explicitly keeps the public research draft indexable. Release robots,
page metadata and sitemap agree; private previews remain excluded from indexing.
Custom domain/DNS remains deferred. No environment-reviewer or branch-protection
feature is claimed unless it has actually been configured and inspected.

The existing scoped repository/history privacy decision and release receipts are
preserved. New private material needs an appropriate review before public sharing;
do not assume every local file belongs in a commit or website download.

Pre-push checks cover syntax/whitespace. Routine CI and publication use diagnostics,
shared build/output validation and short browser checks. Heavy source/history,
full-regression, broad browser/performance and exhaustive live-file campaigns run
monthly, with unchanged passing evidence reused for 30 days. Thirty days is a
maintenance reminder, not a deployment expiry. Changes get focused affected checks.

Dependabot proposes monthly dependency updates without automatic merging or
scientific publishing. Renderer/dependency changes may stale fidelity decisions;
check their actual effects proportionately.
