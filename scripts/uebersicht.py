# Baut recherche/phase0-uebersicht.html: Screenshots (eingebettet) + Notizen
import json, base64, io, html, sys
from PIL import Image
sys.path.insert(0,'')
N = json.load(open('notizen.json', encoding='utf-8'))
Z = open('zusammenfassung.html', encoding='utf-8').read()
def b64(path, w=None, h=None, q=72):
    im = Image.open(path).convert('RGB')
    if w and im.width > w: im = im.resize((w, int(im.height*w/im.width)))
    if h and im.height > h: im = im.resize((int(im.width*h/im.height), h))
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
out = []
gruppe = None
for s in N:
    if s['gruppe'] != gruppe:
        gruppe = s['gruppe']; out.append(f'<h2 class="g">{html.escape(gruppe)}</h2>')
    li = ''.join(f'<li>{html.escape(z)}</li>' for z in s['zeilen'])
    bilder = ''
    if s['id']:
        top=b64('bogen/'+s['id']+'-top.jpg', w=1100); lang=b64('bogen/'+s['id']+'-lang.jpg', h=1800, q=65)
        bilder = f'<figure><img loading="lazy" alt="Erster Bildschirm Computer und Handy" src="{top}"><figcaption>Erster Bildschirm · 1440 px und 390 px</figcaption></figure>'
        if s['id'] != 'aesop_com_de':
            bilder += f'<details><summary>Ganze Seite am Computer</summary><img loading="lazy" alt="Ganze Seite" src="{lang}"></details>'
    out.append(f'<section><header><h3>{html.escape(s["name"])}</h3><p>{html.escape(s["fokus"])}</p></header><ul>{li}</ul>{bilder}</section>')
seite = f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Phase 0 · Mobiler Tierarzt · Vorbilder und Abgrenzung</title>
<style>
:root{{--grund:#f3f2ee;--text:#24211e;--leise:#5b5650;--linie:#d9d6cf}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--grund);color:var(--text);font:17px/1.55 system-ui,sans-serif}}
main{{max-width:1180px;margin:0 auto;padding:40px 20px 120px}}
h1{{font-size:30px;line-height:1.15;margin:0 0 6px;text-wrap:balance}}.stand{{color:var(--leise);margin:0 0 32px}}
.zus{{background:#fff;border:1px solid var(--linie);padding:24px 26px;margin-bottom:40px}}.zus h2{{margin:0 0 10px;font-size:20px}}.zus p,.zus li{{max-width:72ch;text-wrap:pretty}}
h2.g{{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--leise);margin:56px 0 12px;border-bottom:1px solid var(--linie);padding-bottom:8px}}
section{{background:#fff;border:1px solid var(--linie);padding:22px 24px;margin:0 0 22px}}
section header{{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}}h3{{margin:0;font-size:20px}}section header p{{margin:0;color:var(--leise)}}
ul{{padding-left:1.1em;margin:12px 0 16px}}li{{margin:3px 0;max-width:80ch}}
figure{{margin:0}}img{{display:block;max-width:100%;height:auto;border:1px solid var(--linie)}}figcaption{{font-size:14px;color:var(--leise);margin-top:6px}}
details{{margin-top:12px}}summary{{cursor:pointer;color:var(--leise);font-size:15px}}details img{{margin-top:10px}}
</style></head><body><main>
<h1>Phase 0 · Mobiler Tierarzt · Vorbilder und Abgrenzung</h1>
<p class="stand">Stand 24.10.2026 · Screenshots aufgenommen mit Chromium auf dem Homeserver, 1440 px und 390 px (Touch)</p>
{Z}
{''.join(out)}
</main></body></html>'''
open('phase0-uebersicht.html','w',encoding='utf-8').write(seite)
print(len(seite)//1024, 'KB')
