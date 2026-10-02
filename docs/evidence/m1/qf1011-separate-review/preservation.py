import json, hashlib, subprocess, zipfile, re
from pathlib import Path
root=Path.cwd(); folder=root/'docs/evidence/m1/qf1011-separate-review'
def rec(p):
 b=(root/p).read_bytes(); return dict(path=p,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
tracked=subprocess.check_output(['git','ls-files','-z']).decode().split('\0'); tracked=[p for p in tracked if p]
seals=[]
for name in ['website-fidelity-contract','website-fidelity-recheck','website-fidelity-acceptance','website-fidelity-quality-recheck','separate-requalification-review','acceptance-quality-recheck']:
 p=root/'docs/evidence/m1'/name/'final-integrity.json'
 if not p.exists(): continue
 d=json.loads(p.read_text()); count=0
 for key in ['taskFiles','evidenceFiles']:
  for item in d.get(key,[]):
   if item['path']=='docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md' and name!='acceptance-quality-recheck': continue
   # Prior task versions are historical; newest seal binds operative version.
   if key=='taskFiles' and name!='acceptance-quality-recheck': continue
   assert rec(item['path'])==item,(name,item['path']); count+=1
 seals.append(dict(path=str(p.relative_to(root)),checked=count,sealSha256=rec(str(p.relative_to(root)))['sha256']))
baseline=json.loads((root/'docs/evidence/m1/acceptance-quality-recheck/baseline.json').read_text())
changed={'scripts/audit-output.ts','tests/content/contracts.test.ts','docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md'}
for item in baseline['files']:
 if item['path'] not in changed: assert rec(item['path'])==item,item['path']
with zipfile.ZipFile(root/'RRG_CURRENT.zip') as z:
 supplied={n.split('/',1)[1]:z.read(n) for n in z.namelist() if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
 actual={str(p.relative_to(root/'research/RRG_CURRENT')):p.read_bytes() for p in (root/'research/RRG_CURRENT').rglob('*') if p.is_file()}
 assert supplied==actual and len(actual)==13
p=root/'docs/evidence/m1/acceptance-quality-recheck'
log=(p/'verification-complete-final.log').read_text(); log=re.sub(r'\x1b\[[0-9;]*m','',log)
cases=re.findall(r'^✔ (.+?) \([\d.]+ms\)$',log,re.M); assert len(cases)==len(set(cases))==79
oldlog=(root/'docs/evidence/m1/separate-requalification-review/verification-tests-builds.log').read_text()
# Actual predecessor full verification lives in its combined log.
oldcases=re.findall(r'^✔ (.+?) \([\d.]+ms\)$',re.sub(r'\x1b\[[0-9;]*m','',oldlog),re.M)
assert len(set(oldcases))==76 and set(oldcases)<=set(cases)
v=json.loads((p/'verification.json').read_text()); assert len(v['receipts'])==11 and all(x['exitCode']==0 for x in v['receipts']) and v['notRun']==[]
browsers=[]
for base in ['root','subpath']:
 d=json.loads((p/f'{base}-browser.json').read_text()); assert d['stats']['expected']==7 and all(d['stats'][k]==0 for k in ['unexpected','skipped','flaky'])
 browsers.append(dict(base=base,stats=d['stats']))
assert 'EPERM' in (p/'verification.log').read_text()
assert 'error' in (p/'verification-authorized.log').read_text().lower()
for n in ['second-batch-verification.json','third-batch-verification.json']: assert json.loads((p/n).read_text())['status']=='FAIL'
out=dict(status='PASS',head=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),files=[rec(p) for p in tracked],verifiedSeals=seals,protectedBaselineFiles=len(baseline['files'])-3,originalZipParityFiles=13,distinctContracts=79,predecessorCases=76,addedCaseNames=sorted(set(cases)-set(oldcases)),browserChecks=browsers,commands=v['receipts'],failures='preserved; never counted as passing')
(folder/'baseline.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='files'},indent=2))
