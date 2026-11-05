// Baut aus den fertigen Seiten in site/abend/ ein WordPress-Theme (wp-theme/kurpfalzvet/ und .zip).
// Texte werden zu Platzhaltern {{k:datei.pfad}}, Bilder bekommen data-kv="name", Adressen werden Theme- oder Home-Adressen.
// Aufruf: node src/wp-bauen.mjs   (vorher npm run abend)
import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { akzeptierteOrte } from './orte.mjs';
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

// Wo steht ein Text? Für das Bedienfeld: Abschnitt, Art des Textes, sichtbar oder nicht.
let ctx;
const FEST = { footer: 'Fuß der Seite', form: 'Formular' };
const BLOCK = /^(section|header|footer|aside|nav|form|article)$/;
const VOID = new Set(['img', 'br', 'input', 'meta', 'link', 'hr', 'source', 'path', 'circle', 'rect', 'use']);
const ART = { h1: 'Große Überschrift', h2: 'Überschrift', h3: 'Zwischenüberschrift', h4: 'Zwischenüberschrift', p: 'Absatz', li: 'Listenpunkt', a: 'Link oder Knopf', button: 'Knopf', span: 'Text', small: 'Kleingedrucktes', strong: 'Text', dt: 'Beschriftung', dd: 'Angabe', summary: 'Frage', label: 'Feldbeschriftung', figcaption: 'Bildunterschrift', blockquote: 'Zitat', cite: 'Zitat-Autor', b: 'Text', em: 'Text', option: 'Auswahlpunkt', legend: 'Feldgruppe', title: 'Titel im Browser-Tab', time: 'Text', div: 'Text', td: 'Tabellenfeld', th: 'Tabellenkopf' };
const ATTR = { alt: 'Bildbeschreibung', 'aria-label': 'Hilfstext', content: 'Beschreibung für Google', title: 'Hilfstext', placeholder: 'Beispiel im Feld', value: 'Feldwert' };
const merke = (p, art, unsichtbar) => { const sec = ctx.stack.at(-1) || ctx.top; if (!ctx.h1 && ctx.cur === 'h1') ctx.h1 = benutzt.get(p); ctx.felder.push({ p, art, unsichtbar, sec }); };

function tokenisiere(html, seitenPfad, seitenName) {
  return html.replace(/(<(script|style)\b[\s\S]*?<\/\2>)|(<[^>]*>)|([^<]+)/g, (m, block, _n, tag, text) => {
    if (block) return block.replace(/^<[^>]*>/, (o) => tokenisiere(o, seitenPfad, seitenName));
    if (text !== undefined) {
      const lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0], kern = text.trim();
      if (!kern) return text;
      const p = blatt.get(ent(kern));
      if (!p) { const sc = ctx.stack.at(-1); if (sc && !sc.fix && sc.lab && ctx.curId === sc.lab) sc.name = ent(kern); return text; }
      benutzt.set(p, ent(kern));
      const sec = ctx.stack.at(-1);
      if (sec && !sec.fix && ((!sec.name && /^h[123]$/.test(ctx.cur)) || (sec.lab && ctx.curId === sec.lab))) sec.name = ent(kern);
      if (sec && sec.fix) sec.name = sec.fix;
      merke(p, ART[ctx.cur] || 'Text', ctx.cur === 'title');
      return lead + `{{k:${p}}}` + trail;
    }
    // Tag: Abschnitte mitführen, dann Attribute
    let t = tag;
    const auf = tag.match(/^<(\w+)/), zu = tag.match(/^<\/(\w+)/);
    if (auf && auf[1] === 'body') ctx.top = { name: 'Anfang der Seite' };
    if (auf && !VOID.has(auf[1])) {
      ctx.cur = auf[1]; ctx.curId = (tag.match(/\sid="([^"]*)"/) || [])[1] || '';
      if (BLOCK.test(auf[1])) ctx.stack.push({ tag: auf[1], id: (tag.match(/\sid="([^"]*)"/) || [])[1] || '', lab: (tag.match(/aria-labelledby="([^"]*)"/) || [])[1] || '', fix: /class="start\b/.test(tag) ? 'Startbereich' : '', name: FEST[auf[1]] || (auf[1] === 'header' && /class="[^"]*\bkopf\b|class="ab-kopf/.test(tag) ? 'Kopfzeile' : null) || (/^(nav|aside)$/.test(auf[1]) ? (tag.match(/aria-label="([^"]*)"/) || [])[1] || null : null) });
    }
    if (zu && BLOCK.test(zu[1])) ctx.stack.pop();
    t = t.replace(/\s(alt|aria-label|content|title|placeholder|value|data-[\w-]+)="([^"]*)"/g, (a, n, v) => {
      const p = blatt.get(ent(v)); if (!p) return a; benutzt.set(p, ent(v)); merke(p, n.startsWith('data-') ? 'Meldung im Formular' : ATTR[n] || 'Hilfstext', true); return ` ${n}="{{k:${p}}}"`;
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
        slots[m[1]] ??= { alt: ent(g('alt')), w: +g('width'), h: +g('height'), seite: seitenName, sec: ctx.stack.at(-1) || ctx.top };
        t = t.replace(/^<img/, `<img data-kv="${m[1]}"`);
      }
    }
    return t;
  });
}

await rm(join(wurzel, 'wp-theme'), { recursive: true, force: true });
await mkdir(join(theme, 'templates'), { recursive: true });
const karte = {};
const seitenInfo = [];
const REIHE = ['', 'leistungen', 'ratgeber', 'termin', 'abschied'];
const rang = (k) => { const i = REIHE.indexOf(k.split('/')[0]); return (i < 0 ? 9 : i) * 10 + (k.includes('/') ? 1 : 0); };
const namen = { '': 'startseite' };
for (const rel of (await alle(join(site, 'abend'))).sort()) {
  const seitenPfad = posix.dirname(rel) === '.' ? '' : posix.dirname(rel);
  const datei = (seitenPfad || 'startseite').replace(/\//g, '__') + '.html';
  let html = await readFile(join(site, 'abend', rel), 'utf8');
  ctx = { stack: [], cur: '', felder: [], top: { name: 'Titel und Beschreibung der Seite' }, h1: '' };
  html = tokenisiere(html, seitenPfad, seitenPfad || 'Startseite').replace(/(seite\.js\?v=)\w+/, '$1' + seiteHash);
  if (seitenPfad === 'termin') html = html.replace(/<p class="hinweis-fehlt">[\s\S]*?<\/p>/g, ''); // „Versand folgt“ gilt nur für die statische Vorschau
  if (seitenPfad === 'termin') { // echter Versand per admin-post.php, dazu ein Feld, das nur Spam-Roboter ausfüllen
    html = html.replace(/<form\b/, '<form data-senden="{{H}}/wp-admin/admin-post.php" data-sendefehler="Die Anfrage konnte gerade nicht gesendet werden. Bitte rufen Sie uns an."')
      .replace(/(<form\b[^>]*>)/, '$1<input type="hidden" name="action" value="kv_termin"><div hidden><label>Webseite<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>');
  }
  seitenInfo.push({ key: seitenPfad, titel: ctx.h1, felder: ctx.felder });
  await writeFile(join(theme, 'templates', datei), html);
  karte[seitenPfad] = datei;
}

// 3. Aufbau des Bedienfelds: Seiten, darin Abschnitte, darin Felder in der Reihenfolge der Seite
const FESTE = { '': 'Startseite', leistungen: 'Leistungen (Übersicht)', ratgeber: 'Ratgeber (Übersicht)', termin: 'Termin anfragen', abschied: 'Abschied zu Hause' };
const seitenTitel = (k, h1) => FESTE[k] ?? ((k.startsWith('leistungen/') ? 'Leistung: ' : 'Ratgeber-Artikel: ') + (h1 || k));
const secName = (x) => x.name || (x.id ? x.id.charAt(0).toUpperCase() + x.id.slice(1) : 'Anfang der Seite');
const seiteVon = new Map();
for (const pg of seitenInfo) for (const f of pg.felder) (seiteVon.get(f.p) ?? seiteVon.set(f.p, new Set()).get(f.p)).add(pg.key);
const ueberall = new Set([...seiteVon].filter(([, v]) => v.size >= 5).map(([k]) => k));
const vergeben = new Set();
function baue(id, titel, url, felder) {
  const sichtbar = new Map(), versteckt = [];
  for (const f of felder) {
    if (vergeben.has(f.p)) continue;
    vergeben.add(f.p);
    if (f.unsichtbar) { versteckt.push(f); continue; }
    if (!sichtbar.has(f.sec)) sichtbar.set(f.sec, []);
    sichtbar.get(f.sec).push(f);
  }
  const nummer = (liste) => { const z = {}; const n = {}; liste.forEach((f) => { n[f.art] = (n[f.art] || 0) + 1; }); return liste.map((f) => { z[f.art] = (z[f.art] || 0) + 1; return { p: f.p, l: f.art + (n[f.art] > 1 ? ' ' + z[f.art] : '') }; }); };
  const abschnitte = [...sichtbar].map(([sec, liste]) => ({ name: secName(sec), anker: sec.id || '', felder: nummer(liste) }));
  if (versteckt.length) abschnitte.push({ name: 'Unsichtbare Texte (Bildbeschreibungen, Hilfstexte, Meldungen)', anker: '', versteckt: true, felder: nummer(versteckt.map((f) => ({ ...f, art: f.art + ' (' + secName(f.sec) + ')' }))) });
  return { id, titel, url, abschnitte };
}
const struktur = [baue('ueberall', 'Überall auf der Seite (Menü, Kontakt, Fuß)', null, seitenInfo.flatMap((pg) => pg.felder.filter((f) => ueberall.has(f.p))))];
for (const pg of [...seitenInfo].sort((a, b) => rang(a.key) - rang(b.key) || a.key.localeCompare(b.key))) struktur.push(baue(pg.key || 'startseite', seitenTitel(pg.key, pg.titel), pg.key, pg.felder));
for (const sl of Object.values(slots)) { sl.ort = (sl.sec?.name || sl.sec?.id || 'Anfang der Seite'); delete sl.sec; }
const titelVon = Object.fromEntries(seitenInfo.map((pg) => [pg.key || '', seitenTitel(pg.key, pg.titel)]));
for (const sl of Object.values(slots)) sl.seite = titelVon[sl.seite === 'Startseite' ? '' : sl.seite] || sl.seite;
await writeFile(join(theme, 'struktur.json'), JSON.stringify(struktur, null, 1));
const bildRang = (n) => { const e = seitenInfo.findIndex((pg) => seitenTitel(pg.key, pg.titel) === slots[n].seite); return rang(seitenInfo[e]?.key ?? 'x'); };
for (const n of Object.keys(slots)) if (!slots[n].alt) slots[n].alt = 'Bild ohne Beschreibung';
const slotsSortiert = Object.fromEntries(Object.entries(slots).sort(([a], [b]) => bildRang(a) - bildRang(b)));
for (const k of Object.keys(slots)) delete slots[k]; Object.assign(slots, slotsSortiert);

// 4. Dateien des Themes
await writeFile(join(theme, 'orte.json'), JSON.stringify(akzeptierteOrte((await lade('startseite')).einsatz)));
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
