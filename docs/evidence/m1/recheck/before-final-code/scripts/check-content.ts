import { loadCanonicalCorpus, reviewFingerprint, reviewState, affectedEntries, renderEntrySync, dependencyClosure } from '../src/lib/content.js';
import { args } from './args.js';
import { mkdirSync, writeFileSync } from 'node:fs';
const options=args(['changed','evidence-dir']);
const corpus=loadCanonicalCorpus();
const entries=[...corpus.entries.values()].map(entry=>{ renderEntrySync(corpus,entry); return { entryId:entry.id, route:entry.route, sourceBinding:entry.sourceBinding, sourceMapping:entry.sourceMapping, dependencies:dependencyClosure(corpus,entry.id), bibliography:entry.bibRefs, fingerprint:reviewFingerprint(corpus,entry.id), reviewState:reviewState(corpus,entry.id), evidenceState:entry.evidenceState, publicationState:entry.publicationState }; });
const receipt={schema:'unity-content-check/1',status:'PASS',date:new Date().toISOString(),admission:corpus.admission,entries,affected:options.changed ? affectedEntries(corpus,options.changed):[],scientificReview:'pending',acceptedReviews:corpus.reviews.filter(r=>r.outcome==='accepted').length};
const evidence=options['evidence-dir'] ?? process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m1';mkdirSync(evidence,{recursive:true});writeFileSync(`${evidence}/content-bindings.json`,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({...receipt,entries:entries.length}));
