import dedent from 'dedent';
import fs from 'fs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupCommonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

export default {
    // Roll up directly from the src .ts files so that the generated source map
    // refers to the .ts files' contents rather than the intermediary .js files'
    // contents (such as in the './dist/es2015' directory)
    input: './src/autolinker.ts',

    output: {
        file: './dist/autolinker.js',
        format: 'umd',
        name: 'Autolinker',
        sourcemap: true,
        banner: dedent`
            /*!
             * Autolinker.js
             * v${pkg.version}
             *
             * Copyright(c) ${new Date().getFullYear()} ${pkg.author}
             * ${pkg.license} License
             *
             * ${pkg.homepage}
             */
        `,
    },
    plugins: [
        nodeResolve({
            browser: true,
        }),
        rollupCommonjs(),
        typescript({
            compilerOptions: {
                declaration: false, // don't need declaration files for the rolled up autolinker.js file
            }
        }),
    ],
    treeshake: true,
};
