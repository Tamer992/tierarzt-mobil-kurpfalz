// Kleiner Vorschau-Server: liefert site/ aus, /recherche/ zeigt die Phase-0-Übersicht. Sendet die Kopfzeilen aus kopfzeilen.json (strenge CSP, noindex).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const wurzel = fileURLToPath(new URL('..', import.meta.url));
const kopf = JSON.parse(await readFile(join(wurzel, 'server/kopfzeilen.json'), 'utf8'));
const port = Number(process.argv[2] || 4391);
const typen = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif', '.woff2':'font/woff2', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8' };
http.createServer(async (req, res) => {
  let pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let basis = join(wurzel, 'site');
  if (pfad.startsWith('/recherche/')) { basis = join(wurzel, 'recherche'); pfad = pfad.slice('/recherche'.length); }
  let datei = normalize(join(basis, pfad));
  if (!datei.startsWith(basis)) { res.writeHead(403); return res.end(); }
  try { if ((await stat(datei)).isDirectory()) datei = join(datei, 'index.html'); const inhalt = await readFile(datei);
    const h = { ...kopf, 'Content-Type': typen[extname(datei)] || 'application/octet-stream', 'Cache-Control': 'no-store' };
    if (basis.endsWith('recherche')) delete h['Content-Security-Policy']; // Übersicht hat Inline-CSS, gehört nicht zur Seite
    res.writeHead(200, h); res.end(inhalt);
  } catch { res.writeHead(404, { ...kopf, 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Nicht gefunden'); }
}).listen(port, '0.0.0.0', () => console.log('Vorschau auf Port', port));
