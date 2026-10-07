# Edition command
1. Edit text in `research/RRG_CURRENT/`; retain scientific status and attribution.
2. Preview without writes: `npm run edition -- --version 0.3.4 --label "short label" --approval "owner feedback §N" --dry-run`.
3. Prepare: use the same command without `--dry-run`; optionally add `--select site-2026.10.07-v034`.
4. HEAD is preserved byte-exact; edition metadata, bindings, transaction and changelog skeleton are generated.
5. Metadata-only fidelity reuses prior comparisons; exit 2 prints readings needing actual content review.
6. Read their current sources, detached own/dependency inputs and rendered changes; do not infer scientific certification.
7. Resume: `npm run edition -- --version 0.3.4 --accept-reviewed DOC-WORLD,DOC-START --reviewer "reviewer name" --note "actual comparison and limits"`.
8. Repeat for remaining IDs; completion runs validators, Astro diagnostics and one target build/audit, stopping at REVIEW_READY.
9. Dated evidence includes the exact `git add -f` list; the command never stages, commits, pushes or deploys. Core/membership/ambiguous partial-excerpt changes need the existing explicit procedure.
