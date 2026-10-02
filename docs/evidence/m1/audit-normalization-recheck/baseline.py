import json,hashlib,subprocess,zipfile
from pathlib import Path
f=Path('docs/evidence/m1/audit-normalization-recheck')
def record(p):
 b=Path(p).read_bytes();return dict(path=p,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
s=json.loads(Path('docs/evidence/m1/qf1011-separate-review/final-integrity.json').read_text())
for item in s['taskFiles']+s['evidenceFiles']:assert record(item['path'])==item,item['path']
files=[record(p) for p in subprocess.check_output(['git','ls-files','-z']).decode().split('\0') if p]
with zipfile.ZipFile('RRG_CURRENT.zip') as z:
 supplied={n.split('/',1)[1]:z.read(n) for n in z.namelist() if n.startswith('RRG_CURRENT/') and not n.endswith('/')}
 actual={str(p.relative_to('research/RRG_CURRENT')):p.read_bytes() for p in Path('research/RRG_CURRENT').rglob('*') if p.is_file()}
 assert actual==supplied and len(actual)==13
out=dict(head=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),branch=subprocess.check_output(['git','branch','--show-current'],text=True).strip(),remotes=subprocess.check_output(['git','remote'],text=True).split(),files=files,verifiedPredecessorSealEntries=len(s['taskFiles'])+len(s['evidenceFiles']),originalZipParityFiles=13)
(f/'baseline.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='files'}))
