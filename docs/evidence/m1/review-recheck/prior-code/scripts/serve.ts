import { args } from './args.js';
import { serveOutput } from './static-server.js';
const options = args(['output', 'port']);
const port = Number(options.port ?? '4321');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const { origin, base } = await serveOutput(options.output ?? 'dist/preview-root', port);
console.log(`Serving static output at ${origin}${base}`);
