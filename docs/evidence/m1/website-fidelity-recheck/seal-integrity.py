import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[4]
folder = root / 'docs/evidence/m1/website-fidelity-recheck'
task = [
    'AGENTS.md', 'README.md',
    'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md',
    'scripts/audit-output.ts', 'scripts/build.ts', 'scripts/check-content.ts',
    'scripts/verify.ts', 'src/layouts/ReadingLayout.astro',
    'src/lib/build-identity.ts', 'src/lib/content.ts', 'src/lib/publication.ts',
    'src/lib/website-review.ts', 'tests/content/contracts.test.ts',
    'tests/content/m1-review.test.ts', 'tests/content/m1.test.ts',
    'tests/content/website-fidelity.test.ts', 'tests/content/fidelity-fixture.ts'
]

def record(path):
    raw = (root / path).read_bytes()
    return dict(path=path, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())

baseline = json.loads((folder / 'baseline.json').read_text())
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip() == baseline['head']
assert subprocess.check_output(['git', 'branch', '--show-current'], cwd=root, text=True).strip() == 'main'
assert subprocess.check_output(['git', 'remote'], cwd=root, text=True).strip() == ''
protected = [item for item in baseline['files'] if item['path'] not in task]
for item in protected:
    assert record(item['path']) == item, item['path']

old = (folder / 'prior-plan.md').read_text()
new = (root / 'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')] == new[new.index('### 0.4 '):new.index('### 0.17 ')]

with zipfile.ZipFile(root / 'RRG_CURRENT.zip') as archive:
    raw_members = {name.split('/', 1)[1]: archive.read(name) for name in archive.namelist()
                   if name.startswith('RRG_CURRENT/') and not name.endswith('/')}
    installed = {str(path.relative_to(root / 'research/RRG_CURRENT')): path.read_bytes()
                 for path in (root / 'research/RRG_CURRENT').rglob('*') if path.is_file()}
    assert len(installed) == len(raw_members) == 13
    assert installed == raw_members

evidence = sorted(str(path.relative_to(root)) for path in folder.rglob('*')
                  if path.is_file() and path.name != 'final-integrity.json')
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z'], cwd=root).decode().split('\0')
assert set(filter(None, untracked)) == set(evidence + ['tests/content/fidelity-fixture.ts']), 'Unexpected untracked work'
changed = subprocess.check_output(['git', 'diff', '--name-only', '-z'], cwd=root).decode().split('\0')
assert set(filter(None, changed)) == set(task) - {'tests/content/fidelity-fixture.ts'}, 'Unexpected tracked changes'
result = dict(
    status='PASS', baselineHead=baseline['head'], branch='main', remoteCount=0,
    protectedFiles=len(protected), protectedEvidenceFiles=sum(item['path'].startswith('docs/evidence/') for item in protected),
    protectedScientificFiles=sum(item['path'].startswith('research/') for item in protected),
    originalZipCurrentParityFiles=13, earlierIssuedPlanReceipts='byte-identical',
    scientificSourceAuthoring='NOT_RUN', scientificReview='DEFERRED',
    newRepairAcceptance='NOT_GRANTED', m1='REVIEW_READY', m2='NOT_STARTED', publicActions='NOT_RUN',
    taskFiles=[record(path) for path in sorted(task)],
    evidenceFiles=[record(path) for path in evidence],
    sealSelfExcluded=True
)
(folder / 'final-integrity.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items() if key not in ['taskFiles', 'evidenceFiles']}))
