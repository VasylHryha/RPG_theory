# Credit and research rights — REVIEW_READY

Owner decision recorded on 5 October 2026: author **Vasyl Hryha**; initial
author-owned research-content license **CC BY-NC-SA 4.0** upon first public
website release; the same covered edition additionally licensed under
**CC BY 4.0 from 1 January 2033 at 00:00 UTC**. Existing grants continue.

Delivered: owner decision transcript, scoped grant, both unmodified official
standard legal texts, hash-bound publication metadata, aligned RIGHTS.md and
R4 §0.49. Existing shared renderers carry the decision to About, footer, Legal,
Cite and the ZIP's citation/rights notice. No production renderer/schema change.

Actual checks:

- `node --import tsx --test tests/content/m4.test.ts tests/content/m5.test.ts`:
  13 passed / 1 failed in 45.1 seconds. Passing coverage includes both-base
  rights surfaces, actual ZIP wording/source-byte parity, license-file hash
  binding, separate pending scopes and deployment refusal controls.
- The failed royalty negative control replaced raw text in escaped HTML;
  repaired only its DOM mutation, then ran
  `node --import tsx --test --test-name-pattern='targeted legal-copy' tests/content/m5.test.ts`:
  PASS, exit 0; exact output retained in `targeted-repair.log`. The other 13
  unchanged results are reused. This is not a fresh full-suite PASS.
- `node --import tsx scripts/check-content.ts`: PASS; 24 source files,
  96 entries, 75 accepted / 21 stale / 0 pending / 0 rejected; private source
  fidelity remains qualified. No scientific certification.
- `git diff --check`: PASS. Scientific sources, earlier issued evidence,
  ZIPs, history, Rider files, lockfile and production code remain unedited.

Next: one separate bounded High acceptance of this delivered scope. Permanent
citation URL, code/data licensing, exact launch selection, overall rights/privacy
and remaining public qualification are still pending. No invented approval,
commit, push, public deployment or DNS change; existing publication protections
remain enabled. No full verify or browser/build campaign was rerun for this
metadata/declaration change.
