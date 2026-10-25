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

  // Menü für Tablet und Handy: fährt von rechts herein, Escape und Klick daneben schließen, Tab bleibt im Menü
  var sKnopf = document.querySelector('.schublade-knopf');
  var sMenue = document.getElementById('schublade');
  if (sKnopf && sMenue) {
    var tafel = sMenue.querySelector('.schublade__tafel');
    var sZu = function (fokus) {
      sMenue.classList.remove('ist-offen');
      doc.classList.remove('schublade-offen');
      sKnopf.setAttribute('aria-expanded', 'false');
      setTimeout(function () { if (!sMenue.classList.contains('ist-offen')) sMenue.hidden = true; }, ruhig ? 0 : 400);
      if (fokus) sKnopf.focus();
    };
    sKnopf.addEventListener('click', function () {
      sMenue.hidden = false;
      sKnopf.setAttribute('aria-expanded', 'true');
      doc.classList.add('schublade-offen');
      requestAnimationFrame(function () { requestAnimationFrame(function () { sMenue.classList.add('ist-offen'); }); });
      var erster = sMenue.querySelector('.schublade__liste a');
      if (erster) erster.focus({ preventScroll: true });
    });
    // Sprungziele auf derselben Seite selbst anfahren: erst Menü zu und Scroll-Sperre weg, dann scrollen.
    // Sonst verschluckt Safari am iPhone den Sprung, weil die Seite beim Tippen noch gesperrt ist.
    sMenue.addEventListener('click', function (e) {
      if (e.target.closest('[data-schliessen]')) { sZu(true); return; }
      var a = e.target.closest('a');
      if (!a) return;
      var h = a.getAttribute('href') || '';
      var ziel = h.charAt(0) === '#' ? document.getElementById(h.slice(1)) : null;
      sZu(false);
      if (!ziel) return;
      e.preventDefault();
      requestAnimationFrame(function () {
        ziel.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
        if (history.pushState) history.pushState(null, '', h); else location.hash = h;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (sMenue.hidden) return;
      if (e.key === 'Escape') { sZu(true); return; }
      if (e.key !== 'Tab') return;
      var ziele = tafel.querySelectorAll('a, button');
      var erstes = ziele[0], letztes = ziele[ziele.length - 1];
      if (e.shiftKey && document.activeElement === erstes) { e.preventDefault(); letztes.focus(); }
      else if (!e.shiftKey && document.activeElement === letztes) { e.preventDefault(); erstes.focus(); }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', function (m) { if (m.matches && !sMenue.hidden) sZu(false); });
  }

  // Kopfzeile: Petrol-Linie gleitet unter den Punkt unter Maus oder Fokus, sonst unter den aktuellen Punkt
  var navl = document.querySelector('.navlinie');
  if (navl) {
    var strich = navl.querySelector('.navlinie__strich');
    var links = Array.prototype.slice.call(navl.querySelectorAll('a'));
    var ziel = null;
    var setze = function (a) {
      ziel = a;
      if (!a || !a.offsetWidth) { strich.style.opacity = '0'; return; }
      var n = navl.getBoundingClientRect(), r = a.getBoundingClientRect();
      strich.style.transform = 'translateX(' + (r.left - n.left) + 'px) scaleX(' + r.width + ')';
      strich.style.opacity = '1';
    };
    var aktuell = function () { return navl.querySelector('a[aria-current]'); };
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { setze(a); });
      a.addEventListener('focus', function () { setze(a); });
      a.addEventListener('blur', function () { setze(aktuell()); });
    });
    navl.addEventListener('mouseleave', function () { setze(aktuell()); });
    window.addEventListener('resize', function () { setze(ziel); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setze(ziel || aktuell()); });

    // Unterseiten: Leistungen bzw. Ratgeber markieren
    var pfad = location.pathname;
    links.forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if ((/leistungen\/$/.test(h) && /\/(leistungen|abschied)\//.test(pfad)) || (/ratgeber\/$/.test(h) && /\/ratgeber\//.test(pfad))) a.setAttribute('aria-current', 'page');
    });
    // Startseite: der Abschnitt in der Bildschirmmitte bestimmt den markierten Punkt
    var anker = links.filter(function (a) { return (a.getAttribute('href') || '').charAt(0) === '#'; });
    if (anker.length && 'IntersectionObserver' in window) {
      var markiere = function (id) {
        anker.forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
        if (!navl.matches(':hover') && !navl.contains(document.activeElement)) setze(aktuell());
      };
      var spion = new IntersectionObserver(function (e) {
        e.forEach(function (x) { if (x.isIntersecting) markiere(x.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      anker.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) spion.observe(s); });
      // Über dem Startbild ist nichts markiert
      var startBereich = document.querySelector('.start');
      if (startBereich) new IntersectionObserver(function (e) { if (e[0].isIntersecting) markiere(''); }, { rootMargin: '-45% 0px -50% 0px' }).observe(startBereich);
    }
    setze(aktuell());
  }

  // Startbereich am Handy und Tablet: Höhe von Kopf und Text bis unter die Knöpfe messen,
  // damit das Foto genau so hoch wird, dass „Termin anfragen“ im ersten Bildschirm steht (CSS in stil.css)
  var startKnoepfe = document.querySelector('.start__knoepfe');
  var startText = document.querySelector('.start__text');
  if (startKnoepfe && startText && kopf) {
    var messeStart = function () {
      if (!window.matchMedia('(max-width: 980px)').matches) return;
      var oben = startText.getBoundingClientRect().top, unten = startKnoepfe.getBoundingClientRect().bottom;
      doc.style.setProperty('--kopf-h', kopf.offsetHeight + 'px');
      doc.style.setProperty('--start-text', Math.ceil(unten - oben + 20) + 'px');
    };
    messeStart();
    window.addEventListener('resize', messeStart);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(messeStart);
  }

  // Handy-Leiste zeigen, sobald die Knöpfe im Startbereich nicht zu sehen sind:
  // nach dem Scrollen oder auf sehr kleinen Bildschirmen, auf denen sie gar nicht in den ersten Bildschirm passen
  var leiste = document.querySelector('.leiste');
  if (leiste && startKnoepfe && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      leiste.classList.toggle('ist-sichtbar', !e[0].isIntersecting);
    }, { threshold: 0.9 }).observe(startKnoepfe);
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
