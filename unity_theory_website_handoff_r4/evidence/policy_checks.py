#!/usr/bin/env python3
"""Check the delivered R4 handoff. Does not execute research or website code."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
checks: list[dict] = []

def check(name: str, condition: bool, details: object = None) -> None:
    checks.append({'name': name, 'status': 'PASS' if condition else 'FAIL', 'details': details})

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main() -> int:
    a = json.loads((ROOT/'SOURCE_AUTHORITY.json').read_text())
    plan = (ROOT/'UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md').read_text()
    policy = a['source_revision_policy']
    check('one_forward_plan_revision', a['plan_revision']==4 and '\nrevision: 4\n' in plan
          and 'Revision 4 as the sole website' in plan and 'relevant Revision 4' in plan)
    check('current_sources_and_core_editable', policy['current_sources_editable']
          and policy['includes_original_and_core_documents'] and not policy['blanket_source_read_only_rule'])
    check('need_scope_and_meaning_required', policy['requires_concrete_need_and_before_after_meaning']
          and policy['requires_authorized_task_scope'] and 'before/after meaning' in plan)
    check('no_second_permission_for_filename_alone', not policy['requires_extra_permission_solely_for_locked_filename']
          and 'Do not require a second permission request merely' in plan)
    check('history_immutable_not_current', policy['history_and_issued_artifacts_preserved']
          and 'working `research/RRG_CURRENT/` directory is editable' in plan)
    check('review_only_and_build_not_implicit_edits', not policy['review_only_task_modifies_scientific_sources']
          and not policy['intake_or_build_may_silently_edit_sources']
          and 'Review-only tasks do not\nrewrite source science.' in plan)
    check('source_and_consumers_coherent_update', policy['source_and_dependencies_updated_together']
          and 'edit actual current sources and their manifest/status/proof records coherently' in plan)
    check('legitimate_new_baseline_allowed', policy['legitimate_revised_baseline_may_change_hash']
          and '**Positive revision control:**' in plan and 'documented edition transition succeeds' in plan)
    check('unexplained_change_not_auto_admitted', not policy['unexplained_pin_reset_allowed']
          and 'unexplained mismatch within the selected edition' in plan)
    check('no_fabricated_scientific_source', not policy['missing_sources_may_be_reconstructed']
          and not (ROOT/'source'/'RRG_CURRENT').exists()
          and a['active_package']['currentSourceQualified'] is False
          and all(x['actual_sha256'] is None for x in a['active_package']['required_declared_main_files']))
    check('dated_visibility_not_permanent_missing_gate', a['updated_sources_recheck']['requires_recheck_at_execution']
          and 'Recheck actual files at execution' in plan)
    check('no_source_edit_claimed_this_pass', not policy['scientific_source_files_changed_in_this_pass'])
    check('all_eight_milestones_retained', all(re.search(rf'^### M{i} —',plan,re.M) for i in range(8)))
    check('batched_verification_and_parallel_work_retained',
          'verification after the complete session batch' in plan and '**Parallel sessions are normal.**' in plan)
    check('same_artifact_and_publication_permissions_retained',
          'No production publication by implication' in plan and 'Same-artifact deployment' in plan)
    paths=a['historical_sources']
    check('fourteen_research_sources_preserved', len(paths)==14 and all(
        (ROOT/x['path']).is_file() and sha((ROOT/x['path']).read_bytes())==x['sha256']
        and (ROOT/x['path']).stat().st_size==x['bytes'] for x in paths))
    archive=ROOT/a['superseded_handoff']
    oldprefix='unity_theory_website_handoff_r3/'
    with zipfile.ZipFile(archive) as z:
        check('predecessor_zip_integrity',z.testzip() is None)
        source_files=[p for p in (ROOT/'source').rglob('*') if p.is_file()]
        check('all_source_snapshots_match_r3_bytes',len(source_files)==16 and all(
            p.read_bytes()==z.read(oldprefix+p.relative_to(ROOT).as_posix()) for p in source_files))
        check('r2_history_retained_inside_r3', oldprefix+'history/UNITY_THEORY_WEBSITE_HANDOFF_R2.zip' in z.namelist())
    docs=['UNITY_THEORY_WEBSITE_IMPLEMENTATION_PLAN.md','START_HERE.md','PROJECT_SOURCE_ALIGNMENT.md','BUNDLE_INFO.md']
    missing=[]
    for doc in docs:
        text=(ROOT/doc).read_text()
        check('balanced_code_fences:'+doc, sum(l.lstrip().startswith('```') for l in text.splitlines())%2==0)
        for link in re.findall(r'\]\(([^\s)]+)(?:\s+[^)]*)?\)',text):
            if re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:',link) or link.startswith('#'): continue
            target=link.split('#')[0]
            if target and not (ROOT/target).exists(): missing.append([doc,target])
    check('operative_document_file_links_resolve',not missing,missing)
    # A manifest identifies delivered bytes. It is not a source admission receipt.
    m=json.loads((ROOT/'HANDOFF_MANIFEST.json').read_text())
    actual={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file()
            and p.name!='HANDOFF_MANIFEST.json' and '__pycache__' not in p.parts}
    listed={r['path'] for r in m['files']}
    check('manifest_exact_membership',actual==listed,{'actual':len(actual),'listed':len(listed)})
    bad=[r['path'] for r in m['files'] if not (ROOT/r['path']).is_file()
         or sha((ROOT/r['path']).read_bytes())!=r['sha256']
         or (ROOT/r['path']).stat().st_size!=r['bytes']]
    check('manifest_hashes_and_sizes',not bad,bad)
    result={
        'scope':'R4 handoff structure, policy consistency, source preservation and packaging only',
        'observed_on':'2026-10-01',
        'status':'PASS' if all(c['status']=='PASS' for c in checks) else 'FAIL',
        'passed':sum(c['status']=='PASS' for c in checks),'total':len(checks),'checks':checks,
        'scientific_source_edits':False,'actual_current_sources_inspected':False,
        'website_and_numerical_checks':'NOT_RUN',
    }
    print(json.dumps(result,indent=2,ensure_ascii=False))
    return 0 if result['status']=='PASS' else 1

if __name__=='__main__':
    try: raise SystemExit(main())
    except (OSError,KeyError,ValueError,zipfile.BadZipFile) as exc:
        print(json.dumps({'status':'ERROR','error':str(exc)}),file=sys.stderr)
        raise SystemExit(2)
