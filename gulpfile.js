/*jshint node:true */
"use strict";
const _                 = require( 'lodash' ),
      clean             = require( 'gulp-clean' ),
      connect           = require( 'gulp-connect' ),
	  download          = require( 'gulp-download2' ),
	  exec              = require( 'child-process-promise' ).exec,
	  fs                = require( 'fs-extra' ),
      gulp              = require( 'gulp' ),
	  header            = require( 'gulp-header' ),
	  HtmlWebpackPlugin = require( 'html-webpack-plugin' ),
	  jasmine           = require( 'gulp-jasmine' ),
      JsDuck            = require( 'gulp-jsduck2' ),
	  json5             = require( 'json5' ),
	  mergeStream       = require( 'merge-stream' ),
	  mkdirp            = require( 'mkdirp' ),
	  path              = require( 'path' ),
	  preprocess        = require( 'gulp-preprocess' ),
	  rename            = require( 'gulp-rename' ),
	  replace           = require( 'gulp-replace' ),
	  rollup            = require( 'rollup' ),
	  rollupResolveNode = require( '@rollup/plugin-node-resolve' ),
	  rollupCommonjs    = require( '@rollup/plugin-commonjs' ),
	  size              = require( 'gulp-size' ),
	  sourcemaps        = require( 'gulp-sourcemaps' ),
      typescript        = require( 'gulp-typescript' ),
	  uglify            = require( 'gulp-uglify' ),
	  webpack           = require( 'webpack' );

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
gulp.task( 'build-src-fix-commonjs-index', buildSrcFixCommonJsIndexTask );
gulp.task( 'build-src-rollup', buildSrcRollupTask );
gulp.task( 'build-src-add-header-to-umd', buildSrcAddHeaderToUmdTask );
gulp.task( 'build-src-minify-umd', buildSrcMinifyUmdTask );
gulp.task( 'build-src-check-minfied-size', buildSrcCheckMinifiedSizeTask );

gulp.task( 'do-build-src', gulp.series( 
	'build-src-typescript',
	'build-src-fix-commonjs-index',
	'build-src-rollup',
	'build-src-add-header-to-umd', 
	'build-src-minify-umd',
	'build-src-check-minfied-size'
) );

// Build example private tasks
gulp.task( 'clean-example-output', cleanExampleOutputTask );

gulp.task( 'build-example-copy-to-docs-dir', copyExampleToDocsDir );
gulp.task( 'build-example-typescript', buildExampleTypeScriptTask );
gulp.task( 'build-example-rollup', buildExampleRollupTask );

gulp.task( 'do-build-example', gulp.series( 
	'build-example-copy-to-docs-dir',
	'build-example-typescript',
	'build-example-rollup'
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
	gulp.parallel( 'build-unit-tests', 'build-integration-tests' ),
	// IMPORTANT: Seems we have to run the unit tests first, and then the 
	// integration tests after. The gulp-jasmine plugin doesn't seem to like two
	// running at the same time
	'run-unit-tests',
	'run-integration-tests'
) );
gulp.task( 'do-unit-tests', gulp.series( 'build-unit-tests', 'run-unit-tests' ) );  // just runs the unit tests without the integration tests
gulp.task( 'do-integration-tests', gulp.series( 'build-integration-tests', 'run-integration-tests' ) );  // just runs the integration tests without the unit tests


// Main Tasks
gulp.task( 'clean-all', gulp.parallel(
	'clean-src-output',
	'clean-example-output',
	'clean-tests'
) );

gulp.task( 'build-all', gulp.series(
	'clean-all',
	'do-build-src',
	'do-build-example', 
	'do-doc'
) );
gulp.task( 'build', gulp.series( 'build-all' ) );
gulp.task( 'build-src', gulp.series( 'clean-src-output', 'do-build-src' ) );
gulp.task( 'build-example', gulp.series( 'clean-example-output', 'do-build-example' ) );
gulp.task( 'clean', gulp.series( 'clean-all' ) );
gulp.task( 'doc', gulp.series( 'build-src', 'do-doc' ) );

gulp.task( 'serve', gulp.series( 'build-src', 'build-example', serveTask ) );
gulp.task( 'test', gulp.series( 'build-src', 'build-example', 'clean-tests', 'do-test' ) );
gulp.task( 'test-unit', gulp.series( 'clean-unit-tests', 'do-unit-tests' ) );  // just runs the unit tests without the integration tests
gulp.task( 'test-integration', gulp.series( 'build-src', 'clean-integration-tests', 'do-integration-tests' ) );  // just runs the integration tests without the unit tests
gulp.task( 'update-tld-regex', updateTldRegex );

gulp.task( 'default', gulp.series( 'build-all', 'do-doc', 'do-test' ) );


// -----------------------------------------------------



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
		.pipe( uglify( { 
			output: { 
				comments: /^!/  // preserve license comment
			}
		} ) )
		.pipe( rename( 'Autolinker.min.js' ) )
		.pipe( size( { showFiles: true, showTotal: false } ) )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( './dist' ) );
}


/**
 * Checks that we don't accidentally add an extra dependency that bloats the
 * minified size of Autolinker
 */
async function buildSrcCheckMinifiedSizeTask() {
	const stats = await fs.stat( './dist/Autolinker.min.js' );
	const sizeInKb = stats.size / 1000;
	const maxExpectedSizeInKb = 46.5;
	
	if( sizeInKb > maxExpectedSizeInKb ) {
		throw new Error( `
			Minified file size of ${sizeInKb.toFixed( 2 )}kb is greater than max 
			expected minified size of ${maxExpectedSizeInKb}kb
			
			This check is to make sure that a dependency is not accidentally 
			added which significantly inflates the size of Autolinker. If 
			additions to the codebase have been made though and a higher size 
			is expected, bump the 'maxExpectedSizeInKb' number in gulpfile.js
		`.trim().replace( /^\t*/gm, '' ) );
	}
}


function cleanExampleOutputTask() {
	return mergeStream(
		gulp.src( './.tmp/live-example', { read: false, allowEmpty: true } )
			.pipe( clean() ),
			
		gulp.src( [ 
			'./docs/examples/index.html',
			'./docs/examples/live-example.js',
			'./docs/examples/live-example.css'
		], { read: false, allowEmpty: true } )
			.pipe( clean() ),

		gulp.src( './docs/dist', { read: false, allowEmpty: true } )
			.pipe( clean() ),
	);
}

function copyExampleToDocsDir() {
	return mergeStream(
		gulp.src( './live-example/index.html' )
			.pipe( header( '<!-- NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR\n     CHANGES WILL BE OVERWRITTEN!!! -->\n\n' ) )
			.pipe( gulp.dest( './docs/examples/' ) ),

		gulp.src( './live-example/live-example.css' )
			.pipe( header( '/* NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR\n   CHANGES WILL BE OVERWRITTEN!!! */\n\n' ) )
			.pipe( gulp.dest( './docs/examples/' ) ),

		// Move dist files into the docs/ folder so they can be served
		// by the example page within GitHub pages
		gulp.src( `./dist/Autolinker*.js` )
			.pipe( gulp.dest( './docs/dist' ) ),
	);
}

function buildExampleTypeScriptTask() {
	return gulp.src( './live-example/src/**/*.ts' )
		.pipe( typescript( './live-example/tsconfig.json' ) )
		.pipe( header( '// NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR\n// CHANGES WILL BE OVERWRITTEN!!!\n\n' ) )
		.pipe( gulp.dest( './.tmp/live-example/' ) );
}

async function buildExampleRollupTask() {
	// create a bundle
	const bundle = await rollup.rollup( {
		input: './.tmp/live-example/main.js',
		plugins: [
			rollupResolveNode.nodeResolve( {
				jsnext: true,
				browser: true,
			} ),
			rollupCommonjs()
		]
	} );

	// write the bundle to disk
	return bundle.write( {
		file: './docs/examples/live-example.js',
		format: 'iife',
		sourcemap: false
	} );
}


function docSetupTask() {
	return mergeStream(
		// TypeScript adds its own @class decorator to ES5 constructor functions. 
		// We want to remove this so we don't confuse JSDuck with extra classes
		// in the output
		gulp.src( './dist/commonjs/**/*.js' )
			.pipe( replace( '/** @class */', '' ) )
			.pipe( gulp.dest( './.tmp/docs-src' ) )
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
		'./.tmp/docs-src/html-tag.js',  // we need to make sure html-tag.js is parsed first so that Autolinker.HtmlTag gets the correct class description rather than the static property found in autolinker.js
		'./.tmp/docs-src/**/*.js' 
	] )
		.pipe( jsDuck.doc() );
}


function serveTask() {
	gulp.watch( './live-example/**/*.(html|css|ts)', gulp.series( 'build-example' ) );
	gulp.watch( './src/**', gulp.series( 'build-src', 'build-example' ) );

	connect.server();
}

function cleanIntegrationTestsTask() {
	return gulp.src( './.tmp/tests-integration', { read: false, allowEmpty: true } )
		.pipe( clean() );
}

async function buildIntegrationTestsTask() {
	mkdirp.sync( './.tmp/tests-integration' );

	// First, create a .tar.gz output file like the one that would be downloaded
	// from npm
	// TODO: Was using 'yarn' - does npm have a --filename arg?
	//await exec( `./node_modules/.bin/yarn pack --filename ./.tmp/tests-integration/autolinker.tar.gz`, { 
	await exec( `./node_modules/.bin/npm pack --pack-destination ./.tmp/tests-integration`, { 
		cwd: __dirname
	} );

	// Copy everything from ./tests-integration to ./.tmp/tests-integration
	await streamToPromise(
		gulp.src( './tests-integration/**' )
			.pipe( gulp.dest( './.tmp/tests-integration' ) )
	);

	// Locally install the package created in the first step into the ./.tmp/tests-integration
	// directory. Note: yarn was caching old versions of the tarball, even 
	// with --force, so using npm here instead.
	await exec( `${__dirname}/node_modules/.bin/npm install ./autolinker.tar.gz --force`, { 
		cwd: `${__dirname}/.tmp/tests-integration`
	} );

	// Compile the .spec.ts files into .spec.js so we can run them
	await streamToPromise(
		gulp.src( './.tmp/tests-integration/**/*.spec.ts' )
			.pipe( typescript( tsconfig.compilerOptions ) )
			.pipe( gulp.dest( './.tmp/tests-integration' ) )
	);

	// Compile the test-webpack-typescript test project
	await buildWebpackTypeScriptTestProject();
}


async function buildWebpackTypeScriptTestProject() {
	const testsIntegrationTmpDir = path.join( __dirname, '.tmp', 'tests-integration', 'test-webpack-typescript' );

	return new Promise( ( resolve, reject ) => {
		webpack( {
			context: testsIntegrationTmpDir,
			entry: path.resolve(testsIntegrationTmpDir, './page.ts'),
			output: {
				path: path.resolve(testsIntegrationTmpDir, './webpack-output')
			},
			mode: 'production',
			module: {
				rules: [
					{ 
						test: /\.ts$/, 
						loader: 'ts-loader'
					}
				]
			},
			plugins: [
				new HtmlWebpackPlugin( { template: path.resolve( testsIntegrationTmpDir, './page.html' ) } )
			]
		}, ( err, stats ) => {
			if( err || stats.hasErrors() ) {
				console.error( stats.toString() );
				reject( err || stats.toString() );
			} else {
				resolve();
			}
		} );
	} );
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

/**
 * Helper function to turn a stream into a promise
 */
function streamToPromise( stream ) {
	return new Promise( ( resolve, reject ) => {
		stream.on( "end", resolve );
		stream.on( "error", reject );
	} );
}