import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,cpSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {parse,stringify} from 'yaml';
import {load} from 'cheerio';
import {publicationCredit,creditSchema,publicationPolicy,renderAbout,renderLegal,renderFooter,legalCopyDiagnostics,assertDeploymentAllowed,thirdPartyNotices,citationGates} from '../../src/lib/publication-policy.js';
import {validateContributionWorkflow,screenRepositoryFiles,repositoryPathRisk} from '../../src/lib/publication-screen.js';
import {publicationFor} from '../../src/lib/publication.js';
import {publicationAssets,verifyArchive,citationCFF} from '../../src/lib/publication-assets.js';
import {loadSiteConfig} from '../../src/lib/site-config.js';
import {sha256} from '../../src/lib/identity.js';

test('M5 owner credit and dated research grant reach every rights surface while code and data remain reserved',()=>{
 const c=publicationCredit();assert.equal(c.approvedCredit?.name,'Vasyl Hryha');assert.equal(c.approvedContact?.url,'mailto:vasylhryha.rrg@gmail.com');assert.equal(c.approvedRepository?.owner,'VasylHryha');assert.equal(c.approvedRepository?.name,'rrg_theory');assert.equal(c.approvedOrcid,null);
 for(const base of ['/','/unity-theory/']) {
  const about=load(renderAbout(c,base)),legal=load(renderLegal(c,base)),footer=load(renderFooter(base,c));
  assert.match(about.text(),/Approved public credit: Vasyl Hryha/);assert.match(legal.text(),/Website code: no additional license granted/);assert.match(legal.text(),/Research prose and figures: CC BY-NC-SA 4.0/);assert.match(legal.text(),/Data and evidence: no additional license granted/);assert.match(legal.text(),/lawful exceptions/);assert.match(legal.text(),/not retroactively removed/);
  for(const text of [legal.text(),footer.text()]){assert.match(text,/1 January 2033 at 00:00 UTC/);assert.match(text,/additionally licensed under CC BY 4.0/);assert.match(text,/first public website release/);assert.match(text,/Third-party material retains its own rights/);}
  assert.equal(footer('nav a').filter((_,el)=>footer(el).text()==='About and contact').attr('href'),base+'about/');assert.equal(legal('a').last().attr('href'),base+'downloads/THIRD-PARTY-NOTICES.txt');
 }
 assert.equal(parse(citationCFF({websiteRelease:'synthetic',releaseAt:'2026-10-04'})!).authors[0].name,'Vasyl Hryha');
 assert.deepEqual(citationGates(),[]);
});
test('M5 explicit synthetic credit drives About/footer/CFF without inferred contact or identity',()=>{
 const c=creditSchema.parse({...publicationCredit(),approvedCredit:{name:'Synthetic organization',evidenceRef:'Synthetic mechanics only'},approvedContact:{url:'https://example.org/contact',evidenceRef:'Synthetic only'},approvedOrcid:{url:'https://orcid.org/0000-0000-0000-000X',evidenceRef:'Synthetic only'},approvedRepository:{owner:'example',name:'research',evidenceRef:'Synthetic only'},permanentUrl:'https://example.org/research/',rights:{statement:'Synthetic rights only',evidenceRef:'Synthetic only'}});
 assert.match(renderAbout(c),/Synthetic organization/);assert.match(renderAbout(c),/https:\/\/example.org\/contact/);assert.match(renderFooter('/',c),/Synthetic organization/);
 const cff=parse(citationCFF({websiteRelease:'synthetic',releaseAt:'2026-10-04'},c)!);assert.equal(cff.authors[0].name,c.approvedCredit!.name);assert.equal(cff.url,c.permanentUrl);
});
test('M5 deployment rejects PR, fixture host, unapproved target, missing identity and pending scoped rights with named reasons',()=>{
 const credit=creditSchema.parse({...publicationCredit(),approvedCredit:{name:'Synthetic organization',evidenceRef:'Synthetic only'},approvedRepository:{owner:'example',name:'research',evidenceRef:'Synthetic only'},permanentUrl:'https://example.org/research/',rights:{statement:'Synthetic only',evidenceRef:'Synthetic only'},rightsScopes:Object.fromEntries(['code','research','data'].map(k=>[k,{state:'no-additional-license',evidenceRef:'Synthetic only',file:null,sha256:null,identifier:null}]))});
 const policy={...publicationPolicy(),deploymentEnabled:true,approvedTarget:credit.approvedRepository,publicContentApproval:{evidenceRef:'Synthetic only'},privacyApproval:{evidenceRef:'Synthetic only'},rightsReview:{evidenceRef:'Synthetic only'},qualification:{evidenceRef:'Synthetic only'},repositoryFiles:['package.json']};
 const config={...loadSiteConfig(),origin:'https://example.org',repository:{owner:'example',name:'research'},publicAuthorization:true},context={event:'workflow_dispatch',ref:'refs/heads/main',repository:'example/research',sha:'synthetic'};
 assert.doesNotThrow(()=>assertDeploymentAllowed(policy,credit,config,context,true));
 assert.throws(()=>assertDeploymentAllowed(policy,credit,config,{...context,event:'pull_request'},true),/MANUAL_MAIN_DEPLOYMENT_REQUIRED/);
 assert.throws(()=>assertDeploymentAllowed(policy,credit,{...config,origin:'https://fixture.invalid'},context,true),/PUBLIC_TARGET_REQUIRED/);
 assert.throws(()=>assertDeploymentAllowed({...policy,approvedTarget:null},credit,config,context,true),/PUBLIC_TARGET_NOT_AUTHORIZED/);
 assert.throws(()=>assertDeploymentAllowed(policy,{...credit,approvedCredit:null},config,context,true),/PUBLIC_CREDIT_DECISION_REQUIRED/);
 assert.throws(()=>assertDeploymentAllowed(policy,{...credit,rightsScopes:{...credit.rightsScopes,code:{state:'pending',evidenceRef:null,file:null,sha256:null,identifier:null}}},config,context,true),/SCOPED_RIGHTS_REVIEW_REQUIRED/);
 assert.throws(()=>assertDeploymentAllowed({...policy,qualification:null},credit,config,context,true),/M6_RELEASE_QUALIFICATION_REQUIRED/);
});
test('M5 scoped license declarations bind exact files; no additional license state cannot imply a grant',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-m5-rights-'));
 try {
  mkdirSync(join(root,'research/publication'),{recursive:true});mkdirSync(join(root,'licenses'));
  cpSync('licenses',join(root,'licenses'),{recursive:true});
  const raw=readFileSync('node_modules/rehype-katex/node_modules/katex/LICENSE'),c=publicationCredit();writeFileSync(join(root,'licenses/synthetic.txt'),raw);
  c.rightsScopes.code={state:'licensed',evidenceRef:'Synthetic fixture, not real approval',identifier:'Synthetic MIT mechanics',file:'licenses/synthetic.txt',sha256:sha256(raw)};
  writeFileSync(join(root,'research/publication/metadata.json'),JSON.stringify(c));assert.equal(publicationCredit(root).rightsScopes.code.identifier,c.rightsScopes.code.identifier);
  writeFileSync(join(root,'licenses/synthetic.txt'),'modified license');assert.throws(()=>publicationCredit(root),/RIGHTS_DECLARATION_MISMATCH/);
  c.rightsScopes.code.state='no-additional-license';assert.equal(creditSchema.safeParse(c).success,false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('M5 targeted legal-copy control flags the faux any-use royalty claim; a parser never certifies legal wording',()=>{
 const $=load(renderFooter());$('p').eq(1).text('Any use owes 10% of revenue.');
 assert.deepEqual(legalCopyDiagnostics($('p').toArray().map(p=>$(p).text()).join('\n')),['LEGAL_COPY_REVIEW_REQUIRED']);
});
test('M5 actual workflow is read-only for PRs and manual artifact-bound for deploy; privileged PR mutation refuses',()=>{
 assert.equal(validateContributionWorkflow().status,'PASS');
 const actual=parse(readFileSync('.github/workflows/site.yml','utf8'));assert.deepEqual(actual.on.push,{branches:['main']});
 const root=mkdtempSync(join(tmpdir(),'unity-m5-workflow-'));
 try {
  cpSync('.github',join(root,'.github'),{recursive:true});const path=join(root,'.github/workflows/site.yml'),w=parse(readFileSync(path,'utf8'));
  w.jobs.deploy.if="github.event_name == 'pull_request'";writeFileSync(path,stringify(w));assert.throws(()=>validateContributionWorkflow(root),/UNSAFE_PUBLICATION_WORKFLOW/);
  w.jobs.deploy.if=actual.jobs.deploy.if;w.on.push={tags:['*']};writeFileSync(path,stringify(w));assert.throws(()=>validateContributionWorkflow(root),/UNSAFE_PUBLICATION_WORKFLOW/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('M5 public repository screen refuses private/history paths and reports secret locations without values',()=>{
 const root=mkdtempSync(join(tmpdir(),'unity-m5-screen-'));
 try {
  const fake='ghp_'+'A'.repeat(36);writeFileSync(join(root,'code.ts'),`const token='${fake}';`);
  const r=screenRepositoryFiles(root,['code.ts','RRG_CURRENT.zip','docs/evidence/receipt.md','research/history/old.md','research/publication/pages/draft.md']);
  assert.equal(r.status,'BLOCKED');assert.equal(r.privacyCertified,false);assert.ok(r.findings.some(f=>f.rule==='GITHUB_TOKEN'));assert.ok(!JSON.stringify(r).includes(fake));assert.ok(r.findings.some(f=>f.rule==='RESEARCH_PUBLIC_SELECTION_REQUIRED'));
  assert.equal(repositoryPathRisk('.idea/runtime.xml'),'PRIVATE_OR_UNAPPROVED_REPOSITORY_FILE');
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('M5 ZIP carries the selected research grant and exact renderer notice without administrative material',()=>{
 const s=publicationFor('preview',loadSiteConfig()),a=publicationAssets(s,loadSiteConfig()),z=verifyArchive(a.files.get(a.zipPath)!);
 assert.equal(z.get('THIRD-PARTY-NOTICES.txt')?.toString(),thirdPartyNotices());assert.ok(thirdPartyNotices().endsWith(readFileSync('node_modules/rehype-katex/node_modules/katex/LICENSE','utf8')));
 assert.equal(z.has('CITATION.cff'),true);assert.equal(z.has('RIGHTS.md'),false);assert.equal(z.has('docs/evidence/m5/implementation/owner-decisions.md'),false);
 assert.ok(z.get('CITATION-AND-RIGHTS.md')!.toString().includes(publicationCredit().rights!.statement));
 for(const path of z.keys())assert.doesNotMatch(path,/^(?:docs|history|\.git|research)\//);
});
