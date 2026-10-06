// Read-only comparison preparation. This script never writes review decisions or the registry.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {loadCanonicalCorpus} from '../../../src/lib/content.js';
import {websiteReviewInputs,validateWebsiteReviews,websiteReviewState} from '../../../src/lib/website-review.js';
import {publicationFor} from '../../../src/lib/publication.js';
import {loadSiteConfig} from '../../../src/lib/site-config.js';
import {sha256,stableJSON} from '../../../src/lib/identity.js';
const dir='docs/evidence/public-rework',runtime='docs/evidence/m7/runtime/public-rework';
mkdirSync(`${runtime}/review-requests`,{recursive:true});
const corpus=loadCanonicalCorpus();validateWebsiteReviews(corpus);
const registryPath='research/publication/website-reviews.yaml',registryRaw=readFileSync(registryPath);
if(!registryRaw.equals(execFileSync('git',['show',`HEAD:${registryPath}`])))throw Error('Prior review registry changed');
const comparisons=[];
for(const entry of [...corpus.entries.values()].filter(e=>e.publicationState==='published')){
 const review=corpus.websiteReviews.find(r=>r.entryId===entry.id)!;
 const raw=readFileSync(review.evidenceRef);if(sha256(raw)!==review.evidenceSha256)throw Error('Prior receipt changed');
 const previous=JSON.parse(raw.toString()),inputs=websiteReviewInputs(corpus,entry.id);
 if(previous.outcome!=='accepted')throw Error(`No accepted predecessor: ${entry.id}`);
 const ownChangedFields=Object.keys(inputs.ownRead).filter(k=>stableJSON((inputs.ownRead as any)[k])!==stableJSON(previous.inputs.ownRead[k]));
 const changed=['ownRead','dependencies','sourceReads','renderedBodies','materialUpdatedAt'].filter(k=>stableJSON((inputs as any)[k])!==stableJSON(previous.inputs[k]));
 const request={schema:'rrg-website-review-request/1',purpose:'website-source-fidelity/1',entryId:entry.id,outcome:'NOT_REVIEWED',scientificCertification:false,inputs,priorEvidenceRef:review.evidenceRef,priorEvidenceSha256:review.evidenceSha256,ownChangedFields,changed,sharedPresentationChanged:true};
 const requestPath=`${runtime}/review-requests/${entry.id}.json`,requestRaw=JSON.stringify(request,null,2)+'\n';writeFileSync(requestPath,requestRaw);
 comparisons.push({entryId:entry.id,route:entry.route,priorEvidenceRef:review.evidenceRef,priorEvidenceSha256:review.evidenceSha256,ownChangedFields,changed,ownSourceBindingUnchanged:stableJSON(inputs.ownRead.sourceBinding)===stableJSON(previous.inputs.ownRead.sourceBinding),ownOriginalStatementUnchanged:inputs.ownRead.statement===previous.inputs.ownRead.statement,sharedPresentationChanged:true,requestPath,requestSha256:sha256(requestRaw),state:websiteReviewState(corpus,entry.id)});
}
if(comparisons.length!==75)throw Error('Selected current count differs');
let qualification;
try{publicationFor('qualification',loadSiteConfig('config/site.json'));qualification={status:'UNEXPECTED_PASS'};throw Error('Unreviewed candidate qualified');}
catch(error){if((error as Error).message==='Unreviewed candidate qualified')throw error;qualification={status:'REFUSED',diagnostic:(error as Error).message};}
const archived=[...corpus.entries.values()].filter(e=>e.publicationState==='archived');
const result={schema:'rrg-public-rework-comparison/1',preparedAt:new Date().toISOString(),purpose:'Independent source/display review preparation; no approvals issued',priorDeployedSourceCommit:'534350e3e2ecb7e130ccc5af716f44410df9f636',priorArtifact:'docs/evidence/m7/runtime/public-rework/before/',registryUnchanged:true,registrySha256:sha256(registryRaw),currentEntries:comparisons.length,ownReadChanged:comparisons.filter(c=>c.ownChangedFields.length).map(c=>c.entryId),archivedEntriesPreserved:archived.length,states:Object.fromEntries(['accepted','stale','pending','rejected'].map(state=>[state,[...corpus.entries.keys()].filter(id=>websiteReviewState(corpus,id)===state).length])),qualification,comparisons};
writeFileSync(`${dir}/comparison.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({currentEntries:75,ownReadChanged:result.ownReadChanged,registryUnchanged:true,states:result.states,qualification},null,2));
