import { documentMarkdown } from './source-links.js';
import { exportPath, rawPath } from './source-paths.js';
export { exportPath, rawPath } from './source-paths.js';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { stringify } from 'yaml';
import type { Entry } from './content-schema.js';
import type { Corpus } from './content.js';
import {load} from 'cheerio';
import {renderMarkdownSync} from './markdown.js';
import { parseMarkdown } from './markdown-tree.js';
import { exportDirectiveMarkdown } from './directives.js';
import { sourceDisplay } from './source-display.js';
import { sha256 } from './identity.js';
import { canonicalURL, safePath } from './urls.js';
import type { SiteConfig } from './site-config.js';
import { buildInputs } from './build-identity.js';
import { ContractError } from './errors.js';
import { assertBuildAllowed } from './publication.js';
import { makeZip, readZip } from './zip.js';
import { publicationCredit, citationGates, rightsSummary, thirdPartyNotices } from './publication-policy.js';
export { publicationCredit, citationGates } from './publication-policy.js';

export function citationCFF(identity: {websiteRelease:string;releaseAt:string},credit=publicationCredit()) {
  if(citationGates(credit).length)return null;
  return stringify({'cff-version':'1.2.0',message:'Please cite this exact website publication when using these explanatory exports.',title:credit.title,authors:[{name:credit.approvedCredit!.name}],version:identity.websiteRelease,'date-released':identity.releaseAt.slice(0,10),url:credit.permanentUrl!,...(credit.doi?{doi:credit.doi}:{})});
}
export function workspaceIdentity() {
  let sourceCommit:string|null=null,dirty=true;
  try { sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();dirty=Boolean(execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8'}).trim()); } catch { /* A source archive may have no Git identity. */ }
  return {sourceCommit,workspaceDirty:dirty,workspaceInputsSha256:buildInputs().inputsSha256,commitDescribesInputs:!dirty && sourceCommit!==null};
}
export function artifactPaths(exportIds:string[],sourceKeys:string[],releaseId:string,preview:boolean,sources?:Corpus['sources']) {
  if(!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(releaseId))throw new ContractError('INVALID_RELEASE','Unsafe release filename');
  return [...exportIds.map(exportPath),...sourceKeys.map(key=>rawPath(key,sources?.get(key)?.path)),'/downloads/release.json','/downloads/SHA256SUMS','/downloads/THIRD-PARTY-NOTICES.txt',`/downloads/unity-theory-publication-${releaseId}${preview?'-preview':''}.zip`];
}
type Selection={corpus:Corpus;entries:Entry[];references:any[];manifest:{mode:string;releaseId:string;releaseAt:string;exportIds:string[];sourceDownloadKeys:string[];feedIds:string[];[key:string]:unknown};manifestSha256:string};

// Reuse the display adapter and directive parser. Only destinations in parsed
// link nodes are normalized; code/math and scientific text remain intact.
const markdownTitle=(title:string)=>title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\\`*_\[\]#]/g,'\\$&');
function readingMarkdown(entry:Entry) {
  const context=entry.plainLanguage?`## Website reading context\n\n${entry.plainLanguage}\n\n`:'';
  const original=sourceDisplay(entry.statement ?? '',entry.adapter)+'\n\n'+entry.body;
  return entry.id==='DOC-HOME'?original+'\n\n'+context:context+original;
}
const exportHeadingIds=new WeakMap<Entry,Set<string>>();
function headingIds(corpus:Corpus,e:Entry){
 let ids=exportHeadingIds.get(e);if(!ids){const $=load(renderMarkdownSync(documentMarkdown(`# ${markdownTitle(e.title)}\n\n${readingMarkdown(e)}`,corpus,e),'/',corpus));ids=new Set($('[id]').toArray().map(el=>$(el).attr('id')!));exportHeadingIds.set(e,ids);}return ids;
}
export function explanatoryMarkdown(corpus:Corpus,entry:Entry,config:SiteConfig,selectedEntries=[...corpus.entries.values()]) {
  if(entry.publicationState==='withdrawn')throw new ContractError('WITHDRAWN_EXCERPT',entry.id);
  let text=exportDirectiveMarkdown(documentMarkdown(readingMarkdown(entry),corpus,entry),corpus);
  const tree=parseMarkdown(text);
  const edits:{start:number;end:number;value:string}[]=[];
  function walk(node:any) {
    if(['code','inlineCode','math','inlineMath'].includes(node.type))return;
    if(node.url?.startsWith('/') && node.position) {
      const fragment=node.url.indexOf('#');const route=fragment<0?node.url:node.url.slice(0,fragment);
      // Archived readings can exist in a private HTML preview, but they are
      // excluded from explanatory downloads. Keep those as website links.
      const target=selectedEntries.find(e=>e.route===route && !['withdrawn','archived'].includes(e.publicationState));
      const targetFragment=fragment<0?'':decodeURIComponent(node.url.slice(fragment+1));
      const absolute=target?`./${target.id}.md${targetFragment && headingIds(corpus,target).has(targetFragment)?'#'+targetFragment:''}`:route.startsWith('/downloads/original/')?`../original/${route.split('/').pop()}`:route==='/references/'?`../bibliography.md${fragment<0?'':node.url.slice(fragment).toLowerCase()}`:route==='/cite/'?'../CITATION-AND-RIGHTS.md':['/documents/','/articles/'].includes(route)?'../README.md':canonicalURL(route,config)+(fragment<0?'':node.url.slice(fragment));
      const start=node.position.start.offset,end=node.position.end.offset,raw=text.slice(start,end);
      // Destination spelling comes from the same parsed node; never rewrite prose.
      const offset=raw.lastIndexOf(node.url);
      if(offset<0)throw new ContractError('EXPORT_LINK_FAILURE',node.url);
      edits.push({start:start+offset,end:start+offset+node.url.length,value:absolute});
    }
    node.children?.forEach(walk);
  }
  walk(tree);text=edits.sort((a,b)=>b.start-a.start).reduce((s,e)=>s.slice(0,e.start)+e.value+s.slice(e.end),text);
  const sources=entry.sourceRefs.map(key=>{const s=corpus.sources.get(key)!;return `- ${key}: ${s.path}; SHA-256 ${s.sha256}; edition ${s.edition}${s.date?`; source date ${s.date}`:'; source date not supplied'}.`;}).join('\n');
  return `# ${markdownTitle(entry.title)}\n\n> Explanatory Markdown export; generated mirror, not an independent scientific source. Companion links work inside the publication ZIP; website-only anchors resolve to the companion document.\n> ${entry.id}; revision ${entry.revision}; ${entry.publicationState}; updated ${entry.updatedAt}.\n> Research edition: ${entry.researchEdition}.\n> Website reading: ${canonicalURL(entry.route,config)}${new URL(config.origin).hostname.endsWith('.invalid')?' (reserved private-preview URL; not permanent)':''}\n\n${text.trim()}\n\n## Export scope and provenance\n\n${entry.scope}\n\n${entry.limits}\n\n${sources}\n`;
}
export function rssXML(selection:Selection,config:SiteConfig,credit=publicationCredit()) {
  const xml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
  const articles=selection.entries.filter(e=>selection.manifest.feedIds.includes(e.id));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${xml(credit.title)}</title><link>${xml(canonicalURL('/articles/',config))}</link><description>Published explanatory articles; drafts are excluded.</description>${articles.map(e=>`<item><title>${xml(e.title)}</title><link>${xml(canonicalURL(e.route,config))}</link><guid isPermaLink="true">${xml(canonicalURL(e.route,config))}</guid><description>${xml(e.description)}</description><pubDate>${new Date(e.publishedAt!).toUTCString()}</pubDate>${e.tags?.map(t=>`<category>${xml(t)}</category>`).join('') ?? ''}</item>`).join('')}</channel></rss>\n`;
}
export function publicationAssets(selection:Selection,config:SiteConfig) {
  const credit=publicationCredit(selection.corpus.root),preview=selection.manifest.mode==='preview';
  const release=selection.manifest.mode==='release';
  if(release)assertBuildAllowed('release',config,selection.corpus.admission);
  const identity={schema:'unity-release/1',researchEdition:selection.corpus.admission.edition,websiteRelease:selection.manifest.releaseId,releaseAt:selection.manifest.releaseAt,websiteCodeVersion:JSON.parse(readFileSync('package.json','utf8')).version,...workspaceIdentity(),documentManifestSha256:selection.manifestSha256,distribution:preview?'private-preview':release?'authorized-release':'approved-selection-private-qualification',deployEligible:release,citationGates:citationGates(credit),publicReleaseAuthorized:release};
  const files=new Map<string,Buffer>();
  files.set('/downloads/THIRD-PARTY-NOTICES.txt',Buffer.from(thirdPartyNotices()));
  for(const id of selection.manifest.exportIds) {
    const e=selection.entries.find(e=>e.id===id);if(!e)throw new ContractError('ENTRY_NOT_SELECTED',id);
    files.set(exportPath(id),Buffer.from(explanatoryMarkdown(selection.corpus,e,config,selection.entries)));
  }
  for(const key of selection.manifest.sourceDownloadKeys) {
    const s=selection.corpus.sources.get(key)!;
    const raw=readFileSync(`${selection.corpus.root}/${s.path}`);if(sha256(raw)!==s.sha256)throw new ContractError('SOURCE_INTEGRITY_FAILURE',key);
    files.set(rawPath(key,s.path),raw);
  }
  const members=new Map<string,Buffer>([...files].map(([p,b])=>[p.slice('/downloads/'.length),b]));
  members.set('source-provenance.json',Buffer.from(JSON.stringify(selection.manifest.sourceDownloadKeys.map(key=>selection.corpus.sources.get(key)),null,2)+'\n'));
  members.set('release.json',Buffer.from(JSON.stringify(identity,null,2)+'\n'));
  members.set('bibliography.md',Buffer.from('# Bibliography\n\n'+selection.references.map(ref=>`## ${ref.id}\n\n${ref.title}\n\n${ref.url}\n\n${ref.supportScope}\n\n${ref.verificationScope}\n`).join('\n')));
  members.set('bibliography.json',Buffer.from(JSON.stringify(selection.references,null,2)+'\n'));
  members.set('publication-manifest.json',Buffer.from(JSON.stringify(selection.manifest,null,2)+'\n'));
  members.set('CITATION-AND-RIGHTS.md',Buffer.from(`# Citation and rights\n\n${credit.approvedCredit?.name ?? 'Public credit decision pending.'}\n\n${credit.permanentUrl ?? 'Permanent URL pending.'}\n\n${rightsSummary(credit)}\n\nCode, research prose/figures and data/evidence have separate rights decisions. Third-party rights and lawful exceptions remain applicable. The dependency notice in THIRD-PARTY-NOTICES.txt applies only to the named KaTeX and Pagefind dependencies, not the project.\n\nResearch edition: ${identity.researchEdition}\nWebsite release: ${identity.websiteRelease}\nSource commit: ${identity.sourceCommit ?? 'unavailable'}\nWorkspace dirty: ${identity.workspaceDirty}\nInput digest: ${identity.workspaceInputsSha256}\nDocument manifest: ${identity.documentManifestSha256}\n`));
  const cff=citationCFF(identity,credit);if(cff)members.set('CITATION.cff',Buffer.from(cff));
  members.set('README.md',Buffer.from(`# ${credit.title} — ${preview?'PRIVATE PREVIEW':'selected publication'}\n\n${preview?'This is a local generated mirror of the private website candidate. It is not an approved public release and cannot create additional permissions over the original content.':release?'This is the owner-authorized website publication bundle for the exact release identified in release.json.':'This package uses the reviewed selection for private qualification; it is not a hosted public release.'}\n\nExplanatory Markdown includes authored website reading context and the disclosed source-display adapters. Original downloads retain exact source bytes; this partial selection is not the complete RRG_CURRENT package. Original provenance is recorded in the explanatory documents and publication manifest. Bibliography metadata is supplied; journal PDFs, private history and administrative evidence are excluded.\n\nLocal web URLs use the configured base path. Reserved .invalid preview URLs are placeholders, not permanent identifiers. Consult release.json for edition, commit, dirty input digest and citation gates. Verify SHA256SUMS from the package root (the manifest excludes itself).\n`));
  const sums=[...members].sort(([a],[b])=>a.localeCompare(b)).map(([p,b])=>`${sha256(b)}  ${p}\n`).join('');
  members.set('SHA256SUMS',Buffer.from(sums));
  const zipPath=`/downloads/unity-theory-publication-${identity.websiteRelease}${preview?'-preview':''}.zip`;
  files.set('/downloads/release.json',members.get('release.json')!);files.set('/downloads/SHA256SUMS',Buffer.from(sums));files.set(zipPath,makeZip(members));
  if(cff)files.set('/downloads/CITATION.cff',Buffer.from(cff));
  return {files,identity,zipPath,members};
}
export function verifyArchive(raw:Buffer) {
  const members=readZip(raw),sums=members.get('SHA256SUMS')?.toString();if(!sums)throw new ContractError('ARCHIVE_MANIFEST_FAILURE','Missing SHA256SUMS');
  const expected=new Set(['SHA256SUMS']);
  for(const line of sums.trim().split('\n')) {
    const match=/^([a-f0-9]{64})  (.+)$/.exec(line);if(!match)throw new ContractError('ARCHIVE_MANIFEST_FAILURE',line);
    const [,hash,path]=match;safePath('/'+path);if(expected.has(path) || sha256(members.get(path) ?? Buffer.alloc(0))!==hash)throw new ContractError('ARCHIVE_HASH_FAILURE',path);expected.add(path);
  }
  if(expected.size!==members.size)throw new ContractError('ARCHIVE_MANIFEST_FAILURE','Unlisted member');
  return members;
}
