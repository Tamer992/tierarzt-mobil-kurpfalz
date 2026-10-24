// Startbereich „Abendlicht“: Uhrzeit in Mannheim und ob die Praxis gerade erreichbar ist. Kopfleiste beim Scrollen.
(function () {
  document.documentElement.classList.add('js');

  var kopf = document.querySelector('[data-kopf]');
  function fest() { kopf.classList.toggle('ist-fest', window.scrollY > 40); }
  if (kopf) { fest(); window.addEventListener('scroll', fest, { passive: true }); }

  var zeitEl = document.querySelector('[data-uhr-zeit]');
  var satzEl = document.querySelector('[data-uhr-satz]');
  if (!zeitEl || !satzEl || !window.Intl) return;

  // Telefonzeiten: Mo–Fr 9–23 Uhr, Sa 8–12 Uhr, So nur in Ausnahmefällen
  var ZEITEN = { 1: [9, 23], 2: [9, 23], 3: [9, 23], 4: [9, 23], 5: [9, 23], 6: [8, 12] };
  var TAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var fmt = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  var KURZ = { So: 0, Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6 };

  function jetzt() {
    var t = {}; fmt.formatToParts(new Date()).forEach(function (p) { t[p.type] = p.value; });
    return { tag: KURZ[t.weekday.replace('.', '')], std: +t.hour, min: +t.minute, text: t.hour + ':' + t.minute };
  }
  function naechster(tag) {
    for (var i = 1; i <= 7; i++) { var d = (tag + i) % 7; if (ZEITEN[d]) return { d: d, i: i }; }
  }
  function satz(j) {
    var z = ZEITEN[j.tag], m = j.std * 60 + j.min;
    if (z && m >= z[0] * 60 && m < z[1] * 60) return '<b>Jetzt erreichbar.</b> Heute bis ' + z[1] + ' Uhr.';
    if (z && m < z[0] * 60) return 'Heute ab ' + z[0] + ' Uhr erreichbar.';
    var n = naechster(j.tag);
    var wann = n.i === 1 ? 'Morgen' : TAGE[n.d];
    var so = j.tag === 6 || (j.tag === 0 && !z) ? ' Sonntags nur in Ausnahmefällen.' : '';
    return wann + ' ab ' + ZEITEN[n.d][0] + ' Uhr wieder erreichbar.' + so;
  }
  function stelle() { var j = jetzt(); zeitEl.innerHTML = j.text.replace(':', '<i>:</i>'); satzEl.innerHTML = satz(j); }
  stelle();
  setInterval(stelle, 15000);
})();
