'use strict';

function App () {

	this.user = new User();

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
