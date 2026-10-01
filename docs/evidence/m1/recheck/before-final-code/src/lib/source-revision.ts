import { z } from 'astro/zod';
import { ContractError } from './errors.js';
import { sha256 } from './identity.js';
import { affectedEntries, reviewFingerprint, type Corpus } from './content.js';
const schema = z.object({ changeId:z.string().min(1), category:z.enum(['wording','factual-mathematical correction','evidence-status','definition-core','format','supplied-baseline']), predecessorEdition:z.string().min(1), predecessorSeal:z.string().regex(/^[a-f0-9]{64}$/), sourceChangeRef:z.string().min(1), affectedFiles:z.array(z.string()).min(1), affectedClaimIds:z.array(z.string()), problem:z.string().min(1), before:z.string().min(1), after:z.string().min(1), rationale:z.string().min(1), permissionBasis:z.string().min(1), resultEdition:z.string().min(1), resultSeal:z.string().regex(/^[a-f0-9]{64}$/), priorSnapshot:z.array(z.object({path:z.string(),raw:z.instanceof(Uint8Array),sha256:z.string()})), proofGate:z.object({lockedStatement:z.string().min(1),counterexample:z.string().min(1),evidence:z.string().min(1),extensionInsufficient:z.string().min(1),minimalWording:z.string().min(1),impactAnalysis:z.string().min(1),versionDecision:z.string().min(1)}).optional() }).strict();
// Validate a proposed authoring transaction. This never writes sources/pins or accepts reviews.
export function validateSourceRevision(input: unknown, prior: Corpus, next: Corpus) {
  const change=schema.parse(input);
  if (change.predecessorEdition !== prior.admission.edition || change.predecessorSeal !== prior.admission.inventorySeal || change.resultEdition !== next.admission.edition || change.resultSeal !== next.admission.inventorySeal || change.priorSnapshot.some(file=>sha256(file.raw)!==file.sha256)) throw new ContractError('SOURCE_REVISION_FAILURE','Edition/snapshot identity mismatch');
  const oldSources=[...prior.sources.values()].filter(s=>s.declaredCurrent);
  const newSources=[...next.sources.values()].filter(s=>s.declaredCurrent);
  const changed=oldSources.filter(s=>s.sha256!==next.sources.get(s.key)?.sha256 || s.path!==next.sources.get(s.key)?.path);
  const added=newSources.filter(s=>!prior.sources.get(s.key)?.declaredCurrent);
  const paths=[...new Set(changed.map(s=>s.path).concat(added.map(s=>s.path)))].sort();
  if (new Set(change.affectedFiles).size!==change.affectedFiles.length || paths.join('\n')!==[...change.affectedFiles].sort().join('\n') || !paths.length || changed.some(s=>!change.priorSnapshot.some(p=>p.path===s.path && p.sha256===s.sha256))) throw new ContractError('SOURCE_REVISION_FAILURE','Exact changed/added/removed membership and prior snapshots required');
  if(change.priorSnapshot.length!==changed.length || new Set(change.priorSnapshot.map(s=>s.path)).size!==changed.length) throw new ContractError('SOURCE_REVISION_FAILURE','Snapshot membership must match changed predecessor files exactly');
  if(change.predecessorSeal===change.resultSeal || change.predecessorEdition===change.resultEdition) throw new ContractError('SOURCE_REVISION_FAILURE','Changed source bytes require a new coherent edition and seal');
  // A category label cannot bypass the actual core change-control gate. The
  // validator does not infer scientific equivalence from an author's label.
  if ((change.category==='definition-core' || changed.some(s=>s.sha256===prior.admission.coreSha256)) && !change.proofGate) throw new ContractError('CORE_PROOF_GATE_REQUIRED','Actual core §13/change control B require the seven-part justification; owner standing scope is the permission basis, not a fabricated new approval');
  const keys=new Set([...changed,...added].map(s=>s.key));
  for(const entry of next.entries.values()) {
    const old=prior.entries.get(entry.id);
    if(old && entry.sourceRefs.some(key=>keys.has(key)) && entry.revision<=old.revision) throw new ContractError('SOURCE_REVISION_FAILURE',`Source-bound derivative revision must advance: ${entry.id}`);
  }
  const seeds=change.affectedClaimIds.concat([...keys].filter(key=>next.sources.has(key)).flatMap(key=>affectedEntries(next,key)));
  for(const entry of prior.entries.values()) if(entry.sourceRefs.some(k=>keys.has(k))) for(const id of affectedEntries(prior,entry.id)) if(!next.entries.has(id)) throw new ContractError('SOURCE_REVISION_FAILURE',`Removed dependant needs explicit retained correction history: ${id}`);
  const affected=[...new Set(seeds.flatMap(id=>affectedEntries(next,id)))].sort();
  return {changeId:change.changeId,sourceChangeRef:change.sourceChangeRef,affected:affected.map(id=>({entryId:id,requiredFingerprint:reviewFingerprint(next,id)})),reviewOutcome:'pending' as const};
}
