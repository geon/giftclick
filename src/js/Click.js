'use strict';

var Click = Backbone.Model.extend({

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
		return 'http://'+window.backendHost+'/api/v1/users/fb/'+this.get('user').get('details').id+'/lastClickOnGiftType/'+this.get('giftTypeSku');
	}
});
