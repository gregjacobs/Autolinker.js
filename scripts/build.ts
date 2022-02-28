import dedent from 'dedent';
import fse from 'fs-extra';
import path from 'path';
import { execSync as doExecSync, ExecSyncOptions } from 'child_process';

// This script builds the 'src/' to the 'dist/' directory

const pkg = require('../package.json');
const pkgDir = path.normalize(`${__dirname}/..`);

const commonJsOutputDir = './dist/commonjs';
const es2015OutputDir = './dist/es2015';

// First create the 'version' file to allow Autolinker.version to be accessed
fse.outputFileSync(`${pkgDir}/src/version.ts`, dedent`
    // Important: this file is generated from the 'build' script and should not be
    // edited directly
    export const version = '${pkg.version}';
`, 'utf-8');

// Build the output
execSync(`mkdirp dist/commonjs && tsc --module commonjs --outDir ${commonJsOutputDir} --noEmit false`);
execSync(`mkdirp dist/es2015 && tsc --module es2015 --outDir ${es2015OutputDir} --noEmit false`);
execSync(`rollup --config rollup.config.ts && terser dist/autolinker.js --output dist/autolinker.min.js --compress --mangle --source-map "url='autolinker.min.js.map',includeSources=true"`);

fixCommonJsOutput();

// End of script

// -----------------------------

// Helper functions

function execSync(command: string, options: ExecSyncOptions = {}): void {
    // Output the command to keep track of what's going on
    console.log(`> ${command}`);

    doExecSync(command, {
        cwd: pkgDir,  // root dir of the package is the current working directory
        stdio: 'inherit',
        ...options
    });
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
 * In order to get this to work, we need to redefine the `exports` object of 
 * dist/commonjs/index.js to be the Autolinker class itself. To do this, this
 * line is prepended to the file:
 * 
 *     exports = module.exports = require('./autolinker').default;
 * 
 * Then TypeScript will happily assign the `.default` and `.Autolinker` 
 * properties to that new `exports` object.
 * 
 * This function essentially changes the generated index.js from its original 
 * content of:
 * 
 *     "use strict";
 *     Object.defineProperty(exports, "__esModule", { value: true });
 *     exports.Autolinker = void 0;
 *     var tslib_1 = require("tslib");
 *     var autolinker_1 = tslib_1.__importDefault(require("./autolinker"));
 *     exports.Autolinker = autolinker_1.default;
 *     exports.default = autolinker_1.default;
 *     tslib_1.__exportStar(require("./autolinker"), exports);
 *     tslib_1.__exportStar(require("./anchor-tag-builder"), exports);
 *     tslib_1.__exportStar(require("./html-tag"), exports);
 *     tslib_1.__exportStar(require("./match/index"), exports);
 *     tslib_1.__exportStar(require("./matcher/index"), exports);
 * 
 * to this:
 * 
 *     "use strict";
 * 
 *     // Note: the following line is added by gulpfile.js's buildSrcFixCommonJsIndexTask() to allow require('autolinker') to work correctly
 *     exports = module.exports = require('./autolinker').default;  // redefine 'exports' object as the Autolinker class itself
 * 
 *     Object.defineProperty(exports, "__esModule", { value: true });
 *     exports.Autolinker = void 0;
 *     var tslib_1 = require("tslib");
 *     var autolinker_1 = tslib_1.__importDefault(require("./autolinker"));
 *     exports.Autolinker = autolinker_1.default;
 *     exports.default = autolinker_1.default;
 *     tslib_1.__exportStar(require("./autolinker"), exports);
 *     tslib_1.__exportStar(require("./anchor-tag-builder"), exports);
 *     tslib_1.__exportStar(require("./html-tag"), exports);
 *     tslib_1.__exportStar(require("./match/index"), exports);
 *     tslib_1.__exportStar(require("./matcher/index"), exports);
 */
function fixCommonJsOutput() {
    const commonJsOutputAbsDir = path.normalize(`${pkgDir}/${commonJsOutputDir}`);
    const indexJsContents = fse.readFileSync(`${commonJsOutputAbsDir}/index.js`, 'utf-8' )
        .replace('"use strict";', dedent`
            "use strict";
            // Note: the following line is added by scripts/fix-common-js-output.ts to allow require('autolinker') to work correctly
            exports = module.exports = require('./autolinker').default;  // redefine 'exports' object as the Autolinker class itself
        `);

    fse.writeFileSync(`${commonJsOutputAbsDir}/index.js`, indexJsContents);
}
