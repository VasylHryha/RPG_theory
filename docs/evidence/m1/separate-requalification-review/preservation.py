import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

root = Path.cwd()
folder = root / 'docs/evidence/m1/separate-requalification-review'
def record(path):
    raw = (root / path).read_bytes()
    return dict(path=path, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())

if not (folder / 'baseline.json').exists():
    files = subprocess.check_output(['git', 'ls-files', '-z']).decode().split('\0')
    baseline = dict(head=subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
                    files=[record(p) for p in files if p])
    assert baseline['head'] == 'bbb6b19130501452447b02fcda1278e42b27c668'
    (folder / 'baseline.json').write_text(json.dumps(baseline, indent=2) + '\n')
    for path in ['docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md', 'research/publication/website-reviews.yaml']:
        target = folder / 'prior' / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / path).read_bytes())

seals = []
for directory, commit in [('website-fidelity-contract', 'b023b17'),
                          ('website-fidelity-recheck', '92eb618'),
                          ('website-fidelity-acceptance', '2c85e17'),
                          ('website-fidelity-quality-recheck', 'bbb6b19')]:
    seal = json.loads((root / f'docs/evidence/m1/{directory}/final-integrity.json').read_text())
    count = 0
    for item in seal.get('evidenceFiles', []):
        assert record(item['path']) == item, item['path']
        count += 1
    for item in seal.get('taskFiles', []):
        raw = subprocess.check_output(['git', 'show', f'{commit}:{item["path"]}'])
        assert len(raw) == item['bytes'] and hashlib.sha256(raw).hexdigest() == item['sha256'], item['path']
        if directory == 'website-fidelity-quality-recheck':
            assert record(item['path']) == item, item['path']
        count += 1
    seals.append(dict(directory=directory, sealedIdentities=count, exactEdition=commit, status='PASS'))

old = json.loads((root / 'docs/evidence/m1/website-fidelity-quality-recheck/baseline.json').read_text())
changed = {p['path'] for p in json.loads((root / 'docs/evidence/m1/website-fidelity-quality-recheck/final-integrity.json').read_text())['taskFiles']}
protected = [p for p in old['files'] if p['path'] not in changed]
for item in protected:
    assert record(item['path']) == item, item['path']
with zipfile.ZipFile(root / 'RRG_CURRENT.zip') as archive:
    supplied = {n.split('/', 1)[1]: archive.read(n) for n in archive.namelist()
                if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
    installed = {str(p.relative_to(root / 'research/RRG_CURRENT')): p.read_bytes()
                 for p in (root / 'research/RRG_CURRENT').rglob('*') if p.is_file()}
    assert installed == supplied and len(installed) == 13
assert subprocess.check_output(['git', 'remote'], text=True).strip() == ''
result = dict(status='PASS', seals=seals, qualityRecheckProtectedFiles=len(protected),
              suppliedZipParityFiles=13, historicalScientificRegistry='unchanged; deferred',
              previousDecisions='hashed issued bytes preserved', remoteCount=0)
(folder / 'independent-preservation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
