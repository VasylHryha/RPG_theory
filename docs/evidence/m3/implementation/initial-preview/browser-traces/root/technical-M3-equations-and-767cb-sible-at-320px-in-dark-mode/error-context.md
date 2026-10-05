# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: technical.spec.ts >> M3 equations and technical readings remain accessible at 320px in dark mode
- Location: tests/e2e/technical.spec.ts:26:1

# Error details

```
Error: evidence/interactions/

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - link "Skip to content" [ref=f3e2] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=f3e3]:
    - text: Private preview
    - generic [ref=f3e4]: · Draft website explanations
  - banner [ref=f3e5]:
    - link "Unity Theory home" [ref=f3e6] [cursor=pointer]:
      - /url: /
      - generic [aria-hidden] [ref=f3e7]: ↔
      - text: Unity Theory
    - navigation "Main navigation" [ref=f3e8]:
      - link "Start" [ref=f3e9] [cursor=pointer]:
        - /url: /start/
      - link "Framework" [ref=f3e10] [cursor=pointer]:
        - /url: /framework/
      - link "Research" [ref=f3e11] [cursor=pointer]:
        - /url: /research-status/
      - link "Documents" [ref=f3e12] [cursor=pointer]:
        - /url: /documents/
      - link "Sources" [ref=f3e13] [cursor=pointer]:
        - /url: /references/
  - main [ref=f3e14]:
    - article [ref=f3e15]:
      - generic [ref=f3e16]:
        - paragraph [ref=f3e17]: DOC-INTERACTION-EVIDENCE · Revision 1
        - heading "Emergent interaction evidence" [level=1] [ref=f3e18]
        - paragraph [ref=f3e19]: The supplied 07 addendum on phonons, spin ice and background-dependent interaction regimes.
      - generic [ref=f3e21]:
        - generic [ref=f3e22]:
          - term [ref=f3e23]: Scientific role
          - definition [ref=f3e24]: Research document
        - generic [ref=f3e25]:
          - term [ref=f3e26]: Evidence
          - definition [ref=f3e27]: Evidence reported by the supplied documents
        - generic [ref=f3e28]:
          - term [ref=f3e29]: Source fidelity
          - definition [ref=f3e30]: Pending
        - generic [ref=f3e31]:
          - term [ref=f3e32]: Publication
          - definition [ref=f3e33]: Draft · private preview
      - generic [ref=f3e34]:
        - navigation "Technical reading" [ref=f3e35]:
          - link "Framework" [ref=f3e36] [cursor=pointer]:
            - /url: /framework/
          - link "Mathematics" [ref=f3e37] [cursor=pointer]:
            - /url: /math/
          - link "Evidence" [ref=f3e38] [cursor=pointer]:
            - /url: /evidence/
          - link "Status" [ref=f3e39] [cursor=pointer]:
            - /url: /research-status/
          - link "Open questions" [ref=f3e40] [cursor=pointer]:
            - /url: /open-problems/
          - link "Documents" [ref=f3e41] [cursor=pointer]:
            - /url: /documents/
        - paragraph [ref=f3e42]: "Source: 07_EMERGENT_INTERACTION_EVIDENCE.md. Edition: RRG v0.2 locked + evidence updates; promoted 2026-10-01."
        - paragraph [ref=f3e43]:
          - text: "Simpler reading:"
          - link "Start" [ref=f3e44] [cursor=pointer]:
            - /url: /start/
          - text: ·
          - link "Examples" [ref=f3e45] [cursor=pointer]:
            - /url: /examples/
          - text: ·
          - link "Concepts" [ref=f3e46] [cursor=pointer]:
            - /url: /concepts/
          - text: .
        - complementary "Reading context" [ref=f3e47]:
          - heading "Before reading" [level=2] [ref=f3e48]
          - paragraph [ref=f3e49]: The supplied addendum reports three distinct physical cases. Their mechanisms and conditions differ. The narrower proposed relation is lower-level organization → effective interaction channel → possible higher-level organization. This is not a derivation of strong, weak, electromagnetic and gravitational interactions from RRG.
          - paragraph [ref=f3e50]:
            - text: The source’s statements about established physics and evidence are attributed to the document and its cited authors. Individual mapped records are
            - link "UT-E10" [ref=f3e51] [cursor=pointer]:
              - /url: /claims/UT-E10/
            - text: ","
            - link "UT-E11" [ref=f3e52] [cursor=pointer]:
              - /url: /claims/UT-E11/
            - text: and
            - link "UT-E12" [ref=f3e53] [cursor=pointer]:
              - /url: /claims/UT-E12/
            - text: .
        - group [ref=f3e54]:
          - generic "On this page (6 sections)" [ref=f3e55] [cursor=pointer]
      - generic [ref=f3e56]:
        - blockquote [ref=f3e57]:
          - paragraph [ref=f3e58]:
            - strong [ref=f3e59]: NON-NORMATIVE.
            - text: This file adds evidence for an extension of the locked core. It does not alter
            - code [ref=f3e60]: 00_LOCKED_CORE.md
            - text: .
        - heading "Extension under test" [level=2] [ref=f3e61]
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e62]:
          - generic [ref=f3e63]:
            - math [ref=f3e65]:
              - generic [ref=f3e72]:
                - generic [ref=f3e73]: lower-level organization
                - generic [ref=f3e74]: →
                - generic [ref=f3e75]: collective mode / effective medium
                - generic [ref=f3e76]: →
                - generic [ref=f3e77]: new effective interaction
                - generic [ref=f3e78]: →
                - generic [ref=f3e79]: higher-level organization
            - generic [ref=f3e88]:
              - generic [ref=f3e89]: lower-level organization
              - text: →
              - generic [ref=f3e90]: collective mode / effective medium
              - text: →
              - generic [ref=f3e91]: new effective interaction
              - text: →
              - generic [ref=f3e92]: higher-level organization
        - paragraph [ref=f3e97]:
          - text: This is
          - strong [ref=f3e98]: not
          - text: the same as claiming that every effective interaction is a new fundamental force, or that the four known fundamental interactions have already been derived from RRG.
        - paragraph [ref=f3e99]: "The narrower question is:"
        - blockquote [ref=f3e100]:
          - paragraph [ref=f3e101]: Can a lower-level organization generate an interaction channel that is meaningful at a higher descriptive level and that can support a new organized state?
        - paragraph [ref=f3e102]:
          - text: Established physics says
          - strong [ref=f3e103]: "yes"
          - text: .
        - separator [ref=f3e104]
        - heading "1. Phonon-mediated effective attraction in superconductivity" [level=2] [ref=f3e105]
        - paragraph [ref=f3e106]: In conventional superconductivity, electrons couple to lattice vibrations (phonons).
        - paragraph [ref=f3e107]:
          - text: At the microscopic level, electrons and ions interact electromagnetically. The organized crystal lattice, however, possesses collective vibrational modes. Electron–phonon coupling can generate an
          - strong [ref=f3e108]: effective electron–electron attraction
          - text: in the appropriate regime, allowing Cooper pairing and superconducting order.
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e109]:
          - generic [ref=f3e110]:
            - math [ref=f3e112]:
              - generic [ref=f3e119]:
                - generic [ref=f3e120]: crystal geometry
                - generic [ref=f3e121]: →
                - generic [ref=f3e122]: phonon modes
                - generic [ref=f3e123]: →
                - generic [ref=f3e124]: effective electron interaction
                - generic [ref=f3e125]: →
                - generic [ref=f3e126]: Cooper pairing / superconducting order
            - generic [ref=f3e135]:
              - generic [ref=f3e136]: crystal geometry
              - text: →
              - generic [ref=f3e137]: phonon modes
              - text: →
              - generic [ref=f3e138]: effective electron interaction
              - text: →
              - generic [ref=f3e139]: Cooper pairing / superconducting order
        - paragraph [ref=f3e144]: The effective attraction does not replace electromagnetism as a fundamental interaction. It is a higher-level interaction generated through collective lattice dynamics.
        - heading "RRG relevance" [level=3] [ref=f3e145]
        - paragraph [ref=f3e146]: "This directly supports the extension:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e147]:
          - generic [ref=f3e148]:
            - math [ref=f3e150]:
              - generic [ref=f3e152]:
                - generic [ref=f3e153]:
                  - generic [ref=f3e154]: G
                  - generic [ref=f3e155]: "n"
                - generic [ref=f3e156]: ↔
                - generic [ref=f3e157]:
                  - generic [ref=f3e158]: M
                  - generic [ref=f3e159]: "n"
                - generic [ref=f3e160]: →
                - generic [ref=f3e161]:
                  - generic [ref=f3e162]: I
                  - generic [ref=f3e163]:
                    - generic [ref=f3e164]: "n"
                    - generic [ref=f3e165]: +
                    - generic [ref=f3e166]: "1"
                  - generic [ref=f3e167]:
                    - generic [ref=f3e168]: e
                    - generic [ref=f3e169]: f
                    - generic [ref=f3e170]: f
                - generic [ref=f3e171]: →
                - generic [ref=f3e172]:
                  - generic [ref=f3e173]: G
                  - generic [ref=f3e174]:
                    - generic [ref=f3e175]: "n"
                    - generic [ref=f3e176]: +
                    - generic [ref=f3e177]: "1"
                - generic [ref=f3e178]: .
            - generic [aria-hidden] [ref=f3e179]:
              - generic [ref=f3e180]:
                - generic [ref=f3e181]:
                  - text: G
                  - generic [ref=f3e182]: "n"
                - text: ↔
              - generic [ref=f3e190]:
                - generic [ref=f3e191]:
                  - text: M
                  - generic [ref=f3e192]: "n"
                - text: →
              - generic [ref=f3e200]:
                - generic [ref=f3e201]:
                  - text: I
                  - generic [ref=f3e205]:
                    - generic [ref=f3e206]: n+1
                    - generic [ref=f3e208]: eff
                - text: →
              - generic [ref=f3e214]:
                - generic [ref=f3e215]:
                  - text: G
                  - generic [ref=f3e216]: n+1
                - text: .
        - heading "Evidence" [level=3] [ref=f3e225]
        - paragraph [ref=f3e226]:
          - text: X. H. Zheng & D. G. Walmsley,
          - emphasis [ref=f3e227]: Physical Review B
          - text: "71, 134512 (2005). DOI:"
          - link "https://doi.org/10.1103/PhysRevB.71.134512" [ref=f3e228] [cursor=pointer]:
            - /url: https://doi.org/10.1103/PhysRevB.71.134512
        - separator [ref=f3e229]
        - heading "2. Emergent magnetic charges and Coulomb-like interactions in spin ice" [level=2] [ref=f3e230]
        - paragraph [ref=f3e231]: Spin-ice materials contain microscopic magnetic moments constrained by lattice geometry and frustration.
        - paragraph [ref=f3e232]:
          - text: Collective correlations in this many-body geometry permit excitations that behave as
          - strong [ref=f3e233]: emergent magnetic monopoles
          - text: rather than elementary magnetic charges.
        - paragraph [ref=f3e234]: Castelnovo, Moessner & Sondhi predicted these quasiparticles as emergent manifestations of the correlated spin-ice system.
        - paragraph [ref=f3e235]:
          - text: Bramwell and collaborators later experimentally measured effective magnetic charges and currents in Dy
          - generic [ref=f3e236]:
            - math [ref=f3e238]:
              - generic [ref=f3e239]: "2"
            - generic [ref=f3e244]: "2"
          - text: Ti
          - generic [ref=f3e254]:
            - math [ref=f3e256]:
              - generic [ref=f3e257]: "2"
            - generic [ref=f3e262]: "2"
          - text: O
          - generic [ref=f3e272]:
            - math [ref=f3e274]:
              - generic [ref=f3e275]: "7"
            - generic [ref=f3e280]: "7"
          - text: ", showing that these emergent charges interact through a Coulomb potential."
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e290]:
          - generic [ref=f3e291]:
            - math [ref=f3e293]:
              - generic [ref=f3e300]:
                - generic [ref=f3e301]: microscopic spins
                - generic [ref=f3e302]: +
                - generic [ref=f3e303]: collective geometric constraints
                - generic [ref=f3e304]: →
                - generic [ref=f3e305]: emergent quasiparticles
                - generic [ref=f3e306]: +
                - generic [ref=f3e307]: Coulomb-like effective interaction
            - generic [ref=f3e316]:
              - generic [ref=f3e317]: microscopic spins
              - text: +
              - generic [ref=f3e318]: collective geometric constraints
              - text: →
              - generic [ref=f3e319]: emergent quasiparticles
              - text: +
              - generic [ref=f3e320]: Coulomb-like effective interaction
        - heading "RRG relevance" [level=3] [ref=f3e325]
        - paragraph [ref=f3e326]: "This demonstrates that a collective geometry can generate:"
        - list [ref=f3e327]:
          - listitem [ref=f3e328]: new effective particle-like degrees of freedom;
          - listitem [ref=f3e329]: a higher-level interaction law;
          - listitem [ref=f3e330]: behavior that is not apparent from treating each microscopic spin independently.
        - heading "Evidence" [level=3] [ref=f3e331]
        - paragraph [ref=f3e332]:
          - text: Castelnovo, Moessner & Sondhi,
          - emphasis [ref=f3e333]: Nature
          - text: "451, 42–45 (2008). DOI:"
          - link "https://doi.org/10.1038/nature06433" [ref=f3e334] [cursor=pointer]:
            - /url: https://doi.org/10.1038/nature06433
        - paragraph [ref=f3e335]:
          - text: Bramwell et al.,
          - emphasis [ref=f3e336]: Nature
          - text: "461, 956–959 (2009). DOI:"
          - link "https://doi.org/10.1038/nature08500" [ref=f3e337] [cursor=pointer]:
            - /url: https://doi.org/10.1038/nature08500
        - paragraph [ref=f3e338]:
          - text: Mengotti et al.,
          - emphasis [ref=f3e339]: Nature Physics
          - text: "7, 68–74 (2011). DOI:"
          - link "https://doi.org/10.1038/nphys1794" [ref=f3e340] [cursor=pointer]:
            - /url: https://doi.org/10.1038/nphys1794
        - separator [ref=f3e341]
        - heading "3. Background-field state changes the observable interaction regime" [level=2] [ref=f3e342]
        - paragraph [ref=f3e343]: Electromagnetic and weak interactions are described within electroweak theory.
        - paragraph [ref=f3e344]:
          - text: As the early Universe cooled, the Higgs field settled into a non-zero vacuum configuration. The
          - generic [ref=f3e345]:
            - math [ref=f3e347]:
              - generic [ref=f3e348]: W
            - generic [ref=f3e352]: W
          - text: and
          - generic [ref=f3e353]:
            - math [ref=f3e355]:
              - generic [ref=f3e356]: Z
            - generic [ref=f3e360]: Z
          - text: bosons acquired mass while the photon remained massless.
        - paragraph [ref=f3e361]: "That changes low-energy interaction behavior:"
        - list [ref=f3e362]:
          - listitem [ref=f3e363]:
            - text: massive
            - generic [ref=f3e364]:
              - math [ref=f3e366]:
                - generic [ref=f3e368]:
                  - generic [ref=f3e369]: W
                  - generic [ref=f3e370]: /
                  - generic [ref=f3e371]: Z
              - generic [ref=f3e373]: W/Z
            - text: carriers imply a very short-range weak interaction;
          - listitem [ref=f3e374]: the massless photon supports long-range electromagnetism.
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e375]:
          - generic [ref=f3e376]:
            - math [ref=f3e378]:
              - generic [ref=f3e385]:
                - generic [ref=f3e386]: background field state
                - generic [ref=f3e387]: →
                - generic [ref=f3e388]: particle spectrum
                - generic [ref=f3e389]: →
                - generic [ref=f3e390]: effective interaction ranges / behavior
            - generic [ref=f3e399]:
              - generic [ref=f3e400]: background field state
              - text: →
              - generic [ref=f3e401]: particle spectrum
              - text: →
              - generic [ref=f3e402]: effective interaction ranges / behavior
        - heading "RRG relevance" [level=3] [ref=f3e407]
        - paragraph [ref=f3e408]: "This supports the weaker extension:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e409]:
          - generic [ref=f3e410]:
            - math [ref=f3e412]:
              - generic [ref=f3e419]:
                - generic [ref=f3e420]: background state
                - generic [ref=f3e421]: →
                - generic [ref=f3e422]: mode / particle spectrum
                - generic [ref=f3e423]: →
                - generic [ref=f3e424]: interaction regime
            - generic [ref=f3e433]:
              - generic [ref=f3e434]: background state
              - text: →
              - generic [ref=f3e435]: mode / particle spectrum
              - text: →
              - generic [ref=f3e436]: interaction regime
        - paragraph [ref=f3e441]:
          - text: It does
          - strong [ref=f3e442]: not
          - text: establish that electroweak physics is itself generated by RRG recursion.
        - heading "Evidence" [level=3] [ref=f3e443]
        - paragraph [ref=f3e444]:
          - text: "CERN, “The origins of the Brout–Englert–Higgs mechanism”:"
          - link "https://home.cern/science/physics/origins-brout-englert-higgs-mechanism/" [ref=f3e445] [cursor=pointer]:
            - /url: https://home.cern/science/physics/origins-brout-englert-higgs-mechanism/
        - paragraph [ref=f3e446]:
          - text: "CERN, “What’s so special about the Higgs boson?”:"
          - link "https://home.cern/science/physics/higgs-boson/what/" [ref=f3e447] [cursor=pointer]:
            - /url: https://home.cern/science/physics/higgs-boson/what/
        - separator [ref=f3e448]
        - heading "4. What these examples establish" [level=2] [ref=f3e449]
        - paragraph [ref=f3e450]: "Supported:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e451]:
          - generic [ref=f3e452]:
            - math [ref=f3e454]:
              - generic [ref=f3e461]:
                - generic [ref=f3e462]: organization at one level
                - generic [ref=f3e463]: →
                - generic [ref=f3e464]: collective mode / constraint
                - generic [ref=f3e465]: →
                - generic [ref=f3e466]: new effective interaction
                - generic [ref=f3e467]: →
                - generic [ref=f3e468]: new collective organization
            - generic [ref=f3e477]:
              - generic [ref=f3e478]: organization at one level
              - text: →
              - generic [ref=f3e479]: collective mode / constraint
              - text: →
              - generic [ref=f3e480]: new effective interaction
              - text: →
              - generic [ref=f3e481]: new collective organization
        - paragraph [ref=f3e486]: This mechanism occurs in more than one distinct physical system.
        - paragraph [ref=f3e487]:
          - text: Therefore RRG does
          - strong [ref=f3e488]: not
          - text: need to invent the possibility that lower-level organization can create a higher-level effective interaction.
        - separator [ref=f3e489]
        - heading "5. What remains open" [level=2] [ref=f3e490]
        - paragraph [ref=f3e491]:
          - text: These examples do
          - strong [ref=f3e492]: not
          - text: "prove:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e493]:
          - generic [ref=f3e494]:
            - math [ref=f3e496]:
              - generic [ref=f3e503]:
                - generic [ref=f3e504]: strong, weak, EM, gravity
                - generic [ref=f3e505]: =
                - generic [ref=f3e506]: four successive RRG resonant levels
            - generic [ref=f3e515]:
              - generic [ref=f3e516]: strong, weak, EM, gravity
              - text: =
              - generic [ref=f3e517]: four successive RRG resonant levels
        - paragraph [ref=f3e522]: They also do not prove that all forces are literally scalar frequencies.
        - paragraph [ref=f3e523]: The locked core remains unchanged.
        - paragraph [ref=f3e524]: "The stronger RRG extension remains:"
        - region "Mathematical expression; scroll horizontally if needed" [ref=f3e525]:
          - generic [ref=f3e526]:
            - math [ref=f3e528]:
              - generic [ref=f3e535]:
                - generic [ref=f3e536]:
                  - generic [ref=f3e537]: R
                  - generic [ref=f3e538]: "n"
                - generic [ref=f3e539]: =
                - generic [ref=f3e540]: (
                - generic [ref=f3e541]:
                  - generic [ref=f3e542]: G
                  - generic [ref=f3e543]: "n"
                - generic [ref=f3e544]: ","
                - generic [ref=f3e545]:
                  - generic [ref=f3e546]: M
                  - generic [ref=f3e547]: "n"
                - generic [ref=f3e548]: )
                - generic [ref=f3e549]: →
                - generic [ref=f3e550]:
                  - generic [ref=f3e551]: I
                  - generic [ref=f3e552]:
                    - generic [ref=f3e553]: "n"
                    - generic [ref=f3e554]: +
                    - generic [ref=f3e555]: "1"
                  - generic [ref=f3e556]:
                    - generic [ref=f3e557]: e
                    - generic [ref=f3e558]: f
                    - generic [ref=f3e559]: f
                - generic [ref=f3e560]: →
                - generic [ref=f3e561]:
                  - generic [ref=f3e562]: R
                  - generic [ref=f3e563]:
                    - generic [ref=f3e564]: "n"
                    - generic [ref=f3e565]: +
                    - generic [ref=f3e566]: "1"
            - generic [ref=f3e575]:
              - generic [ref=f3e576]:
                - text: R
                - generic [ref=f3e577]: "n"
              - text: = (
              - generic [ref=f3e585]:
                - text: G
                - generic [ref=f3e586]: "n"
              - text: ","
              - generic [ref=f3e594]:
                - text: M
                - generic [ref=f3e595]: "n"
              - text: ) →
              - generic [ref=f3e603]:
                - text: I
                - generic [ref=f3e607]:
                  - generic [ref=f3e608]: n+1
                  - generic [ref=f3e610]: eff
              - text: →
              - generic [ref=f3e616]:
                - text: R
                - generic [ref=f3e617]: n+1
        - paragraph [ref=f3e630]:
          - text: where
          - generic [ref=f3e631]:
            - math [ref=f3e633]:
              - generic [ref=f3e636]:
                - generic [ref=f3e637]: I
                - generic [ref=f3e638]:
                  - generic [ref=f3e639]: e
                  - generic [ref=f3e640]: f
                  - generic [ref=f3e641]: f
            - generic [ref=f3e644]:
              - text: I
              - generic [ref=f3e645]: eff
          - text: is an effective interaction channel generated, activated, or made dominant by the organization at level
          - generic [ref=f3e652]:
            - math [ref=f3e654]:
              - generic [ref=f3e655]: "n"
            - generic [ref=f3e659]: "n"
          - text: .
        - paragraph [ref=f3e660]: "The next research question is:"
        - blockquote [ref=f3e661]:
          - paragraph [ref=f3e662]:
            - strong [ref=f3e663]: Under what general conditions does a resonant geometry generate an effective interaction channel that stabilizes or enables a new higher-level resonant geometry?
      - generic [ref=f3e665]:
        - heading "Scope and sources" [level=2] [ref=f3e666]
        - paragraph [ref=f3e667]: The supplied 07 addendum on phonons, spin ice and background-dependent interaction regimes.
        - paragraph [ref=f3e668]: 07_EMERGENT_INTERACTION_EVIDENCE.md, original current edition; source body is extracted, not independently authored.
        - group [ref=f3e669]:
          - generic "Source extraction details" [ref=f3e670]
        - heading "Depends on" [level=3] [ref=f3e671]
        - list [ref=f3e672]:
          - listitem [ref=f3e673]:
            - link "DOC-CORE — The locked RRG core" [ref=f3e674] [cursor=pointer]:
              - /url: /documents/locked-core/
          - listitem [ref=f3e675]:
            - link "UT-E10 — Phonon-mediated effective attraction" [ref=f3e676] [cursor=pointer]:
              - /url: /claims/UT-E10/
          - listitem [ref=f3e677]:
            - link "UT-E11 — Emergent spin-ice charges and interactions" [ref=f3e678] [cursor=pointer]:
              - /url: /claims/UT-E11/
          - listitem [ref=f3e679]:
            - link "UT-E12 — Background state and interaction regime" [ref=f3e680] [cursor=pointer]:
              - /url: /claims/UT-E12/
        - heading "References reported by this source" [level=3] [ref=f3e681]
        - list [ref=f3e682]:
          - listitem [ref=f3e683]:
            - link "Coulomb repulsion and T_c in BCS theory of superconductivity" [ref=f3e684] [cursor=pointer]:
              - /url: /references/#BIB-0016
          - listitem [ref=f3e685]:
            - link "Magnetic monopoles in spin ice" [ref=f3e686] [cursor=pointer]:
              - /url: /references/#BIB-0017
          - listitem [ref=f3e687]:
            - link "Measurement of the charge and current of magnetic monopoles in spin ice" [ref=f3e688] [cursor=pointer]:
              - /url: /references/#BIB-0018
          - listitem [ref=f3e689]:
            - link "Real-space observation of emergent magnetic monopoles and associated Dirac strings in artificial kagome spin ice" [ref=f3e690] [cursor=pointer]:
              - /url: /references/#BIB-0019
          - listitem [ref=f3e691]:
            - link "The origins of the Brout–Englert–Higgs mechanism" [ref=f3e692] [cursor=pointer]:
              - /url: /references/#BIB-0020
          - listitem [ref=f3e693]:
            - link "What’s so special about the Higgs boson?" [ref=f3e694] [cursor=pointer]:
              - /url: /references/#BIB-0021
  - complementary "Source availability" [ref=f3e695]:
    - generic [ref=f3e697]:
      - strong [ref=f3e698]: Current sources available
      - paragraph [ref=f3e699]: 13 supplied files checked against the recorded edition. Website explanations are drafts.
  - contentinfo [ref=f3e700]:
    - paragraph [ref=f3e701]: Unity Theory / Recursive Resonant Geometry
    - paragraph [ref=f3e702]: A working research framework · Local preview
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | const base=process.env.UNITY_TEST_BASE ?? '/';
  4  | const suffix=base==='/'?'root':'subpath';
  5  | const evidence=process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m3/implementation';
  6  | 
  7  | test('M3 technical reading and source discovery work without JavaScript',async({browser})=>{
  8  |   const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1280,height:900}}),page=await context.newPage();
  9  |   const failures:string[]=[];page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  10 |   await page.goto(process.env.UNITY_TEST_ORIGIN+base);
  11 |   await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Framework',exact:true}).click();
  12 |   await expect(page.locator('[data-technical-guide]')).toContainText('02_scientific_framework.md');
  13 |   await page.screenshot({path:`${evidence}/${suffix}-framework-desktop.png`});
  14 |   await page.getByText('On this page (',{exact:false}).click();
  15 |   await page.locator('.technical-toc').getByRole('link',{name:'11. The four interactions: current RRG position',exact:true}).click();
  16 |   await expect(page.locator('#11-the-four-interactions-current-rrg-position')).toBeInViewport();
  17 |   for(const route of ['math/','evidence/','evidence/interactions/','evidence/additional/','research-status/','research-status/proof-matrix/','open-problems/','documents/','documents/locked-core/','changes/','changes/source-history/']) {
  18 |     await page.goto(process.env.UNITY_TEST_ORIGIN+base+route);
  19 |     await expect(page.locator('h1')).toHaveCount(1);
  20 |     await expect(page.getByRole('navigation',{name:'Technical reading'})).toBeVisible();
  21 |     await expect(page.locator('[data-record-status]')).toContainText('Draft · private preview');
  22 |   }
  23 |   expect(failures).toEqual([]);await context.close();
  24 | });
  25 | 
  26 | test('M3 equations and technical readings remain accessible at 320px in dark mode',async({page})=>{
  27 |   await page.setViewportSize({width:320,height:800});await page.emulateMedia({colorScheme:'dark'});
  28 |   for(const route of ['framework/','math/','evidence/','evidence/interactions/','evidence/additional/','open-problems/','documents/locked-core/','changes/']) {
  29 |     await page.goto(base+route);
> 30 |     expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route).toBe(true);
     |                                                                                                    ^ Error: evidence/interactions/
  31 |     await expect(page.locator('.katex-error')).toHaveCount(0);
  32 |     const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  33 |     expect(audit.violations,JSON.stringify(audit.violations)).toEqual([]);
  34 |     if(route==='math/') {
  35 |       expect(await page.locator('math').count()).toBeGreaterThan(50);
  36 |       const equation=page.locator('.katex-display').filter({has:page.locator('annotation', {hasText:'\\Gamma_k[D,\\Psi]'})}).first();
  37 |       await equation.scrollIntoViewIfNeeded();await equation.focus();
  38 |       expect(await equation.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
  39 |       await page.keyboard.press('ArrowRight');await expect.poll(()=>equation.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  40 |       await page.screenshot({path:`${evidence}/${suffix}-math-mobile-equation.png`});
  41 |       await page.goto(base+'math/#40-next-concrete-calculation');
  42 |       await page.screenshot({path:`${evidence}/${suffix}-math-next-calculation.png`});
  43 |     }
  44 |     if(route==='evidence/additional/')await page.screenshot({path:`${evidence}/${suffix}-additional-evidence-mobile.png`});
  45 |   }
  46 | });
  47 | 
  48 | test('M3 evidence attribution, scope and open tests remain visible beside the actual sources',async({page})=>{
  49 |   await page.goto(base+'evidence/additional/');
  50 |   await expect(page.locator('[data-technical-guide]')).toContainText('not new paper inspections');
  51 |   await expect(page.locator('[data-canonical-body]')).toContainText('full manuscript was not accessible');
  52 |   await expect(page.locator('[data-canonical-body]')).toContainText('subscription full text not inspected');
  53 |   await page.goto(base+'evidence/interactions/#5-what-remains-open');
  54 |   await expect(page.locator('[data-canonical-body]')).toContainText('They also do not prove that all forces are literally scalar frequencies');
  55 |   await page.goto(base+'open-problems/');
  56 |   await page.getByRole('link',{name:'mathematical model’s strong failure conditions'}).click();
  57 |   await expect(page).toHaveURL(new RegExp('math/#19-strong-failure-conditions$'));
  58 |   await expect(page.locator('#19-strong-failure-conditions')).toBeInViewport();
  59 | });
  60 | 
```