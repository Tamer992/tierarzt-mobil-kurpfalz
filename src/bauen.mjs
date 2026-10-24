// Baut die drei Richtungen aus src/inhalt/*.json nach site/a, site/b, site/c.
// Aufruf: node src/bauen.mjs
import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = fileURLToPath(new URL('..', import.meta.url));
const lies = async (p) => JSON.parse(await readFile(join(wurzel, p), 'utf8'));
const g = await lies('src/inhalt/gemeinsam.json');
const r = await lies('src/inhalt/richtungen.json');
const masse = await lies('src/inhalt/fotomasse.json');
const s = await lies('src/inhalt/startseite.json');
import { startseiteA } from './seite-a.mjs';
import { rahmen } from './rahmen.mjs';
import { leistungsseite, terminseite, abschiedsseite } from './seiten-a.mjs';
import { designsystem } from './designsystem.mjs';
import { leistungenSeite, ratgeberSeite, ratgeberArtikel } from './seiten-mehr.mjs';
// alle Leistungsseiten: src/inhalt/leistung-*.json
const lSeiten = await Promise.all((await readdir(join(wurzel, 'src/inhalt'))).filter((f) => /^leistung-.+\.json$/.test(f)).sort().map((f) => lies(`src/inhalt/${f}`)));
const lDurchfall = lSeiten.find((l) => l.pfad === 'leistungen/durchfall-erbrechen/');
// Ratgeber: neueste zuerst
const artikel = (await Promise.all((await readdir(join(wurzel, 'src/inhalt/ratgeber'))).filter((f) => f.endsWith('.json')).map((f) => lies(`src/inhalt/ratgeber/${f}`)))).sort((x, y) => y.datum.localeCompare(x.datum) || x.titel.localeCompare(y.titel));
const termin = await lies('src/inhalt/termin.json');
const abschied = await lies('src/inhalt/abschied.json');
const schriften = await lies('src/inhalt/schriften.json');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// [FEHLT: …] sichtbar markieren, damit Platzhalter beim Prüfen auffallen
const txt = (s) => esc(s).replace(/\[(FEHLT:[^\]]*|Praxisname)\]/g, '<span class="fehlt">[$1]</span>');

function bild(name, alt, sizes, { prio = false, klasse = '' } = {}) {
  const [w, h] = masse[name];
  const set = [640, 1100, 1800].map((b) => `img/${name}-${b}.webp ${b}w`).join(', ');
  return `<img class="${klasse}" src="img/${name}-1100.webp" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${prio ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

const nr = () => g.telefon_fehlt ? `<span class="fehlt" title="${esc(g.telefon_fehlt)}">${esc(g.telefon_anzeige)}</span>` : esc(g.telefon_anzeige);
const tel = `<a class="nummer" href="tel:${g.telefon_link}">${nr()}</a>`;

function kopf(titel, richtung) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titel)}</title>
<link rel="preload" href="../schriften/${richtung.schrift}" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="../logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="stil.css">
<script src="../js/seite.js" defer></script>
</head>
<body>
<a class="sprung" href="#inhalt">Zum Inhalt springen</a>`;
}

const navListe = g.navigation.map((n) => `<li><a href="#${n === 'Leistungen' ? 'leistungen' : 'inhalt'}">${esc(n)}</a></li>`).join('');

// Feste Kontaktleiste am Handy, je Richtung eigene Gestaltung über CSS
const leiste = (extraKlasse = '') => `
<div class="leiste ${extraKlasse}" role="region" aria-label="Kontakt">
  <a class="leiste__anruf" href="tel:${g.telefon_link}"><span class="leiste__wort">${esc(g.anrufen_label)}</span><span class="leiste__nr">${nr()}</span></a>
  <a class="leiste__termin" href="#termin">${esc(g.termin_label)}</a>
</div>`;

/* ---------- Richtung A: Auf Augenhöhe ---------- */
function seiteA() {
  const a = r.a;
  const liste = g.leistungen.map((l) => `
      <li class="dienst einblenden">
        <a class="dienst__link" href="#leistungen">
          <h3 class="dienst__titel">${esc(l.titel)}</h3>
          <p class="dienst__satz">${esc(l.satz)}</p>
          <span class="dienst__mehr">${esc(a.leistungen_mehr)}<span class="pfeil" aria-hidden="true"></span></span>
        </a>
      </li>`).join('');
  return `${kopf(`${a.name} · Entwurf A`, { schrift: 'Brygada1918.woff2' })}
<header class="kopf">
  <div class="kopf__innen">
    <a class="marke" href="./">${txt(g.praxisname)}</a>
    <nav class="kopf__nav" aria-label="Hauptmenü"><ul>${navListe}</ul></nav>
    <div class="kopf__kontakt">${tel}<a class="knopf" href="#termin">${esc(g.termin_label)}</a></div>
    <button class="menueknopf" type="button" aria-expanded="false" aria-controls="handymenue"><span class="unsichtbar">Menü öffnen</span><span class="menueknopf__strich"></span><span class="menueknopf__strich"></span></button>
  </div>
  <nav class="handymenue" id="handymenue" aria-label="Menü" hidden><ul>${navListe}</ul></nav>
</header>
<main id="inhalt">
  <section class="start" aria-labelledby="start-titel">
    <div class="start__bild">${bild(a.foto, a.foto_alt, '100vw', { prio: true, klasse: 'auftritt' })}</div>
    <div class="start__tafel auftritt auftritt--2">
      <h1 id="start-titel">${esc(a.titel)}</h1>
      <p class="start__zeile">${txt(a.unterzeile)}</p>
      <div class="start__kontakt">${tel}<a class="knopf knopf--gross" href="#termin">${esc(g.termin_label)}</a></div>
    </div>
  </section>
  <section class="leistungen" id="leistungen" aria-labelledby="leistungen-titel">
    <div class="leistungen__seite">
      <h2 id="leistungen-titel" class="einblenden">${esc(a.leistungen_titel)}</h2>
      <p class="leistungen__satz einblenden">${esc(a.leistungen_satz)}</p>
      <figure class="leistungen__bild einblenden">${bild('katze-sofa', 'Eine getigerte Katze liegt auf einem hellen Sofa und schaut in den Raum.', '(min-width: 900px) 34vw, 100vw')}</figure>
    </div>
    <ul class="leistungen__liste">${liste}
    </ul>
    <p class="hinweis-fehlt">${txt(g.leistungen_fehlt)}</p>
  </section>
  <div id="termin"></div>
</main>${leiste()}
</body>
</html>`;
}

/* ---------- Richtung B: Ein ruhiger Brief ---------- */
function seiteB() {
  const b = r.b;
  const satz = b.leistungen_satz_teile.map((t) => (Array.isArray(t) ? `<a href="#leistungen">${esc(t[0])}</a>` : esc(t))).join('');
  return `${kopf(`${b.name} · Entwurf B`, { schrift: 'Petrona.woff2' })}
<header class="kopf">
  <a class="marke" href="./">${txt(g.praxisname)}</a>
  <nav class="kopf__nav" aria-label="Hauptmenü"><ul>${navListe}</ul></nav>
  <a class="kopf__termin" href="#termin">${esc(g.termin_label)}</a>
  <button class="menueknopf" type="button" aria-expanded="false" aria-controls="handymenue"><span class="unsichtbar">Menü öffnen</span><span class="menueknopf__strich"></span><span class="menueknopf__strich"></span></button>
  <nav class="handymenue" id="handymenue" aria-label="Menü" hidden><ul>${navListe}</ul></nav>
</header>
<main id="inhalt">
  <section class="start" aria-labelledby="start-titel">
    <div class="start__text">
      <h1 id="start-titel" class="auftritt">${esc(b.titel_1)} <em>${esc(b.titel_2)}</em></h1>
      <p class="start__zeile auftritt auftritt--2">${esc(b.unterzeile)}</p>
      <div class="start__kontakt auftritt auftritt--3">
        <p class="start__telefon">${esc(b.telefon_vorsatz)}<br>${tel}</p>
        <a class="knopf" href="#termin">${esc(g.termin_label)}</a>
      </div>
    </div>
    <figure class="start__bild auftritt auftritt--2">${bild(b.foto, b.foto_alt, '(min-width: 900px) 38vw, 100vw', { prio: true })}</figure>
  </section>
  <section class="leistungen" id="leistungen" aria-labelledby="leistungen-titel">
    <h2 id="leistungen-titel" class="einblenden">${esc(b.leistungen_titel)}</h2>
    <p class="leistungen__satz einblenden">${satz}</p>
    <p class="leistungen__nachsatz einblenden">${esc(b.leistungen_nachsatz)}</p>
    <div class="leistungen__bilder">
      <figure class="leistungen__bild leistungen__bild--1 einblenden">${bild(b.fotos_leistungen[0], b.fotos_alt[0], '(min-width: 900px) 30vw, 70vw')}</figure>
      <figure class="leistungen__bild leistungen__bild--2 einblenden">${bild(b.fotos_leistungen[1], b.fotos_alt[1], '(min-width: 900px) 40vw, 90vw')}</figure>
    </div>
    <p class="hinweis-fehlt">${txt(g.leistungen_fehlt)}</p>
  </section>
  <div id="termin"></div>
</main>${leiste()}
</body>
</html>`;
}

/* ---------- Richtung C: Licht an ---------- */
function seiteC() {
  const c = r.c;
  const liste = g.leistungen.map((l, i) => `
      <li class="index__eintrag einblenden">
        <a class="index__link" href="#leistungen" data-foto="${i}">
          <span class="index__bildchen">${bild(l.foto, c.fotos_alt[l.foto], '120px')}</span>
          <span class="index__titel">${esc(l.titel)}</span>
          <span class="index__satz">${esc(l.satz)}</span>
        </a>
      </li>`).join('');
  const buehne = g.leistungen.map((l, i) => `<div class="buehne__bild${i === 0 ? ' ist-aktiv' : ''}" data-foto="${i}">${bild(l.foto, '', '(min-width: 1000px) 34vw, 1px')}</div>`).join('');
  return `${kopf(`${c.name} · Entwurf C`, { schrift: 'MonaSans.woff2' })}
<header class="kopf">
  <a class="marke" href="./">${txt(g.praxisname)}</a>
  <nav class="kopf__nav" aria-label="Hauptmenü"><ul>${navListe}</ul></nav>
  <button class="menueknopf" type="button" aria-expanded="false" aria-controls="handymenue"><span class="unsichtbar">Menü öffnen</span><span class="menueknopf__strich"></span><span class="menueknopf__strich"></span></button>
  <nav class="handymenue" id="handymenue" aria-label="Menü" hidden><ul>${navListe}</ul></nav>
</header>
<main id="inhalt">
  <section class="start" aria-labelledby="start-titel">
    <figure class="start__bild">${bild(c.foto, c.foto_alt, '(min-width: 900px) 56vw, 100vw', { prio: true, klasse: 'auftritt' })}</figure>
    <div class="start__text">
      <h1 id="start-titel" class="auftritt"><span class="satz">${esc(c.titel_1)}</span> <span class="satz">${esc(c.titel_2)}</span></h1>
      <p class="start__zeile auftritt auftritt--2">${txt(c.unterzeile)}</p>
      <div class="start__kontakt auftritt auftritt--3">
        <a class="lichtschalter" href="tel:${g.telefon_link}"><span class="lichtschalter__wort">${esc(g.anrufen_label)}</span><span class="lichtschalter__nr">${nr()}</span></a>
        <a class="textknopf" href="#termin">${esc(g.termin_label)}<span class="pfeil" aria-hidden="true"></span></a>
      </div>
    </div>
  </section>
  <section class="leistungen" id="leistungen" aria-labelledby="leistungen-titel">
    <div class="leistungen__kopf">
      <h2 id="leistungen-titel" class="einblenden">${esc(c.leistungen_titel)}</h2>
      <p class="leistungen__satz einblenden">${esc(c.leistungen_satz)}</p>
    </div>
    <div class="leistungen__inhalt">
      <ul class="index">${liste}
      </ul>
      <div class="buehne" aria-hidden="true">${buehne}</div>
    </div>
    <p class="hinweis-fehlt">${txt(g.leistungen_fehlt)}</p>
  </section>
  <div id="termin"></div>
</main>${leiste()}
</body>
</html>`;
}

// Phase 2: A ist die vollständige Startseite, B und C bleiben als Stand aus Phase 1
const rh = rahmen({ g, s, esc, txt, masse });
const seiteAVoll = () => startseiteA({ g, r, s, esc, txt, rh, artikel });
for (const [k, f] of [['a', seiteAVoll], ['b', seiteB], ['c', seiteC]]) {
  await mkdir(join(wurzel, 'site', k), { recursive: true });
  await writeFile(join(wurzel, 'site', k, 'index.html'), f());
  await cp(join(wurzel, 'src/stil', `${k}.css`), join(wurzel, 'site', k, 'stil.css'));
}
await mkdir(join(wurzel, 'site/schriften'), { recursive: true });
await cp(join(wurzel, 'schriften/woff2'), join(wurzel, 'site/schriften'), { recursive: true });
await cp(join(wurzel, 'schriften/lizenzen'), join(wurzel, 'site/schriften/lizenzen'), { recursive: true });
await cp(join(wurzel, 'src/logo'), join(wurzel, 'site/logo'), { recursive: true });
await mkdir(join(wurzel, 'site/js'), { recursive: true });
await cp(join(wurzel, 'src/js/seite.js'), join(wurzel, 'site/js/seite.js'));
console.log('gebaut: site/a, site/b, site/c');

// Phase 3: Unterseiten von Richtung A
const schreibe = async (pfad, html) => { await mkdir(join(wurzel, 'site/a', pfad), { recursive: true }); await writeFile(join(wurzel, 'site/a', pfad, 'index.html'), html); };
for (const l of lSeiten) await schreibe(l.pfad, leistungsseite({ g, s, l, esc, txt, rh }));
const satzAbschluss = lDurchfall.abschluss.satz;
await schreibe('leistungen/', leistungenSeite({ g, r, esc, txt, rh, satzAbschluss }));
await schreibe('ratgeber/', ratgeberSeite({ g, artikel, esc, txt, rh, satzAbschluss }));
for (const a of artikel) await schreibe(`ratgeber/${a.slug}/`, ratgeberArtikel({ g, a, artikel, esc, txt, rh, satzAbschluss }));
await schreibe(termin.pfad, terminseite({ g, s, t: termin, esc, txt, rh }));
await schreibe(abschied.pfad, abschiedsseite({ g, s, a: abschied, esc, txt, rh }));
const ds = designsystem({ css: await readFile(join(wurzel, 'src/stil/a.css'), 'utf8'), schriften, esc, rh });
await schreibe('designsystem/', ds.html);
await writeFile(join(wurzel, 'site/a/designsystem/ds.css'), ds.css);
console.log(`gebaut: ${lSeiten.length} Leistungsseiten, Übersicht, Ratgeber mit ${artikel.length} Artikeln, a/${termin.pfad}, a/${abschied.pfad}, a/designsystem/`);
