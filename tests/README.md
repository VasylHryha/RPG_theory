The suite checks publication safeguards and reader journeys, without fixing page wording in assertions. Synthetic review receipts are isolated mechanics controls and never approve real content. Temporary controls and logs stay under `docs/evidence/test-suite-proportionate/`.

- `npm run test:content`: 21 Node tests plus four Python archive cases, with one private build. Verification can supply its freshly built preview through `UNITY_CONTRACT_OUTPUT` to avoid rebuilding.
- `npm run test:e2e -- --output <built-directory>`: seven tests in one spec. Run at `/` and the configured `/rrg_theory/` base. There are no unasserted screenshots.
- `npm run verify:push`: JSON syntax and Git whitespace.
- `npm run verify:ci`: diagnostics, both preview builds/shared audits, lean content tests and three browser journeys per base.
- `npm run verify:full` / `npm run verify:monthly`: history integrity plus the same checks and all seven browser tests per base. Run the monthly campaign when due or for a concrete diagnostic need.

Full means the complete lean automated suite. It does not certify scientific content, grant fidelity decisions, or claim completion of the wider M6 human/AT/performance work. Production admission, fidelity, publication, output-audit, seal and live-verification code remain the release authority.

Each remaining test protects:

| Test | Guarantee |
| --- | --- |
| Page edit | An exact fidelity review becomes stale. |
| Source edit | Source-bound reviews become stale. |
| Pending/stale review | Qualification/release refuse and decisions stay unchanged. |
| Malformed decision | A matching hash cannot make invalid evidence valid. |
| Live byte drift | Served bytes must match the retained sealed inventory. |
| Valid output | The shared auditor accepts the actual private build. |
| Injected script | Active code is refused. |
| Broken link | Missing internal destinations are refused. |
| Missing/duplicate metadata | Required structured metadata occurs exactly once. |
| Draft/private content | Drafts leave all release surfaces; private files fail output auditing. |
| Preview artifact | A preview cannot pass release transport validation. |
| Markdown | MathML and base-prefixed links render; executable input fails. |
| Math macros | Documents cannot share macros or emit active math links. |
| Routes | Encoded traversal and case collisions fail. |
| Archive intake | Raw bytes survive; unsafe paths, collisions and symlinks fail. |
| Math section 39 | The known delimiter repair preserves four display equations. |
| Withdrawal | Former body and metadata do not survive tombstone rendering. |
| Contents membership/navigation | New unassigned pages are visible; missing metadata fails clearly; breadcrumbs use real parents, Home leads to Start and historical relations remain reachable. |
| Source bytes/core repin | An unrecorded source/core change fails admission. |
| History byte edit | Unrelated history changes fail integrity verification. |
| Source revision | Preserved prior bytes are required; affected derivatives are reported and results remain pending. |
| Route/link/404 browser smoke | Every selected route, book-navigation link and glossary anchor resolves; Contents includes every reading route; unknown routes return actual 404 bytes. |
| Menu/contact/search browser smoke | Navigation, mailto, fallback readings, the claims toggle and glossary jumps work without JavaScript. |
| Home browser smoke | Native details respond to Enter; twelve steps follow authored quantum-first order without a copied heading list. |
| 320px light accessibility | Ten page families are checked for axe WCAG 2.2 AA and reflow. |
| 320px dark accessibility | The same ten families are checked in dark mode. |
| 1280px light accessibility | The same ten families are checked at desktop width. |
| 1280px dark accessibility | The same ten families are checked at desktop width in dark mode. |
