import type { Entry } from './content-schema.js';
import type { Corpus } from './content.js';
import { renderEntrySync } from './content.js';
import { escapeHTML as esc } from './presentation.js';
import { withBase } from './urls.js';
import { ContractError } from './errors.js';
import { load } from 'cheerio';

// Metadata for generated reading pages has one owner, shared with their layouts.
export const readingPages = {
  '/articles/': { title: 'Articles', description: 'Explanatory articles with research proposals and actual results kept distinct.', kind: 'article', audience: 'general' },
  '/references/': { title: 'Literature and sources', description: 'Current-edition and supplementary reading-map sources, with their specific support and recorded inspection limits.', kind: 'research-status', audience: 'technical' },
  '/about/': { title: 'About RRG', description: 'What RRG explores, who maintains it and how to ask a question or contribute.', kind: 'about', audience: 'general' },
  '/contact/': { title: 'Contact the author', description: 'Write to Vasyl Hryha with a question, correction, idea, new evidence or collaboration.', kind: 'about', audience: 'general' },
  '/cite/': { title: 'Cite this edition', description: 'Cite RRG, its current research edition and explanatory articles; download citation metadata and inspect release identity.', kind: 'library', audience: 'technical' },
  '/legal/': { title: 'Rights and reuse', description: 'Separate rights states for website code, research prose and figures, data and third-party dependencies.', kind: 'licensing', audience: 'general' },
  '/search/': { title: 'Search and browse', description: 'Search published readings, or browse concepts, examples and original documents.', kind: 'library', audience: 'general' },
  '/contents/': { title: 'Contents', description: 'Every reading page, arranged as a book, with short descriptions and reading paths.', kind: 'library', audience: 'general' }
} satisfies Record<string, Pick<Entry, 'title' | 'description' | 'kind' | 'audience'>>;

export type Selection = { entries: Entry[]; manifest: { routes: string[] }; corpus: Corpus };
export type BookPage = Pick<Entry, 'route' | 'title' | 'description' | 'kind' | 'audience'> & { entry?: Entry };
type ChapterRule = { name: string; routes: string[]; matches?: (page: BookPage) => boolean; claims?: boolean; front?: false };
export type Chapter = { name: string; number: string; pages: BookPage[]; claims?: boolean; frontRoute?: string };
export type Part = { name: string; heading: string; route?: string; chapters: Chapter[] };
const rules: { name: string; heading: string; route?: string; chapters: ChapterRule[] }[] = [
  { name: 'Understand', heading: 'Part I — Understand', route: '/start/', chapters: [
    { name: 'Start', routes: ['/start/'] },
    { name: 'Concepts', routes: ['/concepts/', '/concepts/geometry-and-modes/', '/concepts/stability/', '/concepts/recursion/', '/concepts/background/', '/concepts/effective-interactions/'], matches: p => p.route.startsWith('/concepts/') },
    { name: 'Longer explanations', routes: ['/articles/', '/articles/how-existing-structures-make-new-organization-possible/', '/articles/when-can-a-whole-be-treated-as-one-useful-unit/'], matches: p => p.route.startsWith('/articles/') }
  ] },
  { name: 'Examples', heading: 'Part II — Examples', route: '/examples/', chapters: [
    { name: 'Examples overview', routes: ['/examples/'] },
    { name: 'Basics', routes: ['/examples/string/', '/examples/water/'], front: false },
    { name: 'Up the ladder, small to large', routes: ['/examples/first-structures/', '/examples/molecule/', '/examples/carbon-arrangement/', '/examples/star/', '/examples/cell/', '/examples/life-environment/', '/examples/brain/'], matches: p => p.route.startsWith('/examples/'), front: false }
  ] },
  { name: 'Evidence', heading: 'Part III — Evidence', route: '/evidence/', chapters: [
    { name: 'Evidence overview', routes: ['/evidence/'], matches: p => p.route.startsWith('/evidence/') },
    { name: 'Evidence catalogue', routes: ['/evidence/catalogue/'] },
    { name: 'Source connections', routes: ['/evidence/source-links/'] },
    { name: 'Literature and sources', routes: ['/references/'] }
  ] },
  { name: 'Research and sources', heading: 'Part IV — Research and sources', route: '/research-status/', chapters: [
    { name: 'Research status', routes: ['/research-status/'], matches: p => p.route.startsWith('/research-status/') },
    { name: 'Open questions', routes: ['/open-problems/'] },
    { name: 'Claims list', routes: ['/research-status/claims/'], matches: p => p.route.startsWith('/claims/'), claims: true },
    { name: 'Framework', routes: ['/framework/', '/framework/recursive-background/'], matches: p => p.route.startsWith('/framework/') },
    { name: 'Mathematics', routes: ['/math/', '/math/illustrations/'], matches: p => p.route.startsWith('/math/') },
    { name: 'Technical documents', routes: ['/documents/', '/documents/locked-core/', '/documents/world-explanation/', '/documents/reading-guide/', '/documents/source-authority/', '/documents/foundation-errata/'], matches: p => p.route.startsWith('/documents/') },
    { name: 'Change history', routes: ['/changes/', '/changes/source-history/'], matches: p => p.route.startsWith('/changes/') }
  ] },
  { name: 'Explore further', heading: 'Part V — Explore further', chapters: [
    { name: 'Related scientific work', routes: ['/related-work/'] },
    { name: 'Questions critics ask', routes: ['/questions/'] },
    { name: 'Experiments', routes: ['/experiments/'] },
    { name: 'Possible uses', routes: ['/uses/'] }
  ] },
  { name: 'Appendices', heading: 'Appendices', chapters: [
    { name: 'Glossary, contact and site information', routes: ['/glossary/', '/contact/', '/about/', '/cite/', '/legal/', '/search/'], front: false }
  ] }
];
const kindNames: Partial<Record<Entry['kind'], string>> = { definition: 'Definitions', assumption: 'Assumptions', conjecture: 'Conjectures', evidence: 'Evidence cases', derivation: 'Derivations', prediction: 'Predictions', falsification: 'Failure tests', 'open-problem': 'Open questions' };
const kindOrder = Object.keys(kindNames);
const compare = (a: BookPage, b: BookPage) => a.route.localeCompare(b.route, 'en', { numeric: true });
const historical = (p: BookPage) => !!p.entry && ['archived', 'superseded', 'withdrawn'].includes(p.entry.publicationState);
export function bookContents(selection: Pick<Selection, 'entries' | 'manifest'>) {
  const pages: BookPage[] = selection.entries.map(entry => ({ ...entry, entry }));
  for (const [route, metadata] of Object.entries(readingPages)) if (selection.manifest.routes.includes(route) && !pages.some(p => p.route === route)) pages.push({ route, ...metadata });
  const readingRoutes = selection.manifest.routes.filter(route => route.endsWith('/') && !route.startsWith('/fixtures/'));
  if (new Set(pages.map(p => p.route)).size !== pages.length || pages.some(p => !selection.manifest.routes.includes(p.route)) || readingRoutes.some(route => !pages.some(p => p.route === route))) throw new ContractError('CONTENTS_MEMBERSHIP_FAILURE', 'Every selected reading route needs unique publication metadata');
  const home = pages.filter(p => p.route === '/');
  const used = new Set(['/', '/contents/']);
  let number = 0;
  const explicit = new Set(rules.flatMap(p => p.chapters.flatMap(c => c.routes)));
  const parts: Part[] = rules.map(part => ({ ...part, chapters: part.chapters.map(rule => {
    const members = pages.filter(p => !used.has(p.route) && (rule.routes.includes(p.route) || !explicit.has(p.route) && !historical(p) && rule.matches?.(p)));
    members.sort((a, b) => {
      const rank = (p: BookPage) => rule.routes.includes(p.route) ? rule.routes.indexOf(p.route) : rule.routes.length;
      return rank(a) - rank(b) || (rule.claims ? kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) : 0) || compare(a, b);
    });
    // All selected claims, including explicitly selected historical claims, stay
    // in the single claims list. History is visibly labelled, never hidden.
    if (rule.claims) {
      for (const p of pages.filter(p => historical(p) && p.route.startsWith('/claims/') && !used.has(p.route))) members.push(p);
      members.sort((a, b) => Number(a.route.startsWith('/claims/')) - Number(b.route.startsWith('/claims/')) || kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) || Number(historical(a)) - Number(historical(b)) || compare(a, b));
    }
    members.forEach(p => used.add(p.route));
    return { name: rule.name, number: part.name === 'Appendices' ? '' : String(++number), pages: members, claims: rule.claims,
      frontRoute: rule.front===false?undefined:members.find(p=>p.route===rule.routes[0])?.route };
  }) }));
  const other = pages.filter(p => !used.has(p.route)).sort(compare);
  if (other.length) parts.push({ name: 'Other', heading: 'Other — historical or unassigned pages', chapters: [{ name: 'Other readings', number: '', pages: other }] });
  return { home, parts };
}
export function typeLabel(page: BookPage) {
  if (page.kind === 'example') return 'Example';
  if (page.kind === 'evidence' || page.route.startsWith('/evidence/') || page.route === '/references/') return 'Evidence';
  return page.audience === 'technical' ? 'Technical source' : 'Explanation';
}
export function statusLabel(page: BookPage) {
  const entry = page.entry;
  if (!entry || historical(page)) return '';
  if (['open-problem', 'open-problems', 'prediction', 'falsification'].includes(entry.kind) || entry.evidenceState === 'contested') return 'Open';
  if (entry.kind === 'conjecture' || entry.evidenceState === 'proposed') return 'RRG proposal';
  // Source-reported studies include simulations and restricted derivations;
  // their presence never warrants an Established label for the RRG framework.
  if (entry.evidenceState === 'external-supported') return 'Established';
  return '';
}
function link(page: Pick<BookPage, 'route' | 'title'>, base: string, label = page.title) {
  return `<a href="${esc(withBase(page.route, base))}">${esc(label)}</a>`;
}
function row(page: BookPage, base: string, number = '') {
  const status = statusLabel(page);
  return `<li data-contents-route="${esc(page.route)}"><div class="contents-title">${number ? `<span class="chapter-number">${esc(number)}</span> ` : ''}${link(page, base)}</div><p class="contents-description">${esc(page.description)}</p><p class="contents-labels"><span>${typeLabel(page)}</span>${status ? ` · <span>${status}</span>` : ''}${historical(page) ? ' · <span>Historical edition</span>' : ''}</p></li>`;
}
function rows(pages: BookPage[], base: string, number = '', childrenOnly = false) {
  return `<ul class="contents-entries">${pages.map((p, i) => row(p, base, number ? childrenOnly ? `${number}.${i + 1}` : i === 0 ? number : `${number}.${i}` : '')).join('')}</ul>`;
}
function claimList(pages: BookPage[], base: string, heading: 'h3' | 'h4') {
  return `<details class="contents-claims"><summary>All claim pages (${pages.length})</summary>${[...new Set(pages.map(p => p.kind))].map(kind => `<${heading}>${esc(kindNames[kind] ?? kind)}</${heading}>${rows(pages.filter(p => p.kind === kind), base)}`).join('')}</details>`;
}
export function renderContents(selection: Selection, base = '/') {
  const book = bookContents(selection);
  const all = [...book.home, ...book.parts.flatMap(p => p.chapters.flatMap(c => c.pages))];
  const routeList = (routes: string[]) => `<ol>${routes.flatMap(route => { const p = all.find(p => p.route === route); return p ? [`<li>${link(p, base)}</li>`] : []; }).join('')}</ol>`;
  const full = book.parts.slice(0, 2).flatMap(p => p.chapters.flatMap(c => c.pages.map(p => p.route)));
  const paths = `<section class="reading-paths"><h2>Reading paths</h2><div><h3>10-minute overview</h3>${routeList(['/', '/start/', '/examples/molecule/', '/examples/star/', '/examples/cell/'])}</div><div><h3>Full explanation</h3>${routeList(full)}</div><div><h3>Technical route</h3>${routeList(['/framework/', '/math/', '/evidence/catalogue/', '/research-status/', '/documents/'])}</div></section>`;
  return paths + rows(book.home, base) + book.parts.map(part => `<section class="contents-part"${part.name === 'Explore further' ? ' id="part-v"' : ''}><h2>${esc(part.heading)}</h2>${part.chapters.filter(c => c.pages.length).map(chapter => {
    const childrenOnly=!chapter.frontRoute;
    let entries = rows(chapter.pages, base, chapter.number, childrenOnly);
    if (chapter.claims) {
      const claims = chapter.pages.filter(p => p.route.startsWith('/claims/'));
      entries = rows(chapter.pages.filter(p => !p.route.startsWith('/claims/')), base, chapter.number) + claimList(claims,base,'h4');
    }
    return `<section><h3>${chapter.number ? `${chapter.number}. ` : ''}${esc(chapter.name)}</h3>${entries}</section>`;
  }).join('')}</section>`).join('');
}
function location(selection: Selection, route: string) {
  const book = bookContents(selection);
  for (const part of book.parts) for (const chapter of part.chapters) {
    const page = chapter.pages.find(p => p.route === route);
    if (page) return { page, part, chapter };
  }
  return null;
}
export function renderBreadcrumb(selection: Selection, route: string, base = '/') {
  if (route === '/' || route === '/contents/') return `<span>You are here: </span><span aria-current="page">${route === '/' ? 'Home' : 'Contents'}</span>`;
  const place = location(selection, route);
  if (!place) return '';
  const { page, part, chapter } = place;
  const parent = chapter.pages.find(p=>p.route===chapter.frontRoute);
  const partLink = part.route && part.route !== route && selection.manifest.routes.includes(part.route) ? link({ route: part.route, title: part.name }, base) : esc(part.name);
  const middle = parent && chapter.name !== part.name && parent.route !== route && parent.route !== part.route ? ` <span aria-hidden="true">›</span> ${link(parent, base, chapter.name)}` : '';
  return `<span>You are here: </span>${partLink}${middle} <span aria-hidden="true">›</span> <span aria-current="page">${esc(page.title)}</span>`;
}
export function renderPageTurn(selection: Selection, route: string, base = '/') {
  const place = location(selection, route);
  const pages = route==='/'?[...bookContents(selection).home,...bookContents(selection).parts[0].chapters.flatMap(c=>c.pages)]:place?.part.chapters.flatMap(c => c.pages) ?? [];
  const i = pages.findIndex(p => p.route === route), previous = pages[i - 1], next = i >= 0 ? pages[i + 1] : undefined;
  return `${previous ? `<a rel="prev" href="${esc(withBase(previous.route, base))}"><span>← Previous</span><span>${esc(previous.title)}</span></a>` : '<span class="page-turn-end">Beginning</span>'}<a href="${esc(withBase('/contents/', base))}">Contents</a>${next ? `<a rel="next" href="${esc(withBase(next.route, base))}"><span>Next →</span><span>${esc(next.title)}</span></a>` : '<span class="page-turn-end">End</span>'}`;
}
export function renderRelated(selection: Selection, route: string, base = '/') {
  const entry = selection.entries.find(e => e.route === route);
  if (!entry) return '';
  const pages = bookContents(selection).parts.flatMap(p => p.chapters.flatMap(c => c.pages));
  const $ = load(renderEntrySync(selection.corpus, entry, '/'), null, false);
  const linkedRoutes = new Set($('a[href]').toArray().map(a => $(a).attr('href')!.split('#')[0]));
  const ids = new Set([...entry.related, ...entry.dependsOn]);
  const candidates = pages.filter(p => p.route !== route
    && (['concept', 'example', 'evidence'].includes(p.kind) || p.route.startsWith('/claims/') || p.route.startsWith('/evidence/') || p.entry && entry.related.includes(p.entry.id))
    && (p.entry && ids.has(p.entry.id) || linkedRoutes.has(p.route)));
  // Prefer one of each relevant family before filling remaining places, so a
  // long dependency list cannot crowd out a recorded cross-family relation.
  const family = (p: BookPage) => p.route.startsWith('/claims/') ? 'claim' : p.kind === 'concept' ? 'concept' : p.kind === 'example' ? 'example' : typeLabel(p);
  const chosen: BookPage[] = [];
  for (const p of candidates) if (!chosen.some(other => family(other) === family(p))) chosen.push(p);
  for (const p of candidates) if (!chosen.includes(p)) chosen.push(p);
  return chosen.length ? `<h2>Related</h2><ul>${chosen.slice(0, 6).map(p => `<li>${link(p, base)}${historical(p)?' <span class="reading-note">(historical edition)</span>':''}</li>`).join('')}</ul>` : '';
}
export function renderSectionIndex(selection: Selection, route: string, base = '/') {
  const book = bookContents(selection);
  let pages: BookPage[] = [];
  if (route === '/concepts/') pages = book.parts[0].chapters[1].pages;
  if (route === '/examples/') {
    const groups = book.parts[1].chapters.filter(c => c.pages.some(p => p.route !== route));
    return `<section class="section-reading-list"><h2>Read in order</h2>${groups.map(c => `<section><h3>${esc(c.name === 'Basics' ? 'Basics: how a shape and its activity hold each other' : c.name)}</h3>${rows(c.pages.filter(p => p.route !== route), base)}</section>`).join('')}</section>`;
  }
  if (route === '/evidence/') pages = book.parts[2].chapters.flatMap(c => c.pages);
  if (route === '/research-status/') return `<section class="section-reading-list"><h2>Read in order</h2>${book.parts[3].chapters.map(c=>rows(c.pages.filter(p=>p.route!==route && !p.route.startsWith('/claims/')),base)+(c.claims?claimList(c.pages.filter(p=>p.route.startsWith('/claims/')),base,'h3'):'')).join('')}<h2>Explore further</h2>${rows(book.parts[4].chapters.flatMap(c=>c.pages),base)}</section>`;
  if (route === '/documents/') pages = book.parts[3].chapters.find(c => c.name === 'Technical documents')!.pages;
  return pages.length ? `<section class="section-reading-list"><h2>Read in order</h2>${rows(pages.filter(p => p.route !== route), base)}</section>` : '';
}
