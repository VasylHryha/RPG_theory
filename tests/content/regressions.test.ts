import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderMarkdown } from '../../src/lib/markdown.js';
import { withBase, assertUniqueRoutes } from '../../src/lib/urls.js';
import { load } from 'cheerio';
import { loadCanonicalCorpus, renderEntrySync } from '../../src/lib/content.js';
import { sourceDisplay } from '../../src/lib/source-display.js';
import { withdrawnTombstone } from '../../src/lib/publication.js';
import { renderRecordDetails } from '../../src/lib/presentation.js';
import { bookContents, readingPages, renderBreadcrumb, renderPageTurn, renderRelated } from '../../src/lib/contents.js';

test('Markdown renders accessible math and base-aware links, and rejects executable input', async () => {
  const html = await renderMarkdown('[Start][link]\n\n[link]: /start/\n\n$$x^2+1$$', '/rrg_theory/');
  assert.match(html, /href="\/rrg_theory\/start\/"/);
  assert.match(html, /<math/);
  await assert.rejects(renderMarkdown('<script>alert(1)</script>'), /UNSAFE_MARKDOWN/);
  await assert.rejects(renderMarkdown('[Bad](javascript:alert)'), /UNSAFE_MARKDOWN/);
});
test('math macros stay local to one document and cannot create active links', async () => {
  assert.match(await renderMarkdown('$$\\gdef\\onlyhere{z}\\onlyhere$$'), /<math/);
  await assert.rejects(renderMarkdown('$$\\onlyhere$$'), /MATH_RENDER_FAILURE/);
  assert.doesNotMatch(await renderMarkdown('$$\\href{javascript:alert(1)}{x}$$'), /<a\b|href="javascript:/);
});
test('route normalization refuses encoded traversal and case collisions', () => {
  assert.equal(withBase('/start/', '/rrg_theory/'), '/rrg_theory/start/');
  assert.throws(() => withBase('/%252e%252e/private'), /UNSAFE_ROUTE/);
  assert.throws(() => assertUniqueRoutes(['/Start/', '/start/']), /ROUTE_COLLISION/);
});
test('archive intake preserves raw bytes and rejects unsafe members', () => {
  const temporaryRoot = resolve('docs/evidence/test-suite-proportionate/fixtures');
  mkdirSync(temporaryRoot, { recursive: true });
  const result = spawnSync('python3', ['-m', 'unittest', 'tests/content/test_archive.py'], {
    encoding: 'utf8', env: { ...process.env, TMPDIR: temporaryRoot, PYTHONDONTWRITEBYTECODE: '1' }
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
let corpus: ReturnType<typeof loadCanonicalCorpus>;
test('Contents includes new pages, refuses missing metadata and navigates actual parent pages', () => {
  corpus ??= loadCanonicalCorpus();
  const page = { ...corpus.entries.get('DOC-START')!, id: 'DOC-UNASSIGNED', route: '/new-reading/' };
  const selection = { entries: [page], manifest: { routes: [page.route] } };
  const book = bookContents(selection);
  assert.deepEqual(book.parts.find(p => p.name === 'Other')!.chapters.flatMap(c => c.pages.map(p => p.route)), [page.route]);
  assert.throws(() => bookContents({ ...selection, manifest: { routes: [...selection.manifest.routes, '/unregistered/'] } }), /CONTENTS_MEMBERSHIP_FAILURE/);
  const entries=[...corpus.entries.values()];
  const actual={corpus,entries,manifest:{routes:[...entries.map(e=>e.route),...Object.keys(readingPages)]}};
  const hrefs=(html:string)=>load(html)('a').toArray().map(a=>a.attribs.href);
  for(const route of ['/examples/water/','/examples/star/']) assert.deepEqual(hrefs(renderBreadcrumb(actual,route)),['/examples/']);
  assert.deepEqual(hrefs(renderBreadcrumb(actual,'/about/')),[]);
  assert.deepEqual(hrefs(renderBreadcrumb(actual,'/concepts/stability/')),['/start/','/concepts/']);
  assert.equal(load(renderPageTurn(actual,'/','/rrg_theory/'))('a[rel="next"]').attr('href'),'/rrg_theory/start/');
  const related=hrefs(renderRelated(actual,'/evidence/additional/'));
  assert.ok(related.length>0 && related.length<=6);
  assert.ok(related.every(route=>corpus.entries.get('DOC-ADDITIONAL-EVIDENCE')!.dependsOn.some(id=>corpus.entries.get(id)!.route===route)));
});
test('the repaired mathematical source section keeps separate display equations', () => {
  corpus ??= loadCanonicalCorpus();
  const entry = corpus.entries.get('DOC-MATH')!, display = sourceDisplay(entry.statement!, entry.adapter);
  const section = display.slice(display.indexOf('## 39.'), display.indexOf('## 40.'));
  const $ = load(renderEntrySync(corpus, { ...entry, statement: section, adapter: 'markdown/1' }));
  assert.equal($('.katex-display').length, 4);
});
test('withdrawal strips former content from metadata and rendered regions', () => {
  corpus ??= loadCanonicalCorpus();
  const entry = structuredClone(corpus.entries.get('UT-D01')!);
  for (const key of ['title', 'description', 'scope', 'limits', 'plainLanguage', 'sourceMapping', 'body'] as const) entry[key] = 'OLD_METADATA_CONTROL';
  const tombstone = withdrawnTombstone(entry);
  assert.doesNotMatch(JSON.stringify(tombstone) + renderEntrySync(corpus, tombstone) + renderRecordDetails(corpus, tombstone), /OLD_METADATA_CONTROL/);
  assert.equal(tombstone.statement, null);
  assert.deepEqual(tombstone.bibRefs, []);
});
