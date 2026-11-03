# Neues Logo „Kurpfalzvet · Mobiler Tierarzt“ (Kunde, 03.11.2026) als SVG, Originalfarben, Schrift Nunito als Pfade.
# Aufruf im Projektordner: python3 scripts/logo_kurpfalzvet.py
import sys; sys.path.insert(0, 'scripts')
import logo as L

PETROL, ORANGE, DUNKEL, CREME = '#1F6F78', '#F28C38', '#1F2D3A', '#FBE3C0'
L.ORANGE, L.KREUZ = ORANGE, DUNKEL
TITEL = 'Kurpfalzvet, mobiler Tierarzt, Hausbesuche und Notdienst'


def quer(pin, pfote, z1, gross, vet, z3):
    p1, b1 = L.text('MOBILER TIERARZT', 132, 40, 20, 800, 0.22)
    p2, b2 = L.text('Kurpfalz', 128, 100, 66, 800)
    p3, b3 = L.text('vet', 128 + b2, 100, 66, 800)
    p4, b4 = L.text('Hausbesuche und Notdienst', 131, 132, 22, 500)
    breite = 132 + max(b1, b2 + b3, b4) + 4
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {breite:.0f} 150" role="img" aria-labelledby="t"><title id="t">{TITEL}</title>'
           + L.symbol(0, 18, 120, pin, pfote, 'schnitt')
           + f'<path d="{p1}" fill="{z1}"/><path d="{p2}" fill="{gross}"/><path d="{p3}" fill="{vet}"/><path d="{p4}" fill="{z3}"/></svg>')
    return svg, breite


ziel = 'src/logo'
a, breite = quer(PETROL, '#FFFFFF', PETROL, DUNKEL, PETROL, DUNKEL)
open(f'{ziel}/logo-kurpfalzvet.svg', 'w').write(a)
open(f'{ziel}/logo-kurpfalzvet-negativ.svg', 'w').write(quer('#FFFFFF', PETROL, CREME, '#FFFFFF', CREME, '#FFFFFF')[0])
open(f'{ziel}/favicon-kurpfalzvet.svg', 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="{PETROL}"/>'
    + L.symbol(17, 11, 96, '#FFFFFF', PETROL, 'f') + '</svg>')
print('Seitenverhältnis', round(breite / 150, 3))
