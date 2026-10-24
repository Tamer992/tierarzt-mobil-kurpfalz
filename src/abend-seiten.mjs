// Baut die Unterseiten der Richtung „Abendlicht“ nach site/abend/: Leistungen, Terminanfrage, Abschied, Ratgeber.
// Inhalt und Aufbau kommen aus den Generatoren von Richtung A (seiten-a.mjs, seiten-mehr.mjs),
// Rahmen (Kopf, Fuß, Leiste), Fotos und Stil sind neu. Aufruf: node src/abend-seiten.mjs (nach src/abend.mjs)
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leistungsseite, terminseite, abschiedsseite } from './seiten-a.mjs';
import { leistungenSeite, ratgeberSeite, ratgeberArtikel } from './seiten-mehr.mjs';

const wurzel = fileURLToPath(new URL('..', import.meta.url));
const lies = async (p) => JSON.parse(await readFile(join(wurzel, p), 'utf8'));
const g = structuredClone(await lies('src/inhalt/gemeinsam.json'));
const s = await lies('src/inhalt/startseite.json');
const r = await lies('src/inhalt/richtungen.json');
const termin = await lies('src/inhalt/termin.json');
const abschied = await lies('src/inhalt/abschied.json');
const masse = await lies('src/inhalt/fotomasse-abend.json');
const lSeiten = await Promise.all((await readdir(join(wurzel, 'src/inhalt'))).filter((f) => /^leistung-.+\.json$/.test(f)).sort().map((f) => lies(`src/inhalt/${f}`)));
const artikel = (await Promise.all((await readdir(join(wurzel, 'src/inhalt/ratgeber'))).filter((f) => f.endsWith('.json')).map((f) => lies(`src/inhalt/ratgeber/${f}`))))
  .sort((x, y) => y.datum.localeCompare(x.datum) || x.titel.localeCompare(y.titel));

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = (t) => esc(t).replace(/\[(FEHLT:[^\]]*|Praxisname)\]/g, '<span class="fehlt">[$1]</span>');

// Fotos der Richtung „Abendlicht“ (Pexels, Liste im BILDNACHWEIS)
const FOTOS = {
  'leistungen/akutversorgung/': ['hund-dackel-dunkel', 'Ein Dackel liegt erschöpft auf dem Sofa und schaut zur Seite.'],
  'leistungen/durchfall-erbrechen/': ['katze-decken', 'Eine Katze liegt müde zwischen gestrickten Decken.'],
  'leistungen/schmerzbehandlung/': ['hund-alt-dunkel', 'Ein Hund liegt erschöpft am Boden und schaut zur Seite.'],
  'leistungen/bisswunden-verletzungen/': ['hund-kopf-licht', 'Ein Hund liegt mit dem Kopf auf einer Decke im warmen Licht.'],
  'leistungen/ohrenentzuendungen/': ['hund-ohren-bett', 'Ein Cocker Spaniel mit langen Ohren liegt auf dem Bett.'],
  'leistungen/augen-bindehaut/': ['katze-schwarz-auge', 'Eine schwarze Katze mit bernsteinfarbenen Augen im seitlichen Licht.'],
  'leistungen/blase-harnwege/': ['katze-abendfenster', 'Eine rote Katze sitzt im Abendlicht am Fenster.'],
  'leistungen/infektionen-infusionen/': ['hund-verband', 'Ein Hund liegt mit einem Venenzugang am Bein auf einer Decke.'],
  'leistungen/lahmheit-bewegung/': ['hund-pfoten-holz', 'Die Pfoten eines liegenden Hundes auf einem Holzboden im warmen Licht.'],
  'abschied/': ['hund-schlaf-sonne', 'Ein Dackel schläft im warmen Licht auf einer Decke.'],
};
const VORHER = ['katze-kissen-dunkel', 'Eine Katze schaut zwischen zwei Kissen auf dem Sofa hervor.'];
for (const l of lSeiten) {
  const f = FOTOS[l.pfad]; if (f) [l.foto, l.foto_alt] = f;
  if (l.vorher?.foto) [l.vorher.foto, l.vorher.foto_alt] = VORHER;
}
[abschied.foto, abschied.foto_alt] = FOTOS['abschied/'];
for (const x of g.leistungen) { const f = FOTOS[x.seite]; if (f) x.foto = f[0]; }

// --- Rahmen „Abendlicht“ für Unterseiten --------------------------------------
const logoAlt = 'Mobile Tierarztpraxis Kurpfalz, Notfall-Tierarzt Al Saeed';
const nr = () => esc(g.telefon_anzeige);
const tel = `<a class="nummer" href="tel:${g.telefon_link}">${nr()}</a>`;
function bild(name, alt, sizes, { p = '', prio = false, klasse = '' } = {}) {
  const [w, h] = masse[name];
  const set = [640, 1100, 1800].map((b) => `${p}img/${name}-${b}.webp ${b}w`).join(', ');
  return `<img${klasse ? ` class="${klasse}"` : ''} src="${p}img/${name}-1100.webp" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${prio ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}
function dokument(titel, p, { beschreibung = '', koerper = '' } = {}) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titel)}</title>${beschreibung ? `\n<meta name="description" content="${esc(beschreibung)}">` : ''}
<link rel="preload" href="${p}../schriften/SourceSerif4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="${p}../logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${p}unterseiten.css">
<script src="${p}../js/seite.js" defer></script>
<script src="${p}abend.js" defer></script>
</head>
<body class="unterseite${koerper ? ` ${koerper}` : ''}">
<a class="sprung" href="#inhalt">Zum Inhalt springen</a>`;
}
const navListe = (p) => [['Leistungen', 'leistungen/'], ['Hausbesuch', '#ablauf'], ['Über mich', '#tierarzt'], ['Ratgeber', 'ratgeber/'], ['Kontakt', '#termin']]
  .map(([t, z]) => `<li><a href="${p}${z.startsWith('#') ? '' : ''}${z}">${esc(t)}</a></li>`).join('');
const terminZiel = (p) => `${p}termin/`;
function kopfzeile(p) {
  const nav = navListe(p).replace(/href="([^"]*)#/g, `href="$1#`);
  return `
<header class="ab-kopf">
  <a class="ab-kopf__marke" href="${p || './'}" aria-label="Mobile Tierarztpraxis Kurpfalz, zur Startseite"><img src="${p}../logo/logo-quer-warm.svg" width="166" height="50" alt=""></a>
  <nav class="ab-kopf__nav" aria-label="Hauptnavigation"><ul>${nav}</ul></nav>
  <a class="ab-kopf__tel" href="tel:${g.telefon_link}">${nr()}</a>
  <button class="menueknopf" type="button" aria-expanded="false" aria-controls="handymenue"><span class="unsichtbar">Menü öffnen</span><span class="menueknopf__strich"></span><span class="menueknopf__strich"></span></button>
  <nav class="handymenue" id="handymenue" aria-label="Menü" hidden><ul>${nav}</ul></nav>
</header>`;
}
function fuss(p) {
  return `
<footer class="ab-fuss">
  <div class="ab-fuss__innen">
    <div><img src="${p}../logo/logo-quer-warm.svg" width="166" height="50" alt="${logoAlt}" loading="lazy"></div>
    <div><h2 class="ab-fuss__titel">Erreichbar</h2><p>Montag bis Freitag 9 bis 23 Uhr<br>Samstag 8 bis 12 Uhr<br>Sonntag in Ausnahmefällen</p></div>
    <div><h2 class="ab-fuss__titel">Kontakt</h2><p><a href="tel:${g.telefon_link}">${nr()}</a> <span class="fehlt">[FEHLT: neue Nummer]</span><br><span class="fehlt">[FEHLT: E-Mail]</span></p></div>
    <div><h2 class="ab-fuss__titel">Praxis</h2><p>Freinsheimer Str. 30<br>67245 Lambsheim</p></div>
  </div>
  <p class="ab-fuss__recht"><a href="#inhalt">Impressum</a> <a href="#inhalt">Datenschutz</a> <span>Fotos: Pexels</span></p>
</footer>`;
}
function leiste(p, { termin: mitTermin = true, terminHref } = {}) {
  return `
<nav class="ab-leiste" aria-label="Schnellkontakt">${mitTermin ? `<a class="ab-knopf ab-knopf--hell" href="${terminHref || terminZiel(p)}">${esc(g.termin_label)}</a>` : ''}<a class="ab-knopf ab-knopf--linie" href="tel:${g.telefon_link}">${esc(g.anrufen_label)}</a></nav>`;
}
const zeiten = (klasse = '') => `<table class="zeiten${klasse ? ` ${klasse}` : ''}">
        <caption>${esc(s.erreichbarkeit.titel)}</caption>
        <tbody>${s.erreichbarkeit.zeilen.map((z) => `<tr><th scope="row">${esc(z.tage)}</th><td>${txt(z.zeit)}</td></tr>`).join('')}</tbody>
      </table>`;
const rh = { nr, tel, bild, dokument, kopfzeile, fuss, leiste, zeiten, terminZiel, ende: '\n</body>\n</html>' };

// Sprungmarken der Navigation zeigen auf die Startseite: "../../#ablauf" statt "../../#ablauf" bleibt gleich,
// auf Unterseiten ergibt p + "#ablauf" den richtigen Weg zur Startseite.
const schreibe = async (pfad, html) => {
  await mkdir(join(wurzel, 'site/abend', pfad), { recursive: true });
  await writeFile(join(wurzel, 'site/abend', pfad, 'index.html'), html);
};
const lDurchfall = lSeiten.find((l) => l.pfad === 'leistungen/durchfall-erbrechen/');
const satzAbschluss = lDurchfall.abschluss.satz;
for (const l of lSeiten) await schreibe(l.pfad, leistungsseite({ g, s, l, esc, txt, rh }));
await schreibe('leistungen/', leistungenSeite({ g, r, esc, txt, rh, satzAbschluss }));
await schreibe('ratgeber/', ratgeberSeite({ g, artikel, esc, txt, rh, satzAbschluss }));
for (const a of artikel) await schreibe(`ratgeber/${a.slug}/`, ratgeberArtikel({ g, a, artikel, esc, txt, rh, satzAbschluss }));
await schreibe(termin.pfad, terminseite({ g, s, t: termin, esc, txt, rh }));
await schreibe(abschied.pfad, abschiedsseite({ g, s, a: abschied, esc, txt, rh }));

// Stil: Aufbau aus Richtung A, Farben und Schrift der Richtung „Abendlicht“ (src/abend/unterseiten.css)
const basis = await readFile(join(wurzel, 'src/stil/a.css'), 'utf8');
const eigen = await readFile(join(wurzel, 'src/abend/unterseiten.css'), 'utf8');
await writeFile(join(wurzel, 'site/abend/unterseiten.css'), `/* Aufbau aus Richtung A (src/stil/a.css), darunter die Anpassungen der Richtung „Abendlicht“ */\n${basis.replace(/@font-face[^}]*}/g, '').replace(/#3A3F46/gi, '#1c1814')}\n${eigen}`);
console.log(`gebaut: ${lSeiten.length} Leistungsseiten, Übersicht, Ratgeber mit ${artikel.length} Artikeln, Terminanfrage, Abschied`);
