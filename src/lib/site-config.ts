import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ContractError } from './errors.js';
import { normalizeBase } from './urls.js';

export type BuildMode = 'preview' | 'qualification' | 'release';
export interface SiteConfig {
  origin: string;
  basePath: string;
  repository: { owner: string; name: string } | null;
  publicAuthorization: boolean;
}

export function loadSiteConfig(file = 'config/site.json'): SiteConfig {
  const data = JSON.parse(readFileSync(resolve(file), 'utf8'));
  let url: URL;
  try { url = new URL(data.origin); } catch { throw new ContractError('INVALID_SITE_CONFIG', 'origin must be an absolute HTTPS origin'); }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.username || url.password || url.search || url.hash || url.origin !== data.origin) {
    throw new ContractError('INVALID_SITE_CONFIG', 'origin must be a bare HTTPS origin');
  }
  if (typeof data.publicAuthorization !== 'boolean' || !(data.repository === null || (typeof data.repository?.owner === 'string' && typeof data.repository?.name === 'string' && /^[a-z0-9_.-]+$/i.test(data.repository.owner) && /^[a-z0-9_.-]+$/i.test(data.repository.name)))) {
    throw new ContractError('INVALID_SITE_CONFIG', 'repository and authorization must be explicit');
  }
  return { ...data, basePath: normalizeBase(data.basePath) };
}

export function buildMode(value = 'preview'): BuildMode {
  if (!['preview', 'qualification', 'release'].includes(value)) throw new ContractError('INVALID_BUILD_MODE', value);
  return value as BuildMode;
}

export const activeConfig = () => loadSiteConfig(process.env.UNITY_SITE_CONFIG);
export const activeMode = () => buildMode(process.env.UNITY_BUILD_MODE);
