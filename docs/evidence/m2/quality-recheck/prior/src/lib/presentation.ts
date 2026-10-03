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
  if(entry.audience==='general' && ['concept','example'].includes(entry.kind)) return `<p class="record-status record-status-compact reading-note">${entry.kind==='example'?'Illustrative example':'Concept explanation'} · ${escapeHTML(renderEditorialState(corpus,entry))}</p>`;
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
  if(refs.length) html+=`<h3>${entry.contentOrigin==='source-bound'?'References reported by this source':'References and further reading'}</h3><ul>${refs.map(id=>`<li><a href="${withBase('/references/',base)}#${id}">${escapeHTML(corpus.references.get(id)!.title)}</a></li>`).join('')}</ul>`;
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
  const navigation=[['DOC-START','Start'],['DOC-EXAMPLES','Examples'],['DOC-CONCEPTS','Concepts'],['DOC-STATUS','Research status']].flatMap(([id,label])=>{
    const entry=selection.entries.find(e=>e.id===id);return entry && selection.manifest.navigationIds.includes(id)?[{route:entry.route,label}]:[];
  });
  if(selection.manifest.routes.includes('/references/')) navigation.push({route:'/references/',label:'Sources'});
  return navigation.map(item=>`<a href="${escapeHTML(withBase(item.route,base))}"${route===item.route?' aria-current="page"':''}>${item.label}</a>`).join('');
}

// Authored schematics are shared by the page and output auditor. Their bytes are
// part of the rendering-policy fingerprint; no external images or scripts load.
export function renderBeginnerDiagram(id: string) {
  const type = ['DOC-HOME','DOC-START','DOC-CONCEPT-RECURSION'].includes(id) ? 'organization'
    : id==='DOC-EXAMPLE-STRING' ? 'string' : id==='DOC-CONCEPT-INTERACTIONS' ? 'interaction' : null;
  if(!type)return '';
  const prefix=`diagram-${id}`,title=`${prefix}-title`,description=`${prefix}-description`;
  let heading='',equivalent='',shapes='',caption='';
  if(type==='organization') {
    heading='Parts, a whole, and further organization';
    equivalent='Compatible active parts can couple into a collective organization. A persistent whole may become a useful unit in further combinations. The surroundings constrain the process, and existing organization may change those surroundings. This is the RRG research proposal, not a guaranteed sequence.';
    shapes=`<rect class="diagram-environment" x="14" y="14" width="332" height="342" rx="22"/><text x="180" y="42">Surroundings &amp; conditions</text>
      <g class="diagram-node"><rect x="57" y="64" width="246" height="56" rx="8"/><text x="180" y="89">Compatible active parts</text><text class="diagram-subtitle" x="180" y="109">different parts can play different roles</text></g>
      <path class="diagram-link" d="M180 120 V147"/><path class="diagram-arrowhead" d="m175 142 5 6 5-6"/>
      <g class="diagram-node"><rect x="57" y="151" width="246" height="68" rx="8"/><text x="180" y="178">Collective organization</text><text class="diagram-subtitle" x="180" y="200">arrangement ↔ activity</text></g>
      <path class="diagram-link" d="M180 219 V245"/><path class="diagram-arrowhead" d="m175 240 5 6 5-6"/>
      <g class="diagram-node"><rect x="57" y="249" width="246" height="60" rx="8"/><text x="180" y="276">A useful unit</text><text class="diagram-subtitle" x="180" y="297">in further combinations</text></g>
      <path class="diagram-feedback" d="M303 277 C333 277 333 84 303 84"/><path class="diagram-arrowhead" d="m309 79-6 5 6 5"/><text class="diagram-subtitle" x="180" y="337">organization can change conditions</text>`;
    caption='A proposed cycle: active parts → collective organization → a useful unit for further combinations. Conditions affect formation; existing organization may change conditions. Illustration, not a measurement.';
  } else if(type==='string') {
    heading='Two supported modes with fixed ends';
    equivalent='Both string ends are fixed. One illustrated mode has one arch between the ends. Another has two arches and an additional stationary point at the centre. The endpoints are stationary in both patterns. Tension and mass per unit length matter as well as length and boundaries.';
    shapes=`<text x="180" y="35">Fixed ends, different patterns</text><text class="diagram-subtitle" x="180" y="53">One arch</text><path class="string-baseline" d="M35 125 H325"/><path class="string-mode" d="M35 125 C110 40 250 40 325 125"/><circle class="string-node" cx="35" cy="125" r="5"/><circle class="string-node" cx="325" cy="125" r="5"/>
      <text class="diagram-subtitle" x="180" y="165">Two arches</text><path class="string-baseline" d="M35 220 H325"/><path class="string-mode" d="M35 220 C80 160 135 160 180 220 S280 280 325 220"/><circle class="string-node" cx="35" cy="220" r="5"/><circle class="string-node" cx="180" cy="220" r="5"/><circle class="string-node" cx="325" cy="220" r="5"/><text class="diagram-subtitle" x="180" y="303">dots indicate stationary points</text>`;
    caption='Two possible shapes of an ideal fixed-end string, drawn at one instant. Tension and mass per unit length determine its wave speed. Illustration, not measured amplitudes.';
  } else {
    heading='The conditional effective-interaction question';
    equivalent='In the RRG extension, a lower-level organization may enable an effective interaction channel. Under suitable conditions, that channel may help a further organization persist. The source describes distinct physical cases; a universal quantitative law is still open.';
    shapes=`<text x="180" y="35">Conditional RRG extension</text><g class="diagram-node"><rect x="28" y="60" width="304" height="57" rx="8"/><text x="180" y="94">Existing organization</text></g><path class="diagram-link" d="M180 117 V149"/><path class="diagram-arrowhead" d="m175 143 5 6 5-6"/>
      <g class="diagram-node"><rect x="28" y="153" width="304" height="57" rx="8"/><text x="180" y="187">Effective interaction channel</text></g><path class="diagram-link" d="M180 210 V242"/><path class="diagram-arrowhead" d="m175 236 5 6 5-6"/>
      <g class="diagram-node"><rect x="28" y="246" width="304" height="57" rx="8"/><text x="180" y="280">Possible further organization</text></g><text class="diagram-subtitle" x="180" y="337">when the system's conditions support it</text>`;
    caption='A source-bound illustration of the open extension. The reported crystal, spin-ice and background-field cases have different mechanisms and conditions; the arrows are not a derived universal law.';
  }
  return `<figure class="beginner-diagram" data-beginner-diagram="${id}"><svg viewBox="0 0 360 370" role="img" aria-labelledby="${title} ${description}"><title id="${title}">${heading}</title><desc id="${description}">${equivalent}</desc>${shapes}</svg><figcaption>${caption}</figcaption></figure>`;
}
