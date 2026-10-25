// Blickfang Startbereich: Das Foto steht zuerst als schmale Tür neben dem Text und öffnet sich beim
// ersten Scrollen auf die volle Breite. Nur transform, nur am Computer mit Maus, nicht bei reduzierter Bewegung.
// Ohne Skript, am Handy und bei reduzierter Bewegung steht das Foto gleich in voller Breite.
(function () {
  var start = document.querySelector('.start');
  var tuer = document.querySelector('[data-tuer]');
  var bild = document.querySelector('[data-tuer-bild]');
  if (!start || !tuer || !bild || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add('(min-width: 981px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
    var kurve = gsap.parseEase('power2.inOut');
    var m = {};
    // Tür: etwa ein Viertel der Breite, rechts der Mitte, vom Kopf bis zur Unterkante
    var messen = function () {
      var w = start.clientWidth, h = start.clientHeight;
      var tw = Math.min(w * 0.27, h * 0.6);
      var oben = Math.min(132, h * 0.14);
      var mitte = w * 0.6;
      m.sx = tw / w;
      m.sy = (h - oben) / h;
      var ox = (mitte - tw / 2) / (1 - m.sx);
      gsap.set([tuer, bild], { transformOrigin: ox + 'px 100%' });
    };
    // Rahmen und Foto gegenläufig skalieren: Das Foto bleibt stehen, nur der Ausschnitt wächst
    var stand = { p: 0 };
    var zeichnen = function () {
      var e = kurve(stand.p);
      var sx = m.sx + (1 - m.sx) * e, sy = m.sy + (1 - m.sy) * e;
      gsap.set(tuer, { scaleX: sx, scaleY: sy });
      gsap.set(bild, { scaleX: 1 / sx, scaleY: 1 / sy });
    };
    messen();
    zeichnen();
    gsap.to(stand, {
      p: 1,
      ease: 'none',
      onUpdate: zeichnen,
      scrollTrigger: {
        trigger: start,
        start: 'top top',
        end: '+=70%',
        pin: true,
        scrub: 0.6,
        onRefresh: function () { messen(); zeichnen(); }
      }
    });
    return function () { gsap.set([tuer, bild], { clearProps: 'transform,transformOrigin' }); };
  });

  // Schriften und Fotos ändern die Höhen: danach neu messen
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
