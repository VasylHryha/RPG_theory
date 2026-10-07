# v0.3.2 fidelity and release selection — REVIEW_READY

7 October 2026. Recorded **84 accepted current website-fidelity decisions** through the shared validator; **21 archived stale decisions** and all prior accepted/pending receipts remain unchanged. Read World §7.3, Foundation errata’s Earlier editions list and Recursive background’s site note against `research/RRG_CURRENT/`. Reused the accepted v0.3.1 website source/display comparisons for the other 81 after comparing every changed own field, source identity and dependency. Edition-history/authority/guide and archive disclosures were compared as metadata. No material content repair or scientific adjudication. [Comparisons and exact snapshots](comparisons.json).

Selected **site-2026.10.07-v032**, 84 readings, with `currentSourceQualified=true`. Existing rights and licence terms are unchanged; [previous selection](before/release.json) is preserved. [Selection receipt](release-selection.json).

**Fresh PASS:** shared fidelity validator; Astro diagnostics (0 errors/warnings/hints); qualification builds and output audits at `/` and `/rrg_theory/`; **21/21 existing content tests**, no skips/failures, using `UNITY_CONTRACT_OUTPUT=dist/fidelity-v032-target`; whitespace. No new tests or broad campaign. Commands, logs and exact artifact hashes: [checks.json](checks.json).

| Base | Private qualification output | Files / HTML | Deployable |
|---|---|---|---|
| `/` | `dist/fidelity-v032-root` | 361 / 94 | No |
| `/rrg_theory/` | `dist/fidelity-v032-target` | 361 / 94 | No |

[Preservation](preservation.json): 250 protected inputs remain exact, including all 24 current-source files, prior decisions and pre-existing unrelated dirty inputs. Two recorder preflight failures were corrected before any decisions were written; their logs remain in checks.json. They are not passing checks.

Browser smoke of these qualification outputs remains assigned to Claude. Claude’s [source acceptance and earlier 7/7 smoke at each base](../source-revision-v0.3.2/acceptance.md) are preserved, not relabelled as fresh qualification smoke. Next: that bounded smoke and the later publication lane. No staging, commit, push or deployment.

All ignored task evidence and validator-required source-revision inputs are enumerated in [required-force-add-paths.txt](required-force-add-paths.txt) for a later authorized scoped commit. Regenerate with `python3 docs/evidence/fidelity-v032/list-force-add-paths.py` if more evidence is added. Evidence stays outside public output.

**Requested bounded recheck:** clarified that reused comparisons establish website source/display fidelity. Fresh inspection of both saved qualification outputs confirms the exact approved paragraph and adjacent hypothesis limits, the unchanged source header/site-note placement, all three superseded download labels/current destinations, and raw/ZIP byte parity. All 722 artifact files and their complete inventories remain exact; production inputs, release rights, 84 accepted decisions and 21 archived stale rows are unchanged. Reused valid earlier checks; no new tests or decisions. [Recheck receipt](recheck/receipt.md). Browser smoke remains with Claude; status stays REVIEW_READY.
