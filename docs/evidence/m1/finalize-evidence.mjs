import { readFileSync,writeFileSync } from 'node:fs';
import { filesIn } from '../../../src/lib/source-admission.ts';
import { sha256,stableJSON } from '../../../src/lib/identity.ts';
import { activePublication } from '../../../src/lib/publication.ts';
import { buildInputs } from '../../../src/lib/build-identity.ts';
const protectedFiles=JSON.parse(readFileSync('docs/evidence/m1/preservation-before.json','utf8'));
const mismatches=protectedFiles.filter(file=>sha256(readFileSync(file.path))!==file.sha256);
if(mismatches.length) throw new Error('Protected byte changes: '+mismatches.map(f=>f.path));
const artifacts=['root','subpath'].map(suffix=>{
 const dir=`dist/m1/qualification-${suffix}`;const prior=JSON.parse(readFileSync(`docs/evidence/m1/${suffix}-artifact.json`,'utf8'));
 const files=filesIn(dir).map(path=>{const raw=readFileSync(`${dir}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 const artifactSha256=sha256(stableJSON(files));if(artifactSha256!==prior.artifactSha256)throw new Error('Artifact changed after browser tests');
 const info=JSON.parse(readFileSync(`${dir}/build-info.json`,'utf8'));
 return {directory:dir,files:files.length,artifactSha256,unchangedAfterBrowser:true,publicationManifestSha256:info.publicationManifestSha256,inputsSha256:info.inputsSha256,configSha256:info.configSha256,lockfileSha256:info.lockfileSha256};
});
const taskPaths=['package.json','package-lock.json','astro.config.mjs','tsconfig.json','playwright.config.ts','config/research-source.json','README.md','docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md',...['src','scripts','research/publication','tests'].flatMap(folder=>filesIn(folder).filter(p=>!p.split('/').includes('__pycache__')).map(path=>`${folder}/${path}`))].sort();
writeFileSync('docs/evidence/m1/task-files.json',JSON.stringify({noGitHead:true,date:new Date().toISOString(),files:taskPaths.map(path=>({path,sha256:sha256(readFileSync(path))}))},null,2)+'\n');
const report={date:new Date().toISOString(),status:'PASS',protectedFiles:protectedFiles.length,protectedMismatches:mismatches,artifacts,productionInputs:buildInputs(),sourceBytesChanged:false,currentSourceQualified:false,reviewReceipts:activePublication().corpus.reviews.length};
writeFileSync('docs/evidence/m1/final-integrity.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
