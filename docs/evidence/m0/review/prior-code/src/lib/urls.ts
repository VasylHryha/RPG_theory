import { ContractError } from './errors.js';

export function safePath(value: string): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\?#\s\u0000-\u001f]/u.test(value)) {
    throw new ContractError('UNSAFE_ROUTE', String(value));
  }
  let decoded = value;
  for (let i = 0; i < 6; i++) {
    let next: string;
    try { next = decodeURIComponent(decoded); } catch { throw new ContractError('UNSAFE_ROUTE', value); }
    if (next === decoded) break;
    decoded = next;
  }
  if (decoded.includes('%') || /[\\?#\s\u0000-\u001f]/u.test(decoded) || decoded.includes('//') || decoded.split('/').some(p => p === '.' || p === '..')) {
    throw new ContractError('UNSAFE_ROUTE', value);
  }
  return value;
}

export function normalizeBase(value: string): string {
  safePath(value);
  return value === '/' ? '/' : `${value.replace(/\/$/, '')}/`;
}

export function withBase(route: string, base = '/'): string {
  safePath(route);
  const prefix = normalizeBase(base);
  return route === '/' ? prefix : `${prefix}${route.slice(1)}`;
}

export function canonicalURL(route: string, config: { origin: string; basePath: string }): string {
  return `${config.origin}${withBase(route, config.basePath)}`;
}

export function assertUniqueRoutes(routes: string[]) {
  const seen = new Set<string>();
  for (const route of routes) {
    const key = decodeURIComponent(safePath(route)).normalize('NFC').replace(/\/$/, '').toLocaleLowerCase('en-US');
    if (seen.has(key)) throw new ContractError('ROUTE_COLLISION', route);
    seen.add(key);
  }
}
