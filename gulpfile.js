/*jshint node:true */
const clone           = require( 'gulp-clone' ),
      concat          = require( 'gulp-concat' ),
      connect         = require( 'gulp-connect' ),
      download        = require( 'gulp-download' ),
      gulp            = require( 'gulp' ),
      header          = require( 'gulp-header' ),
      jasmine         = require( 'gulp-jasmine' ),
      jshint          = require( 'gulp-jshint' ),
      merge           = require( 'merge-stream' ),
      preprocess      = require( 'gulp-preprocess' ),
      punycode        = require( 'punycode' ),
      rename          = require( 'gulp-rename' ),
      through2        = require( 'through2' ),
      transform       = require( 'gulp-transform' ),
      typescript      = require( 'gulp-typescript' ),
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


gulp.task( 'default', [ 'doc', 'test' ] );
gulp.task( 'lint', lintTask );
gulp.task( 'build', [ 'lint' ], buildTask );
gulp.task( 'test', [ 'build' ], testTask );
gulp.task( 'doc', [ 'build', 'typescript' ], docTask );
gulp.task( 'serve', [ 'typescript', 'doc' ], serveTask );
gulp.task( 'typescript', typescriptTask );  // for examples
gulp.task( 'update-tld-list', updateTldRegex );


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


function docTask() {
	var jsduck = new JsDuck( [
		'--out',               './docs/api',
		'--title',             'Autolinker v' + pkg.version + ' API Docs',
		'--examples',          './docs/examples.json',
		'--examples-base-url', './docs/'
	] );

	return merge(
		// Move dist files into the docs/ folder so they can be served
		// by GitHub pages
		gulp.src( `${distFolder}/**/*` )
			.pipe( gulp.dest( './docs/dist' ) ),

		gulp.src( srcFilesGlob )
			.pipe( jsduck.doc() )
	);
}


function lintTask() {
	return gulp.src( [ srcFilesGlob, testFilesGlob ] )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( jshint.reporter( 'fail' ) );  // fail the task if errors
}


function serveTask() {
	gulp.watch( './docs/examples/live-example/src/**', [ 'typescript' ] );
	gulp.watch( './src/**', [ 'doc' ] );

	connect.server();
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


function typescriptTask() {
	return gulp.src( [
		'./docs/examples/live-example/src/Option.ts',
		'./docs/examples/live-example/src/CheckboxOption.ts',
		'./docs/examples/live-example/src/RadioOption.ts',
		'./docs/examples/live-example/src/TextOption.ts',
		'./docs/examples/live-example/src/main.ts'
	] )
		.pipe( typescript( { noImplicitAny: true, out: 'live-example-all.js' } ) )
		.pipe( header( '// NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR\n// CHANGES WILL BE OVERWRITTEN!!!\n\n' ) )
		.pipe( gulp.dest( './docs/examples/live-example/' ) );
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
		'src/match/Mention.js',
		'src/match/Url.js',
		'src/matcher/TldRegex.js',
		'src/matcher/Matcher.js',
		'src/matcher/Email.js',
		'src/matcher/Hashtag.js',
		'src/matcher/Phone.js',
		'src/matcher/Mention.js',
		'src/matcher/Url.js',
		'src/matcher/UrlMatchValidator.js',
		'src/truncate/TruncateEnd.js',
		'src/truncate/TruncateMiddle.js',
		'src/truncate/TruncateSmart.js'
	];
}

function dePunycodeDomain(d){
	d = d.toLowerCase();
	if (/xn--/.test(d)){
		return [d, punycode.toUnicode(d)];
	}
	return [d];
}

function notCommentLine(line){
	return !/^#/.test(line);
}

function compareLengthLongestFirst(a, b){
	var result = b.length - a.length;
	if (result === 0) {
		result = a.localeCompare(b);
	}
	return result;
}

function domainsToRegex(contents){
	contents = contents
		.split('\n')
		.filter(notCommentLine)
		.map(dePunycodeDomain);
	contents = [].concat.apply([], contents);
	contents = contents.filter(function(s){ return !!s; });
	contents.sort(compareLengthLongestFirst);
	contents = contents.join('|');
	contents = '/*global Autolinker */\nAutolinker.tldRegex = /(?:' + contents + ')/;\n';

	return contents;
}

function updateTldRegex(){
	return download('http://data.iana.org/TLD/tlds-alpha-by-domain.txt')
		.pipe(transform(domainsToRegex, { encoding: 'utf8' }))
		.pipe( header( '// NOTE: THIS IS A GENERATED FILE\n// To update with the latest TLD list, run `gulp update-tld-list`\n\n' ) )
		.pipe(rename(function(path){
			path.basename = "TldRegex";
			path.extname = '.js';
		}))
		.pipe(gulp.dest('./src/matcher/'));
}

