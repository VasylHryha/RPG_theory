# v0.3.2 fidelity/selection — bounded High acceptance (Claude, 7 Oct 2026)

**ACCEPTED.** 84 current readings accepted, release `site-2026.10.07-v032`
selected ([receipt.md](receipt.md), [recheck/receipt.md](recheck/receipt.md)).

- Spot-checked final target output: World explanation shows the §7.3
  "Why RRG considers this" paragraph; Foundation errata lists the three v0.1
  downloads as superseded (bytes equal the snapshots); Recursive background
  links to Earlier editions.
- Browser smoke `npm run test:e2e` on `dist/fidelity-v032-*`: target 7/7 PASS;
  root first run 6/7 — one `page.goto` timeout (ERR_ABORTED loading /contact/,
  not an accessibility finding); that test passed on rerun and a full root
  rerun passed 7/7. Logs: [acceptance/](acceptance/).
- Codex checks reused: fidelity validator, diagnostics, both builds/audits,
  21/21 content tests.
