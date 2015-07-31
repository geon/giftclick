'use strict';

var Header = Backbone.View.extend({

	el: 'body > .header',


	events: {
		'click button.log-in':  'onLogInButtonClicked',
		'click button.log-out': 'onLogOutButtonClicked',
		'click button.save-address': 'onSaveAddressButtonClicked'
	},


	initialize: function () {

		this.model.on('change', this.updateDom, this);

		this.updateDom();
	},


	onLogInButtonClicked: function () {

		this.model.get('facebook').logIn();
	},


	onLogOutButtonClicked: function () {

		this.model.get('facebook').logOut();
	},


	onSaveAddressButtonClicked: function () {

		this.model.save({
			address: this.$el.find('textarea').val(),
			hasAddress: true,
			facebookAccessToken: this.model.get('facebook').get('accessToken')
		});
	},


	updateDom: function () {

		this.$el.toggleClass('logged-in', !!this.model.get('loggedIn'));
		this.$el.toggleClass('has-address', !!this.model.get('hasAddress'));
		this.$el.find('span.userFirstName').text(this.model.get('firstName'));
		this.$el.find('span.userNumClicksLeft').text(this.model.get('clicksLeft'));
		this.$el.find('textarea').attr('placeholder', this.model.get('fullName')+"\nGatunamn 123\n123 45  Postort")
	}
});
