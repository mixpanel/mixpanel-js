// Measures how much each npm entrypoint adds to an app bundle.
//
// Bundles a tiny app (init + track) against the built files in dist/ the way a
// consumer's bundler would, minifies it, and prints raw and gzipped sizes.
//
// Usage: npm run build-dist (or FULL=1 ./build.sh, then copy build/ to dist/), then
//   npm run bundle-size
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { minify } from 'rollup-plugin-esbuild';
import { rollup } from 'rollup';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), `..`);
const APP_ID = `\0bundle-size-app`;

const ENTRYPOINTS = [
  `mixpanel-browser`,
  `mixpanel-browser/async-modules`,
  `mixpanel-browser/core`,
];

const virtualApp = (entry) => ({
  name: `bundle-size-app`,
  resolveId: (id) => (id === APP_ID ? id : null),
  load: (id) => (id === APP_ID
    ? `import mixpanel from '${entry}';\nmixpanel.init('TOKEN');\nmixpanel.track('event');\n`
    : null),
});

async function measure(entry) {
  const bundle = await rollup({
    input: APP_ID,
    onwarn: () => {},
    plugins: [
      virtualApp(entry),
      alias({entries: [{find: /^mixpanel-browser(?=\/|$)/, replacement: ROOT}]}),
      nodeResolve({browser: true}),
      commonjs(),
    ],
  });
  const {output} = await bundle.generate({format: `es`, plugins: [minify()]});
  await bundle.close();
  const code = output[0].code;
  return {
    entry,
    min: Buffer.byteLength(code),
    gzip: zlib.gzipSync(code, {level: 9}).length,
  };
}

const kb = (n) => (n / 1024).toFixed(1) + ` KiB`;
const results = [];
for (const entry of ENTRYPOINTS) {
  results.push(await measure(entry));
}
const base = results[0];
console.log(`| import | minified | gzipped | vs. default (gzipped) |`);
console.log(`| --- | --- | --- | --- |`);
for (const r of results) {
  const change = r === base ? `` : `-` + (100 * (1 - r.gzip / base.gzip)).toFixed(0) + `%`;
  console.log(`| \`${r.entry}\` | ${kb(r.min)} | ${kb(r.gzip)} | ${change} |`);
}
