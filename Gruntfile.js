module.exports = function(grunt) {
	'use strict';
	
	var banner = createBanner();
	
	// Project configuration.
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
			files: {
				src: [ 'src/**/*.js', 'tests/**/*.js' ]
			}
		},
		
		jasmine: {
			dist: {
				options: {
					specs: 'tests/*Spec.js',
				},
				src: 'dist/Autolinker.min.js'
			}
		},
		
		concat: {
			development: {
				options: {
					banner : banner + createDistFileHeader(),
					footer : createDistFileFooter(),
					nonull : true,
					
					process : function( src, filepath ) {
						return '\t' + src.replace( /\n/g, '\n\t' );  // indent each source file, which is placed inside the UMD block
					}
				},
				src: [
					'src/umdBegin.js',
					'src/Autolinker.js',
					'src/Util.js',
					'src/AnchorTagBuilder.js',
					'src/Match.js',
					'src/EmailMatch.js',
					'src/TwitterMatch.js',
					'src/UrlMatch.js',
					'src/umdEnd.js'
				],
				dest: 'dist/Autolinker.js',
			},
		},
		
		uglify: {
			production: {
				options: {
					banner: banner
				},
				src: [ 'dist/Autolinker.js' ],
				dest: 'dist/Autolinker.min.js',
			}
		}
	} );

	// Plugins
	grunt.loadNpmTasks( 'grunt-contrib-connect' );
	grunt.loadNpmTasks( 'grunt-contrib-jasmine' );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );

	// Tasks
	grunt.registerTask( 'default', [ 'lint', 'build', 'doTest' ] );
	grunt.registerTask( 'lint', [ 'jshint' ] );
	grunt.registerTask( 'test', [ 'build', 'doTest' ] );
	grunt.registerTask( 'doTest', [ 'jasmine' ] );
	grunt.registerTask( 'build', [ 'concat:development', 'uglify:production' ] );
	grunt.registerTask( 'serve', [ 'connect:server:keepalive' ] );
	
	
	
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
	
	
	/**
	 * Creates the UMD (Universal Module Definition) header, which defines Autolinker as one of the following when loaded:
	 * 
	 * 1. An AMD module, if an AMD loader is available (such as RequireJS)
	 * 2. A CommonJS module, if a CommonJS module environment is available (such as Node.js), or
	 * 3. A global variable if the others are unavailable.
	 * 
	 * This UMD header is combined with the UMD footer to create the distribution JavaScript file.
	 * 
	 * @private
	 * @return {String}
	 */
	function createDistFileHeader() {
		return [
			"/*global define, module */",
			"( function( root, factory ) {\n",
				"\tif( typeof define === 'function' && define.amd ) {",
					"\t\tdefine( factory );             // Define as AMD module if an AMD loader is present (ex: RequireJS).",
				"\t} else if( typeof exports !== 'undefined' ) {",
					"\t\tmodule.exports = factory();    // Define as CommonJS module for Node.js, if available.",
				"\t} else {",
					"\t\troot.Autolinker = factory();   // Finally, define as a browser global if no module loader.",
				"\t}",
			"}( this, function() {\n\n"
		].join( "\n" );
	}
	
	
	/**
	 * Creates the UMD (Universal Module Definition) footer. See {@link #createDistFileHeader} for details.
	 * 
	 * @private
	 * @return {String}
	 */
	function createDistFileFooter() {
		var umdEnd = [
				'\n\n\treturn Autolinker;\n',
			'} ) );'
		];
		
		return umdEnd.join( "\n" );
	}
	
};
