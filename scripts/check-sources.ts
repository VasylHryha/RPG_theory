import { loadCanonicalCorpus } from '../src/lib/content.js';
import { readFileSync } from 'node:fs';
import { args } from './args.js';
import { verifyIdentities } from '../src/lib/source-admission.js';
const options = args(['scope']);
if (options.scope === 'history') {
  const manifest = JSON.parse(readFileSync('research/source-manifest.json', 'utf8'));
  verifyIdentities('research', manifest.files, 'HISTORICAL_INTEGRITY_FAILURE');
  console.log(JSON.stringify({ status: 'PASS', historicalFiles: manifest.files.filter((file: { role: string }) => file.role === 'history_only').length, noticeTranscriptions: manifest.files.filter((file: { role: string }) => file.role === 'authority-notice-only').length, authorityNoticeOnly: true }));
} else if (options.scope === 'current') {
  const corpus=loadCanonicalCorpus();
  console.log(JSON.stringify({...corpus.admission, sourceBoundEntries:[...corpus.entries.values()].filter(e=>e.contentOrigin==='source-bound').length, websiteFidelity:corpus.admission.currentSourceQualified?'accepted':'pending',scientificCertification:'out-of-scope'}));
} else throw new Error('Use --scope history or --scope current');
