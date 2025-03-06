import nodeResolve from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import esbuild from 'rollup-plugin-esbuild';
import alias from '@rollup/plugin-alias';

const COMPILED_RRWEB_PATH = 'build/rrweb-compiled.js';

const aliasRrweb = () => alias({
    entries: [
        { find: 'rrweb', replacement: COMPILED_RRWEB_PATH },
    ]
});

export default [
    // compile rrweb first to es5 with swc, we'll replace the import later on
    {
        'input': 'rrweb',
        'output': [
            {
                file: COMPILED_RRWEB_PATH,
            }
        ],
        plugins: [nodeResolve({browser: true}), swc({swc: {jsc: {target: 'es5'}}})]
    },

    // IIFE recorder bundle that is loaded asynchronously
    // rrweb uses esbuild to minify, so do that here as well
    {
        input: 'src/recorder/index.js',
        output: [
            {
                file: 'build/mixpanel-recorder.js',
                name: 'mixpanel_recorder',
                format: 'iife',
            },
            {
                file: 'build/mixpanel-recorder.min.js',
                name: 'mixpanel_recorder',
                format: 'iife',
                plugins: [esbuild({target: 'es5', minify: true, sourceMap: true})],
                sourcemap: true,
            }
        ],
        plugins: [aliasRrweb()],
    },

    // IIFE main mixpanel build (minified later by closure)
    {
        input: 'src/loaders/loader-globals.js',
        output: [
            {
                file: 'build/mixpanel.globals.js',
                name: 'mixpanel',
                format: 'iife',
            },
        ],
        plugins: [
            nodeResolve({
                browser: true,
                main: true,
                jsnext: true,
            })
        ]
    },

    // IIFE mixpanel snippet loader (minified later by closure)
    {
        input: 'src/loaders/mixpanel-js-wrapper.js',
        output: [
            {
                file: 'build/mixpanel-js-wrapper.js',
            },
        ],
    },

    // IIFE mixpanel core with bundled recorder
    {
        input: 'src/loaders/loader-globals-with-recorder.js',
        output: [
            {
                file: 'build/mixpanel-with-recorder.js',
                name: 'mixpanel',
                format: 'iife',
            },
            {
                file: 'build/mixpanel-with-recorder.min.js',
                name: 'mixpanel',
                format: 'iife',
                plugins: [esbuild({target: 'es5', minify: true, sourceMap: true})],
            },
        ],
        plugins: [
            aliasRrweb(),
            nodeResolve({
                browser: true,
                main: true,
                jsnext: true,
            })
        ],
    },


    // Modules builds that are bundled with the recorder
    {
        input: 'src/loaders/loader-module.js',
        output: [
            {
                file: 'build/mixpanel.cjs.js',
                name: 'mixpanel',
                format: 'cjs',
            },
            {
                file: 'build/mixpanel.amd.js',
                name: 'mixpanel',
                format: 'amd',
            },
            {
                file: 'build/mixpanel.umd.js',
                name: 'mixpanel',
                format: 'umd',
            },
            {
                file: 'build/mixpanel.module.js',
                name: 'mixpanel',
                format: 'es',
            },
        ],
        plugins: [
            aliasRrweb(),
            nodeResolve({
                browser: true,
                main: true,
                jsnext: true,
            })
        ],
    },


    // Alternative CJS builds without recorder
    {
        input: 'src/loaders/loader-module-core.js',
        output: [
            {
                file: 'build/mixpanel-core.cjs.js',
                name: 'mixpanel',
                format: 'cjs',
            },
        ],
        plugins: [
            aliasRrweb(),
            nodeResolve({
                browser: true,
                main: true,
                jsnext: true,
            })
        ],
    },
    {
        input: 'src/loaders/loader-module-with-async-recorder.js',
        output: [
            {
                file: 'build/mixpanel-with-async-recorder.cjs.js',
                name: 'mixpanel',
                format: 'cjs',
            },
        ],
        plugins: [
            aliasRrweb(),
            nodeResolve({
                browser: true,
                main: true,
                jsnext: true,
            })
        ],
    }
];
