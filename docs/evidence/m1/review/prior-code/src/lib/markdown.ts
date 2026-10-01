import remarkGfm from 'remark-gfm';
import { directivePlugin, type DirectiveOwner } from './directives.js';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { ContractError } from './errors.js';
import { safeMarkdown } from './markdown-safety.js';
export { safeMarkdown } from './markdown-safety.js';

interface Node { type: string; url?: string; identifier?: string; children?: Node[]; tagName?: string; properties?: Record<string, unknown> }
function visit(node: Node, action: (node: Node) => void) { action(node); node.children?.forEach(child => visit(child, action)); }

// rehype-katex records parse errors as warnings and emits fallback HTML.
// Turn those warnings into build failures and isolate macros per document.
export function strictMath() {
  return (tree: Parameters<ReturnType<typeof rehypeKatex>>[0], file: Parameters<ReturnType<typeof rehypeKatex>>[1]) => {
    rehypeKatex({ strict: 'error', trust: false, maxExpand: 500, maxSize: 20, output: 'htmlAndMathml', macros: {} })(tree, file);
    const failure = file.messages.find(message => message.source === 'rehype-katex');
    if (failure) throw new ContractError('MATH_RENDER_FAILURE', String(failure.cause ?? failure));
    visit(tree as unknown as Node, node => {
      if(node.tagName==='table') node.properties={...node.properties,tabIndex:0,ariaLabel:'Claim and evidence table; scroll horizontally if needed'};
      const classes = node.properties?.className;
      if (Array.isArray(classes) && classes.includes('katex-display')) {
        node.properties = { ...node.properties, tabIndex: 0, role: 'region', ariaLabel: 'Mathematical expression; scroll horizontally if needed' };
      }
    });
  };
}

export function renderMarkdownSync(text: string, basePath = '/', corpus?: DirectiveOwner) {
  const processor = unified().use(remarkParse).use(remarkMath).use(remarkGfm);
  if (corpus) processor.use(directivePlugin, { corpus });
  return String(processor.use(safeMarkdown, { basePath }).use(remarkRehype).use(rehypeSlug).use(strictMath).use(rehypeStringify).processSync(text));
}

export async function renderMarkdown(text: string, basePath = '/', corpus?: DirectiveOwner) { return renderMarkdownSync(text,basePath,corpus); }
