'use strict';

var GiftType = Backbone.Model.extend({

	constructor: function () {

		var properties = arguments[0];

		// Check for required properties.
		if (!(
			properties &&
			properties.user &&
			properties.giftTypeSku
		)) {

			throw new Error('Missing properties in GiftTypeCountDown constructor.');
		}

		properties.lastClick = new Click({
			user:        properties.user,
			giftTypeSku: properties.giftTypeSku
		});

		Backbone.Model.apply(this, arguments);
	},


	initialize: function () {

		var lastClick = this.get('lastClick');
		this.listenTo(lastClick, 'change:created', this.startCountDown, this);

		// Fetch as soon as user details are available.
		if (this.get('user').get('details')) {

			lastClick.fetch();
	
		} else {

			this.listenTo(this.get('user'), 'change:details', function () {

				lastClick.fetch();
			});
		}
	},


	want: function () {

		if (this.timeLeft()) {

			return;
		}

		this.get('lastClick').save('created', new Date());
	},


	startCountDown: function () {

		var timer = null;
		timer = setInterval(function () {

			var timeLeft = this.timeLeft();
			this.set('timeLeft', timeLeft);

			if (!timeLeft) {

				this.get('lastClick').set('created', null);
				clearTimeout(timer);
			}

		}.bind(this), 1000);
	},


	timeLeft: function () {

		var lastClick = this.get('lastClick');
		var lastClickTime = lastClick && lastClick.get('created');

		if (!lastClickTime) {

			return 0;
		}

		var timeLeft = lastClickTime + 60*60*1000 - new Date().getTime();
		
		return Math.max(0, timeLeft);
	}
});
