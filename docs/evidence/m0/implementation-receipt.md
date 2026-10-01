# M0 implementation receipt — 1 October 2026

Result: **REVIEW_READY**, not accepted. One private static slice is implemented
and verified. No M1 work or publication was started.

- Toolchain: Node 24.18.0, npm 11.16.0, Astro 7.3.5, TypeScript 6.0.3,
  `@astrojs/markdown-remark` 7.3.1, KaTeX 0.18.10, Playwright 1.63.0,
  Chromium/headless shell 153.0.8010.12 (revision 1243). Versions are pinned
  through the root package manifest and lockfile.
- `npm run verify`: all ten orchestrated commands exit 0. Astro check reports
  zero errors/warnings/hints. Fourteen contract tests pass, including the Python
  archive controls. Four browser tests pass per base configuration, eight total.
  See `verification.json`, `root-browser.json` and `subpath-browser.json`.
- History: all fourteen original research hashes and two original note
  transcription hashes pass. Note Project identities remain intact.
- Current edition: thirteen actual source files, unchanged from the ZIP; actual
  raw core matches the declared pin. Edition inventory seal:
  `25d4e1e9476da06972bd30245ea4d6abe6be0a0e9bc56aaa0ae9e09179a6386a`.
  M0 intake succeeds; current scientific content qualification is false pending
  M1 bindings/reviews. See `source-intake.md`.
- Real consumers: Astro filesystem collection reads private editorial Markdown;
  home/start share the reading layout, source banner and URL owner. Both Astro
  rendering and the math fixture use the shared safe Markdown/math transforms.
  Source CLI/build guards use the production admission module. The output
  auditor and static server consume actual built files. No SPA fallback is used.
- Negative controls reach their intended diagnostics: missing source, one-byte
  history edit, unrecorded core edit, missing manifest member, mixed stale sibling,
  wrong source/excerpt hash, legacy-as-current, silent pin reset, route collision
  and traversal, root-only subpath asset, unsafe Markdown/math, unsafe ZIPs, and
  release with a fixture target/unqualified corpus. A complete synthetic revised
  edition with predecessor/rationale/updated binding review succeeds at intake
  while remaining scientifically unqualified and non-deployable.
- Both output audits pass for `/` and `/unity-theory/`, 68 emitted files each.
  Artifacts contain only the private reading pages, fixture, local CSS/fonts,
  favicon, robots and build-info. No research tree, original ZIP, handoff,
  administrative plan, source map, or review working folder is emitted.
- Browser evidence covers no-JavaScript home/start navigation, skip-link keyboard
  focus, local math/MathML, 320px reflow, light/dark automated axe checks, real
  404 recovery, and subpath asset behavior. Actual desktop/mobile home screenshots
  were inspected by the implementer. This is an engineering check, not a human
  comprehension study or public-design approval.
- Root artifact SHA-256:
  `0ea6390f0e3b41f843ac9d8e2c77ba9bc6879eabe57ac85185625edb983e24eb`.
  Subpath artifact SHA-256:
  `498c7323cd6e81d3b40e1b4dd8947dc87e0418d53dbd1b45ea0d69985e0cf55e`.
  `final-integrity.json` confirms neither artifact changed after browser tests,
  both copied ZIPs remain byte-exact, and the supplied handoff snapshot remains
  unchanged.

Initial failures and repairs: restricted TypeScript IPC/local sockets and browser
download DNS required approved execution outside the sandbox. The first Astro
check identified the v7 Markdown processor dependency; installed the pinned
official unified processor and configured its supported API. The next check
identified Buffer concatenation typing; corrected it and the deprecated schema
import. The connected repair batch passed the complete affected verification.

Installed-release API reference:
[Astro v7 Markdown processor guidance](https://docs.astro.build/en/guides/upgrade-to/v7/#new-default-markdown-processor-s%C3%A4tteri).
The locally installed `rehype-katex` implementation was inspected to enforce
render failures instead of accepting warning/fallback output.

Limits: no Git repository/HEAD or remote exists in this initial workspace; no
commit or push was made. Existing Rider/editor files were preserved. CI is
prepared but **NOT_RUN** on GitHub. Independent High review, source-bound content
acceptance, author approval, scientific literature/numerical checks, assistive
technology testing, human comprehension, performance qualification, identity/
rights/publication and live hosting remain unperformed or pending in their owning
milestones. No public artifact is deployable. Next action is the separate M0
review described by the installed plan §10.2; acceptance precedes M1.
