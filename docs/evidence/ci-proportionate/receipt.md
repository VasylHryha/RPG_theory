# Proportionate CI and local pre-push check

6 October 2026. Owner requested a five-minute routine target, ten-minute
maximum, lightweight checks on push and no repeated full regression campaign.

Default CI checks current source/content/fidelity/policy, Astro diagnostics,
root and actual target builds/output audits, and four Chromium journeys per
base. One local run: **PASS, 183.275 seconds**, ten commands, both 348-file
preview artifacts, eight browser checks. CI limits the running routine job to
ten minutes; hosted timing and queue delays are not measured guarantees.
Routine PASS explicitly does not mean full qualification. Manual `qualify`
and `publish` retain the full suite and three engines. Publication guards stay.

Tracked `.githooks/pre-push` runs shared current-source/content/fidelity/policy
checks without builds/browsers. Enabled in this checkout; new checkouts need
`git config core.hooksPath .githooks`. Runtime evidence is narrowly ignored.

Two concrete test repairs: the release-refusal contract now supplies explicit
PR/main and manual/main contexts instead of inheriting the workflow event;
one targeted test under workflow_dispatch PASS. The citation browser assertion
now checks the actual artifact's clean/dirty identity; one affected journey
PASS (7.1 seconds). Revised routine release-mode refusal, workflow YAML,
publication dependency, hook syntax and whitespace checks PASS. Initial local
tsx socket denial was retried outside the sandbox; no failed run is called PASS.

Previous hosted run
https://github.com/VasylHryha/RPG_theory/actions/runs/37371092243
failed with 24 unique cases. Reported durations sum to 30.4 minutes; concurrency
makes this different from wall time. Two CSS cases alone report 430.4 and
346.5 seconds. Preserve that failed qualification result; the reported event
assumption is repaired, other full-suite failures remain unresolved. No broad
test-repair campaign or full-suite rerun. Revised hosted CI is not yet measured.

No scientific sources, ZIPs, historical evidence, fidelity decisions or release
authorization changed. Plan R4 §0.53 records this scope. Candidate §0.51 remains
accepted; complete public qualification and deployment remain incomplete.

First push pre-push checks PASS in 20.953 seconds. GitHub rejected run
37420828091 before creating jobs: runner context is unavailable in job-level
env. Corrected the browser path to a shared literal absolute path on the Ubuntu
runner; same path used for install and checks. This orchestration failure is
separate from the passing local checks and the earlier failed full regression.
