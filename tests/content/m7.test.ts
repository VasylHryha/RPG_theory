import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { verifyLiveArtifact } from '../../src/lib/live-release.js';
import { sha256,stableJSON } from '../../src/lib/identity.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { validateContributionWorkflow } from '../../src/lib/publication-screen.js';

// These invented bytes test transport/identity mechanics only. They are never
// written into publication sources, review registries, policy or release output.
function fixture(basePath:string) {
  const config={origin:'https://example.org',basePath,repository:{owner:'example',name:'synthetic'},publicAuthorization:true};
  const sourceCommit='a'.repeat(40),inputsSha256='b'.repeat(64),publicationManifestSha256='c'.repeat(64);
  const info={schema:'unity-build-info/1',mode:'release',deployEligible:true,currentSourceQualified:true,workspaceDirty:false,commitDescribesInputs:true,corpusScope:'current',syntheticRoutes:[],sourceCommit,inputsSha256,publicationManifestSha256,config,configSha256:sha256(stableJSON(config))};
  const bytes=new Map(['index.html','math/index.html','references/index.html','search/index.html','404.html','rss.xml','sitemap.xml','search-manifest.json','downloads/SHA256SUMS','downloads/synthetic.zip','articles/synthetic/index.html','claims/UT-C999/index.html','_astro/synthetic.css'].map(p=>[p,Buffer.from('Synthetic mechanics only: '+p)]));
  bytes.set('build-info.json',Buffer.from(JSON.stringify(info)));
  const files=[...bytes].sort(([a],[b])=>a.localeCompare(b)).map(([path,b])=>({path,bytes:b.length,sha256:sha256(b)})),artifactSha256=sha256(stableJSON(files));
  const artifact={status:'PASS',mode:'release',basePath,deployEligible:true,files,artifactSha256};
  const seal={sourceCommit,artifactSha256,inputsSha256,documentManifestSha256:publicationManifestSha256,runId:'123456',manifestSha256:artifactSha256};
  bytes.set('deployment-manifest.json',Buffer.from(JSON.stringify(seal)));
  const calls:string[]=[];
  const request=async(url:string)=>{
    assert.ok(url.startsWith(config.origin+basePath));calls.push(url);
    let path=new URL(url).pathname.slice(basePath.length);
    if(!path)path='index.html';else if(path.endsWith('/'))path+='index.html';
    const body=bytes.get(path),status=body?200:404;
    return new Response(body??bytes.get('404.html')!,{status});
  };
  return {config,info,bytes,artifact,seal,calls,request};
}

test('M7 live transport matches every qualified file, Git/input/seal identity and true 404 at both bases',async()=>{
  for(const base of ['/','/unity-theory/']) {
    const f=fixture(base),result=await verifyLiveArtifact(f.artifact,f.seal,f.config,f.request);
    assert.equal(result.status,'PASS');assert.equal(result.files,f.artifact.files.length);assert.equal(result.sourceCommit,f.seal.sourceCommit);assert.equal(result.runId,'123456');assert.equal(result.unknownRoute,'404_WITH_QUALIFIED_BODY');
    assert.ok(f.calls.some(url=>url.endsWith(base+'articles/synthetic/')));assert.ok(f.calls.some(url=>url.endsWith(base+'claims/UT-C999/')));
  }
});
test('M7 live verification refuses actual private target and private/forged receipts before network access',async()=>{
  const f=fixture('/');
  await assert.rejects(()=>verifyLiveArtifact(f.artifact,f.seal,loadSiteConfig(),f.request),/PUBLIC_TARGET_REQUIRED/);
  await assert.rejects(()=>verifyLiveArtifact({...f.artifact,mode:'preview',deployEligible:false},f.seal,f.config,f.request));
  await assert.rejects(()=>verifyLiveArtifact(f.artifact,{...f.seal,manifestSha256:'0'.repeat(64)},f.config,f.request),/LIVE_RELEASE_RECEIPT_MISMATCH/);
  assert.equal(f.calls.length,0);
});
test('M7 live byte drift, redirects, mismatched same-run seal and soft 404 all fail',async()=>{
  for(const base of ['/','/unity-theory/']) {
    let f=fixture(base);f.bytes.set('_astro/synthetic.css',Buffer.from('changed'));
    await assert.rejects(()=>verifyLiveArtifact(f.artifact,f.seal,f.config,f.request),/LIVE_ARTIFACT_MISMATCH/);
    f=fixture(base);await assert.rejects(()=>verifyLiveArtifact(f.artifact,f.seal,f.config,async()=>new Response(null,{status:301})),/LIVE_HTTP_FAILURE/);
    f=fixture(base);f.bytes.set('deployment-manifest.json',Buffer.from(JSON.stringify({...f.seal,runId:'999'})));
    await assert.rejects(()=>verifyLiveArtifact(f.artifact,f.seal,f.config,f.request),/LIVE_RELEASE_IDENTITY_MISMATCH/);
    f=fixture(base);await assert.rejects(()=>verifyLiveArtifact(f.artifact,f.seal,f.config,async url=>url.includes('m7-not-found')?new Response(f.bytes.get('404.html')):f.request(url)),/LIVE_HTTP_FAILURE/);
  }
});
test('M7 refuses bound-but-dirty or fixture build identities rather than qualifying their self-description',async()=>{
  for(const change of [{workspaceDirty:true},{sourceCommit:'d'.repeat(40)},{syntheticRoutes:['/fixtures/math/']},{currentSourceQualified:false}]) {
    const f=fixture('/'),body=Buffer.from(JSON.stringify({...f.info,...change}));f.bytes.set('build-info.json',body);
    const file=f.artifact.files.find(f=>f.path==='build-info.json')!;file.bytes=body.length;file.sha256=sha256(body);
    const digest=sha256(stableJSON(f.artifact.files));f.artifact.artifactSha256=digest;f.seal.artifactSha256=digest;f.seal.manifestSha256=digest;
    await assert.rejects(()=>verifyLiveArtifact(f.artifact,f.seal,f.config,f.request),/LIVE_RELEASE_IDENTITY_MISMATCH/);
  }
});
test('M7 prepare receipts use the narrow ignored evidence directory; issued tracked evidence still makes Git dirty',()=>{
  assert.equal(validateContributionWorkflow().status,'PASS');
  const workflow=parse(readFileSync('.github/workflows/site.yml','utf8'));
  for(const command of ['check-publication.ts','seal-deployment.ts'])assert.ok(workflow.jobs.prepare.steps.some((s:any)=>s.run?.includes(command) && s.run.includes('--evidence-dir docs/evidence/m7/runtime')));
  const root=mkdtempSync(join(tmpdir(),'unity-m7-evidence-'));
  try {
    const git=(args:string[])=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;};
    git(['init']);writeFileSync(join(root,'.gitignore'),readFileSync('.gitignore'));mkdirSync(join(root,'docs/evidence/issued'),{recursive:true});writeFileSync(join(root,'docs/evidence/issued/receipt.json'),'original');git(['add','.gitignore','docs/evidence/issued/receipt.json']);
    const before=git(['status','--porcelain']);mkdirSync(join(root,'docs/evidence/m7/runtime'),{recursive:true});writeFileSync(join(root,'docs/evidence/m7/runtime/publication-readiness.json'),'generated');
    assert.equal(git(['status','--porcelain']),before);assert.match(git(['check-ignore','docs/evidence/m7/runtime/publication-readiness.json']),/runtime/);
    writeFileSync(join(root,'docs/evidence/issued/receipt.json'),'changed');assert.notEqual(git(['status','--porcelain']),before);
  }finally{rmSync(root,{recursive:true,force:true});}
});
