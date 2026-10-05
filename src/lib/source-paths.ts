export const exportPath = (id: string) => `/downloads/explanatory/${id}.md`;
export function rawPath(key: string, sourcePath = '.md') {
  const extension = /\.(md|json|py)$/.exec(sourcePath)?.[1] ?? 'md';
  return `/downloads/original/${key}.${extension}`;
}
import type { Source } from './content-schema.js';

// Admission membership permits provenance/downloads; declaredCurrent separately
// permits scientific source bindings. Every member is byte-checked by the loader.
export function currentPackageMember(source: Pick<Source, 'path'>, directory = 'research/RRG_CURRENT') {
  return source.path.startsWith(directory + '/');
}
export function supportingPackageMember(source: Pick<Source, 'path' | 'role'>, directory = 'research/RRG_CURRENT') {
  return source.path.startsWith(directory + '/foundations/') || source.path.startsWith(directory + '/checks/') || ['audited-foundation-snapshot','foundation-errata','audit-check'].includes(source.role);
}
