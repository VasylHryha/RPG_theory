import json,hashlib,subprocess,zipfile
from pathlib import Path
f=Path('docs/evidence/m1/audit-normalization-recheck');baseline=json.loads((f/'baseline.json').read_text());d=json.loads((f/'final-checks.json').read_text())
existing={'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md','scripts/audit-output.ts','tests/content/contracts.test.ts'};task=existing|{'scripts/css-resources.ts'}
def rec(p):
 b=Path(p).read_bytes();return dict(path=p,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==baseline['head']
assert subprocess.check_output(['git','branch','--show-current'],text=True).strip()=='main'
assert subprocess.check_output(['git','remote'],text=True).strip()==''
for item in baseline['files']:
 if item['path'] not in existing:assert rec(item['path'])==item,item['path']
 else:
  saved=rec(str(f/'prior'/item['path']));assert (saved['bytes'],saved['sha256'])==(item['bytes'],item['sha256'])
old=(f/'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text();new=Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')]==new[new.index('### 0.4 '):new.index('### 0.23 ')]
assert Path('tests/content/contracts.test.ts').read_text().startswith((f/'prior/tests/content/contracts.test.ts').read_text())
with zipfile.ZipFile('RRG_CURRENT.zip') as z:
 supplied={n.split('/',1)[1]:z.read(n) for n in z.namelist() if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
 actual={str(p.relative_to('research/RRG_CURRENT')):p.read_bytes() for p in Path('research/RRG_CURRENT').rglob('*') if p.is_file()};assert actual==supplied and len(actual)==13
priorSeal=json.loads(Path('docs/evidence/m1/qf1011-separate-review/final-integrity.json').read_text())
for item in priorSeal['installedKatexWoff2Files']:assert rec(item['path'])==item,item['path']
assert len(d['representations'])==34 and len(d['retained'])==18 and len(d['probes'])==30
assert d['reviewStates']==dict(accepted=34,pending=0,stale=0,rejected=0) and d['currentSourceQualified'] is True
assert d['contracts']==82 and d['commands']==11 and d['chromium']==14 and d['m2']=='NOT_STARTED'
assert d['repairs'].endswith('REVIEW_READY, unaccepted') and d['predecessorRepair']=='QF-12 still unaccepted'
newPaths=list(filter(None,subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z']).decode().split('\0')))
assert all(p=='scripts/css-resources.ts' or p.startswith(str(f)+'/') for p in newPaths)
changes=set(filter(None,subprocess.check_output(['git','diff','HEAD','--name-only','-z']).decode().split('\0')));assert changes==existing
current=json.loads(subprocess.check_output(['node','--import','tsx','--input-type=module','-e',"import {buildInputs} from './src/lib/build-identity.ts';process.stdout.write(JSON.stringify(buildInputs()));"],text=True));assert current==d['productionInputs']
evidence=sorted(str(p) for p in f.rglob('*') if p.is_file() and p.name!='final-integrity.json')
out=dict(status='PASS',baselineHead=baseline['head'],branch='main',remotes=[],protectedTrackedFiles=len(baseline['files'])-3,protectedPriorEvidenceFiles=sum(i['path'].startswith('docs/evidence/') for i in baseline['files']),originalZipParityFiles=13,priorTaskSnapshots='exact',historicalPlanReceipts='0.4-0.22 byte-identical',websiteRegistryAndIssuedReceipts='unchanged',historicalScientificRegistry='unchanged; isolated; deferred',soleLockfile='unchanged',installedKatexWoff2Files='exact predecessor bytes verified',newRepairs='QF-13/14 REVIEW_READY; unaccepted',predecessorRepair='QF-12 unaccepted',reviewStates=d['reviewStates'],currentSourceQualified=True,newFidelityDecisions='NONE',renderedNonBuildInfoFiles='100 per base byte-identical',m2='NOT_STARTED',publicActions='NOT_RUN',productionInputs=d['productionInputs'],taskFiles=[rec(p) for p in sorted(task)],evidenceFiles=[rec(p) for p in evidence],sealSelfExcluded=True)
(f/'final-integrity.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ['taskFiles','evidenceFiles']},indent=2))
