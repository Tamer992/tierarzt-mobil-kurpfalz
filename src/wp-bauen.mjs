// Baut aus den fertigen Seiten in site/abend/ ein WordPress-Theme (wp-theme/kurpfalzvet/ und .zip).
// Texte werden zu Platzhaltern {{k:datei.pfad}}, Bilder bekommen data-kv="name", Adressen werden Theme- oder Home-Adressen.
// Aufruf: node src/wp-bauen.mjs   (vorher npm run abend)
import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const wurzel = join(fileURLToPath(import.meta.url), '../..');
const site = join(wurzel, 'site');
const theme = join(wurzel, 'wp-theme/kurpfalzvet');

// 1. Texte aus den Inhaltsdateien (Reihenfolge = Vorrang bei gleichen Texten)
const dateien = ['gemeinsam', 'startseite', 'termin', 'abschied', 'praxis'];
for (const f of (await readdir(join(wurzel, 'src/inhalt'))).sort()) if (/^leistung-.+\.json$/.test(f)) dateien.push(f.replace('.json', ''));
for (const f of (await readdir(join(wurzel, 'src/inhalt/ratgeber'))).sort()) dateien.push('ratgeber/' + f.replace('.json', ''));
const blatt = new Map(); // Text -> Pfad
const lade = async (d) => JSON.parse(await readFile(join(wurzel, 'src/inhalt', d + '.json'), 'utf8'));
const lauf = (o, p, d) => {
  if (typeof o === 'string') {
    const t = o.trim();
    if (t.length >= 3 && !/^[a-z0-9_\-./:#?=+]+$/.test(t) && !t.includes('{whatsapp}') && !blatt.has(t)) blatt.set(t, p);
  } else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) lauf(v, p + '.' + k, d);
};
for (const d of dateien) lauf(await lade(d), d, d);

const ent = (s) => s.replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const benutzt = new Map(); // Pfad -> Text

// 2. Seiten einlesen
const seiten = {};
const alle = async (d, rel = '') => {
  const out = [];
  for (const e of await readdir(join(d, rel), { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...await alle(d, posix.join(rel, e.name)));
    else if (e.name === 'index.html') out.push(posix.join(rel, e.name));
  }
  return out;
};
const slots = {};
const seiteJs = await readFile(join(wurzel, 'src/js/seite.js'), 'utf8'); // site/js/seite.js entsteht erst mit npm run bauen
const seiteHash = createHash('md5').update(seiteJs).digest('hex').slice(0, 8);

function adresse(wert, seitenPfad) { // relativ zur Seite -> {{T}}/assets/... oder {{H}}/...
  if (/^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(wert)) return wert;
  const [pfad, rest = ''] = wert.split(/(?=[?#])/);
  const abs = posix.normalize(posix.join('abend', seitenPfad, pfad || '.'));
  const hinten = (pfad === '' || pfad.endsWith('/') || pfad === '.' || pfad === '..') ? '/' : '';
  const kurz = abs.replace(/\/$/, '');
  if (hinten || /\/(leistungen|ratgeber|termin|abschied)$/.test('/' + kurz) || kurz === 'abend') {
    const seite = kurz === 'abend' ? '' : kurz.replace(/^abend\//, '');
    return '{{H}}/' + seite + (seite ? '/' : '') + rest;
  }
  return '{{T}}/assets/' + kurz + rest;
}

function tokenisiere(html, seitenPfad, seitenName) {
  return html.replace(/(<(script|style)\b[\s\S]*?<\/\2>)|(<[^>]*>)|([^<]+)/g, (m, block, _n, tag, text) => {
    if (block) return block.replace(/^<[^>]*>/, (o) => tokenisiere(o, seitenPfad, seitenName));
    if (text !== undefined) {
      const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0], kern = text.trim();
      if (!kern) return text;
      const p = blatt.get(ent(kern));
      if (!p) return text;
      benutzt.set(p, ent(kern));
      return lead + `{{k:${p}}}` + trail;
    }
    // Tag: Attribute
    let t = tag;
    t = t.replace(/\s(alt|aria-label|content|title|placeholder|value|data-[\w-]+)="([^"]*)"/g, (a, n, v) => {
      const p = blatt.get(ent(v)); if (!p) return a; benutzt.set(p, ent(v)); return ` ${n}="{{k:${p}}}"`;
    });
    t = t.replace(/\s(href|src|action|imagesrcset|srcset)="([^"]*)"/g, (a, n, v) => {
      if (n === 'href') { // Telefonnummer, E-Mail, WhatsApp aus den Inhalten
        const tel = v.match(/^tel:(.+)$/), mail = v.match(/^mailto:(.+)$/);
        for (const [pre, x] of [['tel:', tel && tel[1]], ['mailto:', mail && mail[1]], ['', v]]) {
          const p = x && blatt.get(x); if (p) { benutzt.set(p, x); return ` href="${pre}{{k:${p}}}"`; }
        }
      }
      if (n === 'srcset' || n === 'imagesrcset') return ` ${n}="${v.split(',').map((x) => { const [u, ...r] = x.trim().split(/\s+/); return [adresse(u, seitenPfad), ...r].join(' '); }).join(', ')}"`;
      return ` ${n}="${adresse(v, seitenPfad)}"`;
    });
    if (/^<img\b/.test(t)) {
      const m = t.match(/\ssrc="[^"]*\/img\/([\w-]+?)-\d+\.webp"/);
      if (m) {
        const g = (n) => (t.match(new RegExp(`\\s${n}="([^"]*)"`)) || [])[1] || '';
        slots[m[1]] ??= { alt: ent(g('alt')), w: +g('width'), h: +g('height'), seite: seitenName };
        t = t.replace(/^<img/, `<img data-kv="${m[1]}"`);
      }
    }
    return t;
  });
}

await rm(join(wurzel, 'wp-theme'), { recursive: true, force: true });
await mkdir(join(theme, 'templates'), { recursive: true });
const karte = {};
const namen = { '': 'startseite' };
for (const rel of (await alle(join(site, 'abend'))).sort()) {
  const seitenPfad = posix.dirname(rel) === '.' ? '' : posix.dirname(rel);
  const datei = (seitenPfad || 'startseite').replace(/\//g, '__') + '.html';
  let html = await readFile(join(site, 'abend', rel), 'utf8');
  html = tokenisiere(html, seitenPfad, seitenPfad || 'Startseite').replace(/(seite\.js\?v=)\w+/, '$1' + seiteHash);
  if (seitenPfad === 'termin') { // echter Versand per admin-post.php, dazu ein Feld, das nur Spam-Roboter ausfüllen
    html = html.replace(/<form\b/, '<form data-senden="{{H}}/wp-admin/admin-post.php" data-sendefehler="Die Anfrage konnte gerade nicht gesendet werden. Bitte rufen Sie uns an."')
      .replace(/(<form\b[^>]*>)/, '$1<input type="hidden" name="action" value="kv_termin"><div hidden><label>Webseite<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>');
  }
  await writeFile(join(theme, 'templates', datei), html);
  karte[seitenPfad] = datei;
}

// 3. Dateien des Themes
await writeFile(join(theme, 'seiten.json'), JSON.stringify(karte, null, 1));
await writeFile(join(theme, 'slots.json'), JSON.stringify(slots, null, 1));
await writeFile(join(theme, 'content.json'), JSON.stringify(Object.fromEntries(benutzt), null, 1));
for (const f of ['style.css', 'index.php', 'functions.php', 'admin.js']) await cp(join(wurzel, 'wp-theme-src', f), join(theme, f));
await cp(join(site, 'abend'), join(theme, 'assets/abend'), { recursive: true, filter: (s) => !s.endsWith('index.html') });
await cp(join(site, 'logo'), join(theme, 'assets/logo'), { recursive: true });
await cp(join(site, 'schriften'), join(theme, 'assets/schriften'), { recursive: true });
await mkdir(join(theme, 'assets/js'), { recursive: true });
await writeFile(join(theme, 'assets/js/seite.js'), seiteJs);

const gesamt = blatt.size;
console.log(`Seiten: ${Object.keys(karte).length}, Texte erkannt: ${benutzt.size} von ${gesamt} Inhaltstexten, Bildstellen: ${Object.keys(slots).length}`);

if (process.argv.includes('--fehlend')) for (const [t, p] of blatt) if (!benutzt.has(p)) console.log(p, '=>', t.slice(0, 70));
