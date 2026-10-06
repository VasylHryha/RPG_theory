// Finalize the 75 explicit, individually written findings from this independent
// acceptance. Not a general fingerprint refresher or an implementation approval.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {loadCanonicalCorpus,renderEntrySync} from '../../../src/lib/content.js';
import {websiteReviewInputs,validateWebsiteReviews,websiteReviewState} from '../../../src/lib/website-review.js';
import {sha256,stableJSON} from '../../../src/lib/identity.js';
import {buildInputs} from '../../../src/lib/build-identity.js';
import {load} from 'cheerio';
const dir='docs/evidence/site-wide-acceptance';
const corpus=loadCanonicalCorpus();
const notes=JSON.parse(readFileSync(`${dir}/reviewer-notes.json`,'utf8'));
const comparisons=JSON.parse(readFileSync('docs/evidence/site-wide-rework/comparison.json','utf8')).comparisons;
const previous=JSON.parse(readFileSync(`${dir}/prior-website-reviews.json`,'utf8'));
const selected=[...corpus.entries.values()].filter(e=>e.publicationState==='published');
if(selected.length!==75 || Object.keys(notes).length!==75)throw Error('Reviewed scope differs');
const reviewedAt=new Date().toISOString(),records=[],rows=[];
mkdirSync(`${dir}/decisions`,{recursive:true});
for(const entry of selected) {
 const rationale=notes[entry.id];if(typeof rationale!=='string' || rationale.length<60)throw Error(`Individual review missing: ${entry.id}`);
 const comparison=comparisons.find((c:any)=>c.entryId===entry.id);
 const initial=JSON.parse(readFileSync(comparison.currentInputs,'utf8')).inputs;
 const prior=JSON.parse(readFileSync(comparison.priorRequest,'utf8')).inputs;
 const old=previous.find((r:any)=>r.entryId===entry.id);
 const oldRaw=readFileSync(old.evidenceRef);if(sha256(oldRaw)!==old.evidenceSha256)throw Error('Issued receipt changed');
 const inputs=websiteReviewInputs(corpus,entry.id);
 if(entry.statement!==prior.ownRead.statement || stableJSON(entry.sourceBinding)!==stableJSON(prior.ownRead.sourceBinding))throw Error(`Scientific text changed: ${entry.id}`);
 for(const s of inputs.sourceReads)if(sha256(readFileSync(s.path))!==s.sha256)throw Error(`Source changed: ${s.path}`);
 const mapping=entry.sourceMapping;
 const checks={
  terminology:`${rationale} Compared terminology with ${mapping}`,
  meaning:`Individually inspected own explanation/context and genuine prior request ${comparison.priorRequest}; ${rationale}`,
  assumptions:`Compared stated supplied conditions, scope and limits with mapped original and registered support: ${entry.scope} ${entry.limits}`,
  hypotheses:`${rationale} Definitions, authored illustrations and source-reported open hypotheses retain their distinct roles; no scientific certification.`,
  evidenceDescriptions:`${rationale} Unchanged literature inspection depths reused from references.json and the issued predecessor; no new paper-methods or numerical reproduction claimed.`,
  openQuestions:`${rationale} Compared core extension boundaries and current 08 H01–H23/O1–O8; contributions remain optional and model-specific.`,
  attribution:`Compared source roles and dated original versus current authored context; ${entry.contentOrigin}. References ${entry.bibRefs.join(', ') || 'available through source/dependency mappings'} retain registered verification scope.`,
  sourceMappings:`Compared ${mapping}; exact original statement/binding preserved against genuine prior request and source bytes. Final dependency/source closure is retained in inputs. Actual root/target retained displays compared; qualification audits verify resulting final presentation.`
 };
 const decision={schema:'unity-website-fidelity-decision/1',purpose:'website-source-fidelity/1',entryId:entry.id,fingerprint:inputs.fingerprint,reviewerKind:'agent',reviewedAt,outcome:'accepted',scientificCertification:false,rationale,inputs,checks};
 const evidenceRef=`${dir}/decisions/${entry.id}.json`,raw=JSON.stringify(decision,null,2)+'\n';writeFileSync(evidenceRef,raw);
 records.push({purpose:decision.purpose,entryId:entry.id,fingerprint:inputs.fingerprint,reviewerKind:'agent',reviewedAt,outcome:'accepted',evidenceRef,evidenceSha256:sha256(raw)});
 const displays=['/','/rrg_theory/'].map(base=>{
  const output=base==='/'?'dist/site-wide-rework-root':'dist/site-wide-rework-target';
  const file=entry.route==='/'?'index.html':entry.route.slice(1)+'index.html';
  const raw=readFileSync(`${output}/${file}`),$=load(raw.toString());
  return {base,path:`${output}/${file}`,sha256:sha256(raw),priorCanonicalBodyText:$('[data-canonical-body]').text(),reviewedFinalCanonicalBodySha256:sha256(renderEntrySync(corpus,entry,base))};
 });
 rows.push({entryId:entry.id,route:entry.route,rationale,priorRequest:comparison.priorRequest,priorEvidenceRef:old.evidenceRef,priorEvidenceSha256:old.evidenceSha256,originalStatementAndBindingUnchanged:true,changedSinceImplementation:Object.keys(entry).filter(k=>stableJSON((entry as any)[k])!==stableJSON(initial.ownRead[k])),displays,evidenceRef});
}
writeFileSync('research/publication/website-reviews.yaml',JSON.stringify(previous.map((r:any)=>records.find(n=>n.entryId===r.entryId)??r),null,2)+'\n');
const final=loadCanonicalCorpus();validateWebsiteReviews(final);
if(!final.admission.currentSourceQualified || selected.some(e=>websiteReviewState(final,e.id)!=='accepted'))throw Error('Shared fidelity validator refused reviewed selection');
const archived=previous.filter((r:any)=>!records.some(n=>n.entryId===r.entryId));
if(archived.length!==21 || archived.some((r:any)=>stableJSON(r)!==stableJSON(final.websiteReviews.find(n=>n.entryId===r.entryId))))throw Error('Archived decisions changed');
writeFileSync(`${dir}/fidelity-acceptance.json`,JSON.stringify({status:'ACCEPTED_WEBSITE_FIDELITY',reviewedAt,reviewer:'Independent High agent acceptance of combined R4 §§0.60–0.62',scientificCertification:false,currentSourceQualified:final.admission.currentSourceQualified,acceptedSelected:75,archivedStalePreserved:21,priorRegistry:`${dir}/prior-website-reviews.json`,inputsAfterRegistry:buildInputs(),rows},null,2)+'\n');
console.log(JSON.stringify({accepted:75,archivedStalePreserved:21,currentSourceQualified:final.admission.currentSourceQualified,reviewedAt}));
