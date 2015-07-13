'use strict';

var express = require('express');
var config = require('../config.js');
var progres = require('progres-convenience');
var tableDefinitions = require('../tableDefinitions.js');
var sql = require('sql');
var _ = require('underscore')._;


var router = express.Router();
module.exports = router;


var date = new sql.functionCallCreator("DATE");
var now = new sql.functionCallCreator('NOW');


router.get('/', function (req, res) {

	// TODO: Authentication, Authoriztion!

	progres.connect(config.connectionString, function (client) {

		return client.queryGenerated(tableDefinitions.givenGifts
			.select(
				tableDefinitions.givenGifts.star(),
				date(tableDefinitions.givenGifts.created).as('date'),
				tableDefinitions.users.address,
				tableDefinitions.giftTypes.imageFileName
			)
			.from(
				tableDefinitions.givenGifts
				.join(tableDefinitions.users).on(tableDefinitions.givenGifts.userId.equals(tableDefinitions.users.id))
				.join(tableDefinitions.giftTypes).on(tableDefinitions.givenGifts.giftTypeSku.equals(tableDefinitions.giftTypes.sku))
			)
			.where(
				date(tableDefinitions.givenGifts.created.plus(tableDefinitions.givenGifts.literal("INTERVAL '30 days'"))).gt(date(now()))
			)
			.order(
				tableDefinitions.givenGifts.created,
				tableDefinitions.givenGifts.giftTypeSku
			)
		)
			.then(function (givenGifts) {

				var givenGiftsGroupedByDate = _.groupBy(givenGifts, 'date');
				return Object.keys(givenGiftsGroupedByDate)
					.map(function (date) {

						return {
							date: new Date(date).toISOString().substring(0, 	10),
							winners: givenGiftsGroupedByDate[date].map(function (winner) {

								return {
									address: winner.address,
									giftTypeSku: winner.giftTypeSku,
									giftTypeImageFileName: winner.imageFileName
								};
							})
						}
					});
			});
	})
		.done(function (days) {

			res.render('givenGifts', {
				days: days
			});

		}, function (error) {

			console.error(new Date().toString(), 'Error in getGivenGifts:', error.stack);
			res.sendStatus(500);
		});
});
