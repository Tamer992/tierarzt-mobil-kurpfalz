// Phase 3, Richtung A: Muster-Unterseite (Leistung), Terminanfrage, stille Seite (Abschied).
// Texte aus src/inhalt/leistung-durchfall.json, termin.json, abschied.json.

/* ---------- Muster-Unterseite einer Leistung ---------- */
export function leistungsseite({ g, s, l, esc, txt, rh }) {
  const p = '../../';
  const { tel, bild } = rh;
  const terminHref = `${p}termin/?anlass=${encodeURIComponent(l.abschluss.anlass)}`;
  const satzliste = (liste, klasse) => `<ul class="${klasse}">${liste.map((x) => `\n          <li>${txt(x)}</li>`).join('')}\n        </ul>`;
  const fragen = l.fragen.liste.map((f) => `
        <details class="frage">
          <summary><span class="frage__text">${esc(f.f)}</span><span class="frage__zeichen" aria-hidden="true"></span></summary>
          <div class="frage__antwort"><p>${txt(f.a)}</p></div>
        </details>`).join('');
  const weitere = g.leistungen.filter((x) => x.titel !== l.titel).map((x) => x.seite
    ? `<li><a class="weitere__link" href="${p}${x.seite}">${esc(x.titel)}<span class="pfeil" aria-hidden="true"></span></a></li>`
    : `<li><span class="weitere__ohne">${esc(x.titel)}</span></li>`).join('');

  return `${rh.dokument(l.seitentitel, p, { beschreibung: l.beschreibung })}${rh.kopfzeile(p)}
<main id="inhalt">
  <section class="u-start" aria-labelledby="u-titel">
    <div class="u-start__text">
      <nav class="brotkrumen auftritt" aria-label="Sie sind hier"><ol><li><a href="${p}#leistungen">${esc(l.brotkrumen)}</a></li><li aria-current="page">${esc(l.titel)}</li></ol></nav>
      <h1 id="u-titel" class="auftritt">${esc(l.titel)}</h1>
      <p class="u-start__satz auftritt auftritt--2">${txt(l.einleitung)}</p>
      <div class="start__kontakt auftritt auftritt--2">${tel}<a class="knopf knopf--gross" href="${terminHref}">${esc(g.termin_label)}</a></div>
    </div>
    <figure class="u-start__bild">${bild(l.foto, l.foto_alt, '(min-width: 900px) 42vw, 100vw', { p, prio: true, klasse: 'auftritt' })}</figure>
  </section>

  <section class="sofort" aria-labelledby="sofort-titel">
    <div class="sofort__innen einblenden">
      <div class="sofort__kopf">
        <h2 id="sofort-titel">${esc(l.sofort.titel)}</h2>
        <p>${txt(l.sofort.satz)}</p>
        <p class="sofort__nummer">${tel}</p>
      </div>
      ${satzliste(l.sofort.liste, 'satzliste')}
    </div>
    <aside class="klinikhinweis einblenden" aria-labelledby="klinik-titel">
      <h3 id="klinik-titel">${esc(l.sofort.klinik_titel)}</h3>
      <p>${txt(l.sofort.klinik)}</p>
    </aside>
  </section>

  <section class="besuch" aria-labelledby="besuch-titel">
    <h2 id="besuch-titel" class="einblenden">${esc(l.besuch.titel)}</h2>
    <div class="besuch__text">
      ${l.besuch.absaetze.map((x) => `<p class="einblenden">${txt(x)}</p>`).join('\n      ')}
      <p class="besuch__klinik einblenden">${txt(l.besuch.klinik)}</p>
    </div>
  </section>

  <section class="vorher" aria-labelledby="vorher-titel">
    <figure class="vorher__bild einblenden">${bild(l.vorher.foto, l.vorher.foto_alt, '(min-width: 900px) 40vw, 100vw', { p })}</figure>
    <div class="vorher__text">
      <h2 id="vorher-titel" class="einblenden">${esc(l.vorher.titel)}</h2>
      <div class="einblenden">${satzliste(l.vorher.liste, 'satzliste satzliste--hell')}</div>
    </div>
  </section>

  <section class="u-kosten" aria-labelledby="u-kosten-titel">
    <h2 id="u-kosten-titel" class="einblenden">${esc(l.kosten.titel)}</h2>
    <div class="einblenden">
      <p>${txt(l.kosten.satz)}</p>
      <a class="textlink" href="${p}#kosten">${esc(l.kosten.link)}</a>
    </div>
  </section>

  <section class="fragen fragen--unterseite" aria-labelledby="u-fragen-titel">
    <h2 id="u-fragen-titel" class="einblenden">${esc(l.fragen.titel)}</h2>
    <div class="fragen__liste einblenden">${fragen}
    </div>
    <p class="hinweis-fehlt">${txt(l.freigabe)}</p>
  </section>

  <section class="abschluss" aria-labelledby="abschluss-titel">
    <div class="abschluss__innen">
      <h2 id="abschluss-titel" class="einblenden">${esc(l.abschluss.titel)}</h2>
      <p class="einblenden">${txt(l.abschluss.satz)}</p>
      <div class="abschluss__kontakt einblenden">${tel}<a class="knopf knopf--gross knopf--hell" href="${terminHref}">${esc(g.termin_label)}</a></div>
    </div>
  </section>

  <nav class="weitere" aria-labelledby="weitere-titel">
    <h2 id="weitere-titel">${esc(l.weitere_titel)}</h2>
    <ul class="weitere__liste">${weitere}</ul>
  </nav>
</main>
${rh.fuss(p)}${rh.leiste(p, { terminHref })}${rh.ende}`;
}

/* ---------- Terminanfrage mit allen Zuständen ---------- */
export function terminseite({ g, s, t, esc, txt, rh }) {
  const p = '../';
  const { tel } = rh;
  const f = t.felder;
  const frei = ` <span class="feld__frei">(${esc(t.freiwillig)})</span>`;
  // Ein Textfeld mit Label, Hinweis und Fehlerzeile; Fehlertext liegt im data-Attribut und erscheint erst beim Prüfen
  const feld = (name, { typ = 'text', pflicht = true, auto = '', extra = '', klasse = '', label, versteckt = false } = {}) => {
    const d = f[name];
    const besch = [d.hinweis ? `${name}-hinweis` : '', `${name}-fehler`].filter(Boolean).join(' ');
    return `
        <div class="formfeld${klasse ? ` ${klasse}` : ''}" data-feld="${name}"${versteckt ? ' hidden' : ''}>
          <label class="feld__label" for="f-${name}">${esc(label || d.label)}${pflicht ? '' : frei}</label>
          <input class="feld" id="f-${name}" name="${name}" type="${typ}"${auto ? ` autocomplete="${auto}"` : ''}${pflicht ? ' required' : ''} aria-describedby="${besch}"${d.fehler ? ` data-fehler="${esc(d.fehler)}"` : ''}${extra}>
          ${d.hinweis ? `<p class="feld__hinweis" id="${name}-hinweis">${esc(d.hinweis)}</p>` : ''}
          <p class="feld__fehler" id="${name}-fehler" hidden></p>
        </div>`;
  };
  const wahl = (name, werte, { pflicht = false, typ = 'radio', klasse = 'wahlreihe' } = {}) => werte.map((w, i) => `
            <label class="wahl"><input type="${typ}" name="${name}" value="${esc(w)}"${pflicht && i === 0 ? ' required' : ''}><span>${esc(w)}</span></label>`).join('');
  const tiere = s.kontakt.tiere;
  const anlaesse = `<option value="">${esc(s.kontakt.anlass_leer)}</option>` + [s.kontakt.anlass_erst, ...g.leistungen.map((l) => l.titel), s.kontakt.anlass_sonst].map((x) => `<option>${esc(x)}</option>`).join('');
  const plzDaten = esc(JSON.stringify(s.einsatz.plz_liste));

  return `${rh.dokument(t.seitentitel, p)}${rh.kopfzeile(p, { termin: false })}
<main id="inhalt" class="termin">
  <div class="termin__kopf">
    <nav class="brotkrumen" aria-label="Sie sind hier"><ol><li><a href="${p}">Startseite</a></li><li aria-current="page">${esc(t.titel)}</li></ol></nav>
    <h1 id="termin-titel">${esc(t.titel)}</h1>
    <p class="termin__satz">${txt(t.satz)}</p>
  </div>

  <div class="termin__raster">
    <div class="termin__haupt">
      <p class="eilig">${txt(t.eilig)} ${tel}</p>

      <div class="fehlerliste" id="fehlerliste" tabindex="-1" role="alert" hidden data-eins="${esc(t.fehler_eins)}" data-mehr="${esc(t.fehler_mehr)}">
        <h2 class="fehlerliste__titel"></h2>
        <ul></ul>
      </div>

      <form class="anfrage" id="anfrage" action="./" method="post" novalidate data-plz="${plzDaten}" data-ausserhalb="${esc(f.plz.ausserhalb)}" data-ja="${esc(s.einsatz.antwort_ja)}" data-sonst="${esc(s.kontakt.anlass_sonst)}" data-laeuft="${esc(t.senden_laeuft)}">
        <p class="anfrage__pflicht">${esc(t.pflicht_hinweis)}</p>

        <fieldset class="gruppe">
          <legend class="gruppe__titel">${esc(t.gruppen.tier)}</legend>
          <fieldset class="formfeld formfeld--wahl" id="f-tier" data-feld="tier" aria-describedby="tier-fehler">
            <legend class="feld__label">${esc(f.tier.label)}</legend>
            <div class="wahlreihe">${tiere.map((x, i) => `
            <label class="wahl"><input type="radio" name="tier" value="${esc(x)}"${i === 0 ? ' required' : ''} data-fehler="${esc(f.tier.fehler)}"><span>${esc(x)}</span></label>`).join('')}
            </div>
            <p class="feld__fehler" id="tier-fehler" hidden></p>
          </fieldset>
          ${feld('tier_anderes', { klasse: 'formfeld--kurz', versteckt: true, extra: ' maxlength="60" disabled' }).trim()}
          <div class="formreihe">${feld('tier_name', { pflicht: false, extra: ' maxlength="40"' })}${feld('tier_alter', { pflicht: false, extra: ' maxlength="20"' })}
          </div>
        </fieldset>

        <fieldset class="gruppe">
          <legend class="gruppe__titel">${esc(t.gruppen.anlass)}</legend>
          <div class="formfeld" data-feld="anlass">
            <label class="feld__label" for="f-anlass">${esc(f.anlass.label)}</label>
            <div class="auswahl"><select class="feld" id="f-anlass" name="anlass" required aria-describedby="anlass-fehler" data-fehler="${esc(f.anlass.fehler)}">${anlaesse}</select></div>
            <p class="feld__fehler" id="anlass-fehler" hidden></p>
          </div>
          <div class="formfeld" data-feld="anlass_text" data-label="${esc(s.kontakt.anlass_text_label)}" data-hinweis="${esc(s.kontakt.anlass_text_hinweis)}" data-label-sonst="${esc(s.kontakt.anlass_sonst_label)}" data-hinweis-sonst="${esc(s.kontakt.anlass_sonst_hinweis)}">
            <label class="feld__label" for="f-anlass_text">${esc(s.kontakt.anlass_text_label)}</label>
            <textarea class="feld feld--text" id="f-anlass_text" name="anlass_text" rows="4" maxlength="600" aria-describedby="anlass_text-hinweis anlass_text-fehler" data-fehler="${esc(f.anlass_text.fehler)}"></textarea>
            <p class="feld__hinweis" id="anlass_text-hinweis">${esc(s.kontakt.anlass_text_hinweis)}</p>
            <p class="feld__fehler" id="anlass_text-fehler" hidden></p>
          </div>
          <fieldset class="formfeld formfeld--wahl">
            <legend class="feld__label">${esc(f.seit.label)}${frei}</legend>
            <div class="wahlreihe wahlreihe--klein">${wahl('seit', f.seit.werte)}
            </div>
          </fieldset>
        </fieldset>

        <fieldset class="gruppe">
          <legend class="gruppe__titel">${esc(t.gruppen.ort)}</legend>
          ${feld('strasse', { auto: 'address-line1', extra: ' maxlength="80"' }).trim()}
          <div class="formreihe formreihe--plz">${feld('plz', { auto: 'postal-code', extra: ' inputmode="numeric" maxlength="5" pattern="[0-9]{5}"' })}${feld('ort', { auto: 'address-level2', extra: ' maxlength="60"' })}
          </div>
          <p class="plzhinweis" id="plz-ausserhalb" role="status" aria-live="polite"></p>
          ${feld('zugang', { pflicht: false, extra: ' maxlength="120"' }).trim()}
        </fieldset>

        <fieldset class="gruppe">
          <legend class="gruppe__titel">${esc(t.gruppen.wann)}</legend>
          <fieldset class="formfeld formfeld--wahl" id="f-wann" data-feld="wann" aria-describedby="wann-fehler">
            <legend class="feld__label">${esc(f.wann.label)}</legend>
            <div class="wahlreihe wahlreihe--zwei">${f.wann.werte.map((x, i) => `
            <label class="wahl"><input type="radio" name="wann" value="${esc(x)}"${i === 0 ? ' required checked' : ''} data-fehler="${esc(f.wann.fehler)}"><span>${esc(x)}</span></label>`).join('')}
            </div>
            <p class="feld__fehler" id="wann-fehler" hidden></p>
          </fieldset>
          <div class="formreihe ist-bedingt" id="wunschtag" hidden>${feld('datum', { typ: 'date', extra: ' disabled' })}
            <div class="formfeld" data-feld="tageszeit">
              <label class="feld__label" for="f-tageszeit">${esc(f.tageszeit.label)}</label>
              <div class="auswahl"><select class="feld" id="f-tageszeit" name="tageszeit" disabled>${f.tageszeit.werte.map((x) => `<option>${esc(x)}</option>`).join('')}</select></div>
            </div>
          </div>
        </fieldset>

        <fieldset class="gruppe">
          <legend class="gruppe__titel">${esc(t.gruppen.sie)}</legend>
          ${feld('name', { auto: 'name', extra: ' maxlength="80"' }).trim()}
          ${feld('telefon', { typ: 'tel', auto: 'tel', extra: ' maxlength="30"' }).trim()}
          ${feld('email', { typ: 'email', pflicht: false, auto: 'email', extra: ' maxlength="120"' }).trim()}
          <div class="formfeld formfeld--haken" data-feld="datenschutz">
            <label class="haken"><input type="checkbox" id="f-datenschutz" name="datenschutz" required aria-describedby="datenschutz-fehler" data-fehler="${esc(f.datenschutz.fehler)}"><span class="haken__kasten" aria-hidden="true"></span><span class="haken__text">${esc(f.datenschutz.label)}</span></label>
            <a class="textlink textlink--klein" href="#fuss">${esc(f.datenschutz.link)}</a>
            <p class="feld__fehler" id="datenschutz-fehler" hidden></p>
          </div>
        </fieldset>

        <div class="anfrage__senden">
          <button class="knopf knopf--gross" type="submit"><span class="knopf__wort">${esc(t.senden)}</span><span class="pfeil" aria-hidden="true"></span></button>
        </div>
      </form>

      <section class="gesendet" id="gesendet" tabindex="-1" aria-labelledby="gesendet-titel" hidden data-satz="${esc(t.gesendet.satz)}">
        <h2 id="gesendet-titel">${esc(t.gesendet.titel)}</h2>
        <p class="gesendet__satz"></p>
        <h3 class="gesendet__zwischen">${esc(t.gesendet.zusammenfassung)}</h3>
        <dl class="gesendet__liste">
          ${Object.entries(t.gesendet.zeilen).map(([k, v]) => `<div><dt>${esc(v)}</dt><dd data-zeile="${k}"></dd></div>`).join('\n          ')}
        </dl>
        <p class="gesendet__nummer">${tel}</p>
        <p><a class="textlink" href="${p}">${esc(t.gesendet.zurueck)}</a></p>
        <p class="hinweis-fehlt">${txt(t.gesendet.fehlt)}</p>
      </section>
    </div>

    <aside class="termin__seite" aria-label="Telefon und Zeiten">
      <h2>${esc(t.telefon_titel)}</h2>
      <p>${txt(t.telefon_satz)}</p>
      <p class="kontakt__nummer">${tel}</p>
      ${rh.zeiten()}
      <h2 class="termin__danach">${esc(t.danach_titel)}</h2>
      <p>${txt(t.danach_satz)}</p>
    </aside>
  </div>
</main>
${rh.fuss(p)}${rh.leiste(p, { termin: false })}${rh.ende}`;
}

/* ---------- Stille Seite: Abschied zu Hause, ohne Bewegung ---------- */
export function abschiedsseite({ g, s, a, esc, txt, rh }) {
  const p = '../';
  const { tel, bild } = rh;
  const abschnitte = a.abschnitte.map((x, i) => `
    <section class="still__abschnitt" aria-labelledby="still-${i}">
      <h2 id="still-${i}">${esc(x.titel)}</h2>
      ${x.absaetze.map((y) => `<p>${txt(y)}</p>`).join('\n      ')}
    </section>`).join('');
  const terminHref = `${p}termin/?anlass=${encodeURIComponent(a.kontakt.anlass)}`;
  return `${rh.dokument(a.seitentitel, p, { beschreibung: a.beschreibung, koerper: 'ist-still' })}${rh.kopfzeile(p, { termin: false })}
<main id="inhalt" class="still">
  <header class="still__kopf">
    <h1>${esc(a.titel)}</h1>
    <p class="still__einleitung">${txt(a.einleitung)}</p>
  </header>
  <figure class="still__bild">${bild(a.foto, a.foto_alt, '(min-width: 900px) 760px, 100vw', { p, prio: true })}</figure>
  <div class="still__text">${abschnitte}
    <section class="still__kontakt" aria-labelledby="still-kontakt">
      <h2 id="still-kontakt">${esc(a.kontakt.titel)}</h2>
      <p>${txt(a.kontakt.satz)}</p>
      <p class="still__nummer">${tel}</p>
      ${rh.zeiten()}
      <p class="still__schreiben"><a class="textlink" href="${terminHref}">${esc(a.kontakt.schreiben)}</a></p>
    </section>
  </div>
</main>
${rh.fuss(p)}${rh.leiste(p, { still: true, terminHref })}${rh.ende}`;
}
