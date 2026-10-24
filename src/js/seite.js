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
