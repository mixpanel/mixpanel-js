import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
    plugins: [commonjs(), nodeResolve({browser: true})],
  },
  {
    input: `tests/browser/client/cross-origin-page.js`,
    output: [
      {
        file: `build/test/browser/cross-origin-page.js`,
        format: `iife`,
        name: `crossOriginPage`,
        sourcemap: true,
      },
    ],
    plugins: [commonjs()],
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
    plugins: [commonjs()],
  });
}

export default builds;
