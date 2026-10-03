from pathlib import Path
import hashlib,json,subprocess

evidence=Path('docs/evidence/m2/quality-recheck')
baseline=json.loads((evidence/'baseline.json').read_text())
allowed=set(json.loads((evidence/'owned-paths.json').read_text()))
def command(*args):return subprocess.check_output(args,text=True).strip()
def digest(path):
    raw=Path(path).read_bytes()
    return {'path':str(path),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
assert command('git','rev-parse','HEAD')==baseline['head']
original={f['path'] for f in baseline['files']}
changed=set(command('git','diff','--name-only','HEAD').splitlines()) & original
assert changed<=allowed,changed-allowed
new=command('git','ls-files','--others','--exclude-standard').splitlines()
assert all(path.startswith(str(evidence)+'/') for path in new)
protected=[f for f in baseline['files'] if f['path'] not in changed]
for prior in protected:assert digest(prior['path'])==prior,prior['path']
admission=json.loads(Path('config/research-source.json').read_text())
for file in admission['files']:
    current=digest(Path(admission['directory'])/file['path'])
    assert (current['bytes'],current['sha256'])==(file['bytes'],file['sha256'])
plan=Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
prior=(evidence/'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert prior[prior.index('### 0.4 '):prior.index('## 1. Review findings')]==plan[plan.index('### 0.4 '):plan.index('### 0.26 ')]
checks=json.loads((evidence/'final-checks.json').read_text());assert checks['status']=='PASS'
files=[digest(path) for path in sorted(changed)]
proof=[digest(path) for path in sorted(evidence.rglob('*')) if path.is_file() and path.name!='final-integrity.json']
result={
    'status':'PASS','baselineHead':baseline['head'],'branch':command('git','branch','--show-current'),
    'remotes':command('git','remote','-v').splitlines(),'protectedTrackedFiles':len(protected),
    'sourceFilesUnchanged':len(admission['files']),'historicalPlanReceipts':'0.4–0.25 byte-identical',
    'publicationContentChange':'Only authored interaction display formatting and revision; original TeX unchanged',
    'originalSourcesCanonicalRecordsReferencesAndRegistries':'unchanged',
    'soleLockfile':'unchanged','m2':'REVIEW_READY','m3':'NOT_STARTED','publicActions':'NOT_RUN',
    'productionInputs':checks['productionInputs'],'taskFiles':files,'evidenceFiles':proof
}
assert result['remotes']==[]
(evidence/'final-integrity.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'M2 integrity PASS: {len(protected)} protected tracked files, {len(changed)} owned changes, 13 current files unchanged.')
