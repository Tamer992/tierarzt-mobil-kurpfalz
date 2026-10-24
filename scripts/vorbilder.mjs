// Screenshots der Vorbilder: Desktop 1440 und Handy 390 (Touch), erster Bildschirm + lange Seite
import { chromium } from 'playwright';
const [,, out, ...urls] = process.argv;
const browser = await chromium.launch();
for (const u of urls) {
  const name = new URL(u).hostname.replace(/^www\./,'').replace(/\./g,'_') + (new URL(u).pathname.replace(/\W+/g,'_').replace(/_$/,''));
  for (const [tag, opt] of [['d', { viewport:{width:1440,height:900} }], ['m', { viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2 }]]) {
    const ctx = await browser.newContext({ ...opt, locale:'de-DE', userAgent: tag==='m' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
    const p = await ctx.newPage();
    try {
      await p.goto(u, { waitUntil:'domcontentloaded', timeout:45000 });
      await p.waitForTimeout(4000);
      // Cookie-Banner wegklicken, wenn eindeutig
      for (const t of ['Accept','Accept all','Accept All','Alle akzeptieren','Akzeptieren','I agree','OK','Got it','Allow all']) {
        const b = p.getByRole('button', { name:t, exact:true }); if (await b.count()) { await b.first().click({timeout:1500}).catch(()=>{}); break; }
      }
      await p.waitForTimeout(800);
      await p.screenshot({ path:`${out}/${name}-${tag}-top.jpg`, quality:70, type:'jpeg' });
      // langsam scrollen, damit Lazy-Load und Einblendungen auslösen
      const h = await p.evaluate(()=>document.documentElement.scrollHeight);
      for (let y=0; y<Math.min(h,14000); y+=600) { await p.evaluate(y=>window.scrollTo(0,y), y); await p.waitForTimeout(250); }
      await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(600);
      await p.screenshot({ path:`${out}/${name}-${tag}-full.jpg`, quality:55, type:'jpeg', fullPage:true, timeout:60000 });
      const info = await p.evaluate(() => {
        const cs = el => el && getComputedStyle(el);
        const pick = sel => { const e=document.querySelector(sel); if(!e) return null; const s=cs(e); return `${s.fontFamily.split(',')[0]} ${s.fontSize}/${s.lineHeight} w${s.fontWeight} ls${s.letterSpacing}`; };
        return { h1: pick('h1'), h2: pick('h2'), p: pick('main p, p'), bg: cs(document.body).backgroundColor, color: cs(document.body).color, height: document.documentElement.scrollHeight };
      });
      console.log(name, tag, JSON.stringify(info));
    } catch(e) { console.log(name, tag, 'FEHLER', e.message.split('\n')[0]); }
    await ctx.close();
  }
}
await browser.close();
