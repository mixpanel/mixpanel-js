import nodeResolve from '@rollup/plugin-node-resolve';

export default {
    plugins: [
        nodeResolve({
            browser: true,
            main: true,
            jsnext: true,
        })
    ]
};
