
var giftTypes = require('./giftTypes.json')
	.filter(function (giftType) {

		return giftType.batchStock || new Date(giftType.timeRanOut) > new Date(new Date().getTime() - 2*24*3600*1000);
	});

var fbAppId = '1426084277715046';
var jadeTargets = {
	options: {
		// pretty: true
	},
	index: {
		options: {
			data: {
				fbAppId: fbAppId,
				giftTypes: giftTypes
			}
		},
		files: [{
			src: 'index.jade',
			dest: 'index.html'
		}]
	},
	privacyPolicy: {
		files: [{
			src: 'privacyPolicy.jade',
			dest: 'integritetspolicy.html'
		}]
	}
};

giftTypes
	.forEach(function (giftType) {

		jadeTargets[giftType.sku] = {
			options: {
				data: {
					fbAppId: fbAppId,
					giftType: giftType
				}
			},
			files: [{
				src: 'giftType.jade',
				dest: 'gifts/'+giftType.sku+'/index.html',
			}]
		};
	});





module.exports = function(grunt) {

	grunt.initConfig({

		// running `grunt less` will compile once
		less: {
			development: {
				options: {
					paths: ['./css'],
					yuicompress: false
				},
				files: {
					'./css/style.css': './css/style.less',
					'./css/markdown.css': './css/markdown.less'
				}
			}
		},

		// configure autoprefixing for compiled output css
		autoprefixer: {
			build: {
				// expand: true,
				// cwd: BUILD_DIR,
				src: ['./css/style.css', './css/markdown.css'],
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

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');
};

