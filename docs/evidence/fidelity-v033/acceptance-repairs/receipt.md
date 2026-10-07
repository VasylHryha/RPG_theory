# v0.3.3 acceptance repairs — REVIEW_READY

Corrected the World source title to **RRG v0.3.3**, its header to **Forces-by-scale edition**, and removed the extra blank line before `Existing E01`. No scientific wording changed. Re-registered/rebound with existing tooling and refreshed **25 affected fidelity decisions**; the other 59 current decisions and all 21 archived stale decisions remain unchanged. Earlier source/decision/artifact evidence is preserved under `before/`.

**PASS:** source revision and fidelity validators; both qualification builds/output audits (361 files / 94 HTML each); **21/21 existing content tests** using `UNITY_CONTRACT_OUTPUT=dist/fidelity-v033-target`; whitespace; corrected headers and exact original-download bytes at both bases. [Checks](checks.json) · [Rendered comparison](rendered-world-comparison.json) · [Preservation](preservation.json). Reused unchanged Astro diagnostics; no new tests or broad checks.

Release ID remains **site-2026.10.07-v033**, with unchanged rights and selected entries. The first root build correctly refused `FUTURE_REVIEW`; reselecting the same ID with a later selection time resolved it without backdating decisions. The failed attempt is retained separately; only the build needed repeating. [Selection](release-selection.json).

Browser smoke/acceptance remains with Claude. No staging, commit, push or deployment.
