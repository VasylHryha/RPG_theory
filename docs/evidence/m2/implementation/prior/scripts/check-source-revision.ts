import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { args } from './args.js';
import { loadCanonicalCorpus } from '../src/lib/content.js';
import { validateSourceRevision } from '../src/lib/source-revision.js';
import { ContractError } from '../src/lib/errors.js';
import { safePath } from '../src/lib/urls.js';
import { sha256 } from '../src/lib/identity.js';

// Read-only authoring validation: prior-root is a preserved complete prior
// edition (sources, config, publication sidecars and referenced evidence).
const options=args(['prior-root','change','evidence-dir']);
if(!options['prior-root'] || !options.change) throw new Error('--prior-root and --change required');
const priorRoot=resolve(options['prior-root']);
if(priorRoot===process.cwd()) throw new ContractError('SOURCE_REVISION_FAILURE','A separate preserved predecessor is required');
const change=JSON.parse(readFileSync(options.change,'utf8'));
const changeSha256=sha256(readFileSync(options.change));
const prior=loadCanonicalCorpus(priorRoot),next=loadCanonicalCorpus();
const snapshots=change.priorSnapshot.map((file:{path:string;sha256:string})=>{
  safePath('/'+file.path);const raw=readFileSync(resolve(priorRoot,file.path));return {...file,raw};
});
const source= [...next.sources.values()].find(s=>s.path===change.sourceChangeRef && s.declaredCurrent);
if(!source || !['edition-history','change-control'].includes(source.role) || !readFileSync(source.path,'utf8').includes(change.changeId)) throw new ContractError('SOURCE_REVISION_FAILURE','Change ID must occur in the authoritative current source change record');
const core=[...next.sources.values()].find(s=>s.declaredCurrent && s.sha256===next.admission.coreSha256)!;
const result=validateSourceRevision({...change,priorSnapshot:snapshots,...(change.category==='format'?{resultCoreRaw:readFileSync(core.path)}:{})},prior,next);
const evidence=options['evidence-dir'] ?? process.env.UNITY_EVIDENCE_DIR ?? 'docs/evidence/m1';
mkdirSync(evidence,{recursive:true});
writeFileSync(`${evidence}/source-revision-${changeSha256}.json`,JSON.stringify({schema:'unity-source-revision-check/1',status:'PASS',date:new Date().toISOString(),changeSha256,predecessorSeal:prior.admission.inventorySeal,resultSeal:next.admission.inventorySeal,...result},null,2)+'\n');
console.log(JSON.stringify(result));
