'use strict';

var express = require('express');
var config = require('../config.js');
var progres = require('progres-convenience');
var tableDefinitions = require('../tableDefinitions.js');
var sql = require('sql');
var _ = require('underscore')._;
var basicAuth = require('basic-auth-connect');
var fs = require('fs');

var router = express.Router();
router.use(basicAuth('admin', config.adminPassword));
module.exports = router;


var date = new sql.functionCallCreator("DATE");
var now = new sql.functionCallCreator('NOW');


router.get('/', function (req, res) {

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


router.get('/giveGifts', function (req, res) {

	progres.connect(config.connectionString, function (client) {

		return client.queryGenerated(tableDefinitions.giftTypes
			.select(
				tableDefinitions.giftTypes.star(),
				tableDefinitions.giftTypes.sku.count().as('numClicks')
			)
			.from(
				tableDefinitions.giftTypes
				.join(tableDefinitions.clicks).on(tableDefinitions.clicks.giftTypeSku.equals(tableDefinitions.giftTypes.sku))
			)
			.where(tableDefinitions.giftTypes.batchStock.gt(0))
			.group(tableDefinitions.giftTypes.sku)
			.order(tableDefinitions.giftTypes.sku)
			// Broken...
			// .order(tableDefinitions.giftTypes.sku.count().desc)
		);
	})
		.done(function (giftTypes) {

			// Because the nodesql sort doesn't work.
			giftTypes.sort(function (a, b) {

				return b.numClicks - a.numClicks;
			})

			res.render('giveGifts', {
				giftTypes: giftTypes
			});

		}, function (error) {

			console.error(new Date().toString(), 'Error in getGiveGifts:', error.stack);
			res.sendStatus(500);
		});
});


router.post('/giveGifts', function (req, res) {

	var sql = fs.readFileSync('giveGift.sql', 'utf8');

	progres.connect(config.connectionString, function (client) {

		return client.query(sql, [req.body.sku]);
	})
		.done(function () {

			res.redirect('/giveGifts');

		}, function (error) {

			console.error(new Date().toString(), 'Error in postGiveGifts:', error.stack);
			res.sendStatus(500);
		});
});


router.get('/publishGifts', function (req, res) {

	progres.connect(config.connectionString, function (client) {

		return client.queryGenerated(tableDefinitions.giftTypes
			.select()
			.where(tableDefinitions.giftTypes.stock.minus(tableDefinitions.giftTypes.batchStock).gt(0))
			.order(tableDefinitions.giftTypes.timeRanOut)
		);
	})
		.done(function (giftTypes) {

			res.render('publishGifts', {
				giftTypes: giftTypes
			});

		}, function (error) {

			console.error(new Date().toString(), 'Error in getPublishGifts:', error.stack);
			res.sendStatus(500);
		});
});


router.post('/publishGifts', function (req, res) {

	progres.connect(config.connectionString, function (client) {

		return client.queryGenerated(tableDefinitions.giftTypes
			.update({batchStock: tableDefinitions.giftTypes.batchStock.plus(req.body.amount)})
			.where(tableDefinitions.giftTypes.sku.equals(req.body.sku))
		);
	})
		.done(function () {

			res.redirect('/publishGifts');

		}, function (error) {

			console.error(new Date().toString(), 'Error in postPublishGifts:', error.stack);
			res.sendStatus(500);
		});
});


router.get('/inventory', function (req, res) {

	progres.connect(config.connectionString, function (client) {

		return client.select(tableDefinitions.giftTypes);
	})
		.done(function (giftTypes) {

			res
				.set({'Content-Type': 'application/json; charset=utf-8'})
				.end(JSON.stringify(giftTypes, undefined, "\t"));

		}, function (error) {

			console.error(new Date().toString(), 'Error in getInventory:', error.stack);
			res.sendStatus(500);
		});
});
