// Menü für Tablet und Handy (unter 1100 px), gleich auf Startseite und Unterseiten.
// Fährt von rechts herein: Links, Nummer, Telefonzeiten, Termin anfragen. Steuerung in abend.js.
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Menüknopf: Wort „Menü“ und zwei ungleich lange Petrol-Striche auf Hellgrau (Tamers Wahl, 25.10.2026)
const zeichen = (x = false) => `<span class="menuezeichen${x ? ' menuezeichen--x' : ''}" aria-hidden="true"><span></span><span></span></span>`;
export const schubladeKnopf = `<button class="schublade-knopf" type="button" aria-expanded="false" aria-controls="schublade">Menü${zeichen()}</button>`;

// links: [[Titel, Ziel], …], tel: { anzeige, link, fehlt }, termin: Ziel der Terminanfrage
export function schublade({ links, tel, termin }) {
  return `
<div class="schublade" id="schublade" hidden>
  <div class="schublade__grund" data-schliessen></div>
  <nav class="schublade__tafel" aria-label="Menü">
    <button class="schublade-knopf schublade__zu" type="button" data-schliessen>Schließen${zeichen(true)}</button>
    <ul class="schublade__liste">${links.map(([t, z]) => `<li><a href="${z}">${esc(t)}</a></li>`).join('')}</ul>
    <div class="schublade__kontakt">
      <p class="schublade__titel">Lieber anrufen?</p>
      <a class="schublade__nummer" href="tel:${tel.link}">${esc(tel.anzeige)}</a>${tel.fehlt ? ' <span class="fehlt">[FEHLT: neue Nummer]</span>' : ''}
      <a class="schublade__termin" href="${termin}">Termin anfragen</a>
      <dl class="schublade__zeiten">
        <div><dt>Montag bis Freitag</dt><dd>9 bis 23 Uhr</dd></div>
        <div><dt>Samstag</dt><dd>8 bis 12 Uhr</dd></div>
        <div><dt>Sonntag</dt><dd>in Ausnahmefällen</dd></div>
      </dl>
    </div>
  </nav>
</div>`;
}
