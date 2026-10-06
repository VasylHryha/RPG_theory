import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditOutput } from '../../scripts/audit-output.js';
import { selectPublication } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { verifyLiveArtifact } from '../../src/lib/live-release.js';
import { reviewedFixture } from '../helpers/fidelity.js';

let directory: string, original: string, artifact: ReturnType<typeof auditOutput>;
before(() => {
  const source = process.env.UNITY_CONTRACT_OUTPUT ?? 'dist/test-suite-proportionate/preview-target';
  if (!process.env.UNITY_CONTRACT_OUTPUT) {
    const built = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/build.ts', '--mode', 'preview',
      '--config', 'config/site.json', '--output', source], { encoding: 'utf8' });
    assert.equal(built.status, 0, built.stdout + built.stderr);
  }
  mkdirSync('docs/evidence/test-suite-proportionate/fixtures', { recursive: true });
  directory = mkdtempSync(resolve('docs/evidence/test-suite-proportionate/fixtures/output-'));
  cpSync(source, directory, { recursive: true });
  // Use an unindexed utility page so the intended audit diagnostic is reached
  // directly, instead of failing first on a changed search HTML fingerprint.
  original = readFileSync(join(directory, '404.html'), 'utf8');
  artifact = auditOutput(directory);
});
after(() => { if (directory) rmSync(directory, { recursive: true, force: true }); });
function refuses(html: string, diagnostic: RegExp) {
  assert.notEqual(html, original, 'Mutation must actually change the fixture');
  try {
    writeFileSync(join(directory, '404.html'), html);
    assert.throws(() => auditOutput(directory), diagnostic);
  } finally { writeFileSync(join(directory, '404.html'), original); }
}

test('shared output audit accepts the actual preview build', () => {
  assert.equal(artifact.status, 'PASS');
});
test('output audit refuses an injected script', () => {
  refuses(original.replace('</body>', '<script>alert(1)</script></body>'), /ACTIVE_OUTPUT/);
});
test('output audit refuses a broken internal link', () => {
  const info = JSON.parse(readFileSync(join(directory, 'build-info.json'), 'utf8'));
  refuses(original.replace('</body>', `<a href="${info.config.basePath}missing-control/">Control</a></body>`), /BROKEN_OUTPUT_LINK/);
});
test('output audit refuses missing or duplicate metadata', () => {
  const metadata = original.match(/<script[^>]*data-site-metadata[\s\S]*?<\/script>/)![0];
  for (const replacement of ['', metadata + metadata]) {
    refuses(original.replace(metadata, replacement), /STRUCTURED_METADATA_PARITY_FAILURE/);
  }
});
test('release selection excludes drafts; output audit refuses private files', () => {
  const { corpus, entry, release } = reviewedFixture();
  const draft = { ...structuredClone(entry), id: 'UT-D99', route: '/private-control/', publicationState: 'draft' as const };
  corpus.entries.set(draft.id, draft);
  const selected = selectPublication(corpus, loadSiteConfig(), release);
  assert.equal(selected.entries.some(e => e.id === draft.id), false);
  for (const ids of [selected.manifest.navigationIds, selected.manifest.searchIds, selected.manifest.sitemapIds,
    selected.manifest.feedIds, selected.manifest.exportIds]) assert.equal(ids.includes(draft.id), false);
  assert.equal(selected.manifest.routes.includes(draft.route), false);
  const privateFile = join(directory, 'private.md');
  try {
    writeFileSync(privateFile, 'PRIVATE_CONTROL');
    assert.throws(() => auditOutput(directory), /UNEXPECTED_OUTPUT/);
  } finally { rmSync(privateFile); }
});
test('preview artifacts cannot be deployed or presented as sealed releases', async () => {
  const info = JSON.parse(readFileSync(join(directory, 'build-info.json'), 'utf8'));
  assert.equal(info.deployEligible, false);
  let requests = 0;
  await assert.rejects(() => verifyLiveArtifact(artifact, {}, loadSiteConfig(), async () => {
    requests++; return new Response('Unexpected request');
  }), (error: any) => error.issues?.some((issue: { path: string[] }) => issue.path[0] === 'mode'));
  assert.equal(requests, 0);
});
