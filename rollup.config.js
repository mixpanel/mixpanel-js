import nodeResolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import babel from '@rollup/plugin-babel';

const useBabel = process.env.USE_BABEL === 'true';
const useESBuild = process.env.USE_ESBUILD === 'true';

export default {
    plugins: [
        nodeResolve({
            browser: true,
            main: true,
            jsnext: true,
        }),
        ...(useBabel ? [babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })] : []),
        ...(useESBuild ? [esbuild({ minify: true, sourceMap: true })] : [])
    ]
};
