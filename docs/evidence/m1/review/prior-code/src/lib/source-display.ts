import type { Entry } from './content-schema.js';
import { ContractError } from './errors.js';

export function sourceDisplay(raw: string, adapter: Entry['adapter'] = 'markdown/1') {
  let text = raw;
  if (adapter === 'rrg-escaped-addendum/1') {
    const offset = text.indexOf('\\n\\n');
    if (offset < 0) throw new ContractError('SOURCE_ADAPTER_FAILURE', 'Expected inspected literal addendum');
    text = text.slice(0,offset) + text.slice(offset).replace(/\\n/g,'\n').replace(/\\\\/g,'\\');
  }
  if (adapter === 'rrg-proof-table/1') text = text.replace(/(\|[^\n]+\|)\n(?:\s*\n)+(?=\|)/g,'$1\n');
  return text.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_match,tex) => '\n$$\n'+tex+'\n$$\n').replace(/\\\((.*?)\\\)/g, (_match,tex) => '$'+tex+'$');
}
