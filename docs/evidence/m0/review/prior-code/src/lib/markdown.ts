import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { ContractError } from './errors.js';
import { withBase } from './urls.js';

interface Node { type: string; url?: string; children?: Node[]; properties?: Record<string, unknown> }
function visit(node: Node, action: (node: Node) => void) { action(node); node.children?.forEach(child => visit(child, action)); }

export function safeMarkdown(options: { basePath?: string } = {}) {
  return (tree: Node) => visit(tree, node => {
    if (node.type === 'html') throw new ContractError('UNSAFE_MARKDOWN', 'Raw HTML is not permitted');
    if (node.type === 'link' || node.type === 'image') {
      const url = node.url ?? '';
      if (url.startsWith('/') && !url.startsWith('//')) node.url = withBase(url.split('#')[0], options.basePath ?? '/') + (url.includes('#') ? '#' + url.split('#').slice(1).join('#') : '');
      else if (url.startsWith('#') && node.type === 'link') return;
      else if (node.type === 'link' && /^https:\/\//.test(url)) {
        const parsed = new URL(url);
        if (parsed.username || parsed.password) throw new ContractError('UNSAFE_MARKDOWN', url);
      } else throw new ContractError('UNSAFE_MARKDOWN', `Unsupported destination: ${url}`);
    }
  });
}

// rehype-katex records parse errors as warnings and emits fallback HTML.
// Turn those warnings into build failures and isolate macros per document.
export function strictMath() {
  return (tree: Parameters<ReturnType<typeof rehypeKatex>>[0], file: Parameters<ReturnType<typeof rehypeKatex>>[1]) => {
    rehypeKatex({ strict: 'error', trust: false, maxExpand: 500, maxSize: 20, output: 'htmlAndMathml', macros: {} })(tree, file);
    const failure = file.messages.find(message => message.source === 'rehype-katex');
    if (failure) throw new ContractError('MATH_RENDER_FAILURE', String(failure.cause ?? failure));
    visit(tree as unknown as Node, node => {
      const classes = node.properties?.className;
      if (Array.isArray(classes) && classes.includes('katex-display')) {
        node.properties = { ...node.properties, tabIndex: 0, role: 'region', ariaLabel: 'Mathematical expression; scroll horizontally if needed' };
      }
    });
  };
}

export async function renderMarkdown(text: string, basePath = '/') {
  return String(await unified().use(remarkParse).use(remarkMath).use(safeMarkdown, { basePath }).use(remarkRehype).use(rehypeSlug).use(strictMath).use(rehypeStringify).process(text));
}
