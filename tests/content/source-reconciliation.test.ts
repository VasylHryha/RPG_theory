import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { loadCanonicalCorpus, renderEntrySync } from '../../src/lib/content.js';
import { publicationFor } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { explanatoryMarkdown, publicationAssets, verifyArchive } from '../../src/lib/publication-assets.js';
import { rawPath } from '../../src/lib/source-paths.js';
import { renderLibrary, renderSourceBacklinks } from '../../src/lib/library.js';
import { sha256 } from '../../src/lib/identity.js';

const corpus = loadCanonicalCorpus();

test('document links, reference-style links and case sections resolve to real HTML at both bases', () => {
  const original = corpus.entries.get('DOC-ILLUSTRATIONS')!;
  const entry = { ...original, adapter: 'markdown/1' as const, statement: '[case](06_evidence_catalog.md#e21)\n\n[another case][case]\n\n[case]: 06_evidence_catalog.md#e03\n\n[check](checks/verification_results.json)\n\n[Unavailable companion](archive/old.md)', body: '' };
  const target = load(renderEntrySync(corpus, corpus.entries.get('DOC-CATALOGUE')!));
  for (const base of ['/', '/unity-theory/']) {
    const html = load(renderEntrySync(corpus, entry, base));
    const links = html('a').toArray().map(el => html(el).attr('href')!);
    assert.equal(links.length, 3);
    for (const href of links.slice(0, 2)) {
      assert.ok(href.startsWith(base + 'evidence/catalogue/#'));
      assert.ok(target('[id]').toArray().some(el => target(el).attr('id') === href.split('#')[1]));
    }
    assert.equal(links[2], base + 'downloads/original/R-CURRENT-CHECKS-VERIFICATION-RESULTS-JSON.json');
    assert.match(html.text(), /original source file/);
    assert.match(html.text(), /Unavailable companion \(source material unavailable on this website\)/);
    assert.doesNotMatch(html.html(), /archive\/old\.md|href="(?:\.\/|\.\.\/|[^"/]+\.md)/);
    const exported = explanatoryMarkdown(corpus, entry, { ...loadSiteConfig(), basePath: base });
    assert.match(exported, /\.\/DOC-CATALOGUE\.md#e21/);
    assert.match(exported, /\.\.\/original\/R-CURRENT-CHECKS-VERIFICATION-RESULTS-JSON\.json/);
  }
});

test('current source downloads preserve exact bytes and correct file types; historical drafts stay outside exports and navigation', () => {
  const selection = publicationFor('preview', loadSiteConfig());
  const assets = publicationAssets(selection, loadSiteConfig());
  verifyArchive(assets.files.get(assets.zipPath)!);
  for (const key of selection.manifest.sourceDownloadKeys) {
    const source = corpus.sources.get(key)!;
    assert.equal(sha256(assets.files.get(rawPath(key, source.path))!), source.sha256);
    assert.ok(source.path.startsWith('research/RRG_CURRENT/'));
  }
  for (const entry of selection.entries.filter(e => e.publicationState === 'archived')) {
    assert.equal(entry.publishedAt, null);
    for (const ids of [selection.manifest.navigationIds, selection.manifest.searchIds, selection.manifest.exportIds, selection.manifest.sitemapIds]) assert.ok(!ids.includes(entry.id));
  }
  assert.match(renderLibrary(selection), /Evidence catalogue/);
  assert.match(renderLibrary(selection), /Historical Sources/);
  assert.doesNotMatch(renderSourceBacklinks(selection), /<h3>[^<]*\.md<\/h3>/);
  // Fidelity may be completed independently; drafts still cannot enter discovery.
  assert.deepEqual(selection.manifest.searchIds, []);
  assert.deepEqual(selection.manifest.sitemapIds, []);
  assert.equal(selection.manifest.deployEligible, false);
  assert.equal(corpus.websiteReviews.length, JSON.parse(readFileSync('research/publication/website-reviews.yaml', 'utf8')).length);
});
