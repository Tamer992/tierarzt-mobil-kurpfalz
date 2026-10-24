// axe-core auf allen Seiten, Computer und Handy, nach Ende der Einblendungen
import { chromium } from 'playwright';
const [,, basis = 'http://127.0.0.1:4391', ...pfade] = process.argv;
const b = await chromium.launch();
let summe = 0;
for (const p of pfade) for (const [tag, opt] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await b.newContext({ ...opt, bypassCSP: true, reducedMotion: 'reduce' });
  const s = await ctx.newPage();
  await s.goto(basis + p, { waitUntil: 'networkidle' }); await s.waitForTimeout(900);
  await s.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const r = await s.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`));
  summe += r.length;
  console.log(p, tag, r.length ? '\n  ' + r.join('\n  ') : 'keine Verstöße');
  await ctx.close();
}
await b.close();
console.log('Verstöße gesamt:', summe);
