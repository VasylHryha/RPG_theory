# Workspace instructions

Use `docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md` Revision 4 as the
only forward plan and milestone tracker. Read §0.27 first, then the current
execution receipt and the remaining deliverables in §8.

## Temporary rule: proportionate development until the website is finished

The owner's latest 4 October 2026 clarification governs: normal development,
including builds, tests, rechecks and separate High acceptance, is wanted. Their
cost must be proportionate to this informational website. Prioritize substantial
progress on planned pages/features. Do not spend hours checking or hardening a
tiny change. This supersedes earlier mandatory repeated repair/review cycles;
it is not a blanket ban on tests or an instruction to defer every check to M6.

The owner's 6 October 2026 frequency rule supersedes repeated release audits:
heavy source/history audits, the full regression suite, broad browser/performance
campaigns and exhaustive live-file comparisons run monthly, not on every push or
deployment. Reuse passing evidence for 30 days while its relevant inputs remain
unchanged. Changes get focused affected checks; they do not automatically require
another full campaign. Thirty days is a maintenance reminder, not a deployment
lock. Never describe failed or unavailable evidence as passing.

Pre-push checks cover syntax and whitespace. Routine CI covers diagnostics,
build/output validation and short browser journeys. Publication builds and seals
the actual selected output and runs the short release smoke checks. Keep existing
source-fidelity/build validators; do not repeat standalone source audits before
that build. After deployment, check availability, a nested route and real 404
behavior; the exhaustive live verifier is an explicit monthly/diagnostic tool.

Use existing tools, validators and normal safeguards. Add work only when it
delivers a planned feature, fixes a reproducible defect, or checks a concrete
risk introduced by the change. No speculative bypass hunts, audit expansion,
approval-system redesign, paper audits or scientific adjudication. Do not reopen
accepted foundations without evidence of a defect affecting current work.

Finish a coherent implementation batch, then run focused affected checks once.
Reuse valid unchanged results; rerun affected checks after real repairs. Add
meaningful tests when a changed feature needs them, not tests for trivial prose
or tests that mirror implementation. Save full-site verification for M6. Routine
checks/review of a small change should take minutes, not hours. If checking grows
into a separate project, stop expanding it, record the concrete unresolved issue
and return to deliverables; a real blocker needs the shortest targeted repair.

Implementers stop at REVIEW_READY. Keep one bounded separate High acceptance of
delivered scope. The reviewer may fix material defects, run focused checks and
accept those repairs in the same session; no automatic second acceptance cycle.
After acceptance, proceed to the next milestone. Rechecks are justified by changed
material or concrete evidence, not by a desire for another general assurance pass.

Keep receipts short: features delivered, actual checks, blockers and next work.
Preserve source fidelity, existing validators/evidence, pending/stale decisions
and release protections. Private implementation may continue while qualification
is pending. Never fabricate approvals. The owner-authorized first test edition
is deployed under R4 §§0.55–0.56; this does not authorize unrelated publication.
The owner's subsequent naming correction uses Recursive Resonant Geometry (RRG),
the existing repository renamed to VasylHryha/RRG and default Pages path /RRG/;
see §0.58. Keep the local workspace path and historical sources/receipts intact.

Preserve the supplied ZIPs, handoff snapshot, historical sources, original Rider
solution and unrelated work. Source builds/intake preserve raw bytes. Necessary
in-scope scientific authoring changes follow plan §0.3/§4.5; explain the reason,
preserve the prior edition and update authoritative sources and dependencies
together. A LOCKED filename does not itself require another permission request.

Keep one root Astro project, one dependency lockfile, one current scientific
source directory, and shared production validators. Synthetic fixtures cannot
prove scientific content or authorize release. No push, public repository,
deployment, DNS change or license grant without an authorized target.

`npm run verify` tests the currently implemented private slice at both base paths. Evidence
belongs under `docs/evidence/`; it is never copied into `public/`.

Website content review establishes fidelity to the original downloaded
`research/RRG_CURRENT/` documents and accurate attribution/source-reported status.
Do not resume SF-01–06 scientific adjudication, import reviewer corrections, or
rewrite scientific sources in the website lane. Related papers are supplementary.
For bounded High content acceptance, use `website-reviews.yaml` and the shared
website fidelity validator; never manufacture decisions. Pending/stale decisions
block qualification/release, not independent private implementation. The preserved
`reviews.yaml` registry is historical scientific evidence, not website approval.
