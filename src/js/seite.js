// Gemeinsames Skript der Entwürfe: Einblenden beim Scrollen, Handymenü, Bildwechsel in der Leistungsliste (C).
(function () {
  var doc = document.documentElement;
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Einblenden: nur mit Skript und ohne „Bewegung reduzieren“ verstecken
  var teile = document.querySelectorAll('.einblenden');
  if (!ruhig && 'IntersectionObserver' in window) {
    doc.classList.add('js-bewegung');
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('ist-sichtbar');
          beobachter.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    teile.forEach(function (t) { beobachter.observe(t); });
  }

  // Handymenü
  var knopf = document.querySelector('.menueknopf');
  var menue = document.getElementById('handymenue');
  if (knopf && menue) {
    var schliessen = function () {
      knopf.setAttribute('aria-expanded', 'false');
      menue.hidden = true;
      knopf.querySelector('.unsichtbar').textContent = 'Menü öffnen';
    };
    knopf.addEventListener('click', function () {
      var offen = knopf.getAttribute('aria-expanded') === 'true';
      if (offen) { schliessen(); return; }
      knopf.setAttribute('aria-expanded', 'true');
      menue.hidden = false;
      knopf.querySelector('.unsichtbar').textContent = 'Menü schließen';
      var erster = menue.querySelector('a');
      if (erster) erster.focus();
    });
    menue.addEventListener('click', function (e) { if (e.target.closest('a')) schliessen(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menue.hidden) { schliessen(); knopf.focus(); }
    });
  }

  // Richtung C: Foto zur Leistung zeigen, wenn Maus oder Fokus auf dem Eintrag liegt
  var buehne = document.querySelectorAll('.buehne__bild');
  if (buehne.length) {
    var zeige = function (n) {
      buehne.forEach(function (b) { b.classList.toggle('ist-aktiv', b.getAttribute('data-foto') === n); });
    };
    document.querySelectorAll('.index__link').forEach(function (l) {
      l.addEventListener('pointerenter', function () { zeige(l.getAttribute('data-foto')); });
      l.addEventListener('focus', function () { zeige(l.getAttribute('data-foto')); });
    });
  }
})();

// Richtung A: Postleitzahl prüfen, ohne Server, aus der Liste im data-Attribut
(function () {
  var form = document.querySelector('.plz');
  if (!form) return;
  var liste = JSON.parse(form.getAttribute('data-plz') || '{}');
  var feld = form.querySelector('input');
  var antwort = form.querySelector('.plz__antwort');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var wert = feld.value.replace(/\D/g, '');
    antwort.classList.remove('ist-ja', 'ist-nein', 'ist-fehler');
    if (wert.length !== 5) {
      feld.setAttribute('aria-invalid', 'true');
      antwort.textContent = form.getAttribute('data-fehler');
      antwort.classList.add('ist-fehler');
      return;
    }
    feld.removeAttribute('aria-invalid');
    if (Object.prototype.hasOwnProperty.call(liste, wert)) {
      antwort.textContent = form.getAttribute('data-ja').replace('{ort}', liste[wert]);
      antwort.classList.add('ist-ja');
    } else {
      antwort.textContent = form.getAttribute('data-nein');
      antwort.classList.add('ist-nein');
    }
  });
  feld.addEventListener('input', function () { if (feld.getAttribute('aria-invalid')) feld.removeAttribute('aria-invalid'); });

})();

// Termin-Vorauswahl: Beschreibung zum Anlass (bei „Etwas anderes“ Pflicht) und Feld für ein anderes Tier
(function () {
  var anlass = document.getElementById('anlass');
  var anlassText = document.querySelector('.anlass-text');
  if (anlass && anlassText) {
    var textfeld = anlassText.querySelector('textarea');
    var label = anlassText.querySelector('label');
    var hinweis = anlassText.querySelector('.feld__hinweis');
    var pruefeAnlass = function () {
      var gewaehlt = anlass.value !== '';
      var sonst = anlass.value === anlass.getAttribute('data-sonst');
      anlassText.hidden = !gewaehlt;
      textfeld.disabled = !gewaehlt;
      textfeld.required = sonst;
      label.textContent = anlassText.getAttribute(sonst ? 'data-label-sonst' : 'data-label');
      hinweis.textContent = anlassText.getAttribute(sonst ? 'data-hinweis-sonst' : 'data-hinweis');
    };
    anlass.addEventListener('change', pruefeAnlass);
    pruefeAnlass();
  }

  var tierAnderes = document.querySelector('.tier-anderes');
  var tiere = document.querySelectorAll('input[name="tier"]');
  if (tierAnderes && tiere.length) {
    var tierFeld = tierAnderes.querySelector('input');
    var pruefeTier = function () {
      var anders = document.querySelector('input[name="tier"][value="anderes-tier"]:checked') !== null;
      tierAnderes.hidden = !anders;
      tierFeld.disabled = !anders;
      tierFeld.required = anders;
    };
    tiere.forEach(function (r) { r.addEventListener('change', pruefeTier); });
    pruefeTier();
  }
})();

// Terminanfrage: Vorbelegung aus der Startseite, bedingte Felder, Prüfung am Feld, Fehlerübersicht, Zustand „gesendet“.
// Noch ohne Versand: Nach erfolgreicher Prüfung zeigt die Seite die Bestätigung.
(function () {
  var form = document.getElementById('anfrage');
  if (!form) return;
  var $ = function (sel) { return form.querySelector(sel); };
  var param = new URLSearchParams(location.search);
  var plzListe = JSON.parse(form.getAttribute('data-plz') || '{}');
  var sonst = form.getAttribute('data-sonst');
  var geprueft = false;

  // Vorbelegung: Werte aus der Vorauswahl der Startseite (tier=hund, anlass=…, anlass_text=…)
  var norm = function (s) { return String(s || '').toLowerCase().replace(/\s+/g, '-'); };
  if (param.get('tier')) {
    form.querySelectorAll('input[name="tier"]').forEach(function (r) { if (norm(r.value) === norm(param.get('tier'))) r.checked = true; });
  }
  if (param.get('tier_anderes')) $('#f-tier_anderes').value = param.get('tier_anderes');
  if (param.get('anlass')) {
    Array.prototype.forEach.call($('#f-anlass').options, function (o) { if (o.text === param.get('anlass')) o.selected = true; });
  }
  if (param.get('anlass_text')) $('#f-anlass_text').value = param.get('anlass_text');

  // Bedingte Felder
  var tierAnderes = form.querySelector('[data-feld="tier_anderes"]');
  var anlassText = form.querySelector('[data-feld="anlass_text"]');
  var wunschtag = document.getElementById('wunschtag');
  var heute = new Date(); heute.setMinutes(heute.getMinutes() - heute.getTimezoneOffset());
  var heuteText = heute.toISOString().slice(0, 10);
  $('#f-datum').min = heuteText;

  function bedingt() {
    var anders = !!form.querySelector('input[name="tier"][value="Anderes Tier"]:checked');
    tierAnderes.hidden = !anders; $('#f-tier_anderes').disabled = !anders; $('#f-tier_anderes').required = anders;
    var istSonst = $('#f-anlass').value === sonst;
    $('#f-anlass_text').required = istSonst;
    anlassText.querySelector('label').textContent = anlassText.getAttribute(istSonst ? 'data-label-sonst' : 'data-label');
    anlassText.querySelector('.feld__hinweis').textContent = anlassText.getAttribute(istSonst ? 'data-hinweis-sonst' : 'data-hinweis');
    var tag = !!form.querySelector('input[name="wann"][value="An einem bestimmten Tag"]:checked');
    wunschtag.hidden = !tag; $('#f-datum').disabled = !tag; $('#f-datum').required = tag; $('#f-tageszeit').disabled = !tag;
  }

  // Postleitzahl: Ort ergänzen und sagen, ob sie im Einsatzgebiet liegt
  var plzHinweis = document.getElementById('plz-ausserhalb');
  function plzPruefen() {
    var wert = $('#f-plz').value.replace(/\D/g, '');
    plzHinweis.className = 'plzhinweis';
    if (wert.length !== 5) { plzHinweis.textContent = ''; return; }
    if (Object.prototype.hasOwnProperty.call(plzListe, wert)) {
      if (!$('#f-ort').value.trim()) { $('#f-ort').value = plzListe[wert]; pruefeFeld('ort'); }
      plzHinweis.textContent = form.getAttribute('data-ja').replace('{ort}', plzListe[wert]);
    } else {
      plzHinweis.textContent = form.getAttribute('data-ausserhalb');
      plzHinweis.classList.add('ist-nein');
    }
  }

  // Prüfregeln je Feld; leer heißt in Ordnung
  function fehlerVon(name) {
    if (name === 'tier' || name === 'wann') {
      return form.querySelector('input[name="' + name + '"]:checked') ? '' : form.querySelector('input[name="' + name + '"]').getAttribute('data-fehler');
    }
    var el = form.elements[name];
    if (!el || el.disabled) return '';
    var meldung = el.getAttribute('data-fehler');
    if (el.type === 'checkbox') return el.checked ? '' : meldung;
    var wert = el.value.trim();
    if (!wert) return el.required ? meldung : '';
    if (name === 'plz' && !/^\d{5}$/.test(wert)) return meldung;
    if (name === 'telefon' && wert.replace(/\D/g, '').length < 6) return meldung;
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert)) return meldung;
    if (name === 'datum' && wert < heuteText) return meldung;
    return '';
  }
  var namen = ['tier', 'tier_anderes', 'anlass', 'anlass_text', 'strasse', 'plz', 'ort', 'wann', 'datum', 'name', 'telefon', 'email', 'datenschutz'];

  function pruefeFeld(name) {
    var meldung = fehlerVon(name);
    var huelle = form.querySelector('[data-feld="' + name + '"]');
    var zeile = document.getElementById(name + '-fehler');
    var felder = form.querySelectorAll('[name="' + name + '"]');
    felder.forEach(function (el) { if (meldung) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); });
    if (huelle) huelle.classList.toggle('ist-fehler', !!meldung);
    if (zeile) { zeile.textContent = meldung; zeile.hidden = !meldung; }
    return meldung;
  }

  var liste = document.getElementById('fehlerliste');
  function zeigeUebersicht(fehler) {
    if (!fehler.length) { liste.hidden = true; return; }
    var vorlage = fehler.length === 1 ? liste.getAttribute('data-eins') : liste.getAttribute('data-mehr').replace('{n}', fehler.length);
    liste.querySelector('.fehlerliste__titel').textContent = vorlage;
    var ul = liste.querySelector('ul'); ul.textContent = '';
    fehler.forEach(function (f) {
      var li = document.createElement('li'); var a = document.createElement('a');
      a.href = '#f-' + f.name; a.textContent = f.meldung; a.setAttribute('data-ziel', f.name);
      li.appendChild(a); ul.appendChild(li);
    });
    liste.hidden = false;
  }
  liste.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-ziel]'); if (!a) return;
    e.preventDefault();
    var name = a.getAttribute('data-ziel');
    var ziel = form.querySelector('input[name="' + name + '"]:not([type="radio"]), select[name="' + name + '"], textarea[name="' + name + '"]') || form.querySelector('input[name="' + name + '"]');
    var huelle = form.querySelector('[data-feld="' + name + '"]') || ziel;
    huelle.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    ziel.focus({ preventScroll: true });
  });

  function allesPruefen() {
    var fehler = [];
    namen.forEach(function (n) { var m = pruefeFeld(n); if (m) fehler.push({ name: n, meldung: m }); });
    return fehler;
  }

  // Während der Eingabe: ein Fehler verschwindet, sobald das Feld stimmt. Neue Fehler erscheinen erst beim nächsten Senden,
  // damit sich die Seite nicht unter dem Finger verschiebt.
  function aufraeumen(n) {
    if (!geprueft || !n || namen.indexOf(n) < 0 || fehlerVon(n)) return;
    pruefeFeld(n);
    var offen = namen.filter(function (x) { var h = form.querySelector('[data-feld="' + x + '"]'); return h && h.classList.contains('ist-fehler'); })
      .map(function (x) { return { name: x, meldung: fehlerVon(x) }; }).filter(function (f) { return f.meldung; });
    zeigeUebersicht(offen);
  }
  form.addEventListener('input', function (e) {
    if (e.target.name === 'plz') plzPruefen();
    aufraeumen(e.target.name);
  });
  form.addEventListener('change', function (e) {
    bedingt();
    aufraeumen(e.target.name);
  });

  var knopf = form.querySelector('button[type="submit"]');
  var wort = knopf.querySelector('.knopf__wort');
  var gesendet = document.getElementById('gesendet');

  function wertVon(name) { var el = form.elements[name]; return el && !el.disabled ? String(el.value || '').trim() : ''; }
  function zeigeGesendet() {
    var tier = wertVon('tier') === 'Anderes Tier' ? wertVon('tier_anderes') : wertVon('tier');
    if (wertVon('tier_name')) tier += ', ' + wertVon('tier_name');
    var anlass = wertVon('anlass') + (wertVon('anlass_text') ? ': ' + wertVon('anlass_text') : '');
    var wann = wertVon('wann');
    if (wertVon('datum')) {
      var d = new Date(wertVon('datum') + 'T12:00:00');
      wann = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
      if (wertVon('tageszeit') && wertVon('tageszeit') !== 'Egal') wann += ', ' + wertVon('tageszeit').toLowerCase();
    }
    var werte = { tier: tier, anlass: anlass, ort: wertVon('strasse') + ', ' + wertVon('plz') + ' ' + wertVon('ort'), wann: wann };
    gesendet.querySelectorAll('[data-zeile]').forEach(function (dd) { dd.textContent = werte[dd.getAttribute('data-zeile')] || ''; });
    gesendet.querySelector('.gesendet__satz').textContent = gesendet.getAttribute('data-satz').replace('{telefon}', wertVon('telefon'));
    form.hidden = true; liste.hidden = true;
    gesendet.hidden = false;
    gesendet.scrollIntoView({ block: 'start' });
    gesendet.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (knopf.getAttribute('aria-disabled') === 'true') return;
    geprueft = true;
    var fehler = allesPruefen();
    zeigeUebersicht(fehler);
    if (fehler.length) { liste.focus(); return; }
    // Deaktivierter Zustand, solange gesendet wird
    knopf.setAttribute('aria-disabled', 'true');
    wort.textContent = form.getAttribute('data-laeuft');
    setTimeout(zeigeGesendet, 700);
  });

  bedingt();
  plzPruefen();

  // Vorschau der Zustände für die Prüfung: ?vorschau=fehler oder ?vorschau=gesendet
  var vorschau = param.get('vorschau');
  if (vorschau === 'fehler') {
    form.elements['plz'].value = '681';
    knopf.click();
  } else if (vorschau === 'gesendet') {
    form.querySelector('input[name="tier"][value="Katze"]').checked = true;
    form.elements['tier_name'].value = 'Minka';
    $('#f-anlass').value = 'Durchfall und Erbrechen';
    form.elements['anlass_text'].value = 'Seit gestern Abend dreimal erbrochen, trinkt wenig.';
    form.elements['strasse'].value = 'Beispielweg 4';
    form.elements['plz'].value = '68159'; form.elements['ort'].value = 'Mannheim';
    form.elements['name'].value = 'Beispiel';
    form.elements['telefon'].value = '0170 000 00 00';
    form.elements['datenschutz'].checked = true;
    bedingt();
    knopf.click();
  }
})();
