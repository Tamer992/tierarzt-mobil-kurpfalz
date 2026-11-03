jQuery(function ($) {
	function pruefe($s, breite, hoehe) { // Hinweis, wenn das Format stark vom Platz abweicht
		var soll = parseFloat($s.data('verhaeltnis')), ist = breite / hoehe, $h = $s.find('.kv-hinweis');
		if (Math.abs(ist / soll - 1) > 0.2) $h.text('Das Bild hat ein anderes Format als der Platz (' + (ist > soll ? 'zu breit' : 'zu hoch') + '). Die Ränder werden abgeschnitten, achte auf die Vorschau.').show();
		else $h.hide();
	}
	$('.kv-slot').each(function () {
		var $s = $(this), $id = $s.find('input[type=hidden]'), $img = $s.find('img');
		$s.find('.kv-waehlen').on('click', function () {
			var f = wp.media({ title: 'Bild wählen', multiple: false, library: { type: 'image' }, button: { text: 'Dieses Bild verwenden' } });
			f.on('select', function () {
				var a = f.state().get('selection').first().toJSON();
				$id.val(a.id); $img.attr('src', (a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url));
				pruefe($s, a.width, a.height);
			});
			f.open();
		});
		$s.find('.kv-zurueck').on('click', function () { $id.val(0); $img.attr('src', $img.data('standard')); $s.find('.kv-hinweis').hide(); });
	});
});
