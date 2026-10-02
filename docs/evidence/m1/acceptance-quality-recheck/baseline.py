import hashlib
import json
import subprocess
from pathlib import Path
root=Path.cwd()
folder=root/'docs/evidence/m1/acceptance-quality-recheck'
def record(path):
    raw=(root/path).read_bytes()
    return dict(path=path,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()=='34c66efb177d331b3093f167d869fd42819d6591'
prior=json.loads((root/'docs/evidence/m1/separate-requalification-review/final-integrity.json').read_text())
identities=prior['taskFiles']+prior['evidenceFiles']
for item in identities:
    assert record(item['path'])==item,item['path']
files=[p for p in subprocess.check_output(['git','ls-files','-z']).decode().split('\0') if p]
baseline=dict(head='34c66efb177d331b3093f167d869fd42819d6591',files=[record(p) for p in files],priorSealIdentities=len(identities))
(folder/'baseline.json').write_text(json.dumps(baseline,indent=2)+'\n')
for path in ['docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md','scripts/audit-output.ts','tests/content/contracts.test.ts']:
    target=folder/'prior'/path
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes((root/path).read_bytes())
print(json.dumps(dict(status='PASS',baselineFiles=len(files),priorSealIdentities=len(identities))))
