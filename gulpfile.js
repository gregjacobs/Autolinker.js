/*jshint node:true */
const gulp            = require( 'gulp' ),
      babel           = require( 'gulp-babel' ),
      concat          = require( 'gulp-concat' ),
      connect         = require( 'gulp-connect' ),
      header          = require( 'gulp-header' ),
      jasmine         = require( 'gulp-jasmine' ),
      jshint          = require( 'gulp-jshint' ),
      preprocess      = require( 'gulp-preprocess' ),
      rename          = require( 'gulp-rename' ),
      uglify          = require( 'gulp-uglify' ),
      umd             = require( 'gulp-umd' ),
      JsDuck          = require( 'gulp-jsduck' ),
      KarmaServer     = require( 'karma' ).Server,
      through2        = require( 'through2' );


// Project configuration
var banner = createBanner(),
    srcFiles = createSrcFilesList(),
    srcFilesGlob = './src/**/*.js',
    testFilesGlob = './tests/**/*.js',
    distFolder = 'dist/',
    distFilename = 'Autolinker.js',
    minDistFilename = 'Autolinker.min.js',
    minDistFilePath = distFolder + minDistFilename;


gulp.task( 'default', [ 'lint', 'build', 'test' ] );
gulp.task( 'lint', lintTask );
gulp.task( 'babel', babelTask );  // for examples
gulp.task( 'build', buildTask );
gulp.task( 'test', [ 'build' ], testTask );
gulp.task( 'doc', docTask );
gulp.task( 'serve', [ 'babel' ], serveTask );


function lintTask() {
	return gulp.src( [ srcFilesGlob, testFilesGlob ] )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( jshint.reporter( 'fail' ) );  // fail the task if errors
}


function babelTask() {
	return gulp.src( [
		'./examples/live-example/js/Option.js',
		'./examples/live-example/js/CheckboxOption.js',
		'./examples/live-example/js/RadioOption.js',
		'./examples/live-example/js/TextOption.js',
		'./examples/live-example/js/main.js'
	] )
		.pipe( babel() )
		.pipe( concat( 'live-example.js' ) )
		.pipe( gulp.dest( './examples/live-example/' ) );
}


function buildTask() {
	return gulp.src( srcFiles )
		.pipe( concat( distFilename ) )
		.pipe( umd() )
		.pipe( header( banner, { pkg: require( './package.json' ) } ) )
		.pipe( gulp.dest( distFolder ) )
		.pipe( preprocess( { context: { DEBUG: false } } ) )  // removes DEBUG tagged code
		/*.pipe( closureCompiler({  // in case we want to use closure compiler. Need to define exports and get to work with umd header
			compilation_level : 'ADVANCED',
			warning_level     : 'VERBOSE',
			language_in       : 'ECMASCRIPT3',
			language_out      : 'ECMASCRIPT3',  // need to output to ES3 so the unicode regular expressions constructed with `new RegExp()` aren't changed into RegExp literals with all of the symbols expanded into \uXXXX. Adds 5kb to the output size in this case.
			js_output_file    : minDistFilename
		}))*/
		.pipe( uglify( { preserveComments: 'license' } ) )
		.pipe( rename( minDistFilename ) )
		.pipe( gulp.dest( distFolder ) );
}


function testTask( done ) {
	return new KarmaServer( {
		frameworks : [ 'jasmine' ],
		reporters  : [ 'spec' ],
		browsers   : [ 'PhantomJS' ],
		files : [
			'node_modules/lodash/lodash.js',  // spec helper
			minDistFilePath,
			testFilesGlob
		],
		singleRun : true
	}, done ).start();
}


function docTask() {
	var jsduck = new JsDuck( [
		'--out',               './gh-pages/docs',
		'--title',             'Autolinker API Docs',
		'--examples',          './gh-pages/examples.json',
		'--examples-base-url', './'
	] );

	return gulp.src( srcFilesGlob )
		.pipe( jsduck.doc() )
		.pipe( through2.obj(  // for a little hacky synchronous behavior
			function transform( file, enc, cb ) { cb( null, file ); },  // pass through
			function flush( cb ) { copyExampleFiles( cb ); }
		) );


	function copyExampleFiles( cb ) {
		gulp.src( './gh-pages/examples/**' )
			.pipe( gulp.dest( './gh-pages/docs/examples' ) )
			.on( 'end', function() { cb(); } );
	}
}


function serveTask() {
	gulp.watch( './examples/live-example/js/**', [ 'babel' ] );

	connect.server();
}


/**
 * Creates the banner comment with license header that is placed over the
 * concatenated/minified files.
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
		' * Copyright(c) <%= new Date().getFullYear() %> <%= pkg.author %>',
		' * <%= pkg.license %> License',
		' *',
		' * <%= pkg.homepage %>',
		' */\n'
	].join( "\n" );
}


/**
 * Creates the source files list, in order.
 *
 * @private
 * @return {String[]}
 */
function createSrcFilesList() {
	return [
		'src/Autolinker.js',
		'src/Util.js',
		'src/HtmlTag.js',
		'src/RegexLib.js',
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
	];
}