import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'astro/zod';
import { sha256 } from './identity.js';
import { ContractError } from './errors.js';
import { withBase } from './urls.js';
import { escapeHTML as esc } from './presentation.js';
import type { SiteConfig } from './site-config.js';

const evidence = z.string().trim().min(1);
const repository = z.object({owner:z.string().regex(/^[\w.-]+$/),name:z.string().regex(/^[\w.-]+$/),evidenceRef:evidence}).strict();
const scope = z.object({state:z.enum(['pending','no-additional-license','licensed']),evidenceRef:evidence.nullable(),identifier:z.string().nullable(),file:z.string().nullable(),sha256:z.string().regex(/^[a-f0-9]{64}$/).nullable()}).strict().superRefine((value,ctx)=>{
  if(value.state!=='pending' && !value.evidenceRef)ctx.addIssue({code:'custom',message:'Owner rights decision required'});
  if(value.state==='licensed' && (!value.identifier || !value.file?.startsWith('licenses/') || value.file.split('/').some(p=>p==='..') || !value.sha256))ctx.addIssue({code:'custom',message:'Exact scoped license file required'});
  if(value.state!=='licensed' && (value.identifier || value.file || value.sha256))ctx.addIssue({code:'custom',message:'No license may be implied by pending or no-additional-license state'});
});
const pending = {state:'pending' as const,evidenceRef:null,identifier:null,file:null,sha256:null};
export const creditSchema=z.object({
  schema:z.literal('unity-credit/1'),title:z.string().trim().min(1),
  approvedCredit:z.object({name:z.string().trim().min(1),evidenceRef:evidence}).strict().nullable(),
  approvedContact:z.object({url:z.string().refine(v=>/^https:\/\//.test(v) || /^mailto:[^\s?]+@[^\s?]+$/.test(v)),evidenceRef:evidence}).strict().nullable().default(null),
  approvedOrcid:z.object({url:z.string().regex(/^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/),evidenceRef:evidence}).strict().nullable().default(null),
  approvedRepository:repository.nullable().default(null),
  permanentUrl:z.url().nullable(),rights:z.object({statement:z.string().min(1),evidenceRef:evidence}).strict().nullable(),doi:z.string().nullable(),
  rightsScopes:z.object({code:scope,research:scope,data:scope}).strict().default({code:pending,research:pending,data:pending})
}).strict();
export type Credit=z.infer<typeof creditSchema>;
export function publicationCredit(root=process.cwd()) {
  const credit=creditSchema.parse(JSON.parse(readFileSync(resolve(root,'research/publication/metadata.json'),'utf8')));
  for(const value of Object.values(credit.rightsScopes))if(value.state==='licensed') {
    const path=resolve(root,value.file!);
    if(!existsSync(path) || sha256(readFileSync(path))!==value.sha256)throw new ContractError('RIGHTS_DECLARATION_MISMATCH',value.file!);
  }
  if(credit.rights && legalCopyDiagnostics(credit.rights.statement).length)throw new ContractError('LEGAL_COPY_REVIEW_REQUIRED','Automatic royalty/idea-ownership claim conflicts with the recorded publication policy');
  return credit;
}
export function citationGates(credit:Credit=publicationCredit()) {
  return [!credit.approvedCredit && 'PUBLIC_CREDIT_DECISION_REQUIRED',(!credit.permanentUrl || new URL(credit.permanentUrl).hostname.endsWith('.invalid')) && 'PERMANENT_URL_REQUIRED',!credit.rights && 'RIGHTS_DECISION_REQUIRED'].filter(Boolean) as string[];
}
// A targeted contradiction diagnostic, not legal certification or a substitute for review.
export function legalCopyDiagnostics(text:string) {
  return [/\bany use\b[^.\n]{0,100}\b(?:owes|must pay|requires payment)\b/i,/\b(?:mandatory|automatic)\b[^.\n]{0,60}\b(?:royalt|\d+\s*%)/i,/\b(?:own|ownership of)\b[^.\n]{0,50}\b(?:all scientific ideas|the underlying scientific idea)\b/i].filter(r=>r.test(text)).map(()=> 'LEGAL_COPY_REVIEW_REQUIRED');
}
export const noGrant='No additional license is granted by this preview; license selection is pending.';
export function rightsSummary(credit:Credit=publicationCredit()) { return credit.rights?.statement ?? noGrant; }
export function renderFooter(base='/',credit:Credit=publicationCredit()) {
  const repo=credit.approvedRepository;
  return `<div><p>${esc(credit.title)} · ${esc(credit.approvedCredit?.name ?? 'Public credit pending')}</p><details><summary>Content rights and reuse</summary><p>${esc(rightsSummary(credit))}</p><p>Code and separately distributed data have their own recorded rights. <a href="${withBase('/legal/',base)}">Read the scoped rights and third-party notices</a>.</p></details></div><nav aria-label="More about RRG"><a href="${withBase('/about/',base)}">About and contact</a><a href="${withBase('/articles/',base)}">Deeper explanations</a><a href="${withBase('/references/',base)}">Sources</a><a href="${withBase('/cite/',base)}">Cite</a><a href="${withBase('/legal/',base)}">Rights</a>${repo?`<a href="https://github.com/${esc(repo.owner)}/${esc(repo.name)}/blob/main/CONTRIBUTING.md">Contribute</a>`:''}</nav>`;
}
export function renderAbout(credit:Credit=publicationCredit(),base='/') {
  const repo=credit.approvedRepository,repository=repo?`https://github.com/${esc(repo.owner)}/${esc(repo.name)}`:null;
  return `<h2>What RRG is</h2><p>${esc(credit.title)} explores how arrangement and activity support persistent wholes, how those wholes become useful units and how existing organization changes conditions for what can form next. It is a working research programme, open to investigation and revision.</p><h2>Who maintains it</h2><p>Approved public credit: ${esc(credit.approvedCredit?.name ?? 'decision pending; no personal identity inferred')}.</p><h2>Contact and contribute</h2><p>${credit.approvedContact?`<a href="${esc(credit.approvedContact.url)}">Approved contact for questions and commercial discussions</a>`:'Contact: decision pending.'}</p><p>Website/text corrections, scientific-source corrections, new evidence suggestions and theory extensions have distinct review scopes. Include the affected passage, your proposed change, evidence and limitations.</p>${repository?`<p><a href="${repository}/issues/new/choose">Choose a contribution form</a> · <a href="${repository}/blob/main/CONTRIBUTING.md">Read the contribution guide</a> · <a href="${repository}">Inspect the repository</a></p>`:'<p>Public repository: decision pending.</p>'}<h2>Current public status</h2><p>A research draft is a published proposal, not scientific certification. Local mechanisms and partial bridges have specific conditions; stronger recursive, fundamental and cosmological claims remain open.</p><p><a href="${withBase('/start/',base)}">Start with the idea</a> · <a href="${withBase('/research-status/',base)}">Research status</a> · <a href="${withBase('/cite/',base)}">Citation and exact edition</a> · <a href="${withBase('/legal/',base)}">Rights and reuse</a></p><details><summary>Identity details</summary><p>${credit.approvedOrcid?`ORCID: <a href="${credit.approvedOrcid.url}">${credit.approvedOrcid.url}</a>`:'No approved ORCID supplied.'}</p>${repo?`<p>Repository: ${esc(repo.owner)}/${esc(repo.name)}</p>`:''}</details>`;
}
export function thirdPartyNotices(root=process.cwd()) {
  const path='node_modules/rehype-katex/node_modules/katex';
  const pkg=JSON.parse(readFileSync(resolve(root,path,'package.json'),'utf8'));
  const searchPkg=JSON.parse(readFileSync(resolve(root,'node_modules/pagefind/package.json'),'utf8'));
  return `# Third-party notices\n\nDependency licenses apply only to those dependencies, not to the research prose, figures, data or project code. Other build dependencies retain their respective package notices.\n\n## Pagefind ${searchPkg.version}\n\nSearch uses Pagefind. Its installed notices follow; the indexing wrapper's retained notices are included as well.\n\n${readFileSync(resolve(root,'node_modules/pagefind/LICENSE/LICENSE'),'utf8')}\n${readFileSync(resolve(root,'node_modules/pagefind/LICENSE/LICENSE-vscode-ripgrep'),'utf8')}\n## KaTeX ${pkg.version}\n\nRendered mathematics uses this exact KaTeX renderer, stylesheet and bundled fonts.\n\n${readFileSync(resolve(root,path,'LICENSE'),'utf8')}`;
}
export function renderLegal(credit:Credit=publicationCredit(),base='/') {
  return `<h2>Rights at a glance</h2><ul>${Object.entries(credit.rightsScopes).map(([key,value])=>`<li>${{code:'Website code',research:'Research prose and figures',data:'Data and evidence'}[key]}: ${value.state==='licensed'?esc(value.identifier!):value.state==='pending'?'selection pending; no additional license granted':'no additional license granted (recorded owner decision)'}</li>`).join('')}<li>Third-party works: their own terms.</li></ul><details class="source-details"><summary>Full content-rights statement</summary><p>${esc(rightsSummary(credit))}</p></details><p>Third-party rights and lawful exceptions remain applicable. Please attribute the project and identify the exact source or edition when referring to its work; this request does not create a new license condition.</p><h2>Ideas and commercial discussions</h2><p>Copyright protects eligible expression, rather than ownership of an underlying scientific idea. This page does not impose an automatic royalty or a universal commercial-use restriction. Commercial permissions or agreements, where needed, require a separate agreement with the relevant rights holder.</p><p>${credit.approvedContact?`Use the <a href="${esc(credit.approvedContact.url)}">approved contact</a> for commercial discussions.`:'A commercial contact has not yet been approved.'}</p><p>Permissions already validly granted under a Creative Commons license are not retroactively removed by later license choices. License selection for this project is recorded separately for each scope above.</p><p>Background: <a href="https://www.copyright.gov/what-is-copyright/">U.S. Copyright Office on expression and ideas</a>; <a href="https://creativecommons.org/faq/#what-if-i-change-my-mind-about-using-a-cc-license">Creative Commons on existing permissions</a>.</p><h2>Third-party notices</h2><p>KaTeX and Pagefind retain their own dependency licenses. These grant no license over this project's research or website code.</p><p><a href="${withBase('/downloads/THIRD-PARTY-NOTICES.txt',base)}">Read the complete dependency notice</a>.</p>`;
}

const approval=z.object({evidenceRef:evidence}).strict().nullable();
export const policySchema=z.object({schema:z.literal('unity-publication-policy/1'),deploymentEnabled:z.boolean(),branch:z.literal('main'),environment:z.literal('github-pages'),approvedTarget:repository.nullable(),publicContentApproval:approval,privacyApproval:approval,rightsReview:approval,qualification:approval,repositoryFiles:z.array(z.string()),platformProtections:z.object({status:z.literal('NOT_CONFIGURED'),reason:z.string()}).strict()}).strict();
export type PublicationPolicy=z.infer<typeof policySchema>;
export function publicationPolicy(root=process.cwd()):PublicationPolicy {return policySchema.parse(JSON.parse(readFileSync(resolve(root,'config/publication-policy.json'),'utf8')));}
export interface DeploymentContext {event:string;ref:string;repository:string;sha:string}
export function deploymentGates(policy:PublicationPolicy,credit:Credit,config:SiteConfig,context:DeploymentContext,sourceQualified:boolean) {
  const gates:string[]=[];
  if(context.event!=='workflow_dispatch' || context.ref!==`refs/heads/${policy.branch}`)gates.push('MANUAL_MAIN_DEPLOYMENT_REQUIRED');
  if(new URL(config.origin).hostname.endsWith('.invalid') || !config.repository)gates.push('PUBLIC_TARGET_REQUIRED');
  if(!policy.approvedTarget || !config.publicAuthorization || !credit.approvedRepository || context.repository!==`${policy.approvedTarget.owner}/${policy.approvedTarget.name}` || config.repository?.owner!==policy.approvedTarget.owner || config.repository?.name!==policy.approvedTarget.name || credit.approvedRepository.owner!==policy.approvedTarget.owner || credit.approvedRepository.name!==policy.approvedTarget.name)gates.push('PUBLIC_TARGET_NOT_AUTHORIZED');
  gates.push(...citationGates(credit));
  if(Object.values(credit.rightsScopes).some(s=>s.state==='pending') || !policy.rightsReview)gates.push('SCOPED_RIGHTS_REVIEW_REQUIRED');
  if(!policy.publicContentApproval)gates.push('PUBLIC_CONTENT_APPROVAL_REQUIRED');
  if(!policy.privacyApproval || !policy.repositoryFiles.length)gates.push('PUBLIC_REPOSITORY_PRIVACY_REVIEW_REQUIRED');
  if(!sourceQualified)gates.push('CURRENT_SOURCE_NOT_QUALIFIED');
  if(!policy.qualification)gates.push('M6_RELEASE_QUALIFICATION_REQUIRED');
  if(!policy.deploymentEnabled)gates.push('DEPLOYMENT_DISABLED');
  return gates;
}
export function assertDeploymentAllowed(policy:PublicationPolicy,credit:Credit,config:SiteConfig,context:DeploymentContext,sourceQualified:boolean) {
  const gates=deploymentGates(policy,credit,config,context,sourceQualified);
  if(gates.length)throw new ContractError(gates[0],gates.join(', '));
}
