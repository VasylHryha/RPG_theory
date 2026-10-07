import type { Entry } from './content-schema.js';
import { ContractError } from './errors.js';

export function sourceDisplay(raw: string, adapter: Entry['adapter'] = 'markdown/1') {
  let text = raw;
  // Historical role wording in the current README/changelog; their reading
  // contexts disclose this presentation change. Original downloads stay exact.
  text = text.replace('owner’s audited GPT Library release', 'author’s audited GPT Library release')
    .replace('explicitly promoted by the owner to replace', 'explicitly promoted by the author to replace')
    .replace('**Owner decision:**', '**Author decision:**');
  // Exact malformed arrow escapes in the promoted conceptual companion.
  // Display-only repair; raw source/download bytes remain unchanged.
  if (adapter === 'rrg-document/1') text = text.replace(/\\nightarrow/g, '\\rightarrow');
  if (adapter === 'rrg-evidence-document/1') text = text.replace(/^<a id="e\d+"><\/a>\r?\n/gm, '');
  if (adapter === 'rrg-math-document/1') {
    // Exact supplied §39 formatting defect: a missing display close, not a
    // mathematical correction. Sidecar context discloses this display repair.
    const force = '\\[\n\\boxed{\nF_q=-\\frac{\\partial\\Gamma}{\\partial q}\n}\n\ndefines the restoring/driving interaction, and';
    if(text.split(force).length!==2) throw new ContractError('SOURCE_ADAPTER_FAILURE','Expected the supplied section 39 force-display boundary');
    text = text.replace(force,force.replace('}\n\ndefines','}\n\\]\n\ndefines'));
  }
  if (adapter === 'rrg-escaped-addendum/1' || adapter === 'rrg-document/1' && text.includes('\\n\\n')) {
    const offset = text.indexOf('\\n\\n');
    if (offset < 0) throw new ContractError('SOURCE_ADAPTER_FAILURE', 'Expected inspected literal addendum');
    text = text.slice(0,offset) + text.slice(offset).replace(/\\n/g,'\n').replace(/\\\\/g,'\\');
  }
  if (adapter === 'rrg-proof-table/1') text = text.replace(/(\|[^\n]+\|)\n(?:\s*\n)+(?=\|)/g,'$1\n');
  // Retained addenda have source-level titles. The website already supplies
  // the document's h1; keep the addenda text and order as section headings.
  if (adapter === 'rrg-document/1' || adapter === 'rrg-math-document/1' || adapter === 'rrg-evidence-document/1') text = text.replace(/^# /gm,'## ');
  return text.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_match,tex) => '\n$$\n'+tex+'\n$$\n').replace(/\\\((.*?)\\\)/g, (_match,tex) => '$'+tex+'$');
}
