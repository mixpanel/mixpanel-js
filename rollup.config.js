import npm from 'rollup-plugin-npm';
import baseOptions from './rollup.base';

export default {
    plugins: [
        npm(baseOptions)
    ]
}
