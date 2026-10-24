// Baut die Vergleichsseite site/index.html (Phase 1) aus den Inhaltsdateien.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = fileURLToPath(new URL('..', import.meta.url));
const lies = async (p) => JSON.parse(await readFile(join(wurzel, p), 'utf8'));
const r = await lies('src/inhalt/richtungen.json');
const { paletten, kontrast } = await lies('src/inhalt/paletten.json');
const schriften = await lies('src/inhalt/schriften.json');
const nachweis = await readFile(join(wurzel, 'BILDNACHWEIS.md'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fotosJe = { a: ['hund-senior-boden', 'katze-sofa'], b: ['katze-sonnenfenster', 'katzen-sofa-licht', 'hund-boden'], c: ['hund-fenster', 'katze-unter-decke', 'katze-sofa', 'hund-boden2', 'hund-teppich', 'katze-grau-fenster', 'hund-senior-boden'] };
const fotograf = Object.fromEntries(nachweis.split('\n').filter((z) => z.startsWith('| ') && !z.startsWith('| Datei') ).map((z) => z.split('|').map((s) => s.trim())).map((t) => [t[1], t[3]]));
const namen = { grund: 'Grundfläche', flaeche: 'Tafel', text: 'Text', leise: 'Nebentext', akzent: 'Akzent (Anrufen, Termin)', 'akzent-tief': 'Akzent gedrückt', 'akzent-hell': 'Markierung', 'auf-akzent': 'Schrift auf Akzent' };

let css = '';
const block = (k) => {
  const d = r[k];
  const p = paletten[k.toUpperCase()];
  Object.entries(p).forEach(([n, hex]) => { css += `.f-${k}-${n}{background:${hex}}\n`; });
  const felder = Object.entries(p).map(([n, hex]) => `<li><span class="feld f-${k}-${n}"></span><span class="feld__name">${esc(namen[n])}</span><code>${hex}</code></li>`).join('');
  const kw = Object.entries(kontrast[k.toUpperCase()]).map(([paar, wert]) => {
    const ok = wert >= 4.5 ? 'AA Text' : wert >= 3 ? 'AA groß' : 'nur mit Rand';
    return `<tr><td>${esc(paar.replace('auf-akzent', 'Schrift auf Akzent').replace(/-/g, ' '))}</td><td class="zahl">${wert.toFixed(2).replace('.', ',')} : 1</td><td>${ok}</td></tr>`;
  }).join('');
  const sch = schriften[k].map((s) => `<li><strong>${esc(s.name)}</strong> · ${esc(s.rolle)}<br><span class="leise">${esc(s.warum)}</span><br><span class="klein">${esc(s.quelle)} · ${esc(s.lizenz)}</span></li>`).join('');
  const fot = fotosJe[k].map((f) => `<li>${esc(f)} <span class="leise">· ${esc(fotograf[f] || '')}</span></li>`).join('');
  return `
<section class="richtung" id="${k}">
  <header class="richtung__kopf">
    <p class="buchstabe">${k.toUpperCase()}</p>
    <div>
      <h2>${esc(d.name)}</h2>
      <p class="idee">${esc(d.startidee)}</p>
      <p class="links"><a class="knopf" href="/${k}/">Richtung ${k.toUpperCase()} live ansehen</a></p>
    </div>
  </header>
  <figure class="bild"><img src="vergleich/${k}-start.webp" width="1600" height="900" alt="Richtung ${k.toUpperCase()}: erster Bildschirm am Computer und am Handy" loading="lazy"><figcaption>Erster Bildschirm · Computer 1440 px und Handy 390 px</figcaption></figure>
  <div class="paar">
    <figure class="bild"><img src="vergleich/${k}-computer.webp" alt="Richtung ${k.toUpperCase()}: Startbereich und Leistungen am Computer" loading="lazy"><figcaption>Computer: Startbereich und Leistungen</figcaption></figure>
    <figure class="bild bild--handy"><img src="vergleich/${k}-handy.webp" alt="Richtung ${k.toUpperCase()}: Startbereich und Leistungen am Handy" loading="lazy"><figcaption>Handy</figcaption></figure>
  </div>
  <div class="fakten">
    <div><h3>Palette</h3><ul class="felder">${felder}</ul></div>
    <div><h3>Kontrast (WCAG)</h3><table><tbody>${kw}</tbody></table></div>
    <div><h3>Schriftpaar</h3><ul class="liste">${sch}</ul></div>
    <div><h3>Fotos</h3><ul class="liste">${fot}</ul></div>
  </div>
  <div class="warum"><h3>Warum edel und warm zugleich</h3>${d.warum.map((s) => `<p>${esc(s)}</p>`).join('')}</div>
</section>`;
};

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Mobiler Tierarzt · Phase 1 · drei Richtungen</title>
<link rel="stylesheet" href="vergleich/vergleich.css">
</head>
<body>
<main>
  <header class="seitenkopf">
    <h1>Mobiler Tierarzt · drei Richtungen</h1>
    <p>Stand 24.10.2026. Jede Richtung hat einen gebauten Startbereich und eine Leistungsübersicht. Die Richtungen lassen sich live öffnen und am Handy durchtippen. Farbig hinterlegte Stellen sind Platzhalter für fehlende Angaben. Die Telefonnummer hat die Länge einer echten Nummer, damit das Layout stimmt.</p>
    <nav aria-label="Richtungen"><a href="#a">A · ${esc(r.a.name)}</a><a href="#b">B · ${esc(r.b.name)}</a><a href="#c">C · ${esc(r.c.name)}</a><a href="/recherche/">Phase 0 · Vorbilder</a></nav>
  </header>
  ${['a', 'b', 'c'].map(block).join('\n')}
  <footer class="fuss"><p>Alle Fotos von Unsplash unter der Unsplash-Lizenz, Nachweis in BILDNACHWEIS.md. Alle Schriften unter der SIL Open Font License, lokal eingebunden, ohne Google Fonts und ohne Tracking.</p></footer>
</main>
</body>
</html>`;

const basis = `*{box-sizing:border-box}body{margin:0;background:#f3f3f1;color:#1d1e20;font:17px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1240px;margin:0 auto;padding:32px 20px 96px}
h1{font-size:28px;line-height:1.15;margin:0 0 8px;text-wrap:balance}h2{font-size:26px;margin:0;line-height:1.2}h3{font-size:15px;margin:0 0 10px;letter-spacing:.02em}
p{margin:0;text-wrap:pretty}.seitenkopf p{max-width:62ch;color:#4a4c51}
nav{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:16px}nav a{color:#1d1e20;font-weight:600}
.richtung{background:#fff;margin-top:40px;padding:24px;border:1px solid #dcdcd8}
.richtung__kopf{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;margin-bottom:20px}
.buchstabe{font-size:44px;font-weight:700;line-height:1}.idee{margin-top:6px;max-width:64ch;color:#3a3c40}
.links{margin-top:12px}.knopf{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;background:#1d1e20;color:#fff;text-decoration:none;font-weight:600;border-radius:3px}
.knopf:hover{background:#3a3c40}.knopf:focus-visible,a:focus-visible{outline:3px solid #2b44a3;outline-offset:3px}
figure{margin:0}.bild img{display:block;width:100%;height:auto;border:1px solid #e2e2de}figcaption{font-size:14px;color:#5a5c60;margin-top:6px}
.paar{display:grid;grid-template-columns:1fr;gap:16px;margin-top:20px}.bild--handy{max-width:390px}
@media(min-width:900px){.paar{grid-template-columns:1000fr 390fr;align-items:start}}
.fakten{display:grid;gap:24px;margin-top:24px}@media(min-width:900px){.fakten{grid-template-columns:1fr 1fr}}
.felder,.liste{list-style:none;margin:0;padding:0}.felder li{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:3px 0}
.feld{width:28px;height:28px;border:1px solid rgba(0,0,0,.15)}code{font-size:14px}.feld__name{font-size:15px}
.liste li{padding:6px 0;font-size:15px}.leise{color:#55575c}.klein{font-size:13px;color:#5a5c60}
table{border-collapse:collapse;font-size:15px;width:100%}td{padding:4px 8px 4px 0;vertical-align:top}.zahl{font-variant-numeric:tabular-nums;white-space:nowrap}
.warum{margin-top:24px;padding-top:16px;border-top:1px solid #e2e2de}.warum p+p{margin-top:8px}.warum p{max-width:70ch}
.fuss{margin-top:40px;font-size:14px;color:#5a5c60}
`;
await writeFile(join(wurzel, 'site/index.html'), html);
await writeFile(join(wurzel, 'site/vergleich/vergleich.css'), basis + css);
console.log('Vergleichsseite gebaut');
