import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import * as pagefind from 'pagefind';
import { searchInputs, searchIdentity } from '../src/lib/search.js';
import { sha256 } from '../src/lib/identity.js';
import { ContractError } from '../src/lib/errors.js';
import type { Entry } from '../src/lib/content-schema.js';

export async function indexSearch(root:string,selection:{entries:Entry[];manifestSha256:string},base:string) {
  const inputs=searchInputs(root,selection.entries,path=>readFileSync(path,'utf8'));
  rmSync(join(root,'pagefind'),{recursive:true,force:true});
  const {index,errors}=await pagefind.createIndex({rootSelector:'html',excludeSelectors:['.katex','[data-pagefind-ignore]'],forceLanguage:'en',writePlayground:false});
  if(errors.length || !index)throw new ContractError('SEARCH_INDEX_FAILURE',errors.join(', '));
  try {
    // Explicit file selection prevents Pagefind's default whole-body fallback
    // when a corpus has no published data-pagefind-body at all.
    for(const input of inputs) {
      const path=input.route==='/'?'index.html':input.route.slice(1)+'index.html';
      const result=await index.addHTMLFile({url:input.route,content:readFileSync(join(root,path),'utf8')});
      if(result.errors.length)throw new ContractError('SEARCH_INDEX_FAILURE',result.errors.join(', '));
    }
    const result=inputs.length?await index.getFiles():{files:[],errors:[]};
    if(result.errors.length)throw new ContractError('SEARCH_INDEX_FAILURE',result.errors.join(', '));
    const files=result.files.filter(f=>!/^pagefind-(?:.*ui|highlight)/.test(f.path)).map(f=>({path:`pagefind/${f.path}`,bytes:f.content.length,sha256:sha256(f.content)}));
    for(const f of result.files.filter(f=>files.some(p=>p.path===`pagefind/${f.path}`))) {
      mkdirSync(join(root,'pagefind',f.path,'..'),{recursive:true});writeFileSync(join(root,'pagefind',f.path),f.content);
    }
    const manifest={schema:'unity-search/1',pagefindVersion:JSON.parse(readFileSync('node_modules/pagefind/package.json','utf8')).version,basePath:base,publicationManifestSha256:selection.manifestSha256,inputs,inputsSha256:searchIdentity(inputs,base,selection.manifestSha256),files};
    writeFileSync(join(root,'search-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    return manifest;
  } finally {await index.deleteIndex();await pagefind.close();}
}
