// Startseite Richtung A „Auf Augenhöhe“, komplett (Phase 2). Texte aus src/inhalt/startseite.json und gemeinsam.json.
export function startseiteA({ g, r, s, esc, txt, rh, artikel = [] }) {
  const a = r.a;
  const { tel, bild } = rh;

  // Die drei häufigsten Anlässe groß, die übrigen kompakt zum Aufklappen
  const mehr = (l) => l.seite ? `
          <a class="dienst__mehr" href="${l.seite}">${esc(a.leistungen_mehr)}<span class="unsichtbar">: ${esc(l.titel)}</span><span class="pfeil" aria-hidden="true"></span></a>` : '';
  const leistungen = g.leistungen.slice(0, 3).map((l) => `
        <li class="dienst einblenden">
          <h3 class="dienst__titel">${esc(l.titel)}</h3>
          <p class="dienst__satz">${esc(l.satz)}</p>${mehr(l)}
        </li>`).join('');
  const weitere = g.leistungen.slice(3).map((l) => `
        <li>
          <details class="dienst-kurz">
            <summary><span class="dienst-kurz__titel">${esc(l.titel)}</span><span class="frage__zeichen" aria-hidden="true"></span></summary>
            <div class="dienst-kurz__text"><p>${esc(l.satz)}</p>${mehr(l)}</div>
          </details>
        </li>`).join('');

  const orte = s.einsatz.orte.map((st) => `
        <ul class="orte__stufe orte__stufe--${st.stufe}">${st.orte.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>`).join('');

  const schritte = s.ablauf.schritte.map((st) => `
        <li class="schritt einblenden">
          <p class="schritt__wann">${esc(st.wann)}</p>
          <p class="schritt__text">${txt(st.text)}</p>
        </li>`).join('');

  const kostenZeilen = s.kosten.zeilen.map((z) => `
        <div class="kosten__zeile"><dt>${esc(z.was)}</dt><dd>${txt(z.wert)}</dd></div>`).join('');

  // Häufige Fragen nach Themen
  const frage = (f) => `
        <details class="frage">
          <summary><span class="frage__text">${esc(f.f)}</span><span class="frage__zeichen" aria-hidden="true"></span></summary>
          <div class="frage__antwort"><p>${txt(f.a)}</p></div>
        </details>`;
  const fragen = s.fragen.gruppen.map((gr) => `
      <div class="fragen__gruppe einblenden">
        <h3 class="fragen__thema">${esc(gr.titel)}</h3>
        <div class="fragen__liste">${gr.liste.map(frage).join('')}
        </div>
      </div>`).join('');
  const ratgeber = artikel.slice(0, 3).map((a) => `
        <li class="ratgeber__eintrag">
          <a class="ratgeber__link" href="ratgeber/${a.slug}/"><span class="ratgeber__titel">${esc(a.titel)}</span><span class="pfeil" aria-hidden="true"></span></a>
          <p class="ratgeber__satz">${esc(a.kurz)} <span class="ratgeber__zeit">${a.lesezeit} Min.</span></p>
        </li>`).join('');


  const tiere = s.kontakt.tiere.map((t, i) => `
            <label class="wahl"><input type="radio" name="tier" value="${esc(t.toLowerCase().replace(/\s+/g, '-'))}"${i === 0 ? ' required' : ''}><span>${esc(t)}</span></label>`).join('');
  const anlaesse = `<option value="" selected disabled>${esc(s.kontakt.anlass_leer)}</option>` + [s.kontakt.anlass_erst, ...g.leistungen.map((l) => l.titel), s.kontakt.anlass_sonst].map((t) => `<option>${esc(t)}</option>`).join('');

  const plzDaten = esc(JSON.stringify(s.einsatz.plz_liste));

  return `${rh.dokument(`${g.praxisname} · Mobiler Tierarzt in Mannheim und Umgebung`, '', { beschreibung: 'Tierarzt für Hund und Katze mit Hausbesuch in Mannheim, Ludwigshafen, Heidelberg und Umgebung. Behandlung zu Hause, Mo bis Fr 9 bis 23 Uhr, Sa 8 bis 12 Uhr.' })}${rh.kopfzeile('')}
<main id="inhalt">

  <section class="start" aria-labelledby="start-titel">
    <div class="start__bild">${bild(a.foto, a.foto_alt, '100vw', { prio: true, klasse: 'auftritt' })}</div>
    <div class="start__unten">
      <div class="start__tafel auftritt auftritt--2">
        <h1 id="start-titel">${esc(a.titel)}</h1>
        <p class="start__zeile">${txt(a.unterzeile)}</p>
        <div class="start__kontakt">${tel}<a class="knopf knopf--gross" href="#kontakt">${esc(g.termin_label)}</a></div>
        <p class="start__erreichbar">${txt(s.erreichbar_zeile)}</p>
      </div>
      <aside class="kurzkosten auftritt auftritt--2" aria-labelledby="kurzkosten-titel">
        <h2 id="kurzkosten-titel" class="kurzkosten__titel">${esc(s.kosten_kurz.titel)}</h2>
        <p>${txt(s.kosten_kurz.satz)}</p>
        <a class="textlink" href="#kosten">${esc(s.kosten_kurz.link)}</a>
      </aside>
    </div>
  </section>

  <section class="kontakt" id="kontakt" aria-labelledby="kontakt-titel">
    <div class="kontakt__anfrage">
      <h2 id="kontakt-titel">${esc(s.kontakt.titel)}</h2>
      <p class="kontakt__satz">${txt(s.kontakt.satz)}</p>
      <form class="vorauswahl" action="termin/" method="get">
        <fieldset class="vorauswahl__gruppe">
          <legend class="feld__label">${esc(s.kontakt.frage_tier)}</legend>
          <div class="wahlreihe">${tiere}
          </div>
        </fieldset>
        <div class="vorauswahl__gruppe tier-anderes" hidden>
          <label class="feld__label" for="tier-anderes">${esc(s.kontakt.tier_anderes_label)}</label>
          <input class="feld feld--kurz" id="tier-anderes" name="tier_anderes" type="text" maxlength="60" autocomplete="off" aria-describedby="tier-anderes-hinweis" disabled>
          <p class="feld__hinweis" id="tier-anderes-hinweis">${esc(s.kontakt.tier_anderes_hinweis)}</p>
        </div>
        <div class="vorauswahl__gruppe">
          <label class="feld__label" for="anlass">${esc(s.kontakt.frage_anlass)}</label>
          <div class="auswahl"><select class="feld" id="anlass" name="anlass" required data-sonst="${esc(s.kontakt.anlass_sonst)}">${anlaesse}</select></div>
        </div>
        <div class="vorauswahl__gruppe anlass-text" hidden data-label-sonst="${esc(s.kontakt.anlass_sonst_label)}" data-hinweis-sonst="${esc(s.kontakt.anlass_sonst_hinweis)}" data-label="${esc(s.kontakt.anlass_text_label)}" data-hinweis="${esc(s.kontakt.anlass_text_hinweis)}">
          <label class="feld__label" for="anlass-text">${esc(s.kontakt.anlass_text_label)}</label>
          <textarea class="feld feld--text" id="anlass-text" name="anlass_text" rows="3" maxlength="300" aria-describedby="anlass-text-hinweis" disabled></textarea>
          <p class="feld__hinweis" id="anlass-text-hinweis">${esc(s.kontakt.anlass_text_hinweis)}</p>
        </div>
        <button class="knopf knopf--gross" type="submit">${esc(s.kontakt.weiter)}<span class="pfeil" aria-hidden="true"></span></button>
      </form>
    </div>
    <div class="kontakt__telefon">
      <h3>${esc(s.kontakt.telefon_titel)}</h3>
      <p>${esc(s.kontakt.telefon_satz)}</p>
      <p class="kontakt__nummer">${tel}</p>
      ${rh.zeiten()}
    </div>
  </section>

  <section class="einsatz" id="einsatz" aria-labelledby="einsatz-titel">
    <div class="einsatz__tafel einblenden">
      <h2 id="einsatz-titel">${esc(s.einsatz.titel)}</h2>
      <p class="einsatz__satz">${txt(s.einsatz.satz)}</p>
      <div class="orte" role="group" aria-label="${esc(s.einsatz.orte_titel)}">${orte}
      </div>
      <form class="plz" data-plz="${plzDaten}" data-ja="${esc(s.einsatz.antwort_ja)}" data-nein="${esc(s.einsatz.antwort_nein)}" data-fehler="${esc(s.einsatz.antwort_fehler)}" novalidate>
        <label class="feld__label" for="plz-eingabe">${esc(s.einsatz.plz_label)}</label>
        <div class="plz__zeile">
          <input class="feld" id="plz-eingabe" name="plz" inputmode="numeric" autocomplete="postal-code" maxlength="5" pattern="[0-9]{5}" aria-describedby="plz-hinweis plz-antwort">
          <button class="knopf" type="submit">${esc(s.einsatz.plz_knopf)}</button>
        </div>
        <p class="feld__hinweis" id="plz-hinweis">${esc(s.einsatz.plz_hinweis)}</p>
        <p class="plz__antwort" id="plz-antwort" role="status" aria-live="polite"></p>
      </form>
      <p class="hinweis-fehlt">${txt(s.einsatz.plz_fehlt)}</p>
    </div>
  </section>

  <section class="ablauf" id="ablauf" aria-labelledby="ablauf-titel">
    <figure class="ablauf__bild">${bild(s.ablauf.foto, s.ablauf.foto_alt, '100vw')}</figure>
    <div class="ablauf__innen">
      <div class="ablauf__tafel einblenden">
        <h2 id="ablauf-titel">${esc(s.ablauf.titel)}</h2>
        ${s.ablauf.einleitung ? `<p>${esc(s.ablauf.einleitung)}</p>` : ''}
      </div>
      <ol class="ablauf__liste">${schritte}
      </ol>
    </div>
  </section>

  <section class="leistungen" id="leistungen" aria-labelledby="leistungen-titel">
    <div class="leistungen__seite">
      <h2 id="leistungen-titel" class="einblenden">${esc(a.leistungen_titel)}</h2>
      <p class="leistungen__satz einblenden">${esc(a.leistungen_satz)}</p>
      <figure class="leistungen__bild einblenden">${bild('katze-sonnenfenster', 'Eine Katze sitzt am Fenster im Licht und schaut hinaus.', '(min-width: 900px) 34vw, 100vw')}</figure>
    </div>
    <div class="leistungen__haupt">
      <ul class="leistungen__liste">${leistungen}
      </ul>
      <h3 class="leistungen__weitere-titel einblenden">${esc(s.leistungen_weitere_titel)}</h3>
      <ul class="leistungen__weitere einblenden">${weitere}
      </ul>
    </div>
    ${g.leistungen_fehlt ? `<p class="hinweis-fehlt">${txt(g.leistungen_fehlt)}</p>` : ''}
  </section>

  <section class="tierarzt" id="tierarzt" aria-labelledby="tierarzt-titel">
    <div class="tierarzt__portraet einblenden" role="img" aria-label="Platzhalter für das Porträt des Tierarztes">
      <span class="platzhalter__titel">${esc(s.tierarzt.portraet)}</span>
      <span class="platzhalter__hinweis">${esc(s.tierarzt.portraet_hinweis)}</span>
    </div>
    <div class="tierarzt__text">
      <h2 id="tierarzt-titel" class="einblenden">${esc(s.tierarzt.titel)}</h2>
      <p class="tierarzt__name einblenden">${txt(s.tierarzt.name)}</p>
      ${s.tierarzt.absaetze.map((p) => `<p class="einblenden">${txt(p)}</p>`).join('\n      ')}
      <figure class="auto einblenden">
        <div class="auto__bild" role="img" aria-label="Platzhalter für ein Foto des Praxisautos"><span class="platzhalter__titel">${esc(s.tierarzt.auto)}</span></div>
        <figcaption>${esc(s.tierarzt.auto_satz)}</figcaption>
      </figure>
    </div>
  </section>

  <section class="kosten" id="kosten" aria-labelledby="kosten-titel">
    <h2 id="kosten-titel" class="einblenden">${esc(s.kosten.titel)}</h2>
    <p class="kosten__satz einblenden">${esc(s.kosten.satz)}</p>
    <dl class="kosten__liste einblenden">${kostenZeilen}
    </dl>
  </section>
${artikel.length ? `
  <section class="ratgeber" id="ratgeber" aria-labelledby="ratgeber-titel">
    <div class="ratgeber__kopf einblenden">
      <h2 id="ratgeber-titel">${esc(s.ratgeber.titel)}</h2>
      <p>${esc(s.ratgeber.satz)}</p>
      <a class="textlink" href="ratgeber/">${esc(s.ratgeber.link)}</a>
    </div>
    <ul class="ratgeber__liste einblenden">${ratgeber}
    </ul>
  </section>` : ''}

  <section class="fragen" id="fragen" aria-labelledby="fragen-titel">
    <h2 id="fragen-titel" class="einblenden">${esc(s.fragen.titel)}</h2>${fragen}
    <div class="fragen__nicht-dabei einblenden">
      <h3>${esc(s.fragen.nicht_dabei.titel)}</h3>
      <p>${txt(s.fragen.nicht_dabei.satz)}</p>
      <p class="fragen__nummer">${tel}</p>
    </div>
  </section>

  <section class="notfall" aria-labelledby="notfall-titel">
    <div class="notfall__innen einblenden">
      <h2 id="notfall-titel">${esc(s.notfall.titel)}</h2>
      <div class="notfall__text">
        <p>${txt(s.notfall.text)}</p>
        <p class="notfall__klinik">${txt(s.notfall.klinik)}</p>
      </div>
      <p class="notfall__nummer">${tel}</p>
    </div>
  </section>
</main>

${rh.fuss('')}${rh.leiste('')}${rh.ende}`;
}
