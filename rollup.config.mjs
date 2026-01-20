import alias from '@rollup/plugin-alias';
import closureCompiler from '@ampproject/rollup-plugin-closure-compiler';
import fs from 'fs';
import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import nodeResolve from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import browserTestBuilds from './tests/browser/client/rollup.config.mjs';

const COMPILED_RRWEB_PATH = `build/rrweb-compiled.js`;
const BUNDLED_RRWEB_PATH = `build/rrweb-bundled.js`;

// Delete output files at build start so build errors don't silently use stale files
const cleanOnRebuild = () => {
  let outputFiles = [];
  return {
    name: `clean-on-rebuild`,
    options(opts) {
      const outputs = Array.isArray(opts.output) ? opts.output : [opts.output];
      outputFiles = outputs.map(o => o && o.file).filter(Boolean);
    },
    buildStart() {
      // Delete outputs right before this specific build runs
      for (const file of outputFiles) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }
    }
  };
};

const withCleanOnRebuild = (builds) => builds.map(build => ({
  ...build,
  plugins: [cleanOnRebuild(), ...(build.plugins || [])]
}));

const aliasRrweb = () => alias({
  entries: [
    { find: /rrweb-entrypoint(?:\.js)?$/, replacement: COMPILED_RRWEB_PATH },
  ]
});

const copyTypes = () => ({
  name: `copy-types`,
  generateBundle(_options, bundle) {
    try {
      for (const builtFileName of Object.keys(bundle)) {
        const buildDir = `build`;
        const types = fs.readFileSync(`src/index.d.ts`, `utf8`);
        const builtFile = path.basename(builtFileName, path.extname(builtFileName)) + `.d.ts`;
        fs.writeFileSync(path.join(buildDir, builtFile), types);
      }

    } catch (err) {
      console.warn(`Could not copy type files:`, err.message);
      throw err;
    }
  }
});

const COMMON_CLOSURE_FLAGS = {
  compilation_level: `ADVANCED_OPTIMIZATIONS`,
  language_in: `ECMASCRIPT5`,
  externs: [`src/externs.js`],
  create_source_map: true,
};

const MINIFY = process.env.MINIFY || process.env.FULL;

// Main builds used to develop / iterate quickly
const MAIN_BUILDS = [
  {
    'input': `src/recorder/rrweb-entrypoint.js`,
    'output': [
      {
        file: BUNDLED_RRWEB_PATH,
        format: `es`,
      }
    ],
    plugins: [nodeResolve({browser: true})]
  },
  {
    'input': BUNDLED_RRWEB_PATH,
    'output': [
      {
        file: COMPILED_RRWEB_PATH,
        format: `es`,
      }
    ],
    plugins: [swc({swc: {jsc: {target: `es5`}}})]
  },

  // IIFE recorder bundle that is loaded asynchronously
  // rrweb uses esbuild to minify, so do that here as well
  {
    input: `src/recorder/index.js`,
    output: [
      {
        file: `build/mixpanel-recorder.js`,
        name: `mixpanel_recorder`,
        format: `iife`,
      },
      ...(MINIFY
        ? [
          {
            file: `build/mixpanel-recorder.min.js`,
            name: `mixpanel_recorder`,
            format: `iife`,
            plugins: [esbuild({target: `es5`, minify: true, sourceMap: true})],
            sourcemap: true,
          },
        ]
        : []),
    ],
    plugins: [aliasRrweb()],
  },

  // IIFE main mixpanel build
  {
    input: `src/loaders/loader-globals.js`,
    output: [
      {
        file: `build/mixpanel.globals.js`,
        name: `mixpanel`,
        format: `iife`,
      },
      ...(MINIFY
        ? [
          {
            file: `build/mixpanel.min.js`,
            format: `iife`,
            plugins: [closureCompiler(COMMON_CLOSURE_FLAGS)],
          },
        ]
        : []),
    ],
    plugins: [
      nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
      })
    ]
  },
];

const ALL_BUILDS = [
  ...MAIN_BUILDS,
  // Minified snippets for loading mixpanel
  {
    input: `src/loaders/mixpanel-jslib-snippet.js`,
    output: [
      {
        file: `build/mixpanel-jslib-snippet.min.js`,
        plugins: [closureCompiler(COMMON_CLOSURE_FLAGS)]
      },
      {
        file: `build/mixpanel-jslib-snippet.min.test.js`,
        plugins: [closureCompiler({...COMMON_CLOSURE_FLAGS, define: `MIXPANEL_LIB_URL="../build/mixpanel.min.js"`})],
      }
    ],
  },

  // IIFE mixpanel snippet loader
  {
    input: `src/loaders/mixpanel-js-wrapper.js`,
    output: [
      {
        file: `build/mixpanel-js-wrapper.js`,
      },
      {
        file: `build/mixpanel-js-wrapper.min.js`,
        plugins: [closureCompiler(COMMON_CLOSURE_FLAGS)],
      }
    ],
  },

  // IIFE mixpanel core with bundled recorder
  {
    input: `src/loaders/loader-globals-with-recorder.js`,
    output: [
      {
        file: `build/mixpanel-with-recorder.js`,
        name: `mixpanel`,
        format: `iife`,
      },
      {
        file: `build/mixpanel-with-recorder.min.js`,
        name: `mixpanel`,
        format: `iife`,
        plugins: [esbuild({target: `es5`, minify: true, sourceMap: true})],
      },
    ],
    plugins: [
      aliasRrweb(),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
      }),
      copyTypes(),
    ],
  },


  // Modules builds that are bundled with the recorder
  {
    input: `src/loaders/loader-module.js`,
    output: [
      {
        file: `build/mixpanel.cjs.js`,
        name: `mixpanel`,
        format: `cjs`,
      },
      {
        file: `build/mixpanel.amd.js`,
        name: `mixpanel`,
        format: `amd`,
      },
      {
        file: `build/mixpanel.umd.js`,
        name: `mixpanel`,
        format: `umd`,
      },
      {
        file: `build/mixpanel.module.js`,
        name: `mixpanel`,
        format: `es`,
      },
    ],
    plugins: [
      aliasRrweb(),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
      }),
      copyTypes(),
    ],
  },


  // Alternative CJS builds without recorder
  {
    input: `src/loaders/loader-module-core.js`,
    output: [
      {
        file: `build/mixpanel-core.cjs.js`,
        name: `mixpanel`,
        format: `cjs`,
      },
    ],
    plugins: [
      aliasRrweb(),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
      }),
      copyTypes(),
    ],
  },
  {
    input: `src/loaders/loader-module-with-async-recorder.js`,
    output: [
      {
        file: `build/mixpanel-with-async-recorder.cjs.js`,
        name: `mixpanel`,
        format: `cjs`,
      },
    ],
    plugins: [
      aliasRrweb(),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
      }),
      copyTypes(),
    ],
  },

  ...browserTestBuilds,
];

const builds = process.env.FULL ? ALL_BUILDS : MAIN_BUILDS;
export default withCleanOnRebuild(builds);
