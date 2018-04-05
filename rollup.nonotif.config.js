import npm from 'rollup-plugin-npm';
import virtual from 'rollup-plugin-virtual';

export default {
    plugins: [
        virtual({
            'src/notifications': 'export default function () { throw new Error("Notifications are not included in this build"); }'
        }),
        npm({
            browser: true,
            main: true,
            jsnext: true
        })
    ]
};
