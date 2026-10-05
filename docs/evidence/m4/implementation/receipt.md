# M4 implementation — REVIEW_READY

M2/M3 remain accepted for their bounded private scopes. This batch delivers the
two planned explanatory articles, article index/publication-only RSS, grouped
library, generated Markdown/exact-byte originals, private preview ZIP/checksums,
honest release identity, references/backlinks/history, citation preview and gated
CFF, print styles, and CONTRIBUTING's authoring recipe. No scientific sources or
approvals were edited. Approved publication remains gated; this is a private ZIP,
not the complete RRG_CURRENT package or a license grant.

Actual final checks:

- 39 focused content/selection/export contracts PASS: `contracts-final.log`.
- Shared source/content/fidelity validator PASS: `content-qualified-state.log`
  and `final-v2/content-bindings.json`. Initial registry was 41 accepted / 14
  stale; now 55 stale / two articles pending, qualification false. Registry and
  all decision receipts are byte-identical to the initial snapshot.
- Astro: zero errors/warnings/hints, `astro-check-links-final.log`.
- Both builds and output audits PASS: `build-*-links-final.log`,
  `audit-*-links-final.log`, `final-v2/*-artifact.json`. Each: 197 files / 62 HTML.
- Four focused Chromium tests PASS: `browser-final/*-browser.json`. Actual ZIP
  downloads, RSS XML parsing, no-JS journeys, 320px reflow/axe, and technical
  printing. Live RSS has zero items because the articles are unpublished;
  synthetic selection controls prove dated published RSS at both bases.
- Actual downloads independently unpacked: `unpack-current-final.log` and
  `final-v2/download-unpack.json`. Each ZIP has 75 members: 57 explanatory
  mirrors, ten original files and eight package metadata/reading files. CRC,
  SHA256SUMS, safe paths and exact source-byte comparisons PASS. Companion
  links/fragments, export parity and negative controls PASS in the contracts.
- CFF generator tested against the downloaded official 1.2.0 schema:
  `citation-schema.log`; actual CFF INACTIVE. Schema source:
  https://raw.githubusercontent.com/citation-file-format/citation-file-format/1.2.0/schema.json
- Actual 26-page mathematical print PDFs and cover/§39 images retained under
  `browser-final/`. Cover status/revision and four boxed §39 formulas inspected;
  no equation overflow. Navigation omitted. PDF creation is test evidence,
  not a production build dependency.

Final artifacts are private and explicitly dirty. Source commit identifies the
checkout; workspace input digest and document-manifest digest identify different
things. Root/subpath artifact identities are in `final-v2/*-artifact.json`.
Prior M2/M3 evidence is preserved; unchanged full-site checks were not repeated.
Full-site qualification remains M6.

Initial failures remain in their logs: local IPC/listener sandbox restrictions,
missing default browser cache (resolved using the installed local cache), an
unregistered article dependency, print URL fragments, unsupported print CSS,
test typing, a website-only anchor absent from Markdown, and PDF text extraction
with spaced uppercase revision text. Affected repairs were checked, not relabelled
as original passes. The old `final/preservation.json` records the unowned runtime
observation; `final-v2/preservation.json` records the qualified final inventory.

Original RRG_CURRENT, ZIPs, handoff/history, Rider solution, lockfile, prior
receipts and registry match the baseline. Rider runtime workspace.xml changed
without a task write; origin unestablished, observed bytes left untouched. No
scientific adjudication or reproduction: historical cavity/response work remains
NOT_SELECTED / NOT_RUN.

Remaining gates: separate bounded High M4 acceptance; approved public credit,
permanent URL and rights; reviewed published selection/rights; M6 qualification;
owner-authorized public target. No private implementation blocker. Stop at
REVIEW_READY. No self-acceptance, M5, commit, push, deployment, DNS, license grant
or public action. The sole plan's §0.31 is the current execution receipt.
