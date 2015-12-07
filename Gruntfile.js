/*global require, module */
/*jshint devel:true */
module.exports = function(grunt) {
	'use strict';

	// Tasks
	grunt.registerTask( 'default', [ 'jshint', 'build', 'jasmine' ] );
	grunt.registerTask( 'build', [ 'build_dev', 'umd', 'uglify:production' ] );
	grunt.registerTask( 'build_dev', [ 'concat:development', 'preprocess:development' ] );
	grunt.registerTask( 'test', [ 'build', 'jasmine' ] );
	grunt.registerTask( 'doc', "Builds the documentation.", [ 'jshint', 'jsduck' ] );
	grunt.registerTask( 'serve', [ 'connect:server:keepalive' ] );


	// Project configuration
	var exec = require( 'child_process' ).exec,
	    banner = createBanner(),
	    distPath = 'dist/Autolinker.js',
	    minDistPath = 'dist/Autolinker.min.js';

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		connect: {
			server: {
				options: {
					hostname: '*',
					port: 3000,
					base: '.'
				}
			}
		},

		jshint: {
			options : {
				jshintrc: true
			},
			files: {
				src: [ 'src/**/*.js', 'tests/**/*.js' ]
			}
		},

		jasmine: {
			dist: {
				options: {
					specs: [ 'tests/match/MatchChecker.js', 'tests/**/*Spec.js' ]
				},
				src: minDistPath
			}
		},

		concat: {
			development: {
				options: {
					banner : banner,
					nonull : true
				},
				src: [
					'src/Autolinker.js',
					'src/Util.js',
					'src/HtmlTag.js',
					'src/AnchorTagBuilder.js',
					'src/htmlParser/HtmlParser.js',
					'src/htmlParser/HtmlNode.js',
					'src/htmlParser/CommentNode.js',
					'src/htmlParser/ElementNode.js',
					'src/htmlParser/EntityNode.js',
					'src/htmlParser/TextNode.js',
					'src/match/Match.js',
					'src/match/Email.js',
					'src/match/Hashtag.js',
					'src/match/Phone.js',
					'src/match/Twitter.js',
					'src/match/Url.js',
					'src/matcher/domainNameRegex.js',
					'src/matcher/tldRegex.js',
					'src/matcher/Matcher.js',
					'src/matcher/Email.js',
					'src/matcher/Hashtag.js',
					'src/matcher/Phone.js',
					'src/matcher/Twitter.js',
					'src/matcher/Url.js',
					'src/matcher/UrlMatchValidator.js',
					'src/truncate/TruncateEnd.js',
					'src/truncate/TruncateMiddle.js',
					'src/truncate/TruncateSmart.js'
				],
				dest: distPath
			}
		},

		preprocess: {
			development : {
				src  : distPath,
				dest : distPath,
				options : {
					inline : true,  // required to overwrite the src file
					context : {
						DEBUG : true
					}
				}
			}
		},

		uglify: {
			production: {
				options: {
					banner: banner
				},
				src: [ distPath ],
				dest: minDistPath
			}
		},

		jsduck: {
			main: {
				// source paths with your code
				src: [
					'src/**/*.js'
				],

				// docs output dir
				dest: 'gh-pages/docs',

				// extra options
				options: {
					'title': 'Autolinker API Docs'
				}
			}
		},

		umd: {
			main: {
				src: distPath,
				globalAlias: 'Autolinker', //  Changes the name of the global variable
				objectToExport: 'Autolinker',
				indent: '\t'
			}
		}
	} );

	// Plugins
	grunt.loadNpmTasks( 'grunt-contrib-connect' );
	grunt.loadNpmTasks( 'grunt-contrib-jasmine' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-jsduck' );
	grunt.loadNpmTasks( 'grunt-preprocess' );
	grunt.loadNpmTasks( 'grunt-umd' );


	/**
	 * Creates the banner comment with license header that is placed over the concatenated/minified files.
	 *
	 * @private
	 * @return {String}
	 */
	function createBanner() {
		return [
			'/*!',
			' * Autolinker.js',
			' * <%= pkg.version %>',
			' *',
			' * Copyright(c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>',
			' * <%= pkg.license %>',
			' *',
			' * <%= pkg.homepage %>',
			' */\n'
		].join( "\n" );
	}
};
