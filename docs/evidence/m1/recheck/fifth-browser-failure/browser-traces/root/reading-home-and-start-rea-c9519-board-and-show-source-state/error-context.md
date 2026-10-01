# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reading.spec.ts >> home and start read without JavaScript, navigate by keyboard and show source state
- Location: tests/e2e/reading.spec.ts:7:1

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e3]: Private preview · Draft wording, awaiting source-bound review
  - banner [ref=e4]:
    - link "Unity Theory home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=e6]: ↔
      - text: Unity Theory
    - navigation "Main navigation" [ref=e7]:
      - link "Research status" [ref=e8] [cursor=pointer]:
        - /url: /research-status/
      - link "Definitions" [ref=e9] [cursor=pointer]:
        - /url: /concepts/geometry-and-modes/
      - link "Literature" [ref=e10] [cursor=pointer]:
        - /url: /references/
      - link "The question" [ref=e11] [cursor=pointer]:
        - /url: /
      - link "Start simply" [ref=e12] [cursor=pointer]:
        - /url: /start/
  - main [active] [ref=e13]:
    - region [ref=e14]:
      - generic [ref=e15]:
        - paragraph [ref=e16]: A question about organization
        - heading [level=1] [ref=e17]:
          - text: How does a collection become a
          - emphasis [ref=e18]: whole?
        - paragraph [ref=e19]: Parts. Relationships. Activity.And the possibilities they create together.
        - link "Start with the idea" [ref=e20] [cursor=pointer]:
          - /url: /start/
          - text: Start with the idea
          - generic [aria-hidden] [ref=e21]: →
        - paragraph [ref=e22]: A short introduction · No technical background needed
      - figure [ref=e23]:
        - img "Parts can participate in a larger organization Three different connected components form a whole. A surrounding broken circle represents the environment. Arrows indicate reciprocal influence between organization and activity. This is a conceptual illustration, not a measurement." [ref=e24]:
          - generic [ref=e33]: an organized whole
          - generic [ref=e34]: environment & conditions
          - generic [ref=e35]: parts stay active within the whole
        - generic [ref=e36]: Organization ↔ activityA conceptual illustration of the research question.
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]: 01 / The idea
        - paragraph [ref=e40]: From something familiarto a research question.
      - generic [ref=e42]:
        - paragraph [ref=e43]: A wave is a pattern in moving water. A molecule has connected atoms. A living cell exchanges material while maintaining an organization.
        - paragraph [ref=e44]:
          - text: Unity Theory asks how
          - strong [ref=e45]: arrangement and activity work together
          - text: —and how an organized whole can become part of something further.
        - heading "Begin with a wave" [level=2] [ref=e46]
        - paragraph [ref=e47]: Look at a ripple crossing water. The pattern travels, while the water moves locally. The parts and the collective pattern give us two ways to describe what is happening.
        - paragraph [ref=e48]: This is a warm-up for the question, not evidence that every wave becomes a persistent building block.
        - heading "Arrangement shapes activity. Activity changes arrangement." [level=2] [ref=e49]
        - paragraph [ref=e50]:
          - text: The research framework calls these two aspects
          - strong [ref=e51]: geometry
          - text: and
          - strong [ref=e52]: mode structure
          - text: . Geometry includes relationships, connections, boundaries and constraints. Mode structure includes patterns of change, coupling, response and characteristic times—not just a single frequency.
        - paragraph [ref=e53]: An organized whole may then act as a component of another system, while activity continues inside its parts.
        - heading "Source-bound meanings" [level=2] [ref=e54]
        - paragraph [ref=e55]:
          - text: Read
          - link "UT-D01" [ref=e56] [cursor=pointer]:
            - /url: /claims/UT-D01/
          - text: ","
          - link "UT-D02" [ref=e57] [cursor=pointer]:
            - /url: /claims/UT-D02/
          - text: and
          - link "UT-D03" [ref=e58] [cursor=pointer]:
            - /url: /claims/UT-D03/
          - text: . Current open work is listed in the
          - link "research status" [ref=e59] [cursor=pointer]:
            - /url: /research-status/
          - text: .
    - region [ref=e60]:
      - generic [ref=e61]:
        - paragraph [ref=e62]: Choose your depth
        - heading "Follow the question." [level=2] [ref=e63]
      - generic [ref=e64]:
        - link "01 Start simply Move from parts and patterns to the idea of further organization. Read the introduction" [ref=e65] [cursor=pointer]:
          - /url: /start/
          - generic [ref=e66]: "01"
          - heading "Start simply" [level=3] [ref=e67]: Start simply ↗
          - paragraph [ref=e68]: Move from parts and patterns to the idea of further organization.
          - generic [ref=e69]: Read the introduction
        - generic [ref=e70]:
          - generic [ref=e71]: "02"
          - heading "Read the framework" [level=3] [ref=e72]
          - paragraph [ref=e73]: Precise definitions, assumptions, and the boundary between core and extension.
          - generic [ref=e74]: Source available · Website section in preparation
        - generic [ref=e75]:
          - generic [ref=e76]: "03"
          - heading "Explore the documents" [level=3] [ref=e77]
          - paragraph [ref=e78]: Mathematics, evidence, open questions, and the history of the research.
          - generic [ref=e79]: Source available · Website section in preparation
    - generic [ref=e80]:
      - paragraph [ref=e81]: The work ahead
      - heading "A framework to investigate." [level=2] [ref=e82]
      - generic [ref=e83]:
        - heading "Open extensions to prove — not definitions" [level=2] [ref=e84]
        - list [ref=e85]:
          - listitem [ref=e86]: Whether the four known fundamental interactions are manifestations of deeper scale-dependent resonant geometry.
          - listitem [ref=e87]: Whether gravity is an emergent higher-scale geometric/mode regime.
          - listitem [ref=e88]: Whether cosmological background evolution selects which resonant geometries are accessible.
          - listitem [ref=e89]: Whether one cross-domain mathematical invariant or promotion criterion exists.
          - listitem [ref=e90]: Whether RRG yields a novel prediction beyond existing frameworks.
          - listitem [ref=e91]: Whether an RRG-inspired AI architecture gives measurable efficiency/generalization advantages.
        - paragraph [ref=e92]:
          - text: It does
          - strong [ref=e93]: not
          - text: close the claim that the four fundamental forces themselves are all deeper RRG manifestations.
      - paragraph [ref=e94]:
        - link "Read current research status and review limits" [ref=e95] [cursor=pointer]:
          - /url: /research-status/
  - complementary "Source availability" [ref=e96]:
    - generic [ref=e98]:
      - strong [ref=e99]: Current sources available
      - paragraph [ref=e100]: 13 supplied files checked against the recorded edition. Website explanations are drafts; content review is pending.
  - contentinfo [ref=e101]:
    - paragraph [ref=e102]: Unity Theory / Recursive Resonant Geometry
    - paragraph [ref=e103]: A working research framework · Local preview
```