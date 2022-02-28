import dedent from 'dedent';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupCommonjs from '@rollup/plugin-commonjs'; 

const pkg = require('./package.json');

export default {
    input: './dist/es2015/autolinker.js',
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
        `
    },
    plugins: [
        nodeResolve( {
            browser: true,
        } ),
        rollupCommonjs()
    ],
    treeshake: true
};