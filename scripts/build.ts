import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { args } from './args.js';
import { buildMode, loadSiteConfig } from '../src/lib/site-config.js';
import { publicationFor, assertBuildAllowed } from '../src/lib/publication.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { buildInputs, syntheticRoutes } from '../src/lib/build-identity.js';

const options = args(['mode', 'config', 'output']);
const mode = buildMode(options.mode);
const configPath = resolve(options.config ?? 'config/site.json');
const config = loadSiteConfig(configPath);
const publication = publicationFor(mode,config);
const source = publication.corpus.admission;
assertBuildAllowed(mode, config, source);
const output = resolve(options.output ?? `dist/${mode}-${config.basePath === '/' ? 'root' : 'subpath'}`);
if (!output.startsWith(resolve('dist') + '/') || output === resolve('dist')) throw new Error('Output must be an isolated child directory under dist/');
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', UNITY_BUILD_MODE: mode, UNITY_SITE_CONFIG: configPath, UNITY_OUTPUT_DIR: output }
});
if (result.status !== 0) process.exit(result.status ?? 1);
const buildInfo = {
  schema: 'unity-build-info/1', builtAt: new Date().toISOString(), mode,
  deployEligible: false, corpusScope: mode==='preview'?'private-editorial-preview':'reviewed-current-qualification',
  currentSourceQualified: source.currentSourceQualified,
  sourceIntake: source,
  syntheticRoutes,
  routes: publication.manifest.routes,
  publicationManifest: publication.manifest, publicationManifestSha256: publication.manifestSha256,
  config, configSha256: sha256(stableJSON(config)),
  ...buildInputs(),
  node: process.version, packageVersion: JSON.parse(readFileSync('package.json', 'utf8')).version
};
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'build-info.json'), JSON.stringify(buildInfo, null, 2) + '\n');
console.log(`Private ${mode} artifact: ${output}; deployEligible=false`);
