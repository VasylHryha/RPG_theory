import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyLiveArtifact } from '../../src/lib/live-release.js';
import { sha256, stableJSON } from '../../src/lib/identity.js';

// These invented bytes test transport/identity mechanics only. They are never
// written into publication sources, review registries, policy or release output.
function fixture(basePath:string) {
  const config={origin:'https://example.org',basePath,repository:{owner:'example',name:'synthetic'},publicAuthorization:true};
  const sourceCommit='a'.repeat(40),inputsSha256='b'.repeat(64),publicationManifestSha256='c'.repeat(64);
  const info={schema:'unity-build-info/1',mode:'release',deployEligible:true,currentSourceQualified:true,workspaceDirty:false,commitDescribesInputs:true,corpusScope:'current',syntheticRoutes:[],sourceCommit,inputsSha256,publicationManifestSha256,config,configSha256:sha256(stableJSON(config))};
  const bytes=new Map(['index.html','math/index.html','references/index.html','search/index.html','404.html','rss.xml','sitemap.xml','search-manifest.json','downloads/SHA256SUMS','downloads/synthetic.zip','articles/synthetic/index.html','claims/UT-C999/index.html'].map(p=>[p,Buffer.from('Synthetic mechanics only: '+p)]));
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

test('sealed live verification detects byte drift against the retained deployment inventory', async () => {
  const f = fixture('/rrg_theory/');
  assert.equal((await verifyLiveArtifact(f.artifact, f.seal, f.config, f.request)).status, 'PASS');
  f.bytes.set('index.html', Buffer.from('Drifted bytes'));
  await assert.rejects(() => verifyLiveArtifact(f.artifact, f.seal, f.config, f.request), /LIVE_ARTIFACT_MISMATCH/);
});
