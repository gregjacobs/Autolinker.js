const exec = require( 'child_process' ).exec;

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
	  sourcemaps      = require( 'gulp-sourcemaps' ),
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


// Build src private tasks
gulp.task( 'clean-dist', cleanDistTask );
gulp.task( 'build-src-typescript', buildSrcTypeScriptTask );
gulp.task( 'build-src-rollup', buildSrcRollupTask );

// Build examples private tasks
gulp.task( 'clean-examples-build', cleanExamplesBuildTask );
gulp.task( 'clean-examples-output', cleanExamplesOutputTask );
gulp.task( 'clean-examples', gulp.parallel( 'clean-examples-build', 'clean-examples-output' ) );
gulp.task( 'build-examples-typescript', buildExamplesTypeScriptTask );
gulp.task( 'build-examples-rollup', buildExamplesRollupTask );

// Tests private tasks
gulp.task( 'clean-tests', cleanTestsTask );
gulp.task( 'build-tests-typescript', buildTestsTypeScriptTask );
gulp.task( 'build-tests', gulp.series( 'clean-tests', 'build-tests-typescript' ) );

// Documentation private tasks
gulp.task( 'doc', docTask );

// Main Tasks
gulp.task( 'build-src', gulp.series( 'clean-dist', 'build-src-typescript', 'build-src-rollup' ) );
gulp.task( 'build-examples', gulp.series( 'clean-examples', 'build-examples-typescript', 'build-examples-rollup' ) );
gulp.task( 'build-all', gulp.parallel( 'build-src', 'build-examples', 'build-tests' ) );
gulp.task( 'build', gulp.series( 'build-all' ) );
gulp.task( 'serve', gulp.series( gulp.parallel( 'build-examples', 'doc' ), serveTask ) );
gulp.task( 'test', gulp.series( 'build-tests', testTask ) );
gulp.task( 'update-tld-list', updateTldRegex );
gulp.task( 'default', gulp.series( 'build', 'doc', 'test' ) );


// -----------------------------------------------------


function cleanDistTask() {
	return gulp.src( './dist', { read: false } )
        .pipe( clean() ) ;
}

function buildSrcTypeScriptTask() {
	const tsProject = typescript.createProject( 'tsconfig.json' );

	const tsResult = gulp.src( './src/**/*.ts' )
		.pipe( sourcemaps.init() )
		//.pipe( header( banner, { pkg: pkg } ) )
		.pipe( preprocess( { context: { VERSION: pkg.version } } ) )
		.pipe( tsProject() );

	return merge( [
		tsResult.dts
			.pipe( gulp.dest( 'dist' ) ),

		tsResult.js
			.pipe( sourcemaps.write( '.', { sourceRoot: './', includeContent: false } ) )
			.pipe( gulp.dest( 'dist' ) )
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


function buildSrcRollupTask( done ) {
	exec( `./node_modules/.bin/rollup ./build/src/index.js --file ./dist/autolinker.umd.js --format umd --name "Autolinker" --globals=Autolinker:Autolinker --sourcemap`, err => {
		done( err );
	} );

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

function buildTestsTypeScriptTask() {
	const tsProject = typescript.createProject( 'tsconfig.json' );

	const tsResult = gulp.src( [ './+(src|tests)/**/*.ts' ] )
		.pipe( tsProject() );

	return tsResult.js.pipe( gulp.dest( 'build' ) );
}


function cleanExamplesBuildTask() {
	return gulp.src( './docs/examples/live-example/build', { read: false } )
		.pipe( clean() );
}

function cleanExamplesOutputTask() {
	return gulp.src( './docs/examples/live-example/live-example-all.js', { read: false, allowEmpty: true } )
		.pipe( clean() );
}

function buildExamplesTypeScriptTask() {
	return gulp.src( [
		'./docs/examples/live-example/src/Option.ts',
		'./docs/examples/live-example/src/CheckboxOption.ts',
		'./docs/examples/live-example/src/RadioOption.ts',
		'./docs/examples/live-example/src/TextOption.ts',
		'./docs/examples/live-example/src/main.ts'
	] )
		.pipe( typescript( './docs/examples/tsconfig.json' ) )
		.pipe( header( '// NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR\n// CHANGES WILL BE OVERWRITTEN!!!\n\n' ) )
		.pipe( gulp.dest( './docs/examples/live-example/build/' ) );
}

function buildExamplesRollupTask( done ) {
	exec( `./node_modules/.bin/rollup ./docs/examples/live-example/build/main.js --format iife --file ./docs/examples/live-example/live-example-all.js`, err => {
		done( err );
	} );
}


function docTask() {
	// var jsduck = new JsDuck( [
	// 	'--out',               './docs/api',
	// 	'--title',             'Autolinker v' + pkg.version + ' API Docs',
	// 	'--examples',          './docs/examples.json',
	// 	'--examples-base-url', './docs/'
	// ] );

	return merge(
		// Move dist files into the docs/ folder so they can be served
		// by GitHub pages
		gulp.src( `${distFolder}/autolinker.umd*.js` )
			.pipe( gulp.dest( './docs/dist' ) ),

		// 	gulp.src( srcFilesGlob )
		// 		.pipe( jsduck.doc() )
	);
}


function serveTask() {
	gulp.watch( './docs/examples/live-example/src/**', gulp.parallel( 'build-examples' ) );
	gulp.watch( './src/**', gulp.series( 'build-src', 'doc' ) );

	connect.server();
}


function testTask( done ) {
	return gulp.src( './build/**/*.spec.js' )
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

