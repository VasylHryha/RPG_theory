import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { args } from './args.js';
import { buildMode, loadSiteConfig } from '../src/lib/site-config.js';
import { assertBuildAllowed, publicationFor } from '../src/lib/publication.js';

const options = args(['mode', 'config', 'output-root', 'evidence-dir', 'profile']);
const mode = buildMode(options.mode ?? 'preview');
const profile = options.profile ?? 'full';
if (!['push', 'routine', 'full'].includes(profile)) throw new Error('Unknown verification profile');
if (profile !== 'full' && mode !== 'preview') throw new Error('Routine verification is preview-only; qualification/release requires the full profile');
const routine = profile !== 'full';
const evidence = options['evidence-dir'] ?? (routine ? `docs/evidence/m7/runtime/${profile}` : 'docs/evidence/m6/implementation');
if (profile === 'push') {
  const started = Date.now();
  for (const path of ['package.json', 'package-lock.json', 'config/site.json', 'config/publication-policy.json']) {
    JSON.parse(readFileSync(path, 'utf8'));
  }
  const result = spawnSync('git', ['diff', '--check', 'HEAD'], { stdio: 'inherit' });
  const complete = result.status === 0;
  mkdirSync(evidence, { recursive: true });
  writeFileSync(`${evidence}/verification.json`, JSON.stringify({
    date: new Date().toISOString(), mode, profile, elapsedMs: Date.now() - started,
    status: complete ? 'PASS' : 'FAIL', checks: ['JSON syntax', 'Git whitespace'],
    qualificationSuiteComplete: false, sourceAudit: 'NOT_RUN',
    note: 'Reuse accepted evidence; shared build/output validators check the deployed selection.'
  }, null, 2) + '\n');
  console.log(complete ? 'PASS: JSON syntax and Git whitespace' : 'FAIL: Git whitespace');
  process.exit(complete ? 0 : 1);
}
if (mode === 'release') {
  const config=loadSiteConfig(options.config);
  assertBuildAllowed(mode,config,publicationFor(mode,config).admission);
}
const configurations = options.config ? [options.config] : ['tests/fixtures/site-root.json', 'config/site.json'];
const smoke = '@routine';
const suffixFor = (path: string) => {
  const base = loadSiteConfig(path).basePath;
  return base === '/' ? 'root' : base === '/unity-theory/' ? 'subpath' : 'target';
};
const commands = [
  ['run', 'check'],
  ...(!routine ? [['run', 'check:sources', '--', '--scope', 'history']] : []),
  ...configurations.flatMap(config => {
    const suffix = suffixFor(config);
    const output = `${options['output-root'] ?? 'dist'}/${mode}-${suffix}`;
    return [
      ['run', 'build', '--', '--mode', mode, '--config', config, '--output', output],
      ['run', 'audit:output', '--', '--dir', output]
    ];
  }),
  ['run', 'test:content'],
  ...configurations.flatMap(config=>{
    const suffix=suffixFor(config),output=`${options['output-root']??'dist'}/${mode}-${suffix}`;
    return [['run','test:e2e','--','--output',output,...(routine?['--grep',smoke]:[])]];
  })
];
const receipts: { command: string; exitCode: number | null; elapsedMs: number }[] = [];
const started = Date.now();
for (const command of commands) {
  console.log(`\nRunning npm ${command.join(' ')}`);
  // Reuse one of the selected outputs for the lean mutation controls. Private
  // previews are required: a selected qualification/release excludes fixtures.
  const contractConfig=configurations.find(path=>loadSiteConfig(path).basePath!=='/') ?? configurations[0];
  const contractOutput=mode==='preview'?`${options['output-root']??'dist'}/${mode}-${suffixFor(contractConfig)}`:undefined;
  const artifactOutput=command[1]==='test:e2e'?command[command.indexOf('--output')+1]:command[1]==='audit:output'?command[command.indexOf('--dir')+1]:undefined;
  const artifactSuffix=artifactOutput?.split('/').pop()?.replace(`${mode}-`,'');
  const commandStarted = Date.now();
  const result = spawnSync('npm', command, { stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...(contractOutput?{UNITY_CONTRACT_OUTPUT:resolve(contractOutput)}:{}), UNITY_EVIDENCE_DIR: `${evidence}${artifactSuffix?'/'+artifactSuffix:''}` } });
  receipts.push({ command: 'npm ' + command.join(' '), exitCode: result.status, elapsedMs: Date.now() - commandStarted });
  if (result.status !== 0) break;
}
mkdirSync(evidence, { recursive: true });
const complete = receipts.length === commands.length && receipts.every(r => r.exitCode === 0);
writeFileSync(`${evidence}/verification.json`, JSON.stringify({ date: new Date().toISOString(), mode, profile, elapsedMs: Date.now() - started, status: complete ? 'PASS' : 'FAIL', leanSuiteComplete: !routine && complete, qualificationSuiteComplete: false, omittedByProfile: [...(routine ? ['historical source regression', 'representative browser accessibility matrix'] : []), 'legacy /unity-theory/ fixture', 'M6 stress/cross-browser/performance/Lighthouse campaign'], receipts, notRun: commands.slice(receipts.length).map(c => 'npm ' + c.join(' ')), scientificContentAccepted: false, humanComprehension: 'NOT_TESTED', publicDeployment: 'NOT_RUN' }, null, 2) + '\n');
process.exitCode = complete ? 0 : 1;
