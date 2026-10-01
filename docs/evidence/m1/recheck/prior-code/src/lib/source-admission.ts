import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { ContractError } from './errors.js';
import { sha256, stableJSON } from './identity.js';

export interface FileIdentity { path: string; bytes: number; sha256: string; role: string }
export interface SourceBinding { path: string; sourceSha256: string; startLine: number; endLine: number; excerptSha256: string }
export interface AdmissionRecord {
  schema: 'unity-source-intake/1';
  corpusScope: 'current' | 'synthetic';
  sourceReference: string;
  directory: string;
  edition: string;
  corePath: string;
  coreSha256: string;
  manifestPath: string;
  manifestFormat: 'markdown-active-files/1';
  manifestSha256: string;
  manifestMembers: string[];
  files: FileIdentity[];
  inventorySeal: string;
  priorCoreSha256: string | null;
  revision: null | { category: string; predecessor: string; problem: string; before: string; after: string; rationale: string; permissionBasis: string; dependentReviewHashes: string[] };
  inspection: { outcome: 'accepted' | 'pending'; inspectedFiles: string[]; evidenceRef: string };
  bindings: SourceBinding[];
  contentReview: 'pending' | 'accepted';
}

export function manifestMembers(text: string, format: AdmissionRecord['manifestFormat']) {
  if (format !== 'markdown-active-files/1') throw new ContractError('CURRENT_MANIFEST_INCOMPLETE', 'Inspect and implement an adapter for the selected manifest format');
  const section = text.split(/^## Active files\s*$/m)[1]?.split(/^#{1,2} /m)[0];
  const members = [...(section ?? '').matchAll(/^- `([^`]+)`(?:\s|$)/gm)].map(match => memberPath(match[1]));
  if (!members.length || new Set(members.map(p => p.normalize('NFC').toLowerCase())).size !== members.length) throw new ContractError('CURRENT_MANIFEST_INCOMPLETE', 'Missing or duplicate active manifest members');
  return members.sort();
}

function memberPath(value: string) {
  if (!value || value.startsWith('/') || /[\\\u0000-\u001f]/u.test(value) || value.split('/').some(p => !p || p === '.' || p === '..') || /^[a-z]:/i.test(value)) {
    throw new ContractError('UNSAFE_SOURCE_PATH', value);
  }
  return value;
}

export function filesIn(directory: string, prefix = ''): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = prefix + entry.name;
    memberPath(path);
    if (entry.isSymbolicLink()) throw new ContractError('UNSAFE_SOURCE_PATH', `symlink ${path}`);
    if (entry.isDirectory()) result.push(...filesIn(join(directory, entry.name), `${path}/`));
    else if (entry.isFile()) result.push(path);
    else throw new ContractError('UNSAFE_SOURCE_PATH', path);
  }
  const sorted = result.sort();
  if (new Set(sorted.map(x => x.normalize('NFC').toLowerCase())).size !== sorted.length) throw new ContractError('SOURCE_PATH_COLLISION', directory);
  return sorted;
}

export function verifyIdentities(directory: string, files: FileIdentity[], code = 'SOURCE_INTEGRITY_FAILURE') {
  for (const file of files) {
    const target = join(directory, memberPath(file.path));
    if (!existsSync(target) || !lstatSync(target).isFile() || lstatSync(target).isSymbolicLink()) throw new ContractError(code, file.path);
    const raw = readFileSync(target);
    if (raw.length !== file.bytes || sha256(raw) !== file.sha256) throw new ContractError(code, file.path);
  }
}

export function validateBinding(directory: string, binding: SourceBinding) {
  const path = join(directory, memberPath(binding.path));
  if (!existsSync(path)) throw new ContractError('SOURCE_BINDING_FAILURE', binding.path);
  const raw = readFileSync(path);
  const lines = raw.toString('utf8').match(/[^\n]*\n|[^\n]+$/g) ?? [];
  if (sha256(raw) !== binding.sourceSha256 || !Number.isInteger(binding.startLine) || !Number.isInteger(binding.endLine) || binding.startLine < 1 || binding.endLine < binding.startLine || binding.endLine > lines.length || sha256(lines.slice(binding.startLine - 1, binding.endLine).join('')) !== binding.excerptSha256) {
    throw new ContractError('SOURCE_BINDING_FAILURE', binding.path);
  }
}

export function qualifyCurrentSource(record: AdmissionRecord | null, root = process.cwd()) {
  if (!record || !existsSync(resolve(root, record.directory))) throw new ContractError('CURRENT_SOURCE_PACKAGE_MISSING', 'No actual admitted RRG_CURRENT directory');
  const directory = resolve(root, record.directory);
  if (record.schema !== 'unity-source-intake/1' || !record.sourceReference || !record.edition || /(?:^|\/)history(?:\/|$)/i.test(record.directory) || record.files.some(f => f.role === 'history_only')) {
    throw new ContractError('LEGACY_SOURCE_REJECTED', record.directory);
  }
  if (lstatSync(directory).isSymbolicLink()) throw new ContractError('UNSAFE_SOURCE_PATH', directory);
  const inventory = filesIn(directory);
  const recorded = record.files.map(f => f.path).sort();
  if (stableJSON(inventory) !== stableJSON(recorded) || !record.manifestMembers.every(p => inventory.includes(p)) || !inventory.includes(record.corePath) || !inventory.includes(record.manifestPath)) {
    throw new ContractError('CURRENT_MANIFEST_INCOMPLETE', 'Actual directory and inspected manifest membership differ');
  }
  const actualCore = sha256(readFileSync(join(directory, memberPath(record.corePath))));
  if (actualCore !== record.coreSha256) throw new ContractError('LOCKED_CORE_MISMATCH', record.corePath);
  const changedCore = record.priorCoreSha256 && record.priorCoreSha256 !== record.coreSha256;
  if (changedCore && (!record.revision || !['supplied-baseline', 'definition-core', 'factual-mathematical correction', 'format', 'wording'].includes(record.revision.category) || ![record.revision.predecessor, record.revision.problem, record.revision.before, record.revision.after, record.revision.rationale, record.revision.permissionBasis].every(v => typeof v === 'string' && v.trim()) || !record.revision.dependentReviewHashes.length || record.revision.dependentReviewHashes.some(h => !/^[a-f0-9]{64}$/.test(h)))) {
    throw new ContractError('LOCKED_CORE_MISMATCH', 'A changed selected edition needs a justified revision and affected reviews');
  }
  verifyIdentities(directory, record.files);
  const declaredMembers = manifestMembers(readFileSync(join(directory, memberPath(record.manifestPath)), 'utf8'), record.manifestFormat);
  if (stableJSON(declaredMembers) !== stableJSON([...record.manifestMembers].sort())) throw new ContractError('CURRENT_MANIFEST_INCOMPLETE', 'Recorded membership differs from the actual manifest text');
  if (sha256(readFileSync(join(directory, memberPath(record.manifestPath)))) !== record.manifestSha256 || sha256(stableJSON(record.files)) !== record.inventorySeal) {
    throw new ContractError('CURRENT_MANIFEST_INCOMPLETE', 'Manifest or edition seal changed');
  }
  if (record.inspection.outcome !== 'accepted' || stableJSON([...record.inspection.inspectedFiles].sort()) !== stableJSON(inventory) || !record.inspection.evidenceRef) {
    throw new ContractError('CURRENT_MANIFEST_INCOMPLETE', 'Full inspected edition record required');
  }
  for (const binding of record.bindings) {
    if (!inventory.includes(binding.path)) throw new ContractError('SOURCE_BINDING_FAILURE', binding.path);
    validateBinding(directory, binding);
  }
  return {
    availability: 'AVAILABLE_BYTES_VERIFIED' as const,
    bytesVerified: true,
    corpusScope: record.corpusScope,
    currentSourceQualified: record.corpusScope === 'current' && record.contentReview === 'accepted' && record.bindings.length > 0,
    files: record.files.length,
    coreSha256: actualCore,
    inventorySeal: record.inventorySeal,
    edition: record.edition
  };
}

export function readAdmission(file = 'config/research-source.json'): AdmissionRecord | null {
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
}

export function sourceState() {
  try { return { ...qualifyCurrentSource(readAdmission()), errorCode: null }; }
  catch (error) {
    if (!(error instanceof ContractError)) throw error;
    return { availability: 'UNAVAILABLE_OR_UNQUALIFIED', bytesVerified: false, currentSourceQualified: false, errorCode: error.code, files: 0, edition: null, coreSha256: null, inventorySeal: null, corpusScope: 'current' };
  }
}
