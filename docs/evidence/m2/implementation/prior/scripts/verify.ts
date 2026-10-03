import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { args } from './args.js';
import { buildMode, loadSiteConfig } from '../src/lib/site-config.js';
import { assertBuildAllowed, publicationFor } from '../src/lib/publication.js';

const options = args(['mode', 'config', 'output-root', 'evidence-dir']);
const mode = buildMode(options.mode ?? 'preview');
if (mode === 'release') {
  const config=loadSiteConfig(options.config);
  assertBuildAllowed(mode,config,publicationFor(mode,config).admission);
}
const configurations = options.config ? [options.config] : ['config/site.json', 'tests/fixtures/site-subpath.json'];
const commands = [
  ['run', 'check'],
  ['run', 'check:sources', '--', '--scope', 'history'],
  ['run', 'check:sources', '--', '--scope', 'current'],
  ['run', 'check:content'],
  ['run', 'test:content'],
  ...configurations.flatMap(config => {
    const suffix = loadSiteConfig(config).basePath === '/' ? 'root' : 'subpath';
    const output = `${options['output-root'] ?? 'dist'}/${mode}-${suffix}`;
    return [
      ['run', 'build', '--', '--mode', mode, '--config', config, '--output', output],
      ['run', 'audit:output', '--', '--dir', output],
      ['run', 'test:e2e', '--', '--output', output]
    ];
  })
];
const receipts: { command: string; exitCode: number | null }[] = [];
for (const command of commands) {
  console.log(`\nRunning npm ${command.join(' ')}`);
  const result = spawnSync('npm', command, { stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', UNITY_EVIDENCE_DIR: options['evidence-dir'] ?? 'docs/evidence/m1' } });
  receipts.push({ command: 'npm ' + command.join(' '), exitCode: result.status });
  if (result.status !== 0) break;
}
const evidence = options['evidence-dir'] ?? 'docs/evidence/m1';
mkdirSync(evidence, { recursive: true });
const complete = receipts.length === commands.length && receipts.every(r => r.exitCode === 0);
writeFileSync(`${evidence}/verification.json`, JSON.stringify({ date: new Date().toISOString(), mode, status: complete ? 'PASS' : 'FAIL', receipts, notRun: commands.slice(receipts.length).map(c => 'npm ' + c.join(' ')), scientificContentAccepted: false, humanComprehension: 'NOT_TESTED', publicDeployment: 'NOT_RUN' }, null, 2) + '\n');
process.exitCode = complete ? 0 : 1;
