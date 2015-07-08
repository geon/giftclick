'use strict';

var config = require('../config.js');
var progres = require('progres'); require('progres-convenience'); require('progres-transaction');
var tableDefinitions = require('../tableDefinitions.js');
var sql = require('sql');


function selectClicksLeft (client, userId) {

	var clicksPerDayAllowance = 100;

	var date = new sql.functionCallCreator("DATE");
	var now = new sql.functionCallCreator('NOW');

	return client.queryGenerated(tableDefinitions.clicks
		.select(tableDefinitions.clicks.count().minus(clicksPerDayAllowance))
		.where(day(tableDefinitions.clicks.created).equals(day(now())))
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
				{facebookId: req.parameters.facebookId}
			)
				.then(function (user) {

					return selectClicksLeft (client, user.id);
				});
		})
			.done(function (clicksLeft) {

				res.json(clicksLeft);

			}, function (error) {

				console.error(new Date(), 'Error in getClicksLeft:', error.stack);
				res.sendStatus(500);
			});
	},


	getLastClickOnGiftType: function (req, res) {

		progres.transaction(config.connectionString, function (client) {

return {
	created: new Date()
};

			return client.selectOne(
				tableDefinitions.users,
				{facebookId: req.parameters.facebookId}
			)
				.then(function (user) {

					return selectLastClickOnGiftType (client, user.id, req.parameters.giftTypeSku);
				});
		})
			.done(function (lastClick) {

				res.json(lastClick);

			}, function (error) {

				console.error(new Date(), 'Error in getLastClickOnGiftType:', error.stack);
				res.sendStatus(500);
			});		
	},


	postClicks: function (req, res) {

		progres.transaction(config.connectionString, function (client) {

			return client.selectOne(
				tableDefinitions.users,
				{facebookId: req.parameters.facebookId}
			)
				.then(function (user) {

					if (!user) {

						throw new Error('No user with facebookId '+req.parameters.facebookId);
					}

					return user;
				})
				.then(function (user) {

					return selectClicksLeft (client, user.id)
						.then(function (clicksLeft) {

							if (clicksLeft <= 0) {

								throw new Error('No clicks left for facebookId '+req.parameters.facebookId);
							}

							return user;
						});
				})
				.then(function (user) {

					return selectClicksLeft (client, userId)
						.then(function (clicksLeft) {

							if (clicksLeft <= 0) {

								throw new Error('Click early for facebookId, sku '+req.parameters.facebookId+' '+req.body.giftTypeSku);
							}

							return user;
						});
				})
				.then(function (user) {

					var click = {
						userId: user.id,
						giftTypeSku: req.body.giftTypeSku,
						created: new Date()
					};

					return client.insert(
						tableDefinitions.clicks,
						click
					);
				});
		})
			.done(function () {

				res.sendStatus(200);

			}, function (error) {

				console.error(new Date(), 'Error in postClicks:', error.stack);
				res.sendStatus(500);
			});
	}
};
