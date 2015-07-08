'use strict';

var GiftButton = Backbone.View.extend({

	el: '.gift-area > button',


	events: {
		'click': 'onClick'
	},


	initialize: function (options) {

		this.listenTo(this.model, 'change:timeLeft', this.updateDom, this);

		this.updateDom();
	},


	onClick: function () {

		this.model.want();
	},


	updateDom: function () {
		
		var timeLeft = this.model.get('timeLeft');
		var minutes = Math.floor(timeLeft / (60*1000));
		var seconds = Math.floor(timeLeft / 1000 - minutes * 60);

		this.$el.toggleClass('count-down', !!timeLeft);
		this.$el.find('span.timer').text = minutes + ':' + seconds;
	}
});
