import { resolve } from 'node:path';
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
const configurations = options.config ? [options.config] : ['tests/fixtures/site-root.json', 'tests/fixtures/site-subpath.json', 'config/site.json'];
const suffixFor = (path: string) => {
  const base = loadSiteConfig(path).basePath;
  return base === '/' ? 'root' : base === '/unity-theory/' ? 'subpath' : 'target';
};
const commands = [
  ['run', 'check'],
  ['run', 'check:sources', '--', '--scope', 'history'],
  ['run', 'check:sources', '--', '--scope', 'current'],
  ['run', 'check:content'],
  ['run', 'check:publication'],
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
    return [['run','test:e2e','--','--output',output],['run','check:m6','--','--dir',output,'--evidence-dir',`${options['evidence-dir']??'docs/evidence/m6/implementation'}/${suffix}`,'--lighthouse',suffix==='root'?'true':'false']];
  })
];
const receipts: { command: string; exitCode: number | null }[] = [];
for (const command of commands) {
  console.log(`\nRunning npm ${command.join(' ')}`);
  // Contract mutations intentionally use the legacy regression base. Give an
  // explicit target-only run its own independently built contract fixture.
  const subpathConfig=configurations.find(path=>loadSiteConfig(path).basePath==='/unity-theory/');
  const contractOutput=subpathConfig?`${options['output-root']??'dist'}/${mode}-${suffixFor(subpathConfig)}`:undefined;
  const artifactOutput=command[1]==='test:e2e'?command[command.indexOf('--output')+1]:command[1]==='audit:output'?command[command.indexOf('--dir')+1]:undefined;
  const artifactSuffix=artifactOutput?.split('/').pop()?.replace(`${mode}-`,'');
  const result = spawnSync('npm', command, { stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...(contractOutput?{UNITY_CONTRACT_OUTPUT:resolve(contractOutput)}:{}), UNITY_EVIDENCE_DIR: `${options['evidence-dir'] ?? 'docs/evidence/m6/implementation'}${artifactSuffix?'/'+artifactSuffix:''}` } });
  receipts.push({ command: 'npm ' + command.join(' '), exitCode: result.status });
  if (result.status !== 0) break;
}
const evidence = options['evidence-dir'] ?? 'docs/evidence/m6/implementation';
mkdirSync(evidence, { recursive: true });
const complete = receipts.length === commands.length && receipts.every(r => r.exitCode === 0);
writeFileSync(`${evidence}/verification.json`, JSON.stringify({ date: new Date().toISOString(), mode, status: complete ? 'PASS' : 'FAIL', receipts, notRun: commands.slice(receipts.length).map(c => 'npm ' + c.join(' ')), scientificContentAccepted: false, humanComprehension: 'NOT_TESTED', publicDeployment: 'NOT_RUN' }, null, 2) + '\n');
process.exitCode = complete ? 0 : 1;
