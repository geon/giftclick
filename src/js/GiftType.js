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

		var lastClick = this.get('lastClick');

		if (lastClick.timeLeft()) {

			return;
		}

		// Send a click, setting the countdown immediately client-side.
		lastClick.save(
			{
				'created': new Date()
			}

			// Ignoring errors.
			// TODO: Reset timer if the request fails.
			// NOTE: JSON parsing *will* fail. check only status code.
		);
	},


	startCountDown: function () {

		var lastClick = this.get('lastClick');

		var timer = null;

		var updateTimeLeft = function () {

			var timeLeft = lastClick.timeLeft();
			this.set('timeLeft', timeLeft);

			if (!timeLeft) {

				lastClick.set('created', null);
				clearTimeout(timer);
			}

		}.bind(this)

		timer = setInterval(updateTimeLeft, 1000);
		updateTimeLeft();
	}
});
