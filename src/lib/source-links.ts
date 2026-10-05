import { readFileSync } from 'node:fs';
import { dirname, resolve, posix } from 'node:path';
import { slug } from 'github-slugger';
import { parseMarkdown } from './markdown-tree.js';
import { rawPath, currentPackageMember } from './source-paths.js';
import type { Entry, Source } from './content-schema.js';

type Reading = Pick<Entry, 'id' | 'route' | 'publicationState' | 'sourceBinding'> & { title?: string };
export interface SourceLinkOwner {
  root?: string;
  sources?: Map<string, Source>;
  entries: Map<string, Reading>;
}
const historical = (state: string) => ['archived', 'superseded', 'withdrawn'].includes(state);

// The largest document extraction is the reading for a source; claim excerpts
// never displace it. This map serves HTML, disclosures and explanatory exports.
export function sourceReadings(owner: SourceLinkOwner) {
  const readings = new Map<string, Reading>();
  for (const entry of owner.entries.values()) {
    const binding = entry.sourceBinding;
    if (!binding || !entry.id.startsWith('DOC-') || historical(entry.publicationState)) continue;
    const prior = readings.get(binding.sourceKey)?.sourceBinding;
    if (!prior || binding.endLine - binding.startLine > prior.endLine - prior.startLine) readings.set(binding.sourceKey, entry);
  }
  return readings;
}

function fragmentFor(source: Source, fragment: string, root: string) {
  if (!fragment) return '';
  // The supplied catalogue uses empty HTML anchors. Its reading uses normal
  // Markdown headings instead, with the same semantic section destination.
  const raw = readFileSync(resolve(root, source.path), 'utf8');
  const anchors = [...raw.matchAll(/^<a id="(e\d+)"><\/a>\r?\n## (.+)$/gm)];
  const anchor = anchors.find(match => match[1] === decodeURIComponent(fragment));
  return '#' + (anchor ? slug(anchor[2]) : fragment);
}

export function documentMarkdown(text: string, owner: SourceLinkOwner, entry?: Pick<Entry, 'sourceBinding'>) {
  const source = entry?.sourceBinding && owner.sources?.get(entry.sourceBinding.sourceKey);
  if (!source || !owner.sources) return text;
  const readings = sourceReadings(owner), root = owner.root ?? process.cwd();
  const tree = parseMarkdown(text);
  const edits: { start: number; end: number; value: string }[] = [];
  const destinations = new Map<string, string | null>();
  function destination(url: string) {
    if (/^(?:https:\/\/|\/)/.test(url)) return url;
    if (url.startsWith('#')) return fragmentFor(source!, url.slice(1), root);
    // Only local document paths have an availability fallback. Unsafe schemes,
    // images and arbitrary destinations still go through the existing guard.
    if (!/^(?:[\w.-]+\/)*[\w.-]+\.(?:md|json|py)(?:#.*)?$/.test(url)) return url;
    const [path, fragment = ''] = url.split('#');
    const targetPath = posix.normalize(posix.join(dirname(source!.path), path));
    const target = [...owner.sources!.values()].find(item => item.path === targetPath);
    if (!target || !currentPackageMember(target)) return null;
    const reading = readings.get(target.key);
    return reading ? reading.route + fragmentFor(target, fragment, root) : rawPath(target.key, target.path);
  }
  function walk(node: any) {
    if (['code', 'inlineCode', 'math', 'inlineMath'].includes(node.type)) return;
    if (node.type === 'definition') destinations.set(node.identifier.toUpperCase(), destination(node.url));
    node.children?.forEach(walk);
  }
  walk(tree);
  function change(node: any) {
    if (['code', 'inlineCode', 'math', 'inlineMath'].includes(node.type)) return;
    if (['link', 'definition', 'linkReference'].includes(node.type) && node.position) {
      const replacement = node.type === 'linkReference' ? destinations.get(node.identifier.toUpperCase()) : destination(node.url);
      const start = node.position.start.offset, end = node.position.end.offset;
      const raw = text.slice(start, end);
      if (replacement === null) {
        const label = node.type === 'definition' ? '' : raw.slice(1, raw.indexOf(']')) + ' (source material unavailable on this website)';
        edits.push({ start, end, value: label });
      } else if (node.url && replacement !== node.url) {
        const offset = raw.lastIndexOf(node.url);
        if (offset >= 0) edits.push({ start: start + offset, end: start + offset + node.url.length, value: replacement! });
      }
      if (replacement?.startsWith('/downloads/original/') && node.type !== 'definition') edits.push({ start: end, end, value: ' (original source file)' });
    }
    node.children?.forEach(change);
  }
  change(tree);
  return edits.sort((a, b) => b.start - a.start).reduce((result, edit) => result.slice(0, edit.start) + edit.value + result.slice(edit.end), text);
}
