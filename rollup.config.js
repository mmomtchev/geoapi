import resolve from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import executable from 'rollup-plugin-executable';

export default [
	{
		input: 'src/index.js',
		output: {
			file: 'geoapi.js',
			format: 'es',
			compact: true,
			banner: '#!/usr/bin/env node\n'
		},
		external: builtins,
		plugins: [
			resolve({
				preferBuiltins: true
			}),
			commonjs({
				include: [
					'src/*.js',
					'*.json',
					'node_modules/**',
				],
			}),
			json(),
			terser({
				mangle: false
			}),
			executable()
		]
	},
	{
		input: 'src/download.js',
		output: {
			file: 'download.js',
			format: 'es',
			compact: true,
			banner: '#!/usr/bin/env node\n'
		},
		external: builtins,
		plugins: [
			resolve({
				preferBuiltins: true
			}),
			commonjs({
				include: [
					'src/*.js',
					'*.json',
					'node_modules/**',
				],
			}),
			json(),
			terser({
				mangle: false
			}),
			executable()
		]
	}

];
