import { loadCanonicalCorpus } from '../src/lib/content.js';
import { readFileSync } from 'node:fs';
import { args } from './args.js';
import { qualifyCurrentSource, readAdmission, verifyIdentities } from '../src/lib/source-admission.js';
const options = args(['scope']);
if (options.scope === 'history') {
  const manifest = JSON.parse(readFileSync('research/source-manifest.json', 'utf8'));
  verifyIdentities('research', manifest.files, 'HISTORICAL_INTEGRITY_FAILURE');
  console.log(JSON.stringify({ status: 'PASS', historicalFiles: 14, noticeTranscriptions: 2, authorityNoticeOnly: true }));
} else if (options.scope === 'current') {
  const corpus=loadCanonicalCorpus();
  console.log(JSON.stringify({...qualifyCurrentSource(readAdmission()), sourceBoundEntries:[...corpus.entries.values()].filter(e=>e.contentOrigin==='source-bound').length, contentReview:'pending'}));
} else throw new Error('Use --scope history or --scope current');
