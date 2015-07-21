
var fbAppId = '1426084277715046';
// var backendHost = 'backend.giftclick.se:8085';
var backendHost = 'localhost:8085';

var giftTypes = require('./giftTypes.json')
	.filter(function (giftType) {

		return (giftType.stock && giftType.batchStock) || new Date(giftType.timeRanOut) > new Date(new Date().getTime() - 2*24*3600*1000);
	});

giftTypes.sort(function (a, b) {

	return new Date(b.published).getTime() - new Date(a.published).getTime();
});

var adrecordAds = require('./adrecord-ads.json');
var shuffle = require('shuffle-array');
shuffle(adrecordAds);
var adrecordAdsIndex = 0;

var jadeTargets = {
	options: {
		// pretty: true
	},
	index: {
		options: {
			data: {
				fbAppId: fbAppId,
				backendHost: backendHost,
				giftTypes: giftTypes
			}
		},
		files: [{
			src: 'index.jade',
			dest: '../build/index.html'
		}]
	},
	privacyPolicy: {
		files: [{
			src: 'privacyPolicy.jade',
			dest: '../build/integritetspolicy.html'
		}]
	}
};

giftTypes
	.forEach(function (giftType) {

		jadeTargets[giftType.sku] = {
			options: {
				data: {
					fbAppId: fbAppId,
					backendHost: backendHost,
					giftType: giftType,
					adrecordAd: adrecordAds[adrecordAdsIndex++ % adrecordAds.length]
				}
			},
			files: [{
				src: 'giftType.jade',
				dest: '../build/gifts/'+giftType.sku+'/index.html',
			}]
		};
	});





module.exports = function(grunt) {

	grunt.initConfig({

		copy: {
			build: {
				expand: true,
				src:[
					'./css/cssreset-min.css',
					'./css/noise-3percent.png',
					'./font-awesome-4.3.0/**',
					'./gift-images/*',
					'./js/**'
				],
				dest:'../build/'
			}
		},

		// running `grunt less` will compile once
		less: {
			development: {
				options: {
					paths: ['./css'],
					yuicompress: false
				},
				files: {
					'../build/css/style.css': './css/style.less',
					'../build/css/markdown.css': './css/markdown.less'
				}
			}
		},

		// configure autoprefixing for compiled output css
		autoprefixer: {
			build: {
				// expand: true,
				// cwd: BUILD_DIR,
				src: ['../build/css/style.css', '../build/css/markdown.css'],
				// dest: BUILD_DIR
			}
		},

		jade: jadeTargets,

		// running `grunt watch` will watch for changes
		watch: {

			stylesless: {
				options: { livereload: true },
				files: ['./css/*.less'],
				tasks: ['less:development', 'autoprefixer']
			},

			jade: {
				options: { livereload: true },
				files: ['*.jade'],
				tasks: ['jade']
			}
		},
		
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');
};

