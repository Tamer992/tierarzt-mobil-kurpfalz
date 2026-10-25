// Menü für Tablet und Handy (unter 1100 px), gleich auf Startseite und Unterseiten.
// Fährt von rechts herein: Links, Nummer, Telefonzeiten, Termin anfragen. Steuerung in abend.js.
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const schubladeKnopf = `<button class="schublade-knopf" type="button" aria-expanded="false" aria-controls="schublade"><span class="unsichtbar">Menü öffnen</span><span class="schublade-knopf__strich"></span><span class="schublade-knopf__strich"></span></button>`;

// links: [[Titel, Ziel], …], tel: { anzeige, link, fehlt }, termin: Ziel der Terminanfrage
export function schublade({ links, tel, termin }) {
  return `
<div class="schublade" id="schublade" hidden>
  <div class="schublade__grund" data-schliessen></div>
  <nav class="schublade__tafel" aria-label="Menü">
    <button class="schublade__zu" type="button" data-schliessen>Schließen</button>
    <ul class="schublade__liste">${links.map(([t, z]) => `<li><a href="${z}">${esc(t)}</a></li>`).join('')}</ul>
    <div class="schublade__kontakt">
      <p class="schublade__titel">Lieber anrufen?</p>
      <a class="schublade__nummer" href="tel:${tel.link}">${esc(tel.anzeige)}</a>${tel.fehlt ? ' <span class="fehlt">[FEHLT: neue Nummer]</span>' : ''}
      <dl class="schublade__zeiten">
        <div><dt>Montag bis Freitag</dt><dd>9 bis 23 Uhr</dd></div>
        <div><dt>Samstag</dt><dd>8 bis 12 Uhr</dd></div>
        <div><dt>Sonntag</dt><dd>in Ausnahmefällen</dd></div>
      </dl>
      <a class="schublade__termin" href="${termin}">Termin anfragen</a>
    </div>
  </nav>
</div>`;
}
