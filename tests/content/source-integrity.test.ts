import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { qualifyCurrentSource, verifyIdentities, type AdmissionRecord } from '../../src/lib/source-admission.js';
import { sha256, stableJSON } from '../../src/lib/identity.js';
import { loadCanonicalCorpus } from '../../src/lib/content.js';
import { validateSourceRevision } from '../../src/lib/source-revision.js';

function fixture(run: (directory: string, record: AdmissionRecord) => void) {
  mkdirSync('docs/evidence/test-suite-proportionate/fixtures', { recursive: true });
  const directory = mkdtempSync(resolve('docs/evidence/test-suite-proportionate/fixtures/intake-'));
  try {
    const bodies: Record<string, string> = {
      '00_LOCKED_CORE.md': '# Synthetic core\nOriginal synthetic definition.\n',
      'CURRENT_MANIFEST.md': '# Synthetic manifest\n\n## Active files\n- `00_LOCKED_CORE.md`\n- `status.md`\n',
      'status.md': '# Synthetic status\nNo scientific evidence.\n'
    };
    for (const [path, content] of Object.entries(bodies)) writeFileSync(join(directory, path), content);
    const files = Object.entries(bodies).sort(([a], [b]) => a.localeCompare(b)).map(([path, body]) => ({ path, bytes: Buffer.byteLength(body), sha256: sha256(body), role: 'synthetic' }));
    const record: AdmissionRecord = {
      schema: 'unity-source-intake/1', corpusScope: 'synthetic', sourceReference: 'isolated test fixture', directory,
      edition: 'synthetic-1', corePath: '00_LOCKED_CORE.md', coreSha256: sha256(bodies['00_LOCKED_CORE.md']),
      manifestPath: 'CURRENT_MANIFEST.md', manifestFormat: 'markdown-active-files/1', manifestSha256: sha256(bodies['CURRENT_MANIFEST.md']), manifestMembers: ['00_LOCKED_CORE.md', 'status.md'],
      files, inventorySeal: sha256(stableJSON(files)), priorCoreSha256: null, revision: null,
      inspection: { outcome: 'accepted', inspectedFiles: files.map(f => f.path), evidenceRef: 'synthetic test only' }, bindings: [], contentReview: 'pending'
    };
    run(directory, record);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('changed source bytes and a silent core repin refuse admission without a revision', () => fixture((directory, record) => {
  assert.equal(qualifyCurrentSource(record).bytesVerified, true);
  const changed = '# Changed synthetic core\n';
  writeFileSync(join(directory, record.corePath), changed);
  assert.throws(() => qualifyCurrentSource(record), /LOCKED_CORE_MISMATCH/);
  record.priorCoreSha256 = record.coreSha256;
  record.coreSha256 = sha256(changed);
  record.files = record.files.map(f => f.path === record.corePath ? { ...f, bytes: Buffer.byteLength(changed), sha256: record.coreSha256 } : f);
  record.inventorySeal = sha256(stableJSON(record.files));
  assert.throws(() => qualifyCurrentSource(record), /LOCKED_CORE_MISMATCH/);
}));

test('unrelated history byte changes fail the history integrity checker', () => fixture((directory) => {
  const manifest = JSON.parse(readFileSync('research/source-manifest.json', 'utf8'));
  const file = manifest.files.find((f: { role: string }) => f.role === 'history_only');
  const raw = readFileSync(join('research', file.path));
  const local = { ...file, path: 'history.md' };
  writeFileSync(join(directory, local.path), raw);
  verifyIdentities(directory, [local], 'HISTORICAL_INTEGRITY_FAILURE');
  writeFileSync(join(directory, local.path), Buffer.concat([raw, Buffer.from('x')]));
  assert.throws(() => verifyIdentities(directory, [local], 'HISTORICAL_INTEGRITY_FAILURE'), /HISTORICAL_INTEGRITY_FAILURE/);
}));

test('source revision requires preserved prior bytes and only reports pending review', () => {
  const registry = 'research/publication/website-reviews.yaml', before = readFileSync(registry);
  const prior = loadCanonicalCorpus();
  const source = [...prior.sources.values()].find(s => s.declaredCurrent && s.role === 'edition-history')!;
  // One isolated derivative keeps impact reporting exercised without copying
  // or revising the real scientific source package.
  const entry = structuredClone(prior.entries.get('DOC-START')!);
  Object.assign(entry, { sourceRefs: [source.key], dependsOn: [], related: [], bibRefs: [],
    body: 'Synthetic revision control.', plainLanguage: '', sourceMapping: '' });
  prior.entries = new Map([[entry.id, entry]]);
  const next = structuredClone(prior);
  next.entries.get(entry.id)!.revision++;
  const raw = readFileSync(source.path);
  next.sources.get(source.key)!.sha256 = sha256(Buffer.concat([raw, Buffer.from('Synthetic change')]));
  next.admission.edition = 'Synthetic revision control';
  next.admission.inventorySeal = sha256('Synthetic revised inventory');
  const change = { changeId: 'synthetic-change', category: 'wording',
    predecessorEdition: prior.admission.edition, predecessorSeal: prior.admission.inventorySeal,
    resultEdition: next.admission.edition, resultSeal: next.admission.inventorySeal,
    sourceChangeRef: source.path, affectedFiles: [source.path], affectedClaimIds: [],
    problem: 'Synthetic control', before: 'Preserved fixture bytes', after: 'Synthetic annotation',
    rationale: 'Exercise read-only revision validation', permissionBasis: 'Synthetic test only', priorSnapshot: [] };
  assert.throws(() => validateSourceRevision(change, prior, next), /SOURCE_REVISION_FAILURE/);
  const reviews = structuredClone(next.websiteReviews);
  const result = validateSourceRevision({ ...change, priorSnapshot: [{ path: source.path, raw, sha256: source.sha256 }] }, prior, next);
  assert.equal(result.reviewOutcome, 'pending');
  assert.ok(result.affected.some(affected => affected.entryId === entry.id));
  assert.deepEqual(next.websiteReviews, reviews);
  assert.deepEqual(readFileSync(registry), before);
});
