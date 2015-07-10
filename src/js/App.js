'use strict';

function App () {

	this.facebook = new Facebook();
	this.user = new User({facebook: this.facebook});

	this.header = new Header({
		model: this.user
	});

	// Kind of ugly, I know.
	if($('.gift-area > button').length) {

		this.button = new GiftButton({
			model: new GiftType({
				user: this.user,
				giftTypeSku: window.giftTypeSku
			})
		});
	}
}
