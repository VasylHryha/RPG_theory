import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { qualifyCurrentSource, validateBinding, verifyIdentities, type AdmissionRecord } from '../../src/lib/source-admission.js';
import { sha256, stableJSON } from '../../src/lib/identity.js';
import { assertUniqueRoutes, withBase } from '../../src/lib/urls.js';
import { assertBuildAllowed } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { renderMarkdown } from '../../src/lib/markdown.js';
import { auditOutput } from '../../scripts/audit-output.js';

function fixture(run: (directory: string, record: AdmissionRecord) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'unity-intake-'));
  try {
    const bodies: Record<string, string> = {
      '00_LOCKED_CORE.md': '# Synthetic core\nOriginal synthetic definition.\n',
      'CURRENT_MANIFEST.md': '# Synthetic manifest\n- `00_LOCKED_CORE.md`\n- `status.md`\n',
      'status.md': '# Synthetic status\nNo scientific evidence.\n'
    };
    for (const [path, content] of Object.entries(bodies)) writeFileSync(join(directory, path), content);
    const files = Object.entries(bodies).sort(([a], [b]) => a.localeCompare(b)).map(([path, body]) => ({ path, bytes: Buffer.byteLength(body), sha256: sha256(body), role: 'synthetic' }));
    const record: AdmissionRecord = {
      schema: 'unity-source-intake/1', corpusScope: 'synthetic', sourceReference: 'isolated test fixture', directory,
      edition: 'synthetic-1', corePath: '00_LOCKED_CORE.md', coreSha256: sha256(bodies['00_LOCKED_CORE.md']),
      manifestPath: 'CURRENT_MANIFEST.md', manifestSha256: sha256(bodies['CURRENT_MANIFEST.md']), manifestMembers: ['00_LOCKED_CORE.md', 'status.md'],
      files, inventorySeal: sha256(stableJSON(files)), priorCoreSha256: null, revision: null,
      inspection: { outcome: 'accepted', inspectedFiles: files.map(f => f.path), evidenceRef: 'synthetic test only' }, bindings: [], contentReview: 'pending'
    };
    run(directory, record);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('missing current sources reach CURRENT_SOURCE_PACKAGE_MISSING', () => {
  assert.throws(() => qualifyCurrentSource(null), /CURRENT_SOURCE_PACKAGE_MISSING/);
});
test('one-byte history mutation reaches HISTORICAL_INTEGRITY_FAILURE', () => fixture((directory, record) => {
  writeFileSync(join(directory, 'status.md'), readFileSync(join(directory, 'status.md'), 'utf8') + 'x');
  assert.throws(() => verifyIdentities(directory, record.files, 'HISTORICAL_INTEGRITY_FAILURE'), /HISTORICAL_INTEGRITY_FAILURE/);
}));
test('unrecorded core change reaches LOCKED_CORE_MISMATCH', () => fixture((directory, record) => {
  writeFileSync(join(directory, record.corePath), '# Changed synthetic core\n');
  assert.throws(() => qualifyCurrentSource(record), /LOCKED_CORE_MISMATCH/);
}));
test('missing required manifest member reaches CURRENT_MANIFEST_INCOMPLETE', () => fixture((directory, record) => {
  rmSync(join(directory, 'status.md'));
  assert.throws(() => qualifyCurrentSource(record), /CURRENT_MANIFEST_INCOMPLETE/);
}));
test('mixed stale sibling with matching core reaches SOURCE_INTEGRITY_FAILURE', () => fixture((directory, record) => {
  writeFileSync(join(directory, 'status.md'), 'stale sibling from another edition');
  assert.throws(() => qualifyCurrentSource(record), /SOURCE_INTEGRITY_FAILURE/);
}));
test('wrong source/excerpt binding reaches SOURCE_BINDING_FAILURE', () => fixture((directory, record) => {
  assert.throws(() => validateBinding(directory, { path: record.corePath, sourceSha256: '0'.repeat(64), startLine: 1, endLine: 1, excerptSha256: sha256('# Synthetic core\n') }), /SOURCE_BINDING_FAILURE/);
  record.bindings = [{ path: record.corePath, sourceSha256: record.coreSha256, startLine: 2, endLine: 2, excerptSha256: '0'.repeat(64) }];
  assert.throws(() => qualifyCurrentSource(record), /SOURCE_BINDING_FAILURE/);
}));
test('history offered as current reaches LEGACY_SOURCE_REJECTED', () => fixture((_directory, record) => {
  record.files[0].role = 'history_only';
  assert.throws(() => qualifyCurrentSource(record), /LEGACY_SOURCE_REJECTED/);
}));
test('complete justified revised synthetic edition passes without historical-pin veto', () => fixture((directory, record) => {
  const updated = '# Synthetic core\nA revised synthetic definition.\n';
  record.priorCoreSha256 = record.coreSha256;
  writeFileSync(join(directory, record.corePath), updated);
  record.coreSha256 = sha256(updated);
  record.files = record.files.map(f => f.path === record.corePath ? { ...f, bytes: Buffer.byteLength(updated), sha256: record.coreSha256 } : f);
  record.inventorySeal = sha256(stableJSON(record.files));
  record.bindings = [{ path: record.corePath, sourceSha256: record.coreSha256, startLine: 2, endLine: 2, excerptSha256: sha256('A revised synthetic definition.\n') }];
  record.revision = { category: 'definition-core', predecessor: 'synthetic-1', problem: 'test changes a definition', before: 'original synthetic definition', after: 'revised synthetic definition', rationale: 'test positive authorized revision handling', permissionBasis: 'synthetic unit-test scope', dependentReviewHashes: [sha256(stableJSON(record.bindings))] };
  const result = qualifyCurrentSource(record);
  assert.equal(result.bytesVerified, true);
  assert.equal(result.currentSourceQualified, false);
  assert.equal(result.corpusScope, 'synthetic');
}));
test('silent edition-pin reset still fails', () => fixture((_directory, record) => {
  record.priorCoreSha256 = '0'.repeat(64);
  assert.throws(() => qualifyCurrentSource(record), /LOCKED_CORE_MISMATCH/);
}));
test('root, subpath, file endpoints and path collisions use the same URL owner', () => {
  assert.equal(withBase('/start/', '/'), '/start/');
  assert.equal(withBase('/start/', '/unity-theory'), '/unity-theory/start/');
  assert.equal(withBase('/', '/unity-theory/'), '/unity-theory/');
  assert.equal(withBase('/rss.xml', '/unity-theory/'), '/unity-theory/rss.xml');
  assert.throws(() => assertUniqueRoutes(['/Start/', '/start/']), /ROUTE_COLLISION/);
  for (const path of ['/../private', '/%2e%2e/private', '/%252e%252e/private', '//external.invalid', '/a//b', '/a\\b']) assert.throws(() => withBase(path), /UNSAFE_ROUTE/);
});
test('release with fixture host or unqualified scientific corpus fails closed', () => {
  const config = loadSiteConfig();
  assert.throws(() => assertBuildAllowed('release', config, { currentSourceQualified: false, corpusScope: 'current' }), /PUBLIC_TARGET_REQUIRED/);
  const real = { ...config, origin: 'https://example.org', repository: { owner: 'synthetic-owner', name: 'synthetic-repo' } };
  assert.throws(() => assertBuildAllowed('release', real, { currentSourceQualified: false, corpusScope: 'current' }), /CURRENT_SOURCE_NOT_QUALIFIED/);
  assert.throws(() => assertBuildAllowed('release', real, { currentSourceQualified: true, corpusScope: 'synthetic' }), /CURRENT_SOURCE_NOT_QUALIFIED/);
  assert.throws(() => assertBuildAllowed('release', real, { currentSourceQualified: true, corpusScope: 'current' }), /PUBLIC_AUTHORIZATION_REQUIRED/);
});
test('root-only asset in subpath output reaches BASE_PATH_FAILURE', () => {
  const directory = mkdtempSync(join(tmpdir(), 'unity-output-'));
  try {
    writeFileSync(join(directory, 'build-info.json'), JSON.stringify({ deployEligible: false, config: { origin: 'https://unity-theory.invalid', basePath: '/unity-theory/' } }));
    writeFileSync(join(directory, 'index.html'), '<html><head><meta name="robots" content="noindex"><link rel="canonical" href="https://unity-theory.invalid/unity-theory/"><link rel="icon" href="/favicon.svg"></head><body><h1>Isolated output fixture</h1></body></html>');
    writeFileSync(join(directory, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    assert.throws(() => auditOutput(directory), /BASE_PATH_FAILURE/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('Markdown renders MathML, prefixes links and rejects HTML/unsafe destinations', async () => {
  const html = await renderMarkdown('## Heading\n\n[Math](/start/)\n\n$$x^2+1$$', '/unity-theory/');
  assert.match(html, /href="\/unity-theory\/start\/"/);
  assert.match(html, /<math/);
  assert.match(html, /id="heading"/);
  await assert.rejects(renderMarkdown('<script>alert(1)</script>'), /UNSAFE_MARKDOWN/);
  await assert.rejects(renderMarkdown('[bad](javascript:alert)'), /UNSAFE_MARKDOWN/);
  await assert.rejects(renderMarkdown('$$\\unknowncommand{x}$$'), /Undefined control sequence|ParseError/);
});
test('safe archive extraction rejects traversal, absolute paths, symlinks, collisions and unexpected roots', () => {
  const result = spawnSync('python3', ['-m', 'unittest', 'tests/content/test_archive.py'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
