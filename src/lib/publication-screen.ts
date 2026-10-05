import { lstatSync,readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { filesIn } from './source-admission.js';
import { sha256,stableJSON } from './identity.js';
import { ContractError } from './errors.js';

export function repositoryPathRisk(path:string) {
  if(path.startsWith('/') || path.split('/').some(p=>p==='..' || p==='.') || /[\\\x00-\x1f]/.test(path))return 'UNSAFE_REPOSITORY_PATH';
  if(/(^|\/)(?:\.git|\.idea|\.env[^/]*|node_modules|dist)(\/|$)|\.sln$|\.zip$|\.pdf$/i.test(path))return 'PRIVATE_OR_UNAPPROVED_REPOSITORY_FILE';
  if(/^(?:docs\/evidence|docs\/plans|unity_theory_website_handoff|research\/(?:history|project-notes))/.test(path))return 'PRIVATE_OR_UNAPPROVED_REPOSITORY_FILE';
  return null;
}
export function secretDiagnostics(raw:string) {
  const rules:[string,RegExp][]=[['PRIVATE_KEY',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['GITHUB_TOKEN',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],['AWS_ACCESS_KEY',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/]];
  return raw.split('\n').flatMap((line,index)=>rules.filter(([,rule])=>rule.test(line)).map(([rule])=>({line:index+1,rule})));
}
// Exact proposed public file selection only. No scanner result grants privacy or rights approval.
export function screenRepositoryFiles(root:string,paths:string[],allowedResearchPaths:string[]=[]) {
  const findings:{path:string;rule:string;line?:number}[]=[],files:{path:string;sha256:string}[]=[];
  for(const path of paths) {
    const risk=repositoryPathRisk(path);
    if(risk){findings.push({path,rule:risk});continue;}
    if(path.startsWith('research/') && !allowedResearchPaths.includes(path)){findings.push({path,rule:'RESEARCH_PUBLIC_SELECTION_REQUIRED'});continue;}
    const full=resolve(root,path);
    if(!full.startsWith(resolve(root)+'/')){findings.push({path,rule:'UNSAFE_REPOSITORY_PATH'});continue;}
    if(lstatSync(full).isSymbolicLink() || !lstatSync(full).isFile()){findings.push({path,rule:'REGULAR_PUBLIC_FILE_REQUIRED'});continue;}
    const raw=readFileSync(full);files.push({path,sha256:sha256(raw)});
    findings.push(...secretDiagnostics(raw.toString()).map(f=>({path,...f})));
  }
  return {status:findings.length?'BLOCKED':'NO_DETECTED_PATTERN',files,filesSha256:sha256(stableJSON(files)),findings,privacyCertified:false};
}

export function validateContributionWorkflow(root=process.cwd()) {
  const workflows=filesIn(resolve(root,'.github/workflows')).filter(p=>/\.ya?ml$/.test(p));
  if(stableJSON(workflows)!==stableJSON(['site.yml']))throw new ContractError('COMPETING_PUBLICATION_WORKFLOW',workflows.join(', '));
  const path=resolve(root,'.github/workflows/site.yml'),raw=readFileSync(path,'utf8'),w=parse(raw);
  const fail=(message:string)=>{throw new ContractError('UNSAFE_PUBLICATION_WORKFLOW',message);};
  if(Object.keys(w.on).some(k=>!['pull_request','workflow_dispatch'].includes(k)) || !('pull_request' in w.on) || !('workflow_dispatch' in w.on))fail('Only PR verification and manual dispatch allowed');
  if(stableJSON(w.permissions)!==stableJSON({contents:'read'}) || /secrets\.|pull_request_target|workflow_run/.test(raw))fail('Read-only default; no secrets or privileged PR trigger');
  if(stableJSON(Object.keys(w.jobs).sort())!==stableJSON(['deploy','prepare','verify']))fail('Single verify → prepare → deploy chain required');
  const {verify,prepare,deploy}=w.jobs;
  const manual=(condition:string)=>['github.event_name == \'workflow_dispatch\'','github.ref == \'refs/heads/main\'','inputs.operation == \'publish\'','vars.UNITY_DEPLOY_ENABLED == \'true\''].every(term=>condition.includes(term)) && !condition.includes('||');
  if(verify.permissions || verify.environment || verify.needs || verify.steps.some((s:any)=>s.uses?.includes('upload-') || s.uses?.includes('deploy-')))fail('PR verify has no deployment or artifact privileges');
  if(prepare.needs!=='verify' || !manual(prepare.if) || prepare.permissions || prepare.environment)fail('Preparation must depend on verification and be manual/read-only');
  if(deploy.needs!=='prepare' || !manual(deploy.if) || deploy.environment.name!=='github-pages' || stableJSON(deploy.permissions)!==stableJSON({pages:'write','id-token':'write'}))fail('Privileged deployment must depend on same-run manual preparation');
  if(deploy.steps.length!==1 || !deploy.steps[0].uses?.startsWith('actions/deploy-pages@') || deploy.steps[0].run)fail('Privileged job may only run the pinned Pages action');
  for(const job of Object.values(w.jobs) as any[])for(const step of job.steps) {
    if(step.uses && !/^[\w-]+\/[\w-]+@[a-f0-9]{40}$/.test(step.uses))fail('Action pins must be full commit IDs');
    if(step.uses?.startsWith('actions/checkout@') && step.with?.['persist-credentials']!==false)fail('Checkout credentials must not persist');
  }
  const runs=prepare.steps.filter((s:any)=>s.run).map((s:any)=>s.run);
  if(!runs.some((s:string)=>s.includes('check-publication.ts --require-deploy')) || !runs.some((s:string)=>s.includes('seal-deployment.ts')))fail('Explicit publication and artifact identity checks required before upload');
  const upload=prepare.steps.findIndex((s:any)=>s.uses?.startsWith('actions/upload-pages-artifact@'));
  const seal=prepare.steps.findIndex((s:any)=>s.run?.includes('seal-deployment.ts'));
  if(upload<=seal || prepare.steps[upload].with.path!=='dist/deploy' || prepare.steps[upload].with.name!=='github-pages' || deploy.steps[0].with['artifact_name']!=='github-pages')fail('Only the sealed same-run artifact may be deployed');
  const templates=filesIn(resolve(root,'.github/ISSUE_TEMPLATE')).filter(p=>/\.ya?ml$/.test(p));
  if(templates.length!==4)fail('Four bounded contribution forms required');
  for(const template of templates) {
    const form=parse(readFileSync(resolve(root,'.github/ISSUE_TEMPLATE',template),'utf8'));
    for(const id of ['record','passage','evidence','change','limitations'])if(!form.body.some((b:any)=>b.id===id && b.validations?.required))fail(`${template}: ${id} required`);
  }
  const dependabot=parse(readFileSync(resolve(root,'.github/dependabot.yml'),'utf8'));
  if(dependabot.version!==2 || dependabot.updates.length!==2)fail('Bounded npm and Actions updates required');
  for(const u of dependabot.updates)if(!['npm','github-actions'].includes(u['package-ecosystem']) || u.schedule.interval!=='monthly' || u['open-pull-requests-limit']>2 || !u.ignore.some((i:any)=>i['dependency-name']==='*' && i['update-types'].includes('version-update:semver-major')))fail('Conservative dependency schedule required');
  return {status:'PASS',prPermissions:'contents: read',deployment:'manual main only; disabled by default',artifactBinding:'same workflow run; verify → prepare → deploy; exact sealed directory',platformProtections:'NOT_CONFIGURED',scientificPublishingScheduled:false};
}
