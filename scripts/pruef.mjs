// Screenshots (Computer 1440 mit Maus, Handy 390 mit Touch) + Konsolen-/CSP-Fehler + Überlauf
import { chromium } from 'playwright';
const [,, basis='http://127.0.0.1:4391', ...pfade] = process.argv;
const ziel = 'pruefung'; await import('node:fs').then(f=>f.mkdirSync(ziel,{recursive:true}));
const b = await chromium.launch();
for (const p of pfade) {
  for (const [tag, opt] of [['d',{viewport:{width:1440,height:900}}],['m',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2}]]) {
    const ctx = await b.newContext(opt); const s = await ctx.newPage(); const fehler=[];
    s.on('console', m => { if (m.type()==='error' || m.type()==='warning') fehler.push(m.text()); });
    s.on('pageerror', e => fehler.push('JS '+e.message));
    s.on('requestfailed', r => fehler.push('LADEN '+r.url()));
    await s.goto(basis+p, { waitUntil:'networkidle' }); await s.waitForTimeout(1200);
    const name = p.replace(/\W+/g,'_') || 'start';
    await s.screenshot({ path:`${ziel}/${name}-${tag}-top.png` });
    const h = await s.evaluate(()=>document.documentElement.scrollHeight);
    for (let y=0;y<h;y+=500){ await s.evaluate(y=>scrollTo(0,y),y); await s.waitForTimeout(120); }
    await s.evaluate(()=>scrollTo(0,0)); await s.waitForTimeout(1000);
    await s.setViewportSize({ width: opt.viewport.width, height: Math.min(h, 12000) });
    await s.waitForTimeout(500);
    await s.screenshot({ path:`${ziel}/${name}-${tag}-voll.png` });
    const ueber = await s.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
    console.log(p, tag, 'hoehe', h, 'ueberlauf', ueber, fehler.length? fehler.join(' | ') : 'keine Fehler');
    await ctx.close();
  }
}
await b.close();
