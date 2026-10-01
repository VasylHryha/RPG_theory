import { createHash } from 'node:crypto';

export const sha256 = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');

export function stableJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJSON).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => `${JSON.stringify(key)}:${stableJSON(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
