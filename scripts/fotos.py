# Gleicht die Fotos je Richtung an (Farbstimmung, Kontrast) und schreibt WebP in drei Breiten nach site/<r>/img/
from PIL import Image, ImageEnhance, ImageOps
import os, sys
STIL = {
  # Sättigung, Kontrast, Helligkeit, Tönung (r,g,b Multiplikator), Mischung Tönung
  'a': dict(sat=0.86, con=0.96, hel=1.03, ton=(0.98,1.0,1.03)),   # Tageslicht, leicht kühl, ruhig
  'b': dict(sat=0.72, con=0.92, hel=1.03, ton=(1.04,1.0,0.97)),   # weich, warm, gedämpft
  'c': dict(sat=0.92, con=1.06, hel=0.99, ton=(1.05,1.0,0.94)),   # Abendlicht, warm, mehr Tiefe
}
JE = {
  'a': ['hund-teppich','katze-sonnenfenster','katze-unter-decke','hund-senior-boden','katze-sofa','hund-boden2'],
  'b': ['katze-sonnenfenster','katzen-sofa-licht','katze-fensterbank-schlaf','hund-boden'],
  'c': ['hund-fenster','katze-unter-decke','katze-sofa','hund-boden2','hund-teppich','katze-grau-fenster','hund-senior-boden'],
}
def stil(im, s):
    im = ImageEnhance.Color(im).enhance(s['sat'])
    im = ImageEnhance.Contrast(im).enhance(s['con'])
    im = ImageEnhance.Brightness(im).enhance(s['hel'])
    r,g,b = im.split(); t=s['ton']
    r=r.point(lambda v: min(255,int(v*t[0]))); g=g.point(lambda v: min(255,int(v*t[1]))); b=b.point(lambda v: min(255,int(v*t[2])))
    return Image.merge('RGB',(r,g,b))
for rcht, namen in JE.items():
    ziel=f'site/{rcht}/img'; os.makedirs(ziel, exist_ok=True)
    for n in namen:
        im = stil(ImageOps.exif_transpose(Image.open(f'fotos/original/{n}.jpg')).convert('RGB'), STIL[rcht])
        for w in (640, 1100, 1800):
            x = im if im.width <= w else im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
            x.save(f'{ziel}/{n}-{w}.webp', 'WEBP', quality=78, method=6)
        print(rcht, n, im.size)
