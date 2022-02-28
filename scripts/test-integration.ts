import fse from "fs-extra";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { webpack } from "webpack";
import { execSync } from "./util/exec-sync";

/**
 * This script creates a ./.tmp/tests-integration folder where we install the
 * actual Autolinker package from its .tgz, and run tests against it.
 */

(async () => {
    const pkgRoot = path.normalize(`${__dirname}/..`);
    const pkg = require(`${pkgRoot}/package.json`);
    const testsSrcDir = path.normalize(`${pkgRoot}/tests-integration`);
    const testsOutputDir = path.normalize(`${pkgRoot}/.tmp/tests-integration`);

    // Clean first and re-create
    fse.removeSync(testsOutputDir);
    fse.mkdirpSync(testsOutputDir);

    // Copy everything from ./tests-integration to ./.tmp/tests-integration
    fse.copySync(testsSrcDir, testsOutputDir);

    // Create a .tar.gz output file like the one that would be downloaded from npm
    // TODO: Was using 'yarn' - does npm have a --filename arg?
    //await exec( `./node_modules/.bin/yarn pack --filename ./.tmp/tests-integration/autolinker.tar.gz`, {
    execSync(
        `${pkgRoot}/node_modules/.bin/npm pack --pack-destination ${testsOutputDir}`,
        {
            cwd: pkgRoot,
        }
    );

    // Locally install the package created in the first step into the ./.tmp/tests-integration
    // directory. Note: yarn was caching old versions of the tarball, even
    // with --force, so using npm here instead.
    execSync(
        `${pkgRoot}/node_modules/.bin/npm install ./autolinker-${pkg.version}.tgz --force`,
        {
            cwd: testsOutputDir,
        }
    );

    // Compile the test-webpack-typescript test project
    await buildWebpackTypeScriptTestProject();

    // And finally, run the tests
    execSync(
        `node --require=ts-node/register node_modules/jasmine/bin/jasmine.js "${testsOutputDir}/**/*.spec.ts"`
    );

    async function buildWebpackTypeScriptTestProject() {
        const testProjectDir = path.normalize(
            `${testsOutputDir}/test-webpack-typescript`
        );

        return new Promise<void>((resolve, reject) => {
            webpack(
                {
                    context: testProjectDir,
                    entry: path.resolve(testProjectDir, "./page.ts"),
                    output: {
                        path: path.resolve(testProjectDir, "./webpack-output"),
                    },
                    mode: "production",
                    module: {
                        rules: [
                            {
                                test: /\.ts$/,
                                loader: "ts-loader",
                            },
                        ],
                    },
                    plugins: [
                        new HtmlWebpackPlugin({
                            template: path.resolve(
                                testProjectDir,
                                "./page.html"
                            ),
                        }),
                    ],
                },
                (err, stats) => {
                    if (err || stats?.hasErrors()) {
                        console.error(stats?.toString());
                        reject(err || stats?.toString());
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
})();
