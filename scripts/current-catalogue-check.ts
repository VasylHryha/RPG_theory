import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import type { Corpus } from '../src/lib/content.js';
import { renderEntrySync } from '../src/lib/content.js';
import { ContractError } from '../src/lib/errors.js';

type Case = { id: string; doi: string; url: string; arrows: string[]; [key: string]: unknown };
type FurtherReading = { id: string; title: string; doi?: string; url?: string; website_bib_id?: string };
type Register = { cases: Case[]; further_reading: FurtherReading[] };
export type Label = { sourceKey: string; edition: string; label: string; meaning: string; route: string; fragment: string; bibliographyId?: string };
export type LinkMap = { labels: Label[]; caseEdges: (Omit<Label,'route'|'fragment'> & { entryId: string; bibliographyId: string; support: string; locator: string; readDepth: string })[] };
const required = ['id','title','authors','year','doi','url','publication','evidence_type','rrg_relation','arrows','finding','externally_supplied','scope_limit','read_coverage','checked_on'];
const doi = (s: string) => s.replace(/^https:\/\/doi\.org\//i, '').toLowerCase().replace(/\/$/, '');
const fail = (message: string): never => { throw new ContractError('CURRENT_CATALOGUE_FAILURE', message); };

// Adapted inventory check. Original bundle checks remain preserved; absent
// archives and historical calculations cannot silently become fresh passes.
export function validateCurrentCatalogue(corpus: Corpus, register: Register, catalogue: string, map: LinkMap) {
  const all = [...register.cases, ...register.further_reading];
  for (const values of [all.map(c => c.id), all.flatMap(c => c.doi ? [doi(c.doi)] : [])]) if (new Set(values).size !== values.length) fail('Duplicate registered local label or DOI');
  const cases = [...catalogue.matchAll(/^## (E\d+) — /gm)].map(m => m[1]);
  if (new Set(cases).size !== cases.length || JSON.stringify([...cases].sort()) !== JSON.stringify(register.cases.map(c => c.id).sort())) fail('Catalogue headings differ from selected case inventory');
  const claims = new Set([...catalogue.matchAll(/^\| (C\d+) \|/gm)].map(m => m[1]));
  const labelKeys = map.labels.map(l => JSON.stringify([l.sourceKey,l.edition,l.label]));
  if (new Set(labelKeys).size !== labelKeys.length) fail('Duplicate document-and-edition-qualified label');
  const guide = corpus.entries.get('DOC-SOURCE-LINKS') ?? fail('Missing source connection reading');
  const html = load(renderEntrySync(corpus, guide));
  for (const [sourceKey,pattern] of [
    ['R-CURRENT-BACKGROUND',/^### (C\d+) — (.+)$/gm],
    ['R-CURRENT-CATALOGUE',/^\| (C\d+) \| (.+?) \|$/gm],
    ['R-CURRENT-CLAIMS',/^\| (H\d+) \| (.+?) \|/gm],
    ['R-CURRENT-CLAIMS',/^\*\*(O\d+) — (.+?)\.\*\*/gm]
  ] as const) {
    const raw=readFileSync(resolve(corpus.root,corpus.sources.get(sourceKey)!.path),'utf8');
    const expected=[...raw.matchAll(pattern)];
    const actual=map.labels.filter(l=>l.sourceKey===sourceKey && l.label.startsWith(expected[0]?.[1][0] ?? '!'));
    if (actual.length!==expected.length || expected.some(m=>!actual.some(l=>l.label===m[1] && l.meaning===m[2]))) fail(`Claim labels differ from source document: ${sourceKey}`);
  }
  for (const label of map.labels) {
    const source = corpus.sources.get(label.sourceKey);
    const entry = [...corpus.entries.values()].find(e => e.route === label.route) ?? fail(`Wrong document or edition: ${label.label}`);
    if (!source || source.edition !== label.edition || entry.sourceBinding?.sourceKey !== label.sourceKey) fail(`Wrong document or edition: ${label.label}`);
    if (!label.meaning.trim() || !html.text().includes(label.meaning)) fail(`Missing displayed meaning: ${label.label}`);
    const excludedHistory=entry.publicationState==='archived' && html.text().includes(label.meaning+' (historical reading excluded from this edition)');
    if (!excludedHistory && !html('a').toArray().some(el => html(el).attr('href') === label.route + (label.fragment ? '#' + label.fragment : ''))) fail(`Missing displayed label destination: ${label.label}`);
    if (label.fragment) {
      const target = load(renderEntrySync(corpus, entry));
      if (!target('[id]').toArray().some(el => target(el).attr('id') === label.fragment)) fail(`Missing document anchor: ${label.label}`);
    }
    if (label.bibliographyId && !corpus.references.has(label.bibliographyId)) fail(`Unknown bibliography: ${label.label}`);
  }
  for (const c of register.cases) {
    if (!required.every(key => c[key] !== undefined && c[key] !== null && c[key] !== '')) fail(`Incomplete case: ${c.id}`);
    if (!/^10\.\d{4,9}\/\S+$/.test(c.doi) || doi(c.url) !== doi(c.doi)) fail(`Invalid DOI: ${c.id}`);
    if (!Array.isArray(c.arrows) || c.arrows.some(a => !claims.has(a))) fail(`Unknown 06 claim: ${c.id}`);
    const edge = map.caseEdges.filter(e => e.sourceKey === 'R-CURRENT-CATALOGUE' && e.label === c.id);
    if (edge.length !== 1) fail(`Missing/duplicate selected case edge: ${c.id}`);
    const e = edge[0], entry = corpus.entries.get(e.entryId), ref = corpus.references.get(e.bibliographyId);
    if (!entry?.sourceBinding || entry.sourceBinding.sourceKey !== e.sourceKey || !entry.statement?.includes(c.id) || !entry.statement.includes(c.doi) || !ref || doi(ref.url) !== doi(c.doi) || !entry.bibRefs.includes(ref.id)) fail(`Case → binding → bibliography mismatch: ${c.id}`);
    if (![e.support,e.locator,e.readDepth].every(v => v?.trim())) fail(`Incomplete support edge: ${c.id}`);
    if (!html.text().includes(e.support) || !html.text().includes(e.locator) || !html.text().includes(e.readDepth)) fail(`Missing displayed support/locator/read-depth: ${c.id}`);
  }
  if (map.caseEdges.filter(e => e.sourceKey === 'R-CURRENT-CATALOGUE').length !== register.cases.length) fail('Extra unselected case edge');
  for (const c of register.further_reading) {
    // v0.3.1 adds framework reading records; the unchanged 06 catalogue still
    // owns only its original further-reading labels. Simon has a JSTOR URL.
    if (c.website_bib_id) {
      const url = c.url ?? (c.doi ? `https://doi.org/${c.doi}` : '');
      const ref = corpus.references.get(c.website_bib_id);
      if (!url || !ref || ref.url !== url || ref.title !== c.title || corpus.aliases.get(`R-CURRENT-SCIENCE:${url}`) !== ref.id) fail(`Unresolved framework further-reading publication: ${c.id}`);
      const framework = corpus.sources.get('R-CURRENT-SCIENCE');
      if (!framework || !readFileSync(resolve(corpus.root, framework.path), 'utf8').includes(url)) fail(`Missing framework publication destination: ${c.id}`);
      continue;
    }
    const registeredDOI = c.doi ?? fail(`Missing catalogue further-reading DOI: ${c.id}`);
    const alias = corpus.aliases.get(`R-CURRENT-CATALOGUE:https://doi.org/${registeredDOI}`);
    if (!alias || doi(corpus.references.get(alias)!.url) !== doi(registeredDOI)) fail(`Unresolved further-reading publication: ${c.id}`);
    if (!map.labels.some(l=>l.sourceKey==='R-CURRENT-CATALOGUE' && l.label===c.id && l.meaning===c.title)) fail(`Missing further-reading label: ${c.id}`);
  }
  const history=readFileSync(resolve(corpus.root,corpus.sources.get('R-HISTORY-REPO-ADDITIONAL')!.path),'utf8');
  // Bound each case at the next heading; blank lines are part of its excerpt.
  const sections=[...history.matchAll(/^### (E\d+) [\s\S]*?(?=^### E\d+ |$(?![\s\S]))/gm)];
  const recovered=map.caseEdges.filter(e=>e.sourceKey==='R-HISTORY-REPO-ADDITIONAL');
  if (sections.length!==recovered.length) fail('Recovered predecessor inventory differs');
  for (const section of sections) {
    const edge=recovered.find(e=>e.label===section[1]);
    const publication=/https:\/\/doi\.org\/([^\s)]+)/.exec(section[0])?.[1];
    if (!edge || !publication || doi(corpus.references.get(edge.bibliographyId)?.url ?? '')!==doi(publication)) fail(`Wrong predecessor publication: ${section[1]}`);
  }
  return { status:'PASS', scope:'selected repository inventory and editorial mapping; not original-bundle validation or scientific reproduction', primaryCases:register.cases.length, furtherReading:register.further_reading.length, documentQualifiedLabels:map.labels.length, caseEdges:map.caseEdges.length };
}

export function checkCurrentCatalogue(corpus: Corpus) {
  const read = (path: string) => readFileSync(resolve(corpus.root,path),'utf8');
  return validateCurrentCatalogue(corpus, JSON.parse(read('research/RRG_CURRENT/sources.json')), read('research/RRG_CURRENT/06_evidence_catalog.md'), JSON.parse(read('research/publication/source-link-map.json')));
}
