import { readFileSync,writeFileSync,existsSync } from 'node:fs';
import { filesIn } from '../../../../src/lib/source-admission.ts';
import { sha256,stableJSON } from '../../../../src/lib/identity.ts';
import { activePublication } from '../../../../src/lib/publication.ts';
import { buildInputs } from '../../../../src/lib/build-identity.ts';
const evidence='docs/evidence/m1/recheck';
const predecessor=JSON.parse(readFileSync('docs/evidence/m1/preservation-before.json','utf8'));
const baseline=JSON.parse(readFileSync(`${evidence}/preservation-before.json`,'utf8'));
const all=new Map([...predecessor,...baseline].map(file=>[file.path,file]));
const allowed=['research/publication/records.yaml','research/publication/canonical-documents.yaml'];
const preservedPriorEditions=[];
const mismatches=[];
for(const file of all.values()) {
 if(sha256(readFileSync(file.path))===file.sha256) continue;
 if(allowed.includes(file.path)) {
  const snapshot=`${evidence}/prior-publication/${file.path.slice('research/publication/'.length)}`;
  if(!existsSync(snapshot) || sha256(readFileSync(snapshot))!==file.sha256) throw new Error('Prior sidecar bytes missing: '+file.path);
  preservedPriorEditions.push({path:file.path,priorSnapshot:snapshot,priorSha256:file.sha256,currentSha256:sha256(readFileSync(file.path)),reason:'M1 task-owned semantic dependency correction; record revision advances, scientific source bytes unchanged.'});
 } else mismatches.push(file.path);
}
if(mismatches.length) throw new Error('Protected byte changes: '+mismatches.join(', '));
const artifacts=['root','subpath'].map(suffix=>{
 const dir=`dist/m1-recheck/preview-${suffix}`;
 const receipt=JSON.parse(readFileSync(`${evidence}/${suffix}-artifact.json`,'utf8'));
 const files=filesIn(dir).map(path=>{const raw=readFileSync(`${dir}/${path}`);return {path,bytes:raw.length,sha256:sha256(raw)};});
 const artifactSha256=sha256(stableJSON(files));if(artifactSha256!==receipt.artifactSha256) throw new Error('Artifact changed after checks: '+dir);
 const info=JSON.parse(readFileSync(`${dir}/build-info.json`,'utf8'));
 if(stableJSON(buildInputs())!==stableJSON({inputsSha256:info.inputsSha256,lockfileSha256:info.lockfileSha256,contentSha256:info.contentSha256})) throw new Error('Production identities changed after qualification');
 return {directory:dir,files:files.length,htmlPaths:files.filter(f=>f.path.endsWith('.html')).length,artifactSha256,unchangedAfterBrowserAndControls:true,publicationManifestSha256:info.publicationManifestSha256,inputsSha256:info.inputsSha256,configSha256:info.configSha256,lockfileSha256:info.lockfileSha256};
});
const selected=activePublication();
if(selected.corpus.reviews.length || selected.corpus.evidence.size || selected.corpus.admission.currentSourceQualified) throw new Error('Scientific approval/evidence unexpectedly introduced');
const taskPaths=['package.json','package-lock.json','astro.config.mjs','tsconfig.json','playwright.config.ts','config/research-source.json','README.md','docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md',...['src','scripts','research/publication','tests'].flatMap(folder=>filesIn(folder).filter(path=>!path.split('/').includes('__pycache__')).map(path=>`${folder}/${path}`))].sort();
writeFileSync(`${evidence}/task-files.json`,JSON.stringify({noGitHead:true,date:new Date().toISOString(),files:taskPaths.map(path=>({path,sha256:sha256(readFileSync(path))}))},null,2)+'\n');
const verifiedLog=readFileSync(`${evidence}/verification-approved.log`,'utf8');
const contractTests=Number(verifiedLog.match(/ℹ pass (\d+)/)?.[1]);
const browserResults=[...verifiedLog.matchAll(/\b(\d+) passed \(/g)].map(match=>Number(match[1]));
if(contractTests!==56 || browserResults.length!==2 || browserResults.some(count=>count!==7)) throw new Error('Final verification counts do not match the completed batch');
const report={date:new Date().toISOString(),status:'PASS',baselineProtectedFiles:baseline.length,combinedProtectedFiles:all.size,unchangedProtectedFiles:all.size-preservedPriorEditions.length,protectedMismatches:mismatches,preservedPriorEditions,artifacts,productionInputs:buildInputs(),admission:selected.corpus.admission,sourceBytesChanged:false,reviewReceipts:selected.corpus.reviews.length,scientificExecutionReceipts:selected.corpus.evidence.size,engineeringChecks:{contractTests,browserTests:browserResults.reduce((sum,count)=>sum+count,0)},humanComprehension:'NOT_TESTED',publicActions:'NOT_RUN'};
writeFileSync(`${evidence}/final-integrity.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
