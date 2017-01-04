function Counter() {
	$.extend(this, {
		opening: new Date($('body').data('opening')),
		ms: null,
		verbs: [['день', 'дня', 'дней'], ['час', 'часа', 'часов'], ['минута', 'минуты', 'минут']],
		$el: $('.counter>.count'),
		timer: null
	});
	this.run();
}
Counter.prototype = {
	zeropad: function (n) {
		if (n < 10) {
			n = '0' + n;
		}
		return n.toString();
	},
	declOfNum: function (number, titles) {
		var cases = [2, 0, 1, 1, 1, 2];
		return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
	},
	countTpl: function (n, v) {
		return $('<div class="tell">' + this.zeropad(n) + '<div class="measure"><span>' + v + '</span></div></div>');
	},
	maths: function () {
		this.ms = this.opening - new Date();
		var d = Math.floor(this.ms / 1000 / 60 / 60 / 24);
		var dms = d * 1000 * 60 * 60 * 24;
		var h = Math.floor((this.ms - dms) / 1000 / 60 / 60);
		var hms = h * 60 * 60 * 1000;
		var m = Math.floor((this.ms - (dms + hms)) / 1000 / 60);
		return [d, h, m];
	},
	draw: function () {
		this.$el.empty();
		this.maths().forEach(function (t, i) {
			this.$el.append(this.countTpl(t, this.declOfNum(t, this.verbs[i])));
		}, this);
		this.$el.parent().css({visibility: 'visible'});
	},
	run: function () {
		if (this.timer !== null) {
			clearInterval(this.timer);
		} else {
			this.draw();
		}
		this.timer = setInterval(this.draw.bind(this), 60000);
	}
};
//
function Subscribe($form) {
	this.form = $form;
	this.bind();
}
Subscribe.prototype = {
	/**
	 * bind to form submission
	 */
	bind: function () {
		// set masks
		$(':input[name]', this.form).each(function (i, e) {
			Subscribe.options.im[e.name].mask(e);
		});
		// bind submit
		this.form.on('submit', this.handler.bind(this));
	},
	/**
	 * enable or diable submit
	 * @param {boolean} d true == disable
	 */
	disable: function (d) {
		$('[type="submit"]').prop('disabled', d);
	},
	/**
	 * form submit handler
	 * @param {jQuery.Event} e
	 */
	handler: function (e) {
		e.preventDefault();
		if (!this.validate()) return;
		this.send();
	},
	/**
	 * check & fill data to save
	 * @returns {boolean}
	 */
	validate: function () {
		// clear data
		this.data = {};
		var i = $(':input', this.form);
		var valid = false;
		// clear last errors
		i.removeClass('error');
		i.each(function (i, e) {
			var $e = $(e);
			var v = $e.val().trim();
			if (!v) return;
			if (!Subscribe.options.im[e.name].isValid(v)) {
				this.showError($e);
			} else {
				this.data[e.name] = v;
			}
		}.bind(this));
		var empty = $.isEmptyObject(this.data);
		if (empty) this.showError(i);
		return !empty;
	},
	showError: function ($fld) {
		$fld.addClass('error');
	},
	send: function () {
		this.data.date = new Date();
		this.disable(true);
		Subscribe.db.save(Subscribe.options.collection, this.data).done(this.success.bind(this)).fail(Subscribe.error);
	},
	success: function () {
		this.disable(false);
		this.data = {};
		$.magnificPopup.close();
		this.form[0].reset();
		window.location.replace('/thank-you.html');
	}
};
// static below
Subscribe.error = function (e) {
	if (!e) return;
	console.error(e);
};
Subscribe.options = {
	url: 'https://example.com',
	account: 'sample',
	database: 'sample',
	login: 'sample',
	password: 'sample',
	collection: 'sample',
	im: {
		phone: new Inputmask('+7 (999) 999-99-99'),
		email: new Inputmask({alias: 'email'})
	}
};

Subscribe.db = {
	login: function () {
		return $.when();
	},
	save: function () {
		return $.when();
	}
};

Subscribe.connect = function () {
	Subscribe.db.login('default', Subscribe.options.password).done().fail(Subscribe.error);
};
function bindSubscribeForm(ctx) {
	ctx = ctx || document;
	$('.subscribe-form', ctx).each(function (i, f) {
		var $f = $(f);
		var iName = 'subscribe-form';
		if (!$f.data(iName)) {
			$f.data(iName, new Subscribe($f));
		}
	});
}
$(function () {
	new Counter();
	Subscribe.connect();
//---- show popup ---------------------------------------------
	$(document).on('click', '.register-btn', function (e) {
		e.preventDefault();
		$.magnificPopup.open({
			items: {
				src: $('#popup-tpl').text(),
				type: 'inline'
			},
			callbacks: {
				open: function () {
					bindSubscribeForm(this.content);
				}
			}
		});
	});
	bindSubscribeForm();
});