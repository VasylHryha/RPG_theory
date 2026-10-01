import { z } from 'astro/zod';
import { ContractError } from './errors.js';
import { sha256 } from './identity.js';
import { affectedEntries, reviewFingerprint, type Corpus } from './content.js';
const schema = z.object({ changeId:z.string().min(1), category:z.enum(['wording','factual-mathematical correction','evidence-status','definition-core','format','supplied-baseline']), predecessorEdition:z.string().min(1), predecessorSeal:z.string().regex(/^[a-f0-9]{64}$/), sourceChangeRef:z.string().min(1), affectedFiles:z.array(z.string()).min(1), affectedClaimIds:z.array(z.string()), problem:z.string().min(1), before:z.string().min(1), after:z.string().min(1), rationale:z.string().min(1), permissionBasis:z.string().min(1), resultEdition:z.string().min(1), resultSeal:z.string().regex(/^[a-f0-9]{64}$/), priorSnapshot:z.array(z.object({path:z.string(),raw:z.instanceof(Uint8Array),sha256:z.string()})), proofGate:z.object({lockedStatement:z.string().min(1),counterexample:z.string().min(1),evidence:z.string().min(1),extensionInsufficient:z.string().min(1),minimalWording:z.string().min(1),impactAnalysis:z.string().min(1),versionDecision:z.string().min(1)}).optional() }).strict();
// Validate a proposed authoring transaction. This never writes sources/pins or accepts reviews.
export function validateSourceRevision(input: unknown, prior: Corpus, next: Corpus) {
  const change=schema.parse(input);
  if (change.predecessorEdition !== prior.admission.edition || change.predecessorSeal !== prior.admission.inventorySeal || change.resultEdition !== next.admission.edition || change.resultSeal !== next.admission.inventorySeal || change.priorSnapshot.some(file=>sha256(file.raw)!==file.sha256)) throw new ContractError('SOURCE_REVISION_FAILURE','Edition/snapshot identity mismatch');
  const changed=[...prior.sources.values()].filter(s=>s.declaredCurrent && s.sha256!==next.sources.get(s.key)?.sha256);
  if (!changed.length || changed.some(s=>!change.affectedFiles.includes(s.path) || !change.priorSnapshot.some(p=>p.path===s.path && p.sha256===s.sha256))) throw new ContractError('SOURCE_REVISION_FAILURE','All changed current bytes need exact prior snapshots and change membership');
  if (change.category==='definition-core' && !change.proofGate) throw new ContractError('CORE_PROOF_GATE_REQUIRED','Actual core §13/change control B require the seven-part justification; owner standing scope is the permission basis, not a fabricated new approval');
  const seeds=change.affectedClaimIds.concat([...next.entries.values()].filter(e=>e.sourceRefs.some(k=>changed.some(s=>s.key===k))).map(e=>e.id));
  const affected=[...new Set(seeds.flatMap(id=>affectedEntries(next,id)))].sort();
  return {changeId:change.changeId,sourceChangeRef:change.sourceChangeRef,affected:affected.map(id=>({entryId:id,requiredFingerprint:reviewFingerprint(next,id)})),reviewOutcome:'pending' as const};
}
