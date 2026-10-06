# Website release and recovery

This is an operator procedure for plan M7, not a second milestone tracker or release authorization. The sole tracker is `docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md`. The owner-authorized 75-page first test edition was deployed at R4 §0.56; §0.58 corrects the homepage and RRG name/contact; §0.59 supplies the exact repository/path https://vasylhryha.github.io/rrg_theory/. See `docs/evidence/homepage-clarity/receipt.md` for the current operation and preserved `docs/evidence/first-public-release/receipt.md` for the predecessor. Earlier acceptance remains scoped to its tested inputs.

## Before a public run

Use the owner's named repository, approved public file/history selection and actual Pages access. Preserve private captures, source archives and Rider files. The first-test authorization, accepted fidelity/rights and scoped privacy/release decisions are recorded in `docs/evidence/first-public-release/`; reuse them while their inputs remain unchanged. Record outstanding assistive-technology, human and provenance work honestly. Use the shared policy and content validators; do not fill an evidence reference with this guide or a synthetic test.

Set the authorized target in the shared `config/site.json`, publication credit/rights record and `config/publication-policy.json` together. A project Pages target uses its actual project base; an approved root target uses `/`. GitHub's [publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) describe selecting **GitHub Actions** in repository Settings → Pages. Check which environment and branch protections the actual account supports and configure/record them; an environment name in YAML is not proof of configured protection. Keep the current single pinned workflow. [GitHub's custom-workflow contract](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) describes its job dependencies, artifact and Pages/OIDC permissions.

## Qualify and publish the selected commit

Routine pushes and manual `verify` use `npm run verify:ci`: Astro diagnostics, root/actual-target builds
and output audits, and seven Chromium journeys per base selected by `@routine`.
These cover search, ZIP/RSS, rights/contact/citation, mobile axe/reflow,
math fonts/keyboard scrolling, 404/base-path behavior and the concise homepage's
no-JS/optional-source/mobile accessibility journey. CI has a ten-minute job
limit; five minutes is the target, not a measured guarantee. The full content
regressions, legacy URL fixture, full browser suite and M6 campaign remain in
`npm run verify`, selected explicitly with operation `qualify` for monthly maintenance.
They are not required on every push or `publish`. A routine PASS never counts as
a full-suite PASS. Reuse passing evidence for 30 days while relevant inputs remain
unchanged; changed inputs need focused checks. The 30-day reminder does not block
deployment or create automatic review cycles.
Newer routine checks cancel superseded checks of the same branch; manual
qualification and publication verification use unique run-ID groups and are never automatically
cancelled by this rule.

For this checkout, `git config core.hooksPath .githooks` enables the tracked
pre-push hook. It runs `npm run verify:push` (JSON syntax and Git whitespace,
without source audits, builds or browsers). New checkouts must enable the hook
explicitly; Git does not distribute local hook configuration. Shared build/output
validators still check the actual selected source and accepted fidelity. Generated
routine and pre-push receipts go under ignored `docs/evidence/m7/runtime/`.

1. Review the exact proposed source/config/dependency changes and release timestamp. Use an authorized clean checkout of the selected main commit. Record the raw current-core hash, current inventory seal and publication-manifest digest. Never relabel old dirty previews as this release.
2. Reuse accepted unchanged evidence and run focused checks for changed features. Store generated receipts under ignored `docs/evidence/m7/runtime/`; preserve issued tracked evidence. The full `qualify` campaign is monthly maintenance, not a prerequisite to every publication. Failed full-suite cases remain recorded failures until repaired.
3. After actual owner authorization and platform setup, enable both the shared deployment policy and the repository's `UNITY_DEPLOY_ENABLED` variable coherently. Manually dispatch the single workflow on main with operation `publish`. PRs remain read-only. The preparation job checks publication, builds `dist/deploy` from that clean same-run commit, and seals it before upload; the separately privileged deployment job only invokes the pinned Pages action. Do not add a deploy-time rebuild or substitute another run's artifact.
4. Preserve the **actual** GitHub run URL/ID, uploaded artifact ID, deployment URL and environment decision from the run. In the preparation job, `docs/evidence/m7/runtime/` receives `root-artifact.json` or `subpath-artifact.json` from the shared auditor and `deployment-manifest.json` from the sealer. These receipts are outside the uploaded website. Save these private files and the exact sealed artifact before the runner disappears, using an approved private evidence destination. The current workflow does not upload private evidence; do not assume it survives on GitHub.

The Pages upload has **30-day retention**. The first release's exact artifact, audit/seal and live receipts are captured privately under `docs/evidence/m7/runtime/first-public-release/`. Runner-local files alone do not provide durable recovery. Preserve private copies and their hashes/run/artifact identities. GitHub's [artifact retention documentation](https://docs.github.com/en/actions/tutorials/store-and-share-data) explains retention settings. An expired artifact is unavailable, not a successful rollback candidate.

## Verify the site actually served

After a normal deployment, check the home page, one nested route and real 404
behavior. Do not repeat an exhaustive live-file campaign. For explicit monthly
maintenance or diagnosis of a concrete artifact mismatch, use the retained
**same-run shared audit receipt and seal**, with the corresponding real site config:

```sh
npm run verify:live -- --release docs/evidence/m7/runtime/root-artifact.json --seal docs/evidence/m7/runtime/deployment-manifest.json --config config/site.json --evidence-dir docs/evidence/m7/runtime/live
```

For a project-base release, use `subpath-artifact.json`. This command performs read-only HTTP and Chromium checks. It requires an explicitly authorized HTTPS target and release receipts. It compares every inventoried served file with qualified bytes, including home, nested article/claim, math, references, downloads, RSS/sitemap, search bundle and assets. It binds served build-info and deployment seal to the clean source SHA, run ID, config/input/publication digests; checks real 404 status/body; and exercises no-JS home/math plus the five search queries with scoped, base-correct destinations, selecting a result for each query and checking that its qualified reading opens. It records failures and unavailable browser/network behavior, rather than calling a local preview live. It does not approve content, privacy, rights, assistive technology or human understanding.

Fetch/status failures can reflect host, TLS or access trouble; hash/identity failures indicate the expected artifact was not served unchanged. Investigate the reported URL and reason. Do not loosen byte matching or manufacture a PASS to compensate for hosting behavior. Record actual browser/host observations, public URL and publication identity in the sole plan before separate public acceptance and authorized tagging.

## Recovery and rehearsal

The selected recovery procedure is a **corrective release through the same workflow**. Preserve the faulty release and its receipts. Identify the prior reviewed content/config from retained history; prepare a normal corrective change without renaming the research edition merely for a hosting change. Check affected fidelity/rights/target inputs and the corrected artifact, dispatch the authorized manual main-only pipeline, and check the served home/nested/404 routes. Use the exhaustive live verifier only for a concrete byte-mismatch diagnosis or monthly maintenance. This creates a new explicit release; it does not claim to redeploy an old artifact unchanged.

An approved rehearsal first inventories the retained prior/test artifact and its receipts offline, checks availability and hashes, and walks this corrective-release procedure. Record it as private mechanics if no genuine previous public release exists. Actual live rollback/recovery is NOT_RUN until specifically authorized and executed. Do not rerun an expired workflow, copy old dirty metadata into a new seal, reset shared history or disturb a live site as a rehearsal.

An optional domain comes only after default Pages acceptance and separate owner authorization. Follow plan §6.6 and current GitHub domain guidance; change the shared origin/base, rebuild/requalify affected URLs and then check actual HTTPS, redirects and old incoming links. Missing domain is NOT_APPLICABLE, not a launch blocker.
