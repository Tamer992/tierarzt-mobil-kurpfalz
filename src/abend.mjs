// Baut die Startseite der Richtung „Abendlicht“ nach site/abend/ (Vorbilder apple.com, rolex.com).
// Aufruf: node src/abend.mjs   Texte aus src/inhalt/*.json, Stil und Skript aus src/abend/.
import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = fileURLToPath(new URL('..', import.meta.url));
const lies = async (p) => JSON.parse(await readFile(join(wurzel, p), 'utf8'));
const g = await lies('src/inhalt/gemeinsam.json');
const s = await lies('src/inhalt/startseite.json');
const artikel = (await Promise.all((await readdir(join(wurzel, 'src/inhalt/ratgeber'))).filter((f) => f.endsWith('.json'))
  .map(async (f) => ({ ...(await lies(`src/inhalt/ratgeber/${f}`)), datei: f.replace('.json', '') }))))
  .sort((x, y) => y.datum.localeCompare(x.datum) || x.titel.localeCompare(y.titel));

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = (t) => esc(t).replace(/\[(FEHLT:[^\]]*)\]/g, '<span class="fehlt">[$1]</span>');
const A = ''; // Unterseiten liegen in site/abend/ (src/abend-seiten.mjs)

// Bild mit drei Breiten; masse = [breite, hoehe] des Originals
const MASSE = {
  'tag-start': [2400, 1602], 'tag-hund-kissen': [2400, 1920], 'tag-katze-schlaf-weiss': [2400, 1800], 'tag-chihuahua-alt': [2400, 1600],
  'tag-bengal-sofa': [2400, 1600], 'tag-tiger-blick': [2400, 1600], 'tag-hund-bett': [2400, 1600], 'tag-hund-fensterbank': [2400, 1594],
  'tag-golden-boden': [2400, 1600], 'tag-yorkie-verband': [2400, 1600], 'tag-katze-grau-fenster': [2400, 1602],
};
function bild(name, alt, sizes, { prio = false, klasse = '' } = {}) {
  const [w, h] = MASSE[name];
  const breiten = [640, 1100, 1800];
  const set = breiten.map((b) => `img/${name}-${b}.webp ${b}w`).join(', ');
  return `<img${klasse ? ` class="${klasse}"` : ''} src="img/${name}-1100.webp" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${prio ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

const tel = g.telefon_anzeige, telLink = `tel:${g.telefon_link}`;
const telFehlt = g.telefon_fehlt ? `<span class="fehlt fehlt--block">[FEHLT: neue Nummer]</span>` : '';

// --- Abschnitte -------------------------------------------------------------

const kopf = `
<header class="kopf" data-kopf>
  <a class="kopf__marke" href="./" aria-label="Mobile Tierarztpraxis Kurpfalz, zur Startseite"><img src="../logo/logo-quer-original.svg" width="166" height="50" alt=""></a>
  <nav class="kopf__nav" aria-label="Hauptnavigation"><ul>
    <li><a href="#leistungen">Leistungen</a></li>
    <li><a href="#ablauf">Hausbesuch</a></li>
    <li><a href="#tierarzt">Über mich</a></li>
    <li><a href="${A}ratgeber/">Ratgeber</a></li>
    <li><a href="#termin">Kontakt</a></li>
  </ul></nav>
  <a class="kopf__tel" href="${telLink}">${esc(tel)}</a>
</header>`;

const start = `
<section class="start" aria-labelledby="start-titel">
  <figure class="start__bild">${bild('tag-start', 'Eine rote Katze liegt am hellen Fenster und schaut ruhig in die Kamera.', '(max-width: 700px) 100vw, 74vw', { prio: true })}</figure>
  <div class="start__text">
    <p class="start__marke">Mannheim · Ludwigshafen · Heidelberg</p>
    <h1 id="start-titel" class="start__titel"><span>Wir kommen</span> <span>zu Ihnen.</span></h1>
    <p class="start__satz">Notfall- und Akutversorgung für Hunde und Katzen, bei Ihnen zu Hause. Kein Transportkorb, keine Fahrt, kein Wartezimmer.</p>
    <div class="start__knoepfe">
      <a class="knopf knopf--dunkel" href="#termin">Termin anfragen</a>
      <a class="knopf knopf--rand" href="${telLink}">Anrufen</a>
    </div>
    <a class="start__arzt" href="#tierarzt"><span class="start__portraet" aria-hidden="true"><span class="fehlt">FEHLT: Foto</span></span><span><strong>Rasheed Al Saeed</strong><br>Ihr Tierarzt, kommt selbst zu Ihnen</span></a>
  </div>
  <p class="uhr" aria-live="off">
    <span class="uhr__zeit" data-uhr-zeit>9–23</span>
    <span class="uhr__satz" data-uhr-satz>Montag bis Freitag 9 bis 23 Uhr erreichbar, Samstag 8 bis 12 Uhr.</span>
  </p>
</section>`;

const k = s.kontakt;
const e = s.einsatz;
const anlaesse = `<option value="" selected disabled>${esc(k.anlass_leer)}</option>` + [k.anlass_erst, ...g.leistungen.map((l) => l.titel), k.anlass_sonst].map((t) => `<option>${esc(t)}</option>`).join('');
const termin = `
<section class="termin hell" id="termin" aria-labelledby="termin-titel">
  <div class="termin__innen">
    <div class="termin__links zeige">
      <h2 id="termin-titel" class="titel">${esc(k.titel)}</h2>
      <p class="einleitung">${esc(k.satz)}</p>
      <form class="plz" data-plz='${esc(JSON.stringify(e.plz_liste))}' data-ja="${esc(e.antwort_ja)}" data-nein="${esc(e.antwort_nein)}" data-fehler="${esc(e.antwort_fehler)}" novalidate>
        <label class="beschriftung" for="plz-feld">${esc(e.plz_label)}</label>
        <div class="plz__zeile">
          <input id="plz-feld" class="plz__feld" name="plz" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="68159" aria-describedby="plz-hinweis plz-antwort">
          <button class="knopf knopf--dunkel" type="submit">${esc(e.plz_knopf)}</button>
        </div>
        <p class="hinweis" id="plz-hinweis">${esc(e.plz_hinweis)} <span class="fehlt">${esc(e.plz_fehlt)}</span></p>
        <p class="plz__antwort" id="plz-antwort" role="status"></p>
      </form>
      <form class="vorauswahl" action="${A}termin/" method="get">
        <fieldset class="gruppe">
          <legend class="beschriftung">${esc(k.frage_tier)}</legend>
          <div class="wahlen">${k.tiere.map((t, i) => `<label class="wahl"><input type="radio" name="tier" value="${esc(t.toLowerCase().replace(/\s+/g, '-'))}"${i === 0 ? ' required' : ''}><span>${esc(t)}</span></label>`).join('')}</div>
        </fieldset>
        <div class="gruppe tier-anderes" hidden>
          <label class="beschriftung" for="tier-anderes">${esc(k.tier_anderes_label)}</label>
          <input class="feld feld--kurz" id="tier-anderes" name="tier_anderes" type="text" maxlength="60" autocomplete="off" aria-describedby="tier-anderes-hinweis" disabled>
          <p class="hinweis" id="tier-anderes-hinweis">${esc(k.tier_anderes_hinweis)}</p>
        </div>
        <div class="gruppe">
          <label class="beschriftung" for="anlass">${esc(k.frage_anlass)}</label>
          <div class="auswahl"><select class="feld" id="anlass" name="anlass" required data-sonst="${esc(k.anlass_sonst)}">${anlaesse}</select></div>
        </div>
        <div class="gruppe anlass-text" hidden data-label-sonst="${esc(k.anlass_sonst_label)}" data-hinweis-sonst="${esc(k.anlass_sonst_hinweis)}" data-label="${esc(k.anlass_text_label)}" data-hinweis="${esc(k.anlass_text_hinweis)}">
          <label class="beschriftung" for="anlass-text">${esc(k.anlass_text_label)}</label>
          <textarea class="feld feld--text" id="anlass-text" name="anlass_text" rows="3" maxlength="300" aria-describedby="anlass-text-hinweis" disabled></textarea>
          <p class="hinweis" id="anlass-text-hinweis">${esc(k.anlass_text_hinweis)}</p>
        </div>
        <button class="knopf knopf--dunkel" type="submit">${esc(k.weiter)} <span aria-hidden="true">→</span></button>
      </form>
    </div>
    <aside class="termin__rechts zeige" aria-labelledby="anrufen-titel">
      <h3 id="anrufen-titel" class="untertitel">${esc(k.telefon_titel)}</h3>
      <p>${txt(k.telefon_satz)}</p>
      <a class="grossnummer" href="${telLink}">${esc(tel)}</a>${telFehlt}
      <dl class="zeiten">
        <div><dt>Montag bis Freitag</dt><dd>9 bis 23 Uhr</dd></div>
        <div><dt>Samstag</dt><dd>8 bis 12 Uhr</dd></div>
        <div><dt>Sonntag</dt><dd>in Ausnahmefällen</dd></div>
      </dl>
    </aside>
  </div>
</section>`;

const teile = e.orte.find((st) => st.stufe === 'stadtteile').orte;
const umgebung = e.orte.filter((st) => st.stufe !== 1 && st.stufe !== 'stadtteile').flatMap((st) => st.orte);
const einsatz = `
<section class="einsatz" id="einsatz" aria-labelledby="einsatz-titel">
  <div class="einsatz__innen">
    <div class="einsatz__links zeige">
      <h2 id="einsatz-titel" class="titel">${esc(e.titel)}</h2>
      <p class="einleitung">${esc(e.satz)}</p>
    </div>
    <div class="einsatz__orte zeige" role="group" aria-label="${esc(e.orte_titel)}">
      <h3 class="untertitel">Mannheim</h3>
      <p class="einsatz__teile">${teile.map(esc).join(', ')}</p>
      <h3 class="untertitel">Rund um Mannheim</h3>
      <ul class="einsatz__liste">${umgebung.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
    </div>
  </div>
</section>`;

const ab = s.ablauf;
const ablaufBilder = [
  ['tag-bengal-sofa', 'Eine Bengalkatze liegt entspannt auf dem Sofa.'],
  ['tag-bengal-sofa', ''],
  ['tag-tiger-blick', 'Eine getigerte Katze schaut aufmerksam.'],
  ['tag-hund-bett', 'Ein kleiner Hund schläft auf einer hellen Decke.'],
  ['tag-hund-fensterbank', 'Ein Hund liegt in der Sonne auf der Fensterbank.'],
];
const eindeutig = ablaufBilder.filter(([n], i) => ablaufBilder.findIndex(([m]) => m === n) === i);
const ablauf = `
<section class="ablauf" id="ablauf" aria-labelledby="ablauf-titel">
  <div class="ablauf__buehne" aria-hidden="true">
    ${eindeutig.map(([n], i) => `<figure class="ablauf__bild${i === 0 ? ' ist-aktiv' : ''}" data-bild="${n}">${bild(n, '', '(max-width: 900px) 100vw, 50vw')}</figure>`).join('\n    ')}
  </div>
  <div class="ablauf__text">
    <h2 id="ablauf-titel" class="titel zeige">${esc(ab.titel)}</h2>
    <ol class="schritte">
      ${ab.schritte.map((st, i) => `<li class="schritt zeige" data-zeigt="${ablaufBilder[i][0]}"><h3 class="schritt__wann">${esc(st.wann)}</h3><p>${txt(st.text)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const grossBilder = { 'Akutversorgung und Stabilisierung': ['tag-hund-kissen', 'Ein brauner Hund ruht mit dem Kopf auf einem Kissen.'], 'Durchfall und Erbrechen': ['tag-katze-schlaf-weiss', 'Eine Katze schläft auf einer weichen Decke.'], 'Schmerzbehandlung': ['tag-chihuahua-alt', 'Ein älterer Chihuahua liegt ruhig auf dem Sofa.'] };
const gross = g.leistungen.filter((l) => grossBilder[l.titel]);
const weitere = g.leistungen.filter((l) => !grossBilder[l.titel]);
const leistungen = `
<section class="leistungen hell" id="leistungen" aria-labelledby="leistungen-titel">
  <div class="abschnittkopf zeige">
    <h2 id="leistungen-titel" class="titel">Wobei ich helfe</h2>
    <a class="textlink" href="${A}leistungen/">Alle Leistungen</a>
  </div>
  <ul class="kacheln">
    ${gross.map((l) => `<li class="kachel zeige">
      <a href="${A}${l.seite}">
        <figure class="kachel__bild">${bild(grossBilder[l.titel][0], grossBilder[l.titel][1], '(max-width: 900px) 100vw, 33vw')}</figure>
        <div class="kachel__text"><h3>${esc(l.titel)}</h3><p>${esc(l.satz)}</p><span class="kachel__mehr">Mehr dazu <span aria-hidden="true">→</span></span></div>
      </a>
    </li>`).join('\n    ')}
  </ul>
  <h3 class="untertitel zeige">Weitere Leistungen</h3>
  <ul class="zeilen">
    ${weitere.map((l) => `<li class="zeige"><a href="${A}${l.seite}"><span class="zeilen__titel">${esc(l.titel)}</span><span class="zeilen__anzeichen">${esc((l.anzeichen || []).join(', '))}</span><span class="zeilen__pfeil" aria-hidden="true">→</span></a></li>`).join('\n    ')}
  </ul>
</section>`;


const t = s.tierarzt;
const tierarzt = `
<section class="tierarzt" id="tierarzt" aria-labelledby="tierarzt-titel">
  <div class="tierarzt__innen">
    <figure class="tierarzt__portraet zeige"><span class="fehlt">${esc(t.portraet)}</span><small>${esc(t.portraet_hinweis)}</small></figure>
    <div class="tierarzt__text zeige">
      <h2 id="tierarzt-titel" class="titel">${esc(t.titel)}</h2>
      <p class="tierarzt__name">${esc(t.name)}</p>
      ${t.absaetze.map((a) => `<p>${txt(a)}</p>`).join('\n      ')}
    </div>
  </div>
  <figure class="tierarzt__zitat zeige"><blockquote><p>${esc(t.zitat)}</p></blockquote><figcaption>Rasheed Al Saeed</figcaption></figure>
  <div class="tierarzt__werte zeige">
    <h3 class="untertitel">${esc(t.werte_titel)}</h3>
    <ul>${t.werte.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
    <div class="tierarzt__auto"><span class="fehlt">${esc(t.auto)}</span><p>${esc(t.auto_satz)}</p></div>
  </div>
</section>`;

const ko = s.kosten;
const kosten = `
<section class="kosten hell" id="kosten" aria-labelledby="kosten-titel">
  <div class="kosten__kopf zeige">
    <h2 id="kosten-titel" class="titel titel--mittel">${esc(ko.titel)}</h2>
    <p class="einleitung">${esc(ko.satz)}</p>
  </div>
  <dl class="preise zeige">
    ${ko.zeilen.map((z) => `<div><dt>${esc(z.was)}</dt><dd>${txt(z.wert)}</dd></div>`).join('\n    ')}
  </dl>
</section>`;

const ratBilder = { 'warnzeichen-notfall': ['tag-golden-boden', 'Ein Golden Retriever liegt auf dem Boden und schaut müde.'], 'giftig-fuer-hunde': ['tag-yorkie-verband', 'Ein kleiner Hund mit Verband am Vorderbein.'], 'schmerzen-erkennen': ['tag-katze-grau-fenster', 'Eine graue Katze liegt am Fenster.'] };
const ratgeber = `
<section class="ratgeber hell" aria-labelledby="ratgeber-titel">
  <div class="abschnittkopf zeige">
    <h2 id="ratgeber-titel" class="titel titel--mittel">Ratgeber</h2>
    <a class="textlink" href="${A}ratgeber/">Alle Artikel</a>
  </div>
  <ul class="artikel">
    ${artikel.slice(0, 3).map((r) => { const [b, alt] = ratBilder[r.datei] || ['tag-katze-grau-fenster', '']; return `<li class="zeige"><a href="${A}ratgeber/${r.datei}/">
      <figure>${bild(b, alt, '(max-width: 900px) 100vw, 33vw')}</figure>
      <p class="artikel__meta">${esc(r.lesezeit)} Min. Lesezeit</p>
      <h3>${esc(r.titel)}</h3>
    </a></li>`; }).join('\n    ')}
  </ul>
</section>`;

const fr = s.fragen;
const fragen = `
<section class="fragen hell" id="fragen" aria-labelledby="fragen-titel">
  <h2 id="fragen-titel" class="titel titel--mittel zeige">${esc(fr.titel)}</h2>
  <div class="fragen__gruppen">
    ${fr.gruppen.map((gr) => `<div class="fragen__gruppe zeige"><h3 class="beschriftung">${esc(gr.titel)}</h3>
      ${gr.liste.map((q) => `<details><summary>${esc(q.f)}</summary><p>${txt(q.a)}</p></details>`).join('\n      ')}
    </div>`).join('\n    ')}
  </div>
  <div class="fragen__mehr zeige"><h3 class="untertitel">${esc(fr.nicht_dabei.titel)}</h3><p>${txt(fr.nicht_dabei.satz)}</p></div>
</section>`;

const n = s.notfall;
const notfall = `
<section class="notfall" aria-labelledby="notfall-titel">
  <div class="zeige">
    <h2 id="notfall-titel" class="titel">${esc(n.titel)}</h2>
    <p class="notfall__text">${esc(n.text)}</p>
    <a class="grossnummer grossnummer--hell" href="${telLink}">${esc(tel)}</a>
    <p class="notfall__klinik">${esc(n.klinik)}</p>
  </div>
</section>`;

const fuss = `
<footer class="fuss">
  <div class="fuss__innen">
    <div><img src="../logo/logo-quer-original-negativ.svg" width="166" height="50" alt="Mobile Tierarztpraxis Kurpfalz, Notfall-Tierarzt Al Saeed"></div>
    <div><h2 class="beschriftung">Erreichbar</h2><p>Montag bis Freitag 9 bis 23 Uhr<br>Samstag 8 bis 12 Uhr<br>Sonntag in Ausnahmefällen</p></div>
    <div><h2 class="beschriftung">Kontakt</h2><p><a href="${telLink}">${esc(tel)}</a>${telFehlt}<br><span class="fehlt">[FEHLT: E-Mail]</span></p></div>
    <div><h2 class="beschriftung">Praxis</h2><p>Freinsheimer Str. 30<br>67245 Lambsheim</p></div>
  </div>
  <p class="fuss__recht"><a href="#">Impressum</a> <a href="#">Datenschutz</a> <span>Fotos: Pexels</span></p>
</footer>`;

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Mobile Tierarztpraxis Kurpfalz · Al Saeed</title>
<meta name="description" content="Mobiler Notfall-Tierarzt für Hunde und Katzen in Mannheim, Ludwigshafen, Heidelberg und Umgebung. Behandlung zu Hause, Montag bis Freitag bis 23 Uhr.">
<link rel="preload" href="../schriften/SourceSerif4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../schriften/AlbertSans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="img/tag-start-1800.webp" imagesrcset="img/tag-start-640.webp 640w, img/tag-start-1100.webp 1100w, img/tag-start-1800.webp 1800w" imagesizes="(max-width: 700px) 100vw, 74vw">
<link rel="icon" href="../logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="stil.css">
<script src="abend.js" defer></script>
</head>
<body>
<a class="sprung" href="#inhalt">Zum Inhalt springen</a>
${kopf}
<main id="inhalt">
${start}
${termin}
${leistungen}
${ablauf}
${tierarzt}
${einsatz}
${kosten}
${ratgeber}
${fragen}
${notfall}
</main>
${fuss}
<nav class="leiste" aria-label="Schnellkontakt"><a class="knopf knopf--hell" href="#termin">Termin anfragen</a><a class="knopf knopf--linie" href="${telLink}">Anrufen</a></nav>
</body>
</html>
`;

const ziel = join(wurzel, 'site/abend');
await mkdir(ziel, { recursive: true });
await writeFile(join(ziel, 'index.html'), html);
for (const f of ['stil.css', 'abend.js']) await cp(join(wurzel, 'src/abend', f), join(ziel, f));
for (const f of ['SourceSerif4.woff2', 'SourceSerif4-Italic.woff2', 'AlbertSans.woff2']) await cp(join(wurzel, 'schriften/woff2', f), join(wurzel, 'site/schriften', f));
console.log('site/abend/index.html gebaut');
