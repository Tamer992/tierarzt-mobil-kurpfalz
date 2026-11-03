jQuery(function ($) {
	$('.kv-slot').each(function () {
		var $s = $(this), $id = $s.find('input[type=hidden]'), $img = $s.find('img');
		$s.find('.kv-waehlen').on('click', function () {
			var f = wp.media({ title: 'Bild wählen', multiple: false, library: { type: 'image' } });
			f.on('select', function () {
				var a = f.state().get('selection').first().toJSON();
				$id.val(a.id); $img.attr('src', (a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url));
			});
			f.open();
		});
		$s.find('.kv-zurueck').on('click', function () { $id.val(0); $img.attr('src', $img.data('standard')); });
	});
});
