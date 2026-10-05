import { z } from 'astro/zod';
import { sha256, stableJSON } from './identity.js';
import { safePath, canonicalURL } from './urls.js';
import type { SiteConfig } from './site-config.js';
import { ContractError } from './errors.js';

const hash=z.string().regex(/^[a-f0-9]{64}$/);
const inventorySchema=z.object({status:z.literal('PASS'),mode:z.literal('release'),basePath:z.string(),deployEligible:z.literal(true),files:z.array(z.object({path:z.string(),bytes:z.number().int().nonnegative(),sha256:hash}).strict()).min(1),artifactSha256:hash}).strict();
const sealSchema=z.object({sourceCommit:z.string().regex(/^[a-f0-9]{40}$/),artifactSha256:hash,inputsSha256:hash,documentManifestSha256:hash,runId:z.string().regex(/^\d+$/),manifestSha256:hash}).strict();
export type LiveRequest=(url:string)=>Promise<Response>;
const fail=(code:string,message:string):never=>{throw new ContractError(code,message);};

// Receipts come from the existing shared auditor/sealer, never from a live
// page's self-description. This read-only check cannot authorize publication.
export async function verifyLiveArtifact(rawArtifact:unknown,rawSeal:unknown,config:SiteConfig,request:LiveRequest=url=>fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000),cache:'no-store'})) {
  if(!config.publicAuthorization || !config.repository || new URL(config.origin).protocol!=='https:' || new URL(config.origin).hostname.endsWith('.invalid'))fail('PUBLIC_TARGET_REQUIRED','Use the actual owner-authorized HTTPS target');
  const artifact=inventorySchema.parse(rawArtifact),seal=sealSchema.parse(rawSeal);
  const digest=sha256(stableJSON(artifact.files));
  if(artifact.basePath!==config.basePath || digest!==artifact.artifactSha256 || digest!==seal.artifactSha256 || digest!==seal.manifestSha256)fail('LIVE_RELEASE_RECEIPT_MISMATCH','Audit inventory, seal and base must agree');
  const paths=new Set<string>();
  for(const file of artifact.files) {
    if(file.path.startsWith('/') || safePath('/'+file.path)!=='/'+file.path || paths.has(file.path))fail('LIVE_RELEASE_RECEIPT_MISMATCH','Unique normalized relative file paths required');
    paths.add(file.path);
  }
  for(const path of ['build-info.json','index.html','math/index.html','references/index.html','search/index.html','404.html','rss.xml','sitemap.xml','search-manifest.json','downloads/SHA256SUMS'])if(!paths.has(path))fail('LIVE_RELEASE_RECEIPT_MISMATCH',`Missing required output: ${path}`);
  if(!artifact.files.some(f=>/^articles\/.+\/index.html$/.test(f.path)) || !artifact.files.some(f=>/^claims\/.+\/index.html$/.test(f.path)) || !artifact.files.some(f=>/^downloads\/.+\.zip$/.test(f.path)))fail('LIVE_RELEASE_RECEIPT_MISMATCH','Selected article, claim and publication bundle required');
  const get=async(path:string,expectedStatus=200)=>{
    const url=canonicalURL('/'+path,config),response=await request(url);
    if(response.status!==expectedStatus || response.redirected || response.url && response.url!==url)fail('LIVE_HTTP_FAILURE',`${url}: expected ${expectedStatus}, received ${response.status}; redirects are not qualified`);
    return Buffer.from(await response.arrayBuffer());
  };
  const checked:{path:string;bytes:number;sha256:string}[]=[];
  let info:any;
  // Inspect bound build-info before fetching the remainder of the inventory.
  const first=artifact.files.find(f=>f.path==='build-info.json')!;
  for(const file of [first,...artifact.files.filter(f=>f!==first)]) {
    const route=file.path==='index.html'?'':file.path.endsWith('/index.html')?file.path.slice(0,-10):file.path;
    const bytes=await get(route);
    if(bytes.length!==file.bytes || sha256(bytes)!==file.sha256)fail('LIVE_ARTIFACT_MISMATCH',file.path);
    if(file===first) {
      info=JSON.parse(bytes.toString());
      if(info.schema!=='unity-build-info/1' || info.mode!=='release' || info.deployEligible!==true || info.currentSourceQualified!==true || info.workspaceDirty!==false || info.commitDescribesInputs!==true || info.corpusScope!=='current' || !Array.isArray(info.syntheticRoutes) || info.syntheticRoutes.length || info.sourceCommit!==seal.sourceCommit || info.inputsSha256!==seal.inputsSha256 || info.publicationManifestSha256!==seal.documentManifestSha256 || stableJSON(info.config)!==stableJSON(config) || info.configSha256!==sha256(stableJSON(config)))fail('LIVE_RELEASE_IDENTITY_MISMATCH','Served build must describe the exact clean qualified release');
    }
    checked.push(file);
  }
  if(stableJSON(JSON.parse((await get('deployment-manifest.json')).toString()))!==stableJSON(seal))fail('LIVE_RELEASE_IDENTITY_MISMATCH','Served seal differs from retained same-run seal');
  const missingPath=`m7-not-found-${digest.slice(0,12)}/`,missing=await get(missingPath,404);
  if(sha256(missing)!==artifact.files.find(f=>f.path==='404.html')!.sha256)fail('LIVE_404_MISMATCH','Unknown route must serve the qualified 404 bytes with status 404');
  return {status:'PASS' as const,publicURL:canonicalURL('/',config),sourceCommit:seal.sourceCommit,runId:seal.runId,artifactSha256:digest,inputsSha256:seal.inputsSha256,documentManifestSha256:seal.documentManifestSha256,files:checked.length,unknownRoute:'404_WITH_QUALIFIED_BODY',buildInfo:info};
}
