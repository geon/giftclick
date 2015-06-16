'use strict';

var fs = require('fs');


var products = fs.readFileSync('products.php', {encoding: 'utf8'})
	.split("\n")
	.filter(function (obj, i, array) {

		return i != 0 && i != array.length - 1;
	})
	.map(function (line) {

		var split = line.split('$');
		return {
			id:  split[0],
			sku: split[1],
			batchStock: 1,
			stock: 0,
		};
	})
	.reduce(function(map, obj) {

		map[obj.id] = obj;
		return map;
	}, {});


fs.readFileSync('products_ext.php', {encoding: 'utf8'})
	.split("\n")
	.filter(function (obj, i, array) {

		return i != 0 && i != array.length - 1;
	})
	.forEach(function (line) {

		var split = line.split('$');
		products[split[0]].description = split[6];
	});


var images = fs.readFileSync('products_files.php', {encoding: 'utf8'})
	.split("\n")
	.filter(function (obj, i, array) {

		return i != 0 && i != array.length - 1;
	})
	.map(function (line) {

		var split = line.split('$');

		return {
			productId: split[1],
			fileName:  split[2],
			ordering:  split[5]
		};
	});

var imagesForProducts = images
	.reduce(function(map, obj) {

		if (!map[obj.productId]) {

			map[obj.productId] = [];
		}

		map[obj.productId].push(obj);

		return map;
	}, {});

Object.keys(products).forEach(function (productId) {

	products[productId].imageFileName = imagesForProducts[productId].sort().shift().fileName;
});


products = Object.keys(products).map(function (id) {

	delete products[id].id;
	return products[id];
});


fs.writeFileSync('giftTypes.json', JSON.stringify(products, null, "\t"));
