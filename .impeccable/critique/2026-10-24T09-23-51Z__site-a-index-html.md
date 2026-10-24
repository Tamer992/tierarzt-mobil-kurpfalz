---
target: Startseite A
total_score: 24
max_score: 36
na_heuristics: 7
p0_count: 1
p1_count: 3
target_identity: "file:/home/tamer/work/Tierarzt-Mobil-Entwurf/site/a/index.html"
target_fingerprint: "sha256:dd47709b59cfe47ee5a4aad16b63319c23511553452547394dd02bd0b96130ca"
target_path: /home/tamer/work/Tierarzt-Mobil-Entwurf/site/a/index.html
timestamp: 2026-10-24T09-23-51Z
slug: site-a-index-html
---
# Critique Startseite A (24.10.2026)
Method: dual-agent (A: Design-Review, B: Detektor + Browser + axe)
Heuristiken: 1:3 2:3 3:3 4:2 5:2 6:3 7:n/a 8:2 9:3 10:3 = 24/36
Priority: P0 keine Antwort auf "kann ich jetzt anrufen" | P1 Knöpfe Systemschrift | P1 Fotos müde/krank | P1 Tafel-Idee am Handy nicht ausgeführt, Termin-Knopf unter der Kante | P2 Kobalt außerhalb von Anrufen/Termin, tote "Mehr dazu"-Links, Anlass vorausgewählt
Detektor: layout-transition (stil.css, padding), Overlay: low-contrast Nav (falsch positiv), cramped-padding auf .fehlt (falsch positiv); axe: label-content-name-mismatch an .marke
Behoben: alles oben; Detektor danach leer, axe ohne Verstöße.
