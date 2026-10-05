import { workspaceIdentity,publicationAssets } from '../src/lib/publication-assets.js';
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { args } from './args.js';
import { buildMode, loadSiteConfig } from '../src/lib/site-config.js';
import { publicationFor, assertBuildAllowed } from '../src/lib/publication.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { buildInputs, syntheticRoutes } from '../src/lib/build-identity.js';
import { indexSearch } from './index-search.js';

const options = args(['mode', 'config', 'output']);
const mode = buildMode(options.mode);
const configPath = resolve(options.config ?? 'config/site.json');
const config = loadSiteConfig(configPath);
const publication = publicationFor(mode,config);
const source = publication.admission;
assertBuildAllowed(mode, config, source);
const workspace=workspaceIdentity();
if(mode==='release' && (workspace.workspaceDirty || !workspace.commitDescribesInputs || workspace.sourceCommit!==process.env.GITHUB_SHA))throw new Error('DEPLOYMENT_ARTIFACT_IDENTITY_MISMATCH: clean exact-run release required');
const output = resolve(options.output ?? `dist/${mode}-${config.basePath === '/' ? 'root' : 'subpath'}`);
if (!output.startsWith(resolve('dist') + '/') || output === resolve('dist')) throw new Error('Output must be an isolated child directory under dist/');
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'inherit', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', UNITY_BUILD_MODE: mode, UNITY_SITE_CONFIG: configPath, UNITY_OUTPUT_DIR: output }
});
if (result.status !== 0) process.exit(result.status ?? 1);
const search=await indexSearch(output,publication,config.basePath);
const buildInfo = {
  ...workspaceIdentity(),releaseMetadata:publicationAssets(publication,config).identity,
  schema: 'unity-build-info/1', builtAt: new Date().toISOString(), mode,
  deployEligible: mode==='release', corpusScope: mode==='preview'?'private-editorial-preview':mode==='release'?'current':'reviewed-current-qualification',
  currentSourceQualified: source.currentSourceQualified,
  sourceIntake: source,
  syntheticRoutes:mode==='release'?[]:syntheticRoutes, searchManifestSha256:sha256(stableJSON(search)),
  routes: publication.manifest.routes,
  publicationManifest: publication.manifest, publicationManifestSha256: publication.manifestSha256,
  config, configSha256: sha256(stableJSON(config)),
  ...buildInputs(),
  node: process.version, packageVersion: JSON.parse(readFileSync('package.json', 'utf8')).version
};
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'build-info.json'), JSON.stringify(buildInfo, null, 2) + '\n');
if(mode==='release')writeFileSync(join(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${config.origin}${config.basePath}sitemap.xml\n`);
console.log(`${mode} artifact: ${output}; deployEligible=${mode==='release'}`);
