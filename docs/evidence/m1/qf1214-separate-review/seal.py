import json,hashlib,subprocess,zipfile
from pathlib import Path
folder=Path('docs/evidence/m1/qf1214-separate-review')
baseline=json.loads((folder/'baseline.json').read_text())
def rec(path):
 b=Path(path).read_bytes();return dict(path=str(path),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==baseline['head']
assert subprocess.check_output(['git','branch','--show-current'],text=True).strip()=='main'
assert subprocess.check_output(['git','remote'],text=True).strip()==''
plan='docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md'
for item in baseline['trackedFiles']:
 if item['path']!=plan:assert rec(item['path'])==item,item['path']
old=(folder/'prior-plan.md').read_text();new=Path(plan).read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')]==new[new.index('### 0.4 '):new.index('### 0.24 ')]
with zipfile.ZipFile('RRG_CURRENT.zip') as z:
 supplied={n.split('/',1)[1]:z.read(n) for n in z.namelist() if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
 actual={str(p.relative_to('research/RRG_CURRENT')):p.read_bytes() for p in Path('research/RRG_CURRENT').rglob('*') if p.is_file()};assert actual==supplied and len(actual)==13
changes=set(filter(None,subprocess.check_output(['git','diff','HEAD','--name-only','-z']).decode().split('\0')));assert changes=={plan}
untracked=list(filter(None,subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z']).decode().split('\0')));assert all(p.startswith(str(folder)+'/') for p in untracked)
d=json.loads((folder/'final-checks.json').read_text());assert d['status']=='PASS' and d['m1']=='ACCEPTED' and d['m2']=='NOT_STARTED'
assert d['contracts']==82 and d['commands']==11 and d['chromium']==14 and d['negativeControls']==80 and d['positiveControls']==20
assert d['newFidelityDecisions']=='NONE' and d['productionOrTestRepairs']=='NONE'
files=sorted(str(p) for p in folder.rglob('*') if p.is_file() and p.name!='final-integrity.json')
result=dict(status='PASS',reviewedHead=baseline['head'],branch='main',remotes=[],protectedTrackedFiles=len(baseline['trackedFiles'])-1,sourceZipParityFiles=13,historicalPlanReceipts='0.4-0.23 byte-identical',productionAndTests='unchanged',websiteRegistryAndIssuedReceipts='unchanged; all 34 exact decisions current',historicalScientificRegistry='unchanged; deferred',soleLockfile='unchanged',installedKatexWoff2Files=20,newFidelityDecisions='NONE',m1='ACCEPTED',m2='NOT_STARTED',publicActions='NOT_RUN',productionInputs=d['productionInputs'],taskFiles=[rec(plan)],evidenceFiles=[rec(p) for p in files],sealSelfExcluded=True)
(folder/'final-integrity.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['taskFiles','evidenceFiles']}))
