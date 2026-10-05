# Decisions that can wait until publication

Private website development can continue with every field below pending. You do
not need to create an account, choose a license or provide personal details now.
M5 implements the display and permission boundaries; it does not publish the site.

## 1. Public credit

Choose the exact name readers should see: your real name, a pseudonym, or an
approved project/organization credit. Supply the spelling you want on About,
Cite, the footer and CITATION.cff. No private name or unrelated account will be
used by inference. Current project title: “Unity Theory / RRG”.

A contact address or HTTPS contact page is optional. Only supply one you consent
to make public; it may become the contact for questions and commercial discussions.
An ORCID is optional and can be omitted entirely. The public name is needed for
final credit, but these optional fields do not block publication if omitted.

## 2. GitHub target

Choose the GitHub account or organization and repository name that will hold the
approved public website source. Also decide who can maintain it. A repository
must be explicitly authorized before creation or push. This local checkout has
original research, archives, review evidence and Rider files; making the whole
checkout public is not an acceptable shortcut.

The public source selection and any Git history must be reviewed for private
material, rights and secrets. Branch rules, CODEOWNERS and deployment-environment
reviewers will depend on real supplied usernames and the protections available
for that account/plan. None has been configured remotely here.

## 3. Permanent website URL

Choose the URL readers should cite. It can be a GitHub Pages URL; a custom domain
is optional. The current `.invalid` preview address is deliberately temporary.
The final URL must match the approved repository, base path and release metadata.
DNS changes need separate authorization if a custom domain is later chosen.

## 4. Separate rights choices

Choose separately for website code, research prose/figures and data/evidence.
For each scope, either approve a named standard license or explicitly approve
granting no additional license. Selection can remain pending while working
privately. A standard license will be installed unmodified and scoped to the
material you identify; one license will not silently cover everything.

For example, code and prose can have different licenses. A non-commercial content
license is one possible choice, not a choice already made. Third-party material
needs its own rights treatment. Lawful exceptions remain applicable. Do not
select a license until you are comfortable with its permissions: valid Creative
Commons permissions already granted cannot simply be withdrawn later.

Attribution is requested. The recorded possible 5–10% commercial negotiation is
an internal preference, not an automatic fee owed by every user. Any such
agreement would be separately negotiated. Copyright in text/figures does not
create ownership of an underlying scientific idea. No commercial contact, rate,
agreement or license has been inferred or published by this implementation.

## 5. Which material may be public

Approve the intended published documents and their wording, exact fidelity
decisions, rights and privacy. Drafts and stale decisions are not approvals.
Original sources and history are not automatically safe to redistribute merely
because they were supplied in a private handoff. Evidence/history is excluded
from the current package; adding it needs an explicit reviewed selection.

## 6. Final release authorization

After M6’s integrated checks, authorize a named target and exact reviewed release.
Only then can the disabled manual deployment path be enabled. The final source
commit, build inputs, document selection and artifact hashes must agree. A PR,
passing tests or pressing the workflow button does not itself supply those
approvals. The default action is private verification.

When ready, you can provide a short note with public credit, optional public
contact/ORCID, repository owner/name, permanent URL, and a rights choice for each
scope. Missing items can remain marked pending; there is no deadline imposed here.

Background sources: [U.S. Copyright Office](https://www.copyright.gov/what-is-copyright/),
[Creative Commons FAQ](https://creativecommons.org/faq/#what-if-i-change-my-mind-about-using-a-cc-license),
and [GitHub deployment protections](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
