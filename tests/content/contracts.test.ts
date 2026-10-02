import { activePublication, publicationFor } from '../../src/lib/publication.js';
import { renderEntrySync } from '../../src/lib/content.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { qualifyCurrentSource, validateBinding, verifyIdentities, type AdmissionRecord } from '../../src/lib/source-admission.js';
import { sha256, stableJSON } from '../../src/lib/identity.js';
import { assertUniqueRoutes, withBase } from '../../src/lib/urls.js';
import { assertBuildAllowed } from '../../src/lib/publication.js';
import { loadSiteConfig } from '../../src/lib/site-config.js';
import { renderMarkdown } from '../../src/lib/markdown.js';
import { auditOutput } from '../../scripts/audit-output.js';
import { renderStatus, renderRecordDetails, renderReferences, renderNavigation, renderHomeStatus, renderEditorialState } from '../../src/lib/presentation.js';
const privateRoutes=activePublication().manifest.routes;
import { buildInputs, syntheticRoutes } from '../../src/lib/build-identity.js';

function fixture(run: (directory: string, record: AdmissionRecord) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'unity-intake-'));
  try {
    const bodies: Record<string, string> = {
      '00_LOCKED_CORE.md': '# Synthetic core\nOriginal synthetic definition.\n',
      'CURRENT_MANIFEST.md': '# Synthetic manifest\n\n## Active files\n- `00_LOCKED_CORE.md`\n- `status.md`\n',
      'status.md': '# Synthetic status\nNo scientific evidence.\n'
    };
    for (const [path, content] of Object.entries(bodies)) writeFileSync(join(directory, path), content);
    const files = Object.entries(bodies).sort(([a], [b]) => a.localeCompare(b)).map(([path, body]) => ({ path, bytes: Buffer.byteLength(body), sha256: sha256(body), role: 'synthetic' }));
    const record: AdmissionRecord = {
      schema: 'unity-source-intake/1', corpusScope: 'synthetic', sourceReference: 'isolated test fixture', directory,
      edition: 'synthetic-1', corePath: '00_LOCKED_CORE.md', coreSha256: sha256(bodies['00_LOCKED_CORE.md']),
      manifestPath: 'CURRENT_MANIFEST.md', manifestFormat: 'markdown-active-files/1', manifestSha256: sha256(bodies['CURRENT_MANIFEST.md']), manifestMembers: ['00_LOCKED_CORE.md', 'status.md'],
      files, inventorySeal: sha256(stableJSON(files)), priorCoreSha256: null, revision: null,
      inspection: { outcome: 'accepted', inspectedFiles: files.map(f => f.path), evidenceRef: 'synthetic test only' }, bindings: [], contentReview: 'pending'
    };
    run(directory, record);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('missing current sources reach CURRENT_SOURCE_PACKAGE_MISSING', () => {
  assert.throws(() => qualifyCurrentSource(null), /CURRENT_SOURCE_PACKAGE_MISSING/);
});
test('one-byte history mutation reaches HISTORICAL_INTEGRITY_FAILURE', () => fixture((directory, record) => {
  writeFileSync(join(directory, 'status.md'), readFileSync(join(directory, 'status.md'), 'utf8') + 'x');
  assert.throws(() => verifyIdentities(directory, record.files, 'HISTORICAL_INTEGRITY_FAILURE'), /HISTORICAL_INTEGRITY_FAILURE/);
}));
test('unrecorded core change reaches LOCKED_CORE_MISMATCH', () => fixture((directory, record) => {
  writeFileSync(join(directory, record.corePath), '# Changed synthetic core\n');
  assert.throws(() => qualifyCurrentSource(record), /LOCKED_CORE_MISMATCH/);
}));
test('missing required manifest member reaches CURRENT_MANIFEST_INCOMPLETE', () => fixture((directory, record) => {
  rmSync(join(directory, 'status.md'));
  assert.throws(() => qualifyCurrentSource(record), /CURRENT_MANIFEST_INCOMPLETE/);
}));
test('mixed stale sibling with matching core reaches SOURCE_INTEGRITY_FAILURE', () => fixture((directory, record) => {
  writeFileSync(join(directory, 'status.md'), 'stale sibling from another edition');
  assert.throws(() => qualifyCurrentSource(record), /SOURCE_INTEGRITY_FAILURE/);
}));
test('wrong source/excerpt binding reaches SOURCE_BINDING_FAILURE', () => fixture((directory, record) => {
  assert.throws(() => validateBinding(directory, { path: record.corePath, sourceSha256: '0'.repeat(64), startLine: 1, endLine: 1, excerptSha256: sha256('# Synthetic core\n') }), /SOURCE_BINDING_FAILURE/);
  record.bindings = [{ path: record.corePath, sourceSha256: record.coreSha256, startLine: 2, endLine: 2, excerptSha256: '0'.repeat(64) }];
  assert.throws(() => qualifyCurrentSource(record), /SOURCE_BINDING_FAILURE/);
}));
test('history offered as current reaches LEGACY_SOURCE_REJECTED', () => fixture((_directory, record) => {
  record.files[0].role = 'history_only';
  assert.throws(() => qualifyCurrentSource(record), /LEGACY_SOURCE_REJECTED/);
}));
test('complete justified revised synthetic edition passes without historical-pin veto', () => fixture((directory, record) => {
  const updated = '# Synthetic core\nA revised synthetic definition.\n';
  record.priorCoreSha256 = record.coreSha256;
  writeFileSync(join(directory, record.corePath), updated);
  record.coreSha256 = sha256(updated);
  record.files = record.files.map(f => f.path === record.corePath ? { ...f, bytes: Buffer.byteLength(updated), sha256: record.coreSha256 } : f);
  record.inventorySeal = sha256(stableJSON(record.files));
  record.bindings = [{ path: record.corePath, sourceSha256: record.coreSha256, startLine: 2, endLine: 2, excerptSha256: sha256('A revised synthetic definition.\n') }];
  record.revision = { category: 'definition-core', predecessor: 'synthetic-1', problem: 'test changes a definition', before: 'original synthetic definition', after: 'revised synthetic definition', rationale: 'test positive authorized revision handling', permissionBasis: 'synthetic unit-test scope', dependentReviewHashes: [sha256(stableJSON(record.bindings))] };
  const result = qualifyCurrentSource(record);
  assert.equal(result.bytesVerified, true);
  assert.equal(result.currentSourceQualified, false);
  assert.equal(result.corpusScope, 'synthetic');
}));
test('silent edition-pin reset still fails', () => fixture((_directory, record) => {
  record.priorCoreSha256 = '0'.repeat(64);
  assert.throws(() => qualifyCurrentSource(record), /LOCKED_CORE_MISMATCH/);
}));
test('recorded membership omissions, duplicates and unknown manifest formats fail against actual text', () => fixture((_directory, record) => {
  const members = record.manifestMembers;
  record.manifestMembers = [record.corePath];
  assert.throws(() => qualifyCurrentSource(record), /CURRENT_MANIFEST_INCOMPLETE/);
  record.manifestMembers = [...members, members[0]];
  assert.throws(() => qualifyCurrentSource(record), /CURRENT_MANIFEST_INCOMPLETE/);
  record.manifestMembers = members;
  record.manifestFormat = 'uninspected-format' as AdmissionRecord['manifestFormat'];
  assert.throws(() => qualifyCurrentSource(record), /CURRENT_MANIFEST_INCOMPLETE/);
}));
test('root, subpath, file endpoints and path collisions use the same URL owner', () => {
  assert.equal(withBase('/start/', '/'), '/start/');
  assert.equal(withBase('/start/', '/unity-theory'), '/unity-theory/start/');
  assert.equal(withBase('/', '/unity-theory/'), '/unity-theory/');
  assert.equal(withBase('/rss.xml', '/unity-theory/'), '/unity-theory/rss.xml');
  assert.throws(() => assertUniqueRoutes(['/Start/', '/start/']), /ROUTE_COLLISION/);
  assert.throws(() => assertUniqueRoutes(['/%2573tart/', '/start/']), /ROUTE_COLLISION/);
  for (const path of ['/../private', '/%2e%2e/private', '/%252e%252e/private', '//external.invalid', '/a//b', '/a\\b']) assert.throws(() => withBase(path), /UNSAFE_ROUTE/);
});
test('release with fixture host or unqualified scientific corpus fails closed', () => {
  const config = loadSiteConfig();
  assert.throws(() => assertBuildAllowed('release', config, { currentSourceQualified: false, corpusScope: 'current' }), /PUBLIC_TARGET_REQUIRED/);
  const real = { ...config, origin: 'https://example.org', repository: { owner: 'synthetic-owner', name: 'synthetic-repo' } };
  assert.throws(() => assertBuildAllowed('release', real, { currentSourceQualified: false, corpusScope: 'current' }), /CURRENT_SOURCE_NOT_QUALIFIED/);
  assert.throws(() => assertBuildAllowed('release', real, { currentSourceQualified: true, corpusScope: 'synthetic' }), /CURRENT_SOURCE_NOT_QUALIFIED/);
  assert.throws(() => assertBuildAllowed('release', real, { currentSourceQualified: true, corpusScope: 'current' }), /PUBLIC_AUTHORIZATION_REQUIRED/);
  assert.throws(() => assertBuildAllowed('release', { ...real, publicAuthorization: true }, { currentSourceQualified: true, corpusScope: 'current' }), /RELEASE_PIPELINE_NOT_IMPLEMENTED/);
});
function outputFixture(run: (directory: string, info: ReturnType<typeof outputInfo>) => void) {
  const directory = mkdtempSync(join(tmpdir(), 'unity-output-'));
  try {
    const info = outputInfo();
    writeFileSync(join(directory, 'build-info.json'), JSON.stringify(info));
    const selected=activePublication();
    for (const route of privateRoutes) {
      const file=route.endsWith('/') ? (route==='/'?'index.html':route.slice(1)+'index.html') : route.slice(1);
      const entry=selected.entries.find(e=>e.route===route);
      let body=entry ? `<div data-canonical-body="${entry.id}">${renderEntrySync(selected.corpus,entry,info.config.basePath)}</div>` : '';
      if(entry && !['DOC-HOME','DOC-START'].includes(entry.id)) body+=`<div data-record-status="${entry.id}">${renderStatus(selected.corpus,entry)}</div><div data-record-details="${entry.id}">${renderRecordDetails(selected.corpus,entry,info.config.basePath)}</div>`;
      if(entry && ['DOC-HOME','DOC-START'].includes(entry.id)) body+=`<p data-editorial-state="${entry.id}">${renderEditorialState(selected.corpus,entry)}</p>`;
      if(entry?.id==='DOC-HOME') body+=`<div data-source-projection="DOC-STATUS">${renderHomeStatus(selected.corpus,selected.entries.find(e=>e.id==='DOC-STATUS')!,info.config.basePath)}</div>`;
      if(route==='/references/') body=`<div data-bibliography>${renderReferences(selected.references,selected.entries,info.config.basePath)}</div>`;
      mkdirSync(join(directory, file, '..'), { recursive: true });
      writeFileSync(join(directory, file), `<html><head><title>${entry ? entry.title+' · Unity Theory' : 'Isolated output fixture'}</title><meta name="description" content="${entry?.description ?? ''}"><meta name="robots" content="noindex"><link rel="canonical" href="${info.config.origin}${withBase(route, info.config.basePath)}"></head><body><nav data-publication-navigation>${renderNavigation(selected,route,info.config.basePath)}</nav><h1 id="research-question">${entry?.title ?? 'Isolated output fixture'}</h1>${body}</body></html>`);
    }
    writeFileSync(join(directory, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    writeFileSync(join(directory, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    run(directory, info);
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
function outputInfo() {
  const config = { ...loadSiteConfig(), basePath: '/unity-theory/' };
  return { schema: 'unity-build-info/1', mode: 'preview', deployEligible: false, corpusScope: 'private-editorial-preview', currentSourceQualified: false, sourceIntake: publicationFor('preview',config).admission, config, configSha256: sha256(stableJSON(config)), routes: privateRoutes, syntheticRoutes, publicationManifest:publicationFor('preview',config).manifest, publicationManifestSha256:publicationFor('preview',config).manifestSha256, ...buildInputs() };
}
test('root-only asset in subpath output reaches BASE_PATH_FAILURE', () => outputFixture((directory) => {
    const path=join(directory,'index.html');
    writeFileSync(path,readFileSync(path,'utf8').replace('</head>','<link rel="icon" href="/favicon.svg"></head>'));
    assert.throws(() => auditOutput(directory), /BASE_PATH_FAILURE/);
}));
test('output audit requires routes, rejects extra private files and stale/relabelled identity', () => outputFixture((directory, info) => {
  assert.equal(auditOutput(directory).status, 'PASS');
  writeFileSync(join(directory, 'private.md'), 'PRIVATE_SENTINEL');
  assert.throws(() => auditOutput(directory), /UNEXPECTED_OUTPUT/);
  rmSync(join(directory, 'private.md'));
  writeFileSync(join(directory, 'build-info.json'), JSON.stringify({ ...info, mode: 'release' }));
  assert.throws(() => auditOutput(directory), /INVALID_ARTIFACT_IDENTITY/);
  writeFileSync(join(directory, 'build-info.json'), JSON.stringify({ ...info, inputsSha256: '0'.repeat(64) }));
  assert.throws(() => auditOutput(directory), /STALE_BUILD_INPUTS/);
  writeFileSync(join(directory, 'build-info.json'), JSON.stringify(info));
  rmSync(join(directory, 'fixtures/math/index.html'));
  assert.throws(() => auditOutput(directory), /MISSING_OUTPUT/);
}));
test('absolute same-site links/fragments are local; unsafe links and remote resources fail', () => outputFixture((directory, info) => {
  const path = join(directory, 'index.html');
  const original = readFileSync(path, 'utf8');
  const insert = (markup: string) => writeFileSync(path, original.replace('</body>', markup + '</body>'));
  insert(`<a href="${info.config.origin}/unity-theory/start/">Valid absolute link</a>`);
  assert.equal(auditOutput(directory).status, 'PASS');
  insert(`<a href="${info.config.origin}/unity-theory/start/#missing">Broken fragment</a>`);
  assert.throws(() => auditOutput(directory), /BROKEN_FRAGMENT/);
  insert(`<a href="${info.config.origin}/unity-theory/missing/">Missing</a>`);
  assert.throws(() => auditOutput(directory), /BROKEN_OUTPUT_LINK/);
  insert('<a href="javascript:alert(1)">Unsafe</a>');
  assert.throws(() => auditOutput(directory), /UNSAFE_OUTPUT_URL/);
  insert('<img src="https://remote.invalid/image.png" alt="Remote">');
  assert.throws(() => auditOutput(directory), /UNSAFE_OUTPUT_URL/);
  insert('<svg onload="alert(1)"></svg>');
  assert.throws(() => auditOutput(directory), /ACTIVE_OUTPUT/);
}));
test('artifact audit rejects false source identity and active SVG files', () => outputFixture((directory, info) => {
  writeFileSync(join(directory, 'build-info.json'), JSON.stringify({ ...info, sourceIntake: { ...info.sourceIntake, coreSha256: '0'.repeat(64) } }));
  assert.throws(() => auditOutput(directory), /STALE_SOURCE_IDENTITY/);
  writeFileSync(join(directory, 'build-info.json'), JSON.stringify(info));
  for (const svg of ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>', '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>', '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://external.invalid/tracker"/></svg>']) {
    writeFileSync(join(directory, 'favicon.svg'), svg);
    assert.throws(() => auditOutput(directory), /UNSAFE_SVG/);
  }
}));
test('Markdown renders MathML, prefixes links and rejects HTML/unsafe destinations', async () => {
  const html = await renderMarkdown('## Heading\n\n[Math](/start/)\n\n$$x^2+1$$', '/unity-theory/');
  assert.match(html, /href="\/unity-theory\/start\/"/);
  assert.match(html, /<math/);
  assert.match(html, /id="heading"/);
  await assert.rejects(renderMarkdown('<script>alert(1)</script>'), /UNSAFE_MARKDOWN/);
  await assert.rejects(renderMarkdown('[bad](javascript:alert)'), /UNSAFE_MARKDOWN/);
  await assert.rejects(renderMarkdown('$$\\unknowncommand{x}$$'), /Undefined control sequence|ParseError/);
});
test('Markdown reference links/images share safety and base handling', async () => {
  const html = await renderMarkdown('[start][x]\n\n[x]: /start/#main\n\n![icon][i]\n\n[i]: /favicon.svg', '/unity-theory/');
  assert.match(html, /href="\/unity-theory\/start\/#main"/);
  assert.match(html, /src="\/unity-theory\/favicon.svg"/);
  for (const destination of ['javascript:alert(1)', 'data:text/html,evil', '//external.invalid', 'https://user:password@example.org', '/%252e%252e/private']) {
    await assert.rejects(renderMarkdown(`[bad][x]\n\n[x]: ${destination}`), /UNSAFE_MARKDOWN|UNSAFE_ROUTE/);
  }
  await assert.rejects(renderMarkdown('![bad][x]\n\n[x]: https://example.org/tracker.svg'), /UNSAFE_MARKDOWN/);
  const code = await renderMarkdown('`<script>`\n\n```js\nimport x from "x"\n```');
  assert.doesNotMatch(code, /<script\b/);
  assert.match(code, /<code>(?:&#x3C;|&lt;)script/);
});
test('math macros cannot leak between documents and trusted HTML commands emit no active link', async () => {
  assert.match(await renderMarkdown('$$\\gdef\\onlyhere{z}\\onlyhere$$'), /<math/);
  await assert.rejects(renderMarkdown('$$\\onlyhere$$'), /MATH_RENDER_FAILURE/);
  const html = await renderMarkdown('$$\\href{javascript:alert(1)}{x}$$');
  assert.doesNotMatch(html, /<a\b|href="javascript:/);
});
test('safe archive extraction rejects traversal, absolute paths, symlinks, collisions and unexpected roots', () => {
  const result = spawnSync('python3', ['-m', 'unittest', 'tests/content/test_archive.py'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('output audit rejects changed source-bound display, manifest substitutions and draft sentinels',()=>outputFixture((directory,info)=>{
 const path=join(directory,'claims/UT-D01/index.html');const original=readFileSync(path,'utf8');
 writeFileSync(path,original.replace('Geometry is not limited','Locally overridden meaning is not limited'));
 assert.throws(()=>auditOutput(directory),/CONTENT_PARITY_FAILURE/);writeFileSync(path,original);
 writeFileSync(join(directory,'build-info.json'),JSON.stringify({...info,publicationManifest:{...info.publicationManifest,entries:[]}}));
 assert.throws(()=>auditOutput(directory),/PUBLICATION_MANIFEST_MISMATCH/);writeFileSync(join(directory,'build-info.json'),JSON.stringify(info));
 writeFileSync(path,original.replace('</body>','<p>DRAFT_SENTINEL_NOT_FOR_OUTPUT</p></body>'));assert.throws(()=>auditOutput(directory),/DRAFT_LEAK/);
}));

test('output audit binds bibliography text, destinations, support limits, status, projection and navigation',()=>outputFixture(directory=>{
  for(const [file,from,to,code] of [
    ['references/index.html','https://doi.org/10.1038/s41467-019-13746-6','https://example.org/wrong-paper','BIBLIOGRAPHY_PARITY_FAILURE'],
    ['references/index.html','Formation of optical supramolecular structures','Fabricated paper title','BIBLIOGRAPHY_PARITY_FAILURE'],
    ['references/index.html','Supplementary reference reported by the supplied documents.','Scientific support accepted.','BIBLIOGRAPHY_PARITY_FAILURE'],
    ['claims/UT-E01/index.html','<dd>Pending</dd>','<dd>Accepted</dd>','CONTENT_METADATA_PARITY_FAILURE'],
    ['index.html','Whether the four known fundamental interactions','All four fundamental interactions have been proved','CONTENT_PARITY_FAILURE'],
    ['index.html','How does a collection become a whole?</h1>','All interactions proved.</h1>','CONTENT_METADATA_PARITY_FAILURE'],
    ['start/index.html','Publication: Draft · private preview.','Publication: published.','CONTENT_METADATA_PARITY_FAILURE'],
    ['start/index.html','Source fidelity: Pending.','Source fidelity: Accepted.','CONTENT_METADATA_PARITY_FAILURE'],
    ['index.html','Research status</a>','All science accepted</a>','NAVIGATION_PARITY_FAILURE'],
  ]) {
    const path=join(directory,file),original=readFileSync(path,'utf8');assert.ok(original.includes(from),from);
    writeFileSync(path,original.replace(from,to));assert.throws(()=>auditOutput(directory),new RegExp(code));writeFileSync(path,original);
  }
  mkdirSync(join(directory,'_astro'));writeFileSync(join(directory,'_astro/fixture.css'),'/* DRAFT_SENTINEL_NOT_FOR_OUTPUT */');
  assert.throws(()=>auditOutput(directory),/DRAFT_LEAK/);
}));

test('output audit rejects multiply encoded local traversal',()=>outputFixture(directory=>{
  const path=join(directory,'index.html');writeFileSync(path,readFileSync(path,'utf8').replace('</body>','<a href="/unity-theory/%252e%252e/private">Unsafe</a></body>'));
  assert.throws(()=>auditOutput(directory),/UNSAFE_ROUTE/);
}));

test('document metadata comparison scopes the title to the head, preserving accessible SVG titles',()=>outputFixture(directory=>{
 const path=join(directory,'index.html');writeFileSync(path,readFileSync(path,'utf8').replace('</body>','<svg role="img"><title>Illustration title</title><path d="M0 0"/></svg></body>'));
 assert.equal(auditOutput(directory).status,'PASS');
}));
