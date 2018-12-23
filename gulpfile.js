/*jshint node:true */
const _               = require( 'lodash' ),
      clean           = require( 'gulp-clean' ),
      connect         = require( 'gulp-connect' ),
	  download        = require( 'gulp-download' ),
	  exec            = require( 'child-process-promise' ).exec,
	  fs              = require( 'fs' ),
      gulp            = require( 'gulp' ),
	  header          = require( 'gulp-header' ),
	  jasmine         = require( 'gulp-jasmine' ),
	  json5           = require( 'json5' ),
	  merge           = require( 'merge-stream' ),
	  mkdirp          = require( 'mkdirp' ),
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
      banner = createBanner();

const tsconfigContents = json5.parse( fs.readFileSync( './tsconfig.json', 'utf-8' ) ),
      tsconfig = _.merge( {}, tsconfigContents, {
		  compilerOptions: {
			  noEmit: false,  // Note: noEmit set to 'true' in tsconfig.json to prevent accidental use of 'tsc' command
		  }
	  } );

// Build src private tasks
gulp.task( 'clean-src-output', cleanSrcOutputTask );

gulp.task( 'build-src-typescript-commonjs', buildSrcTypeScriptCommonjsTask );
gulp.task( 'build-src-typescript-es2015', buildSrcTypeScriptEs2015Task );
gulp.task( 'build-src-typescript', gulp.parallel( 'build-src-typescript-commonjs', 'build-src-typescript-es2015' ) );
gulp.task( 'build-src-rollup', buildSrcRollupTask );
gulp.task( 'build-src-add-header-to-umd', buildSrcAddHeaderToUmdTask );
gulp.task( 'build-src-minify-umd', buildSrcMinifyUmdTask );

gulp.task( 'do-build-src', gulp.series( 
	'build-src-typescript',
	'build-src-rollup',
	'build-src-add-header-to-umd', 
	'build-src-minify-umd'
), )

// Build examples private tasks
gulp.task( 'clean-examples-output', cleanExamplesOutputTask );

gulp.task( 'build-examples-typescript', buildExamplesTypeScriptTask );
gulp.task( 'build-examples-rollup', buildExamplesRollupTask );

gulp.task( 'do-build-examples', gulp.series( 
	'build-examples-typescript',
	'build-examples-rollup'
) );

// Docs private tasks
gulp.task( 'doc-setup', docSetupTask );
gulp.task( 'doc-create', docTask );

gulp.task( 'do-doc', gulp.series( 'doc-setup', 'doc-create' ) );

// Tests private tasks
gulp.task( 'clean-unit-tests', cleanUnitTestsTask );
gulp.task( 'clean-integration-tests', cleanIntegrationTestsTask );
gulp.task( 'clean-tests', gulp.parallel( 'clean-unit-tests', 'clean-integration-tests' ) );

gulp.task( 'build-unit-tests', buildTestsTypeScriptTask );
gulp.task( 'build-integration-tests', buildIntegrationTestsTask );
gulp.task( 'run-unit-tests', runUnitTestsTask );
gulp.task( 'run-integration-tests', runIntegrationTestsTask );

gulp.task( 'do-test', gulp.series( 
	gulp.parallel( 
		gulp.series( 'build-unit-tests', 'run-unit-tests' ), 
		gulp.series( 'build-integration-tests', 'run-integration-tests' )
	)
) );


// Main Tasks
gulp.task( 'clean-all', gulp.parallel(
	'clean-src-output',
	'clean-examples-output'
) );

gulp.task( 'build-all', gulp.series(
	'clean-all',
	gulp.parallel(
		gulp.series( 'do-build-src', 'do-doc' ),
		'do-build-examples'
	)
) );
gulp.task( 'build', gulp.series( 'build-all' ) );
gulp.task( 'build-src', gulp.series( 'clean-src-output', 'do-build-src' ) );
gulp.task( 'build-examples', gulp.series( 'clean-examples-output', 'do-build-examples' ) );
gulp.task( 'clean', gulp.series( 'clean-all' ) );
gulp.task( 'doc', gulp.series( 'build-src', 'do-doc' ) );

gulp.task( 'serve', gulp.series( gulp.parallel( 'build-examples', 'doc' ), serveTask ) );
gulp.task( 'test', gulp.series( gulp.parallel( 'clean-tests', 'build-src' ), 'do-test' ) );
gulp.task( 'update-tld-regex', updateTldRegex );

gulp.task( 'default', gulp.series( 'build-all', 'do-doc', 'do-test' ) );


// -----------------------------------------------------


function cleanSrcOutputTask() {
	return gulp.src( './dist', { read: false, allowEmpty: true } )
        .pipe( clean() );
}

function buildSrcTypeScriptCommonjsTask() {
	const tsProject = typescript.createProject( Object.assign( {}, tsconfig.compilerOptions, {
		module: 'commonjs'
	} ) );
	
	return buildSrcTypeScript( tsProject, './dist/commonjs' );
}

function buildSrcTypeScriptEs2015Task() {
	const tsProject = typescript.createProject( Object.assign( {}, tsconfig.compilerOptions, {
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
	return exec( `./node_modules/.bin/rollup ./dist/es2015/autolinker.js --file ./dist/Autolinker.js --format umd --name "Autolinker" --sourcemap` );
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


function cleanExamplesOutputTask() {
	return gulp.src( [
		'./docs/examples/live-example/build',
		'./docs/examples/live-example/live-example-all.js'
	], { read: false, allowEmpty: true } )
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
	return exec( `./node_modules/.bin/rollup ./docs/examples/live-example/build/main.js --format iife --file ./docs/examples/live-example/live-example-all.js` );
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


function runUnitTestsTask( done ) {
	return gulp.src( './build/**/*.spec.js' )
		.pipe( jasmine( { verbose: false, includeStackTrace: true } ) );
}

function cleanUnitTestsTask() {
	return gulp.src( './build', { read: false, allowEmpty: true } )
        .pipe( clean() );
}

function cleanIntegrationTestsTask() {
	return gulp.src( './.tmp/tests-integration', { read: false, allowEmpty: true } )
		.pipe( clean() );
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

async function buildIntegrationTestsTask( done ) {
	mkdirp.sync( './.tmp/tests-integration' );

	await exec( `./node_modules/.bin/yarn pack --filename ./.tmp/tests-integration/autolinker.tar.gz`, { 
		cwd: __dirname 
	} );
	await streamToPromise(
		gulp.src( './tests-integration/**' )
			.pipe( gulp.dest( './.tmp/tests-integration' ) )
	);
	// Note: yarn was caching old versions of the tarball, even with --force
	// Using npm here instead.
	await exec( `${__dirname}/node_modules/.bin/npm install ./autolinker.tar.gz --force`, { 
		cwd: `${__dirname}/.tmp/tests-integration`
	} );
	await streamToPromise(
		gulp.src( './.tmp/tests-integration/**/*.ts' )
			.pipe( typescript( tsconfig.compilerOptions ) )
			.pipe( gulp.dest( './.tmp/tests-integration' ) )
	);
}


function runIntegrationTestsTask() {
	return gulp.src( './.tmp/tests-integration/**/*.spec.js' )
		.pipe( jasmine( { verbose: false, includeStackTrace: true } ) );
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


function updateTldRegex(){
	return download( 'http://data.iana.org/TLD/tlds-alpha-by-domain.txt' )
		.pipe( transform( domainsToRegex, { encoding: 'utf8' } ) )
		.pipe( header( '// NOTE: THIS IS A GENERATED FILE\n// To update with the latest TLD list, run `npm run update-tld-regex` or `yarn update-tld-regex` (depending on which you have installed)\n\n' ) )
		.pipe( rename( path => {
			path.basename = "tld-regex";
			path.extname = '.ts';
		} ) )
		.pipe( gulp.dest( './src/matcher/' ) );
}


function domainsToRegex(contents){
	contents = contents
		.split( '\n' )
		.filter( notCommentLine )
		.map( dePunycodeDomain );
	
	contents = [].concat.apply([], contents);
	contents = contents.filter( s => !!s );  // remove empty elements
	contents.sort( compareLengthLongestFirst );
	contents = contents.join('|');
	contents = 'export const tldRegex = /(?:' + contents + ')/;\n';

	return contents;
}

function notCommentLine(line){
	return !/^#/.test(line);
}

function dePunycodeDomain(d){
	d = d.toLowerCase();
	if (/xn--/.test(d)){
		return [d, punycode.toUnicode(d)];
	}
	return [d];
}

function compareLengthLongestFirst(a, b){
	var result = b.length - a.length;
	if (result === 0) {
		result = a.localeCompare(b);
	}
	return result;
}


/**
 * Helper function to turn a stream into a promise
 */
function streamToPromise( stream ) {
	return new Promise( ( resolve, reject ) => {
		stream.on( "end", resolve );
		stream.on( "error", reject );
	} );
}