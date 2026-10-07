# Requested bounded v0.3.2 recheck — REVIEW_READY

7 October 2026. Found and repaired three concrete issues:

- Generic provenance labelled the frozen v0.1 files only with their containing v0.3.2 package edition/date. Download tools and source backlinks now distinguish the superseded snapshot version from its package and package date.
- The fidelity-delta summary compared against intermediate pending requests and incorrectly reported zero changed-source rows. It now compares with the preserved accepted v0.3.1 decisions: 69 current readings have changed source inputs. Pending snapshots are preserved rather than overwritten; all prior accepted decisions remain exact.
- Authority context incorrectly called v0.3.2 the related-work revision and omitted the v0.3.1 predecessor. Corrected it and five edition/provenance contexts, retaining the comparison as inherited work and naming the forces rationale as this edition’s addition.

**Fresh PASS:** shared fidelity; Astro 0 errors/warnings/hints; both preview builds/output audits (382 files / 115 HTML each); focused actual-artifact checks of all download/provenance labels, current-page links, raw and ZIP byte parity, unchanged source header/note placement, exact approved paragraph, corrected authority context and predecessor-delta accounting. Whitespace PASS. Commands/seals: [checks.json](checks.json); comparisons: [artifact-check.json](artifact-check.json).

All scientific v0.3.2 source bytes, its seal, 24 v0.3.1 snapshot members, lockfile, release selection and unrelated handoffs remain unchanged. No new test-suite cases or broad campaign; unchanged source/history/revision and unrelated content evidence reused. Fresh full content suite NOT_RUN.

**Remaining limits:** browser/visual behavior is unverified. The offline Chromium attempt also failed before tests because macOS process registration is denied; the existing localhost smoke remains blocked by `listen EPERM`. This cannot support a literal 9+/10 rating. No remaining material defect was found in the inspected source/display/download scope. One already pending separate bounded High acceptance remains required: 84 current pending / 21 archived stale, `currentSourceQualified=false`. No additional acceptance cycle, commit, push or deployment.
