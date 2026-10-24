# Logo Mobile Tierarztpraxis Kurpfalz als SVG, nachgezeichnet nach kunde/logo/*.jpg
# Schrift Nunito (OFL), Text als Pfade, damit keine Webschrift geladen werden muss.
import re, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

QUELLE = 'kunde/logo/Nunito-wght.ttf'
PETROL, NAVY, ORANGE, PFIRSICH = '#1F6F78', '#1F2D3A', '#F18C3A', '#F6D5B0'
_cache = {}

def schrift(w):
    if w not in _cache:
        _cache[w] = instantiateVariableFont(TTFont(QUELLE), {'wght': w})
    return _cache[w]

def text(t, x, y, groesse, w, sperren=0.0):
    f = schrift(w); gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f['head'].unitsPerEm
    s = groesse / upm; teile = []; cx = x
    for ch in t:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, cx, y)))
        teile.append(re.sub(r'\d+\.\d+', lambda m: f'{float(m.group()):.1f}'.rstrip('0').rstrip('.'), pen.getCommands()))
        cx += f['hmtx'][g][0] * s + sperren * groesse
    return ' '.join(teile), cx - x - sperren * groesse

def symbol(dx, dy, h, pin, pfote, schnitt_id):
    # Grundmaß 100 x 110, skaliert auf Höhe h
    s = h / 110
    t = f'translate({dx:.2f} {dy:.2f}) scale({s:.4f})'
    pin_pfad = 'M50 108 C38 99 8 76 8 46 A42 42 0 1 1 92 46 C92 63 84 76 77 85 Z'
    pfote_teile = ('<ellipse cx="34" cy="30" rx="6.2" ry="8.4" transform="rotate(-18 34 30)"/>'
                   '<ellipse cx="45.5" cy="22" rx="6.4" ry="9"/>'
                   '<ellipse cx="58.5" cy="22" rx="6.4" ry="9"/>'
                   '<ellipse cx="69" cy="31" rx="6.2" ry="8.4" transform="rotate(18 69 31)"/>'
                   '<path d="M51.5 39 C40 39 32 47 32 56 C32 62 36 64 41 63 C45 62 48 60.5 51.5 60.5 C55 60.5 58 62 62 63 C67 64 71 62 71 56 C71 47 63 39 51.5 39 Z"/>')
    return (f'<g transform="{t}">'
            f'<mask id="{schnitt_id}"><rect x="-10" y="-10" width="130" height="130" fill="#fff"/><circle cx="80" cy="91" r="19" fill="#000"/></mask>'
            f'<path d="{pin_pfad}" fill="{pin}" mask="url(#{schnitt_id})"/>'
            f'<g fill="{pfote}" transform="translate(51.5 42) scale(0.86) translate(-51.5 -42)">{pfote_teile}</g>'
            f'<circle cx="80" cy="91" r="14.5" fill="{ORANGE}"/>'
            f'<path d="M77 82.5 h6 a1.4 1.4 0 0 1 1.4 1.4 v4.7 h4.7 a1.4 1.4 0 0 1 1.4 1.4 v2 a1.4 1.4 0 0 1 -1.4 1.4 h-4.7 v4.7 a1.4 1.4 0 0 1 -1.4 1.4 h-6 a1.4 1.4 0 0 1 -1.4 -1.4 v-4.7 h-4.7 a1.4 1.4 0 0 1 -1.4 -1.4 v-2 a1.4 1.4 0 0 1 1.4 -1.4 h4.7 v-4.7 a1.4 1.4 0 0 1 1.4 -1.4 Z" fill="{NAVY}"/>'
            '</g>')

def quer(farben, titel):
    zeile1, oben, gross, unten = farben
    p1, b1 = text('MOBILE TIERARZTPRAXIS', 132, 34, 21, 800, 0.22)
    p2, b2 = text('Kurpfalz', 128, 98, 74, 800)
    p3, b3 = text('Notfall-Tierarzt · Al Saeed', 131, 136, 26, 500)
    breite = 132 + max(b1, b2, b3) + 4
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {breite:.0f} 150" role="img" aria-labelledby="t"><title id="t">{titel}</title>'
           + symbol(0, 18, 120, zeile1, oben, 'schnitt')
           + f'<path d="{p1}" fill="{zeile1}"/><path d="{p2}" fill="{gross}"/><path d="{p3}" fill="{unten}"/></svg>')
    return svg

ziel = sys.argv[1] if len(sys.argv) > 1 else 'src/logo'
import os; os.makedirs(ziel, exist_ok=True)
titel = 'Mobile Tierarztpraxis Kurpfalz, Notfall-Tierarzt Al Saeed'
open(f'{ziel}/logo-quer.svg', 'w').write(quer((PETROL, '#FFFFFF', NAVY, NAVY), titel))
# Negativ: Pin weiß, Pfote Petrol, Zeile 1 Pfirsich, Rest weiß (wie Vorlage NEGATIV)
p1, b1 = text('MOBILE TIERARZTPRAXIS', 132, 34, 21, 800, 0.22)
p2, b2 = text('Kurpfalz', 128, 98, 74, 800)
p3, b3 = text('Notfall-Tierarzt · Al Saeed', 131, 136, 26, 500)
breite = 132 + max(b1, b2, b3) + 4
open(f'{ziel}/logo-quer-negativ.svg', 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {breite:.0f} 150" role="img" aria-labelledby="t"><title id="t">{titel}</title>'
    + symbol(0, 18, 120, '#FFFFFF', PETROL, 'schnitt')
    + f'<path d="{p1}" fill="{PFIRSICH}"/><path d="{p2}" fill="#FFFFFF"/><path d="{p3}" fill="#FFFFFF"/></svg>')
open(f'{ziel}/logo-symbol.svg', 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110" role="img" aria-label="{titel}">' + symbol(0, 0, 110, PETROL, '#FFFFFF', 's') + '</svg>')
# App-Symbol: Petrol-Quadrat, weißer Pin
open(f'{ziel}/favicon.svg', 'w').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="#1F6F78"/>' + symbol(17, 11, 96, '#FFFFFF', PETROL, 'f') + '</svg>')
print('Logo geschrieben nach', ziel)
