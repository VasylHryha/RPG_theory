import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadCanonicalCorpus, validateCorpus, dependencyClosure, reviewFingerprint, reviewState, affectedEntries, semanticDigest, renderEntrySync, validDate } from '../../src/lib/content.js';
import { selectPublication, activePublication } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { sha256 } from '../../src/lib/identity.js';
import { readAdmission } from '../../src/lib/source-admission.js';
import { validateSourceRevision } from '../../src/lib/source-revision.js';
import { renderMarkdown } from '../../src/lib/markdown.js';
const corpus=loadCanonicalCorpus();
function input() { return { entries:[...corpus.entries.values()].map(e=>({...structuredClone(e),statement:e.contentOrigin==='source-bound'?null:e.statement})), sources:structuredClone([...corpus.sources.values()]), references:structuredClone([...corpus.references.values()]), aliases:JSON.parse(readFileSync('research/publication/citation-aliases.yaml','utf8')), reviews:[], record:readAdmission()! }; }
function clone() { return validateCorpus(input()); }
function syntheticAcceptedFixture() {
  const c=clone(); c.entries=new Map([['UT-D01',c.entries.get('UT-D01')!]]);
  const e=c.entries.get('UT-D01')!; e.publicationState='published';e.publishedAt='2026-10-01';e.updatedAt='2026-10-01';e.rightsRef='TEST-RIGHTS';
  // Only an isolated test object simulates qualification, never a file/receipt or a production artifact.
  c.admission.currentSourceQualified=true;
  c.reviews=[{entryId:e.id,fingerprint:reviewFingerprint(c,e.id),reviewerKind:'agent',reviewedAt:'2026-10-01',outcome:'accepted',evidenceRef:'isolated synthetic test receipt, not scientific evidence'}];
  return c;
}
const release={releaseId:'synthetic-test-only',releaseAt:'2026-10-01T12:00:00.000Z',historicalIds:[],rights:[{id:'TEST-RIGHTS',outcome:'approved' as const,entryIds:['UT-D01'],evidenceRef:'synthetic scoped rights control'}]};
const config={...loadSiteConfig(),origin:'https://example.org',repository:{owner:'synthetic',name:'test'},publicAuthorization:true};
test('actual corpus extracts source bytes, preserves existing E mappings, and has zero accepted reviews',()=>{
 assert.equal(corpus.entries.size,34);assert.equal(corpus.admission.currentSourceQualified,false);assert.equal(corpus.reviews.length,0);
 assert.match(corpus.entries.get('UT-D01')!.statement!,/Geometry is not limited to visible Euclidean shape/);
 assert.match(corpus.entries.get('UT-E01')!.sourceMapping,/E01 → UT-E01/);
 assert.equal(corpus.sources.get('P-CURRENT-NOTE')!.authorityNoticeOnly,true);
 assert.equal(dependencyClosure(corpus,'DOC-START').includes('UT-C01'),true);
});
test('independent statement, bad binding range/hash, wrong record kind, duplicates and unknown sources fail',()=>{
 for(const mutation of [(i:ReturnType<typeof input>)=>i.entries[0].statement='independently changed science',(i:ReturnType<typeof input>)=>i.entries[0].sourceBinding!.startLine=99999,(i:ReturnType<typeof input>)=>i.entries[0].sourceBinding!.excerptSha256='0'.repeat(64)]) { const i=input();mutation(i);assert.throws(()=>validateCorpus(i),/SOURCE_BINDING_FAILURE/); }
 let i=input();i.entries.find(e=>e.id==='UT-D01')!.kind='conjecture';assert.throws(()=>validateCorpus(i),/INVALID_RECORD_ID/);
 i=input();i.entries.push(i.entries[0]);assert.throws(()=>validateCorpus(i),/DUPLICATE_ID/);
 i=input();i.entries[0].sourceRefs.push('R-UNKNOWN');assert.throws(()=>validateCorpus(i),/UNKNOWN_SOURCE/);
});
test('source-scoped aliases keep historical S01 local; duplicates and unresolved aliases fail',()=>{
 assert.equal(corpus.aliases.has('R-AUDIT-SOURCES:S01'),true);assert.equal(corpus.aliases.has('R-CURRENT-ADDITIONAL:S01'),false);
 const i=input();i.aliases.push({...i.aliases[0],bibliographyId:'BIB-9999'});assert.throws(()=>validateCorpus(i),/CITATION_ALIAS_COLLISION/);
 const j=input();j.aliases[0].bibliographyId='BIB-9999';assert.throws(()=>validateCorpus(j),/UNKNOWN_REFERENCE/);
});
test('missing or cyclic semantic dependency fails; related feedback does not create proof cycles',()=>{
 const i=input();i.entries[0].dependsOn=['UT-D9999'];assert.throws(()=>validateCorpus(i),/UNKNOWN_DEPENDENCY/);
 const j=input();j.entries.find(e=>e.id==='UT-D01')!.dependsOn=['UT-D02'];j.entries.find(e=>e.id==='UT-D02')!.dependsOn=['UT-D01'];assert.throws(()=>validateCorpus(j),/DEPENDENCY_CYCLE/);
 const k=input();k.entries.find(e=>e.id==='UT-D01')!.related=['UT-D02'];k.entries.find(e=>e.id==='UT-D02')!.related=['UT-D01'];assert.doesNotThrow(()=>validateCorpus(k));
});
test('authority notes cannot supply scientific excerpts; invalid states and real dates fail',()=>{
 const i=input();i.entries[0].sourceBinding!.sourceKey='P-CURRENT-NOTE';i.entries[0].sourceRefs=['P-CURRENT-NOTE'];assert.throws(()=>validateCorpus(i),/SOURCE_NOTE_ONLY_MISUSE/);
 assert.throws(()=>validDate('2026-02-30'),/INVALID_DATE/);
 const j=input();j.entries[0].publicationState='published';assert.throws(()=>validateCorpus(j),/INVALID_PUBLICATION_STATE/);
 const k=input();k.entries[0].publicationState='withdrawn';k.entries[0].publishedAt='2026-10-01';assert.throws(()=>validateCorpus(k),/CORRECTION_REQUIRED/);
});
test('safe directives render actual canonical explanations, extract dependencies and reject executable/unknown syntax',async()=>{
 const html=await renderMarkdown('::claim{id="UT-D01" view="plainLanguage"}\n\n:claim[UT-D02]\n\n:cite[BIB-0001]','/unity-theory/',corpus);
 assert.match(html,/Organization at a chosen scale/);assert.match(html,/href="\/unity-theory\/claims\/UT-D01\/"/);assert.match(html,/references\/#BIB-0001/);
 for(const text of [':claim[UT-D9999]',':cite[BIB-9999]','::claim{id="UT-D01" view="evil"}',':import[x]',':claim[UT-D01]{onclick="evil"}']) await assert.rejects(renderMarkdown(text,'/',corpus),/UNKNOWN_DEPENDENCY|UNKNOWN_REFERENCE|INVALID_DIRECTIVE/);
 await assert.rejects(renderMarkdown('<script>evil()</script>','/',corpus),/UNSAFE_MARKDOWN/);
});
test('dependency changes stale exact reviews and report reverse dependants; unrelated bibliography is local',()=>{
 const c=clone();const id='DOC-START';const old=reviewFingerprint(c,id);
 c.reviews=[{entryId:id,fingerprint:old,reviewerKind:'agent',reviewedAt:'2026-10-01',outcome:'accepted',evidenceRef:'synthetic lifecycle test only'}];assert.equal(reviewState(c,id),'accepted');
 c.references.set('BIB-9999',{...c.references.get('BIB-0001')!,id:'BIB-9999',identity:'synthetic unrelated identity'});assert.equal(reviewState(c,id),'accepted');
 c.entries.get('UT-D01')!.plainLanguage+=' Synthetic changed explanation.';assert.equal(reviewState(c,id),'stale');assert.ok(affectedEntries(c,'UT-D01').includes(id));
 const e=c.entries.get('UT-D01')!;assert.equal(semanticDigest({...e,body:'line\r\nline'}),semanticDigest({...e,body:'line\nline'}));
});
test('changing a relevant source verification scope or relevant citation stales its review',()=>{
 const c=clone();const old=reviewFingerprint(c,'UT-E01');c.sources.get('R-CURRENT-ADDITIONAL')!.inspectionScope+=' Changed';assert.notEqual(reviewFingerprint(c,'UT-E01'),old);
 const d=clone();const before=reviewFingerprint(d,'UT-E01');const bib=d.entries.get('UT-E01')!.bibRefs[0];d.references.get(bib)!.supportScope+=' Changed';assert.notEqual(reviewFingerprint(d,'UT-E01'),before);
});
test('shared release selector refuses actual pending corpus, missing/stale reviews, future publication and rights',()=>{
 assert.throws(()=>selectPublication(corpus,config,release),/CURRENT_SOURCE_NOT_QUALIFIED/);
 const c=syntheticAcceptedFixture();assert.deepEqual(selectPublication(c,config,release).manifest.navigationIds,['UT-D01']);assert.equal(selectPublication(c,config,release).manifest.deployEligible,false);
 c.reviews=[];assert.throws(()=>selectPublication(c,config,release),/REVIEW_REQUIRED/);
 const stale=syntheticAcceptedFixture();stale.entries.get('UT-D01')!.scope+=' Changed';assert.throws(()=>selectPublication(stale,config,release),/REVIEW_REQUIRED/);
 const future=syntheticAcceptedFixture();future.entries.get('UT-D01')!.publishedAt='2026-10-02';assert.throws(()=>selectPublication(future,config,release),/FUTURE_PUBLICATION/);
 assert.throws(()=>selectPublication(syntheticAcceptedFixture(),config,{...release,rights:[]}),/RIGHTS_PROVENANCE_REQUIRED/);
 const fake=syntheticAcceptedFixture();fake.admission.corpusScope='synthetic';assert.throws(()=>selectPublication(fake,config,release),/CURRENT_SOURCE_NOT_QUALIFIED/);
});
test('one manifest excludes drafts from every production surface and rejects published draft dependencies',()=>{
 const c=syntheticAcceptedFixture();const draft=structuredClone(c.entries.get('UT-D01')!);draft.id='UT-D99';draft.route='/claims/UT-D99/';draft.publicationState='draft';draft.body='DRAFT_SENTINEL_NOT_FOR_OUTPUT';c.entries.set(draft.id,draft);
 const selected=selectPublication(c,config,release);assert.equal(selected.manifest.routes.includes(draft.route),false);for(const ids of [selected.manifest.navigationIds,selected.manifest.searchIds,selected.manifest.sitemapIds,selected.manifest.exportIds]) assert.equal(ids.includes(draft.id),false);
 c.entries.get('UT-D01')!.dependsOn=['UT-D99'];c.reviews[0].fingerprint=reviewFingerprint(c,'UT-D01');assert.throws(()=>selectPublication(c,config,release),/UNPUBLISHABLE_DEPENDENCY/);
});
test('withdrawn history is explicitly selected as a tombstone; former body is removed',()=>{
 const c=syntheticAcceptedFixture();const e=c.entries.get('UT-D01')!;e.publicationState='withdrawn';e.correctionRef='synthetic correction';e.withdrawalReason='Synthetic withdrawn reason';e.statement='OLD_BODY_SENTINEL';c.reviews[0].fingerprint=reviewFingerprint(c,e.id);
 const result=selectPublication(c,config,{...release,historicalIds:[e.id]});assert.equal(result.entries[0].statement,null);assert.deepEqual(result.manifest.navigationIds,[]);assert.doesNotMatch(renderEntrySync(c,result.entries[0]),/OLD_BODY_SENTINEL/);
});
test('source display adapters preserve raw bindings while rendering status/math/table consumers',()=>{
 const selected=activePublication();assert.match(renderEntrySync(corpus,corpus.entries.get('DOC-STATUS')!),/Evidence update: emergent interaction channels/);assert.match(renderEntrySync(corpus,corpus.entries.get('DOC-STATUS')!),/<math/);assert.match(renderEntrySync(corpus,corpus.entries.get('DOC-PROOF')!),/<table/);assert.equal(selected.manifest.entries.length,34);
});
test('source revision transaction refuses missing prior-byte preservation and incomplete core proof gate',()=>{
 const prior=clone(),next=clone();next.admission.inventorySeal='1'.repeat(64);next.admission.edition='synthetic changed edition';next.sources.get('R-CURRENT-CORE')!.sha256='2'.repeat(64);
 const change={changeId:'synthetic-change',category:'definition-core',predecessorEdition:prior.admission.edition,predecessorSeal:prior.admission.inventorySeal,resultEdition:next.admission.edition,resultSeal:next.admission.inventorySeal,sourceChangeRef:'synthetic source change record',affectedFiles:['research/RRG_CURRENT/00_LOCKED_CORE.md'],affectedClaimIds:['UT-D01'],problem:'synthetic control',before:'old synthetic meaning',after:'new synthetic meaning',rationale:'isolated test',permissionBasis:'test-only transaction',priorSnapshot:[]};
 assert.throws(()=>validateSourceRevision(change,prior,next),/SOURCE_REVISION_FAILURE/);
 change.priorSnapshot=[{path:'research/RRG_CURRENT/00_LOCKED_CORE.md',raw:readFileSync('research/RRG_CURRENT/00_LOCKED_CORE.md'),sha256:prior.sources.get('R-CURRENT-CORE')!.sha256}] as never[];
 assert.throws(()=>validateSourceRevision(change,prior,next),/CORE_PROOF_GATE_REQUIRED/);
 for(const entry of next.entries.values()) if(entry.sourceRefs.includes('R-CURRENT-CORE')) entry.revision+=1;
 assert.throws(()=>validateSourceRevision({...change,category:'wording'},prior,next),/CORE_PROOF_GATE_REQUIRED/);
 const proofGate={lockedStatement:'Geometry is not limited to visible Euclidean shape.',counterexample:'synthetic',evidence:'synthetic',extensionInsufficient:'synthetic',minimalWording:'synthetic',impactAnalysis:'synthetic',versionDecision:'synthetic version proposal'};
 assert.throws(()=>validateSourceRevision({...change,proofGate:{...proofGate,lockedStatement:'A fabricated statement absent from the preserved core.'}},prior,next),/CORE_PROOF_GATE_REQUIRED/);
 const result=validateSourceRevision({...change,proofGate},prior,next);assert.equal(result.reviewOutcome,'pending');assert.ok(result.affected.some(e=>e.entryId==='DOC-START'));
 const resultCoreRaw=Buffer.from(readFileSync('research/RRG_CURRENT/00_LOCKED_CORE.md','utf8').replace(/\n/g,'\r\n'));
 next.sources.get('R-CURRENT-CORE')!.sha256=sha256(resultCoreRaw);next.admission.coreSha256=sha256(resultCoreRaw);
 assert.equal(validateSourceRevision({...change,category:'format',resultCoreRaw},prior,next).reviewOutcome,'pending');
 assert.throws(()=>validateSourceRevision({...change,category:'format',resultCoreRaw:Buffer.from('A changed scientific definition')},prior,next),/CORE_PROOF_GATE_REQUIRED/);
});

test('actual supplied 07 and 08 cannot disappear behind a matching core',()=>{
 const directory=mkdtempSync(join(tmpdir(),'unity-m1-current-'));
 try { cpSync('research/RRG_CURRENT',directory,{recursive:true});
   for(const member of ['07_EMERGENT_INTERACTION_EVIDENCE.md','08_ADDITIONAL_PRIMARY_EVIDENCE.md']) {
     const record=readAdmission()!;record.directory=directory;
     const path=join(directory,member),raw=readFileSync(path);rmSync(path);
     assert.throws(()=>qualifyCurrentSource(record),/CURRENT_MANIFEST_INCOMPLETE/);writeFileSync(path,raw);
   }
 } finally {rmSync(directory,{recursive:true,force:true});}
});
import { mkdtempSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { qualifyCurrentSource } from '../../src/lib/source-admission.js';

test('a missing or mismatched actual local citation alias fails the source adapter',()=>{
 const i=input();const target=i.aliases.findIndex((a:{sourceKey:string;localCitationKey:string})=>a.sourceKey==='R-CURRENT-ADDITIONAL' && a.localCitationKey==='https://doi.org/10.1038/s41467-019-13746-6');i.aliases.splice(target,1);assert.throws(()=>validateCorpus(i),/UNRESOLVED_CITATION_ALIAS/);
 const j=input();j.aliases[target].bibliographyId='BIB-0001';assert.throws(()=>validateCorpus(j),/CITATION_ALIAS_IDENTITY_MISMATCH/);
});
test('project reproduction cannot be asserted with an invented execution receipt',()=>{
 const i=input();const e=i.entries.find(e=>e.id==='UT-E01')!;e.evidenceState='project-reproduced';e.evidenceRefs=['EXEC-INVENTED'];assert.throws(()=>validateCorpus(i),/EXECUTION_RECEIPT_REQUIRED/);
});
test('Markdown directive export uses ordinary links and leaves code examples untouched',()=>{
 const output=exportDirectiveMarkdown('::claim{id="UT-D01" view="statement"}\n\n:cite[BIB-0001]\n\n`:claim[UT-D02]`',corpus);
 assert.match(output,/Geometry is not limited/);assert.match(output,/\[UT-D01\]\(\/claims\/UT-D01\/\)/);assert.match(output,/\[BIB-0001\]\(\/references\/#BIB-0001\)/);assert.match(output,/`:claim\[UT-D02\]`/);
 assert.throws(()=>exportDirectiveMarkdown(':cite[BIB-9999]',corpus),/UNKNOWN_REFERENCE/);
});
import { exportDirectiveMarkdown } from '../../src/lib/directives.js';

test('statement directives are order-independent; nested references and cycles reach the shared graph',()=>{
 const i=input();i.entries.find(e=>e.id==='DOC-CONCEPT-GEOMETRY')!.body='::claim{id="UT-D01" view="statement"}';
 const c=validateCorpus(i);assert.match(renderEntrySync(c,c.entries.get('DOC-CONCEPT-GEOMETRY')!),/Geometry is not limited/);
 const j=input();j.entries.find(e=>e.id==='UT-D01')!.plainLanguage='Organization :claim[UT-D02] and :cite[BIB-0001].';
 const nested=validateCorpus(j);assert.ok(dependencyClosure(nested,'DOC-CONCEPT-GEOMETRY').includes('UT-D02'));assert.ok(nested.entries.get('DOC-CONCEPT-GEOMETRY')!.bibRefs.includes('BIB-0001'));
 const k=input();k.entries.find(e=>e.id==='UT-D01')!.plainLanguage='::claim{id="UT-D02" view="plainLanguage"}';k.entries.find(e=>e.id==='UT-D02')!.plainLanguage='::claim{id="UT-D01" view="plainLanguage"}';
 assert.throws(()=>validateCorpus(k),/DEPENDENCY_CYCLE/);
});

test('scientific identities cannot bypass proposal provenance or masquerade as documents',()=>{
 const i=input();const e=i.entries.find(e=>e.id==='UT-D01')!;e.contentOrigin='authored';e.sourceBinding=null;e.statement='invented definition';assert.throws(()=>validateCorpus(i),/PROPOSAL_PROVENANCE_REQUIRED/);
 const j=input();j.entries.find(e=>e.id==='UT-D01')!.id='DOC-FAKE-DEFINITION';assert.throws(()=>validateCorpus(j),/INVALID_RECORD_ID/);
 const k=input();k.sources.find(s=>s.key==='R-CURRENT-INTERACTIONS')!.declaredCurrent=false;assert.throws(()=>validateCorpus(k),/SOURCE_REGISTRY_FAILURE/);
});

test('retained historical excerpts remain historical; supersession is reciprocal and draft history stays out of discovery',()=>{
 const i=input();const old={...structuredClone(i.entries.find(e=>e.id==='UT-D01')!),id:'UT-D99',route:'/claims/UT-D99/',publicationState:'superseded' as const,publishedAt:'2026-10-01',correctionRef:'isolated synthetic correction',supersededBy:'UT-D01'};
 const source=i.sources.find(s=>s.key==='R-HISTORY-01')!;old.researchEdition=source.edition;old.sourceRefs=[source.key];old.sourceBinding={sourceKey:source.key,sourceSha256:source.sha256,startLine:5,endLine:5,excerptSha256:sha256('We normally imagine a thing as a **shape that exists**, and then something happens to it.\n')};old.sourceMapping='Historical excerpt used only in an isolated engineering fixture.';
 i.entries.find(e=>e.id==='UT-D01')!.supersedes=old.id;i.entries.push(old);
 const c=validateCorpus(i);assert.match(c.entries.get(old.id)!.statement!,/We normally imagine a thing/);
 const selected=selectPublication(c,loadSiteConfig(),release,'preview');assert.ok(selected.manifest.routes.includes(old.route));assert.equal(selected.manifest.navigationIds.includes(old.id),false);
 const j=input();j.entries.find(e=>e.id==='UT-D01')!.supersedes='UT-D02';assert.throws(()=>validateCorpus(j),/CORRECTION_REQUIRED/);
});

test('review rejection is distinct from pending; alternate citation review binds its primary metadata',()=>{
 const c=clone(),e=c.entries.get('UT-D01')!;
 c.reviews=[{entryId:e.id,fingerprint:reviewFingerprint(c,e.id),reviewerKind:'agent',reviewedAt:'2026-10-01',outcome:'rejected',evidenceRef:'isolated synthetic rejection'}];assert.equal(reviewState(c,e.id),'rejected');assert.match(renderStatus(c,e),/Rejected/);
 e.bibRefs=['BIB-0023'];const prior=reviewFingerprint(c,e.id);c.references.get('BIB-0022')!.supportScope+=' Synthetic changed scope';assert.notEqual(reviewFingerprint(c,e.id),prior);
});

test('source, bibliography, execution and renderer identity changes report or stale their actual dependants',()=>{
 assert.ok(affectedEntries(corpus,'R-CURRENT-CORE').includes('DOC-START'));
 assert.ok(affectedEntries(corpus,'BIB-0022').includes('UT-E01'));
 const c=clone(),before=reviewFingerprint(c,'UT-D01');c.rendererSha256='0'.repeat(64);assert.notEqual(reviewFingerprint(c,'UT-D01'),before);
 const e=c.entries.get('UT-D01')!;e.testRefs=['EXEC-SYNTHETIC'];
 c.evidence.set('EXEC-SYNTHETIC',{id:'EXEC-SYNTHETIC',path:'docs/evidence/synthetic-test-only',sha256:'1'.repeat(64),supportScope:'isolated test object',limitations:'not scientific evidence'});
 const fingerprint=reviewFingerprint(c,e.id);c.evidence.get('EXEC-SYNTHETIC')!.sha256='2'.repeat(64);assert.notEqual(reviewFingerprint(c,e.id),fingerprint);assert.ok(affectedEntries(c,'EXEC-SYNTHETIC').includes('DOC-START'));
});

test('actual status, proof and home summaries depend on their core definitions and emergent evidence',()=>{
 for(const id of ['DOC-STATUS','DOC-PROOF','DOC-HOME']) {
  assert.ok(dependencyClosure(corpus,id).includes('UT-D01'),id);
  assert.ok(dependencyClosure(corpus,id).includes('UT-E10'),id);
  assert.ok(affectedEntries(corpus,'R-CURRENT-INTERACTIONS').includes(id),id);
  const c=clone(),before=reviewFingerprint(c,id);c.entries.get('UT-E10')!.limits+=' Isolated changed support scope.';assert.notEqual(reviewFingerprint(c,id),before);
 }
});

test('withdrawal removes old title, scope, source mapping, evidence and bibliography from all rendered regions',()=>{
 const c=syntheticAcceptedFixture(),e=c.entries.get('UT-D01')!;
 for(const key of ['title','description','scope','limits','plainLanguage','sourceMapping','body','statement'] as const) e[key]='OLD_METADATA_SENTINEL';
 e.publicationState='withdrawn';e.withdrawalReason='Synthetic reason';e.correctionRef='Synthetic correction';c.reviews[0].fingerprint=reviewFingerprint(c,e.id);
 const selected=selectPublication(c,config,{...release,historicalIds:[e.id]});const tombstone=selected.entries[0];
 assert.doesNotMatch(JSON.stringify(tombstone)+renderEntrySync(c,tombstone)+renderRecordDetails(c,tombstone),/OLD_METADATA_SENTINEL/);assert.deepEqual(selected.manifest.referenceIds,[]);
 assert.throws(()=>exportDirectiveMarkdown('::claim{id="UT-D01" view="statement"}',c),/WITHDRAWN_EXCERPT/);
});

test('bibliographic verification cannot retain a checked label after metadata substitution',()=>{
 for(const key of ['title','publication','authors','year','url'] as const) {
  const i=input(),r=i.references.find(r=>r.id==='BIB-0022')!;Object.assign(r,{[key]:key==='authors'?['Invented author']:key==='year'?1900:key==='url'?'https://example.org/wrong-paper':'Invented metadata'});
  assert.throws(()=>validateCorpus(i),/REFERENCE_METADATA_FAILURE|BIBLIOGRAPHIC_IDENTITY_COLLISION/);
 }
});

test('release rejects future updates and reviews independently of the publication date',()=>{
 const c=syntheticAcceptedFixture();c.entries.get('UT-D01')!.updatedAt='2026-10-02';assert.throws(()=>selectPublication(c,config,release),/FUTURE_PUBLICATION/);
 const d=syntheticAcceptedFixture();d.reviews[0].reviewedAt='2026-10-02';assert.throws(()=>selectPublication(d,config,release),/FUTURE_REVIEW/);
});

test('qualification uses reviewed production selection; a preview cannot be relabelled qualification',()=>{
 assert.equal(selectPublication(corpus,loadSiteConfig(),release,'preview').entries.length,34);
 assert.throws(()=>selectPublication(corpus,loadSiteConfig(),release,'qualification'),/CURRENT_SOURCE_NOT_QUALIFIED/);
 const c=syntheticAcceptedFixture();assert.deepEqual(selectPublication(c,loadSiteConfig(),release,'qualification').manifest.navigationIds,['UT-D01']);
 c.reviews=[];assert.throws(()=>selectPublication(c,loadSiteConfig(),release,'qualification'),/REVIEW_REQUIRED/);
});

test('Markdown export validates safety, expands nested references and leaves math samples intact',()=>{
 const c=clone();c.entries.get('UT-D01')!.plainLanguage='See :claim[UT-D02] and :cite[BIB-0001].';
 const output=exportDirectiveMarkdown('::claim{id="UT-D01" view="plainLanguage"}\n\n$:claim[UT-D03]$',c);
 assert.match(output,/\[UT-D02\]\(\/claims\/UT-D02\/\)/);assert.match(output,/\$:claim\[UT-D03\]\$/);
 for(const text of ['<script>evil()</script>','[bad](javascript:alert(1))']) assert.throws(()=>exportDirectiveMarkdown(text,c),/UNSAFE_MARKDOWN/);
});
import { renderStatus, renderRecordDetails } from '../../src/lib/presentation.js';

test('directives cannot create nested anchors in link labels or Markdown exports',async()=>{
 for(const text of ['[:claim[UT-D01]](https://example.org)','[**:cite[BIB-0001]**](https://example.org)']) {
  await assert.rejects(renderMarkdown(text,'/',corpus),/INVALID_DIRECTIVE/);
  assert.throws(()=>exportDirectiveMarkdown(text,corpus),/INVALID_DIRECTIVE/);
 }
});

test('proposals display non-adoption and cannot supersede source-authoritative records',()=>{
 const i=input();const proposal={...structuredClone(i.entries.find(e=>e.id==='UT-D01')!),id:'UT-D99',route:'/claims/UT-D99/',contentOrigin:'proposed' as const,sourceBinding:null,statement:'An isolated engineering proposal fixture, not science.',proposalProvenance:'Synthetic test-only proposal provenance.',adopted:false as const};
 i.entries.push(proposal);const c=validateCorpus(i);assert.match(renderRecordDetails(c,c.entries.get(proposal.id)!),/not adopted into the current theory/);
 const j=input();j.entries.push({...proposal,supersedes:'UT-D01'});assert.throws(()=>validateCorpus(j),/PROPOSAL_ADOPTION_REQUIRED/);
});
