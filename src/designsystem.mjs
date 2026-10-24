// Phase 3: Designsystem-Seite für Richtung A. Liest die Farbvariablen direkt aus src/stil/a.css
// und rechnet die Kontraste beim Bauen aus, damit die Seite nie von der CSS-Datei abweicht.
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const kontrast = (a, b) => { const [h, d] = [lum(a), lum(b)].sort((x, y) => y - x); return (h + 0.05) / (d + 0.05); };
const zahl = (x) => x.toFixed(2).replace('.', ',');

export function designsystem({ css, schriften, esc, rh }) {
  const p = '../';
  const v = Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]));
  const WEISS = '#FFFFFE'; const RAND = '#8C9098';

  const farben = [
    ['grund', 'Grundfläche der Seite'],
    ['flaeche', 'Tafeln, Fuß, Text auf Graphit und Kobalt'],
    ['text', 'Text, Graphit-Band, Kontaktleiste'],
    ['leise', 'Nebentext, Hinweise'],
    ['akzent', 'Kobalt, nur für Anrufen und Termin'],
    ['akzent-tief', 'Kobalt bei Hover und Druck'],
    ['akzent-hell', 'Gewählte Antwort, Fokusring, Platzhalter'],
    ['fehler', 'Fehler am Feld, nie als Warnfläche'],
    ['linie', 'Haarlinien zwischen Einträgen'],
    ['leise-dunkel', 'Nebentext auf Graphit'],
  ];
  const paare = [
    ['Text auf Grundfläche', v.text, v.grund, 4.5],
    ['Text auf Tafel', v.text, v.flaeche, 4.5],
    ['Nebentext auf Grundfläche', v.leise, v.grund, 4.5],
    ['Nebentext auf Tafel', v.leise, v.flaeche, 4.5],
    ['Knopfschrift auf Kobalt', v['auf-akzent'], v.akzent, 4.5],
    ['Knopfschrift auf Kobalt (Hover)', v['auf-akzent'], v['akzent-tief'], 4.5],
    ['Kobalt-Text auf Hellblau (gewählt, Platzhalter)', v['akzent-tief'], v['akzent-hell'], 4.5],
    ['Kobalt auf Grundfläche (Fokusring)', v.akzent, v.grund, 3],
    ['Fehlertext im Feld', v.fehler, WEISS, 4.5],
    ['Fehlertext auf Tafel', v.fehler, v.flaeche, 4.5],
    ['Fehlertext auf Grundfläche', v.fehler, v.grund, 4.5],
    ['Kalk auf Graphit', v.flaeche, v.text, 4.5],
    ['Nebentext auf Graphit', v['leise-dunkel'], v.text, 4.5],
    ['Feldrand auf Feld (Bedienelement)', RAND, WEISS, 3],
  ];

  const swatches = farben.map(([k, rolle]) => `
      <li class="ds-farbe">
        <span class="ds-farbe__flaeche ds-f-${k}" aria-hidden="true"></span>
        <span class="ds-farbe__name">--${k}</span>
        <span class="ds-farbe__wert">${v[k]}</span>
        <span class="ds-farbe__rolle">${esc(rolle)}</span>
      </li>`).join('');
  const paarZeilen = paare.map(([name, vg, hg, min], i) => {
    const k = kontrast(vg, hg);
    return `<tr><th scope="row">${esc(name)}</th><td>${min === 3 ? `<span class="ds-muster ds-muster--rand ds-paar-${i}" aria-hidden="true"></span>` : `<span class="ds-muster ds-paar-${i}">Aa</span>`}</td><td>${vg} auf ${hg}</td><td class="ds-zahl">${zahl(k)} : 1</td><td>${k >= min ? `erfüllt (${String(min).replace('.', ',')} : 1)` : `<strong>verfehlt</strong>`}</td></tr>`;
  }).join('\n        ');

  const skala = [
    ['--s1', 16, 16, 'Hinweise, Knöpfe, Navigation, Tabellen', 'sans'],
    ['--s2', 18, 19, 'Fließtext', 'sans'],
    ['--s3', 22, 23, 'Fragen, Zwischenzeilen, Postleitzahl', 'serif'],
    ['--s4', 28, 28, 'Überschriften der Einträge, Nummer im Startbereich', 'serif'],
    ['--s5', 36, 40, 'Abschnittsüberschriften', 'serif'],
    ['--s6', 36, 54, 'Startbereich und Hauptabschnitte', 'serif'],
  ].map(([n, m, d, rolle, art]) => `
      <div class="ds-stufe">
        <p class="ds-stufe__mass"><code>${n}</code> ${m} px am Handy, ${d} px am Computer<br><span>${esc(rolle)}</span></p>
        <p class="ds-stufe__probe ds-probe-${n.slice(2)} ds-${art}">Ihr Tier bleibt zu Hause.</p>
      </div>`).join('');

  const abstaende = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128].map((px, i) => `
      <li><code>--a${i + 1}</code><span class="ds-abstand ds-abstand-${i + 1}" aria-hidden="true"></span><span>${px} px</span></li>`).join('');

  const zustaende = ['Ruhe', 'Hover', 'Fokus', 'Gedrückt', 'Deaktiviert'];
  const zk = { Ruhe: '', Hover: ' ist-hover', Fokus: ' ist-fokus', 'Gedrückt': ' ist-gedrueckt', Deaktiviert: '' };
  const knopfReihe = (klasse, wort) => zustaende.map((z) => `
        <div class="ds-zustand"><span class="ds-zustand__name">${z}</span><span class="knopf${klasse}${zk[z]}"${z === 'Deaktiviert' ? ' aria-disabled="true"' : ''}>${wort}</span></div>`).join('');
  const feldReihe = zustaende.filter((z) => z !== 'Gedrückt').concat(['Fehler']).map((z, i) => {
    const kl = { Hover: ' ist-hover', Fokus: ' ist-fokus' }[z] || '';
    return `
        <div class="ds-zustand ds-zustand--feld">
          <label class="feld__label" for="ds-feld-${i}">${z}</label>
          <input class="feld${kl}" id="ds-feld-${i}" type="text" value="${z === 'Ruhe' || z === 'Hover' ? '' : 'Mannheim'}"${z === 'Deaktiviert' ? ' disabled' : ''}${z === 'Fehler' ? ' aria-invalid="true" aria-describedby="ds-feld-fehler"' : ''}>
          ${z === 'Fehler' ? '<p class="feld__fehler" id="ds-feld-fehler">Bitte geben Sie Ihren Ort ein.</p>' : ''}
        </div>`;
  }).join('');

  const schriftKarten = schriften.a.map((x) => `
      <div class="ds-schrift">
        <p class="ds-schrift__probe ${x.name.startsWith('Brygada') ? 'ds-serif' : 'ds-sans'}">Äußerst ruhig, für Hund &amp; Katze · Mo bis Fr 9–23 Uhr · 68159</p>
        <h3>${esc(x.name)}</h3>
        <p>${esc(x.rolle)}. ${esc(x.warum)}</p>
        <p class="ds-klein">${esc(x.quelle)} · ${esc(x.lizenz)}, lokal eingebunden</p>
      </div>`).join('');

  const seiten = [
    ['Startseite', ''], ['Muster-Unterseite Durchfall und Erbrechen', 'leistungen/durchfall-erbrechen/'], ['Termin anfragen', 'termin/'],
    ['Termin anfragen, Zustand Fehler', 'termin/?vorschau=fehler'], ['Termin anfragen, Zustand gesendet', 'termin/?vorschau=gesendet'], ['Stille Seite Abschied zu Hause', 'abschied/'],
  ].map(([n, z]) => `<li><a class="textlink" href="${p}${z}">${esc(n)}</a></li>`).join('');

  // Farbmuster als eigene Klassen, weil die CSP Inline-Stile verbietet
  const dsCss = paare.map(([, vg, hg, min], i) => (min === 3 ? `.ds-paar-${i} { background: ${hg}; border: 3px solid ${vg}; }` : `.ds-paar-${i} { color: ${vg}; background: ${hg}; }`)).join('\n')
    + '\n' + farben.map(([k]) => `.ds-f-${k} { background: var(--${k}); }`).join('\n') + '\n';
  const html = `${rh.dokument('Designsystem · Richtung A „Auf Augenhöhe“', p, { css: ['ds.css'] })}${rh.kopfzeile(p)}
<main id="inhalt" class="ds">
  <header class="ds__kopf">
    <h1>Designsystem</h1>
    <p>Richtung A „Auf Augenhöhe“ für die Mobile Tierarztpraxis Kurpfalz. Grundlage für den zweiten Auftrag: Jeder Wert auf dieser Seite steht als Variable in <code>stil.css</code>, die Kontraste rechnet der Generator beim Bauen aus der CSS-Datei aus.</p>
    <ul class="ds__seiten">${seiten}</ul>
  </header>

  <section class="ds__abschnitt" aria-labelledby="ds-farben">
    <h2 id="ds-farben">Farben</h2>
    <p class="ds__satz">Eine Grundfläche, eine Textfarbe, ein Akzent. Kobalt erscheint nur dort, wo jemand anruft oder einen Termin anfragt. Notfall und Fehler bekommen keine Warnfläche.</p>
    <ul class="ds-farben">${swatches}
    </ul>
    <div class="ds-tabelle" tabindex="0" role="region" aria-label="Tabelle Kontraste">
      <table>
        <caption>Kontraste nach WCAG 2.1</caption>
        <thead><tr><th scope="col">Paar</th><th scope="col">Muster</th><th scope="col">Werte</th><th scope="col">Kontrast</th><th scope="col">Stufe AA</th></tr></thead>
        <tbody>
        ${paarZeilen}
        </tbody>
      </table>
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-schrift">
    <h2 id="ds-schrift">Schrift</h2>
    <p class="ds__satz">Zwei Familien, sechs feste Stufen. Überschriften mit <code>text-wrap: balance</code>, Fließtext mit <code>text-wrap: pretty</code> und höchstens 70 Zeichen pro Zeile. Ziffern in Zeiten, Preisen und Nummern tabellarisch.</p>
    <div class="ds-schriften">${schriftKarten}
    </div>
    <div class="ds-skala">${skala}
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-raster">
    <h2 id="ds-raster">Raster und Abstände</h2>
    <p class="ds__satz">Zwölf Spalten, höchstens 1280 px breit. Seitenrand 20 px am Handy und 48 px ab 900 px, Spaltenabstand 20 und 24 px. Alle Abstände folgen dem 4er-Raster.</p>
    <div class="ds-raster" aria-hidden="true">${'<span></span>'.repeat(12)}</div>
    <ul class="ds-abstaende">${abstaende}
    </ul>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-knoepfe">
    <h2 id="ds-knoepfe">Knöpfe</h2>
    <p class="ds__satz">Harte Kante mit 2 px Radius, kein Schatten. Höhe 48 px, groß 56 px. Gedrückt rückt der Knopf 1 px nach unten. Am Computer zeigt der Fokus einen Graphit-Ring mit 3 px Abstand.</p>
    <h3 class="ds__zwischen">Standard</h3>
    <div class="ds-zustaende">${knopfReihe('', 'Termin anfragen')}
    </div>
    <h3 class="ds__zwischen">Groß</h3>
    <div class="ds-zustaende">${knopfReihe(' knopf--gross', 'Anfrage senden')}
    </div>
    <h3 class="ds__zwischen">Hell auf Graphit</h3>
    <div class="ds-zustaende ds-zustaende--dunkel">${knopfReihe(' knopf--hell', 'Termin anfragen')}
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-links">
    <h2 id="ds-links">Links und Nummer</h2>
    <div class="ds-zustaende">
      <div class="ds-zustand"><span class="ds-zustand__name">Textlink, Ruhe</span><a class="textlink" href="#ds-links">Alles zur Abrechnung</a></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Textlink, Hover</span><a class="textlink ist-hover" href="#ds-links">Alles zur Abrechnung</a></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Textlink, Fokus</span><a class="textlink ist-fokus" href="#ds-links">Alles zur Abrechnung</a></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Telefonnummer</span>${rh.tel}</div>
      <div class="ds-zustand"><span class="ds-zustand__name">Mehr-Link mit Pfeil</span><a class="weitere__link" href="#ds-links">Durchfall und Erbrechen<span class="pfeil" aria-hidden="true"></span></a></div>
    </div>
    <p class="ds__satz">Die Nummer bricht nie um und steht überall als lesbarer Text. Platzhalter <span class="fehlt">[FEHLT: …]</span> sind hellblau markiert, damit sie beim Prüfen auffallen.</p>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-formular">
    <h2 id="ds-formular">Formularfelder</h2>
    <p class="ds__satz">Felder 56 px hoch, Rand 1,5 px. Fokus mit Kobalt-Rand und hellblauem Ring, Fehler mit rotbraunem Rand und dem Satz direkt unter dem Feld. Ein Fehler erscheint erst, wenn jemand senden will, und verschwindet beim Tippen.</p>
    <div class="ds-zustaende ds-zustaende--felder">${feldReihe}
    </div>
    <h3 class="ds__zwischen">Auswahl, Wahlknöpfe, Haken</h3>
    <div class="ds-zustaende ds-zustaende--felder">
      <div class="ds-zustand ds-zustand--feld"><label class="feld__label" for="ds-auswahl">Auswahl</label><div class="auswahl"><select class="feld" id="ds-auswahl"><option>Durchfall und Erbrechen</option></select></div></div>
      <div class="ds-zustand ds-zustand--feld"><label class="feld__label" for="ds-text">Mehrzeilig</label><textarea class="feld feld--text" id="ds-text" rows="3">Seit gestern Abend dreimal erbrochen, trinkt wenig.</textarea></div>
    </div>
    <div class="ds-zustaende">
      <div class="ds-zustand"><span class="ds-zustand__name">Wahl, Ruhe</span><label class="wahl ds-wahl"><input type="radio" name="ds-w1"><span>Katze</span></label></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Wahl, Hover</span><label class="wahl ds-wahl ist-hover"><input type="radio" name="ds-w2"><span>Katze</span></label></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Wahl, gewählt</span><label class="wahl ds-wahl"><input type="radio" name="ds-w3" checked><span>Katze</span></label></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Wahl, Fehler</span><label class="wahl ds-wahl ist-fehler"><input type="radio" name="ds-w4"><span>Katze</span></label></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Haken, Ruhe</span><label class="haken"><input type="checkbox"><span class="haken__kasten" aria-hidden="true"></span><span class="haken__text">Einverstanden</span></label></div>
      <div class="ds-zustand"><span class="ds-zustand__name">Haken, gesetzt</span><label class="haken"><input type="checkbox" checked><span class="haken__kasten" aria-hidden="true"></span><span class="haken__text">Einverstanden</span></label></div>
    </div>
    <h3 class="ds__zwischen">Fehlerübersicht über dem Formular</h3>
    <div class="fehlerliste ds-fehlerliste">
      <p class="fehlerliste__titel">Bitte prüfen Sie noch 2 Angaben.</p>
      <ul><li><a href="#ds-formular">Bitte geben Sie fünf Ziffern ein.</a></li><li><a href="#ds-formular">Bitte geben Sie Ihren Namen ein.</a></li></ul>
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-flaechen">
    <h2 id="ds-flaechen">Flächen und Karten</h2>
    <p class="ds__satz">Keine Kartenraster und keine weichen Schatten. Eine Seite hat höchstens eine helle Tafel und ein Graphit-Band. Die Tafel greift mit harter Kante ins Foto, wie im Startbereich.</p>
    <div class="ds-flaechen">
      <div class="ds-flaeche ds-flaeche--tafel"><h3>Tafel</h3><p>Kalk auf Grundfläche. Für Termin anfragen und den Startbereich.</p></div>
      <div class="ds-flaeche ds-flaeche--graphit"><h3>Graphit-Band</h3><p>Randlos, für den Taktwechsel in der Mitte einer Seite.</p></div>
      <div class="ds-flaeche klinikhinweis"><h3>Hinweis mit Kante</h3><p>Graphit-Kante links, für Klinik und Lebensgefahr. Keine Warnfarbe.</p></div>
      <div class="ds-flaeche tierarzt__portraet ds-platzhalter"><span class="platzhalter__titel">[FEHLT: Porträt]</span><span class="platzhalter__hinweis">Platzhalter in den Farben der Seite</span></div>
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-leiste">
    <h2 id="ds-leiste">Kontaktleiste am Handy</h2>
    <p class="ds__satz">Fest am unteren Rand, nur bei Touch-Geräten. Graphit mit Kobalt-Fläche für den Termin. Auf der Terminseite steht nur Anrufen, auf der stillen Seite ist der Termin eine ruhige Graphit-Fläche.</p>
    <div class="ds-leisten">
      <div class="leiste ds-leiste"><span class="leiste__anruf"><span class="leiste__wort">Anrufen</span><span class="leiste__nr">${rh.nr()}</span></span><span class="leiste__termin">Termin anfragen</span></div>
      <div class="leiste leiste--still ds-leiste"><span class="leiste__anruf"><span class="leiste__wort">Anrufen</span><span class="leiste__nr">${rh.nr()}</span></span><span class="leiste__termin">Termin anfragen</span></div>
      <div class="leiste leiste--allein ds-leiste"><span class="leiste__anruf"><span class="leiste__wort">Anrufen</span><span class="leiste__nr">${rh.nr()}</span></span></div>
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-bewegung">
    <h2 id="ds-bewegung">Bewegung</h2>
    <div class="ds-tabelle" tabindex="0" role="region" aria-label="Tabelle Bewegung">
      <table>
        <caption>Nur <code>transform</code> und <code>opacity</code></caption>
        <thead><tr><th scope="col">Was</th><th scope="col">Dauer</th><th scope="col">Kurve</th></tr></thead>
        <tbody>
          <tr><th scope="row">Texte und Fotos beim Erscheinen</th><td class="ds-zahl">900 ms</td><td><code>cubic-bezier(0.16, 1, 0.3, 1)</code>, Anlauf sofort</td></tr>
          <tr><th scope="row">Hover, Fokus, Farbwechsel</th><td class="ds-zahl">300 ms</td><td><code>cubic-bezier(0.25, 1, 0.5, 1)</code></td></tr>
          <tr><th scope="row">Knopf gedrückt</th><td class="ds-zahl">120 ms</td><td><code>cubic-bezier(0.25, 1, 0.5, 1)</code></td></tr>
          <tr><th scope="row">Stille Seite</th><td class="ds-zahl">0 ms</td><td>keine Bewegung</td></tr>
          <tr><th scope="row">„Bewegung reduzieren“ im System</th><td class="ds-zahl">0 ms</td><td>alles sofort sichtbar</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="ds__abschnitt" aria-labelledby="ds-fotos">
    <h2 id="ds-fotos">Fotos und Logo</h2>
    <p class="ds__satz">Hunde und Katzen zu Hause, Tageslicht, Kamera auf Höhe des Tieres. Alle Fotos laufen durch <code>scripts/fotos.py</code> (Sättigung 0,86, Kontrast 0,96, leicht kühl) und liegen in 640, 1100 und 1800 px als WebP vor. Kein Mensch im Kittel, kein Stethoskop. Das Logo steht in den Seitenfarben in <code>logo/</code>: quer, quer negativ, Symbol, Favicon.</p>
    <div class="ds-logos">
      <img src="${p}../logo/logo-quer.svg" width="497" height="150" alt="Logo quer">
      <span class="ds-logos__dunkel"><img src="${p}../logo/logo-quer-negativ.svg" width="497" height="150" alt="Logo quer, negativ"></span>
      <img src="${p}../logo/logo-symbol.svg" width="100" height="110" alt="Logo-Symbol">
    </div>
  </section>
</main>
${rh.fuss(p)}${rh.leiste(p)}${rh.ende}`;
  return { html, css: dsCss };
}
