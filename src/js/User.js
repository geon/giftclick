'use strict';

var User = Backbone.Model.extend({

	defaults: {
		status: null,
		accessToken: null,
		details: {}
	},


	initialize: function () {

		if (document.location.hostname == "localhost") {

			// Fake login.

			this._handleStatusResponse({
				status: 'connected',
				authResponse: {
					accessToken: 'foo'
				}
			});
			this.set('details', {
				first_name: 'Jhonny Appleseed',
				id: '1337',
			});

		} else {

			this.listenTo(this, 'change:accessToken', function () {

				if (this.get('accessToken')) {

					FB.api('/me', function (response) {

						this.set('details', response);

					}.bind(this));
				}

			}.bind(this));


			// Initialize FB SDK.
			window.fbAsyncInit = function() {

				FB.init({
					appId      : window.fbAppId,
					xfbml      : false, // No share buttons etc.
					version    : 'v2.3',
					status     : true // Logs in at once.
				});

				FB.getLoginStatus(this._handleStatusResponse.bind(this));

			}.bind(this);
			(function(d, s, id){
				 var js, fjs = d.getElementsByTagName(s)[0];
				 if (d.getElementById(id)) {return;}
				 js = d.createElement(s); js.id = id;
				 js.src = "//connect.facebook.net/sv_SE/sdk.js";
				 fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		}
	},


	logIn: function () {

		FB.login(this._handleStatusResponse.bind(this));
	},


	logOut: function () {

		FB.logout(this._handleStatusResponse.bind(this));
	},


/*
	share: function () {

		// Share dialog
		FB.ui({
			method: 'share',
			href: location.href,
		}, function (response) {

			// callback
		});
	},
*/


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
