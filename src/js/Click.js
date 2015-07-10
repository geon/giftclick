'use strict';

var Click = Backbone.Model.extend({

	defaults: {
		serverTimeDelay: 0
	},


	constructor: function () {

		// Check for required properties.
		if (!(
			arguments[0] &&
			arguments[0].user &&
			arguments[0].giftTypeSku
		)) {

			throw new Error('Missing properties in Click constructor.');
		}

		Backbone.Model.apply(this, arguments);
	},


	parse: function (response) {

		// Parse the date string into an object.
		if (response.created) {

			response.created = new Date(response.created);
		}

		// Calculate the client/server time difference.
		// The client being even a few minutes off could make clicks
		// drop, since the countdown would finish early.
		if (response.serverTime) {

			response.serverTimeDelay = new Date().getTime() - new Date(response.serverTime).getTime();
			delete response.serverTime;
		}

		// Never PUT an object, but treat all saves as a new one.
		delete response.id;

		return response;
	},


	url: function() {

		/*

		The reasoning is a bit complex here... The last click needs to be queried by the
		user and giftType. But after POST-ing one, we don't care about accessing it by id.

		*/

		// Avoids using URL encoding.
		return 'http://'+window.backendHost+'/api/v1/users/'+this.get('user').id+'/lastClickOnGiftType/'+this.get('giftTypeSku');
	},


	timeLeft: function () {

		var lastClickTime = this.get('created');
		var serverTimeDelay = this.get('serverTimeDelay');

		if (!lastClickTime) {

			return 0;
		}

		var timeLeft = lastClickTime.getTime() - serverTimeDelay + 60*60*1000 - new Date().getTime();

		return Math.max(0, timeLeft);
	}
});
