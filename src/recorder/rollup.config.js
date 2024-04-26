import esbuild from 'rollup-plugin-esbuild';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
            plugins: [esbuild({minify: true})]
        }
    ],
    plugins: [nodeResolve({browser: true})],
};
