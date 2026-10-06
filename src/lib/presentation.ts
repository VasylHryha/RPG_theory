import type { Entry, Reference } from './content-schema.js';
import { type Corpus } from './content.js';
import { websiteReviewState as reviewState } from './website-review.js';
import { renderMarkdownSync } from './markdown.js';
import { withBase } from './urls.js';
import { sourceDisplay } from './source-display.js';
import { parseMarkdown } from './markdown-tree.js';
import { ContractError } from './errors.js';
import { load } from 'cheerio';

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
  return `${words.slice(0,-1).map(escapeHTML).join(' ')} <em>${escapeHTML(words.at(-1)!)}</em>`;
}
export function renderStatus(corpus: Corpus,entry: Entry) {
  const archived=entry.publicationState==='archived';
  const publication=archived?'Historical':entry.publicationState==='published'?'Current research draft':entry.publicationState==='draft'?'Private draft':entry.publicationState;
  const role=entry.kind==='example'?'Illustrative example':entry.kind==='concept'?'Concept explanation':entry.kind==='evidence'?'Evidence case':entry.kind==='conjecture'?'Open hypothesis':roles[entry.kind] ?? 'Research document';
  const pairs=[['Scientific role',roles[entry.kind] ?? 'Research document'],['Evidence',evidence[entry.evidenceState]],['Source fidelity',reviewLabel(corpus,entry.id)],['Publication',archived?'Historical source · previous edition':entry.publicationState==='draft'?'Draft · private preview':entry.publicationState]];
  return `${archived?'<p class="reading-note">This is a preserved historical reading. It is not the current source edition or a retraction of the cited study.</p>':''}<div class="record-status"><p><strong>${escapeHTML(role)}</strong> · ${escapeHTML(publication)}</p>${entry.evidenceState==='not-applicable'?'':`<p class="reading-note">${escapeHTML(evidence[entry.evidenceState])}</p>`}<details><summary>Source fidelity and publication details</summary><dl>${pairs.map(([label,value])=>`<div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl></details></div>`;
}
function link(route: string,label: string,base: string) { return `<a href="${escapeHTML(withBase(route,base))}">${escapeHTML(label)}</a>`; }
export function renderRecordDetails(corpus: Corpus,entry: Entry,base='/') {
  if(entry.publicationState==='withdrawn') return `<aside class="prose"><h2>Withdrawn record</h2><p>${escapeHTML(entry.withdrawalReason ?? '')}</p><p>Change record: ${escapeHTML(entry.correctionRef ?? '')}</p></aside>`;
  let html='';
  if(entry.publicationState==='archived') html+=`<aside class="prose"><h2>Historical source · previous edition</h2><p>${escapeHTML(entry.archiveReason ?? '')}</p>${link('/documents/','Read the current document library',base)}</aside>`;
  if(entry.contentOrigin==='proposed') html+=`<aside class="prose"><h2>Proposal · not adopted into the current theory</h2><p>${escapeHTML(entry.proposalProvenance ?? '')}</p></aside>`;
  if(entry.publicationState==='superseded') html+=`<aside class="prose"><h2>Historical record · corrected</h2><p>Change record: ${escapeHTML(entry.correctionRef ?? '')}</p>${link(corpus.entries.get(entry.supersededBy!)!.route,`Read replacement ${entry.supersededBy}`,base)}</aside>`;
  if(entry.plainLanguage && !isTechnicalDocument(entry)) html+=`<section class="prose"><h2>In plain language</h2><p class="reading-note">Source fidelity: ${escapeHTML(reviewLabel(corpus,entry.id))}</p>${renderMarkdownSync(entry.plainLanguage,base,corpus)}</section>`;
  const context=html;
  const compact=entry.audience==='general' && ['concept','example'].includes(entry.kind);
  html=`<section class="prose"><h2>Scope and sources</h2><p>${escapeHTML(entry.scope)}</p>`;
  if(!compact && entry.limits && entry.limits!==entry.scope) html+=`<p>${escapeHTML(entry.limits)}</p>`;
  if(entry.sourceMapping) html+=`<p>${escapeHTML(entry.sourceMapping)}</p>`;
  if(entry.sourceBinding) {
    const b=entry.sourceBinding;const source=corpus.sources.get(b.sourceKey)!;
    html+=`<details><summary>Source extraction details</summary><p class="binding-receipt">Extracted from ${escapeHTML(source.path.split('/').pop()!)}; edition ${escapeHTML(source.edition)}, lines ${b.startLine}–${b.endLine}.</p><p class="binding-receipt">Raw excerpt SHA-256: <code>${b.excerptSha256}</code></p></details>`;
  }
  if(entry.dependsOn.length) html+=`<h3>Related definitions and readings</h3><ul>${entry.dependsOn.map(id=>`<li>${link(corpus.entries.get(id)!.route,corpus.entries.get(id)!.title,base)}</li>`).join('')}</ul>`;
  const refs=[...new Set(entry.bibRefs.map(id=>corpus.references.get(id)!.primaryId ?? id))];
  if(refs.length) html+=`<h3>${entry.contentOrigin==='source-bound'?'References reported by this source':'References and further reading'}</h3><ul>${refs.map(id=>`<li><a href="${withBase('/references/',base)}#${id}">${escapeHTML(corpus.references.get(id)!.title)}</a></li>`).join('')}</ul>`;
  if(entry.id==='DOC-STATUS') html+=`<p>${link(corpus.entries.get('DOC-CLAIM-COVERAGE')!.route,'Read claims, evidence limits and open questions',base)}</p>`;
  html+=`<details><summary>Stable record identity</summary><p>${escapeHTML(entry.id)} · revision ${entry.revision} · updated ${escapeHTML(entry.updatedAt)}</p></details></section>`;
  if(compact) {
    const limit=entry.limits && entry.limits!==entry.scope?`<p class="reading-note">${escapeHTML(entry.limits)}</p>`:'';
    return `${context}${limit}<details class="source-details"><summary>Sources and related definitions</summary>${html}</details>`;
  }
  return context+`<details class="source-details"><summary>Scope, sources and record details</summary>${html}</details>`;
}
export function renderReferences(references: Reference[],entries: Entry[],base='/') {
  return `<ol>${references.filter(r=>!r.primaryId).map(ref=>{
    const alternates=references.filter(r=>r.primaryId===ref.id);
    const users=entries.filter(e=>e.bibRefs.some(id=>id===ref.id || alternates.some(r=>r.id===id)));
    return `<li id="${ref.id}"><h2>${escapeHTML(ref.title)}</h2><p>${escapeHTML((ref.authors ?? []).join(', '))}${ref.publication?` · ${escapeHTML(ref.publication)}`:''}${ref.year?` (${ref.year})`:''}</p><p><a href="${escapeHTML(ref.url)}">${escapeHTML(ref.doi?`DOI: ${ref.doi}`:'Read the institutional source')}</a></p><p><strong>Why it is here:</strong> ${escapeHTML(ref.supportScope)}</p><p><strong>What was checked:</strong> ${escapeHTML(ref.verificationScope)}</p><p><strong>Used in RRG pages:</strong> ${users.length?users.map(e=>link(e.route,e.title,base)).join(' · '):'Background or method context in the selected reading map.'}</p><details><summary>Stable identity and alternate sources</summary><p>${escapeHTML(ref.id)}</p>${alternates.map(alt=>`<p id="${alt.id}"><a href="${escapeHTML(alt.url)}">${escapeHTML(alt.linkRole ?? 'Alternate source')}</a></p>`).join('')}</details></li>`;
  }).join('')}</ol>`;
}
export function renderHomeStatus(corpus: Corpus,entry: Entry,base='/') {
  // A small projection of the selected audit's remaining gaps, not an
  // independently authored completion list or a fresh scientific verdict.
  const text=sourceDisplay(entry.statement ?? '',entry.adapter),nodes=parseMarkdown(text).children;
  const index=nodes.findIndex(node=>node.type==='heading' && node.depth===2 && node.children.some(child=>child.type==='text' && child.value==='7. Remaining gaps and publication boundary'));
  const heading=nodes[index];
  const next=nodes.slice(index+1).find(node=>node.type==='heading');
  if(index<0 || !heading?.position) throw new ContractError('SOURCE_ADAPTER_FAILURE','Current status summary anchors changed; rereview the projection');
  return renderMarkdownSync(text.slice(heading.position.start.offset,next?.position?.start.offset ?? text.length),base,corpus);
}
export function renderHomeContext(corpus: Corpus,entry: Entry,base='/') {
  return renderMarkdownSync(entry.plainLanguage,base,corpus);
}
export function renderNavigation(selection: { entries: Entry[]; manifest: {navigationIds:string[];routes:string[]} },route:string,base='/') {
  const navigation=[['DOC-START','Start'],['DOC-CONCEPTS','Concepts'],['DOC-EVIDENCE','Evidence'],['DOC-STATUS','Research'],['DOC-LIBRARY','Documents']].flatMap(([id,label])=>{
    const entry=selection.entries.find(e=>e.id===id);return entry && selection.manifest.navigationIds.includes(id)?[{route:entry.route,label}]:[];
  });
  if(selection.manifest.routes.includes('/search/')) navigation.push({route:'/search/',label:'Search'});
  return navigation.map(item=>`<a href="${escapeHTML(withBase(item.route,base))}"${route===item.route?' aria-current="page"':''}>${item.label}</a>`).join('');
}

export function isTechnicalDocument(entry: Entry) {
  return entry.id.startsWith('DOC-') && entry.audience==='technical' && !['superseded','withdrawn','archived'].includes(entry.publicationState);
}

// Long source readings share a selected-route guide and a TOC taken from the
// actual rendered headings. No separate scientific summary or heading owner.
export function renderTechnicalGuide(selection: {corpus: Corpus; entries: Entry[]; manifest:{navigationIds:string[]}},entry: Entry,html: string,base='/') {
  if(!isTechnicalDocument(entry))return '';
  const available=(id:string)=>selection.entries.find(item=>item.id===id && selection.manifest.navigationIds.includes(id));
  const items=[['DOC-FRAMEWORK','Framework'],['DOC-MATH','Mathematics'],['DOC-EVIDENCE','Evidence'],['DOC-STATUS','Status'],['DOC-OPEN-PROBLEMS','Open questions'],['DOC-LIBRARY','Documents']];
  const navigation=items.flatMap(([id,label])=>{const item=available(id);return item?[`<a href="${escapeHTML(withBase(item.route,base))}"${id===entry.id?' aria-current="page"':''}>${label}</a>`]:[];}).join('');
  const $=load(html,null,false);
  const headings=$('h2[id]').toArray().map(el=>({id:$(el).attr('id')!,text:$(el).text()}));
  const source=entry.sourceBinding?selection.corpus.sources.get(entry.sourceBinding.sourceKey):undefined;
  const simpler=[['DOC-START','Start'],['DOC-EXAMPLES','Examples'],['DOC-CONCEPTS','Concepts']].flatMap(([id,label])=>{const item=available(id);return item?[link(item.route,label,base)]:[];}).join(' · ');
  const context=entry.plainLanguage?`<aside class="technical-callout prose" aria-label="${entry.id==='DOC-STATUS'?'Research overview':'Reading context'}"><h2>${entry.id==='DOC-STATUS'?'Research overview':'Before reading'}</h2>${renderMarkdownSync(entry.plainLanguage,base,selection.corpus)}</aside>`:'';
  const toc=headings.length?`<details class="technical-toc"><summary>On this page (${headings.length} sections)</summary><ol>${headings.map(h=>`<li><a href="#${escapeHTML(h.id)}">${escapeHTML(h.text)}</a></li>`).join('')}</ol></details>`:'';
  return `<nav class="technical-navigation" aria-label="Technical reading">${navigation}</nav><p class="reading-note">${source?`Source: ${escapeHTML(source.path.split('/').pop()!)}. `:''}Edition: ${escapeHTML(entry.researchEdition)}.</p>${simpler?`<p class="reading-note">Simpler reading: ${simpler}.</p>`:''}${context}${toc}`;
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
    heading='Feedback inside a whole and two possible outward roles';
    equivalent='Within an organization, arrangement constrains activity and activity may maintain or change arrangement. A persistent whole may be treated as a useful unit in a further description. It may also physically change its surroundings. These are distinct possible roles, neither automatic; formation, stopping, branching and disruption depend on conditions. The background need not start with completed units.';
    shapes=`<rect class="diagram-environment" x="14" y="14" width="332" height="342" rx="22"/><text x="180" y="42">Background &amp; conditions</text>
      <text class="diagram-subtitle" x="180" y="68">formation may begin with transient arrangements</text>
      <g class="diagram-node"><rect x="40" y="88" width="280" height="77" rx="8"/><text x="180" y="116">An organization</text><text x="180" y="144">arrangement ↔ activity</text></g>
      <path class="diagram-link" d="M180 165 V196 H98 V207 M180 196 H262 V207"/><path class="diagram-arrowhead" d="m93 201 5 6 5-6 m154 0 5 6 5-6"/>
      <text class="diagram-subtitle" x="180" y="321">may have distinct outward roles</text>
      <g class="diagram-node"><rect x="27" y="211" width="142" height="91" rx="8"/><text x="98" y="238">Useful unit</text><text class="diagram-subtitle" x="98" y="260">in a further</text><text class="diagram-subtitle" x="98" y="280">description</text></g>
      <g class="diagram-node"><rect x="191" y="211" width="142" height="91" rx="8"/><text x="262" y="238">Changed conditions</text><text class="diagram-subtitle" x="262" y="260">in the physical</text><text class="diagram-subtitle" x="262" y="280">surroundings</text></g>
      <text class="diagram-subtitle" x="180" y="345">neither role guarantees a further organization</text>`;
    caption='Arrangement and activity can support one another. A useful descriptive unit and a physical change to surroundings are distinct possibilities. This illustrates the source proposal; outcomes depend on the system and may stop, branch or fail.';
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
    caption='A source-bound illustration of the open extension. The reported optical-binding and random-light cases have different supplied conditions; the arrows are not a derived universal law.';
  }
  return `<figure class="beginner-diagram" data-beginner-diagram="${id}"><svg viewBox="0 0 360 370" role="img" aria-labelledby="${title} ${description}"><title id="${title}">${heading}</title><desc id="${description}">${equivalent}</desc>${shapes}</svg><figcaption>${caption}</figcaption></figure>`;
}
