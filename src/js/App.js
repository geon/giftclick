'use strict';

function App () {

	this.user = new User();

	this.header = new Header({
		model: this.user
	});
}
