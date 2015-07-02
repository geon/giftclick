'use strict';

var User = Backbone.Model.extend({

	defaults: {
		status: null,
		accessToken: null,
		details: {}
	},


	initialize: function () {

		this.listenTo(this, 'change:accessToken', function () {

			if (this.get('accessToken')) {

				FB.api('/me', function (response) {

					this.set('details', response);

				}.bind(this));
			}

		}.bind(this));


		FB.getLoginStatus(this._handleStatusResponse.bind(this));
	},


	logIn: function () {

		FB.login(this._handleStatusResponse.bind(this));
	},


	logOut: function () {

		FB.logout(this._handleStatusResponse.bind(this));
	},


	share: function () {

		// Share dialog
		FB.ui({
			method: 'share',
			href: location.href,
		}, function (response) {

			// callback
		});
	},


	_handleStatusResponse: function (response) {

		// So the logOut response also works.
		response = response || {};

		if (response.status === 'connected') {

			// Logged into your app and Facebook.

			this.set('accessToken', response.authResponse.accessToken);

		} else {

			this.set('accessToken', null);
		}

		this.set('status', response.status);
	}
});
