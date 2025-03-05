import nodeResolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import babel from '@rollup/plugin-babel';

const useESBuild = process.env.USE_ESBUILD === 'true';

// we still use babel to stay consistent even though esbuild can compile to lower target.
// esbuild might not be able to transform all of rrweb's latest syntax https://github.com/evanw/esbuild/issues/297#issuecomment-1670072906
const useBabel = useESBuild || process.env.USE_BABEL === 'true';


const plugins = [
    nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
    })
];

if (useBabel) {
    plugins.push(
        babel({
            babelHelpers: 'bundled',
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            'chrome': '55',
                            'ie': '11'
                        },
                        'debug': true
                    }
                ]
            ],
            include: 'node_modules/**',
        })
    );
}

if (useESBuild) {
    plugins.push(
        esbuild({ target: 'es5', minify: true, sourceMap: true })
    );
}

export default { plugins };
