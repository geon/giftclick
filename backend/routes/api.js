'use strict';

var express = require('express');
var config = require('../config.js');
var progres = require('progres'); require('progres-convenience'); require('progres-transaction');
var tableDefinitions = require('../tableDefinitions.js');
var sql = require('sql');
var uuid = require('uuid');
var Q = require('q');
var qhttp = require('q-io/http');


var api = express.Router();
module.exports = api;


// CORS-headers.
api.use(function (req, res, next) {

	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});


api.get('/users/fb/:facebookId', function (req, res) {

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

						user.clicksLeft = clicksLeft;

						return user;
					});
			});
	})
		.then(function (user) {

			// Remove sensitive data.
			user.hasAddress = !!user.address;
			delete user.address;
			return user;
		})
		.done(function (user) {

			res.json(user);

		}, function (error) {

			console.error(new Date().toString(), 'Error in getUser:', error.stack);
			res.sendStatus(500);
		});
});


api.put('/users/fb/:facebookId', function (req, res) {

	// For debugging. Just pretend it worked.
	if (req.body.facebookAccessToken == 'debug') {

		return res.end();
	}


	qhttp.read('https://graph.facebook.com/v2.3/me?access_token='+req.body.facebookAccessToken)
		.then(JSON.parse)
		.then(function (user) {

			if (user.id != req.params.facebookId) {

				throw new Error('Wrong user logged in.');
			}
		})
		.then(function () {

			return progres.transaction(config.connectionString, function (client) {

				return client.update(
					tableDefinitions.users,
					{facebookId: req.params.facebookId},
					{address: req.body.address}
				);
			});
		})
		.done(function (user) {

			res.json(user);

		}, function (error) {

			console.error(new Date().toString(), 'Error in putUser:', error.stack);
			res.sendStatus(500);
		});
});


api.get('/users/:userId/lastClickOnGiftType/:giftTypeSku', function (req, res) {

	progres.transaction(config.connectionString, function (client) {

		return selectActiveClickOnGiftType(client, req.params.userId, req.params.giftTypeSku);
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
});


api.post('/users/:userId/lastClickOnGiftType/:giftTypeSku', function (req, res) {

	progres.transaction(config.connectionString, function (client) {

		return selectClicksLeft(client, req.params.userId)
			.then(function (clicksLeft) {

				if (clicksLeft <= 0) {

					throw new Error('No clicks left for userId '+req.params.userId);
				}
			})
			.then(function () {

				return selectActiveClickOnGiftType(client, req.params.userId, req.params.giftTypeSku)
					.then(function (activeClick) {

						if (activeClick) {

							throw new Error('Click early for userId, sku '+req.params.userId+' '+req.params.giftTypeSku);
						}
					});
			})
			.then(function () {

				return client.insert(tableDefinitions.clicks, {
					userId: req.params.userId,
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
});


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
