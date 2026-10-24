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
