import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

root = Path.cwd()
folder = root / 'docs/evidence/m1/acceptance-quality-recheck'
baseline = json.loads((folder / 'baseline.json').read_text())
task = ['docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md',
        'scripts/audit-output.ts', 'tests/content/contracts.test.ts']

def record(path):
    raw = (root / path).read_bytes()
    return dict(path=path, bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())

assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == baseline['head']
assert subprocess.check_output(['git', 'branch', '--show-current'], text=True).strip() == 'main'
assert subprocess.check_output(['git', 'remote'], text=True).strip() == ''
protected = [item for item in baseline['files'] if item['path'] not in task]
for item in protected:
    assert record(item['path']) == item, item['path']
for item in baseline['files']:
    if item['path'] in task:
        snapshot = record(str((folder / 'prior' / item['path']).relative_to(root)))
        assert (snapshot['bytes'], snapshot['sha256']) == (item['bytes'], item['sha256'])
old = (folder / 'prior' / task[0]).read_text()
new = (root / task[0]).read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')] == new[new.index('### 0.4 '):new.index('### 0.21 ')]
with zipfile.ZipFile(root / 'RRG_CURRENT.zip') as archive:
    supplied = {n.split('/', 1)[1]: archive.read(n) for n in archive.namelist()
                if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
    installed = {str(p.relative_to(root / 'research/RRG_CURRENT')): p.read_bytes()
                 for p in (root / 'research/RRG_CURRENT').rglob('*') if p.is_file()}
    assert supplied == installed and len(installed) == 13
prefix = 'docs/evidence/m1/acceptance-quality-recheck/'
changes = set(filter(None, subprocess.check_output(['git', 'diff', 'HEAD', '--name-only', '-z']).decode().split('\0')))
assert set(task).issubset(changes)
assert all(p in task or p.startswith(prefix) for p in changes)
new_paths = list(filter(None, subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z']).decode().split('\0')))
assert all(p.startswith(prefix) for p in new_paths)
checks = json.loads((folder / 'final-checks.json').read_text())
assert checks['status'] == 'PASS' and checks['currentSourceQualified'] is True
assert checks['reviewStates'] == dict(accepted=34, pending=0, stale=0, rejected=0)
assert checks['newRepairs'] == 'REVIEW_READY; unaccepted'
assert checks['contracts'] == 79 and checks['chromium'] == 14
assert len(checks['retained']) == 14
evidence = sorted(str(p.relative_to(root)) for p in folder.rglob('*')
                  if p.is_file() and p.name != 'final-integrity.json')
result = dict(status='PASS', baselineHead=baseline['head'], branch='main', remoteCount=0,
              protectedFiles=len(protected), protectedScientificFiles=13,
              protectedPriorEvidenceFiles=sum(p['path'].startswith('docs/evidence/') for p in protected),
              originalZipParityFiles=13, previousTaskFiles='exact prior snapshots preserved',
              earlierIssuedDecisionsAndEvidence='byte-identical', earlierPlanReceipts='byte-identical',
              scientificSources='byte-identical', historicalScientificRegistry='unchanged; deferred',
              websiteRegistryAndReceipts='byte-identical', soleLockfile='byte-identical',
              reviewStates=checks['reviewStates'], currentSourceQualified=True,
              newProductionAndTestRepairs='QF-10/11 REVIEW_READY; unaccepted',
              m1='REVIEW_READY for new audit repair; demonstrated predecessor acceptance preserved',
              m2='NOT_STARTED', publicActions='NOT_RUN', numericalQualityGrade='NOT_ASSIGNED',
              taskFiles=[record(p) for p in task], evidenceFiles=[record(p) for p in evidence],
              sealSelfExcluded=True)
(folder / 'final-integrity.json').write_text(json.dumps(result, indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['taskFiles', 'evidenceFiles']}))
