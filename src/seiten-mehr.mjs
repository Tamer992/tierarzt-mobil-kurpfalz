// Richtung A: Übersicht der Leistungen und Ratgeber (Übersicht und Artikel).
// Texte aus src/inhalt/gemeinsam.json und src/inhalt/ratgeber/*.json.

const datumText = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
// „Schokolade und Kakao: …“ – das Stichwort vor dem Doppelpunkt fett, damit die Liste überfliegbar ist
const stichwort = (html) => html.replace(/^([^:<]{2,70}):\s/, '<strong>$1:</strong> ');
const lesezeit = (a) => `${a.lesezeit} Minute${a.lesezeit === 1 ? '' : 'n'} Lesezeit`;

// Graphit-Band mit Anrufen und Termin, wie auf der Leistungsseite
const abschluss = ({ g, esc, txt, tel }, titel, satz, terminHref) => `
  <section class="abschluss" aria-labelledby="abschluss-titel">
    <div class="abschluss__innen">
      <h2 id="abschluss-titel" class="einblenden">${esc(titel)}</h2>
      <p class="einblenden">${txt(satz)}</p>
      <div class="abschluss__kontakt einblenden">${tel}<a class="knopf knopf--gross knopf--hell" href="${terminHref}">${esc(g.termin_label)}</a></div>
    </div>
  </section>`;

/* ---------- Übersicht aller Leistungen ---------- */
export function leistungenSeite({ g, r, esc, txt, rh, satzAbschluss }) {
  const p = '../';
  const { tel } = rh;
  const liste = g.leistungen.map((l) => `
      <li class="uebersicht__eintrag einblenden">
        <h2 class="uebersicht__titel"><a href="${p}${l.seite}">${esc(l.titel)}<span class="pfeil" aria-hidden="true"></span></a></h2>
        <p class="uebersicht__satz">${esc(l.satz)}</p>${l.anzeichen ? `
        <p class="anzeichen"><span class="anzeichen__wort">Woran Sie es merken:</span> ${l.anzeichen.map(esc).join(' · ')}</p>` : ''}
      </li>`).join('');
  return `${rh.dokument('Leistungen · Mobile Tierarztpraxis Kurpfalz', p, { beschreibung: 'Tierärztliche Behandlung bei Ihnen zu Hause: Akutversorgung, Durchfall und Erbrechen, Schmerzen, Wunden, Ohren, Augen, Blase, Infektionen, Lahmheit und Abschied. Mannheim und Umgebung.' })}${rh.kopfzeile(p)}
<main id="inhalt">
  <section class="seitenkopf" aria-labelledby="seiten-titel">
    <nav class="brotkrumen auftritt" aria-label="Sie sind hier"><ol><li><a href="${p}">Startseite</a></li><li aria-current="page">Leistungen</li></ol></nav>
    <h1 id="seiten-titel" class="auftritt">${esc(r.a.leistungen_titel)}</h1>
    <p class="seitenkopf__satz auftritt auftritt--2">${esc(r.a.leistungen_satz)}</p>
  </section>
  <ul class="uebersicht">${liste}
  </ul>
${abschluss({ g, esc, txt, tel }, 'Ich komme zu Ihnen nach Hause.', satzAbschluss, `${p}termin/`)}
</main>
${rh.fuss(p)}${rh.leiste(p)}${rh.ende}`;
}

/* ---------- Ratgeber: Übersicht ---------- */
export function ratgeberSeite({ g, artikel, esc, txt, rh, satzAbschluss }) {
  const p = '../';
  const { tel } = rh;
  const liste = artikel.map((a) => `
      <li class="uebersicht__eintrag einblenden">
        <h2 class="uebersicht__titel"><a href="${a.slug}/">${esc(a.titel)}<span class="pfeil" aria-hidden="true"></span></a></h2>
        <p class="uebersicht__satz">${esc(a.kurz)}</p>
        <p class="artikel__meta"><time datetime="${a.datum}">${datumText(a.datum)}</time> · ${lesezeit(a)}</p>
      </li>`).join('');
  return `${rh.dokument('Ratgeber · Mobile Tierarztpraxis Kurpfalz', p, { beschreibung: 'Ratgeber für Hunde- und Katzenhalter: Warnzeichen für den Notfall, Gifte im Haushalt, Schmerzen erkennen. Vom mobilen Tierarzt in Mannheim.' })}${rh.kopfzeile(p)}
<main id="inhalt">
  <section class="seitenkopf" aria-labelledby="seiten-titel">
    <nav class="brotkrumen auftritt" aria-label="Sie sind hier"><ol><li><a href="${p}">Startseite</a></li><li aria-current="page">Ratgeber</li></ol></nav>
    <h1 id="seiten-titel" class="auftritt">Ratgeber</h1>
    <p class="seitenkopf__satz auftritt auftritt--2">Was Sie als Halter von Hund und Katze wissen sollten, bevor es ernst wird.</p>
  </section>
  <ul class="uebersicht">${liste}
  </ul>
${abschluss({ g, esc, txt, tel }, 'Ich komme zu Ihnen nach Hause.', satzAbschluss, `${p}termin/`)}
</main>
${rh.fuss(p)}${rh.leiste(p)}${rh.ende}`;
}

/* ---------- Ratgeber: Artikel ---------- */
export function ratgeberArtikel({ g, a, artikel, esc, txt, rh, satzAbschluss }) {
  const p = '../../';
  const { tel } = rh;
  const abschnitte = a.abschnitte.map((ab) => `
    <h2>${esc(ab.titel)}</h2>${(ab.absaetze || []).map((x) => `
    <p>${txt(x)}</p>`).join('')}${ab.liste ? `
    <ul class="satzliste">${ab.liste.map((x) => `
      <li>${stichwort(txt(x))}</li>`).join('')}
    </ul>` : ''}`).join('');
  const weitere = artikel.filter((x) => x.slug !== a.slug).map((x) => `<li><a class="weitere__link" href="${p}ratgeber/${x.slug}/">${esc(x.titel)}<span class="pfeil" aria-hidden="true"></span></a></li>`).join('');
  return `${rh.dokument(`${a.titel} · Ratgeber`, p, { beschreibung: a.kurz })}${rh.kopfzeile(p)}
<main id="inhalt">
  <article class="artikel" aria-labelledby="artikel-titel">
    <nav class="brotkrumen auftritt" aria-label="Sie sind hier"><ol><li><a href="${p}">Startseite</a></li><li><a href="${p}ratgeber/">Ratgeber</a></li><li aria-current="page">${esc(a.titel)}</li></ol></nav>
    <h1 id="artikel-titel" class="auftritt">${esc(a.titel)}</h1>
    <p class="artikel__meta auftritt"><time datetime="${a.datum}">${datumText(a.datum)}</time> · ${lesezeit(a)}</p>
    <p class="artikel__einleitung auftritt auftritt--2">${txt(a.einleitung)}</p>
    <div class="artikel__text">${abschnitte}
    </div>
    <p class="artikel__leistung">Passende Leistung: <a class="textlink" href="${p}${a.leistung}">${esc(a.leistung_titel)}</a></p>
    <p class="hinweis-fehlt">${txt(a.freigabe)}</p>
  </article>
${abschluss({ g, esc, txt, tel }, 'Ihr Tier braucht Hilfe?', satzAbschluss, `${p}termin/`)}
  <nav class="weitere" aria-labelledby="weitere-titel">
    <h2 id="weitere-titel">Weitere Artikel</h2>
    <ul class="weitere__liste">${weitere}</ul>
  </nav>
</main>
${rh.fuss(p)}${rh.leiste(p)}${rh.ende}`;
}
