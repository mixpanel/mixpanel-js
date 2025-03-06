module.exports = function (api) {
    api.cache(!process.env.DIST);

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    targets: {
                        'chrome': '55',
                        'ie': '11'
                    },
                }
            ]
        ],
        include: 'node_modules/**',
    };
};
