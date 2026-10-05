from pathlib import Path
import json, hashlib, zipfile

sha = lambda b: hashlib.sha256(b).hexdigest()
evidence = Path('docs/evidence/m6/implementation')
before = json.loads((evidence / 'browser-tested-inventory.json').read_text())
result = {}
for suffix in ['root', 'subpath']:
    root = Path(f'dist/m6/preview-{suffix}')
    now = {p.relative_to(root).as_posix(): sha(p.read_bytes()) for p in root.rglob('*') if p.is_file()}
    audit = json.loads((evidence / f'final/{suffix}-artifact.json').read_text())
    assert {f['path']: f['sha256'] for f in audit['files']} == now
    changed = [p for p, h in before[suffix].items() if now.get(p) != h]
    assert all(p in ['build-info.json', 'search-manifest.json', 'cite/index.html'] or p.startswith('downloads/') for p in changed), changed
    archive = next((root / 'downloads').glob('*.zip'))
    with zipfile.ZipFile(archive) as z:
        names = z.namelist()
        sums = z.read('SHA256SUMS').decode().splitlines()
        for line in sums:
            h, p = line.split('  ', 1)
            assert sha(z.read(p)) == h
        assert len(names) == len(sums) + 1 and 'CITATION.cff' not in names
        assert not any('evidence/' in p or 'history/' in p for p in names)
        notice = z.read('THIRD-PARTY-NOTICES.txt')
        assert notice == (root / 'downloads/THIRD-PARTY-NOTICES.txt').read_bytes()
        assert notice.endswith(Path('node_modules/rehype-katex/node_modules/katex/LICENSE').read_bytes())
        for p in ['node_modules/pagefind/LICENSE/LICENSE', 'node_modules/pagefind/LICENSE/LICENSE-vscode-ripgrep']:
            assert Path(p).read_bytes() in notice
        provenance = json.loads(z.read('source-provenance.json'))
        for source in provenance:
            assert z.read('original/' + source['key'] + '.md') == Path(source['path']).read_bytes()
    info = json.loads((root / 'build-info.json').read_text())
    result[suffix] = {'artifactSha256': audit['artifactSha256'], 'files': len(now), 'html': sum(p.endswith('.html') for p in now), 'inputsSha256': info['inputsSha256'], 'release': info['releaseMetadata'], 'browserReuse': {'readingHTMLCSSMathFontsSearchClientExact': True, 'changedPaths': changed, 'limits': 'Cite identity fields, search manifest and exports refreshed; fresh shared audit/export contracts cover these changes.'}, 'zip': {'sha256': sha(archive.read_bytes()), 'members': len(names), 'originalSourceMembers': len(provenance), 'checksumParity': 'PASS', 'exactRendererAndPagefindNotices': 'PASS', 'cff': 'INACTIVE', 'evidenceHistoryExported': False}}

original = []
with zipfile.ZipFile('RRG_CURRENT.zip') as z:
    for p in Path('research/RRG_CURRENT').iterdir():
        if p.is_file():
            matches = [n for n in z.namelist() if n.endswith('/' + p.name) or n == p.name]
            assert len(matches) == 1 and z.read(matches[0]) == p.read_bytes(), p
            original.append({'path': str(p), 'sha256': sha(p.read_bytes())})
result['originalSourceZipParity'] = original
baseline = json.loads((evidence / 'baseline-files.json').read_text())
changed = [p for p, h in baseline.items() if not Path(p).is_file() or sha(Path(p).read_bytes()) != h]
protected = [p for p in changed if p.startswith(('docs/evidence/', 'research/RRG_CURRENT/', 'research/history/', '.idea/', 'workspace/', 'handoff/')) or p.endswith(('.zip', '.sln')) or p in ['research/publication/website-reviews.yaml', 'research/publication/records.yaml', 'src/lib/source-display.ts']]
assert protected == ['.idea/.idea.RPG_theory/.idea/workspace.xml'], protected
runtime = protected[0]
assert sha((evidence / 'prior-dependencies.json').read_bytes()) == baseline['package-lock.json']
result['preservation'] = {'baselineFiles': len(baseline), 'taskChangedExistingPaths': [p for p in changed if p not in protected], 'protectedScientificHistoricalEvidenceFiles': 'UNCHANGED', 'riderRuntime': {'path': runtime, 'baselineSha256': baseline[runtime], 'observedSha256': sha(Path(runtime).read_bytes()), 'note': 'Unowned runtime change observed; no task write or restoration.'}, 'priorLockEditionSha256': baseline['package-lock.json']}
(evidence / 'final-integrity.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({s: {k: v for k, v in result[s].items() if k in ['artifactSha256', 'files', 'html', 'inputsSha256']} for s in ['root', 'subpath']}, indent=2))
