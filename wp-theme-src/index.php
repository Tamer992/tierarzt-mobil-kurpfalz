<?php
// Alle echten Seiten liefert functions.php aus (parse_request). Hier landet nur, was es nicht gibt.
status_header(404);
?><!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Seite nicht gefunden</title></head>
<body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1.5rem"><h1>Seite nicht gefunden</h1><p><a href="<?= esc_url(home_url('/')) ?>">Zur Startseite</a></p></body></html>
