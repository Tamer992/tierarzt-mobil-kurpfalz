// Richtung „Abendlicht“: Uhr mit Erreichbarkeit, Kopfleiste, Einblenden beim Scrollen, Bildwechsel im Ablauf,
// Postleitzahl-Prüfung ohne Server und Termin-Vorauswahl.
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kopfleiste wird beim Scrollen dunkel
  var kopf = document.querySelector('[data-kopf]');
  function fest() { kopf.classList.toggle('ist-fest', window.scrollY > 40); }
  if (kopf) { fest(); window.addEventListener('scroll', fest, { passive: true }); }

  // Handy-Leiste erst zeigen, wenn die Knöpfe im Startbereich aus dem Bild sind
  var leiste = document.querySelector('.leiste');
  var startKnoepfe = document.querySelector('.start__knoepfe');
  if (leiste && startKnoepfe && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      leiste.classList.toggle('ist-sichtbar', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
    }).observe(startKnoepfe);
  } else if (leiste) { leiste.classList.add('ist-sichtbar'); }

  // Uhr: Telefonzeiten Mo–Fr 9–23 Uhr, Sa 8–12 Uhr, So nur in Ausnahmefällen
  var zeitEl = document.querySelector('[data-uhr-zeit]');
  var satzEl = document.querySelector('[data-uhr-satz]');
  if (zeitEl && satzEl && window.Intl) {
    var ZEITEN = { 1: [9, 23], 2: [9, 23], 3: [9, 23], 4: [9, 23], 5: [9, 23], 6: [8, 12] };
    var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    var KURZ = { So: 0, Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6 };
    var fmt = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    var jetzt = function () {
      var t = {}; fmt.formatToParts(new Date()).forEach(function (p) { t[p.type] = p.value; });
      return { tag: KURZ[t.weekday.replace('.', '')], std: +t.hour, min: +t.minute, text: t.hour + ':' + t.minute };
    };
    var naechster = function (tag) {
      for (var i = 1; i <= 7; i++) { var d = (tag + i) % 7; if (ZEITEN[d]) return { d: d, i: i }; }
    };
    var satz = function (j) {
      var z = ZEITEN[j.tag], m = j.std * 60 + j.min;
      if (z && m >= z[0] * 60 && m < z[1] * 60) return '<b>Jetzt erreichbar.</b> Heute bis ' + z[1] + ' Uhr.';
      if (z && m < z[0] * 60) return 'Heute ab ' + z[0] + ' Uhr erreichbar.';
      var n = naechster(j.tag);
      var wann = n.i === 1 ? 'Morgen' : TAGE[n.d];
      var so = (j.tag === 6 || j.tag === 0) ? ' Sonntags nur in Ausnahmefällen.' : '';
      return wann + ' ab ' + ZEITEN[n.d][0] + ' Uhr wieder erreichbar.' + so;
    };
    var stelle = function () { var j = jetzt(); zeitEl.innerHTML = j.text.replace(':', '<i>:</i>'); satzEl.innerHTML = satz(j); };
    stelle();
    setInterval(stelle, 15000);
  }

  // Einblenden beim Scrollen
  var zeigen = document.querySelectorAll('.zeige');
  if (!ruhig && 'IntersectionObserver' in window) {
    var beob = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ist-da'); beob.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    zeigen.forEach(function (el) { beob.observe(el); });
  } else {
    zeigen.forEach(function (el) { el.classList.add('ist-da'); });
  }

  // Ablauf: der Schritt in der Bildschirmmitte bestimmt das Bild
  var schritte = document.querySelectorAll('.schritt');
  var bilder = document.querySelectorAll('.ablauf__bild');
  if (schritte.length && bilder.length && 'IntersectionObserver' in window) {
    var aktiv = function (schritt) {
      schritte.forEach(function (s) { s.classList.toggle('ist-aktiv', s === schritt); });
      var name = schritt.getAttribute('data-zeigt');
      bilder.forEach(function (b) { b.classList.toggle('ist-aktiv', b.getAttribute('data-bild') === name); });
    };
    var mitte = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { if (e.isIntersecting) aktiv(e.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    schritte.forEach(function (s) { mitte.observe(s); });
    aktiv(schritte[0]);
  }

  // Postleitzahl prüfen, Liste im data-Attribut
  var plz = document.querySelector('.plz');
  if (plz) {
    var liste = JSON.parse(plz.getAttribute('data-plz') || '{}');
    var feld = plz.querySelector('input');
    var antwort = plz.querySelector('.plz__antwort');
    plz.addEventListener('submit', function (e) {
      e.preventDefault();
      var wert = feld.value.replace(/\D/g, '');
      antwort.classList.remove('ist-ja', 'ist-nein', 'ist-fehler');
      if (wert.length !== 5) {
        feld.setAttribute('aria-invalid', 'true');
        antwort.textContent = plz.getAttribute('data-fehler');
        antwort.classList.add('ist-fehler');
        return;
      }
      feld.removeAttribute('aria-invalid');
      if (Object.prototype.hasOwnProperty.call(liste, wert)) {
        antwort.textContent = plz.getAttribute('data-ja').replace('{ort}', liste[wert]);
        antwort.classList.add('ist-ja');
      } else {
        antwort.textContent = plz.getAttribute('data-nein');
        antwort.classList.add('ist-nein');
      }
    });
    feld.addEventListener('input', function () { feld.removeAttribute('aria-invalid'); });
  }

  // Termin-Vorauswahl: Beschreibung zum Anlass (bei „Etwas anderes“ Pflicht), Feld für ein anderes Tier
  var anlass = document.getElementById('anlass');
  var anlassText = document.querySelector('.anlass-text');
  if (anlass && anlassText) {
    var textfeld = anlassText.querySelector('textarea');
    var label = anlassText.querySelector('label');
    var hinweis = anlassText.querySelector('.hinweis');
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
