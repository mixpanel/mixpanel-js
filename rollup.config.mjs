import alias from '@rollup/plugin-alias';
import closureCompiler from '@ampproject/rollup-plugin-closure-compiler';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';
import path from 'path';
import esbuild from 'rollup-plugin-esbuild';
import nodeResolve from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';
import browserTestBuilds from './tests/browser/client/rollup.config.mjs';

// Capture the hash of async-loaded bundles so we can inject the correct filenames into the main build
const asyncBundleManifest = {};

const COMPILED_RRWEB_PATH = `build/rrweb-compiled.js`;
const BUNDLED_RRWEB_PATH = `build/rrweb-bundled.js`;

const ASYNC_MODULE_BUILD_PATH = `build/async-modules`;
const RECORDER_BUNDLE_NAME = `mixpanel_recorder`;
const RECORDER_MIN_BUNDLE_NAME = `mixpanel_recorder_min`;
const TARGETING_BUNDLE_NAME = `mixpanel_targeting`;
const TARGETING_MIN_BUNDLE_NAME = `mixpanel_targeting_min`;


// Delete output files at build start so build errors don't silently use stale files
let hasCleanedOnFull = false;
const cleanOnRebuild = () => {
  let filesToClean = [];
  return {
    name: `clean-on-rebuild`,
    options(opts) {
      const outputs = Array.isArray(opts.output) ? opts.output : [opts.output];
      filesToClean = outputs.flatMap(o => {
        if (o.file) {
          return [o.file];
        }

        if (o.dir && o.entryFileNames) {
          if (!fs.existsSync(o.dir)) return [];

          // match against regexes like mixpanel-recorder-[hash].js to find the actual output file(s) to clean up
          const regex = new RegExp(`^` + o.entryFileNames.replace(/\./g, `\\.`).replace(`[hash]`, `.+`));
          return fs.readdirSync(o.dir).filter(f => regex.test(f)).map(f => path.join(o.dir, f));
        }
        return [];
      });
    },
    buildStart() {
      if (process.env.FULL && !hasCleanedOnFull) {
        if (fs.existsSync(`build`)) {
          fs.rmSync(`build`, {recursive: true});
        }
        hasCleanedOnFull = true;
        return;
      }

      for (const file of filesToClean) {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      }
    }
  };
};

// Capture the resolved (hashed) output filenames from recorder/targeting builds.
// Stores them in `asyncBundleManifest` so `injectAsyncBundleNames` can inject them into the main build.
const writeToManifest = () => ({
  name: `write-to-manifest`,
  generateBundle(options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === `chunk`) {
        asyncBundleManifest[options.name] = chunk.fileName;
      }
    }
  }
});

// Replace __MP_*__ placeholders in src/config.js with build-time values.
// For the main library build (which runs after), they will be the real hashed filenames.
const injectAsyncBundleNames = () => ({
  name: `inject-async-bundle-names`,
  renderChunk(code, _chunk, outputOptions) {
    const isMinified = outputOptions.file && outputOptions.file.endsWith(`.min.js`);

    let recorderBundleName = RECORDER_BUNDLE_NAME;
    let targetingBundleName = TARGETING_BUNDLE_NAME;
    if (isMinified) {
      recorderBundleName = RECORDER_MIN_BUNDLE_NAME;
      targetingBundleName = TARGETING_MIN_BUNDLE_NAME;
    }

    if (!asyncBundleManifest[recorderBundleName] || !asyncBundleManifest[targetingBundleName]) {
      throw new Error(`Async bundle names not found in manifest. Manifest contents: ${JSON.stringify(asyncBundleManifest)}`);
    }

    const replaced = code
      .replace(`__MP_RECORDER_FILENAME__`, asyncBundleManifest[recorderBundleName])
      .replace(`__MP_TARGETING_FILENAME__`, asyncBundleManifest[targetingBundleName]);
    return { code: replaced, map: null };
  }
});

const withBasePlugins = (builds) => builds.map((build) => {
  return {
    ...build,
    plugins: [
      cleanOnRebuild(),
      ...(build.plugins || [])
    ]
  };
});

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

/**
 * Async bundles for the recorder and targeting modules.
 *
 * These are loaded on-demand by the main library at runtime via script injection.
 * Filenames include a content hash so the main build can reference an exact, immutable
 * bundle — guaranteeing the async module matches what the library expects.
 * The hash is captured in `asyncBundleManifest` and injected into the main build
 * via `injectAsyncBundleNames`.
 *
 * We also produce non-hashed "legacy" versions of each bundle for backward compatibility
 * with customers who proxy specific filenames from the Mixpanel CDN.
 */
const ASYNC_BUNDLE_BUILDS = [
  // Recorder bundle (wraps rrweb)
  {
    input: `src/recorder/index.js`,
    output: [
      {
        dir: ASYNC_MODULE_BUILD_PATH,
        entryFileNames: `mixpanel-recorder-[hash].js`,
        name: RECORDER_BUNDLE_NAME,
        format: `iife`,
      },
      {
        file: `build/mixpanel-recorder.js`,
        name: `legacy_recorder_bundle`,
        format: `iife`,
      },
      ...(MINIFY
        ? [
          {
            dir: ASYNC_MODULE_BUILD_PATH,
            entryFileNames: `mixpanel-recorder-[hash].min.js`,
            name: RECORDER_MIN_BUNDLE_NAME,
            format: `iife`,
            plugins: [esbuild({target: `es5`, minify: true, sourceMap: true})],
            sourcemap: true,
          },
          {
            file: `build/mixpanel-recorder.min.js`,
            name: `legacy_recorder_min_bundle`,
            format: `iife`,
            plugins: [esbuild({target: `es5`, minify: true, sourceMap: true})],
            sourcemap: true,
          },
        ]
        : []),
    ],
    plugins: [aliasRrweb(), writeToManifest()],
  },

  // Targeting bundle (feature flags / experiments)
  {
    input: `src/targeting/index.js`,
    output: [
      {
        dir: ASYNC_MODULE_BUILD_PATH,
        entryFileNames: `mixpanel-targeting-[hash].js`,
        name: TARGETING_BUNDLE_NAME,
        format: `iife`,
      },
      {
        file: `build/mixpanel-targeting.js`,
        name: `legacy_targeting_bundle`,
        format: `iife`,
      },
      ...(MINIFY
        ? [
          {
            dir: ASYNC_MODULE_BUILD_PATH,
            entryFileNames: `mixpanel-targeting-[hash].min.js`,
            name: TARGETING_MIN_BUNDLE_NAME,
            format: `iife`,
            plugins: [esbuild({target: `es5`, minify: true, sourceMap: true})],
            sourcemap: true,
          },
          {
            file: `build/mixpanel-targeting.min.js`,
            name: `legacy_targeting_min_bundle`,
            format: `iife`,
            plugins: [esbuild({target: `es5`, minify: true, sourceMap: true})],
            sourcemap: true,
          },
        ]
        : []),
    ],
    plugins: [commonjs(), nodeResolve({browser: true}), writeToManifest()],
  },
];

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

  ...ASYNC_BUNDLE_BUILDS,

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
      injectAsyncBundleNames(),
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

  // Modules builds that are bundled with the recorder and targeting
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
      commonjs(),
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
    input: `src/loaders/loader-module-with-async-modules.js`,
    output: [
      {
        file: `build/mixpanel-with-async-modules.cjs.js`,
        name: `mixpanel`,
        format: `cjs`,
      },
      // Backward compatibility: keep old output filename for existing users
      {
        file: `build/mixpanel-with-async-recorder.cjs.js`,
        name: `mixpanel`,
        format: `cjs`,
      },
    ],
    plugins: [
      injectAsyncBundleNames(),
      aliasRrweb(),
      nodeResolve({
        browser: true,
        main: true,
        jsnext: true,
      }),
      copyTypes(),
    ],
  },
];

const srcBuilds = process.env.FULL ? ALL_BUILDS : MAIN_BUILDS;
const builds = [...srcBuilds, ...browserTestBuilds];

export default withBasePlugins(builds);
