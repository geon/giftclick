'use strict';

var Header = Backbone.View.extend({

	el: 'body > .header',


	events: {
		'click button.log-in':  'onLogInButtonClicked',
		'click button.log-out': 'onLogOutButtonClicked'
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


	updateDom: function () {

		this.$el.toggleClass('logged-in', !!this.model.get('loggedIn'));
		this.$el.find('span.userFirstName').text(this.model.get('firstName'));
		this.$el.find('span.userNumClicksLeft').text(this.model.get('clicksLeft'));
	}
});
