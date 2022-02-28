import dedent from 'dedent';
import fs from 'fs';
import path from 'path';

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
const commonJsDir = path.normalize(`${__dirname}/../dist/commonjs`);
const indexJsContents = fs.readFileSync(`${commonJsDir}/index.js`, 'utf-8' )
    .replace('"use strict";', dedent`
        "use strict";
        // Note: the following line is added by scripts/fix-common-js-output.ts to allow require('autolinker') to work correctly
        exports = module.exports = require('./autolinker').default;  // redefine 'exports' object as the Autolinker class itself
    `);

fs.writeFileSync(`${commonJsDir}/index.js`, indexJsContents);
