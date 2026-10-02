import {mkdtempSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {auditOutput} from '../../../../scripts/audit-output.js';
import assert from 'node:assert/strict';
const folder='docs/evidence/m1/acceptance-quality-recheck';
const after=process.argv.includes('--after');
const results=[];
for(const [name,file,mutate] of [
 ['false-social-description','index.html',(s:string)=>s.replace(/(<meta property="og:description" content=")[^"]*/, '$1All four forces independently proved')],
 ['false-visible-description','claims/UT-E01/index.html',(s:string)=>s.replace(/(<p class="article-lede">)[\s\S]*?(<\/p>)/,'$1All four forces independently proved$2')],
 ['remote-srcset','index.html',(s:string)=>s.replace('</body>','<img src="/favicon.svg" srcset="https://remote.invalid/tracker.png 2x" alt="Control"></body>')],
 ['remote-media','index.html',(s:string)=>s.replace('</body>','<video src="https://remote.invalid/tracker.mp4" poster="https://remote.invalid/tracker.png"></video></body>')],
 ['remote-style-import','_astro/control.css',()=> '@import "https://remote.invalid/tracker.css";'],
 ['remote-inline-style','index.html',(s:string)=>s.replace('</body>','<p style="background-image:url(https://remote.invalid/tracker.png)">Control</p></body>')],
 ['unsafe-refresh','index.html',(s:string)=>s.replace('</head>','<meta http-equiv="refresh" content="0;url=https://remote.invalid/"></head>')]
] as [string,string,(s:string)=>string][]) {
 const root=mkdtempSync(join(tmpdir(),'unity-quality-probe-'));
 try {
  cpSync(after?'dist/m1-acceptance-quality-recheck/preview-root':'dist/m1-separate-requalification-review/preview-root',root,{recursive:true});
  assert.equal(auditOutput(root).status,'PASS');
  const original=file.endsWith('control.css')?'':readFileSync(join(root,file),'utf8'),changed=mutate(original);
  if(original===changed)throw new Error(`Probe did not mutate ${name}`);
  writeFileSync(join(root,file),changed);
  try {const audit=auditOutput(root);results.push({name,outcome:'ADMITTED',artifactSha256:audit.artifactSha256});}
  catch(error:any) {results.push({name,outcome:'REFUSED',code:error.code??error.message});}
 } finally {rmSync(root,{recursive:true,force:true});}
}
if(after) {assert.equal(results.length,7);assert.ok(results.every(r=>r.outcome==='REFUSED' && !['STALE_BUILD_INPUTS','STALE_SOURCE_IDENTITY'].includes((r as any).code)));}
writeFileSync(`${folder}/${after?'post':'pre'}-repair-probes.json`,JSON.stringify({purpose:'Isolated reached production output-audit probes; no real artifact or source changed',results},null,2)+'\n');
console.log(JSON.stringify(results));
