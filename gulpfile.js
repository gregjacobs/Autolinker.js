/*jshint node:true */
const _               = require( 'lodash' ),
      clean           = require( 'gulp-clean' ),
      connect         = require( 'gulp-connect' ),
	  download        = require( 'gulp-download' ),
	  exec            = require( 'child_process' ).exec,
	  fs              = require( 'fs' ),
      gulp            = require( 'gulp' ),
	  header          = require( 'gulp-header' ),
	  jasmine         = require( 'gulp-jasmine' ),
	  json5           = require( 'json5' ),
	  merge           = require( 'merge-stream' ),
	  preprocess      = require( 'gulp-preprocess' ),
      punycode        = require( 'punycode' ),
	  rename          = require( 'gulp-rename' ),
	  replace         = require( 'gulp-replace' ),
	  sourcemaps      = require( 'gulp-sourcemaps' ),
      transform       = require( 'gulp-transform' ),
      typescript      = require( 'gulp-typescript' ),
      uglify          = require( 'gulp-uglify' ),
      JsDuck          = require( 'gulp-jsduck' );

// Project configuration
const pkg = require( './package.json' ),
      tsconfig = json5.parse( fs.readFileSync( './tsconfig.json', 'utf-8' ) ),
      banner = createBanner();


// Build src private tasks
gulp.task( 'clean-dist', cleanDistTask );
gulp.task( 'build-src-typescript-commonjs', buildSrcTypeScriptCommonjsTask );
gulp.task( 'build-src-typescript-es2015', buildSrcTypeScriptEs2015Task );
gulp.task( 'build-src-typescript', gulp.parallel( 'build-src-typescript-commonjs', 'build-src-typescript-es2015' ) );
gulp.task( 'build-src-rollup', buildSrcRollupTask );
gulp.task( 'build-src-add-header-to-umd', buildSrcAddHeaderToUmdTask );
gulp.task( 'build-src-minify-umd', buildSrcMinifyUmdTask );

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

// Docs private tasks
gulp.task( 'doc-setup', docSetupTask );
gulp.task( 'doc-create', docTask );
gulp.task( 'do-doc', gulp.series( 'doc-setup', 'doc-create' ) );

// Main Tasks
gulp.task( 'build-src', gulp.series( 'clean-dist', 'build-src-typescript', 'build-src-rollup', 'build-src-add-header-to-umd', 'build-src-minify-umd' ) );
gulp.task( 'build-examples', gulp.series( 'clean-examples', 'build-examples-typescript', 'build-examples-rollup' ) );
gulp.task( 'build-all', gulp.parallel( 'build-src', 'build-examples', 'build-tests' ) );
gulp.task( 'build', gulp.series( 'build-all' ) );
gulp.task( 'doc', gulp.series( 'build-src', 'do-doc' ) );
gulp.task( 'serve', gulp.series( gulp.parallel( 'build-examples', 'doc' ), serveTask ) );
gulp.task( 'test', gulp.series( 'build-tests', testTask ) );
gulp.task( 'update-tld-list', updateTldRegex );
gulp.task( 'default', gulp.series( 'build', 'do-doc', 'test' ) );


// -----------------------------------------------------


function cleanDistTask() {
	return gulp.src( './dist', { read: false, allowEmpty: true } )
        .pipe( clean() ) ;
}

function buildSrcTypeScriptCommonjsTask() {
	const tsProject = typescript.createProject( _.merge( {}, tsconfig.compilerOptions, {
		noEmit: false,  // Note: noEmit set to 'true' in tsconfig.json to prevent accidental use of 'tsc' command
		module: 'commonjs'
	} ) );
	
	return buildSrcTypeScript( tsProject, './dist/commonjs' );
}

function buildSrcTypeScriptEs2015Task() {
	const tsProject = typescript.createProject( _.merge( {}, tsconfig.compilerOptions, {
		noEmit: false,  // Note: noEmit set to 'true' in tsconfig.json to prevent accidental use of 'tsc' command
		module: 'es2015'
	} ) );

	return buildSrcTypeScript( tsProject, './dist/es2015' );
}


function buildSrcTypeScript( tsProject, outputDir ) {
	const tsResult = gulp.src( './src/**/*.ts' )
		.pipe( preprocess( { context: { VERSION: pkg.version } } ) )
		.pipe( sourcemaps.init() )  // preprocess doesn't seem to support sourcemaps, so initializing it after
		.pipe( tsProject() );

	return merge( [
		tsResult.dts
			.pipe( gulp.dest( outputDir ) ),

		tsResult.js
			.pipe( sourcemaps.write( '.' ) )
			.pipe( gulp.dest( outputDir ) )
	] );
}



function buildSrcRollupTask( done ) {
	exec( `./node_modules/.bin/rollup ./dist/es2015/autolinker.js --file ./dist/Autolinker.js --format umd --name "Autolinker" --sourcemap`, err => {
		done( err );
	} );
}

function buildSrcAddHeaderToUmdTask() {
	return gulp.src( './dist/Autolinker.js' )
		.pipe( sourcemaps.init( { loadMaps: true } ) )
		.pipe( header( banner, { pkg: pkg } ) )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( './dist' ) );
}

function buildSrcMinifyUmdTask() {
	return gulp.src( './dist/Autolinker.js' )
		.pipe( sourcemaps.init( { loadMaps: true } ) )
		.pipe( uglify( { preserveComments: 'license' } ) )
		.pipe( rename( 'Autolinker.min.js' ) )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( './dist' ) );
}


function cleanExamplesBuildTask() {
	return gulp.src( './docs/examples/live-example/build', { read: false , allowEmpty: true } )
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


function docSetupTask() {
	return merge(
		// Move dist files into the docs/ folder so they can be served
		// by GitHub pages
		gulp.src( `./dist/autolinker.umd*.js` )
			.pipe( gulp.dest( './docs/dist' ) ),

		// TypeScript adds its own @class decorator to ES5 constructor functions. 
		// We want to remove this so we don't confuse JSDuck with extra classes
		// in the output
		gulp.src( './dist/commonjs/**/*.js' )
			.pipe( replace( '/** @class */', '' ) )
			.pipe( gulp.dest( './build/docs-src' ) )
	);
}

function docTask() {
	var jsDuck = new JsDuck( [
		'--out',               './docs/api',
		'--title',             'Autolinker v' + pkg.version + ' API Docs',
		'--examples',          './docs/examples.json',
		'--examples-base-url', './docs/'
	] );

	// JSDuck works solely on the file paths rather than the content, so
	// we needed the extra output directory for the transformed input 
	// .js files
	return gulp.src( [ 
		'./build/docs-src/html-tag.js',  // we need to make sure html-tag.js is parsed first so that Autolinker.HtmlTag gets the correct class description rather than the static property found in autolinker.js
		'./build/docs-src/**/*.js' 
	] )
		.pipe( jsDuck.doc() );
}


function serveTask() {
	gulp.watch( './docs/examples/live-example/src/**', gulp.parallel( 'build-examples' ) );
	gulp.watch( './src/**', gulp.series( 'doc' ) );

	connect.server();
}


function testTask( done ) {
	return gulp.src( './build/**/*.spec.js' )
		.pipe( jasmine( { verbose: false, includeStackTrace: true } ) );
}

function cleanTestsTask() {
	return gulp.src( './build', { read: false, allowEmpty: true } )
        .pipe( clean()) ;
}

function buildTestsTypeScriptTask() {
	const tsProject = typescript.createProject( _.merge( {}, tsconfig.compilerOptions, {
		noEmit: false,
		module: 'commonjs'
	} ) );

	const tsResult = gulp.src( [ './+(src|tests)/**/*.ts' ] )
		.pipe( tsProject() );

	return tsResult.js.pipe( gulp.dest( 'build' ) );
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
	return download( 'http://data.iana.org/TLD/tlds-alpha-by-domain.txt' )
		.pipe( transform( domainsToRegex, { encoding: 'utf8' } ) )
		.pipe( header( '// NOTE: THIS IS A GENERATED FILE\n// To update with the latest TLD list, run `gulp update-tld-list`\n\n' ) )
		.pipe( rename(function(path) {
			path.basename = "TldRegex";
			path.extname = '.js';
		}))
		.pipe( gulp.dest('./src/matcher/') );
}

