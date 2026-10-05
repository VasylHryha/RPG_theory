import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { normalizeBase, safePath } from '../src/lib/urls.js';

const types: Record<string, string> = { '.wasm':'application/wasm', '.pagefind':'application/octet-stream', '.pf_fragment':'application/octet-stream', '.pf_index':'application/octet-stream', '.zip':'application/zip', '.md':'text/markdown; charset=utf-8', '.xml':'application/rss+xml; charset=utf-8', '.cff':'text/plain; charset=utf-8', '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
export async function serveOutput(output: string, port = 0) {
  const root = resolve(output);
  const info = JSON.parse(readFileSync(join(root, 'build-info.json'), 'utf8'));
  const base = normalizeBase(info.config.basePath);
  const server = createServer((request, response) => {
    let path: string;
    try { path = safePath((request.url ?? '/').split('?')[0]); } catch { response.writeHead(400); response.end('Bad path'); return; }
    if (base !== '/' && path === base.slice(0, -1)) { response.writeHead(301, { Location: base }); response.end(); return; }
    let target: string | null = null;
    if (path.startsWith(base)) {
      const route = decodeURIComponent(path.slice(base.length));
      let candidate = join(root, route);
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        if (!path.endsWith('/')) { response.writeHead(301, { Location: path + '/' }); response.end(); return; }
        candidate = join(candidate, 'index.html');
      }
      if (existsSync(candidate) && statSync(candidate).isFile()) target = candidate;
    }
    const status = target ? 200 : 404;
    target ??= join(root, '404.html');
    response.writeHead(status, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(readFileSync(target));
  });
  await new Promise<void>(ready => server.listen(port, '127.0.0.1', ready));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No server address');
  return { server, origin: `http://127.0.0.1:${address.port}`, base, info };
}
