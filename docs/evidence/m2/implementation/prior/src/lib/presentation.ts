import type { Entry, Reference } from './content-schema.js';
import { type Corpus } from './content.js';
import { websiteReviewState as reviewState } from './website-review.js';
import { renderMarkdownSync } from './markdown.js';
import { withBase } from './urls.js';
import { sourceDisplay } from './source-display.js';
import { parseMarkdown } from './markdown-tree.js';
import { ContractError } from './errors.js';

export function escapeHTML(value: string) { return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
const roles: Record<string,string> = { definition:'Definition',assumption:'Assumption',conjecture:'Conjecture',evidence:'Evidence',derivation:'Restricted result',prediction:'Prediction',falsification:'Failure test','open-problem':'Open question' };
const evidence: Record<string,string> = { 'not-applicable':'No empirical status assigned','external-supported':'External support within the stated scope','project-reported':'Evidence reported by the supplied documents','project-reproduced':'Reproduced restricted calculation',proposed:'Unproved extension or open research',contested:'Contested evidence' };
export function reviewLabel(corpus: Corpus,id: string) {
  return {accepted:'Faithful to the supplied documents',pending:'Pending',stale:'Stale — rereview required',rejected:'Rejected — revision required'}[reviewState(corpus,id)];
}
export function renderEditorialState(corpus: Corpus,entry: Entry) {
  const publication=entry.publicationState==='draft'?'Draft · private preview':entry.publicationState;
  return `Publication: ${escapeHTML(publication)}. Source fidelity: ${escapeHTML(reviewLabel(corpus,entry.id))}.`;
}
export function renderHomeHeading(title: string) {
  const words=title.trim().split(/\s+/);
  if(words.length<=4) return escapeHTML(title);
  return `${words.slice(0,4).map(escapeHTML).join(' ')}<br class="desktop-break" /> ${words.slice(4,-1).map(escapeHTML).join(' ')} <em>${escapeHTML(words.at(-1)!)}</em>`;
}
export function renderStatus(corpus: Corpus,entry: Entry) {
  const pairs=[['Scientific role',roles[entry.kind] ?? 'Research document'],['Evidence',evidence[entry.evidenceState]],['Source fidelity',reviewLabel(corpus,entry.id)],['Publication',entry.publicationState==='draft'?'Draft · private preview':entry.publicationState]];
  return `<dl class="record-status">${pairs.map(([label,value])=>`<div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>`;
}
function link(route: string,label: string,base: string) { return `<a href="${escapeHTML(withBase(route,base))}">${escapeHTML(label)}</a>`; }
export function renderRecordDetails(corpus: Corpus,entry: Entry,base='/') {
  if(entry.publicationState==='withdrawn') return `<aside class="prose"><h2>Withdrawn record</h2><p>${escapeHTML(entry.withdrawalReason ?? '')}</p><p>Change record: ${escapeHTML(entry.correctionRef ?? '')}</p></aside>`;
  let html='';
  if(entry.contentOrigin==='proposed') html+=`<aside class="prose"><h2>Proposal · not adopted into the current theory</h2><p>${escapeHTML(entry.proposalProvenance ?? '')}</p></aside>`;
  if(entry.publicationState==='superseded') html+=`<aside class="prose"><h2>Historical record · corrected</h2><p>Change record: ${escapeHTML(entry.correctionRef ?? '')}</p>${link(corpus.entries.get(entry.supersededBy!)!.route,`Read replacement ${entry.supersededBy}`,base)}</aside>`;
  if(entry.plainLanguage) html+=`<section class="prose"><h2>In plain language</h2><p class="reading-note">Source fidelity: ${escapeHTML(reviewLabel(corpus,entry.id))}</p>${renderMarkdownSync(entry.plainLanguage,base,corpus)}</section>`;
  html+=`<section class="prose"><h2>Scope and sources</h2><p>${escapeHTML(entry.scope)}</p>`;
  if(entry.limits && entry.limits!==entry.scope) html+=`<p>${escapeHTML(entry.limits)}</p>`;
  if(entry.sourceMapping) html+=`<p>${escapeHTML(entry.sourceMapping)}</p>`;
  if(entry.sourceBinding) {
    const b=entry.sourceBinding;const source=corpus.sources.get(b.sourceKey)!;
    html+=`<details><summary>Source extraction details</summary><p class="binding-receipt">Extracted from ${escapeHTML(source.path.split('/').pop()!)}; edition ${escapeHTML(source.edition)}, lines ${b.startLine}–${b.endLine}.</p><p class="binding-receipt">Raw excerpt SHA-256: <code>${b.excerptSha256}</code></p></details>`;
  }
  if(entry.dependsOn.length) html+=`<h3>Depends on</h3><ul>${entry.dependsOn.map(id=>`<li>${link(corpus.entries.get(id)!.route,`${id} — ${corpus.entries.get(id)!.title}`,base)}</li>`).join('')}</ul>`;
  const refs=[...new Set(entry.bibRefs.map(id=>corpus.references.get(id)!.primaryId ?? id))];
  if(refs.length) html+=`<h3>References reported by this source</h3><ul>${refs.map(id=>`<li><a href="${withBase('/references/',base)}#${id}">${escapeHTML(corpus.references.get(id)!.title)}</a></li>`).join('')}</ul>`;
  if(entry.id==='DOC-STATUS') html+=`<p>${link(corpus.entries.get('DOC-PROOF')!.route,'Read the claim and evidence matrix',base)}</p>`;
  return html+'</section>';
}
export function renderReferences(references: Reference[],entries: Entry[],base='/') {
  return `<ol>${references.filter(r=>!r.primaryId).map(ref=>{
    const alternates=references.filter(r=>r.primaryId===ref.id);
    const users=entries.filter(e=>e.bibRefs.some(id=>id===ref.id || alternates.some(r=>r.id===id)));
    return `<li id="${ref.id}"><h2>${escapeHTML(ref.title)}</h2><p>${escapeHTML((ref.authors ?? []).join(', '))}${ref.publication?` · ${escapeHTML(ref.publication)}`:''}${ref.year?` (${ref.year})`:''}</p><p><a href="${escapeHTML(ref.url)}">${escapeHTML(ref.doi?`DOI: ${ref.doi}`:'Read the institutional source')}</a></p>${alternates.map(alt=>`<p id="${alt.id}"><a href="${escapeHTML(alt.url)}">${escapeHTML(alt.linkRole ?? 'Alternate source')}</a></p>`).join('')}<p>${escapeHTML(ref.supportScope)}</p><p>${escapeHTML(ref.verificationScope)}</p><p>Used by: ${users.map(e=>link(e.route,e.id,base)).join(', ')}</p></li>`;
  }).join('')}</ol>`;
}
export function renderHomeStatus(corpus: Corpus,entry: Entry,base='/') {
  // A small source projection, not an independently authored completion list.
  // These anchors are specific to the inspected 04 format and fail on drift.
  const text=sourceDisplay(entry.statement ?? '',entry.adapter),nodes=parseMarkdown(text).children;
  const index=nodes.findIndex(node=>node.type==='heading' && node.depth===2 && node.children.some(child=>child.type==='text' && child.value==='Open extensions to prove — not definitions'));
  const heading=nodes[index];
  const next=nodes.slice(index+1).find(node=>node.type==='heading');
  if(index<0 || !heading?.position || !next?.position) throw new ContractError('SOURCE_ADAPTER_FAILURE','Current status summary anchors changed; rereview the projection');
  return renderMarkdownSync(text.slice(heading.position.start.offset,next.position.start.offset),base,corpus);
}
export function renderNavigation(selection: { entries: Entry[]; manifest: {navigationIds:string[];routes:string[]} },route:string,base='/') {
  const navigation=[['DOC-STATUS','Research status'],['DOC-CONCEPT-GEOMETRY','Definitions'],['DOC-HOME','The question'],['DOC-START','Start simply']].flatMap(([id,label])=>{
    const entry=selection.entries.find(e=>e.id===id);return entry && selection.manifest.navigationIds.includes(id)?[{route:entry.route,label}]:[];
  });
  if(selection.manifest.routes.includes('/references/')) navigation.splice(2,0,{route:'/references/',label:'Literature'});
  return navigation.map(item=>`<a href="${escapeHTML(withBase(item.route,base))}"${route===item.route?' aria-current="page"':''}>${item.label}</a>`).join('');
}
