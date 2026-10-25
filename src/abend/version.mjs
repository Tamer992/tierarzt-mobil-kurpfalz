// Hängt an Stil- und Skriptdateien eine Versionsnummer aus ihrem Inhalt (stil.css?v=1a2b3c4d).
// GitHub Pages erlaubt Browsern 10 Minuten Zwischenspeicher; ohne Nummer passen neue Seite und alter Stil nicht zusammen.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const nummern = new Map();
async function nummer(datei) {
  if (!nummern.has(datei)) nummern.set(datei, createHash('sha1').update(await readFile(datei)).digest('hex').slice(0, 8));
  return nummern.get(datei);
}

// html: fertige Seite, ordner: Ordner, in dem die Dateien liegen (relativ zu dem die Pfade in der Seite gelten),
// dateien: Pfade so, wie sie in href/src stehen (zum Beispiel '../../unterseiten.css')
export async function versioniere(html, ordner, dateien) {
  for (const d of dateien) {
    const v = await nummer(join(ordner, d));
    html = html.split(`"${d}"`).join(`"${d}?v=${v}"`);
  }
  return html;
}
