
var giftTypes = require('../src/giftTypes.json');
var tableDefinitions = require('../backend/tableDefinitions.js');
var config = require('../backend/config.js');
var progres = require('progres-convenience');

progres.connect(config.connectionString, function (client) {

	return client.insert(tableDefinitions.giftTypes, giftTypes);
})
	.done(function (inserted) {

		console.log('Inserted '+inserted.length+' rows.');

	}, function (error) {

		console.log(error.stack);
	});
