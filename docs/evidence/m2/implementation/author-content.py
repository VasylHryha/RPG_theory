from pathlib import Path
import json
folder=Path('research/publication');date='2026-10-03'
edition='RRG v0.2 locked + evidence updates; promoted 2026-10-01'
reads=[]
for file in ['00_LOCKED_CORE.md','01_world_explanation.md','02_scientific_framework.md','04_status_and_blockers.md','06_PROOF_MATRIX.md','07_EMERGENT_INTERACTION_EVIDENCE.md','08_ADDITIONAL_PRIMARY_EVIDENCE.md']:
 import hashlib
 raw=Path('research/RRG_CURRENT',file).read_bytes();reads.append(dict(path='research/RRG_CURRENT/'+file,sha256=hashlib.sha256(raw).hexdigest(),purpose='M2 source-faithful authoring; no scientific adjudication'))
Path('docs/evidence/m2/implementation/source-reads.json').write_text(json.dumps(reads,indent=2)+'\n')
refs=json.loads((folder/'references.yaml').read_text())
background=[
 ('BIB-0060','Why does the ocean have waves?','https://oceanservice.noaa.gov/facts/wavesinocean.html','NOAA','Energy propagation and local water motion in ordinary surface waves.'),
 ('BIB-0061','Standing Waves and Resonance — University Physics, 16.6','https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance','OpenStax','Fixed string boundaries, supported modes, tension and linear density in the ideal string model.'),
 ('BIB-0062','Overview of Photosynthesis — Biology 2e, 8.1','https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis','OpenStax','Oxygen-producing photosynthesis and its biological role; no inevitable complexity ladder.'),
 ('BIB-0063','Passive Transport — Biology 2e, 5.2','https://openstax.org/books/biology-2e/pages/5-2-passive-transport','OpenStax','Selective membrane transport, gradients and energy-dependent maintenance in cells.'),
 ('BIB-0064','Whiffs and the Rise of Oxygen','https://astrobiology.nasa.gov/news/whiffs-and-the-rise-of-oxygen/','NASA Astrobiology','Institutional research report on changing atmospheric oxygen; not an independently adjudicated oxygenation chronology.'),
 ('BIB-0065','Molecular Structure and Polarity — Chemistry 2e, 7.6','https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity','OpenStax','Relationships between molecular bonding, arrangement and properties.'),
]
for id,title,url,author,support in background:
 refs.append(dict(id=id,identity=url,title=title,url=url,sourceRefs=[],authors=[author],supportScope=support+' Basic background only; does not establish universal RRG.',verificationScope='M2 background page inspected on 3 October 2026. The original RRG documents own the research interpretation; this resource is supplementary.',checkedAt=date))
(folder/'references.yaml').write_text(json.dumps(refs,indent=2)+'\n')
Path('docs/evidence/m2/implementation/background-sources.json').write_text(json.dumps([dict(id=id,title=title,url=url,readAt=date,inspection='Relevant educational text; not full-paper scientific review',supportScope=support) for id,title,url,author,support in background],indent=2)+'\n')
starref=next(r['id'] for r in refs if 'what-were-the-first-stars-like' in r['url'])
def write(slug,id,route,title,description,body,kind='example',deps=None,sources=None,bibs=None,mapping='',scope='An illustrative beginner explanation mapped to the original supplied RRG documents.'):
 path=folder/'pages'/f'{slug}.md'
 meta=dict(id=id,route=route,title=title,description=description,revision=1,kind=kind,lang='en',audience='general',researchEdition=edition,publicationState='draft',publishedAt=None,updatedAt=date,sourceRefs=sources or ['R-CURRENT-CORE','R-CURRENT-WORLD'],dependsOn=deps or [],related=[],bibRefs=bibs or [],contentOrigin='authored',sourceBinding=None,statement=None,plainLanguage='',scope=scope,evidenceState='not-applicable',sourceMapping=mapping,adapter='markdown/1',limits='',rightsRef=None)
 if path.exists():
  old=json.loads(path.read_text().split('---')[1]);meta['revision']=old['revision']+1
 path.write_text('---\n'+json.dumps(meta,indent=2)+'\n---\n'+body.strip()+'\n')
base_deps=['UT-D01','UT-D02','UT-D03','UT-D05','UT-D06','UT-D08','UT-C01','UT-C02','UT-O04','UT-O05','UT-E10','UT-E11','UT-E12','DOC-STATUS']
write('home','DOC-HOME','/','How do parts become a whole?','Unity Theory asks how arrangement and activity support persistent organization—and make further organization possible.', '''## Begin with a wave

Watch a ripple cross water. A crest moves across the surface as the water moves locally. The visible pattern and the material carrying it give us two ways to describe one event. [Explore the wave](/examples/water/); the background physics is explained by [NOAA's wave explanation](/references/#BIB-0060).

## Arrangement and activity belong together

A string's fixed ends constrain its motion. A molecule's connections constrain its collective behaviour. A cell keeps its organization through ongoing exchanges with its surroundings.

Recursive Resonant Geometry, or **RRG**, asks how relationships and activity support one another. Its **geometry** means components, connections, boundaries and constraints. Its **mode structure** means the organized ways those parts change and respond over time.

## A whole can become a part

In the RRG proposal, compatible active parts may form a persistent whole. That whole can participate in another organization while activity continues inside it. Existing structures can also change the conditions for what happens next: a star makes new reaction conditions; living systems change their chemical surroundings.

The wave introduces a distinction, rather than proving this entire cycle. The examples have different physical mechanisms. The research question is whether a useful, predictive organizing principle connects them.

[Read the full introduction](/start/) or [explore the concepts](/concepts/).''',kind='intro',deps=base_deps+['DOC-EXAMPLE-WATER'],bibs=['BIB-0060'],sources=['R-CURRENT-CORE','R-CURRENT-WORLD','R-CURRENT-SCIENCE','R-CURRENT-INTERACTIONS'],mapping='Core §§1–3, 5, 7–11; world explanation §§2, 4, 6–7, 10 and background addendum. The water warm-up is supplementary NOAA physics, not a new RRG claim.',scope='Compact introduction to the source research question, with one familiar warm-up and links to deeper examples.')
write('start','DOC-START','/start/','Start with the idea','From a familiar pattern to the question of persistent and further organization.', '''## A pattern and its parts

Imagine a ripple crossing a quiet patch of water. You can follow its crest with your eyes, even though the water moves locally as the disturbance passes. The pattern and the parts carrying it are different descriptions of the same event. This familiar observation is a useful place to begin, without requiring equations. The [water example](/examples/water/) explains the distinction and links to its physics source.

Unity Theory asks a broader question: **how do arrangement and activity support an organized whole, and how can that whole make further organization possible?** Its working framework is called Recursive Resonant Geometry, or RRG. The examples help us understand the question. Establishing a general principle that makes useful predictions is the research still to do.

## Arrangement changes what can happen

Consider a [stretched string](/examples/string/). Its length and fixed ends restrict the motions it can support. Its tension and mass per unit length matter too: changing a material or physical condition changes the result. The shape of the string alone does not supply its physical law.

RRG calls a system's organization **geometry**. Here that word includes parts, connections, ordering, boundaries and constraints, beyond a visible outline. Two systems with similar ingredients can behave differently because their parts relate differently. A [molecule](/examples/molecule/) gives another example: its bonds and arrangement constrain how the group can respond while the atoms retain internal structure.

## Activity changes the organization

The other aspect is **mode structure**: the organized ways a system moves, changes or responds over time. A repeating vibration is one example, but coordinated responses, relative timing and processes operating at different speeds also matter. One frequency number cannot describe every organized system.

A string shows how arrangement constrains motion. Living systems make the reverse direction easier to see: chemical activity and exchanges with the surroundings help maintain their organization. RRG considers these aspects together. Activity can also transform or destroy an arrangement. The proposal does not make either side universally first.

## A whole can become a part

A [cell](/examples/cell/) contains many interacting components. Its organization can remain recognizable while material enters, leaves and is replaced. That same cell can participate in a larger organization. The lower-level activity continues inside the higher-level description.

RRG uses **scale** for a level at which an organized whole can function as a useful unit in further interactions. Scale involves the relationships and processes that matter to the description, as well as size. Mechanisms and characteristic times can change between levels.

**Recursive organization** means that a whole can participate as a part in further organization. It does not require identical components or compulsory copying at every step. Biological reproduction is one particular mechanism; it is not the definition of the general pattern. The [recursion concept](/concepts/recursion/) follows this distinction back to the source definitions.

## Existing structures change the conditions

A [star](/examples/star/) creates temperature and pressure conditions in which nuclear reactions can make new nuclei. The original world explanation uses this to illustrate how an existing organization can expand the possibilities for later chemistry.

[Life changing its environment](/examples/life-environment/) brings the idea closer to home. Oxygen-producing organisms alter their surroundings, changing conditions for other organisms and reactions. Those consequences depend on resources, chemical processes and history. There is no purpose-driven guarantee that every change creates a more complex next stage.

The source framework treats the broader question of environmental possibilities as an extension compatible with its core. A useful explanation must keep that status visible alongside the positive idea.

## Which interactions become possible?

An **effective interaction** is an interaction used in a description of a collective system. The supplied evidence documents describe crystal vibrations mediating electron attraction, collective magnetic excitations in spin ice, and a background field changing an interaction regime. These are distinct physical cases, with different conditions.

RRG asks when lower-level organization can enable such an interaction, and when that interaction can help another organization persist. The [deeper interaction concept](/concepts/effective-interactions/) explains the source's examples and proposed relation. They do not establish that the four fundamental forces are four successive RRG levels.

## What remains to be tested

The original documents separate their core definitions, illustrative examples, particular reported evidence and stronger open extensions. The common organizing principle needs useful mathematical criteria and predictions beyond descriptions of results already known. Specific experiments can test specific models; an analogy cannot do that work on its own.

You can [choose an example](/examples/), [read the concepts](/concepts/) or see the original [current research status](/research-status/). No technical background is needed to find the question, the uncertainty or a source.

[Return to the research question](/#research-question).''',kind='intro',deps=base_deps+['UT-D04','UT-D09','DOC-EXAMPLE-STRING','DOC-EXAMPLE-MOLECULE','DOC-EXAMPLE-STAR','DOC-EXAMPLE-LIFE','DOC-EXAMPLE-CELL','DOC-CONCEPT-INTERACTIONS'],sources=['R-CURRENT-CORE','R-CURRENT-WORLD','R-CURRENT-SCIENCE','R-CURRENT-INTERACTIONS','R-CURRENT-ADDITIONAL'],mapping='Core §§1–11; world §§2–10 and background addendum; framework §§1–3, 7–8, 11, 15, 21–24; proof matrix; interaction addendum §§1–5; additional-evidence introduction and scope conventions.',scope='Complete beginner introduction to the source framework; illustrations and stronger open extensions remain distinct.')
write('examples','DOC-EXAMPLES','/examples/','Six ways into the question','Patterns, constraints, reusable wholes and changing conditions.', '''Each example has one job. Begin with something familiar, then ask what the parts are doing, what constrains them, and what the collective description adds. The examples illustrate different aspects of RRG; they are not six demonstrations of one universal mechanism.

## Patterns and constraints

- [Water: follow a pattern](/examples/water/) — distinguish the moving pattern from its material parts.
- [String: boundaries shape motion](/examples/string/) — see how arrangement and physical conditions constrain supported modes.
- [Molecule: the whole constrains its parts](/examples/molecule/) — explore collective behaviour and retained internal structure.

## Organization changes the possibilities

- [Star: new reaction conditions](/examples/star/) — distinguish physical evolution from changing the level of description.
- [Life and environment: conditions for other life](/examples/life-environment/) — follow biological effects without a guaranteed ladder of complexity.
- [Cell: organization through exchange](/examples/cell/) — separate ongoing maintenance, copying and reproduction.

## Connect the examples

The [concepts](/concepts/) explain geometry, mode structure, stability, recursion and the conditional effective-interaction question. For a continuous reading path, [start with the idea](/start/).''',kind='example',deps=['DOC-EXAMPLE-'+s for s in ['WATER','STRING','MOLECULE','STAR','LIFE','CELL']],mapping='Editorial index of six separately mapped illustrations; no additional scientific claim.')
examples=[
('water','WATER','Water: follow a pattern','A warm-up about local motion and a collective pattern.', '''## What to notice

A wave crest can travel across water as the water moves locally. Following the crest and following a small region of water give different descriptions. Ordinary waves transfer energy through their medium; [NOAA's wave explanation](/references/#BIB-0060) explains this background physics.

## What this illustrates

The visible pattern belongs to the collective behaviour. This gives us a first way to ask about parts, relationships and activity together, before trying to identify a persistent object.

A passing ripple is a warm-up, not proof that a persistent higher-level unit has formed. The next example, a [string with fixed ends](/examples/string/), makes the role of constraints clearer.

## Ask the next question

Which physical conditions support the pattern? How long does it last? Those questions matter when we move from noticing a collective pattern to investigating the source's [meaning of stability](/concepts/stability/).

[All examples](/examples/) · [Start with the idea](/start/)''',['UT-D01','UT-D02','UT-D04'],['BIB-0060'],'Supplementary NOAA surface-wave explanation. RRG core §§1–4 supplies the questions, not a claim that every wave is a stable new unit.'),
('string','STRING','String: boundaries shape motion','An illustration of constrained motion, with material properties kept in view.', '''## What to notice

A stretched string fixed at both ends can support particular standing-wave patterns. In the ideal model, the ends stay at rest while other regions move. The simplest pattern has one arch; another has two arches and a stationary point between them. The diagram shows possible shapes at one instant, not a measured amplitude.

Length and end conditions constrain the patterns. Tension and mass per unit length set the wave speed. Geometry alone does not fix those material and force conditions. The elementary standing-wave model is described by [the OpenStax string model](/references/#BIB-0061).

## What this illustrates

The original world explanation uses the guitar string to introduce how organization constrains modes, and how a mode has a spatial expression. It then asks whether persistent physical structures can be understood through a geometry–mode loop.

The string illustration does not itself demonstrate that motion maintains its fixed supports or a self-maintaining boundary. That stronger question requires a system and model in which the feedback is actually specified.

## Connect to the definition

In the [geometry and modes concept](/concepts/geometry-and-modes/), the physical constraints are described before the formal RRG definitions. A [molecule](/examples/molecule/) illustrates how a collective organization can add restrictions while lower-level structure remains.

[All examples](/examples/) · [Start with the idea](/start/)''',['UT-D01','UT-D02','UT-D03'],['BIB-0061'],'World explanation §2; core §§1–3. OpenStax supplements the ideal fixed-end string model and its physical parameters.'),
('molecule','MOLECULE','Molecule: the whole constrains its parts','Connections and collective behaviour, beyond an inventory of atoms.', '''## What to notice

Knowing which atoms are present does not tell us everything about a molecule. Connections and spatial arrangement matter. Bond distances and angles are constrained; the whole has collective motions. The supplied world explanation describes electron-state reorganization, vibrations and rotations in this example. Basic relationships between bonding, arrangement and properties are explained by [OpenStax's molecular-structure explanation](/references/#BIB-0065).

## What this illustrates

The source uses a molecule to explain a two-way relation: parts participate in a whole, while the whole constrains its parts. The atoms retain internal structure. A molecule can then participate in a larger arrangement, so the level of description changes without the lower-level activity disappearing.

This is a quantum chemical system. Atoms are not classical miniature solar systems, and molecular behaviour is not inferred from visible shape alone. Its interactions and physical conditions must be specified.

## From whole to useful unit

The [recursion concept](/concepts/recursion/) explains how RRG treats a persistent collective system as a potential component of further organization. The mechanisms can change between levels; one microscopic equation is not required everywhere.

[All examples](/examples/) · [Start with the idea](/start/)''',['UT-D01','UT-D02','UT-D05','UT-D06','UT-D08'],['BIB-0065'],'World §§5–6; framework §6; core §§5–8. OpenStax supplies supplementary molecular-structure background.'),
('star','STAR','Star: new reaction conditions','Existing organization can open possibilities for later transformations.',f'''## What to notice

The source world explanation follows gas becoming a gravitationally organized star. Its internal temperature and pressure allow nuclear reactions to produce new nuclei. Stellar evolution and the dispersal of many heavier elements expand the material available for later chemistry. NASA's first-star explanation provides supplementary background: :cite[{starref}].

## What this illustrates

The important connection is existing organization → changed conditions → further physical possibilities. The original documents use the star to illustrate their wider question about which structures become accessible in an environment.

A star physically evolves. Treating it as one object in a larger description is a different act: it changes what we track, rather than creating a new star by naming a level. Both ideas matter, and they should not be conflated.

## Where the interpretation stops

This example does not derive gravity from a universal resonance law or make every possible next structure inevitable. The broader [background-selection extension](/claims/UT-C02/) and force-unification question remain open in the original sources.

[Life changing its environment](/examples/life-environment/) explores another way an existing organization changes conditions. [All examples](/examples/)''',['UT-D05','UT-C01','UT-C02'],[starref],'World §7 and cosmic/background addenda; framework §7. NASA is supplementary background, not evidence that RRG derives gravity.'),
('life-environment','LIFE','Life changes its environment','An organization can alter conditions for other organisms and reactions.', '''## What to notice

Oxygen-producing photosynthesis converts light energy into chemical energy and releases oxygen. Plants, algae and cyanobacteria participate in this process; [OpenStax's photosynthesis overview](/references/#BIB-0062) explains the basic biology. Earth's atmosphere has not always had its present oxygen composition. NASA's report on early oxygen evidence is supplementary historical context: [NASA's oxygen-history report](/references/#BIB-0064).

## What this illustrates

Living systems do more than occupy their surroundings. Their activity can change chemical conditions, making some processes more accessible and others less so. Oxygen can support organisms using it in respiration, while changing the conditions faced by organisms adapted to low-oxygen settings.

The original world explanation describes specialized biological environments and a wider landscape of reachable organizations. This page uses photosynthesis as an added beginner illustration of that environmental question; it is not presented as a named example from the locked core.

## Conditions, rather than a guaranteed ladder

Oxygen production does not by itself guarantee atmospheric accumulation or inevitable greater complexity. Chemical consumption, resources, exchanges and history matter. There is no purpose-driven guarantee of a next level, and this page does not infer a single cause for the emergence of complex life.

The broad environmental interpretation is an [open extension](/claims/UT-C02/). A [cell](/examples/cell/) lets us examine maintained organization and exchange at a smaller scale.

[All examples](/examples/) · [Start with the idea](/start/)''',['UT-C02','UT-D01','UT-D02'],['BIB-0062','BIB-0064'],'Added beginner photosynthesis illustration mapped to world §10 and background addendum, framework §§8, 13, 21 and core §11. Factual background is supplementary; oxygenation is not certified as a universal RRG ladder.'),
('cell','CELL','Cell: organization through exchange','Maintaining an organization while its components remain active.', '''## What to notice

A cell exchanges substances with its surroundings. Its membrane regulates passage, while reactions and transport help preserve conditions within it. Some transport follows concentration differences; other transport requires energy. This introductory membrane distinction is explained by [OpenStax's membrane transport explanation](/references/#BIB-0063).

## What this illustrates

The source describes life as maintained organization, rather than a fixed inventory of atoms. Internal processes continue as materials enter, leave and are replaced. RRG treats the organization and coordinated activity as aspects of the same living system.

The source framework explicitly retains energy conservation and thermodynamic constraints. Active maintenance needs resources and energy flow; describing an organization does not supply them.

## Maintenance, copying and reproduction

Keeping one cell organized, templating a molecular structure and reproducing a biological cell are different processes. The core allows replication as a possible mechanism, rather than requiring duplication before every higher-level formation. The [recursion concept](/concepts/recursion/) keeps that distinction visible.

A cell may also participate in a larger organization while its internal activity remains. This illustrates the whole-as-part question; the historical route from prebiotic chemistry to the first life remains unresolved in the supplied framework.

[All examples](/examples/) · [Start with the idea](/start/)''',['UT-D04','UT-D05','UT-D06','UT-D08','UT-D09'],['BIB-0063'],'World §§8–10; framework §8 and §13; core §§4–9. OpenStax supplements membrane transport; no origin-of-life or complete artificial-cell claim.')]
for slug,key,title,description,body,deps,bibs,mapping in examples:
 write('example-'+slug,'DOC-EXAMPLE-'+key,'/examples/'+slug+'/',title,description,body,deps=deps,bibs=bibs,mapping=mapping,sources=['R-CURRENT-CORE','R-CURRENT-WORLD','R-CURRENT-SCIENCE'])
write('concepts','DOC-CONCEPTS','/concepts/','The concepts, in ordinary words','From organization and activity to the source definitions.', '''## Begin with arrangement and activity

[Geometry and modes](/concepts/geometry-and-modes/) explains relationships, constraints and organized change before introducing the symbols.

## Ask what it means to persist

[Stability](/concepts/stability/) separates the RRG closure definition from lifetime, recovery and attraction measurements.

## Follow a whole into further organization

[Recursion and scale](/concepts/recursion/) explains internally active parts, different roles and why replication is optional.

## Connect organization to interactions

[Effective interactions](/concepts/effective-interactions/) follows the supplied evidence cases and the stronger open research question.

The original [core definition records](/claims/UT-D01/) remain the authority for meanings. For a continuous reading path, [start with the idea](/start/) or [choose an example](/examples/).''',kind='concept',deps=['DOC-CONCEPT-GEOMETRY','DOC-CONCEPT-STABILITY','DOC-CONCEPT-RECURSION','DOC-CONCEPT-INTERACTIONS'],mapping='Editorial index of the four mapped concept explanations.')
write('concept-stability','DOC-CONCEPT-STABILITY','/concepts/stability/','Stability: what persists?','The RRG definition and the measurements used to test particular systems.', '''## In ordinary words

An organization can persist while activity continues inside it. In the supplied core, stability means that geometry and mode structure form a self-consistent closed organization during the interval in question. Persistence may be short or long.

## Compare the questions

A molecule can be considered over a particular lifetime; a living cell needs ongoing exchanges. To test a specified model, we may measure how long a state lasts, how it responds to a perturbation or whether nearby states approach it.

**Bounded persistence** asks whether the chosen organization remains within stated limits over an interval. **Recovery** asks whether it returns after a disturbance. **Attraction** asks whether nearby states tend toward it. These describe different tests; observing one is not automatically a result about the others.

The framework allows different mathematical tests for different systems. They do not replace its locked meaning. A self-consistency definition is not an independently established universal stability theorem.

## The source definition

::claim{id="UT-D04" view="statement"}

Here $G$ denotes organization and $M$ the full temporal mode structure. Their reciprocal relation is the RRG definition being used. A particular application still needs its conditions, equations and evidence; the definition alone does not give a numerical threshold.

## Continue the question

Compare the [cell example](/examples/cell/) with [recursion and scale](/concepts/recursion/). Return to [all concepts](/concepts/).''',kind='concept',deps=['UT-D04','UT-D03'],sources=['R-CURRENT-CORE','R-CURRENT-SCIENCE'],mapping='Core §4 and framework §§2.4, 3 proposition 2, 13. The persistence/recovery/attraction comparison explains distinct measurements without redefining source stability.')
write('concept-recursion','DOC-CONCEPT-RECURSION','/concepts/recursion/','Recursion and scale','A whole can become a useful part while its components stay active.', '''## In ordinary words

An organized whole can participate in another organization. Its internal activity continues even when the next description treats it as one useful unit. RRG calls this structural recursion.

## A concrete example

The [molecule example](/examples/molecule/) begins with atoms and their connections. A molecule can enter a larger chemical arrangement. A [cell](/examples/cell/) can participate in a tissue while exchanges and reactions continue inside it. These systems have different mechanisms; the shared description does not require identical equations at every scale.

**Scale** means a level at which a collective organization can function as an effective unit in further interactions. It involves characteristic times, dominant interactions and useful descriptions, as well as size. It is not a claim that all levels are equally spaced or every larger process is slower.

## The source definitions

::claim{id="UT-D05" view="plainLanguage"}

::claim{id="UT-D06" view="plainLanguage"}

::claim{id="UT-D08" view="plainLanguage"}

The proposed cycle is compatible parts → collective organization → a useful unit → further combinations. Its environment can also change which combinations are accessible. The cycle illustration represents a research proposal, not a measurement or guaranteed history.

## Copying is one possible mechanism

::claim{id="UT-D09" view="plainLanguage"}

Replication, aggregation and self-assembly can participate in formation or propagation. Duplication is optional in the locked core. The stronger questions of a predictive cross-domain criterion and spontaneous promotion remain open.

[Explore effective interactions](/concepts/effective-interactions/) · [All concepts](/concepts/)''',kind='concept',deps=['UT-D05','UT-D06','UT-D08','UT-D09','UT-C02','UT-O04'],sources=['R-CURRENT-CORE','R-CURRENT-WORLD','R-CURRENT-SCIENCE'],mapping='Core §§5–9, 11; world §§4, 8–9, 14 and background addendum; framework §§3, 15–16, 22–23.')
write('concept-interactions','DOC-CONCEPT-INTERACTIONS','/concepts/effective-interactions/','When organization changes interactions','The source-reported cases and the conditional question about further organization.', '''## In ordinary words

An effective interaction is part of a description of a collective system. Existing organization can make a coupling channel useful, accessible or important. RRG asks when such a channel could help another organization persist.

## Three distinct source-reported cases

The supplied interaction addendum describes these cases:

- **Crystal vibrations:** in the stated conventional-superconductivity regime, collective lattice vibrations can mediate effective electron attraction, allowing pairing and superconducting order. See :claim[UT-E10].
- **Spin ice:** collective magnetic constraints support particle-like excitations and Coulomb-like effective interactions. See :claim[UT-E11].
- **A changed background:** the Higgs-field state changes the particle spectrum and the low-energy electroweak interaction regime. See :claim[UT-E12].

These are the source's evidence descriptions. They concern different systems and conditions, rather than three instances already proving an identical universal mechanism. The additional-evidence register likewise describes domain-specific realizations, with each paper's access and scope limits retained.

## The proposed relation

The source's stronger extension is:

$$R_n=(G_n,M_n)\;\\rightarrow\;\mathcal I^{\\rm eff}_{n+1}\;\\rightarrow\;R_{n+1}.$$

Here $n$ labels a descriptive level; $R_n$ is its organized system, $G_n$ its geometry and $M_n$ its full temporal mode structure. $\\mathcal I^{\\rm eff}_{n+1}$ denotes an effective interaction channel generated, activated or made dominant through that organization. $R_{n+1}$ is a candidate further organized system. The arrows express the proposed relationship, not a derived quantitative law.

The crystal example motivates the link to another organized state. The changed-background example illustrates a different link: a background altering an interaction regime. The broader question is under which conditions a channel actually enables or stabilizes a higher organization.

## What remains open

The sources do not derive gravity or identify the four fundamental interactions with four successive RRG levels. Universal derivation, useful cross-domain criteria and novel predictions remain open. The original [research status](/research-status/) and [proof matrix](/research-status/proof-matrix/) retain those distinctions.

[Return to the introduction](/start/) · [All concepts](/concepts/)''',kind='concept',deps=['UT-D01','UT-D02','UT-D03','UT-D05','UT-C01','UT-C02','UT-E10','UT-E11','UT-E12','DOC-STATUS','DOC-PROOF'],sources=['R-CURRENT-CORE','R-CURRENT-SCIENCE','R-CURRENT-INTERACTIONS','R-CURRENT-ADDITIONAL'],mapping='Core §§10–11; interaction addendum §§1–5; framework §§19–24 and escaped emergent-interaction addendum; proof matrix and additional register conventions.',scope='Deeper explanation of source-reported interaction evidence and the conditional higher-organization extension.')
canonical=json.loads((folder/'canonical-documents.yaml').read_text());geometry=next(e for e in canonical if e['id']=='DOC-CONCEPT-GEOMETRY')
geometry.update(revision=geometry['revision']+1,updatedAt=date,description='Relationships, constraints and organized activity, before the formal RRG meanings.',scope='Beginner concept explanation mapped to original core §§1–3 and world §§1–2.',sourceMapping='Core §§1–3; world §§1–2. Material and force conditions remain necessary for the string illustration.',body='''## In ordinary words

Geometry describes how parts are arranged and related. Mode structure describes how they change and respond together. In RRG, both belong to the description of one organized system.

## Try the string example

A string's length and fixed ends constrain possible motion. Its tension and mass per unit length also matter. Arrangement and constraints do not magically provide the physical law. Read the [string illustration](/examples/string/).

Mode structure includes patterns, relative timing, responses and characteristic times. It is wider than a periodic vibration or one number in hertz. Activity can maintain an arrangement, transform it or destroy it.

## The source meanings

::claim{id="UT-D01" view="plainLanguage"}

::claim{id="UT-D02" view="plainLanguage"}

::claim{id="UT-D03" view="plainLanguage"}

The basic source object is $R=(G,M)$: $G$ denotes organization and $M$ its temporal mode structure. This is the framework's definition, not an extra independently established physical law.

Continue with [stability](/concepts/stability/) or [all concepts](/concepts/).
''')
(folder/'canonical-documents.yaml').write_text(json.dumps(canonical,indent=2)+'\n')
