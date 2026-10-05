import { readFileSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { args } from './args.js';
import { buildInputs } from '../src/lib/build-identity.js';
import { publicationCredit,publicationPolicy,assertDeploymentAllowed } from '../src/lib/publication-policy.js';
import { auditOutput } from './audit-output.js';
import { sha256,stableJSON } from '../src/lib/identity.js';
import { ContractError } from '../src/lib/errors.js';
const options=args(['dir']);if(!options.dir)throw new Error('--dir required');
const dir=resolve(options.dir),info=JSON.parse(readFileSync(resolve(dir,'build-info.json'),'utf8'));
const context={event:process.env.GITHUB_EVENT_NAME ?? '',ref:process.env.GITHUB_REF ?? '',repository:process.env.GITHUB_REPOSITORY ?? '',sha:process.env.GITHUB_SHA ?? ''};
assertDeploymentAllowed(publicationPolicy(),publicationCredit(),info.config,context,info.currentSourceQualified);
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(info.mode!=='release' || info.deployEligible!==true || info.workspaceDirty || !info.commitDescribesInputs || info.sourceCommit!==head || head!==context.sha || info.inputsSha256!==buildInputs().inputsSha256)throw new ContractError('DEPLOYMENT_ARTIFACT_IDENTITY_MISMATCH','Clean exact-run qualified release required');
// Shared auditing repeats the publication gates and verifies generated search,
// metadata, selection and exports before any artifact can reach the upload step.
const artifact=auditOutput(dir);
if(!Boolean(artifact.deployEligible))throw new ContractError('M6_RELEASE_QUALIFICATION_REQUIRED','A private artifact cannot be uploaded for deployment');
writeFileSync(resolve(dir,'deployment-manifest.json'),JSON.stringify({sourceCommit:head,artifactSha256:artifact.artifactSha256,inputsSha256:info.inputsSha256,documentManifestSha256:info.publicationManifestSha256,runId:process.env.GITHUB_RUN_ID,manifestSha256:sha256(stableJSON(artifact.files))},null,2)+'\n');
