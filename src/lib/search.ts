import { load } from 'cheerio';
import type { Entry } from './content-schema.js';
import { escapeHTML as esc } from './presentation.js';
import { withBase } from './urls.js';
import { sha256, stableJSON } from './identity.js';
import { ContractError } from './errors.js';

// Discovery uses the publication state, even in private previews. A preview is
// not permission to put drafts, archives or administrative material in an index.
export function searchable(entry: Entry) {
  return entry.publicationState === 'published' && !['library','about','contribute','licensing'].includes(entry.kind);
}
export function searchStatus(entry: Entry) {
  const roles:Record<string,string>={definition:'Definition',conjecture:'Conjecture',evidence:'Source-reported evidence',prediction:'Prediction', 'open-problem':'Open question'};
  return `${roles[entry.kind] ?? 'Website reading'}; ${entry.evidenceState === 'project-reproduced' ? 'recorded project reproduction' : entry.evidenceState === 'proposed' ? 'proposed; not established' : entry.evidenceState === 'project-reported' ? 'evidence reported by supplied sources' : entry.evidenceState}; ${entry.publicationState}`;
}
export function searchAttributes(entry: Entry) {
  return searchable(entry) ? {'data-pagefind-body':'','data-pagefind-meta':'title[data-search-title], status[data-search-status], scope[data-search-scope]', 'data-search-title':entry.title,'data-search-status':searchStatus(entry),'data-search-scope':entry.limits || entry.scope} : {};
}
export function renderSearchFallback(selection:{entries:Entry[];manifest:{searchIds:string[]}},base='/') {
  const entries=selection.entries.filter(e=>selection.manifest.searchIds.includes(e.id));
  return `<h2>Browse by topic</h2><p>Use these reading indexes with or without JavaScript: <a href="${withBase('/concepts/',base)}">concepts</a>, <a href="${withBase('/examples/',base)}">examples</a>, <a href="${withBase('/documents/',base)}">documents</a> and <a href="${withBase('/research-status/',base)}">research status</a>.</p><h2>Published readings</h2>${entries.length?`<ul>${entries.map(e=>`<li><a href="${withBase(e.route,base)}">${esc(e.title)}</a> — ${esc(searchStatus(e))}</li>`).join('')}</ul>`:'<p>No readings have been selected for publication yet. Private drafts remain available through the reading indexes, and are excluded from search.</p>'}`;
}
export function searchInputs(root:string,entries:Entry[],read:(path:string)=>string) {
  return entries.filter(searchable).map(e=>{
    const path=e.route==='/'?'index.html':e.route.slice(1)+'index.html';
    const html=read(`${root}/${path}`),$=load(html),body=$('[data-pagefind-body]');
    if(body.length!==1 || body.attr('data-canonical-body')!==e.id || body.attr('data-search-status')!==searchStatus(e) || body.attr('data-search-scope')!==(e.limits || e.scope) || body.attr('data-search-title')!==e.title)throw new ContractError('SEARCH_BODY_MISMATCH',e.id);
    return {id:e.id,route:e.route,htmlSha256:sha256(html),bodySha256:sha256(body.html() ?? '')};
  });
}
export const searchIdentity=(inputs:unknown,base:string,manifest:string)=>sha256(stableJSON({inputs,base,manifest}));
