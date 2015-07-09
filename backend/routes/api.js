'use strict';

var config = require('../config.js');
var progres = require('progres'); require('progres-convenience'); require('progres-transaction');
var tableDefinitions = require('../tableDefinitions.js');
var sql = require('sql');
var uuid = require('uuid');


function selectClicksLeft (client, userId) {

	var clicksPerDayAllowance = 100;

	var date = new sql.functionCallCreator("DATE");
	var now = new sql.functionCallCreator('NOW');

	return client.queryGenerated(tableDefinitions.clicks
		.select(tableDefinitions.clicks.count().as('numClicks'))
		.where(
			date(tableDefinitions.clicks.created).equals(date(now())),
			tableDefinitions.clicks.userId.equals(userId)
		)
	)
		.then(function (rows) {

			return clicksPerDayAllowance - (rows[0] && rows[0].numClicks || 0);
		});
}


function selectActiveClickOnGiftType (client, userId, giftTypeSku) {

	var now = new sql.functionCallCreator('NOW');
	var countDownInterval = tableDefinitions.clicks.literal("INTERVAL '1 hour'");

	return client.queryGenerated(tableDefinitions.clicks
		.select(tableDefinitions.clicks.star(), now().as('serverTime'))
		.where(
			tableDefinitions.clicks.userId.equals(userId),
			tableDefinitions.clicks.giftTypeSku.equals(giftTypeSku),
			tableDefinitions.clicks.created.plus(countDownInterval).gt(now())
		)
		.order(tableDefinitions.clicks.created.desc)
		.limit(1)
	)
		.then(function (rows) {

			return rows[0];
		});
}


module.exports = {

	getClicksLeft: function (req, res) {

		progres.transaction(config.connectionString, function (client) {

			return client.selectOne(
				tableDefinitions.users,
				{facebookId: req.params.facebookId}
			)
				.then(function (user) {

					return selectClicksLeft(client, user.id);
				});
		})
			.done(function (clicksLeft) {

				res.json(clicksLeft);

			}, function (error) {

				console.error(new Date().toString(), 'Error in getClicksLeft:', error.stack);
				res.sendStatus(500);
			});
	},


	getLastClickOnGiftType: function (req, res) {

		progres.transaction(config.connectionString, function (client) {

			return client.selectOne(
				tableDefinitions.users,
				{facebookId: req.params.facebookId}
			)
				.then(function (user) {

					return selectActiveClickOnGiftType(client, user.id, req.params.giftTypeSku);
				});
		})
			.done(function (activeClick) {

				if (!activeClick) {

					return res.sendStatus(404);
				}

				res.json(activeClick);

			}, function (error) {

				console.error(new Date().toString(), 'Error in getLastClickOnGiftType:', error.stack);
				res.sendStatus(500);
			});		
	},


	postClicks: function (req, res) {

		progres.transaction(config.connectionString, function (client) {

			return client.selectOne(
				tableDefinitions.users,
				{facebookId: req.params.facebookId}
			)
				.then(function (user) {

					// Create the user if it's missing.

					if (!user) {

						return client.insert(tableDefinitions.users, {
							id: uuid.v4(),
							inviteRef: uuid.v4(),
							facebookId: req.params.facebookId,
						})
					}

					return user;
				})
				.then(function (user) {

					return selectClicksLeft(client, user.id)
						.then(function (clicksLeft) {

							if (clicksLeft <= 0) {

								throw new Error('No clicks left for facebookId '+req.params.facebookId);
							}

							return user;
						});
				})
				.then(function (user) {

					return selectActiveClickOnGiftType(client, user.id, req.params.giftTypeSku)
						.then(function (activeClick) {

							if (activeClick) {

								throw new Error('Click early for facebookId, sku '+req.params.facebookId+' '+req.params.giftTypeSku);
							}

							return user;
						});
				})
				.then(function (user) {

					return client.insert(tableDefinitions.clicks, {
						userId: user.id,
						giftTypeSku: req.params.giftTypeSku
					});
				});
		})
			.done(function () {

				res.sendStatus(200);

			}, function (error) {

				console.error(new Date().toString(), 'Error in postClicks:', error.stack);
				res.sendStatus(500);
			});
	}
};
