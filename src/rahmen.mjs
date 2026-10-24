// Gemeinsamer Rahmen für alle Seiten von Richtung A: Dokumentkopf, Kopfzeile, Fuß, Kontaktleiste am Handy.
// p ist der relative Weg zur Wurzel von site/a/ ('' auf der Startseite, '../' eine Ebene tiefer usw.).
export function rahmen({ g, s, esc, txt, masse }) {
  const nr = () => g.telefon_fehlt ? `<span class="fehlt" title="${esc(g.telefon_fehlt)}">${esc(g.telefon_anzeige)}</span>` : esc(g.telefon_anzeige);
  const tel = `<a class="nummer" href="tel:${g.telefon_link}">${nr()}</a>`;
  const logoAlt = 'Mobile Tierarztpraxis Kurpfalz, Notfall-Tierarzt Al Saeed';

  function bild(name, alt, sizes, { p = '', prio = false, klasse = '' } = {}) {
    const [w, h] = masse[name];
    const set = [640, 1100, 1800].map((b) => `${p}img/${name}-${b}.webp ${b}w`).join(', ');
    return `<img${klasse ? ` class="${klasse}"` : ''} src="${p}img/${name}-1100.webp" srcset="${set}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${prio ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
  }

  function dokument(titel, p, { beschreibung = '', koerper = '', css = [] } = {}) {
    return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(titel)}</title>${beschreibung ? `\n<meta name="description" content="${esc(beschreibung)}">` : ''}
<link rel="preload" href="${p}../schriften/Brygada1918.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${p}../schriften/AlbertSans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="${p}../logo/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${p}stil.css">${css.map((c) => `\n<link rel="stylesheet" href="${c}">`).join('')}
<script src="${p}../js/seite.js" defer></script>
</head>
<body${koerper ? ` class="${koerper}"` : ''}>
<a class="sprung" href="#inhalt">Zum Inhalt springen</a>`;
  }

  // Ziele der Navigation: auf der Startseite Sprungmarken, sonst zurück zur Startseite
  const navListe = (p) => s.navigation.map((n) => `<li><a href="${p ? p : ''}${n.ziel}">${esc(n.text)}</a></li>`).join('');
  const terminZiel = (p) => (p === '' ? '#kontakt' : `${p}termin/`);

  // termin: false blendet den Termin-Knopf aus (Terminseite selbst, stille Seite)
  function kopfzeile(p, { termin = true } = {}) {
    const nav = navListe(p);
    return `
<header class="kopf">
  <div class="kopf__innen">
    <a class="marke" href="${p || './'}"><img src="${p}../logo/logo-quer.svg" width="497" height="150" alt="${logoAlt}" fetchpriority="high"></a>
    <nav class="kopf__nav" aria-label="Hauptmenü"><ul>${nav}</ul></nav>
    <div class="kopf__kontakt">${tel}${termin ? `<a class="knopf" href="${terminZiel(p)}">${esc(g.termin_label)}</a>` : ''}</div>
    <button class="menueknopf" type="button" aria-expanded="false" aria-controls="handymenue"><span class="unsichtbar">Menü öffnen</span><span class="menueknopf__strich"></span><span class="menueknopf__strich"></span></button>
  </div>
  <nav class="handymenue" id="handymenue" aria-label="Menü" hidden><ul>${nav}</ul></nav>
</header>`;
  }

  const zeiten = (klasse = '') => `<table class="zeiten${klasse ? ` ${klasse}` : ''}">
        <caption>${esc(s.erreichbarkeit.titel)}</caption>
        <tbody>${s.erreichbarkeit.zeilen.map((z) => `<tr><th scope="row">${esc(z.tage)}</th><td>${txt(z.zeit)}</td></tr>`).join('')}</tbody>
      </table>`;

  function fuss(p) {
    return `
<footer class="fuss" id="fuss">
  <div class="fuss__innen">
    <div class="fuss__marke">
      <p class="marke"><img src="${p}../logo/logo-quer.svg" width="497" height="150" alt="${logoAlt}" loading="lazy"></p>
      <p>${txt(s.fuss.satz)}</p>
    </div>
    <div class="fuss__kontakt">
      <p class="fuss__nummer">${tel}</p>
      ${zeiten('zeiten--klein')}
    </div>
    <nav class="fuss__links" aria-label="Rechtliches"><ul>${s.fuss.links.map((l) => `<li><a href="#inhalt">${esc(l)}</a></li>`).join('')}</ul></nav>
  </div>
</footer>`;
  }

  // still: ruhige Fassung ohne Kobalt-Fläche; termin: false zeigt nur Anrufen
  function leiste(p, { termin = true, still = false, terminHref } = {}) {
    return `
<div class="leiste${still ? ' leiste--still' : ''}${termin ? '' : ' leiste--allein'}" role="region" aria-label="Kontakt">
  <a class="leiste__anruf" href="tel:${g.telefon_link}"><span class="leiste__wort">${esc(g.anrufen_label)}</span><span class="leiste__nr">${nr()}</span></a>${termin ? `
  <a class="leiste__termin" href="${terminHref || terminZiel(p)}">${esc(g.termin_label)}</a>` : ''}
</div>`;
  }

  const ende = `
</body>
</html>`;

  return { nr, tel, bild, dokument, kopfzeile, fuss, leiste, zeiten, terminZiel, ende };
}
