import { parseMarkdown } from './markdown-tree.js';
import { safeMarkdown } from './markdown-safety.js';
import { sourceDisplay } from './source-display.js';
import type { Entry } from './content-schema.js';
import { ContractError } from './errors.js';
import { withBase } from './urls.js';
export interface DirectiveOwner { entries: Map<string, { route: string; statement: string | null; plainLanguage: string; adapter?: Entry['adapter']; publicationState?: Entry['publicationState'] }>; references: Map<string, unknown> }
interface Node { type: string; value?: string; url?: string; children?: Node[]; position?: {start:{offset?:number};end:{offset?:number}} }
const syntax = /::claim\{id="(UT-[DARCEPFO][0-9]{2,})" view="(plainLanguage|statement)"\}|:claim\[(UT-[DARCEPFO][0-9]{2,})\]|:cite\[(BIB-[0-9]{4,})\]/g;
export function expandDirectives(tree: Node, corpus: DirectiveOwner, base = '/', ancestors: string[] = []) {
  const dependencies = new Set<string>(); const bibliography = new Set<string>();
  function excerpt(id: string, view: string) {
    if(ancestors.includes(id)) throw new ContractError('DEPENDENCY_CYCLE',ancestors.concat(id).join(' → '));
    const entry=corpus.entries.get(id); if(!entry) throw new ContractError('UNKNOWN_DEPENDENCY',id);
    if(entry.publicationState==='withdrawn') throw new ContractError('WITHDRAWN_EXCERPT',id);
    const text=view==='statement' ? sourceDisplay(entry.statement ?? '',entry.adapter) : entry.plainLanguage;
    if(!text) throw new ContractError('INVALID_DIRECTIVE',`Empty ${view} for ${id}`);
    const parsed=parseMarkdown(text) as Node;
    const nested=expandDirectives(parsed,corpus,base,ancestors.concat(id));
    dependencies.add(id); nested.dependencies.forEach(key=>dependencies.add(key)); nested.bibliography.forEach(key=>bibliography.add(key));
    safeMarkdown()(parsed);
    return {entry,parsed};
  }
  function walk(node: Node) {
    if (!node.children || ['code','inlineCode','math','inlineMath'].includes(node.type)) return;
    node.children = node.children.flatMap(child => {
      if (child.type==='paragraph' && child.children?.length===1 && child.children[0].type==='text') {
        const full=/^::claim\{id="(UT-[DARCEPFO][0-9]{2,})" view="(plainLanguage|statement)"\}$/.exec(child.children[0].value ?? '');
        if(full) {
          const {entry,parsed}=excerpt(full[1],full[2]);
          return [...(parsed.children ?? []),{type:'paragraph',children:[{type:'link',url:withBase(entry.route,base),children:[{type:'text',value:full[1]}]}]}];
        }
      }
      if (child.type !== 'text') { walk(child); return [child]; }
      const value = child.value ?? ''; const output: Node[] = []; let offset = 0;
      for (const match of value.matchAll(syntax)) {
        if(value[match.index+match[0].length]==='{') throw new ContractError('INVALID_DIRECTIVE','Unexpected directive attributes');
        output.push({ type: 'text', value: value.slice(offset, match.index) });
        const id = match[1] ?? match[3] ?? match[4];
        if (match[4]) {
          if (!corpus.references.has(id)) throw new ContractError('UNKNOWN_REFERENCE', id);
          bibliography.add(id);
          output.push({ type: 'link', url: withBase('/references/', base) + '#' + id, children: [{ type: 'text', value: id }] });
        } else {
          const entry = corpus.entries.get(id);
          if (!entry) throw new ContractError('UNKNOWN_DEPENDENCY', id);
          dependencies.add(id);
          if (match[1]) {
            const {parsed}=excerpt(id,match[2]);
            if (parsed.children?.length !== 1 || parsed.children[0].type !== 'paragraph') throw new ContractError('INVALID_DIRECTIVE', 'Inline expansion requires one paragraph');
            output.push(...(parsed.children[0].children ?? []), { type: 'text', value: ' ' });
          }
          output.push({ type: 'link', url: withBase(entry.route, base), children: [{ type: 'text', value: id }] });
        }
        offset = match.index + match[0].length;
      }
      output.push({ type: 'text', value: value.slice(offset) });
      if (output.some(n => n.type === 'text' && /(?<!\w):{1,2}[a-zA-Z][\w-]*(?:\[|\{)/.test(n.value ?? ''))) throw new ContractError('INVALID_DIRECTIVE', value);
      return output;
    });
  }
  walk(tree);
  return { dependencies: [...dependencies].sort(), bibliography: [...bibliography].sort() };
}
export function directivePlugin(options: { corpus: DirectiveOwner }) { return (tree: Node) => { expandDirectives(tree, options.corpus); }; }

// Export only the validated directive spans. Other source Markdown keeps its
// original spelling; code samples never become active directives.
export function exportDirectiveMarkdown(text: string, corpus: DirectiveOwner): string {
  const original = parseMarkdown(text) as Node;
  const changes: {start:number;end:number;value:string}[]=[];
  function visit(node: Node) {
    if (['code','inlineCode','math','inlineMath'].includes(node.type)) return;
    if(node.type==='text' && node.position?.start.offset!==undefined && node.position.end.offset!==undefined) {
      const source=text.slice(node.position.start.offset,node.position.end.offset);
      for(const match of source.matchAll(syntax)) {
        const id=match[1] ?? match[3] ?? match[4];const entry=corpus.entries.get(id);
        const link=match[4]?`[${id}](/references/#${id})`:`[${id}](${entry?.route})`;
        changes.push({start:node.position.start.offset+match.index,end:node.position.start.offset+match.index+match[0].length,value:match[1]?`${match[2]==='statement'?sourceDisplay(entry?.statement ?? '',entry?.adapter):entry?.plainLanguage}\n\n${link}`:link});
      }
    }
    node.children?.forEach(visit);
  }
  visit(original);
  expandDirectives(original,corpus); safeMarkdown()(original); // Same validation as HTML; no alternate parser policy.
  const output=changes.sort((a,b)=>b.start-a.start).reduce((value,change)=>value.slice(0,change.start)+change.value+value.slice(change.end),text);
  return changes.length ? exportDirectiveMarkdown(output,corpus) : output;
}
