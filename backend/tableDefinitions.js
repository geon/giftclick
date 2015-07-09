'use strict';

var sql = require('sql');

sql.setDialect('postgres');

module.exports = {

	users: sql.define({
		name: 'users',
		columns: [
			"id",
			"inviteRef",
			"facebookId",
			"address",
			"created"
		]
	}),


	giftTypes: sql.define({
		name: 'gifttypes',
		columns: [
			"sku",
			"description",
			"imageFileName",
			"stock",
			"batchStock",
			"balance",
			"timeRanOut",
			"published",
			"created"
		]
	}),


	clicks: sql.define({
		name: 'clicks',
		columns: [
			"id",
			"userId",
			"giftTypeSku",
			"created"
		]
	}),


	givenGifts: sql.define({
		name: 'givengifts',
		columns: [
			"id",
			"userId",
			"giftTypeSku",
			"bonusCode",
			"bonusGiven",
			"sent",
			"created"
		]
	})
};
