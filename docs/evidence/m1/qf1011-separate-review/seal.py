import json,hashlib,subprocess,zipfile
from pathlib import Path
root=Path.cwd();folder=root/'docs/evidence/m1/qf1011-separate-review';baseline=json.loads((folder/'baseline.json').read_text());checks=json.loads((folder/'final-checks.json').read_text())
task={'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md','scripts/audit-output.ts','tests/content/contracts.test.ts'}
def rec(p):
 b=(root/p).read_bytes();return dict(path=p,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==baseline['head']
assert subprocess.check_output(['git','branch','--show-current'],text=True).strip()=='main'
assert subprocess.check_output(['git','remote'],text=True).strip()==''
for item in baseline['files']:
 if item['path'] in task:
  prior=rec(str((folder/'prior'/item['path']).relative_to(root)));assert (prior['bytes'],prior['sha256'])==(item['bytes'],item['sha256'])
 else: assert rec(item['path'])==item,item['path']
old=(folder/'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text();new=(root/'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert old[old.index('### 0.4 '):old.index('## 1. ')]==new[new.index('### 0.4 '):new.index('### 0.22 ')]
original=(folder/'prior/tests/content/contracts.test.ts').read_text();assert (root/'tests/content/contracts.test.ts').read_text().startswith(original)
with zipfile.ZipFile(root/'RRG_CURRENT.zip') as z:
 supplied={n.split('/',1)[1]:z.read(n) for n in z.namelist() if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
 actual={str(p.relative_to(root/'research/RRG_CURRENT')):p.read_bytes() for p in (root/'research/RRG_CURRENT').rglob('*') if p.is_file()}
 assert supplied==actual and len(actual)==13
package=json.loads((root/'package.json').read_text());installed=json.loads((folder/'installed-dependencies.json').read_text())
for name,version in (package['dependencies']|package['devDependencies']).items():assert installed['dependencies'][name]['version']==version
fontInventory=[rec(str(p.relative_to(root))) for p in sorted((root/'node_modules/katex/dist/fonts').glob('*.woff2'))];assert fontInventory
changed=set(filter(None,subprocess.check_output(['git','diff','HEAD','--name-only','-z']).decode().split('\0')));assert changed==task
untracked=list(filter(None,subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z']).decode().split('\0')));assert all(p.startswith('docs/evidence/m1/qf1011-separate-review/') for p in untracked)
assert checks['status']=='PASS' and checks['reviewStates']==dict(accepted=34,pending=0,stale=0,rejected=0) and checks['currentSourceQualified'] is True
assert checks['newRepair'].endswith('REVIEW_READY, unaccepted') and checks['m2']=='NOT_STARTED'
assert len(checks['representations'])==34 and len(checks['retained'])==16 and len(checks['probes'])==22
assert checks['contracts']==80 and checks['chromium']==14 and checks['commands']==11
prod=subprocess.check_output(['node','--import','tsx','--input-type=module','-e',"import {buildInputs} from './src/lib/build-identity.ts';process.stdout.write(JSON.stringify(buildInputs()));"],text=True)
assert json.loads(prod)==checks['productionInputs']
evidence=sorted(str(p.relative_to(root)) for p in folder.rglob('*') if p.is_file() and p.name!='final-integrity.json')
result=dict(status='PASS',baselineHead=baseline['head'],branch='main',remoteCount=0,protectedTrackedFiles=len(baseline['files'])-3,protectedPriorEvidenceFiles=sum(i['path'].startswith('docs/evidence/') for i in baseline['files']),originalZipParityFiles=13,priorTaskSnapshots='exact',historicalPlanReceipts='0.4-0.21 byte-identical',websiteRegistryAndIssuedReceipts='unchanged',historicalScientificRegistry='unchanged; isolated; deferred',soleLockfile='unchanged',renderedNonBuildInfoFiles='100 per base byte-identical',newRepair='QF-12 REVIEW_READY; unaccepted',acceptedScope='unchanged QF-10 and specifically demonstrated predecessor QF-11 controls',reviewStates=checks['reviewStates'],currentSourceQualified=True,newFidelityDecisions='NONE',m2='NOT_STARTED',publicActions='NOT_RUN',productionInputs=checks['productionInputs'],installedPinnedDependencies=19,installedKatexWoff2Files=fontInventory,taskFiles=[rec(p) for p in sorted(task)],evidenceFiles=[rec(p) for p in evidence],sealSelfExcluded=True)
(folder/'final-integrity.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['taskFiles','evidenceFiles','installedKatexWoff2Files']},indent=2))
