import swc from '@rollup/plugin-swc';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const builds =[
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
    plugins: [nodeResolve({browser: true}), swc({swc: {jsc: {target: `es5`}}})],
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
    plugins: [swc({swc: {jsc: {target: `es5`}}}), commonjs()],
  });
}

export default builds;
