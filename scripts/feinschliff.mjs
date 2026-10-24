// Phase 4: alle Seiten in zehn Breiten von 320 bis 1920 px.
// Prüft seitliches Scrollen, getrennte Wörter, umbrochene Nummern, Konsole/CSP und CLS.
import { chromium } from 'playwright';
const [,, basis = 'http://127.0.0.1:4391', ...pfade] = process.argv;
const breiten = [320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920];
const b = await chromium.launch();
let probleme = 0;

for (const p of pfade) for (const w of breiten) {
  const handy = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: handy ? 800 : 900 }, isMobile: handy, hasTouch: handy });
  await ctx.addInitScript(() => {
    window.__cls = 0; window.__csp = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI));
  });
  const s = await ctx.newPage(); const fehler = [];
  s.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') fehler.push(m.text()); });
  s.on('pageerror', (e) => fehler.push('JS ' + e.message));
  s.on('requestfailed', (r) => fehler.push('LADEN ' + r.url()));
  await s.goto(basis + p, { waitUntil: 'networkidle' });
  const h = await s.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await s.evaluate((y) => scrollTo(0, y), y); await s.waitForTimeout(60); }
  await s.waitForTimeout(1000);
  const r = await s.evaluate(() => {
    const zeilen = (rects) => new Set([...rects].filter((q) => q.width > 0).map((q) => Math.round(q.top))).size;
    const woerter = [], nummern = [];
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nummer = /(?:\+49|\b0)\d[\d  \/-]{5,}\d|\b\d{1,2}(?:[:.]\d{2})?\s?[–-]\s?\d{1,2}(?:[:.]\d{2})?\s?Uhr|\b\d{5}\b/g;
    for (let n; (n = tw.nextNode());) {
      const el = n.parentElement; if (!el || !el.getClientRects().length) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      const t = n.textContent;
      // Wörter: an Leerzeichen trennen, danach an vorhandenen Bindestrichen und Schrägstrichen
      const re = /[^\s \-\/–]+[\-\/–]?/g;
      for (let m; (m = re.exec(t));) {
        if (m[0].length < 2) continue;
        const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        if (zeilen(rg.getClientRects()) > 1) woerter.push(m[0] + ' @' + el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
      }
      for (let m; (m = nummer.exec(t));) {
        const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        if (zeilen(rg.getClientRects()) > 1) nummern.push(m[0] + ' @' + el.tagName.toLowerCase());
      }
    }
    return { ueber: document.documentElement.scrollWidth - document.documentElement.clientWidth, woerter, nummern, cls: window.__cls, csp: window.__csp };
  });
  const f = [];
  if (r.ueber > 0) f.push(`seitlich ${r.ueber}px`);
  if (r.woerter.length) f.push('Wortbruch: ' + [...new Set(r.woerter)].join(', '));
  if (r.nummern.length) f.push('Nummer umbrochen: ' + [...new Set(r.nummern)].join(', '));
  if (r.cls > 0) f.push('CLS ' + r.cls.toFixed(4));
  if (r.csp.length) f.push('CSP: ' + r.csp.join(', '));
  if (fehler.length) f.push('Konsole: ' + fehler.join(' | '));
  probleme += f.length;
  console.log(`${p} ${w}: ${f.length ? f.join(' ; ') : 'ok'}`);
  await ctx.close();
}
await b.close();
console.log('Befunde gesamt:', probleme);
process.exit(probleme ? 1 : 0);
