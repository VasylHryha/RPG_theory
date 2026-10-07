import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { sha256 } from '../../src/lib/identity.js';

// One structural integration trial, isolated from real edition/review authority.
// Retain the scratch checkout/logs under evidence; never commit trial changes.
test('edition preserves HEAD, stops for content review, resumes and audits one target', { timeout: 300_000 }, () => {
  const root = process.cwd(), evidence = 'docs/evidence/edition-automation-2026-10-07/attempt-' + Date.now();
  mkdirSync(evidence, { recursive: true });
  const scratch = resolve(evidence, 'trial-' + Date.now());
  const clone = spawnSync('git', ['clone','--shared',root,scratch], { encoding: 'utf8' });
  assert.equal(clone.status, 0, clone.stderr);
  for (const path of ['scripts/edition.ts','package.json','tests/edition/command.test.ts']) { mkdirSync(join(scratch, path, '..'), { recursive: true }); cpSync(path, join(scratch, path)); }
  symlinkSync(resolve('node_modules'), join(scratch, 'node_modules'), 'dir');
  const head = spawnSync('git', ['rev-parse','HEAD'], { cwd: scratch, encoding: 'utf8' }).stdout.trim();
  const source = 'research/RRG_CURRENT/01_world_explanation.md';
  const oldRaw = readFileSync(join(scratch, source));
  const trialText = oldRaw.toString().replace('We start the explanation with motion because everything moves.', 'We start the explanation with motion because everything moves. This sentence is a temporary automation trial.');
  assert.notEqual(trialText, oldRaw.toString());
  writeFileSync(join(scratch, source), trialText);
  const call = (name: string, argv: string[]) => {
    const result = spawnSync(process.execPath, ['--import','tsx','scripts/edition.ts', ...argv], { cwd: scratch, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 240_000 });
    writeFileSync(`${evidence}/${name}.log`, result.stdout + result.stderr);
    return result;
  };
  const argv = ['--version','0.3.4','--label','automation trial','--approval','Synthetic scratch trial only; no production acceptance','--select','trial-v034'];
  const beforeDry = sha256(readFileSync(join(scratch, source)));
  const dry = call('trial-dry-run', [...argv, '--dry-run']);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(sha256(readFileSync(join(scratch, source))), beforeDry);
  assert.ok(!existsSync(join(scratch, 'research/publication/source-revision-v0.3.4.json')));
  const prepared = call('trial-prepare', argv);
  assert.equal(prepared.status, 2, prepared.stderr);
  const runPath = /Exact evidence list: (docs\/evidence\/edition-[^\n]+)\/required-force-add-paths.txt/.exec(prepared.stdout)![1];
  const run = JSON.parse(readFileSync(join(scratch, runPath, 'run.json'), 'utf8'));
  assert.equal(run.head, head);
  const oldConfig = JSON.parse(readFileSync(join(scratch, run.prior, 'config/research-source.json'), 'utf8'));
  for (const f of oldConfig.files) assert.equal(sha256(readFileSync(join(scratch, run.snapshot, f.path))), f.sha256, f.path);
  const pending = JSON.parse(readFileSync(join(scratch, runPath, 'pending.json'), 'utf8')).entryIds as string[];
  assert.ok(pending.includes('DOC-WORLD'));
  const registry = JSON.parse(readFileSync(join(scratch, 'research/publication/website-reviews.yaml'), 'utf8'));
  assert.ok(registry.some((r: any) => r.outcome === 'accepted' && r.evidenceRef.startsWith(runPath + '/decisions/')));
  assert.ok(pending.every(id => registry.find((r: any) => r.entryId === id).outcome === 'pending'));
  // A manual sidecar edit during the review pause must not be swept into a
  // metadata-only approval or reuse the preceding source-revision result.
  const sidecarPath = join(scratch, 'research/publication/canonical-documents.yaml');
  const sidecar = readFileSync(sidecarPath);
  writeFileSync(sidecarPath, sidecar.toString() + '\n');
  const stale = call('trial-stale-sidecar', ['--version','0.3.4','--accept-reviewed','DOC-WORLD','--reviewer','structural test fixture','--note','Synthetic fixture comparison']);
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /Registered sidecar changed/);
  writeFileSync(sidecarPath, sidecar);
  const resumed = call('trial-resume', ['--version','0.3.4','--accept-reviewed',pending.join(','),'--reviewer','structural test fixture','--note','Synthetic trial only: the added sentence is a temporary automation marker; scientific prose and evidence statuses otherwise retained. No production approval.']);
  assert.equal(resumed.status, 0, resumed.stderr);
  const final = JSON.parse(readFileSync(join(scratch, runPath, 'run.json'), 'utf8'));
  assert.equal(final.phase, 'checked');
  assert.equal(final.checks.filter((c: any) => c.name === 'source-revision').length, 1);
  assert.equal(final.checks.filter((c: any) => c.name === 'target-build').length, 1);
  assert.ok(final.checks.every((c: any) => c.exitCode === 0));
  assert.equal(sha256(readFileSync(join(scratch, run.prior, source))), sha256(oldRaw));
  const fresh = readFileSync(join(scratch, source), 'utf8');
  assert.match(fresh, /^# RRG v0\.3\.4/);
  assert.match(fresh, /\*\*automation trial edition ·/);
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{cwd:scratch,encoding:'utf8'}).stdout.trim(), head);
  const release = JSON.parse(readFileSync(join(scratch, 'research/publication/release.json'), 'utf8'));
  assert.equal(release.releaseId, 'trial-v034');
  assert.ok(existsSync(join(scratch, runPath, 'previous-release.json')));
  const artifact = JSON.parse(readFileSync(join(scratch, runPath, 'checks/subpath-artifact.json'), 'utf8'));
  assert.equal(artifact.status, 'PASS');
  const buildInfo = JSON.parse(readFileSync(join(scratch, 'dist/edition-v0.3.4-target/build-info.json'), 'utf8'));
  assert.equal(buildInfo.deployEligible, false);
  assert.equal(buildInfo.config.basePath, '/rrg_theory/');
  writeFileSync(evidence + '/trial.json', JSON.stringify({ status: 'PASS', scratch, head, sourceEdit: 'One synthetic sentence; discarded production intent', pendingCount: pending.length, checks: final.checks, runPath, artifactFiles: artifact.files.length, noCommitPushDeploy: true }, null, 2) + '\n');
});
