// Startseite Richtung A „Auf Augenhöhe“, komplett (Phase 2). Texte aus src/inhalt/startseite.json und gemeinsam.json.
export function startseiteA({ g, r, s, esc, txt, bild, nr, tel, kopf }) {
  const a = r.a;
  const nav = s.navigation.map((n) => `<li><a href="${n.ziel}">${esc(n.text)}</a></li>`).join('');

  const leistungen = g.leistungen.map((l) => `
        <li class="dienst einblenden">
          <h3 class="dienst__titel">${esc(l.titel)}</h3>
          <p class="dienst__satz">${esc(l.satz)}</p>
        </li>`).join('');

  const schritte = s.ablauf.schritte.map((st) => `
        <li class="schritt einblenden">
          <p class="schritt__wann">${esc(st.wann)}</p>
          <p class="schritt__text">${txt(st.text)}</p>
        </li>`).join('');

  const kostenZeilen = s.kosten.zeilen.map((z) => `
        <div class="kosten__zeile"><dt>${esc(z.was)}</dt><dd>${txt(z.wert)}</dd></div>`).join('');

  const fragen = s.fragen.liste.map((f) => `
        <details class="frage">
          <summary><span class="frage__text">${esc(f.f)}</span><span class="frage__zeichen" aria-hidden="true"></span></summary>
          <div class="frage__antwort"><p>${txt(f.a)}</p></div>
        </details>`).join('');

  const zeiten = s.erreichbarkeit.zeilen.map((z) => `<tr><th scope="row">${esc(z.tage)}</th><td>${txt(z.zeit)}</td></tr>`).join('');

  const tiere = s.kontakt.tiere.map((t, i) => `
            <label class="wahl"><input type="radio" name="tier" value="${esc(t.toLowerCase().replace(/\s+/g, '-'))}"${i === 0 ? ' required' : ''}><span>${esc(t)}</span></label>`).join('');
  const anlaesse = `<option value="" selected disabled>${esc(s.kontakt.anlass_leer)}</option>` + [s.kontakt.anlass_erst, ...g.leistungen.map((l) => l.titel), s.kontakt.anlass_sonst].map((t) => `<option>${esc(t)}</option>`).join('');

  const plzDaten = esc(JSON.stringify(s.einsatz.plz_liste));

  return `${kopf(`${g.praxisname} · Mobiler Tierarzt in Mannheim und Umgebung`, { schrift: 'Brygada1918.woff2' })}
<header class="kopf">
  <div class="kopf__innen">
    <a class="marke" href="./"><span class="marke__1">${esc(g.marke_zeile1)}</span><span class="marke__2">${esc(g.marke_zeile2)}</span></a>
    <nav class="kopf__nav" aria-label="Hauptmenü"><ul>${nav}</ul></nav>
    <div class="kopf__kontakt">${tel}<a class="knopf" href="#kontakt">${esc(g.termin_label)}</a></div>
    <button class="menueknopf" type="button" aria-expanded="false" aria-controls="handymenue"><span class="unsichtbar">Menü öffnen</span><span class="menueknopf__strich"></span><span class="menueknopf__strich"></span></button>
  </div>
  <nav class="handymenue" id="handymenue" aria-label="Menü" hidden><ul>${nav}</ul></nav>
</header>
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

  <section class="ablauf" id="ablauf" aria-labelledby="ablauf-titel">
    <div class="ablauf__kopf">
      <h2 id="ablauf-titel" class="einblenden">${esc(s.ablauf.titel)}</h2>
      ${s.ablauf.einleitung ? `<p class="einblenden">${esc(s.ablauf.einleitung)}</p>` : ''}
      <figure class="ablauf__bild einblenden">${bild(s.ablauf.foto, s.ablauf.foto_alt, '(min-width: 900px) 30vw, 100vw')}</figure>
    </div>
    <ol class="ablauf__liste">${schritte}
    </ol>
  </section>

  <section class="leistungen" id="leistungen" aria-labelledby="leistungen-titel">
    <div class="leistungen__seite">
      <h2 id="leistungen-titel" class="einblenden">${esc(a.leistungen_titel)}</h2>
      <p class="leistungen__satz einblenden">${esc(a.leistungen_satz)}</p>
      <figure class="leistungen__bild einblenden">${bild('katze-sonnenfenster', 'Eine Katze sitzt am Fenster im Licht und schaut hinaus.', '(min-width: 900px) 34vw, 100vw')}</figure>
    </div>
    <ul class="leistungen__liste">${leistungen}
    </ul>
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

  <section class="einsatz" id="einsatz" aria-labelledby="einsatz-titel">
    <div class="einsatz__tafel einblenden">
      <h2 id="einsatz-titel">${esc(s.einsatz.titel)}</h2>
      <p class="einsatz__satz">${txt(s.einsatz.satz)}</p>
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

  <section class="kosten" id="kosten" aria-labelledby="kosten-titel">
    <h2 id="kosten-titel" class="einblenden">${esc(s.kosten.titel)}</h2>
    <p class="kosten__satz einblenden">${esc(s.kosten.satz)}</p>
    <dl class="kosten__liste einblenden">${kostenZeilen}
    </dl>
  </section>

  <section class="fragen" id="fragen" aria-labelledby="fragen-titel">
    <h2 id="fragen-titel" class="einblenden">${esc(s.fragen.titel)}</h2>
    <div class="fragen__liste einblenden">${fragen}
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
        <div class="vorauswahl__gruppe">
          <label class="feld__label" for="anlass">${esc(s.kontakt.frage_anlass)}</label>
          <div class="auswahl"><select class="feld" id="anlass" name="anlass" required>${anlaesse}</select></div>
        </div>
        <button class="knopf knopf--gross" type="submit">${esc(s.kontakt.weiter)}<span class="pfeil" aria-hidden="true"></span></button>
      </form>
    </div>
    <div class="kontakt__telefon">
      <h3>${esc(s.kontakt.telefon_titel)}</h3>
      <p>${esc(s.kontakt.telefon_satz)}</p>
      <p class="kontakt__nummer">${tel}</p>
      <table class="zeiten">
        <caption>${esc(s.erreichbarkeit.titel)}</caption>
        <tbody>${zeiten}</tbody>
      </table>
    </div>
  </section>
</main>

<footer class="fuss" id="fuss">
  <div class="fuss__innen">
    <div class="fuss__marke">
      <p class="marke"><span class="marke__1">${esc(g.marke_zeile1)}</span><span class="marke__2">${esc(g.marke_zeile2)}</span></p>
      <p>${txt(s.fuss.satz)}</p>
    </div>
    <div class="fuss__kontakt">
      <p class="fuss__nummer">${tel}</p>
      <table class="zeiten zeiten--klein">
        <caption>${esc(s.erreichbarkeit.titel)}</caption>
        <tbody>${zeiten}</tbody>
      </table>
    </div>
    <nav class="fuss__links" aria-label="Rechtliches"><ul>${s.fuss.links.map((l) => `<li><a href="#inhalt">${esc(l)}</a></li>`).join('')}</ul></nav>
  </div>
</footer>
<div class="leiste" role="region" aria-label="Kontakt">
  <a class="leiste__anruf" href="tel:${g.telefon_link}"><span class="leiste__wort">${esc(g.anrufen_label)}</span><span class="leiste__nr">${nr()}</span></a>
  <a class="leiste__termin" href="#kontakt">${esc(g.termin_label)}</a>
</div>
</body>
</html>`;
}
