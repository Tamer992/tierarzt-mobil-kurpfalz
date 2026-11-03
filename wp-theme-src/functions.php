<?php
// Kurpfalzvet: Seiten sind fertige HTML-Vorlagen in templates/. Platzhalter {{k:pfad}} sind Texte, {{T}} das Theme, {{H}} die Adresse.
// Texte und Bilder ändert der Kunde im Menü „Seiteninhalt“. Geänderte Werte liegen in den Optionen kv_inhalt und kv_bilder.

function kv_json($datei) { static $c = []; return $c[$datei] ??= json_decode(file_get_contents(get_template_directory() . '/' . $datei), true); }
function kv_werte() { return array_merge(kv_json('content.json'), (array) get_option('kv_inhalt', [])); }

function kv_pfad() {
	$basis = trim((string) parse_url(home_url('/'), PHP_URL_PATH), '/');
	$p = trim((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
	if ($basis !== '' && str_starts_with($p, $basis)) $p = trim(substr($p, strlen($basis)), '/');
	return $p;
}

function kv_render($datei) {
	$html = file_get_contents(get_template_directory() . '/templates/' . $datei);
	$w = kv_werte();
	$html = preg_replace_callback('/\{\{k:([^}]+)\}\}/', fn($m) => esc_html($w[$m[1]] ?? ''), $html);
	$html = str_replace(['{{T}}', '{{H}}'], [get_template_directory_uri(), untrailingslashit(home_url())], $html);
	foreach ((array) get_option('kv_bilder', []) as $name => $id) {
		if (!$id || !wp_get_attachment_url($id)) continue;
		$html = preg_replace_callback('/<img\b[^>]*data-kv="' . preg_quote($name, '/') . '"[^>]*>/', function ($m) use ($id) {
			$t = preg_replace('/\ssrcset="[^"]*"/', '', $m[0]);
			$srcset = wp_get_attachment_image_srcset($id, 'full');
			return preg_replace('/\ssrc="[^"]*"/', ' src="' . esc_url(wp_get_attachment_image_url($id, 'large') ?: wp_get_attachment_url($id)) . '"' . ($srcset ? ' srcset="' . esc_attr($srcset) . '"' : ''), $t);
		}, $html);
	}
	if (get_option('blog_public')) $html = preg_replace('/<meta name="robots"[^>]*>\s*/', '', $html); // Einstellungen > Lesen > Suchmaschinen
	return $html;
}

add_action('parse_request', function () {
	$s = kv_json('seiten.json');
	$p = kv_pfad();
	if (!isset($s[$p])) return;
	status_header(200);
	header('Content-Type: text/html; charset=UTF-8');
	echo kv_render($s[$p]);
	exit;
});

add_action('after_switch_theme', function () { // schöne Adressen ohne ?p=123
	update_option('permalink_structure', '/%postname%/');
	flush_rewrite_rules();
});

// ---------- Bedienfeld ----------
function kv_gruppenname($g) {
	$fest = ['startseite' => 'Startseite', 'gemeinsam' => 'Kontakt, Zeiten und Fuß (auf allen Seiten)', 'termin' => 'Termin anfragen', 'abschied' => 'Abschied zu Hause', 'praxis' => 'Praxis'];
	if (isset($fest[$g])) return $fest[$g];
	return str_starts_with($g, 'leistung-') ? 'Leistung: ' . ucfirst(str_replace('-', ' ', substr($g, 9))) : 'Ratgeber: ' . ucfirst(str_replace('-', ' ', preg_replace('~^ratgeber/~', '', $g)));
}

add_action('admin_menu', function () {
	add_menu_page('Seiteninhalt', 'Seiteninhalt', 'edit_pages', 'kv-inhalt', 'kv_admin_inhalt', 'dashicons-edit-page', 3);
	add_submenu_page('kv-inhalt', 'Bilder', 'Bilder', 'edit_pages', 'kv-bilder', 'kv_admin_bilder');
});

add_action('admin_enqueue_scripts', function ($hook) {
	if (!str_contains($hook, 'kv-bilder')) return;
	wp_enqueue_media();
	wp_enqueue_script('kv-admin', get_template_directory_uri() . '/admin.js', ['jquery'], '1.0', true);
});

function kv_admin_inhalt() {
	if (!current_user_can('edit_pages')) return;
	$standard = kv_json('content.json');
	$ist = (array) get_option('kv_inhalt', []);
	$gruppe = sanitize_text_field($_GET['gruppe'] ?? '');
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer('kv_inhalt_speichern')) {
		$gruppe = sanitize_text_field($_POST['gruppe'] ?? '');
		foreach ((array) ($_POST['kv'] ?? []) as $pfad => $wert) {
			if (!isset($standard[$pfad])) continue;
			$wert = sanitize_textarea_field(wp_unslash($wert));
			if ($wert === $standard[$pfad]) unset($ist[$pfad]); else $ist[$pfad] = $wert;
		}
		update_option('kv_inhalt', $ist);
		echo '<div class="notice notice-success"><p>Gespeichert.</p></div>';
	}
	$gruppen = [];
	foreach ($standard as $pfad => $wert) $gruppen[explode('.', $pfad)[0]][$pfad] = $wert;
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['kv_empfaenger']) && check_admin_referer('kv_empfaenger_speichern')) {
		$m = sanitize_email(wp_unslash($_POST['kv_empfaenger']));
		if ($m === '' || is_email($m)) { update_option('kv_empfaenger', $m); echo '<div class="notice notice-success"><p>Empfänger gespeichert.</p></div>'; }
		else echo '<div class="notice notice-error"><p>Diese E-Mail-Adresse ist ungültig.</p></div>';
	}
	echo '<div class="wrap"><h1>Seiteninhalt</h1><form method="post" style="background:#fff;border:1px solid #c3c4c7;padding:12px 14px;margin:12px 0">'; wp_nonce_field('kv_empfaenger_speichern');
	echo '<p style="margin:0 0 6px"><strong>Terminanfragen gehen an diese E-Mail-Adresse</strong></p><input type="email" name="kv_empfaenger" value="' . esc_attr(get_option('kv_empfaenger', '')) . '" placeholder="info@kurpfalzvet.de" class="regular-text"> <button class="button">Speichern</button> <span style="color:#646970">Leer lassen, dann gilt info@kurpfalzvet.de.</span></form>';
	echo '<p>Hier änderst du Texte der Webseite. Wähle einen Bereich, ändere den Text und klicke auf „Speichern“. Die Gestaltung bleibt unverändert. Bilder wechselst du unter „Bilder“.</p>';
	foreach ($gruppen as $g => $felder) {
		$offen = $g === $gruppe ? ' open' : '';
		echo '<details' . $offen . ' style="background:#fff;border:1px solid #c3c4c7;padding:8px 14px;margin:8px 0"><summary style="cursor:pointer;font-weight:600;font-size:14px">' . esc_html(kv_gruppenname($g)) . ' <span style="font-weight:400;color:#646970">(' . count($felder) . ' Texte)</span></summary>';
		echo '<form method="post" style="margin-top:12px">'; wp_nonce_field('kv_inhalt_speichern');
		echo '<input type="hidden" name="gruppe" value="' . esc_attr($g) . '">';
		foreach ($felder as $pfad => $std) {
			$wert = $ist[$pfad] ?? $std;
			$label = esc_html(str_replace('.', ' › ', substr($pfad, strlen($g) + 1)));
			echo '<p style="margin:0 0 10px"><label style="display:block;color:#646970;font-size:12px">' . $label . '</label>';
			$name = 'kv[' . esc_attr($pfad) . ']';
			if (strlen($wert) > 70 || str_contains($wert, "\n")) echo '<textarea name="' . $name . '" rows="' . min(8, 1 + intdiv(strlen($wert), 90)) . '" class="large-text">' . esc_textarea($wert) . '</textarea>';
			else echo '<input type="text" name="' . $name . '" value="' . esc_attr($wert) . '" class="large-text">';
			echo '</p>';
		}
		echo '<p><button class="button button-primary">Speichern</button></p></form></details>';
	}
	echo '</div>';
}

function kv_admin_bilder() {
	if (!current_user_can('edit_pages')) return;
	$ist = (array) get_option('kv_bilder', []);
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer('kv_bilder_speichern')) {
		$neu = [];
		foreach ((array) ($_POST['kv_bild'] ?? []) as $name => $id) if ((int) $id > 0 && isset(kv_json('slots.json')[$name])) $neu[$name] = (int) $id;
		update_option('kv_bilder', $neu); $ist = $neu;
		echo '<div class="notice notice-success"><p>Gespeichert.</p></div>';
	}
	echo '<div class="wrap"><h1>Bilder</h1><p>Wähle ein neues Bild für eine Stelle der Webseite. Am besten im gleichen Format wie das aktuelle (Breite zu Höhe siehe unten). „Zurücksetzen“ bringt das ursprüngliche Bild zurück.</p><form method="post">';
	wp_nonce_field('kv_bilder_speichern');
	echo '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px">';
	foreach (kv_json('slots.json') as $name => $s) {
		$id = (int) ($ist[$name] ?? 0);
		$vorschau = $id ? wp_get_attachment_image_url($id, 'medium') : get_template_directory_uri() . '/assets/abend/img/' . $name . '-640.webp';
		echo '<div class="kv-slot" style="background:#fff;border:1px solid #c3c4c7;padding:10px"><img src="' . esc_url($vorschau) . '" data-standard="' . esc_url(get_template_directory_uri() . '/assets/abend/img/' . $name . '-640.webp') . '" style="width:100%;aspect-ratio:' . (int) $s['w'] . '/' . (int) $s['h'] . ';object-fit:cover;background:#eee">';
		echo '<p style="margin:6px 0;font-size:12px;color:#646970">' . esc_html($s['alt'] ?: $name) . '<br>Format ' . (int) $s['w'] . ' : ' . (int) $s['h'] . ' · ' . esc_html($s['seite']) . '</p>';
		echo '<input type="hidden" name="kv_bild[' . esc_attr($name) . ']" value="' . $id . '"><button type="button" class="button kv-waehlen">Bild wählen</button> <button type="button" class="button-link kv-zurueck">Zurücksetzen</button></div>';
	}
	echo '</div><p><button class="button button-primary">Speichern</button></p></form></div>';
}

// ---------- Termin-Anfrage ----------
function kv_empfaenger() { return get_option('kv_empfaenger') ?: 'info@kurpfalzvet.de'; }

function kv_termin_senden() {
	$antwort = function ($ok, $code = 200) { wp_send_json(['ok' => $ok], $code); };
	if (!empty($_POST['website'])) $antwort(true); // Honigtopf: Roboter bekommen ein „ok“ und es passiert nichts
	$ip = md5($_SERVER['REMOTE_ADDR'] ?? '');
	$n = (int) get_transient('kv_t_' . $ip);
	if ($n >= 5) $antwort(false, 429);
	$f = [];
	foreach (['tier', 'tier_anderes', 'tier_name', 'anlass', 'anlass_text', 'strasse', 'plz', 'ort', 'wann', 'datum', 'tageszeit', 'name', 'telefon', 'email'] as $k) $f[$k] = sanitize_text_field(wp_unslash($_POST[$k] ?? ''));
	$tier = $f['tier'] === 'Anderes Tier' ? $f['tier_anderes'] : $f['tier'];
	if (!$tier || !$f['anlass'] || !$f['strasse'] || !preg_match('/^\d{5}$/', $f['plz']) || !$f['ort'] || !$f['name'] || strlen(preg_replace('/\D/', '', $f['telefon'])) < 6 || empty($_POST['datenschutz'])) $antwort(false, 400);
	if ($f['email'] && !is_email($f['email'])) $antwort(false, 400);
	set_transient('kv_t_' . $ip, $n + 1, HOUR_IN_SECONDS);
	$zeilen = [
		'Tier' => $tier . ($f['tier_name'] ? ' (' . $f['tier_name'] . ')' : ''),
		'Anlass' => $f['anlass'] . ($f['anlass_text'] ? ': ' . $f['anlass_text'] : ''),
		'Adresse' => $f['strasse'] . ', ' . $f['plz'] . ' ' . $f['ort'],
		'Wunschtermin' => $f['datum'] ? $f['datum'] . ($f['tageszeit'] ? ', ' . $f['tageszeit'] : '') : $f['wann'],
		'Name' => $f['name'], 'Telefon' => $f['telefon'], 'E-Mail für die Rechnung' => $f['email'] ?: '-',
	];
	$text = "Neue Terminanfrage über die Webseite:\n\n";
	foreach ($zeilen as $k => $v) $text .= $k . ': ' . $v . "\n";
	$kopf = ['Content-Type: text/plain; charset=UTF-8'];
	if ($f['email']) $kopf[] = 'Reply-To: ' . $f['name'] . ' <' . $f['email'] . '>';
	$ok = wp_mail(kv_empfaenger(), 'Terminanfrage: ' . $tier . ', ' . $f['anlass'], $text, $kopf);
	$antwort($ok, $ok ? 200 : 500);
}
add_action('admin_post_nopriv_kv_termin', 'kv_termin_senden');
add_action('admin_post_kv_termin', 'kv_termin_senden');
