# R4 source-authority plan reconciliation

**Date:** 2026-10-05. **State:** REVIEW_READY — plan repair only; website migration remains required. Inspected clean local HEAD `2615299`; no separate High acceptance issued.

Reviewed the GPT-web planning change `d7aa788`, subsequent promotion/current-source declarations, promotion receipt and last M7 acceptance against the local source registry and production loader. Reconciled R4's contradictory old-source/current-source instructions with the completed owner-selected promotion. Preserved all bounded predecessor engineering acceptances and their corpus limits. Removed forward instructions to merge scientific catalogues or adjudicate mathematical corrections in the website lane; SF-01–06 remain deferred.

Added the owner's follow-up to §0.39 and M4: selected documents become readable HTML pages; document/section links use a shared source-to-route mapping; original files and explanatory exports are labelled downloads; historical/unrepresented documents have explicit status and usable destinations or availability notes. Private administrative files cannot become reading links. No website feature was implemented by this plan edit.

**Actual checks:**

- Compared every file in `config/research-source.json` with local bytes: **24/24** hashes and byte lengths match; promoted manifest hash matches. The five carried-forward core/foundation/change-control files retain their predecessor hashes.
- Compared all **13/13** predecessor inventory files from commit `10326c1` with `research/history/repository-current-2026-10-01/`: exact SHA-256 parity.
- Ran existing `npm run check:sources -- --scope current`: initial attempt failed on sandbox tsx IPC (`EPERM`); approved retry reached the production corpus loader and failed **SOURCE_REGISTRY_FAILURE: R-CURRENT-CORE**. Its intake stage completed before registry validation; this is not a passing website-content check.
- Inspected `validateCorpus` and registry bytes: **13** declared-current entries use the predecessor edition, **5** refer to removed CURRENT files, and **3** existing source hashes changed (README, CHANGELOG, manifest). Registry coverage also needs the full 24-file intake, including supporting roles. Old canonical documents/records still reference superseded keys. No fresh review-state count can be computed while corpus loading fails; the earlier 57 stale decisions are dated evidence.
- Read the repaired plan for consistent authority, migration order, document-link requirements and REVIEW_READY/acceptance boundaries; `git diff --check` passed. No full build/test campaign was warranted for this documentation-only repair; the existing corpus failure is explicitly retained.

**Next:** one coherent §0.39 registry/binding/citation/page/link migration batch, focused affected validation/builds/reader journeys, then stop REVIEW_READY for bounded separate High acceptance. Final M6 qualification follows stabilized content/target inputs; complete M7 release remains blocked.

Scientific sources, intake, registries, approvals, ZIPs, handoff, historical receipts and website code were not changed here. Complete GPT Library package/raw-original parity and live repository visibility were not independently verified. No scientific adjudication, source certification, push, remote mutation, deployment, DNS change or license grant occurred.
