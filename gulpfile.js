/*jshint node:true */
"use strict";
const _                 = require( 'lodash' ),
      clean             = require( 'gulp-clean' ),
      connect           = require( 'gulp-connect' ),
	  download          = require( 'gulp-download' ),
	  exec              = require( 'child-process-promise' ).exec,
	  fs                = require( 'fs-extra' ),
      gulp              = require( 'gulp' ),
	  header            = require( 'gulp-header' ),
	  HtmlWebpackPlugin = require( 'html-webpack-plugin' ),
	  jasmine           = require( 'gulp-jasmine' ),
      JsDuck            = require( 'gulp-jsduck' ),
	  json5             = require( 'json5' ),
	  mergeStream       = require( 'merge-stream' ),
	  mkdirp            = require( 'mkdirp' ),
	  path              = require( 'path' ),
	  preprocess        = require( 'gulp-preprocess' ),
      punycode          = require( 'punycode' ),
	  rename            = require( 'gulp-rename' ),
	  replace           = require( 'gulp-replace' ),
	  rollup            = require( 'rollup' ),
	  rollupResolveNode = require( 'rollup-plugin-node-resolve' ),
	  rollupCommonjs    = require( 'rollup-plugin-commonjs' ),
	  size              = require( 'gulp-size' ),
	  sourcemaps        = require( 'gulp-sourcemaps' ),
      transform         = require( 'gulp-transform' ),
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

	return mergeStream( [
		tsResult.dts
			.pipe( gulp.dest( outputDir ) ),

		tsResult.js
			.pipe( sourcemaps.write( '.' ) )
			.pipe( gulp.dest( outputDir ) )
	] );
}


/**
 * Ultimate in hackery: by default, with TypeScript's default commonjs output of
 * the source ES6 modules, users would be required to `require()` Autolinker in 
 * the following way:
 * 
 *     const Autolinker = require( 'autolinker' ).default;   // (ugh)
 * 
 * In order to maintain backward compatibility with the v1.x interface, and to 
 * make things simpler for users, we want to allow the following statement:
 * 
 *     const Autolinker = require( 'autolinker' );
 * 
 * In order to get this to work, we need to change the generated output index.js 
 * line: 
 *     exports.default = autolinker_1.default; 
 * to:
 *     exports = autolinker_1.default;   // make the Autolinker class the actual export
 * 
 * This function essentially changes the generated index.js from its original 
 * content of:
 * 
 *     "use strict";
 *     function __export(m) {
 *         for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
 *     }
 *     Object.defineProperty(exports, "__esModule", { value: true });
 *     var autolinker_1 = require("./autolinker");
 *     exports.default = autolinker_1.default;   // <-- target of change
 *     var autolinker_2 = require("./autolinker");
 *     exports.Autolinker = autolinker_2.default;
 *     __export(require("./anchor-tag-builder"));
 *     __export(require("./html-tag"));
 *     __export(require("./match/index"));
 *     __export(require("./matcher/index"));
 * 
 * to this:
 * 
 *     "use strict";
 *     function __export(m) {
 *         for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
 *     }
 *     Object.defineProperty(exports, "__esModule", { value: true });
 *     var autolinker_1 = require("./autolinker");
 * 
 *     // Note: the following two lines are added by gulpfile.js's buildSrcFixCommonJsIndexTask() to allow require('autolinker') to work correctly
 *     exports = module.exports = autolinker_1.default;                  // redefine 'exports' object as the Autolinker class itself
 *     Object.defineProperty( exports, "__esModule", { value: true } );  // redeclare '__esModule' on new 'exports' object
 * 
 *     exports.default = autolinker_1.default;    // continue to allow 'default' property import for ES6 default import
 *     var autolinker_2 = require("./autolinker");
 *     exports.Autolinker = autolinker_2.default;
 *     __export(require("./anchor-tag-builder"));
 *     __export(require("./html-tag"));
 *     __export(require("./match/index"));
 *     __export(require("./matcher/index"));
 */
async function buildSrcFixCommonJsIndexTask() {
	const indexJsContents = fs.readFileSync( './dist/commonjs/index.js', 'utf-8' )
		.replace( 'exports.default =', `
			// Note: the following two lines are added by gulpfile.js's buildSrcFixCommonJsIndexTask() to allow require('autolinker') to work correctly
			exports = module.exports = autolinker_1.default;                  // redefine 'exports' object as the Autolinker class itself
			Object.defineProperty( exports, "__esModule", { value: true } );  // redeclare '__esModule' on new 'exports' object

			exports.default =
		`.trimRight().replace( /^\t{3}/gm, '' ) );
	
	fs.writeFileSync( './dist/commonjs/index.js', indexJsContents );
}


async function buildSrcRollupTask() {
	// create a bundle
	const bundle = await rollup.rollup( {
		input: './dist/es2015/autolinker.js',
		plugins: [
			rollupResolveNode( {
				jsnext: true,
				browser: true,
			} ),
			rollupCommonjs()
		],
		treeshake: true
	} );

	// write the bundle to disk
	return bundle.write( {
		file: './dist/Autolinker.js',
		format: 'umd',
		name: 'Autolinker',
		sourcemap: true
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
	const maxExpectedSizeInKb = 46;
	
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
			rollupResolveNode( {
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


function runUnitTestsTask() {
	return gulp.src( './.tmp/tests-unit/**/*.spec.js' )
		.pipe( jasmine( { verbose: false, includeStackTrace: true } ) );
}

function cleanUnitTestsTask() {
	return gulp.src( './.tmp/tests-unit', { read: false, allowEmpty: true } )
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

	return tsResult.js.pipe( gulp.dest( './.tmp/tests-unit' ) );
}

async function buildIntegrationTestsTask() {
	mkdirp.sync( './.tmp/tests-integration' );

	// First, create a .tar.gz output file like the one that would be downloaded
	// from npm
	await exec( `./node_modules/.bin/yarn pack --filename ./.tmp/tests-integration/autolinker.tar.gz`, { 
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
			entry: path.resolve( testsIntegrationTmpDir, './page.ts' ),
			output: {
				path: path.resolve( testsIntegrationTmpDir, './webpack-output' )
			},
			mode: 'production',
			module: {
				rules: [
					{ 
						test: /\.ts$/, 
						loader: 'awesome-typescript-loader', 
						options: {
							configFileName: path.resolve( testsIntegrationTmpDir, 'tsconfig.json' )
						} 
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