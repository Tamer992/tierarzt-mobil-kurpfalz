# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Halterinnen und Halter von Hunden und Katzen in Mannheim und Umgebung (Kurpfalz). Typische Lage: Das Tier ist akut krank, alt, ängstlich oder schwer zu transportieren, oft abends. Sie suchen am Handy, sind besorgt und wollen in Sekunden wissen: Kommt ein Tierarzt zu mir nach Hause, wie erreiche ich ihn, was kommt auf mich zu. Viele sind älter. Zweite Gruppe: Familien, die ihr Tier zu Hause einschläfern lassen wollen.

## Product Purpose

Webseite der Mobilen Tierarztpraxis Kurpfalz von Rasheed Al Saeed. Ziel: Anruf oder Terminanfrage. Erfolg heißt, dass ein Halter am Handy sofort versteht, dass der Tierarzt nach Hause kommt, ob seine Postleitzahl im Einsatzgebiet liegt, und dann anruft oder eine Anfrage schickt.

## Positioning

Ein approbierter Tierarzt kommt selbst ins Zuhause des Tieres, mit Hausapotheke an Bord, abends bis 23 Uhr. Das Tier bleibt in seiner vertrauten Umgebung, ohne Transportkorb und Wartezimmer. Er behandelt allein, ein Praxisteam organisiert Termine.

## Operating Context

Mobile Praxis ohne Behandlungsraum für Besuche. Sitz Freinsheimer Str. 30, 67245 Lambsheim (nur Impressum). Einsatzgebiet mit Schwerpunkt Mannheim, 31 Orte plus Karlsruhe. Zeiten: Mo bis Fr 9 bis 23 Uhr, Sa 8 bis 12 Uhr, So in Ausnahmefällen nach Absprache. Keine 24-Stunden-Versorgung, bei Lebensgefahr außerhalb der Zeiten die nächste Tierklinik. Abrechnung nach GOT mit Hausbesuchsgebühr und Zuschlägen. Zahlung bar, EC-Karte oder Rechnung per E-Mail.

## Capabilities and Constraints

- Statischer Generator in Node (`src/abend.mjs`, `src/abend-seiten.mjs`), Inhalte in `src/inhalt/*.json`, Stil `src/abend/stil.css`, Skript `src/abend/abend.js`.
- Strenge CSP: keine Inline-Skripte, Skripte nur als Datei.
- Postleitzahl-Prüfung ohne Server, Terminanfrage mit Vorauswahl (Tier, Anlass), Uhr mit Erreichbarkeit nach Telefonzeiten.
- Vorschau öffentlich auf GitHub Pages (noindex). Domain später tierpraxis-kurpfalz.de.
- Offen: Telefonnummer, WhatsApp, Hausbesuchsgebühr in Euro, Fotos von Herrn Al Saeed und dem Praxisauto.

## Brand Commitments

- Logo des Kunden (Petrol-Pin mit Pfote, Kreuz-Abzeichen in Orange) bleibt unverändert in Originalfarben.
- Anrede Sie, der Tierarzt spricht in der Ich-Form. Ruhig, einfühlsam, fachlich klar, keine Weichmacher, keine Gedankenstriche.
- Fotos: Tageslicht, nur Tiere. Keine Menschen von Stockfotos.
- Keine Kursivschrift, kein Orange/Honig/Ocker/Mint als Seitenfarbe, kein Glassmorphism, keine Riesenzahlen.
- Startbereich: Uhr-Kasten mit Erreichbarkeit und der Satz „Kein Transportkorb, keine Fahrt, kein Wartezimmer“ bleiben (Tamer, 25.10.2026).

## Evidence on Hand

Werdegang (Kenntnisprüfung Gießen, Internship AniCura Bielefeld, Praxen und Kliniken in Essen), sein Zitat und sechs Werte aus seiner E-Mail, zehn Leistungen, Pexels-Fotos (Nachweis in BILDNACHWEIS.md). Keine Bewertungen, keine Zahlen zu Patienten oder Jahren. Nichts davon erfinden.

## Product Principles

1. Erreichbarkeit vor allem anderen: Nummer, Zeiten und Anfrage sind nie mehr als einen Blick entfernt.
2. Der Tierarzt als Person steht im Mittelpunkt, nicht die Praxis als Marke.
3. Ruhe statt Alarm: Notfall heißt besonnen und klar, ohne Warnfarben.
4. Ehrlichkeit: offene Angaben als Platzhalter, keine erfundenen Belege.

## Accessibility & Inclusion

Ältere Zielgruppe: Fließtext mindestens 18 px am Handy, große Tippflächen, WCAG AA, `prefers-reduced-motion`. Am Handy feste Anrufleiste, am Computer große Nummer.
