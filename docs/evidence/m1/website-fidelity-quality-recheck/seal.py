import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

root = Path.cwd()
folder = root / 'docs/evidence/m1/website-fidelity-quality-recheck'
baseline = json.loads((folder / 'baseline.json').read_text())
task = [
    'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md',
    'src/lib/website-review.ts', 'tests/content/fidelity-fixture.ts',
    'tests/content/m1-review.test.ts', 'tests/content/m1.test.ts',
    'tests/content/website-fidelity.test.ts',
]


def record(path):
    raw = (root / path).read_bytes()
    return dict(path=path, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())


assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == baseline['head']
assert subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip() == 'main'
assert subprocess.check_output(['git', 'remote'], text=True).strip() == ''
protected = [entry for entry in baseline['files'] if entry['path'] not in task]
for entry in protected:
    assert record(entry['path']) == entry, entry['path']
for entry in baseline['files']:
    if entry['path'] in task:
        assert record('docs/evidence/m1/website-fidelity-quality-recheck/prior/' + entry['path'])['sha256'] == entry['sha256']
old = (folder / 'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
new = (root / 'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')] == new[new.index('### 0.4 '):new.index('### 0.19 ')]
with zipfile.ZipFile(root / 'RRG_CURRENT.zip') as archive:
    supplied = {name.split('/', 1)[1]: archive.read(name) for name in archive.namelist()
                if name.startswith('RRG_CURRENT/') and not name.endswith('/')}
    installed = {str(path.relative_to(root / 'research/RRG_CURRENT')): path.read_bytes()
                 for path in (root / 'research/RRG_CURRENT').rglob('*') if path.is_file()}
    assert installed == supplied and len(installed) == 13
changes = set(filter(None, subprocess.check_output(['git', 'diff', '--name-only', '-z']).decode().split('\0')))
assert changes == set(task), changes
untracked = list(filter(None, subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z']).decode().split('\0')))
assert all(path.startswith('docs/evidence/m1/website-fidelity-quality-recheck/') for path in untracked)
checks = json.loads((folder / 'final-checks.json').read_text())
assert checks['status'] == 'PASS' and checks['reviewStates'] == dict(accepted=0, pending=0, stale=34, rejected=0)
evidence = sorted(str(path.relative_to(root)) for path in folder.rglob('*')
                  if path.is_file() and path.name != 'final-integrity.json')
result = dict(
    status='PASS', baselineHead=baseline['head'], branch='main', remoteCount=0,
    protectedFiles=len(protected), protectedScientificFiles=13,
    protectedPriorEvidenceFiles=sum(entry['path'].startswith('docs/evidence/') for entry in protected),
    suppliedZipParityFiles=13, earlierIssuedPlanReceipts='byte-identical',
    realWebsiteRegistryAndIssuedDecisions='byte-identical',
    scientificSources='unchanged', historicalScientificRegistry='unchanged and deferred',
    newRepairAcceptance='NOT_GRANTED', currentSourceQualified=False,
    reviewStates=dict(accepted=0, pending=0, stale=34, rejected=0),
    m1='REVIEW_READY', m2='NOT_STARTED', publicActions='NOT_RUN',
    taskFiles=[record(path) for path in sorted(task)],
    evidenceFiles=[record(path) for path in evidence], sealSelfExcluded=True,
)
(folder / 'final-integrity.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key not in ['taskFiles', 'evidenceFiles']}))
