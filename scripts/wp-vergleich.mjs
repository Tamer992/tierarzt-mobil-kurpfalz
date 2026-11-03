// Vergleicht Original (Port 4392, site/) und WordPress-Test (Port 8085) als Screenshots; Aufruf: node scripts/wp-vergleich.mjs
import { chromium } from 'playwright';
const b = await chromium.launch();
const seiten = ['', 'leistungen/', 'leistungen/akutversorgung/', 'termin/', 'ratgeber/', 'ratgeber/giftig-fuer-hunde/', 'abschied/'];
for (const [i, pfad] of seiten.entries()) for (const [n, w, h] of [['d', 1440, 900], ['m', 390, 800]]) for (const [q, url] of [['o', `http://127.0.0.1:4392/abend/${pfad}`], ['w', `http://127.0.0.1:8085/${pfad}`]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const bad = []; p.on('response', (r) => r.status() >= 400 && bad.push(r.status() + ' ' + r.url())); p.on('pageerror', (e) => bad.push('JS ' + e.message));
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.goto(url); await p.waitForTimeout(1500);
  await p.screenshot({ path: `/tmp/v-${i}-${n}-${q}.png`, fullPage: true });
  if (bad.length) console.log(pfad || 'start', n, q, bad.slice(0, 4));
  await p.close();
}
await b.close();
