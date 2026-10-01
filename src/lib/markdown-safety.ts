import { ContractError } from './errors.js';
import { withBase } from './urls.js';
interface Node { type: string; url?: string; identifier?: string; children?: Node[] }
function visit(node: Node, action: (node: Node) => void) { action(node); node.children?.forEach(child => visit(child, action)); }

export function safeMarkdown(options: { basePath?: string } = {}) {
  const destination = (url: string, image: boolean) => {
    if (url.startsWith('/') && !url.startsWith('//')) {
      const fragment = url.indexOf('#');
      return withBase(fragment < 0 ? url : url.slice(0, fragment), options.basePath ?? '/') + (fragment < 0 ? '' : url.slice(fragment));
    }
    if (!image && url.startsWith('#')) return url;
    if (!image && /^https:\/\//.test(url)) {
      const parsed = new URL(url);
      if (!parsed.username && !parsed.password) return url;
    }
    throw new ContractError('UNSAFE_MARKDOWN', `Unsupported destination: ${url}`);
  };
  return (tree: Node) => {
    // Reference destinations live in definition nodes, not link/image nodes.
    const definitions = new Map<string, string>();
    visit(tree, node => {
      if (node.type === 'definition' && node.identifier && !definitions.has(node.identifier.toUpperCase())) definitions.set(node.identifier.toUpperCase(), node.url ?? '');
    });
    visit(tree, node => {
    if (node.type === 'html') throw new ContractError('UNSAFE_MARKDOWN', 'Raw HTML is not permitted');
    if (['definition', 'link', 'image'].includes(node.type)) node.url = destination(node.url ?? '', node.type === 'image');
    if (node.type === 'imageReference' || node.type === 'linkReference') {
      const url = definitions.get((node.identifier ?? '').toUpperCase());
      if (url !== undefined) destination(url, node.type === 'imageReference');
    }
    });
  };
}

