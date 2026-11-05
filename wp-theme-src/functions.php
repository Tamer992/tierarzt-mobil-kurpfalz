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
// Eigene Rolle: sieht nur „Seiteninhalt“, „Bilder“, Medien und das eigene Profil. Administratoren dürfen es auch.
function kv_rolle() {
	if (!get_role('kv_redakteur')) add_role('kv_redakteur', 'Webseiten-Redakteur', ['read' => true, 'upload_files' => true, 'kv_bearbeiten' => true]);
	$a = get_role('administrator');
	if ($a && !$a->has_cap('kv_bearbeiten')) $a->add_cap('kv_bearbeiten');
}
add_action('init', 'kv_rolle');

function kv_ist_redakteur() { return in_array('kv_redakteur', (array) wp_get_current_user()->roles, true); }
function kv_url($pfad) { return home_url('/' . ($pfad ? trim($pfad, '/') . '/' : '')); }

add_filter('login_redirect', fn($ziel, $anfrage, $user) => ($user instanceof WP_User && in_array('kv_redakteur', $user->roles, true)) ? admin_url('admin.php?page=kv-inhalt') : $ziel, 10, 3);
add_action('admin_init', function () { // Redakteure landen nie auf dem WordPress-Dashboard
	global $pagenow;
	if (kv_ist_redakteur() && $pagenow === 'index.php') { wp_safe_redirect(admin_url('admin.php?page=kv-inhalt')); exit; }
});
add_action('admin_menu', function () {
	if (kv_ist_redakteur()) remove_menu_page('index.php');
}, 999);
add_action('admin_bar_menu', function ($bar) {
	if (!kv_ist_redakteur()) return;
	foreach (['wp-logo', 'new-content', 'comments', 'updates', 'search', 'site-name'] as $n) $bar->remove_node($n);
}, 999);
add_filter('show_admin_bar', fn($z) => kv_ist_redakteur() ? false : $z);

add_action('admin_menu', function () {
	add_menu_page('Seiteninhalt', 'Seiteninhalt', 'kv_bearbeiten', 'kv-inhalt', 'kv_admin_inhalt', 'dashicons-edit-page', 3);
	add_submenu_page('kv-inhalt', 'Texte', 'Texte', 'kv_bearbeiten', 'kv-inhalt', 'kv_admin_inhalt');
	add_submenu_page('kv-inhalt', 'Bilder', 'Bilder', 'kv_bearbeiten', 'kv-bilder', 'kv_admin_bilder');
});

add_action('admin_enqueue_scripts', function ($hook) {
	if (!str_contains($hook, 'kv-bilder')) return;
	wp_enqueue_media();
	wp_enqueue_script('kv-admin', get_template_directory_uri() . '/admin.js', ['jquery'], '1.1', true);
});

function kv_admin_inhalt() {
	if (!current_user_can('kv_bearbeiten')) return;
	$standard = kv_json('content.json');
	$struktur = kv_json('struktur.json');
	$ist = (array) get_option('kv_inhalt', []);
	$offen = sanitize_text_field($_GET['seite'] ?? 'startseite');
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['kv_empfaenger']) && check_admin_referer('kv_empfaenger_speichern')) {
		$m = sanitize_email(wp_unslash($_POST['kv_empfaenger']));
		if ($m === '' || is_email($m)) { update_option('kv_empfaenger', $m); echo '<div class="notice notice-success"><p>Empfänger gespeichert.</p></div>'; }
		else echo '<div class="notice notice-error"><p>Diese E-Mail-Adresse ist ungültig.</p></div>';
	}
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['kv']) && check_admin_referer('kv_inhalt_speichern')) {
		$offen = sanitize_text_field($_POST['seite'] ?? '');
		foreach ((array) $_POST['kv'] as $pfad => $wert) {
			if (!isset($standard[$pfad])) continue;
			$wert = trim(sanitize_textarea_field(wp_unslash($wert)));
			if ($wert === '' || $wert === $standard[$pfad]) unset($ist[$pfad]); else $ist[$pfad] = $wert; // leer = Originaltext
		}
		update_option('kv_inhalt', $ist);
		echo '<div class="notice notice-success"><p>Gespeichert. Die Änderung ist sofort auf der Webseite sichtbar.</p></div>';
	}
	echo '<div class="wrap"><h1>Texte der Webseite</h1>';
	echo '<p style="max-width:60rem">Öffne eine Seite, ändere den Text im Feld und klicke unten auf „Speichern“. Mit „Seite ansehen“ siehst du die Seite, mit „Stelle ansehen“ den Abschnitt. Ein Feld leer lassen und speichern bringt den Originaltext zurück. Bilder wechselst du unter „Bilder“.</p>';
	if (current_user_can('manage_options')) {
		echo '<form method="post" style="background:#fff;border:1px solid #c3c4c7;padding:12px 14px;margin:12px 0;max-width:60rem">'; wp_nonce_field('kv_empfaenger_speichern');
		echo '<p style="margin:0 0 6px"><strong>Terminanfragen gehen an diese E-Mail-Adresse</strong></p><input type="email" name="kv_empfaenger" value="' . esc_attr(get_option('kv_empfaenger', '')) . '" placeholder="info@kurpfalzvet.de" class="regular-text"> <button class="button">Speichern</button> <span style="color:#646970">Leer lassen, dann gilt info@kurpfalzvet.de.</span></form>';
	}
	foreach ($struktur as $seite) {
		$anzahl = array_sum(array_map(fn($a) => count($a['felder']), $seite['abschnitte']));
		echo '<details' . ($seite['id'] === $offen ? ' open' : '') . ' style="background:#fff;border:1px solid #c3c4c7;padding:8px 14px;margin:8px 0;max-width:60rem"><summary style="cursor:pointer;font-weight:600;font-size:14px">' . esc_html($seite['titel']) . ' <span style="font-weight:400;color:#646970">(' . $anzahl . ' Texte)</span></summary>';
		if ($seite['url'] !== null) echo '<p style="margin:8px 0"><a href="' . esc_url(kv_url($seite['url'])) . '" target="_blank" rel="noopener" class="button">Seite ansehen</a></p>';
		echo '<form method="post">'; wp_nonce_field('kv_inhalt_speichern'); echo '<input type="hidden" name="seite" value="' . esc_attr($seite['id']) . '">';
		foreach ($seite['abschnitte'] as $a) {
			echo '<h3 style="margin:22px 0 6px;font-size:15px;border-top:1px solid #dcdcde;padding-top:12px">' . esc_html($a['name']);
			if ($seite['url'] !== null && !empty($a['anker'])) echo ' <a href="' . esc_url(kv_url($seite['url']) . '#' . $a['anker']) . '" target="_blank" rel="noopener" style="font-weight:400;font-size:12px;margin-left:8px">Stelle ansehen</a>';
			echo '</h3>';
			if (!empty($a['versteckt'])) echo '<p style="color:#646970;margin:0 0 8px">Diese Texte sieht man auf der Seite nicht direkt. Sie helfen Menschen mit Sehbehinderung und Suchmaschinen. Meist musst du sie nicht ändern.</p>';
			foreach ($a['felder'] as $f) {
				$pfad = $f['p']; $std = $standard[$pfad] ?? ''; $wert = $ist[$pfad] ?? $std;
				echo '<p style="margin:0 0 10px"><label style="display:block;color:#50575e;font-size:12px;font-weight:600">' . esc_html($f['l']) . (isset($ist[$pfad]) ? ' <span style="color:#996800;font-weight:400">· geändert</span>' : '') . '</label>';
				$name = 'kv[' . esc_attr($pfad) . ']';
				if (strlen($wert) > 70 || str_contains($wert, "\n")) echo '<textarea name="' . $name . '" rows="' . min(8, 1 + intdiv(strlen($wert), 90)) . '" class="large-text">' . esc_textarea($wert) . '</textarea>';
				else echo '<input type="text" name="' . $name . '" value="' . esc_attr($wert) . '" class="large-text">';
				if (isset($ist[$pfad])) echo '<span style="color:#646970;font-size:12px">Original: ' . esc_html(mb_strimwidth($std, 0, 120, '…')) . '</span>';
				echo '</p>';
			}
		}
		echo '<p><button class="button button-primary">Speichern</button></p></form></details>';
	}
	echo '</div>';
}

function kv_admin_bilder() {
	if (!current_user_can('kv_bearbeiten')) return;
	$ist = (array) get_option('kv_bilder', []);
	if ($_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer('kv_bilder_speichern')) {
		$neu = [];
		foreach ((array) ($_POST['kv_bild'] ?? []) as $name => $id) if ((int) $id > 0 && isset(kv_json('slots.json')[$name])) $neu[$name] = (int) $id;
		update_option('kv_bilder', $neu); $ist = $neu;
		echo '<div class="notice notice-success"><p>Gespeichert. Die Bilder sind sofort auf der Webseite.</p></div>';
	}
	echo '<div class="wrap"><h1>Bilder der Webseite</h1><p style="max-width:60rem">Klicke bei einem Bild auf „Bild wählen“, lade ein neues hoch oder nimm eins aus der Mediathek, und speichere unten. Die Vorschau zeigt den Ausschnitt, der auf der Webseite zu sehen ist. Passt das Format nicht, siehst du einen Hinweis. „Zurücksetzen“ bringt das ursprüngliche Bild zurück.</p><form method="post">';
	wp_nonce_field('kv_bilder_speichern');
	echo '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px">';
	foreach (kv_json('slots.json') as $name => $s) {
		$id = (int) ($ist[$name] ?? 0);
		$std = get_template_directory_uri() . '/assets/abend/img/' . $name . '-640.webp';
		$vorschau = $id ? wp_get_attachment_image_url($id, 'medium') : $std;
		$verhaeltnis = round($s['w'] / max(1, $s['h']), 3);
		echo '<div class="kv-slot" data-verhaeltnis="' . $verhaeltnis . '" style="background:#fff;border:1px solid #c3c4c7;padding:10px"><img src="' . esc_url($vorschau) . '" data-standard="' . esc_url($std) . '" style="width:100%;aspect-ratio:' . (int) $s['w'] . '/' . (int) $s['h'] . ';object-fit:cover;background:#eee;display:block">';
		echo '<p style="margin:8px 0 4px;font-size:12px;color:#50575e"><strong>' . esc_html($s['seite']) . '</strong>, ' . esc_html($s['ort']) . '<br>' . esc_html($s['alt']) . '</p>';
		echo '<p class="kv-hinweis" style="margin:4px 0;font-size:12px;color:#996800;display:none"></p>';
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
	foreach (['tier', 'tier_anderes', 'tier_name', 'tier_alter', 'schmerzen', 'anlass_text', 'strasse', 'ort', 'wann', 'datum', 'tageszeit', 'name', 'telefon', 'email'] as $k) $f[$k] = sanitize_textarea_field(wp_unslash($_POST[$k] ?? ''));
	$tier = $f['tier'] === 'Anderes Tier' ? $f['tier_anderes'] : $f['tier'];
	$ort = $f['ort'];
	if (!$tier || !$f['tier_name'] || !$f['tier_alter'] || !in_array($f['schmerzen'], ['Ja', 'Nein', 'Weiß nicht'], true) || !$f['anlass_text'] || !$f['strasse'] || !$ort || !$f['name'] || strlen(preg_replace('/\D/', '', $f['telefon'])) < 6 || empty($_POST['datenschutz'])) $antwort(false, 400);
	if ($f['email'] && !is_email($f['email'])) $antwort(false, 400);
	set_transient('kv_t_' . $ip, $n + 1, HOUR_IN_SECONDS);
	$zeilen = [
		'Tier' => $tier . ', ' . $f['tier_name'] . ' (' . $f['tier_alter'] . ')',
		'Schmerzen' => $f['schmerzen'],
		'Was ist sonst los' => $f['anlass_text'],
		'Adresse' => $f['strasse'] . ', ' . $ort,
		'Wunschtermin' => $f['datum'] ? $f['datum'] . ($f['tageszeit'] ? ', ' . $f['tageszeit'] : '') : $f['wann'],
		'Name' => $f['name'], 'Telefon' => $f['telefon'], 'E-Mail für die Rechnung' => $f['email'] ?: '-',
	];
	if (!in_array(mb_strtolower(trim($ort)), array_map('mb_strtolower', kv_json('orte.json')), true)) $zeilen['Hinweis'] = 'Ort steht nicht auf der Liste, bitte prüfen, ob ein Besuch möglich ist.';
	$text = "Neue Terminanfrage über die Webseite:\n\n";
	foreach ($zeilen as $k => $v) $text .= $k . ': ' . $v . "\n";
	$kopf = ['Content-Type: text/plain; charset=UTF-8'];
	if ($f['email']) $kopf[] = 'Reply-To: ' . $f['name'] . ' <' . $f['email'] . '>';
	$ok = wp_mail(kv_empfaenger(), 'Terminanfrage: ' . $tier . ' ' . $f['tier_name'] . ($f['schmerzen'] === 'Ja' ? ', Schmerzen' : ''), $text, $kopf);
	$antwort($ok, $ok ? 200 : 500);
}
add_action('admin_post_nopriv_kv_termin', 'kv_termin_senden');
add_action('admin_post_kv_termin', 'kv_termin_senden');
