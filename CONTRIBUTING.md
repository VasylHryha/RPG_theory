# Authoring a website explanation

Start with one reader question. Read the relevant original documents in
`research/RRG_CURRENT/`; those bytes own the theory's meaning. Choose existing
record IDs and source dependencies. Keep explanation, proposal and actual results
separate, with citations beside material claims and scope beside reported results.

Add a draft Markdown page under `research/publication/pages/` using the shared
entry schema (stable ID/route, edition, audience, real update date, dependencies,
source mapping and explicit limits). Article publication needs tags, a real
publication date and displayed author identity from the approved metadata source,
`research/publication/metadata.json`. Never infer personal credit. Use
`:claim[UT-D01]`, `::claim{id="UT-D01" view="plainLanguage"}` and
`:cite[BIB-0001]` only with real registered IDs. Original source readings use
`canonical-documents.yaml` sidecars, not new frontmatter in original bytes.

Run the shared content validator and focused checks for the change. Stop the
implementation at REVIEW_READY. A separate bounded High review compares the
source and display and records genuine fidelity decisions through
`website-reviews.yaml`. Existing pending/stale decisions are not approvals.

Publication is an explicit manifest selection: reviewed published entries and
dependencies, approved rights, dates bounded by `release.json`, and approved
credit/permanent URL. Explanatory Markdown and ZIP members are generated from
canonical parsed content; do not edit or maintain them independently. Original
downloads retain exact bytes and hashes. No evidence/history is distributed by
default. Missing identity/rights keeps CITATION.cff inactive. Research edition,
website release, source commit and dirty input digest remain distinct.

Keep evidence under `docs/evidence/`, never `public/`. Use the sole Revision 4
implementation plan for milestone status. Public actions require an explicitly
authorized target; this private authoring recipe grants no deployment or license.

## Reports and changes

Use the relevant issue form: website bug, scientific correction, source
suggestion or proposed theory change. Include the affected record ID, exact
passage, evidence or reproduction, proposed change and limitations. Distinguish
source-reported evidence from a check you actually ran. Do not paste private
correspondence, credentials or restricted full-text papers into an issue.

Website bugs need reproducible steps and expected/observed behavior. Scientific
reports may identify an issue for later research review; they do not authorize
rewriting sources in the website lane. A proposed locked-core change must address
the original change-control proof gate and preserve the previous edition. No
proposal silently supersedes a registered meaning.

In a pull request, explain content/code impact, changed sources and dependants,
before/after review fingerprints, actual checks and unperformed checks. Add
meaningful tests for changed behavior, rather than tests of trivial prose. Follow
the sole implementation plan and stop implementation at REVIEW_READY.

## Identity, rights and publication

About, Legal, Cite, CFF and the footer use the same approved metadata record.
Public name/pseudonym, optional contact/ORCID and repository credit must come from
explicit owner decisions. Rights are separate for code, research prose/figures
and data/evidence. Pending selection grants no additional license. See RIGHTS.md;
dependency notices do not license the research.

`npm run check:publication` validates contribution/workflow structure, screens
the actual engineering inputs and private-preview exports for named secret
patterns, inventories unapproved repository material and reports release gates.
Its PASS means the checks ran; it is not privacy, legal or publication approval.
The whole local checkout contains sources, archives and evidence that must not be
made public by pushing it wholesale. An owner-approved public file selection and
history/privacy review are required before creating or pushing a public checkout.

There is one workflow in `.github/workflows/site.yml`. PR runs have read-only
repository permission, no deployment environment, no secrets and no artifact
upload. Manual publication is a separate verify → prepare → deploy chain in the
same run. Only the deploy job gets Pages/OIDC write permission; it executes only
the pinned Pages action. Preparation checks target, identity, scoped rights,
privacy, public-content approval and M6 qualification before building/sealing the
exact artifact. A private preview can never be uploaded for deployment.

Deployment is disabled in `config/publication-policy.json` and by the absent
`UNITY_DEPLOY_ENABLED` repository variable. Enabling a variable is not approval.
The current builder/auditor still refuse public release until M6 qualifies that
pipeline. No GitHub branch rules, environment reviewers or CODEOWNERS are claimed
configured: no authorized target/usernames/platform access were supplied. Later
configuration must use real supplied accounts and record what the platform
actually permits. No remote action is authorized by these instructions.

Dependabot proposes monthly npm/Actions updates with at most two open PRs per
ecosystem; major updates require manual selection. There is no automatic merge
or scheduled scientific publication. A dependency/renderer change can stale
fidelity decisions and needs proportionate affected checks.
