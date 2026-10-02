import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {auditOutput} from '../../../../scripts/audit-output.js';
const folder='docs/evidence/m1/audit-normalization-recheck',after=process.argv.includes('--after');
const directory=after?'dist/m1-audit-normalization-recheck/preview-root':'dist/m1-qf1011-separate-review/preview-root';
const font=readFileSync('node_modules/katex/dist/fonts/KaTeX_SansSerif-Regular.woff2').toString('base64');
const forged=font.slice(0,20)+'/*forged*/'+font.slice(20);
const cases:[string,string,string][]=[
 ['svg-stylesheet-pi','favicon.svg','<?xml-stylesheet type="text/css" href="https://remote.invalid/theme.css"?><svg xmlns="http://www.w3.org/2000/svg"><rect width="30" height="30"/></svg>'],
 ['forged-font-comments','_astro/control.css',`@font-face{font-family:Forged;src:url("data:font/woff2;base64,${forged}")}body{font-family:Forged}`],
 ['quoted-url-comments','_astro/control.css','p{background:url("../favicon.svg/*not-a-comment*/")}'],
 ['escaped-quote-url','_astro/control.css',String.raw`p{background:url("../favicon.svg\")")}`],
 ['inert-css-string','_astro/control.css','p:after{content:"url(https://remote.invalid/inert.png)"}']
];
const results=cases.map(([name,file,content])=>{
 const copy=mkdtempSync(join(tmpdir(),'unity-normalization-'));cpSync(directory,copy,{recursive:true});
 try{
 assert.equal(auditOutput(copy).status,'PASS');writeFileSync(join(copy,file),content);
 let outcome='ADMITTED',code:string|undefined;try{auditOutput(copy);}catch(e){outcome='REFUSED';code=(e as any).code;}
 if(after){assert.equal(outcome,name==='inert-css-string'?'ADMITTED':'REFUSED');assert.equal(code,name==='svg-stylesheet-pi'?'UNSAFE_SVG':name==='forged-font-comments'?'UNSAFE_OUTPUT_URL':name==='inert-css-string'?undefined:'BROKEN_OUTPUT_LINK');}
 return {name,file,untouchedCopy:'PASS',outcome,code};
 }finally{rmSync(copy,{recursive:true,force:true});}
});
writeFileSync(`${folder}/${after?'post':'pre'}-repair-probes.json`,JSON.stringify({directory,results},null,2)+'\n');console.log(JSON.stringify(results));
