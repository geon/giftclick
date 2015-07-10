'use strict';

var User = Backbone.Model.extend({

	defaults: {
		firstName: null,
		loggedIn: false
	},


	initialize: function () {

		var facebook = this.get('facebook');
		if (facebook) {

			this.listenTo(facebook, 'change:details', function () {

				this.set({
					facebookId: facebook.get('details').id,
					firstName: facebook.get('details').first_name
				});

				// Now I have an id to fetch the internal user data by.
				this.fetch();

			}, this);


			this.listenTo(facebook, 'change:status', function () {

				this.set({
					loggedIn: facebook.get('status') == 'connected'
				});

			}, this);

		} else {

			console.error('No auth-provider!');
		}
	},


	url: function() {

		// Depends on auth-provider used.

		var facebookId = this.get('facebookId');
		if (facebookId) {

			return 'http://'+window.backendHost+'/api/v1/users/fb/'+facebookId;
		}

		console.log('Why The H*** are you fetching without an auth-provider?');
		return null;
	},
});
