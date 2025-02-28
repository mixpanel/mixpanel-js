import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

const useBabel = process.env.USE_BABEL === 'true';

export default {
    plugins: [
        nodeResolve({
            browser: true,
            main: true,
            jsnext: true,
        }),
        ...(useBabel ? [babel({ babelHelpers: 'bundled', presets: ['@babel/preset-env'] })] : []),
    ]
};
