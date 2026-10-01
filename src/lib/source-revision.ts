import { z } from 'astro/zod';
import { ContractError } from './errors.js';
import { sha256 } from './identity.js';
import { affectedEntries, reviewFingerprint, type Corpus } from './content.js';
const schema = z.object({ changeId:z.string().trim().min(1), category:z.enum(['wording','factual-mathematical correction','evidence-status','definition-core','format','supplied-baseline']), predecessorEdition:z.string().trim().min(1), predecessorSeal:z.string().regex(/^[a-f0-9]{64}$/), sourceChangeRef:z.string().trim().min(1), affectedFiles:z.array(z.string()).min(1), affectedClaimIds:z.array(z.string()), problem:z.string().trim().min(1), before:z.string().trim().min(1), after:z.string().trim().min(1), rationale:z.string().trim().min(1), permissionBasis:z.string().trim().min(1), resultEdition:z.string().trim().min(1), resultSeal:z.string().regex(/^[a-f0-9]{64}$/), priorSnapshot:z.array(z.object({path:z.string(),raw:z.instanceof(Uint8Array),sha256:z.string()})), resultCoreRaw:z.instanceof(Uint8Array).optional(), proofGate:z.object({lockedStatement:z.string().trim().min(1),counterexample:z.string().trim().min(1),evidence:z.string().trim().min(1),extensionInsufficient:z.string().trim().min(1),minimalWording:z.string().trim().min(1),impactAnalysis:z.string().trim().min(1),versionDecision:z.string().trim().min(1)}).optional() }).strict();
// Validate a proposed authoring transaction. This never writes sources/pins or accepts reviews.
export function validateSourceRevision(input: unknown, prior: Corpus, next: Corpus) {
  const change=schema.parse(input);
  if (change.predecessorEdition !== prior.admission.edition || change.predecessorSeal !== prior.admission.inventorySeal || change.resultEdition !== next.admission.edition || change.resultSeal !== next.admission.inventorySeal || change.priorSnapshot.some(file=>sha256(file.raw)!==file.sha256)) throw new ContractError('SOURCE_REVISION_FAILURE','Edition/snapshot identity mismatch');
  const oldSources=[...prior.sources.values()].filter(s=>s.declaredCurrent);
  const newSources=[...next.sources.values()].filter(s=>s.declaredCurrent);
  const newCurrent=new Map(newSources.map(s=>[s.key,s]));
  const oldCurrent=new Map(oldSources.map(s=>[s.key,s]));
  const changed=oldSources.filter(s=>s.sha256!==newCurrent.get(s.key)?.sha256 || s.path!==newCurrent.get(s.key)?.path);
  const added=newSources.filter(s=>!oldCurrent.has(s.key));
  const paths=[...new Set(changed.flatMap(s=>[s.path,...(newCurrent.has(s.key)?[newCurrent.get(s.key)!.path]:[])]).concat(added.map(s=>s.path)))].sort();
  if (new Set(change.affectedFiles).size!==change.affectedFiles.length || paths.join('\n')!==[...change.affectedFiles].sort().join('\n') || !paths.length || changed.some(s=>!change.priorSnapshot.some(p=>p.path===s.path && p.sha256===s.sha256))) throw new ContractError('SOURCE_REVISION_FAILURE','Exact changed/added/removed membership and prior snapshots required');
  if(change.priorSnapshot.length!==changed.length || new Set(change.priorSnapshot.map(s=>s.path)).size!==changed.length) throw new ContractError('SOURCE_REVISION_FAILURE','Snapshot membership must match changed predecessor files exactly');
  if(change.predecessorSeal===change.resultSeal || change.predecessorEdition===change.resultEdition) throw new ContractError('SOURCE_REVISION_FAILURE','Changed source inventory requires a new coherent edition and seal');
  const priorCore=oldSources.find(s=>s.sha256===prior.admission.coreSha256);
  const newCore=newSources.find(s=>s.sha256===next.admission.coreSha256);
  const coreChanged=priorCore?.sha256!==newCore?.sha256;
  const oldCore=priorCore && change.priorSnapshot.find(s=>s.path===priorCore.path)?.raw;
  const formatEquivalent=change.category==='format' && oldCore && change.resultCoreRaw && newCore && sha256(change.resultCoreRaw)===newCore.sha256 && Buffer.from(oldCore).toString('utf8').replace(/\r\n/g,'\n')===Buffer.from(change.resultCoreRaw).toString('utf8').replace(/\r\n/g,'\n');
  // A category label cannot bypass the actual core change-control gate. The
  // validator does not infer scientific equivalence from an author's label.
  if ((change.category==='definition-core' || coreChanged && !formatEquivalent) && !change.proofGate) throw new ContractError('CORE_PROOF_GATE_REQUIRED','Actual core §13/change control B require the seven-part justification; owner standing scope is the permission basis, not a fabricated new approval');
  if (change.proofGate && (!oldCore || !Buffer.from(oldCore).toString('utf8').includes(change.proofGate.lockedStatement.trim()))) throw new ContractError('CORE_PROOF_GATE_REQUIRED','The exact locked statement must occur in the byte-verified preserved predecessor core');
  const keys=new Set([...changed,...added].map(s=>s.key));
  for(const entry of next.entries.values()) {
    const old=prior.entries.get(entry.id);
    if(old && entry.sourceRefs.some(key=>keys.has(key)) && entry.revision<=old.revision) throw new ContractError('SOURCE_REVISION_FAILURE',`Source-bound derivative revision must advance: ${entry.id}`);
  }
  // Include retained dependants from both graphs: a removed dependency edge
  // must not erase its predecessor impact from the rereview report.
  const priorAffected=changed.flatMap(source=>affectedEntries(prior,source.key));
  const seeds=change.affectedClaimIds.concat(priorAffected.filter(id=>next.entries.has(id)),[...keys].filter(key=>next.sources.has(key)).flatMap(key=>affectedEntries(next,key)));
  for(const entry of prior.entries.values()) if(entry.sourceRefs.some(k=>keys.has(k))) for(const id of affectedEntries(prior,entry.id)) if(!next.entries.has(id)) throw new ContractError('SOURCE_REVISION_FAILURE',`Removed dependant needs explicit retained correction history: ${id}`);
  const affected=[...new Set(seeds.flatMap(id=>affectedEntries(next,id)))].sort();
  return {changeId:change.changeId,sourceChangeRef:change.sourceChangeRef,affected:affected.map(id=>({entryId:id,requiredFingerprint:reviewFingerprint(next,id)})),reviewOutcome:'pending' as const};
}
