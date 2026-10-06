# Bounded recheck of routine verification

6 October 2026. **ACCEPTED for routine verification scope**, after same-session
repairs. Full qualification/public release remain incomplete.

Actual hosted predecessor at d31fb3e:
https://github.com/VasylHryha/RPG_theory/actions/runs/37420951519
verify job PASS, 05:55:13–05:58:01 UTC (**2m48s**, including setup/cleanup).
Routine step 05:55:57–05:57:56 (**1m59s**). Actual log confirms both current
preview builds/audits and four Chromium tests per base; full qualification,
preparation and deployment skipped. This is hosted timing for that exact commit.

Concrete improvements: include existing math-font/keyboard-scroll and real
404/nested-asset tests; use stable `@routine` tags instead of title fragments;
cancel superseded same-branch routine jobs. Qualify/publish have separate
concurrency groups and cancel-in-progress=false; release permissions, manual
main/owner-variable checks and same-run artifact dependencies remain intact.

Affected checks: Playwright discovers exactly six tagged tests in five files.
Two additional tests PASS at root (3.3s) and actual target (2.6s), four total;
reuse unchanged hosted eight-test/build/audit evidence. Shared M5 workflow
contract PASS, including privileged PR and changed push-trigger refusals.
Whitespace PASS. Browser outputs and generated receipts remain in ignored
runtime evidence; no old tracked evidence overwritten. No full-suite rerun.

Reviewed pre-push behavior and installation: local source/content/fidelity/policy
checks, enabled here, no builds/browsers; documented opt-in on other checkouts.
These are worktree checks, not an approval of arbitrary refs being pushed. The
fresh GitHub checkout remains responsible for checking the pushed commit.

No competing workflow or deployment permission increase. Hosted runner queue
time remains outside the ten-minute job runtime cap. The 24-case predecessor
full-suite failure result remains failed; only the separately recorded ambient
event test repair is established. Scientific sources, ZIPs, history, Rider files,
fidelity decisions and publication switches remain unchanged.
