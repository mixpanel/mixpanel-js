import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
    input: 'index.js',
    output: [
        {
            file: 'build/mixpanel-recorder.js',
            format: 'esm'
        },
        {
            file: 'build/mixpanel-recorder.min.js',
            format: 'esm',
            name: 'version',
            plugins: [esbuild({minify: true, sourceMap: true})],
            sourcemap: true,
        }
    ],
    plugins: [
        nodeResolve({browser: true}),
        babel({
            babelHelpers: 'bundled',
            presets: [
                [
                    '@babel/preset-env',
                    {
                        'targets': {
                            'chrome': '55',
                            'ie': '11'
                        },
                        'useBuiltIns': 'usage',
                        'debug': true
                    }
                ]
            ],
            include: 'node_modules/**',
        })
    ],
};
