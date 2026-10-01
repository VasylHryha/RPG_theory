import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';

export function parseMarkdown(text: string) {
  return unified().use(remarkParse).use(remarkMath).use(remarkGfm).parse(text);
}
