# Unity Theory / RRG — Local Rebind + GitHub Pages Deployment Handoff
## Operational prompt for Codex / implementation agent · 5 October 2026

> **Purpose:** finish the v0.2.1 source rebind, repair source/link provenance, qualify the actual GitHub Pages target, and deploy through GitHub Pages now.  
> **Later:** only after explicit project approval, migrate the same qualified site to a custom DNS/domain name.

---

# 0. Owner decisions — treat these as authoritative

1. **Scientific source baseline**
   - Keep `research/RRG_CURRENT/` as the selected repository-current scientific source.
   - Current edition: **RRG v0.2.1 repository current; audited companion 2026-10-02; promoted 2026-10-05**.
   - Do **not** revert the source promotion.
   - `00_LOCKED_CORE.md` remains the minimal normative core unless changed through its explicit change-control/version process.
   - Current v0.2.1 04–08 documents remain the current publication/evidence companions.

2. **Deployment decision**
   - **For now use GitHub + GitHub Pages.**
   - Repository: `VasylHryha/RPG_theory`.
   - Temporary/default public project-site target:
     - origin: `https://vasylhryha.github.io`
     - base path: `/RPG_theory/`
     - expected site URL: `https://vasylhryha.github.io/RPG_theory/`
   - Reuse the existing GitHub Actions workflow in `.github/workflows/site.yml`.
   - Keep publication owner-controlled/manual after verification; do not invent a second deploy pipeline.

3. **DNS/custom domain decision**
   - **DEFERRED UNTIL PROJECT APPROVAL.**
   - Do not configure a custom domain now.
   - Do not add or change DNS records now.
   - Do not add a `CNAME` file now.
   - Do not change GitHub Pages custom-domain settings now.
   - After explicit approval, perform a separate target migration described in §11.

4. **Local work protection**
   - The owner is actively changing the local project.
   - Preserve unrelated local changes.
   - Never use `git reset --hard`, destructive checkout, blanket revert, or `git clean -fd`.
   - Do not overwrite files merely to match an older remote snapshot.
   - Inspect and adapt to the actual checkout before editing.

5. **Quality rule**
   - Fix real source/mapping problems even if that requires breaking/reworking old website bindings.
   - Do not make CI green by restoring superseded source files or weakening integrity checks.
   - Do not manufacture review acceptance.
   - Do not create a proof requirement that the theory documents explicitly do not require.

---

# 1. First action: inspect the actual local state

Before changing anything:

```sh
git status --short
git branch --show-current
git remote -v
git fetch origin
git log --oneline --decorate -n 15
git diff --stat
```

Then inspect:

```text
README.md
START_HERE.md
docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md
config/research-source.json
config/site.json
research/RRG_CURRENT/CURRENT_MANIFEST.md
research/RRG_CURRENT/SOURCE_AUTHORITY.md
research/publication/source-index.yaml
research/publication/canonical-documents.yaml
research/publication/records.yaml
research/publication/references.yaml
research/publication/citation-aliases.yaml
research/publication/website-reviews.yaml
src/lib/source-admission.ts
src/lib/content.ts
src/lib/content-schema.ts
.github/workflows/site.yml
```

Do not assume the remote snapshot is newer than the working tree. Preserve the owner’s local edits where they are compatible with this handoff.

---

# 2. Current known remote problem

The scientific source promotion is complete, but the website semantic layer still describes the predecessor source set.

On the last inspected remote snapshot:

- `research/publication/source-index.yaml` still references:
  - `04_status_and_blockers.md`
  - `06_PROOF_MATRIX.md`
  - `07_EMERGENT_INTERACTION_EVIDENCE.md`
  - `07_UPDATE_MANIFEST.json`
  - `08_ADDITIONAL_PRIMARY_EVIDENCE.md`
- those files are no longer active members of `research/RRG_CURRENT/`;
- `canonical-documents.yaml` and `records.yaml` still contain predecessor source keys and predecessor `researchEdition` values;
- `references.yaml` still maps useful external papers to superseded source authorities;
- this causes source-registry failure and blocks qualification.

**Do not restore the removed old files as current just to satisfy old mappings. Fix the mappings.**

---

# 3. Rebuild source-index around the selected v0.2.1 current package

## 3.1 Keep stable keys where they still mean the same thing

Keep these existing keys if their source bytes remain the selected source:

```text
R-CURRENT-CORE      -> research/RRG_CURRENT/00_LOCKED_CORE.md
R-CURRENT-WORLD     -> research/RRG_CURRENT/01_world_explanation.md
R-CURRENT-SCIENCE   -> research/RRG_CURRENT/02_scientific_framework.md
R-CURRENT-MATH      -> research/RRG_CURRENT/03_mathematical_core.md
R-CURRENT-CONTROL   -> research/RRG_CURRENT/05_CHANGE_CONTROL.md
```

Update their `edition` to the exact current admission edition from `config/research-source.json`.

Do not change their hashes unless the local file bytes actually changed through an authorized source revision.

## 3.2 Add explicit keys for v0.2.1 current companions

Recommended stable keys:

```text
R-CURRENT-SOURCE-DIRECTION     -> 04_recursive_background_generation.md
R-CURRENT-MATH-ILLUSTRATIONS   -> 05_mathematical_source_model.md
R-CURRENT-EVIDENCE             -> 06_evidence_catalog.md
R-CURRENT-AUDIT                -> 07_audit_report.md
R-CURRENT-CLAIMS               -> 08_claim_coverage.md
R-CURRENT-CHANGELOG            -> CHANGELOG.md
R-CURRENT-MANIFEST             -> CURRENT_MANIFEST.md
R-CURRENT-GUIDE                -> README.md
R-CURRENT-AUTHORITY            -> SOURCE_AUTHORITY.md
R-CURRENT-SOURCE-REGISTER      -> sources.json
```

Use the exact current file SHA-256 values from the actual checkout/admission record.

## 3.3 Represent supporting package members without making them theory authority

The current intake also contains:

```text
foundations/01_world_explanation.md
foundations/02_scientific_framework.md
foundations/03_mathematical_core.md
foundations/ERRATA.md

checks/baseline_hashes.json
checks/package_validation.json
checks/validate_package.py
checks/verification_results.json
checks/verify_small_results.py
```

They are package members/provenance/audit support, not additional current definitions.

Add source-index records for them so package integrity can be represented, but do not let a foundation snapshot or check receipt become a normal claim authority.

Suggested keys:

```text
R-CURRENT-FOUNDATION-01
R-CURRENT-FOUNDATION-02
R-CURRENT-FOUNDATION-03
R-CURRENT-FOUNDATION-ERRATA
R-CURRENT-CHECK-BASELINE
R-CURRENT-CHECK-PACKAGE
R-CURRENT-CHECK-VALIDATOR
R-CURRENT-CHECK-MATH-RESULTS
R-CURRENT-CHECK-MATH-SCRIPT
```

---

# 4. Fix the source-registry architecture: package membership != scientific authority

Current `validateCorpus()` conflates:

1. files admitted into the selected `RRG_CURRENT` package; and
2. files that are active scientific/publication authorities.

Fix that distinction cleanly.

## Required behavior

- Every file listed by `config/research-source.json.files` must be represented by a source registry entry whose path and hash match.
- A source under `research/RRG_CURRENT/` may be a current **package member** without being a current **claim authority**.
- `declaredCurrent: true` should be reserved for source/governance/publication documents that may legitimately support current website content.
- Foundation snapshots and check files should normally be `declaredCurrent: false`.
- Historical sources under `research/history/` remain historical and must not satisfy the current-package coverage requirement.

## Recommended implementation

Change the current exact-coverage check from the conceptual equivalent of:

```ts
sources.filter(s => s.declaredCurrent)
```

to package coverage based on paths inside the admitted directory:

```ts
source.path starts with `${record.directory}/`
```

Then separately enforce:

- current-authority entries must belong to the admitted package;
- their hashes must match;
- their edition must match the admitted edition;
- a historical or support source may not silently become a current claim authority.

Do not weaken byte-integrity checks.

---

# 5. Rebind canonical documents and records

Update all active entries to:

```text
researchEdition =
RRG v0.2.1 repository current; audited companion 2026-10-02; promoted 2026-10-05
```

or, preferably, derive/use the exact edition string from the source admission consistently instead of duplicating it manually in many places.

## 5.1 Replace predecessor source mappings

Old source keys must no longer be active authorities:

```text
R-CURRENT-STATUS
R-CURRENT-PROOF
R-CURRENT-INTERACTIONS
R-CURRENT-UPDATE-RECEIPT
R-CURRENT-ADDITIONAL
```

Either:

- remove them from current records, or
- preserve them only as explicitly historical aliases pointing to
  `research/history/repository-current-2026-10-01/...`
  with `declaredCurrent: false`.

## 5.2 Suggested current mappings

### Research status page

Use:

```text
R-CURRENT-AUDIT
R-CURRENT-CLAIMS
R-CURRENT-EVIDENCE
R-CURRENT-SOURCE-DIRECTION
R-CURRENT-CORE
```

The current status should distinguish:

- current proposal;
- evidence already collected;
- open conjectures;
- known limitations;
- optional mathematical work.

### Old “proof matrix” page

Do not pretend `06_PROOF_MATRIX.md` is still current.

Prefer one of:

- rename/rework the page into **Claim and evidence map** based on current `08_claim_coverage.md` + `06_evidence_catalog.md`; or
- keep its route for compatibility but change its content/source mapping to current claim/evidence documents.

If preserving the old document for historical reading, label it historical.

### Interaction evidence page

Do not source-bind it to the removed `07_EMERGENT_INTERACTION_EVIDENCE.md`.

Use an authored/derived current page that:

- points to current 06 evidence where applicable;
- points to current 04/08 for the open interaction/effective-law hypothesis;
- can cite selected predecessor external papers through preserved BIB identities;
- clearly marks recovered predecessor evidence as related evidence, not as a current source document unless explicitly re-adopted later.

### Additional evidence page

Do not source-bind to the removed `08_ADDITIONAL_PRIMARY_EVIDENCE.md`.

Either:

- supersede the old page and create a current **Related evidence / further cases** page, or
- keep it as an explicitly historical page.

---

# 6. Fix local claim/evidence identifier collisions without renumbering everything

Do not treat source-local labels as globally unique.

## Current conflict

`04_recursive_background_generation.md` has its own `C1`, `C2`, etc.

`06_evidence_catalog.md` also has `C0…C7`.

These are different namespaces.

Use internally qualified IDs such as:

```text
R-CURRENT-SOURCE-DIRECTION:C1
R-CURRENT-EVIDENCE:C1
```

Keep original visible labels inside the source documents.

## Evidence case IDs

Current catalogue:

```text
R-CURRENT-EVIDENCE:E01 … E22
```

Archived predecessor register:

```text
R-HISTORY-2026-10-01-ADDITIONAL:E01 … E09
```

Never resolve an archived `E01` as current catalogue `E01`.

If a predecessor case is later formally adopted into a new current scientific release, give it a new current case ID under that release rather than silently remapping the old local number.

---

# 7. Bibliography/source-link migration

## 7.1 Preserve BIB IDs

Do not wholesale renumber `BIB-xxxx`.

The bibliography already contains useful stable identities and alternate-version links.

Preserve `primaryId` relationships.

## 7.2 Update provenance

For each `references.yaml` item:

- keep the external paper identity;
- update `sourceRefs` so they point either to:
  - a valid current source key, or
  - a valid explicit historical source key;
- do not point to deleted current-source paths.

## 7.3 Improve `supportScope`

Avoid generic text like only:

> does not prove universal RRG.

Each featured source should positively say what it contributes.

Use this pattern:

```text
What this source contributes:
The specific measured/derived result.

Current RRG connection:
The exact local operation or open question it informs.

Supplied conditions:
Apparatus, field, drive, model assumptions, material, etc.

Important boundary:
What the paper does not establish.

Verification depth:
Metadata / abstract / relevant results / full methods / reproduction.
```

## 7.4 High-value related sources to retain/recover

Do not restore the predecessor document as current authority, but preserve/reuse these external papers:

- He et al. — optical supramolecular structures.
- Weng et al. — heteronuclear soliton molecules.
- Fu et al. — mechanochemical liposome feedback.
- Godino et al. — Min proteins / liposome deformation.
- Prindle et al. — biofilm electrical communication.
- Liu et al. — distant biofilm coordination.
- Tikhomirov et al. — staged DNA origami assembly.
- Pecora et al. — cluster synchronization.
- Baumann et al. — merge with the already-current atom–cavity case; do not count twice.

Also add/recover when appropriate:

- Ratzke & Gore — environmental pH modifying bacterial interactions.
- Bardeen–Cooper–Schrieffer — principal theoretical anchor for conventional phonon-mediated pairing.

Use the next free BIB IDs in the actual local checkout; do not assume fixed numbers if local work has already added records.

## 7.5 Keep comparator/constraint sources

Do not delete E17/E22 or other inconvenient cases.

They help prevent overclaiming such as:

```text
strongest resonance always wins
```

or:

```text
all vibration-driven organization is resonant.
```

---

# 8. Split immutable release validation from living current validation

The copied v0.2.1 validator hardcodes the original case set `E01…E22`.

That is valid only as a validator for the original audited v0.2.1 release.

## Keep

Preserve an **original-release validation** path that checks the immutable audited release exactly.

Recommended location if you add it to GitHub:

```text
research/releases/RRG_v0.2.1_audited/
```

This is optional but strongly recommended for provenance.

Do not mix that exact release into editable `RRG_CURRENT`.

## Add/update

Create/adjust a **living-current validation** path that checks:

- unique case IDs;
- every declared case appears exactly once in the current catalogue;
- every catalogue case exists in `sources.json`;
- DOI syntax/identity;
- no duplicate study accidentally counted through alternate URLs;
- all local links/anchors resolve;
- current manifest/source-index/config agree;
- source-qualified claim IDs resolve;
- references to archive/download paths actually have destinations;
- current source review state remains honest.

Do **not** require that a living catalogue forever contain exactly 22 cases.

---

# 9. Finish source/content verification before deployment

During development, run focused checks after coherent batches.

At minimum:

```sh
npm ci
npm run check
npm run check:sources
npm run test:content
```

For changed content records:

```sh
npm run check:content -- --changed <entry-id>
```

Do not auto-write accepted reviews.

Once source keys, canonical records, references and routes are stable:

```sh
npx playwright install --with-deps chromium firefox webkit
npm run verify
```

Expected behavior:

- source-registry failure is gone;
- old removed source paths do not appear as active current authorities;
- stale review fingerprints are reported honestly where content changed;
- qualification remains blocked until required reviews/rights/publication conditions are actually satisfied.

Do not make the suite pass by setting stale decisions to accepted.

---

# 10. GitHub Pages deployment — current target

## 10.1 Temporary production target

For the GitHub project site use:

```json
{
  "origin": "https://vasylhryha.github.io",
  "basePath": "/RPG_theory/",
  "repository": {
    "owner": "VasylHryha",
    "name": "RPG_theory"
  },
  "publicAuthorization": false
}
```

`origin` must remain a bare HTTPS origin. The repository subpath belongs in `basePath`.

Do not set `publicAuthorization: true` merely to make a build pass.

Set it to `true` only in the final owner-authorized release state after required publication gates are satisfied.

## 10.2 Real target qualification

The old `/unity-theory/` subpath remains a regression fixture only.

Before publishing, qualify the real target:

```text
/RPG_theory/
```

Check at least:

- home;
- `/start/`;
- framework/concepts;
- evidence pages;
- math;
- research status / claim map;
- references;
- articles;
- downloads;
- search;
- RSS;
- sitemap;
- canonical URLs;
- Open Graph / metadata;
- 404;
- asset paths;
- Pagefind destinations;
- KaTeX/MathML/font assets;
- no-JS navigation;
- mobile/reflow.

## 10.3 Use the existing workflow

Reuse:

```text
.github/workflows/site.yml
```

Keep the existing three-stage shape:

```text
verify -> prepare -> deploy
```

Recommended trigger behavior:

- PR: verify.
- push to `main`: verify only.
- manual `workflow_dispatch` with `operation=publish`: prepare + deploy after gates pass.

Do **not** auto-deploy every push while the scientific/publication corpus is still actively changing.

If useful, add:

```yaml
push:
  branches: [main]
```

to run verification on main pushes, but leave deployment behind the existing explicit publish action.

## 10.4 GitHub settings

Before the first publish:

1. Repository → Settings → Pages.
2. Configure GitHub Pages to use **GitHub Actions**.
3. Keep the default GitHub Pages domain.
4. Do not configure Custom domain.
5. Keep existing workflow environment `github-pages`.
6. After source/content qualification is complete, set repository variable:

```text
UNITY_DEPLOY_ENABLED=true
```

only when the owner wants publishing enabled.

Do not store secrets that are not needed.

## 10.5 First publish

Only when checks and publication gates are green:

1. merge/commit the qualified state to `main`;
2. verify CI on that exact commit;
3. run workflow manually:
   - **Verify and owner-controlled publication**
   - `operation = publish`;
4. make sure `prepare` builds the exact release artifact;
5. make sure `deploy` publishes that exact artifact;
6. record commit SHA, artifact/build identity, and Pages URL.

Expected temporary public URL:

```text
https://vasylhryha.github.io/RPG_theory/
```

After deploy, perform live verification using the existing `verify:live` tooling and its required release/seal receipts.

Do not call a local preview a successful deployment.

---

# 11. Future custom DNS/domain migration — DO NOT EXECUTE NOW

This phase starts only after the owner explicitly says the project is approved and supplies/chooses the domain.

Until then:

```text
STATUS = DEFERRED
```

No DNS action is part of the current batch.

## Future migration procedure

When approved:

1. choose the exact canonical hostname;
2. verify ownership of the custom domain in GitHub where appropriate;
3. configure the custom domain in Repository → Settings → Pages **before** changing DNS;
4. configure DNS at the domain provider for the selected apex/subdomain;
5. because this project deploys through a custom GitHub Actions workflow, do not depend on a repository `CNAME` file;
6. update site config:
   - `origin = https://<approved-domain>`
   - normally `basePath = /`
   - keep repository identity unchanged;
7. rerun full target-sensitive qualification:
   - canonical links;
   - RSS/sitemap;
   - search;
   - downloads;
   - Open Graph;
   - assets;
   - HTTPS;
   - 404;
   - redirects/old Pages URL behavior;
8. deploy the same qualified artifact flow;
9. verify the live custom domain and HTTPS before calling migration complete.

Do not remove the GitHub Pages fallback/history until the custom-domain deployment is verified.

---

# 12. Update project documentation after implementation

Once the rebind and GitHub Pages deployment are actually complete, update coherently:

```text
README.md
START_HERE.md
docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md
config/site.json
research/publication/source-index.yaml
research/publication/canonical-documents.yaml
research/publication/records.yaml
research/publication/references.yaml
research/publication/citation-aliases.yaml
relevant evidence receipts
```

The R4 plan remains the sole forward plan.

Do not create an M8 merely for this handoff.

Record:

- source rebind complete;
- exact current edition;
- actual GitHub Pages base `/RPG_theory/`;
- actual deployed URL;
- actual qualification state;
- DNS/custom domain = deferred until project approval.

---

# 13. Acceptance criteria

Do not report completion until all applicable items below are true.

## Source/integrity

- [ ] No active current source key points at a deleted predecessor file.
- [ ] All admitted package members are represented and hash-checked.
- [ ] Supporting snapshots/checks are not silently treated as theory authority.
- [ ] Core hash remains unchanged unless an explicit core revision occurred.
- [ ] `researchEdition` values match the selected current edition.
- [ ] Historical predecessor records remain recoverable.

## Claims/evidence

- [ ] `04:C1` and `06:C1` cannot collide internally.
- [ ] current E labels and historical E labels cannot collide internally.
- [ ] BIB identities are preserved wherever possible.
- [ ] alternate URLs do not count as independent confirmations.
- [ ] featured sources state a narrow positive contribution, supplied conditions and boundary.
- [ ] comparator/counterexample material remains visible.
- [ ] no paper is described as proving universal RRG unless it actually does so.

## Website

- [ ] no source-registry failure;
- [ ] no unresolved current-source path;
- [ ] no broken source/download link;
- [ ] real GitHub Pages base `/RPG_theory/` passes target-sensitive checks;
- [ ] search result URLs work under the real base;
- [ ] canonical/RSS/sitemap URLs use the GitHub Pages target;
- [ ] math/MathML/assets render correctly;
- [ ] stale fidelity reviews are refreshed only after content stabilizes;
- [ ] M6/publication qualification reflects actual current content.

## Deployment

- [ ] existing workflow is reused;
- [ ] verify passes on exact release commit;
- [ ] publish is manually owner-triggered;
- [ ] deployed artifact identity matches the qualified artifact;
- [ ] live GitHub Pages URL is tested;
- [ ] no DNS/custom-domain work was performed prematurely.

---

# 14. Stop conditions / things not to do

Do not:

- restore old 04/06/07/08 files as current to make old mappings pass;
- silently rewrite `00_LOCKED_CORE.md`;
- change source meaning for website convenience;
- delete historical versions;
- renumber all BIB references without necessity;
- treat URL count as evidence count;
- auto-accept fidelity reviews;
- weaken integrity checks just to get green CI;
- require a universal proof before publishing the labelled hypothesis;
- add DNS records or a custom domain before explicit project approval;
- deploy from a different artifact than the one that was qualified.

---

# 15. Final report expected from the implementation agent

Return a concise report containing:

1. current branch and final commit SHA;
2. files changed;
3. source-key migration table;
4. claim/evidence namespace decision;
5. bibliography mappings preserved/changed;
6. checks run and exact pass/fail results;
7. remaining blockers, if any;
8. GitHub Pages configuration;
9. deployed URL if publication actually occurred;
10. confirmation:

```text
Custom domain / DNS: DEFERRED UNTIL PROJECT APPROVAL
```

If anything remains unqualified, say exactly what remains instead of claiming release completion.
