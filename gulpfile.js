/*jshint node:true */
const babel           = require( 'gulp-babel' ),
      clone           = require( 'gulp-clone' ),
      concat          = require( 'gulp-concat' ),
      connect         = require( 'gulp-connect' ),
      gulp            = require( 'gulp' ),
      header          = require( 'gulp-header' ),
      jasmine         = require( 'gulp-jasmine' ),
      jshint          = require( 'gulp-jshint' ),
      merge           = require( 'merge-stream' ),
      preprocess      = require( 'gulp-preprocess' ),
      rename          = require( 'gulp-rename' ),
      through2        = require( 'through2' ),
      uglify          = require( 'gulp-uglify' ),
      umd             = require( 'gulp-umd' ),
      JsDuck          = require( 'gulp-jsduck' ),
      KarmaServer     = require( 'karma' ).Server;


// Project configuration
const pkg = require( './package.json' ),
      banner = createBanner(),
      srcFiles = createSrcFilesList(),
      srcFilesGlob = './src/**/*.js',
      testFilesGlob = './tests/**/*.js',
      distFolder = './dist/',
      distFilename = 'Autolinker.js',
      minDistFilename = 'Autolinker.min.js',
      minDistFilePath = distFolder + minDistFilename;


gulp.task( 'default', [ 'lint', 'build', 'test' ] );
gulp.task( 'lint', lintTask );
gulp.task( 'babel', babelTask );  // for examples
gulp.task( 'build', buildTask );
gulp.task( 'test', [ 'build' ], testTask );
gulp.task( 'doc', [ 'build', 'babel' ], docTask );
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
	var combinedSrcFile = gulp.src( srcFiles )
		.pipe( concat( distFilename ) )
		.pipe( umd() )
		.pipe( header( banner, { pkg: pkg } ) );

	var unminifiedFile = combinedSrcFile
		.pipe( clone() )
		.pipe( preprocess( { context: { VERSION: pkg.version, DEBUG: true } } ) )
		.pipe( gulp.dest( distFolder ) );

	var minifiedFile = combinedSrcFile
		.pipe( clone() )
		.pipe( preprocess( { context: { VERSION: pkg.version, DEBUG: false } } ) )  // removes DEBUG tagged code
		.pipe( uglify( { preserveComments: 'license' } ) )
		.pipe( rename( minDistFilename ) )
		.pipe( gulp.dest( distFolder ) );

	return merge( unminifiedFile, minifiedFile );
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

	return merge(
		gulp.src( srcFilesGlob )
			.pipe( jsduck.doc() ),

		gulp.src( `${distFolder}/**/*` )
			.pipe( gulp.dest( './gh-pages/dist' ) ),

		gulp.src( './examples/**' )
			.pipe( gulp.dest( './gh-pages/examples' ) )
	);
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