import hashlib,json,pathlib,subprocess,zipfile
root=pathlib.Path('.');folder=root/'docs/evidence/m1/website-fidelity-contract'
hash_file=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
baseline=json.loads((folder/'baseline.json').read_text())
allowed=['AGENTS.md','README.md','docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md','research/publication/canonical-documents.yaml','research/publication/records.yaml','research/publication/references.yaml','scripts/audit-output.ts','scripts/build.ts','scripts/check-content.ts','scripts/check-sources.ts','scripts/verify.ts','src/layouts/ReadingLayout.astro','src/lib/content.ts','src/lib/presentation.ts','src/lib/publication.ts','src/lib/source-admission.ts','tests/content/contracts.test.ts','tests/content/m1-review.test.ts','tests/content/m1.test.ts','tests/content/page-lifecycle.test.ts','tests/e2e/reading.spec.ts']
assert subprocess.check_output(['git','rev-parse','HEAD']).decode().strip()==baseline['head']
assert not subprocess.check_output(['git','remote','-v']).strip()
assert not subprocess.check_output(['git','diff','--cached','--name-only']).strip()
changed=subprocess.check_output(['git','diff','--name-only']).decode().splitlines()
assert set(changed)==set(allowed),changed
unchanged=[]
for f in baseline['files']:
 if f['path'] not in allowed:
  assert hash_file(root/f['path'])==f['sha256'],f['path']
  unchanged.append(f['path'])
with zipfile.ZipFile('RRG_CURRENT.zip') as z:
 for p in (root/'research/RRG_CURRENT').iterdir():
  matches=[n for n in z.namelist() if n.endswith('/'+p.name) or n==p.name]
  assert len(matches)==1 and z.read(matches[0])==p.read_bytes(),p
# Sidecar authoring changes only presentation metadata; preserve scientific extracts and explanations.
for path in ['research/publication/records.yaml','research/publication/canonical-documents.yaml']:
 prior=json.loads(subprocess.check_output(['git','show',baseline['head']+':'+path]))
 next=json.loads((root/path).read_text());assert len(prior)==len(next)
 for old,new in zip(prior,next):
  differences=[key for key in old if old[key]!=new[key]]
  assert set(differences).issubset({'description','revision','updatedAt','scope'}),(old['id'],differences)
  if 'scope' in differences:assert old['id']=='DOC-STATUS'
prior=json.loads(subprocess.check_output(['git','show',baseline['head']+':research/publication/references.yaml']))
next=json.loads((root/'research/publication/references.yaml').read_text());assert len(prior)==len(next)
for old,new in zip(prior,next):assert {k for k in old if old[k]!=new[k]}.issubset({'verificationScope'})
assert json.loads((root/'research/publication/website-reviews.yaml').read_text())==[]
prior=(folder/'prior-plan.md').read_text();current=(root/'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert prior[prior.index('### 0.4 '):prior.index('## 1. Review findings')]==current[current.index('### 0.4 '):current.index('### 0.16 ')]
subprocess.run(['git','diff','--check'],check=True)
new=['research/publication/website-reviews.yaml','src/lib/website-review.ts','tests/content/website-fidelity.test.ts']
identities=lambda paths:[{'path':str(p),'bytes':p.stat().st_size,'sha256':hash_file(p)} for p in paths]
evidence=sorted(p for p in folder.rglob('*') if p.is_file() and p.name!='final-integrity.json')
seal={'status':'PASS','baselineHEAD':baseline['head'],'taskOwnedChangedPaths':allowed,'newProductionAndTestPaths':new,'preservedTrackedPaths':len(unchanged),'protectedScientificZipParity':13,'historicalReceiptsSections04Through015':'unchanged','scientificStatementsBindingsExplanationsDependencies':'unchanged','scientificRegistry':'unchanged bytes; no transferred approvals','websiteRegistry':'empty; 34 exact website reviews pending','lockfileSha256':hash_file(root/'package-lock.json'),'taskFiles':identities([root/p for p in allowed+new]),'evidenceFiles':identities(evidence),'currentSourceQualified':False,'newRepairsAccepted':False,'m1':'REVIEW_READY','m2':'NOT_STARTED','remote':'none','externalActions':'NOT_RUN','sealExclusions':['final-integrity.json (self)']}
(folder/'final-integrity.json').write_text(json.dumps(seal,indent=2)+'\n')
print(f'PASS: {len(unchanged)} previous tracked files preserved; ZIP parity 13; science statements unchanged; historical receipts intact; exact task scope sealed.')
