import glob from 'fast-glob';
import fse from 'fs-extra';
import path from 'path';

// Note: the JSDuck python gem must be installed manually using:
//   gem install jsduck
const JsDuck = require('jsduck'); // eslint-disable-line @typescript-eslint/no-require-imports

const pkgRoot = path.normalize(`${__dirname}/..`);
const pkg = fse.readJsonSync(`${pkgRoot}/package.json`);

// First need to create a temporary directory for all of the files to document
// because we need to modify them just a bit before JsDuck takes over
const docsSrcDir = `${pkgRoot}/.tmp/docs-src`;
fse.copySync(`${pkgRoot}/dist/commonjs`, docsSrcDir);

const jsFiles = glob.sync('**/*.js', {
    cwd: docsSrcDir,
    absolute: true,
    onlyFiles: true,
});

// TypeScript adds its own @class decorator to ES5 constructor functions.
// We want to remove this so we don't confuse JSDuck into thinking there are
// extra classes in the output
for (const jsFile of jsFiles) {
    const contents = fse.readFileSync(jsFile, 'utf-8');
    const newContents = contents.replace(/\/\*\* @class \*\//g, '');
    fse.writeFileSync(jsFile, newContents, 'utf-8');
}

const jsDuck = new JsDuck([
    '--out',
    `${pkgRoot}/docs/api`,
    '--title',
    'Autolinker v' + pkg.version + ' API Docs',
    '--examples',
    `${pkgRoot}/docs/examples.json`,
    '--examples-base-url',
    './docs/',
]);
jsDuck.doc([
    `${docsSrcDir}/html-tag.js`, // we need to make sure html-tag.js is parsed first so that Autolinker.HtmlTag gets the correct class description rather than the static property found in autolinker.js
    ...jsFiles,
]);
