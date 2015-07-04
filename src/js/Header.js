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

		this.model.logIn();
	},


	onLogOutButtonClicked: function () {

		this.model.logOut();
	},


	updateDom: function () {

		this.$el.toggleClass('logged-in', this.model.get('status') == 'connected');
		this.$el.find('span.userFirstName').text(this.model.get('details').first_name);
	}
});
