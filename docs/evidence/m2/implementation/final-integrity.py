from pathlib import Path
import hashlib,json,subprocess

evidence=Path('docs/evidence/m2/implementation')
baseline=json.loads((evidence/'baseline.json').read_text())
def command(*args):return subprocess.check_output(args,text=True).strip()
def digest(path):
    raw=Path(path).read_bytes()
    return {'path':str(path),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
assert command('git','rev-parse','HEAD')==baseline['head']
allowed={
    'docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md',
    'research/publication/canonical-documents.yaml','research/publication/references.yaml',
    'research/publication/pages/home.md','research/publication/pages/start.md',
    'scripts/audit-output.ts','scripts/check-content.ts',
    'src/components/CanonicalPage.astro','src/lib/content.ts','src/lib/presentation.ts',
    'src/pages/index.astro','src/pages/start.astro','src/styles/global.css',
    'tests/content/contracts.test.ts','tests/content/fidelity-fixture.ts',
    'tests/content/m1.test.ts','tests/content/website-fidelity.test.ts',
    'tests/content/revision-cli.test.ts','tests/content/revision-inventory-cli.test.ts',
    'tests/e2e/reading.spec.ts'
}
original_paths={f['path'] for f in baseline['files']}
changed=set(command('git','diff','--name-only','HEAD').splitlines()) & original_paths
assert changed==allowed,(changed-allowed,allowed-changed)
new_pages={'examples','example-water','example-string','example-molecule','example-star','example-life-environment','example-cell','concepts','concept-stability','concept-recursion','concept-interactions'}
new_allowed={f'research/publication/pages/{name}.md' for name in new_pages}|{'tests/content/m2.test.ts','tests/e2e/introduction.spec.ts'}
untracked=command('git','ls-files','--others','--exclude-standard').splitlines()
assert all(path in new_allowed or path.startswith('docs/evidence/m2/') for path in untracked)
protected=[f for f in baseline['files'] if f['path'] not in allowed]
for prior in protected:assert digest(prior['path'])==prior,prior['path']
record=json.loads(Path('config/research-source.json').read_text())
for source in record['files']:
    actual=digest(Path(record['directory'])/source['path'])
    assert (actual['bytes'],actual['sha256'])==(source['bytes'],source['sha256'])
plan=Path('docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
prior=(evidence/'prior/docs/plans/UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
assert prior[prior.index('### 0.4 '):prior.index('## 1. Review findings')]==plan[plan.index('### 0.4 '):plan.index('### 0.25 ')]
references=json.loads(Path('research/publication/references.yaml').read_text())
old_references=json.loads((evidence/'prior/research/publication/references.yaml').read_text())
assert references[:len(old_references)]==old_references
checks=json.loads((evidence/'final-checks.json').read_text());assert checks['status']=='PASS'
task_files=[digest(path) for path in sorted(allowed|new_allowed)]
evidence_files=[digest(path) for path in sorted(evidence.rglob('*')) if path.is_file() and path.name!='final-integrity.json']
result={
    'status':'PASS','baselineHead':baseline['head'],'branch':command('git','branch','--show-current'),
    'remotes':command('git','remote','-v').splitlines(),'protectedTrackedFiles':len(protected),
    'sourceFilesUnchanged':len(record['files']),'historicalPlanReceipts':'0.4–0.24 byte-identical',
    'predecessorReferenceMetadataUnchanged':len(old_references),
    'websiteRegistryAndIssuedReceipts':'unchanged; 34 stale and 11 pending after presentation changes',
    'scientificRegistryAndOriginalSources':'unchanged; scientific adjudication outside website task',
    'soleLockfile':'unchanged','m2':'REVIEW_READY','m3':'NOT_STARTED','publicActions':'NOT_RUN',
    'productionInputs':checks['productionInputs'],'taskFiles':task_files,'evidenceFiles':evidence_files
}
assert result['remotes']==[]
(evidence/'final-integrity.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'M2 integrity PASS: {len(protected)} protected tracked files; 13 original current files unchanged; own task files sealed.')
