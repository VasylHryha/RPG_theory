# Unity Theory — shared sources and website alignment

**Revision 4 · 1 October 2026**  
**Role:** source and document index. The implementation plan remains the only execution tracker. This file maps source roles and the clarified revision process. It does not itself amend scientific claims.

## The correction

The shared Project notes designate **RRG_CURRENT as the only active scientific package**. The earlier website R2 handoff instead used five v0.1b documents and nine audit files as its scientific baseline. Those are useful historical sources, but they are not the declared current package.

The aligned handoff is [the R4 implementation plan](UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md). [START_HERE](START_HERE.md) gives Codex's execution route. [SOURCE_AUTHORITY.json](SOURCE_AUTHORITY.json) makes the current source-availability boundary explicit.

## What governs what

| Subject | Source of authority | Website responsibility |
|---|---|---|
| Locked meaning and scope | Actual RRG_CURRENT/00_LOCKED_CORE.md and explicit authorized later decisions | Use the actual baseline; allow justified in-scope revisions with history and dependent updates; no reconstruction from old files |
| Source change rules | Actual RRG_CURRENT/05_CHANGE_CONTROL.md plus later owner instructions | Reconcile with the owner's permission for justified source/core changes; no silent edits or blanket source freeze |
| Active edition and membership | Actual RRG_CURRENT/CURRENT_MANIFEST.md | Verify the coherent admitted package and record all actual member hashes |
| Current explanation/framework/math | Actual current 01/02/03 documents | Render original source through sidecars; write reviewed beginner explanations separately |
| Current research status and support | Actual current 04/06/07/08 documents | Preserve the distinction between definition, proposal, evidence and demonstrated result |
| Website architecture, tasks and acceptance | R4 implementation plan | One source-bound publication pipeline, M0–M7, separate implementation and review |
| Older drafts and calculations | Fourteen preserved older files and complete predecessor R3 handoff | Explicit history or selected supporting work, never a silent current-source fallback |

Owner decisions define intended meanings and permissions. Arguments and evidence determine scientific support. Neither source priority nor the word “proof” in a filename certifies a claim.

## Current is editable; history is preserved

The owner permits necessary, justified changes to current project documents, including original/core material within the authorized task. Use the actual sources as the starting point, explain the concrete need and before/after meaning, preserve the prior edition, update affected sources/pages/status/evidence together, and run affected review/checks. Do not add a second permission loop merely because a filename says LOCKED. A review-only task still reports findings rather than silently rewriting scientific content.

The working `research/RRG_CURRENT/` tree is editable. Historical snapshots and issued release artifacts remain unchanged. Intake/rendering do not rewrite sources as a side effect. A legitimate replacement baseline or source revision gets its own version/hash; unexplained differences cannot silently reset the old pin. Website metadata normally stays in sidecars, while real source corrections belong in the source. The complete procedure is in plan §0.3 and §4.5, not a second tracker here.

## What the website must continue to explain

Start with familiar examples in ordinary language. Explain arrangement and activity, parts remaining active within a whole, persistent wholes participating in further organization, and structures changing the conditions for later organization. Only then introduce precise definitions, equations, scientific evidence and open tests.

The [shared extension note](source/project-notes/emergent-interaction-update-note.md) additionally reports the research connection:

**lower-level geometry/modes → effective interaction regime → possible further persistent organization.**

That connection belongs in the deeper explanation and evidence pages. The environmental/life example remains in the beginner journey. The website must not reduce the entire project to the older response-reduction audit, and it must not claim that the four fundamental forces have been proved to form four successive RRG levels.

The note names three evidence topics; the actual newer evidence files still need to be read and checked before their claims are published. No contents for `08_ADDITIONAL_PRIMARY_EVIDENCE.md` are invented in this handoff.

## Expected current source map

| Main file named by shared note | Use in the site | Availability in this alignment |
|---|---|---|
| 00_LOCKED_CORE.md | Exact source for core meanings and bound definitions | Actual file not obtained |
| 01_world_explanation.md | Beginner explanation source | Current version not obtained |
| 02_scientific_framework.md | Framework source | Current version not obtained |
| 03_mathematical_core.md | Mathematics source | Current version not obtained |
| 04_status_and_blockers.md | Current research status | Current version not obtained |
| 05_CHANGE_CONTROL.md | Theory change rules | Actual file not obtained |
| 06_PROOF_MATRIX.md | Claim-to-support/status mapping | Actual file not obtained |
| 07_EMERGENT_INTERACTION_EVIDENCE.md | Interaction-extension evidence | Actual file not obtained |
| 08_ADDITIONAL_PRIMARY_EVIDENCE.md | Additional primary evidence | Actual file not obtained |
| CURRENT_MANIFEST.md | Current package membership and edition | Actual file not obtained |

This is the note's list of **main files**, not a claim that the actual package contains exactly ten files. Complete membership must be checked against the real manifest.

## The locked-core pin

Both shared notes record:

```text
b6d3e7c75285889afe94cabf083ba5fb80f401c656613ba6a80d2f0149b655e1
```

This is an **expected** SHA-256. The actual core bytes were not available, so this alignment did not compute or verify that hash. R4 checks the selected edition's raw bytes. A documented legitimate replacement may differ from this historical pin; an unexplained mismatch cannot automatically rewrite it. Hash equality also does not prove scientific validity or that other files form a coherent edition.

## Source availability and what was changed

The R3 package retains two earlier Project-note transcriptions. The original notes were read in the earlier alignment; this pass does not claim a fresh read from Project attachments. Their links do not supply the target bytes.

The current source recheck on 1 October 2026 did not return the newly reported RRG_CURRENT files from the inspected Project/conversation, Library and local locations. This is not a claim that the user failed to upload them. Actual current-document contents remain unchecked here; recheck source access at execution rather than freezing an old missing-state result.

**Changed in R4:** source-change policy, admission/update rules, affected plan passages and prompts, start/index, registry and package checks. **Not changed:** scientific source bytes, archived evidence, Project attachment membership, Library records, GitHub/website/DNS state or rights policy.

The complete predecessor is retained [as superseded history](history/UNITY_THEORY_WEBSITE_HANDOFF_R3.zip), including its nested R2 archive. Earlier evidence is not reported as fresh R4 verification.

## Where the files go together

```text
research/RRG_CURRENT/    actual scientific source after verified intake
research/publication/   source adapters and new reviewed explanations/articles
research/history/       preserved older research, never current fallback
docs/plans/             one R4 website implementation plan
```

The site renders the selected current edition through sidecar metadata rather than keeping a second editable framework. Source revisions are explicit authoring operations, not render-time mutations. Definition records extract actual source statements; simpler explanations are separately reviewed derivatives. Download labels distinguish original source bytes from normalized explanatory exports.

M0 local engineering and fixture checks can proceed now. Actual-current-content acceptance and publication stay blocked until the genuine RRG_CURRENT package, including its manifest and locked core, is obtained and checked. Do not manufacture a “current” package from old files simply to clear that gate.

## Exact shared-note identities

[P-CURRENT-NOTE](source/project-notes/current-package-note.md): `file_0000000047a0820ab6beb4722417cd62`, title `GPT 6.1 overview.txt`. Designates RRG_CURRENT and lists the main files and expected hash.

[P-EXTENSION-NOTE](source/project-notes/emergent-interaction-update-note.md): `file_000000008550820ab37191709b2c050d`, same title. Reports the emergent-interaction extension and the unchanged-core claim, with a four-force limitation.

These included note files are labelled transcriptions, not claims of original-byte identity. Bibliographic and current-source statements retain their original verification limits.
