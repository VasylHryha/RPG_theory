import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { loadCanonicalCorpus, type Corpus } from '../src/lib/content.js';
import { filesIn, type AdmissionRecord } from '../src/lib/source-admission.js';
import { sha256, stableJSON } from '../src/lib/identity.js';
import { fidelityChecks, validateWebsiteReviews, websiteReviewInputs, websiteReviewState } from '../src/lib/website-review.js';
import { selectPublication } from '../src/lib/publication.js';
import { loadSiteConfig } from '../src/lib/site-config.js';

// This authoring command records byte registration and explicitly scoped fidelity
// decisions. It never commits, publishes, grants rights or accepts engineering work.
type Row = Record<string, any>;
type State = {
  schema: 'rrg-edition-run/1'; version: string; edition: string; date: string;
  label: string; approval: string; head: string; prior: string; snapshot: string;
  changePath: string; realSources: string[]; sourceFiles: Row[];
  phase: 'prepared' | 'registered' | 'pending' | 'checked'; select?: string;
  checks: Row[]; registrationPins?: Record<string, string>;
};
const options: Record<string, string> = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i].replace(/^--/, '');
  if (!process.argv[i].startsWith('--') || !['version','label','approval','accept-reviewed','reviewer','note','select','dry-run'].includes(key) || key in options) throw Error('Unknown or duplicate option: ' + process.argv[i]);
  const value = key === 'dry-run' ? 'true' : process.argv[++i];
  if (!value?.trim() || value.startsWith('--')) throw Error('Missing value for --' + key);
  options[key] = value;
}
if (!/^\d+\.\d+\.\d+$/.test(options.version ?? '')) throw Error('--version requires a three-part version, e.g. 0.3.4');
if (options.select && !/^[\w.-]+$/.test(options.select)) throw Error('Unsafe release ID');
if (options['accept-reviewed'] && (!options.reviewer || !options.note)) throw Error('--accept-reviewed requires --reviewer and --note describing the actual comparison');
const dry = options['dry-run'] === 'true';
const json = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));
const yaml = (path: string): any => parse(readFileSync(path, 'utf8'));
const raw = (path: string) => readFileSync(path, 'utf8');
const write = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
function git(argv: string[], binary = false): any {
  const result = spawnSync('git', argv, { maxBuffer: 64 * 1024 * 1024, ...(binary ? {} : { encoding: 'utf8' }) });
  if (result.status !== 0) throw Error('git ' + argv[0] + ': ' + String(result.stderr));
  return result.stdout;
}
const head = git(['rev-parse','HEAD']).trim();
const old: AdmissionRecord = JSON.parse(git(['show', `${head}:config/research-source.json`]));
const previousVersion = /\bv([\d.]+)/.exec(old.edition)?.[1];
if (!previousVersion) throw Error('Committed edition has no version');
const date = new Date().toISOString().slice(0, 10);
// A stable dated path permits explicit review/resume on a later day.
const runFolders = existsSync('docs/evidence') ? readdirSync('docs/evidence', { withFileTypes: true }).filter(p => p.isDirectory() && new RegExp(`^edition-\\d{4}-\\d{2}-\\d{2}-v${options.version.replaceAll('.', '\\.')}$`).test(p.name) && existsSync('docs/evidence/' + p.name + '/run.json')).map(p => p.name + '/run.json') : [];
if (runFolders.length > 1) throw Error('Multiple edition runs exist for this version');
const ev = runFolders.length ? 'docs/evidence/' + runFolders[0].replace(/\/run.json$/, '') : `docs/evidence/edition-${date}-v${options.version}`;
const statePath = ev + '/run.json';
let state: State;
let baseline: Corpus | undefined;
const changes = new Map<string, string>();
const sourceDir = old.directory;
const splitLines = (value: string) => value.match(/[^\n]*\n|[^\n]+$/g) ?? [];

// Gather only load-bearing evidence from the committed registries; do not copy
// browser captures, outputs or unrelated historical campaigns into each edition.
export function committedPredecessorPaths(): string[] {
  const tracked: string[] = git(['ls-tree','-r','--name-only',head]).trim().split('\n');
  const selected = new Set(tracked.filter(p => /^(research|config|src|scripts)\//.test(p) || ['astro.config.mjs','package.json','package-lock.json','tsconfig.json'].includes(p)));
  function references(value: any) {
    if (typeof value === 'string' && value.startsWith('docs/evidence/') && tracked.includes(value)) selected.add(value);
    else if (Array.isArray(value)) value.forEach(references);
    else if (value && typeof value === 'object') Object.values(value).forEach(references);
  }
  for (const path of [...selected].filter(p => /^(research\/publication|config)\//.test(p) && /\.(json|yaml)$/.test(p))) references(parse(git(['show', `${head}:${path}`])));
  return [...selected].sort();
}

function preserve() {
  if (existsSync(state.prior) || existsSync(state.snapshot)) throw Error('Predecessor destination already exists; refusing to overwrite it');
  const paths = committedPredecessorPaths();
  const archive = git(['archive', head, '--', ...paths], true);
  mkdirSync(state.prior, { recursive: true });
  const unpack = spawnSync('tar', ['-xf','-','-C',state.prior], { input: archive });
  if (unpack.status !== 0) throw Error('Cannot extract committed predecessor: ' + unpack.stderr);
  const identities = old.files.map(f => {
    const bytes = readFileSync(join(state.prior, sourceDir, f.path));
    if (bytes.length !== f.bytes || sha256(bytes) !== f.sha256) throw Error('Committed source pin mismatch: ' + f.path);
    const path = join(state.snapshot, f.path); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes);
    return { path, sha256: sha256(bytes), bytes: bytes.length };
  });
  write(ev + '/preservation.json', { head, predecessorEdition: old.edition, predecessorSeal: old.inventorySeal, sourceFiles: identities, predecessorPaths: paths });
  baseline = loadCanonicalCorpus(resolve(state.prior));
}

function documentHeader(text: string): string {
  const lines = splitLines(text);
  if (lines[0]?.startsWith('# ')) lines[0] = /\bv\d+(?:\.\d+)+/.test(lines[0]) ? lines[0].replace(/\bv\d+(?:\.\d+)+/, 'v' + state.version) : lines[0].replace(/\r?\n$/, '') + ` — RRG v${state.version}\n`;
  // Only the opening dated edition line, never a dated audit in the body.
  const index = lines.slice(1, 6).findIndex(l => /^\*\*[^\n]+edition\s*·/i.test(l));
  if (index >= 0) lines[index + 1] = `**${state.label} edition · ${state.date} · Vasyl Hryha**\n`;
  return lines.join('');
}
function replaceRequired(text: string, pattern: RegExp, replacement: string, path: string): string {
  if (!pattern.test(text)) throw Error('Missing expected edition field in ' + path);
  return text.replace(pattern, () => replacement);
}
function planSources() {
  const actual = filesIn(sourceDir);
  if (stableJSON(actual) !== stableJSON(old.files.map(f => f.path).sort())) throw Error('Source membership changed; register additions/removals through the existing explicit source-intake procedure');
  const edited = old.files.filter(f => sha256(readFileSync(join(sourceDir, f.path))) !== f.sha256).map(f => f.path);
  if (edited.includes(old.corePath)) throw Error('Core edits require the existing seven-part proof gate; this wording-edition command cannot register them');
  state.realSources = edited.map(p => sourceDir + '/' + p);
  const changeId = `RRG-${state.date}-V${state.version.replaceAll('.', '')}-${state.label.toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
  const record = `## v${state.version} — ${state.date}: ${state.label}\n\n**changeId:** \`${changeId}\`\n**category:** wording; source changes require explicit fidelity review.\n**Prior edition/hash:** ${old.edition}; inventory seal \`${old.inventorySeal}\`.\n**Preserved edition:** \`${state.snapshot}/\`; loadable predecessor: \`${state.prior}/\`.\n**Affected author-edited files (HEAD diff):** ${edited.join(', ') || 'none (metadata-only edition)'}. Exact generated membership and derivative IDs are in \`${state.changePath}\`.\n**Problem:** ${state.label}.\n**Before/after meaning:** prior committed text → author-edited text; this skeleton does not assert semantic equivalence or scientific support.\n**Rationale/support:** ${state.approval}; no new evidence audit is asserted.\n**Permission basis:** ${state.approval}. No commit, push, deployment or licence grant.\n**Dependents/checks:** machine transaction and \`${ev}/receipt.md\`; content decisions remain pending until explicitly reviewed.\n\n`;
  const put = (p: string, text: string) => changes.set(join(sourceDir, p), text);
  for (const p of edited.filter(p => p.endsWith('.md') && !['CHANGELOG.md','CURRENT_MANIFEST.md','SOURCE_AUTHORITY.md','README.md'].includes(p))) put(p, documentHeader(raw(join(sourceDir, p))));
  put('CHANGELOG.md', replaceRequired(raw(sourceDir + '/CHANGELOG.md'), /^# Changelog\r?\n\r?\n/, '# Changelog\n\n' + record, 'CHANGELOG.md'));
  const provenance = `\n**Edition registration begins.**\n## Current edition registration\n\n${state.edition}. Authorization reference: ${state.approval}.\nThe exact predecessor is \`${state.snapshot}/\` (seal \`${old.inventorySeal}\`).\nCHANGELOG change \`${changeId}\` and \`${state.changePath}\` record this revision.\nPrior revision descriptions below/elsewhere retain their historical scope; they are not new evidence or approval.\nActual checks and outstanding reviews: \`${ev}/receipt.md\`.\n**Edition registration ends.**\n`;
  const clearBlock = (text: string) => text.replace(/\n\*\*Edition registration begins\.\*\*[\s\S]*?\*\*Edition registration ends\.\*\*\n/g, '');
  let manifest = clearBlock(raw(sourceDir + '/CURRENT_MANIFEST.md'));
  manifest = replaceRequired(manifest, /^\*\*Active version:\*\* .*$/m, '**Active version:** ' + state.edition, 'CURRENT_MANIFEST.md');
  manifest = replaceRequired(manifest, /^\*\*Prior edition:\*\* .*$/m, '**Prior edition:** ' + old.edition, 'CURRENT_MANIFEST.md');
  // Retain historical explanatory descriptions and all active membership lines.
  put('CURRENT_MANIFEST.md', manifest + provenance);
  let authority = clearBlock(raw(sourceDir + '/SOURCE_AUTHORITY.md'));
  authority = replaceRequired(authority, /^\*\*Current repository edition:\*\* .*$/m, '**Current repository edition:** ' + state.edition, 'SOURCE_AUTHORITY.md');
  authority = replaceRequired(authority, /^\*\*Predecessor:\*\* .*$/m, `**Predecessor:** ${old.edition}; seal \`${old.inventorySeal}\`.`, 'SOURCE_AUTHORITY.md');
  // Put the current registration before retained descriptions of prior revisions.
  authority = authority.replace(/\n(?:## Retained prior revision description\n\n)?\n?This is an explicitly directed source revision\./, provenance + '\n## Retained prior revision description\n\nThis is an explicitly directed source revision.');
  if (!authority.includes('**Edition registration begins.**')) authority += provenance;
  put('SOURCE_AUTHORITY.md', authority);
  const readme = replaceRequired(clearBlock(raw(sourceDir + '/README.md')), /^\*\*RRG v[^\n]+\*\*$/m, '**' + state.edition + '**', 'README.md');
  put('README.md', readme + provenance);
  const sources = json(sourceDir + '/sources.json'); sources.version = state.version; put('sources.json', JSON.stringify(sources, null, 2) + '\n');
  state.sourceFiles = old.files.map(f => { const path = join(sourceDir, f.path), text = changes.get(path), bytes = text === undefined ? readFileSync(path) : Buffer.from(text); return { ...f, bytes: bytes.length, sha256: sha256(bytes) }; });
  return { changeId, edited };
}

function register(changeId: string) {
  const record: any = structuredClone(old);
  record.edition = state.edition; record.files = state.sourceFiles;
  record.inventorySeal = sha256(stableJSON(record.files));
  record.manifestSha256 = record.files.find((f: Row) => f.path === record.manifestPath).sha256;
  const changed = new Set(record.files.filter((f: Row) => f.sha256 !== old.files.find(o => o.path === f.path)!.sha256).map((f: Row) => sourceDir + '/' + f.path));
  const sources: Row[] = yaml('research/publication/source-index.yaml');
  const previousSources = structuredClone(sources);
  for (const s of sources.filter(s => s.path.startsWith(sourceDir + '/'))) {
    s.sha256 = record.files.find((f: Row) => s.path === sourceDir + '/' + f.path).sha256;
    s.edition = state.edition; s.date = state.date;
    s.inspectionScope = `Byte registration for ${state.edition}; prior audits retain their dates; fidelity recorded separately.`;
  }
  for (const f of old.files) {
    const s = previousSources.find(s => s.path === sourceDir + '/' + f.path);
    if (!s) throw Error('Missing registered source: ' + f.path);
    sources.push({ ...s, key: `R-HISTORY-V${previousVersion!.replaceAll('.', '')}-${s.key.replace(/^R-CURRENT-/, '')}`, path: state.snapshot + '/' + f.path, sha256: f.sha256, edition: old.edition, role: 'history_only', declaredCurrent: false, inspectionScope: 'Byte-exact committed predecessor; no renewed approval.' });
  }
  function binding(b: Row) {
    const s = sources.find(s => s.key === b.sourceKey)!;
    if (!changed.has(s.path)) return b;
    const before = splitLines(raw(join(state.prior, s.path))), after = splitLines(changes.get(s.path) ?? raw(s.path));
    let start = b.startLine, end = b.endLine;
    if (start === 3 && end === before.length) end = after.length;
    else {
      const excerpt = before.slice(start - 1, end).join(''), text = after.join(''), index = text.indexOf(excerpt);
      if (index < 0 || text.indexOf(excerpt, index + 1) >= 0) throw Error(`Changed/ambiguous partial excerpt in ${s.path}:${start}; update that binding explicitly before using automation`);
      start = splitLines(text.slice(0, index)).length + 1; end = start + b.endLine - b.startLine;
    }
    return { ...b, sourceSha256: s.sha256, startLine: start, endLine: end, excerptSha256: sha256(after.slice(start - 1, end).join('')) };
  }
  const advanced: string[] = [];
  const bindings: Row[] = [];
  function entry(e: Row) {
    if (['archived','superseded','withdrawn'].includes(e.publicationState)) return;
    e.researchEdition = state.edition;
    if (e.sourceRefs.some((k: string) => changed.has(sources.find(s => s.key === k)!.path))) { e.revision++; e.updatedAt = state.date; advanced.push(e.id); }
    if (e.sourceBinding) {
      e.sourceBinding = binding(e.sourceBinding);
      const s = sources.find(s => s.key === e.sourceBinding.sourceKey)!;
      if (s.path.startsWith(sourceDir + '/')) { const { sourceKey, ...rest } = e.sourceBinding; bindings.push({ ...rest, path: s.path.slice(sourceDir.length + 1) }); }
    }
  }
  // Plan every sidecar before writing any of them, so ambiguous excerpts stop
  // without partially overwriting registration files.
  const writes = new Map<string, unknown>();
  for (const name of ['records','canonical-documents']) { const path = `research/publication/${name}.yaml`, rows: Row[] = yaml(path); rows.forEach(entry); writes.set(path, rows); }
  for (const name of filesIn('research/publication/pages').filter(p => p.endsWith('.md'))) {
    const path = 'research/publication/pages/' + name, text = raw(path), match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text)!;
    const e: Row = parse(match[1]); entry(e);
    writes.set(path, '---\n' + JSON.stringify(e, null, 2) + '\n---\n' + match[2]);
  }
  record.bindings = bindings; record.priorCoreSha256 = old.coreSha256;
  record.sourceReference = `${state.edition}; author revision reference: ${state.approval}; exact committed predecessor ${head}`;
  record.revision = { category: 'wording', predecessor: old.edition + '; seal ' + old.inventorySeal, problem: state.label, before: 'Committed predecessor text and metadata.', after: 'Author-edited text and registered edition metadata; real content changes await fidelity review.', rationale: `Edition registration under R4 sections 0.3/4.5; authorization reference: ${state.approval}.`, permissionBasis: state.approval, dependentReviewHashes: [] };
  record.inspection = { outcome: 'accepted', inspectedFiles: record.files.map((f: Row) => f.path), evidenceRef: ev + '/receipt.md' }; record.contentReview = 'pending';
  writes.set('config/research-source.json', record);
  writes.set('research/publication/source-index.yaml', sources);
  const history = json('research/source-manifest.json'); history.files.push(...old.files.map(f => ({ ...f, path: state.snapshot.slice('research/'.length) + '/' + f.path, role: 'history_only' }))); writes.set('research/source-manifest.json', history);
  const links = json('research/publication/source-link-map.json');
  for (const link of [...links.labels, ...links.caseEdges]) if (sources.find(s => s.key === link.sourceKey)?.path.startsWith(sourceDir + '/')) link.edition = state.edition;
  writes.set('research/publication/source-link-map.json', links);
  const revision = { changeId, category: 'wording', predecessorEdition: old.edition, predecessorSeal: old.inventorySeal, sourceChangeRef: sourceDir + '/CHANGELOG.md', affectedFiles: [...changed].sort(), affectedClaimIds: advanced.sort(), ...Object.fromEntries(['problem','before','after','rationale','permissionBasis'].map(k => [k, record.revision[k]])), resultEdition: state.edition, resultSeal: record.inventorySeal, priorSnapshot: old.files.filter(f => changed.has(sourceDir + '/' + f.path)).map(f => ({ path: sourceDir + '/' + f.path, sha256: f.sha256 })) };
  writes.set(state.changePath, revision);
  for (const [path, value] of changes) write(path, value);
  for (const [path, value] of writes) write(path, value);
  state.registrationPins = Object.fromEntries([...writes.keys()].map(path => [path, sha256(readFileSync(path))]));
  state.phase = 'registered'; write(statePath, state);
}

function runCheck(name: string, argv: string[]) {
  const result = spawnSync(process.execPath, ['--import','tsx', ...argv], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', UNITY_EVIDENCE_DIR: ev + '/checks' } });
  write(`${ev}/${name}.log`, result.stdout + result.stderr);
  state.checks.push({ name, argv, exitCode: result.status, at: new Date().toISOString() }); write(statePath, state);
  if (result.status !== 0) throw Error(`${name} failed; see ${ev}/${name}.log`);
  console.log('PASS ' + name);
}
const commandSourceCheck = () => runCheck('source-revision', ['scripts/check-source-revision.ts','--prior-root',state.prior,'--change',state.changePath,'--evidence-dir',ev + '/checks']);

function reviews(acceptIds: string[] = []) {
  baseline ??= loadCanonicalCorpus(resolve(state.prior));
  const corpus = loadCanonicalCorpus();
  const registry: Row[] = yaml('research/publication/website-reviews.yaml');
  const current = [...corpus.entries.values()].filter(e => !['archived','superseded','withdrawn'].includes(e.publicationState));
  for (const id of acceptIds) if (!current.some(e => e.id === id)) throw Error('Unknown current reading: ' + id);
  const contentSources = new Set(state.realSources);
  // Decisions may reuse content only if the renderer, references, aliases and
  // execution evidence are unchanged. Source and entry deltas are checked below.
  const commonUnchanged = baseline.rendererSha256 === corpus.rendererSha256 && stableJSON([...baseline.references]) === stableJSON([...corpus.references]) && stableJSON([...baseline.aliases]) === stableJSON([...corpus.aliases]) && stableJSON([...baseline.evidence]) === stableJSON([...corpus.evidence]);
  const pending: string[] = [], summaries: Row[] = [], decisions: { path: string; decision: Row; row: Row }[] = [];
  function ownMetadataOnly(id: string) {
    const prior = baseline!.entries.get(id), next = corpus.entries.get(id);
    if (!prior || !next) return false;
    const strip = (e: Row) => Object.fromEntries(Object.entries(e).filter(([k]) => !['researchEdition','revision','updatedAt','sourceBinding','statement'].includes(k)));
    if (stableJSON(strip(prior)) !== stableJSON(strip(next))) return false;
    if (prior.contentOrigin !== 'source-bound') return prior.statement === next.statement;
    const b = next.sourceBinding!, s = corpus.sources.get(b.sourceKey)!;
    if (contentSources.has(s.path)) return false;
    // Bound statements can differ only through this command's generated edits.
    return prior.sourceBinding?.sourceKey === b.sourceKey;
  }
  for (const entry of current) {
    const inputs = websiteReviewInputs(corpus, entry.id), row = registry.find(r => r.entryId === entry.id);
    if (websiteReviewState(corpus, entry.id) === 'accepted') { summaries.push({ entryId: entry.id, mode: 'unchanged-accepted', evidenceRef: row!.evidenceRef }); continue; }
    const previousRow = baseline.websiteReviews.find(r => r.entryId === entry.id);
    const relevantIds = [entry.id, ...inputs.dependencies.map(d => d.entryId)];
    const changedSources = inputs.sourceReads.filter(s => contentSources.has(s.path)).map(s => s.path);
    const reuse = !!previousRow && websiteReviewState(baseline, entry.id) === 'accepted' && commonUnchanged && changedSources.length === 0 && relevantIds.every(ownMetadataOnly) && stableJSON(inputs.dependencies.map(d => d.entryId)) === stableJSON(websiteReviewInputs(baseline, entry.id).dependencies.map(d => d.entryId));
    const explicit = acceptIds.includes(entry.id);
    const outcome = reuse || explicit ? 'accepted' : 'pending';
    if (outcome === 'pending') pending.push(entry.id);
    // A current pending request need not be rewritten on an unchanged resume.
    if (row?.fingerprint === inputs.fingerprint && row.outcome === outcome && !explicit) continue;
    const priorRef = previousRow ? `${state.prior}/${previousRow.evidenceRef}` : null;
    const reason = explicit ? `Explicit reviewed-content decision by ${options.reviewer}: ${options.note}.` : reuse ? `Automatic metadata-only delta; reused prior comparisons from ${priorRef}, SHA-256 ${previousRow!.evidenceSha256}. Edition, revision and generated provenance changed; content, relevant dependency content, bibliography, renderer and execution evidence did not.` : `Actual content/source/dependency delta or unavailable prior acceptance; awaiting reading. Changed content sources: ${changedSources.join(', ') || 'see detached own/dependency inputs'}.`;
    const checks = outcome === 'accepted' ? Object.fromEntries(fidelityChecks.map(k => [k, explicit ? `${k}: ${reason}` : `${k}: ${reason} Prior comparison: ${json(priorRef!).checks[k]}`])) : {};
    const reviewedAt = new Date().toISOString();
    const decision = { schema: 'unity-website-fidelity-decision/1', purpose: 'website-source-fidelity/1', entryId: entry.id, fingerprint: inputs.fingerprint, reviewerKind: 'agent', reviewedAt, outcome, scientificCertification: false, rationale: reason, inputs, checks };
    const path = `${ev}/decisions/${entry.id}-${inputs.fingerprint}-${outcome}.json`;
    if (existsSync(path)) throw Error('Refusing to overwrite issued decision: ' + path);
    const nextRow = { purpose: decision.purpose, entryId: entry.id, fingerprint: inputs.fingerprint, reviewerKind: decision.reviewerKind, reviewedAt, outcome, evidenceRef: path, evidenceSha256: sha256(JSON.stringify(decision, null, 2) + '\n') };
    decisions.push({ path, decision, row: nextRow });
    summaries.push({ entryId: entry.id, mode: explicit ? 'explicit-reviewed' : reuse ? 'metadata-only-reuse' : 'pending-content', changedSources, priorEvidenceRef: priorRef, evidenceRef: path });
  }
  for (const { path, decision, row } of decisions) { write(path, decision); const index = registry.findIndex(r => r.entryId === row.entryId); if (index < 0) registry.push(row); else registry[index] = row; }
  write('research/publication/website-reviews.yaml', registry);
  validateWebsiteReviews(loadCanonicalCorpus());
  write(`${ev}/comparisons-${new Date().toISOString().replace(/[:.]/g,'-')}.json`, { scientificCertification: false, readings: summaries, pending });
  write(ev + '/pending.json', { entryIds: pending.sort(), note: 'Read actual current source, own reading, dependency and rendered changes before --accept-reviewed. This list grants no approval.' });
  state.phase = 'pending'; write(statePath, state);
  return pending;
}

function forceAddPaths() {
  const paths = new Set<string>();
  const walk = (value: any) => {
    if (typeof value === 'string' && value.startsWith('docs/evidence/') && existsSync(value)) paths.add(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  for (const p of ['research/publication/website-reviews.yaml','research/publication/release.json','config/research-source.json','research/publication/references.yaml','research/publication/execution-evidence.yaml']) walk(yaml(p));
  // Preserve the exact predecessor and issued run decisions required for resume
  // and source-revision validation. Exclude disposable logs/build products.
  for (const p of filesIn(state.prior)) paths.add(state.prior + '/' + p);
  for (const p of filesIn(ev).filter(p => !p.endsWith('.log') && !p.startsWith('checks/') && !p.startsWith('predecessor-root/'))) paths.add(ev + '/' + p);
  const result = spawnSync('git', ['check-ignore','--stdin'], { input: [...paths].sort().join('\n') + '\n', encoding: 'utf8' });
  if (![0,1].includes(result.status!)) throw Error(result.stderr);
  const ignored = result.stdout.trim().split('\n').filter(Boolean).sort();
  write(ev + '/required-force-add-paths.txt', ignored.join('\n') + '\n');
  const quote = (p: string) => "'" + p.replaceAll("'", "'\\''") + "'";
  const command = ignored.length ? 'git add -f -- ' + ignored.map(quote).join(' ') : '# No ignored evidence needs force-adding';
  write(ev + '/git-add-evidence.sh', command + '\n');
  console.log(`Exact evidence list: ${ev}/required-force-add-paths.txt\n${command}`);
}
function receipt(status: string, pending: string[] = []) {
  write(ev + '/receipt.md', `# ${state.edition} — ${status}\n\nCommitted predecessor \`${head}\` preserved byte-exact at \`${state.snapshot}/\`; loadable root \`${state.prior}/\`. Source transaction: \`${state.changePath}\`.\n\nMetadata-only decisions reuse prior individual comparisons; actual content changes require explicit reviewed IDs. Pending readings: ${pending.join(', ') || 'none'}. No scientific certification or engineering acceptance.\n\nActual checks: ${state.checks.map(c => `${c.name} exit ${c.exitCode}`).join('; ') || 'none yet'}. ${state.select ? `Requested selection: ${state.select}.` : 'Previous release selection retained.'}\n\nNo commit, push, deployment or licence grant. Next: ${pending.length ? 'read pending material and resume with --accept-reviewed, --reviewer and --note' : 'one separate bounded High acceptance'}.\n`);
}

try {
  if (existsSync(statePath)) {
    state = json(statePath);
    if (state.head !== head) throw Error('HEAD changed since preparation; preserve this run and start a new edition');
    if ((options.label && options.label !== state.label) || (options.approval && options.approval !== state.approval)) throw Error('Resume arguments differ from the preserved edition');
    if (state.phase === 'prepared') throw Error('Preparation interrupted; inspect preserved evidence before recovery');
    for (const f of state.sourceFiles) if (sha256(readFileSync(join(sourceDir, f.path))) !== f.sha256) throw Error('Source changed after registration: ' + f.path + '; do not approve a stale run');
    for (const [path, digest] of Object.entries(state.registrationPins ?? {})) if (sha256(readFileSync(path)) !== digest) throw Error('Registered sidecar changed after preparation: ' + path + '; read/register the changed material before resuming');
    if (options.select) state.select = options.select;
    if (dry) { console.log(JSON.stringify({ dryRun: true, writes: 0, run: ev, phase: state.phase, pending: existsSync(ev + '/pending.json') ? json(ev + '/pending.json').entryIds : [], acceptReviewed: options['accept-reviewed']?.split(',') ?? [], select: state.select ?? null, checks: 'source-revision + fidelity + Astro diagnostics + ONE target build/output audit' }, null, 2)); process.exit(0); }
  } else {
    if (!options.label || !options.approval) throw Error('New edition requires --label and --approval');
    if (options['accept-reviewed']) throw Error('Prepare first, read the printed pending list, then resume with --accept-reviewed');
    const versionParts = (v: string) => v.split('.').map(Number);
    const [a,b] = [versionParts(options.version), versionParts(previousVersion)];
    const different = a.findIndex((v,i) => v !== (b[i] ?? 0));
    if (different < 0 || a[different] <= (b[different] ?? 0)) throw Error('New version must advance the committed edition');
    state = { schema: 'rrg-edition-run/1', version: options.version, edition: `RRG v${options.version} — ${options.label}, ${date}`, date, label: options.label, approval: options.approval, head, prior: ev + '/predecessor-root', snapshot: `research/history/repository-current-v${previousVersion}-${date}`, changePath: `research/publication/source-revision-v${options.version}.json`, realSources: [], sourceFiles: [], phase: 'prepared', select: options.select, checks: [] };
    if (existsSync(state.snapshot) || existsSync(state.changePath)) throw Error('Snapshot/transaction destination exists; refusing to overwrite history');
    // Managed sidecars must start from HEAD; preserve unrelated edits elsewhere.
    for (const p of ['config/research-source.json','research/source-manifest.json',...git(['ls-tree','-r','--name-only',head,'research/publication']).trim().split('\n')]) if (!readFileSync(p).equals(git(['show', `${head}:${p}`], true))) throw Error('Uncommitted managed sidecar: ' + p);
    const plan = planSources();
    if (dry) {
      const reviews: Row[] = parse(git(['show', `${head}:research/publication/website-reviews.yaml`]));
      const expectedPending = reviews.filter(r => { const decision = json(r.evidenceRef); return state.realSources.some(p => decision.inputs.sourceReads.some((s: Row) => s.path === p)); }).map(r => r.entryId);
      console.log(JSON.stringify({ dryRun: true, writes: 0, predecessor: head, edition: state.edition, snapshot: state.snapshot, predecessorRoot: state.prior, authorEditedFiles: plan.edited, generatedSourceWrites: [...changes.keys()], transaction: state.changePath, sidecars: 'config, source/history/link registries, current page edition/revision/bindings, fidelity requests and metadata-only decisions', expectedContentReview: expectedPending, select: state.select ?? null, evidence: ev, checks: 'source-revision + fidelity + Astro diagnostics + ONE target build/output audit' }, null, 2)); process.exit(0);
    }
    preserve(); write(statePath, state);
    register(plan.changeId);
  }
  const ids = options['accept-reviewed']?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  if (state!.phase === 'checked' && !ids.length && !options.select) { console.log('Already REVIEW_READY: ' + ev + '/receipt.md'); process.exit(0); }
  if (!state!.checks.some(c => c.name === 'source-revision' && c.exitCode === 0)) commandSourceCheck();
  const pending = reviews(ids);
  if (pending.length) {
    receipt('AWAITING_CONTENT_REVIEW', pending); forceAddPaths();
    console.log(`STOP: read these ${pending.length} readings before acceptance:\n${pending.join(',')}\nResume: npm run edition -- --version ${state!.version} --accept-reviewed '<read IDs, comma-separated>' --reviewer '<actual reviewer>' --note '<actual comparison>'`);
    process.exitCode = 2;
  } else {
    if (state!.select) {
      const previous = json('research/publication/release.json');
      const corpus = loadCanonicalCorpus();
      const release = { ...previous, releaseId: state!.select, releaseAt: new Date().toISOString() };
      // Keep existing entry-specific rights unchanged; a new reading cannot
      // acquire rights by being swept into an expanded blanket grant.
      selectPublication(corpus, loadSiteConfig('config/site.json'), release, 'qualification');
      const selectionEvidence = ev + '/release-selection.json';
      if (!existsSync(selectionEvidence)) write(ev + '/previous-release.json', previous);
      write('research/publication/release.json', release); write(selectionEvidence, { release, previousSelection: ev + '/previous-release.json', deployEligible: false });
    }
    runCheck('fidelity', ['scripts/check-content.ts','--evidence-dir',ev + '/checks']);
    runCheck('diagnostics', ['node_modules/astro/bin/astro.mjs','check']);
    const output = `dist/edition-v${state!.version}-target`, mode = state!.select ? 'qualification' : 'preview';
    runCheck('target-build', ['scripts/build.ts','--mode',mode,'--config','config/site.json','--output',output]);
    runCheck('target-output-audit', ['scripts/audit-output.ts','--dir',output]);
    state!.phase = 'checked'; write(statePath, state!); receipt('REVIEW_READY'); forceAddPaths();
    console.log('REVIEW_READY: ' + ev + '/receipt.md');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
