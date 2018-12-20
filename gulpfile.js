/*jshint node:true */
const clean           = require( 'gulp-clean' ),
      clone           = require( 'gulp-clone' ),
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
      transform       = require( 'gulp-transform' ),
      typescript      = require( 'gulp-typescript' ),
      uglify          = require( 'gulp-uglify' ),
      umd             = require( 'gulp-umd' ),
      JsDuck          = require( 'gulp-jsduck' );



// Project configuration
const pkg = require( './package.json' ),
      banner = createBanner(),
	  buildFolder = './build',
      distFolder = './dist',
      distFilename = 'Autolinker.js',
      minDistFilename = 'Autolinker.min.js',
	  minDistFilePath = `${distFolder}/${minDistFilename}`;

const tsProject = typescript.createProject( 'tsconfig.json' );

gulp.task( 'default', [ 'doc', 'test' ] );
gulp.task( 'build', [ 'build-src', 'build-bundle', 'build-examples' ] );
gulp.task( 'build-src', buildSrcTask );
gulp.task( 'build-bundle', buildBundleTask );
gulp.task( 'build-tests', [ 'clean-tests' ], buildTestsTask );
gulp.task( 'build-examples', buildExamples );
gulp.task( 'clean-tests', cleanTestsTask );
gulp.task( 'doc', [ 'build', 'build-examples' ], docTask );
gulp.task( 'serve', [ 'build-examples', 'doc' ], serveTask );
gulp.task( 'test', [ 'build-tests' ], testTask );
gulp.task( 'update-tld-list', updateTldRegex );


function buildSrcTask() {
	const tsResult = gulp.src( './src/**/*.ts' )
		//.pipe( header( banner, { pkg: pkg } ) )
		.pipe( preprocess( { context: { VERSION: pkg.version } } ) )
		.pipe( tsProject() );

	return merge( [
		tsResult.dts.pipe( gulp.dest( 'dist' ) ),
		tsResult.js.pipe( gulp.dest( 'dist' ) )
	] );

	// var combinedSrcFile = gulp.src( srcFiles )
	// 	.pipe( concat( distFilename ) )
	// 	.pipe( umd() )
	// 	.pipe( header( banner, { pkg: pkg } ) );

	// var unminifiedFile = combinedSrcFile
	// 	.pipe( clone() )
	// 	.pipe( preprocess( { context: { VERSION: pkg.version, DEBUG: true } } ) )
	// 	.pipe( gulp.dest( distFolder ) );

	// var minifiedFile = combinedSrcFile
	// 	.pipe( clone() )
	// 	.pipe( preprocess( { context: { VERSION: pkg.version, DEBUG: false } } ) )  // removes DEBUG tagged code
	// 	.pipe( uglify( { preserveComments: 'license' } ) )
	// 	.pipe( rename( minDistFilename ) )
	// 	.pipe( gulp.dest( distFolder ) );

	// return merge( unminifiedFile, minifiedFile );
}


function buildBundleTask() {
	// return rollup({
	// 	entry: './dist/Autolinker.js',
	// 	sourceMap: true
	// })
	// 	// point to the entry file.
	// 	.pipe(source('main.js', './src'))

	// 	// buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
	// 	.pipe(buffer())

	// 	// tell gulp-sourcemaps to load the inline sourcemap produced by rollup-stream.
	// 	.pipe(sourcemaps.init({loadMaps: true}))

	// 	// transform the code further here.

	// 	// if you want to output with a different name from the input file, use gulp-rename here.
	// 	//.pipe(rename('index.js'))

	// 	// write the sourcemap alongside the output file.
	// 	.pipe(sourcemaps.write('.'))

	// 	// and output to ./dist/main.js as normal.
	// 	.pipe(gulp.dest('./dist'));
}


function cleanTestsTask() {
	return gulp.src( './build', { read: false } )
        .pipe( clean()) ;
}

function buildTestsTask() {
	const tsResult = gulp.src( [ './+(src|tests)/**/*.ts' ] )
		.pipe( tsProject() );

	return tsResult.js.pipe( gulp.dest( 'build' ) );
}

function buildExamples() {
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


function serveTask() {
	gulp.watch( './docs/examples/live-example/src/**', [ 'typescript' ] );
	gulp.watch( './src/**', [ 'doc' ] );

	connect.server();
}


function testTask( done ) {
	return gulp.src( './build/**/*Spec.js' )
		.pipe( jasmine( { verbose: false, includeStackTrace: true } ) );
}


function buildExamplesTask() {
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

