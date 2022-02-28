import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupCommonjs from '@rollup/plugin-commonjs'; 

export default {
	input: './dist/es2015/autolinker.js',
	output: {
		file: './dist/autolinker.js',
		format: 'umd',
		name: 'Autolinker',
		sourcemap: true
	},
	plugins: [
		nodeResolve( {
			browser: true,
		} ),
		rollupCommonjs()
	],
	treeshake: true
};