import swc from '@rollup/plugin-swc';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// seems rollup source maps + swc sourcemaps don't play well together,
// skip them for interactive testing flows
const COMMON_PLUGINS = process.env.DISABLE_TEST_SWC ? [] : [swc({sourceMaps: true, swc: {jsc: {target: `es5`}}})];

const builds = [
  {
    input: `tests/browser/client/loaders/snippet.js`,
    output: [
      {
        file: `build/test/browser/snippet-test.js`,
        format: `iife`,
        name: `browserTests`,
        sourcemap: true,
      },
    ],
    plugins: [nodeResolve({browser: true}), ...COMMON_PLUGINS],
  },
];

if (process.env.FULL) {
  builds.push({
    input: `tests/browser/client/loaders/module-cjs.js`,
    output: [
      {
        file: `build/test/browser/module-cjs-test.js`,
        format: `iife`,
        name: `browserTests`,
        sourcemap: true,
      },
    ],
    plugins: [...COMMON_PLUGINS, commonjs()],
  });
}

export default builds;
